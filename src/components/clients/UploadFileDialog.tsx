import { useState, useRef } from 'react';
import { Client } from '@/types/client-portal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Upload, FileText, X, CheckCircle } from '@/components/ui/icons';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { authedInvoke } from '@/integrations/supabase/authedInvoke';

interface UploadFileDialogProps {
  client: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileUploaded: () => void;
}

export function UploadFileDialog({ client, open, onOpenChange, onFileUploaded }: UploadFileDialogProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState('');

  const sanitizeFilename = (name: string): string => {
    const trimmed = String(name || '').trim();
    const withoutSlashes = trimmed.replace(/[\\/]/g, '-');
    const collapsed = withoutSlashes.replace(/\s+/g, ' ').trim();
    return collapsed.slice(0, 180) || 'file';
  };

  const describeInvokeError = async (err: any) => {
    const raw = String(err?.message || err?.details || err?.hint || '').trim();
    const ctx = (err as any)?.context as Response | undefined;
    if (ctx) {
      try {
        const payload = await ctx.clone().json();
        const top = String((payload as any)?.error || (payload as any)?.message || '').trim();
        if (top) return top;
      } catch {
        // ignore
      }
      try {
        const text = String(await ctx.clone().text()).trim();
        if (text) return text;
      } catch {
        // ignore
      }
    }
    return raw || 'Unknown error';
  };

  // No file type restrictions - allow any file type

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 50MB limit (Supabase default max is 50MB per file)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File must be under 50MB');
      return;
    }

    setSelectedFile(file);
    setCustomName(file.name);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);

    try {
      // Prefer direct uploads (faster, fewer moving parts) when storage RLS supports workspace paths.
      // Fallback to signed upload URLs if direct upload is blocked by RLS in some deployments.
      const directPath = `${client.workspaceId}/${client.id}/${crypto.randomUUID()}-${sanitizeFilename(selectedFile.name)}`;
      let storagePath = directPath;

      const direct = await supabase.storage.from('uploads').upload(directPath, selectedFile, {
        upsert: false,
        contentType: selectedFile.type || undefined,
      });

      if (direct.error) {
        const directMsg = String(
          direct.error?.message || direct.error?.error || direct.error?.details || ''
        ).toLowerCase();
        const looksBlocked =
          directMsg.includes('row-level security') ||
          directMsg.includes('permission') ||
          directMsg.includes('not authorized') ||
          directMsg.includes('unauthorized') ||
          directMsg.includes('forbidden');

        if (!looksBlocked) {
          throw new Error(`Upload failed: ${String(direct.error?.message || '').trim() || 'Unknown storage error'}`);
        }

        const { data: signed, error: signedError } = await authedInvoke<any>('client-file-upload-url', {
          body: {
            workspaceId: client.workspaceId,
            clientId: client.id,
            filename: selectedFile.name,
          },
        });
        if (signedError) {
          throw new Error(`Upload URL failed: ${await describeInvokeError(signedError)}`);
        }
        if (!signed?.path || !signed?.token) throw new Error('Failed to create upload URL');

        storagePath = String(signed.path);
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .uploadToSignedUrl(storagePath, signed.token, selectedFile);
        if (uploadError) {
          const msg = String(uploadError?.message || uploadError?.error || uploadError?.details || '').trim();
          throw new Error(`Upload failed: ${msg || 'Unknown storage error'}`);
        }
      }

      // Get the file type category
      const mimeType = selectedFile.type;
      let fileType = 'document';
      if (mimeType.startsWith('image/')) fileType = 'image';
      else if (mimeType.startsWith('video/')) fileType = 'video';
      else if (mimeType.startsWith('audio/')) fileType = 'audio';
      else if (mimeType.includes('pdf')) fileType = 'pdf';
      else if (mimeType.includes('spreadsheet') || mimeType.includes('csv') || mimeType.includes('excel')) fileType = 'spreadsheet';

      // Create client_files record
      const { error: dbError } = await supabase.from('client_files').insert({
        id: crypto.randomUUID(),
        client_id: client.id,
        workspace_id: client.workspaceId,
        uploaded_by: user.id,
        filename: customName || selectedFile.name,
        file_url: storagePath,
        file_type: fileType,
        mime_type: mimeType,
        size_bytes: selectedFile.size,
        is_video: mimeType.startsWith('video/'),
      });

      if (dbError) {
        const msg = String(dbError?.message || dbError?.details || dbError?.hint || '').trim();
        throw new Error(`Saving file failed: ${msg || 'Database error'}`);
      }

      toast.success('File uploaded!');
      handleClose();
      onFileUploaded();
    } catch (err) {
      console.error('Error uploading file:', err);
      toast.error(String((err as any)?.message || '').trim() || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setCustomName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onOpenChange(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload File for {client.name}
          </DialogTitle>
          <DialogDescription>
            This file will be visible in {client.name}'s portal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!selectedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-border rounded-3xl p-8 text-center cursor-pointer hover:border-border transition-colors"
            >
              <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-1">
                Click to select a file
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, PDF, CSV, XLSX • Max 20MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.pdf,.csv,.xlsx"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="border border-border rounded-3xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedFile(null);
                    setCustomName('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="fileName">Display Name</Label>
                <input
                  id="fileName"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="File name shown to client"
                  className="w-full px-4 py-2.5 bg-[#151618] border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border transition-colors"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} className="rounded-2xl">
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isUploading || !selectedFile}
            className="bg-white text-black hover:bg-white/90 font-semibold border-0 shadow-none rounded-2xl"
          >
            {isUploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
