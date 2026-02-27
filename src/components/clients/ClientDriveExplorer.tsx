import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { authedInvoke } from '@/integrations/supabase/authedInvoke';
import {
  ChevronRight,
  Download,
  File,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderPlus,
  Image,
  Search,
  Trash2,
  Upload,
  Video,
} from '@/components/ui/icons';
import { Client, ClientFile, ClientFolder, mapDbRowToClientFolder, mapDbRowToFile } from '@/types/client-portal';

type DragPayload =
  | { type: 'folder'; id: string }
  | { type: 'file'; id: string };

interface ClientDriveExplorerProps {
  client: Client;
}

function getFileIcon(fileType: string) {
  switch (fileType) {
    case 'image':
      return <Image className="w-4 h-4 text-muted-foreground" />;
    case 'video':
      return <Video className="w-4 h-4 text-muted-foreground" />;
    case 'spreadsheet':
      return <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />;
    case 'pdf':
      return <FileText className="w-4 h-4 text-muted-foreground" />;
    default:
      return <File className="w-4 h-4 text-muted-foreground" />;
  }
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ClientDriveExplorer({ client }: ClientDriveExplorerProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [folders, setFolders] = useState<ClientFolder[]>([]);
  const [files, setFiles] = useState<ClientFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingFileName, setEditingFileName] = useState('');
  const [dragPayload, setDragPayload] = useState<DragPayload | null>(null);
  const [dropTargetFolderId, setDropTargetFolderId] = useState<string | null>(null);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const fetchDriveData = useCallback(async () => {
    try {
      setLoading(true);
      const [{ data: folderRows, error: folderError }, { data: fileRows, error: fileError }] = await Promise.all([
        supabase
          .from('client_folders')
          .select('*')
          .eq('client_id', client.id)
          .order('name', { ascending: true }),
        supabase
          .from('client_files')
          .select('*')
          .eq('client_id', client.id)
          .order('created_at', { ascending: false }),
      ]);

      if (folderError) throw folderError;
      if (fileError) throw fileError;

      setFolders((folderRows || []).map(mapDbRowToClientFolder));
      setFiles((fileRows || []).map(mapDbRowToFile));
    } catch (err) {
      console.error('Error loading drive data:', err);
      toast.error('Failed to load drive');
    } finally {
      setLoading(false);
    }
  }, [client.id]);

  useEffect(() => {
    void fetchDriveData();
  }, [fetchDriveData]);

  useEffect(() => {
    const refetch = () => {
      if (document.visibilityState === 'visible') {
        void fetchDriveData();
      }
    };
    const onOnline = () => void fetchDriveData();
    document.addEventListener('visibilitychange', refetch);
    window.addEventListener('online', onOnline);
    return () => {
      document.removeEventListener('visibilitychange', refetch);
      window.removeEventListener('online', onOnline);
    };
  }, [fetchDriveData]);

  useEffect(() => {
    const channel = supabase
      .channel(`client-drive-${client.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'client_folders', filter: `client_id=eq.${client.id}` },
        () => {
          void fetchDriveData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'client_files', filter: `client_id=eq.${client.id}` },
        () => {
          void fetchDriveData();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [client.id, fetchDriveData]);

  const folderById = useMemo(
    () => new Map(folders.map((folder) => [folder.id, folder])),
    [folders]
  );

  const childFoldersByParent = useMemo(() => {
    const map = new Map<string, ClientFolder[]>();
    for (const folder of folders) {
      const parentKey = folder.parentFolderId || '__root__';
      const current = map.get(parentKey) || [];
      current.push(folder);
      map.set(parentKey, current);
    }
    for (const [key, value] of map.entries()) {
      value.sort((a, b) => a.name.localeCompare(b.name));
      map.set(key, value);
    }
    return map;
  }, [folders]);

  const getFolderPath = useCallback(
    (folderId: string | null) => {
      if (!folderId) return [] as ClientFolder[];
      const path: ClientFolder[] = [];
      let cursor: string | null = folderId;
      while (cursor) {
        const folder = folderById.get(cursor);
        if (!folder) break;
        path.unshift(folder);
        cursor = folder.parentFolderId;
      }
      return path;
    },
    [folderById]
  );

  const breadcrumb = useMemo(() => getFolderPath(currentFolderId), [currentFolderId, getFolderPath]);

  const folderDescendantCheck = useCallback(
    (folderId: string, destinationFolderId: string | null) => {
      let cursor = destinationFolderId;
      while (cursor) {
        if (cursor === folderId) return true;
        cursor = folderById.get(cursor)?.parentFolderId || null;
      }
      return false;
    },
    [folderById]
  );

  const isSearching = searchQuery.trim().length > 0;
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const visibleFolders = useMemo(() => {
    if (isSearching) {
      return folders.filter((folder) => folder.name.toLowerCase().includes(normalizedSearch));
    }
    return childFoldersByParent.get(currentFolderId || '__root__') || [];
  }, [isSearching, folders, normalizedSearch, childFoldersByParent, currentFolderId]);

  const visibleFiles = useMemo(() => {
    if (isSearching) {
      return files.filter((file) => file.filename.toLowerCase().includes(normalizedSearch));
    }
    return files.filter((file) => (file.folderId || null) === currentFolderId);
  }, [isSearching, files, normalizedSearch, currentFolderId]);

  const createFolder = async () => {
    const name = newFolderName.trim();
    if (!name || !user) return;

    try {
      const { error } = await supabase.from('client_folders').insert({
        client_id: client.id,
        workspace_id: client.workspaceId,
        parent_folder_id: currentFolderId,
        name,
        created_by: user.id,
      });

      if (error) throw error;
      setNewFolderName('');
      setIsCreatingFolder(false);
      toast.success('Folder created');
      await fetchDriveData();
    } catch (err: any) {
      console.error('Create folder error:', err);
      toast.error(err?.message || 'Failed to create folder');
    }
  };

  const renameFolder = async () => {
    const folderId = editingFolderId;
    const name = editingFolderName.trim();
    if (!folderId || !name) return;

    try {
      const { error } = await supabase.from('client_folders').update({ name }).eq('id', folderId);
      if (error) throw error;
      setEditingFolderId(null);
      setEditingFolderName('');
      toast.success('Folder renamed');
      await fetchDriveData();
    } catch (err: any) {
      console.error('Rename folder error:', err);
      toast.error(err?.message || 'Failed to rename folder');
    }
  };

  const renameFile = async () => {
    const fileId = editingFileId;
    const name = editingFileName.trim();
    if (!fileId || !name) return;

    try {
      const { error } = await supabase.from('client_files').update({ filename: name }).eq('id', fileId);
      if (error) throw error;
      setEditingFileId(null);
      setEditingFileName('');
      toast.success('File renamed');
      await fetchDriveData();
    } catch (err: any) {
      console.error('Rename file error:', err);
      toast.error(err?.message || 'Failed to rename file');
    }
  };

  const deleteFolder = async (folderId: string) => {
    const hasChildFolders = folders.some((folder) => folder.parentFolderId === folderId);
    const hasFiles = files.some((file) => file.folderId === folderId);
    if (hasChildFolders || hasFiles) {
      toast.error('Folder must be empty before deletion');
      return;
    }

    try {
      const { error } = await supabase.from('client_folders').delete().eq('id', folderId);
      if (error) throw error;
      if (currentFolderId === folderId) {
        setCurrentFolderId(null);
      }
      toast.success('Folder deleted');
      await fetchDriveData();
    } catch (err: any) {
      console.error('Delete folder error:', err);
      toast.error(err?.message || 'Failed to delete folder');
    }
  };

  const uploadFile = async (file: File) => {
    if (!user) return;

    setIsUploading(true);
    try {
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

      if (file.size > 50 * 1024 * 1024) {
        toast.error('File must be under 50MB');
        setIsUploading(false);
        return;
      }

      const directPath = `${client.workspaceId}/${client.id}/${crypto.randomUUID()}-${sanitizeFilename(file.name)}`;
      let storagePath = directPath;

      const direct = await supabase.storage.from('uploads').upload(directPath, file, {
        upsert: false,
        contentType: file.type || undefined,
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
            filename: file.name,
          },
        });
        if (signedError) {
          throw new Error(`Upload URL failed: ${await describeInvokeError(signedError)}`);
        }
        if (!signed?.path || !signed?.token) throw new Error('Failed to create upload URL');

        storagePath = String(signed.path);
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .uploadToSignedUrl(storagePath, signed.token, file);
        if (uploadError) {
          const msg = String(uploadError?.message || uploadError?.error || uploadError?.details || '').trim();
          throw new Error(`Upload failed: ${msg || 'Unknown storage error'}`);
        }
      }

      const mimeType = file.type;
      let fileType = 'document';
      if (mimeType.startsWith('image/')) fileType = 'image';
      else if (mimeType.startsWith('video/')) fileType = 'video';
      else if (mimeType.includes('pdf')) fileType = 'pdf';
      else if (mimeType.includes('spreadsheet') || mimeType.includes('csv') || mimeType.includes('excel')) fileType = 'spreadsheet';

      const { error: dbError } = await supabase.from('client_files').insert({
        id: crypto.randomUUID(),
        client_id: client.id,
        workspace_id: client.workspaceId,
        folder_id: currentFolderId,
        uploaded_by: user.id,
        filename: file.name,
        file_url: storagePath,
        file_type: fileType,
        mime_type: mimeType,
        size_bytes: file.size,
        is_video: mimeType.startsWith('video/'),
      });

      if (dbError) {
        const msg = String(dbError?.message || dbError?.details || dbError?.hint || '').trim();
        throw new Error(`Saving file failed: ${msg || 'Database error'}`);
      }
      toast.success('File uploaded');
      await fetchDriveData();
    } catch (err: any) {
      console.error('Upload file error:', err);
      toast.error(String(err?.message || '').trim() || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFile = async (file: ClientFile) => {
    try {
      await supabase.storage.from('uploads').remove([file.fileUrl]);
      const { error } = await supabase.from('client_files').delete().eq('id', file.id);
      if (error) throw error;
      toast.success('File deleted');
      await fetchDriveData();
    } catch (err: any) {
      console.error('Delete file error:', err);
      toast.error(err?.message || 'Failed to delete file');
    }
  };

  const downloadFile = async (file: ClientFile) => {
    try {
      const { data, error } = await supabase.storage.from('uploads').download(file.fileUrl);
      if (!error && data) {
        downloadBlob(data, file.filename);
        return;
      }

      // Fallback: some deployments still block direct downloads for portal clients due to storage RLS drift.
      // Use a service-role signed URL (with access checks) and then download the blob with the correct filename.
      const { data: signed, error: signedError } = await authedInvoke<any>('client-file-download-url', {
        body: {
          workspaceId: client.workspaceId,
          clientId: client.id,
          fileId: file.id,
        },
      });

      if (signedError || !signed?.signedUrl) {
        throw signedError || new Error('Failed to create download URL');
      }

      const resp = await fetch(String(signed.signedUrl), { method: 'GET' });
      if (!resp.ok) {
        throw new Error(`Download failed (${resp.status})`);
      }
      const blob = await resp.blob();
      downloadBlob(blob, file.filename);
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download file');
    }
  };

  const movePayload = async (payload: DragPayload, destinationFolderId: string | null) => {
    try {
      if (payload.type === 'folder') {
        if (payload.id === destinationFolderId) return;
        if (folderDescendantCheck(payload.id, destinationFolderId)) {
          toast.error('Cannot move a folder into itself');
          return;
        }
        const { error } = await supabase
          .from('client_folders')
          .update({ parent_folder_id: destinationFolderId })
          .eq('id', payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('client_files')
          .update({ folder_id: destinationFolderId })
          .eq('id', payload.id);
        if (error) throw error;
      }

      toast.success('Moved');
      await fetchDriveData();
    } catch (err: any) {
      console.error('Move item error:', err);
      toast.error(err?.message || 'Failed to move item');
    }
  };

  const renderTree = (parentId: string | null, depth = 0): JSX.Element[] => {
    const children = childFoldersByParent.get(parentId || '__root__') || [];
    return children.flatMap((folder) => {
      const isActive = currentFolderId === folder.id;
      const isDropTarget = dropTargetFolderId === folder.id;
      const row = (
        <button
          key={folder.id}
          type="button"
          onClick={() => setCurrentFolderId(folder.id)}
          className={`w-full h-8 px-2 rounded-xl text-left text-sm flex items-center gap-2 transition-colors ${
            isDropTarget
              ? 'bg-white/[0.10] text-white'
              : isActive
              ? 'bg-white/[0.08] text-white'
              : 'text-white/70 hover:bg-white/[0.04]'
          }`}
          style={{ paddingLeft: 8 + depth * 14 }}
          onDragOver={(event) => {
            if (!dragPayload || isSearching) return;
            event.preventDefault();
            event.stopPropagation();
            setDropTargetFolderId(folder.id);
          }}
          onDragLeave={() => {
            if (dropTargetFolderId === folder.id) setDropTargetFolderId(null);
          }}
          onDrop={(event) => {
            if (!dragPayload || isSearching) return;
            event.preventDefault();
            event.stopPropagation();
            const payload = dragPayload;
            setDragPayload(null);
            setDropTargetFolderId(null);
            void movePayload(payload, folder.id);
          }}
        >
          <Folder className="w-4 h-4 shrink-0" />
          <span className="truncate">{folder.name}</span>
        </button>
      );

      const nested = renderTree(folder.id, depth + 1);
      return [row, ...nested];
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)] gap-4">
      <div className="border border-border rounded-3xl p-3 bg-black">
        <div className="mb-3 px-1 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.14em] text-white/45">Folders</p>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg"
            onClick={() => {
              setIsCreatingFolder(true);
              setNewFolderName('');
            }}
          >
            <FolderPlus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => setCurrentFolderId(null)}
            className={`w-full h-8 px-2 rounded-xl text-left text-sm flex items-center gap-2 transition-colors ${
              dropTargetFolderId === '__root__'
                ? 'bg-white/[0.10] text-white'
                : currentFolderId === null
                ? 'bg-white/[0.08] text-white'
                : 'text-white/70 hover:bg-white/[0.04]'
            }`}
            onDragOver={(event) => {
              if (!dragPayload || isSearching) return;
              event.preventDefault();
              event.stopPropagation();
              setDropTargetFolderId('__root__');
            }}
            onDragLeave={() => {
              if (dropTargetFolderId === '__root__') setDropTargetFolderId(null);
            }}
            onDrop={(event) => {
              if (!dragPayload || isSearching) return;
              event.preventDefault();
              event.stopPropagation();
              const payload = dragPayload;
              setDragPayload(null);
              setDropTargetFolderId(null);
              void movePayload(payload, null);
            }}
          >
            <Folder className="w-4 h-4 shrink-0" />
            <span className="truncate">Root</span>
          </button>
          {renderTree(null)}
        </div>
      </div>

      <div className="border border-border rounded-3xl p-4 bg-black">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-white/65">
            <button type="button" onClick={() => setCurrentFolderId(null)} className="hover:text-white transition-colors">
              Root
            </button>
            {breadcrumb.map((folder, index) => (
              <div key={folder.id} className="flex items-center gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-white/35" />
                <button
                  type="button"
                  onClick={() => setCurrentFolderId(folder.id)}
                  className={`hover:text-white transition-colors ${index === breadcrumb.length - 1 ? 'text-white' : ''}`}
                >
                  {folder.name}
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadFile(file);
                if (event.target) event.target.value = '';
              }}
            />
            <Button
              variant="outline"
              className="rounded-xl bg-transparent border-border"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="w-4 h-4 text-white/45 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search files and folders"
            className="pl-9 bg-black border-border rounded-2xl h-10"
          />
        </div>

        {isCreatingFolder && (
          <div className="mb-3 p-3 border border-border rounded-2xl bg-black/80 flex items-center gap-2">
            <Input
              value={newFolderName}
              onChange={(event) => setNewFolderName(event.target.value)}
              placeholder="Folder name"
              className="h-9 bg-black border-border rounded-xl"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void createFolder();
                }
              }}
              autoFocus
            />
            <Button size="sm" className="bg-white text-black hover:bg-white/90 rounded-xl" onClick={() => void createFolder()}>
              Create
            </Button>
            <Button size="sm" variant="outline" className="rounded-xl bg-transparent border-border" onClick={() => setIsCreatingFolder(false)}>
              Cancel
            </Button>
          </div>
        )}

        <div
          className={`rounded-2xl min-h-[420px] ${
            dropTargetFolderId === (currentFolderId || '__root__')
              ? 'bg-white/[0.03]'
              : ''
          }`}
          onDragOver={(event) => {
            if (!dragPayload || isSearching) return;
            event.preventDefault();
            setDropTargetFolderId(currentFolderId || '__root__');
          }}
          onDragLeave={() => {
            if (dropTargetFolderId === (currentFolderId || '__root__')) {
              setDropTargetFolderId(null);
            }
          }}
          onDrop={(event) => {
            if (!dragPayload || isSearching) return;
            event.preventDefault();
            const payload = dragPayload;
            setDragPayload(null);
            setDropTargetFolderId(null);
            void movePayload(payload, currentFolderId);
          }}
        >
          {loading ? (
            <div className="h-full min-h-[420px] p-4 space-y-2">
              {Array.from({ length: 9 }).map((_, idx) => (
                <div key={idx} className="h-14 px-3 flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded bg-white/[0.06]" />
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-56 rounded-xl bg-white/[0.10]" />
                    <Skeleton className="h-3 w-72 rounded-xl bg-white/[0.06] mt-2" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-xl bg-white/[0.06]" />
                </div>
              ))}
            </div>
          ) : visibleFolders.length === 0 && visibleFiles.length === 0 ? (
            <div className="h-full min-h-[420px] flex flex-col items-center justify-center text-center px-6">
              <Folder className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {isSearching ? 'No results found' : 'This folder is empty'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isSearching ? 'Try another keyword' : 'Upload files or create a subfolder'}
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {visibleFolders.map((folder) => {
                const path = getFolderPath(folder.parentFolderId).map((item) => item.name).join(' / ');
                const isDropTarget = dropTargetFolderId === folder.id;

                return (
                  <div
                    key={folder.id}
                    draggable={!isSearching}
                    onDragStart={() => setDragPayload({ type: 'folder', id: folder.id })}
                    onDragEnd={() => {
                      setDragPayload(null);
                      setDropTargetFolderId(null);
                    }}
                    onDragOver={(event) => {
                      if (!dragPayload || isSearching) return;
                      event.preventDefault();
                      event.stopPropagation();
                      setDropTargetFolderId(folder.id);
                    }}
                    onDrop={(event) => {
                      if (!dragPayload || isSearching) return;
                      event.preventDefault();
                      event.stopPropagation();
                      const payload = dragPayload;
                      setDragPayload(null);
                      setDropTargetFolderId(null);
                      void movePayload(payload, folder.id);
                    }}
                    className={`h-14 px-3 flex items-center gap-3 rounded-xl transition-colors ${
                      isDropTarget ? 'bg-white/[0.06]' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <Folder className="w-4 h-4 text-white/70 shrink-0" />
                    <button
                      type="button"
                      className="flex-1 text-left min-w-0"
                      onClick={() => {
                        if (isSearching) {
                          setSearchQuery('');
                        }
                        setCurrentFolderId(folder.id);
                      }}
                    >
                      <p className="truncate text-sm text-white">{folder.name}</p>
                      {isSearching && path ? (
                        <p className="truncate text-xs text-white/45">{path}</p>
                      ) : null}
                    </button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 rounded-lg text-white/55 hover:text-white"
                      onClick={() => {
                        setEditingFolderId(folder.id);
                        setEditingFolderName(folder.name);
                      }}
                    >
                      Rename
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-white/55 hover:text-red-400"
                      onClick={() => void deleteFolder(folder.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}

              {visibleFiles.map((file) => {
                const parentPath = getFolderPath(file.folderId).map((item) => item.name).join(' / ');
                return (
                  <div
                    key={file.id}
                    draggable={!isSearching}
                    onDragStart={() => setDragPayload({ type: 'file', id: file.id })}
                    onDragEnd={() => {
                      setDragPayload(null);
                      setDropTargetFolderId(null);
                    }}
                    className="h-14 px-3 flex items-center gap-3 rounded-xl hover:bg-white/[0.02]"
                  >
                    {getFileIcon(file.fileType)}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm text-white">{file.filename}</p>
                      <p className="truncate text-xs text-white/45">
                        {formatFileSize(file.sizeBytes)}
                        {isSearching && parentPath ? ` • ${parentPath}` : ''}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 rounded-lg text-white/55 hover:text-white"
                      onClick={() => {
                        setEditingFileId(file.id);
                        setEditingFileName(file.filename);
                      }}
                    >
                      Rename
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-white/55 hover:text-white"
                      onClick={() => void downloadFile(file)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-white/55 hover:text-red-400"
                      onClick={() => void deleteFile(file)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {editingFolderId && (
          <div className="mt-3 p-3 border border-border rounded-2xl bg-black/80 flex items-center gap-2">
            <Input
              value={editingFolderName}
              onChange={(event) => setEditingFolderName(event.target.value)}
              placeholder="Folder name"
              className="h-9 bg-black border-border rounded-xl"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void renameFolder();
                }
              }}
              autoFocus
            />
            <Button size="sm" className="bg-white text-black hover:bg-white/90 rounded-xl" onClick={() => void renameFolder()}>
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl bg-transparent border-border"
              onClick={() => {
                setEditingFolderId(null);
                setEditingFolderName('');
              }}
            >
              Cancel
            </Button>
          </div>
        )}

        {editingFileId && (
          <div className="mt-3 p-3 border border-border rounded-2xl bg-black/80 flex items-center gap-2">
            <Input
              value={editingFileName}
              onChange={(event) => setEditingFileName(event.target.value)}
              placeholder="File name"
              className="h-9 bg-black border-border rounded-xl"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void renameFile();
                }
              }}
              autoFocus
            />
            <Button size="sm" className="bg-white text-black hover:bg-white/90 rounded-xl" onClick={() => void renameFile()}>
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl bg-transparent border-border"
              onClick={() => {
                setEditingFileId(null);
                setEditingFileName('');
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
