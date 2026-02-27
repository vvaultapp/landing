import { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  Folder, 
  FileText, 
  Image, 
  Video, 
  FileSpreadsheet, 
  File, 
  Upload, 
  FolderPlus, 
  Download, 
  Trash2, 
  X, 
  ChevronRight,
  GripVertical
} from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  fileType?: string;
  mimeType?: string;
  sizeBytes?: number;
  storagePath?: string;
  parentFolderId: string | null;
  createdAt: Date;
  position: number;
}

export default function Files() {
  const { workspace } = useWorkspace();
  const { user } = useAuth();
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{ id: string | null; name: string }[]>([{ id: null, name: 'My Files' }]);
  
  // Storage usage state
  const [storageUsed, setStorageUsed] = useState<number>(0);
  const [storageLimit] = useState<number>(1024 * 1024 * 1024); // 1GB free tier
  
  // Upload state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(null);
  const [customName, setCustomName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // New folder state
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  
  // Delete state
  const [deleteItem, setDeleteItem] = useState<FileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Drag state
  const [draggedItem, setDraggedItem] = useState<FileItem | null>(null);
  const [dragOverItem, setDragOverItem] = useState<FileItem | null>(null);
  
  // No file type restrictions - allow any file type

  // Fetch storage usage
  const fetchStorageUsage = useCallback(async () => {
    if (!workspace) return;
    
    try {
      const { data, error } = await supabase
        .from('files')
        .select('size_bytes')
        .eq('workspace_id', workspace.id);
      
      if (error) throw error;
      
      const totalBytes = data?.reduce((sum, file) => sum + (file.size_bytes || 0), 0) || 0;
      setStorageUsed(totalBytes);
    } catch (err) {
      console.error('Error fetching storage usage:', err);
    }
  }, [workspace]);

  const fetchItems = useCallback(async () => {
    if (!workspace) return;

    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('file_type', { ascending: true })
        .order('original_name', { ascending: true });

      if (error) throw error;

      // Map to FileItem format - files table doesn't have folders yet
      // For now, all files are at root level
      const mappedItems: FileItem[] = (data || []).map((row, index) => ({
        id: row.id,
        name: row.original_name || 'Unnamed File',
        type: 'file' as const,
        fileType: row.file_type,
        mimeType: row.mime_type,
        sizeBytes: row.size_bytes,
        storagePath: row.storage_path,
        parentFolderId: null,
        createdAt: new Date(row.created_at),
        position: index,
      }));

      setItems(mappedItems);
    } catch (err) {
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  }, [workspace]);

  useEffect(() => {
    fetchItems();
    fetchStorageUsage();
  }, [fetchItems, fetchStorageUsage]);

  const currentItems = items.filter(item => item.parentFolderId === currentFolderId);

  const getFileIcon = (item: FileItem) => {
    if (item.type === 'folder') {
      return <Folder className="w-5 h-5 text-yellow-500" />;
    }
    switch (item.fileType) {
      case 'image':
        return <Image className="w-5 h-5 text-muted-foreground" />;
      case 'video':
        return <Video className="w-5 h-5 text-muted-foreground" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="w-5 h-5 text-muted-foreground" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-muted-foreground" />;
      default:
        return <File className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const handleFolderClick = (folder: FileItem) => {
    setCurrentFolderId(folder.id);
    setFolderPath([...folderPath, { id: folder.id, name: folder.name }]);
  };

  const navigateToFolder = (index: number) => {
    const newPath = folderPath.slice(0, index + 1);
    setFolderPath(newPath);
    setCurrentFolderId(newPath[newPath.length - 1].id);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // No file type restrictions - allow any file

    // 50MB limit
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File must be under 50MB');
      return;
    }

    setSelectedFile(file);
    setCustomName(file.name);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user || !workspace) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);

    try {
      const timestamp = Date.now();
      const storagePath = `${workspace.id}/files/${timestamp}-${selectedFile.name}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(storagePath, selectedFile);

      if (uploadError) throw uploadError;

      const mimeType = selectedFile.type;
      let fileType = 'document';
      if (mimeType.startsWith('image/')) fileType = 'image';
      else if (mimeType.startsWith('video/')) fileType = 'video';
      else if (mimeType.includes('pdf')) fileType = 'pdf';
      else if (mimeType.includes('spreadsheet') || mimeType.includes('csv') || mimeType.includes('excel')) fileType = 'spreadsheet';

      const { error: dbError } = await supabase.from('files').insert({
        workspace_id: workspace.id,
        uploaded_by: user.id,
        original_name: customName || selectedFile.name,
        storage_path: storagePath,
        file_type: fileType,
        mime_type: mimeType,
        size_bytes: selectedFile.size,
      });

      if (dbError) throw dbError;

      toast.success('File uploaded!');
      handleCloseUpload();
      fetchItems();
      fetchStorageUsage();
    } catch (err) {
      console.error('Error uploading file:', err);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseUpload = () => {
    setSelectedFile(null);
    setCustomName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploadOpen(false);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !workspace) return;

    setIsCreatingFolder(true);
    try {
      // For now, we'll create a virtual folder by using a naming convention
      // In a real implementation, you'd have a folders table
      const newFolder: FileItem = {
        id: `folder-${Date.now()}`,
        name: newFolderName.trim(),
        type: 'folder',
        parentFolderId: currentFolderId,
        createdAt: new Date(),
        position: currentItems.length,
      };
      
      setItems([...items, newFolder]);
      toast.success('Folder created!');
      setFolderDialogOpen(false);
      setNewFolderName('');
    } catch (err) {
      console.error('Error creating folder:', err);
      toast.error('Failed to create folder');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleDownload = async (item: FileItem) => {
    if (item.type === 'folder' || !item.storagePath) return;

    try {
      const { data, error } = await supabase.storage
        .from('uploads')
        .download(item.storagePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download file');
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    setIsDeleting(true);
    try {
      if (deleteItem.type === 'file' && deleteItem.storagePath) {
        await supabase.storage.from('uploads').remove([deleteItem.storagePath]);
        
        const { error } = await supabase
          .from('files')
          .delete()
          .eq('id', deleteItem.id);

        if (error) throw error;
      }
      
      setItems(items.filter(i => i.id !== deleteItem.id));
      setStorageUsed(prev => prev - (deleteItem.sizeBytes || 0));
      toast.success(`${deleteItem.type === 'folder' ? 'Folder' : 'File'} deleted`);
      setDeleteItem(null);
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, item: FileItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, item: FileItem) => {
    e.preventDefault();
    if (draggedItem && draggedItem.id !== item.id) {
      setDragOverItem(item);
    }
  };

  const handleDragEnd = () => {
    if (draggedItem && dragOverItem) {
      const newItems = [...items];
      const draggedIndex = newItems.findIndex(i => i.id === draggedItem.id);
      const dropIndex = newItems.findIndex(i => i.id === dragOverItem.id);
      
      // If dropping on a folder, move into folder
      if (dragOverItem.type === 'folder') {
        newItems[draggedIndex] = { ...newItems[draggedIndex], parentFolderId: dragOverItem.id };
      } else {
        // Reorder
        const [removed] = newItems.splice(draggedIndex, 1);
        newItems.splice(dropIndex, 0, removed);
        // Update positions
        newItems.forEach((item, idx) => {
          item.position = idx;
        });
      }
      
      setItems(newItems);
    }
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const storagePercentage = Math.min((storageUsed / storageLimit) * 100, 100);

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[36px] font-bold">Files</h1>
            <p className="text-sm text-white/45 mt-1 mb-3">Upload and organize assets for your workspace</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              {folderPath.map((folder, index) => (
                <div key={folder.id || 'root'} className="flex items-center gap-1">
                  {index > 0 && <ChevronRight className="w-4 h-4" />}
                  <button
                    onClick={() => navigateToFolder(index)}
                    className="hover:text-foreground transition-colors"
                  >
                    {folder.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Storage Usage Indicator */}
            <div className="flex items-center gap-3 px-4 py-2 bg-sidebar rounded-xl border border-sidebar-border">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Storage</span>
                <span className="text-sm font-medium">{formatFileSize(storageUsed)} / 1 GB</span>
              </div>
              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${storagePercentage}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setFolderDialogOpen(true)}
              className="rounded-xl"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              New Folder
            </Button>
            <Button
              onClick={() => setUploadOpen(true)}
              className="bg-white text-black hover:bg-white/90 font-semibold border-0 shadow-none rounded-xl"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="border border-border rounded-xl p-4 bg-[#151618]">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-4 rounded bg-white/[0.06]" />
                  <Skeleton className="h-10 w-10 rounded-lg bg-white/[0.06]" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-52 rounded-xl bg-white/[0.10]" />
                    <Skeleton className="h-3 w-72 rounded-xl bg-white/[0.06] mt-2" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-xl bg-white/[0.06]" />
                </div>
              </div>
            ))}
          </div>
        ) : currentItems.length === 0 ? (
          <div className="border border-border rounded-xl p-12 text-center bg-[#151618]">
            <Folder className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">This folder is empty</p>
            <p className="text-sm text-muted-foreground">
              Upload files or create folders to organize your content
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {currentItems.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                onDragOver={(e) => handleDragOver(e, item)}
                onDragEnd={handleDragEnd}
                className={`border border-border rounded-xl p-4 bg-[#151618] hover:bg-[#1a1d20] transition-colors cursor-move ${
                  dragOverItem?.id === item.id ? 'border-primary' : ''
                } ${draggedItem?.id === item.id ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                  <div 
                    className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 cursor-pointer"
                    onClick={() => item.type === 'folder' ? handleFolderClick(item) : handleDownload(item)}
                  >
                    {getFileIcon(item)}
                  </div>
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => item.type === 'folder' ? handleFolderClick(item) : handleDownload(item)}
                  >
                    <h4 className="font-medium truncate">{item.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {item.type === 'folder' ? (
                        <span>Folder</span>
                      ) : (
                        <>
                          <span className="capitalize">{item.fileType}</span>
                          <span>•</span>
                          <span>{formatFileSize(item.sizeBytes)}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{format(item.createdAt, 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.type === 'file' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(item)}
                        className="h-8 w-8"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteItem(item)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={handleCloseUpload}>
        <DialogContent className="bg-card border-border rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload File
            </DialogTitle>
            <DialogDescription>
              Upload a file to your workspace
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
                  Max 50MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
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
                    placeholder="File name"
                    className="w-full px-4 py-2.5 bg-[#151618] border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseUpload} className="rounded-2xl">
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

      {/* New Folder Dialog */}
      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogContent className="bg-card border-border rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="w-5 h-5" />
              Create Folder
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                className="h-9"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFolderDialogOpen(false)} className="rounded-2xl">
              Cancel
            </Button>
            <Button
              onClick={handleCreateFolder}
              disabled={isCreatingFolder || !newFolderName.trim()}
              className="bg-white text-black hover:bg-white/90 font-semibold border-0 shadow-none rounded-2xl"
            >
              {isCreatingFolder ? 'Creating...' : 'Create Folder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent className="bg-card border-border rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteItem?.type}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteItem?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
