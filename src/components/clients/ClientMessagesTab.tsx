import { useState, useEffect, useCallback, useRef } from 'react';
import { Send, Paperclip, FileText, Image, FileVideo, Download, X } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Client, ClientMessage, ClientFile, mapDbRowToMessage, mapDbRowToFile } from '@/types/client-portal';
import { format, isToday, isYesterday } from 'date-fns';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface ClientMessagesTabProps {
  client: Client;
  onFileUploaded?: () => void;
}

const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'pdf', 'csv', 'xlsx', 'doc', 'docx'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export function ClientMessagesTab({ client, onFileUploaded }: ClientMessagesTabProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('client_messages')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Fetch attachments for messages that have them
      const attachmentIds = (messagesData || [])
        .filter(m => m.attachment_id)
        .map(m => m.attachment_id);

      let attachmentsMap: Record<string, ClientFile> = {};
      if (attachmentIds.length > 0) {
        const { data: filesData } = await supabase
          .from('client_files')
          .select('*')
          .in('id', attachmentIds);

        if (filesData) {
          attachmentsMap = filesData.reduce((acc, f) => {
            acc[f.id] = mapDbRowToFile(f);
            return acc;
          }, {} as Record<string, ClientFile>);
        }
      }

      setMessages((messagesData || []).map(m => 
        mapDbRowToMessage(m, m.attachment_id ? attachmentsMap[m.attachment_id] : null)
      ));
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [client.id]);

  // Initial fetch
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel(`messages-${client.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_messages',
          filter: `client_id=eq.${client.id}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [client.id, fetchMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      toast.error(`File type not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 20MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleSend = async () => {
    if (!content.trim() && !selectedFile) return;
    if (!user) return;

    setSending(true);
    try {
      let attachmentId: string | null = null;

      // Upload file if selected
      if (selectedFile) {
        const fileId = uuidv4();
        const extension = selectedFile.name.split('.').pop()?.toLowerCase() || '';
        const storagePath = `${client.workspaceId}/${client.id}/${fileId}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(storagePath, selectedFile);

        if (uploadError) throw uploadError;

        // Create file record
        const { data: fileData, error: fileError } = await supabase
          .from('client_files')
          .insert({
            id: fileId,
            client_id: client.id,
            workspace_id: client.workspaceId,
            uploaded_by: user.id,
            filename: selectedFile.name,
            file_url: storagePath,
            file_type: extension,
            mime_type: selectedFile.type,
            size_bytes: selectedFile.size,
            is_video: false,
          })
          .select()
          .single();

        if (fileError) throw fileError;
        attachmentId = fileData.id;
        onFileUploaded?.();
      }

      // Send message
      const { error: messageError } = await supabase
        .from('client_messages')
        .insert({
          client_id: client.id,
          workspace_id: client.workspaceId,
          sender_id: user.id,
          sender_type: 'coach',
          content: content.trim() || (selectedFile ? `Shared a file: ${selectedFile.name}` : ''),
          attachment_id: attachmentId,
        });

      if (messageError) throw messageError;

      setContent('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleDownload = async (file: ClientFile) => {
    try {
      const { data, error } = await supabase.storage
        .from('uploads')
        .download(file.fileUrl);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      toast.error('Failed to download file');
    }
  };

  const getFileIcon = (fileType: string) => {
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileType)) {
      return <Image className="w-4 h-4" />;
    }
    if (['mp4', 'mov', 'avi'].includes(fileType)) {
      return <FileVideo className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const formatMessageDate = (date: Date) => {
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return `Yesterday ${format(date, 'h:mm a')}`;
    return format(date, 'MMM d, h:mm a');
  };

  const groupMessagesByDate = (messages: ClientMessage[]) => {
    const groups: { date: string; messages: ClientMessage[] }[] = [];
    let currentDate = '';

    messages.forEach(message => {
      const messageDate = format(message.createdAt, 'yyyy-MM-dd');
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        groups.push({
          date: isToday(message.createdAt) 
            ? 'Today' 
            : isYesterday(message.createdAt) 
              ? 'Yesterday' 
              : format(message.createdAt, 'MMMM d, yyyy'),
          messages: [message],
        });
      } else {
        groups[groups.length - 1].messages.push(message);
      }
    });

    return groups;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-[600px] border border-border rounded-lg overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messageGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <div className="flex justify-center mb-4">
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {group.date}
                </span>
              </div>
              <div className="space-y-3">
                {group.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderType === 'coach' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        message.senderType === 'coach'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      
                      {message.attachment && (
                        <button
                          onClick={() => handleDownload(message.attachment!)}
                          className={`mt-2 flex items-center gap-2 text-xs rounded-lg px-3 py-2 ${
                            message.senderType === 'coach'
                              ? 'bg-white/20 hover:bg-white/30'
                              : 'bg-background hover:bg-accent'
                          } transition-colors`}
                        >
                          {getFileIcon(message.attachment.fileType)}
                          <span className="truncate max-w-[150px]">{message.attachment.filename}</span>
                          <Download className="w-3 h-3 shrink-0" />
                        </button>
                      )}
                      
                      <p className={`text-[10px] mt-1 ${
                        message.senderType === 'coach' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {formatMessageDate(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t-[0.5px] border-border p-4">
        {selectedFile && (
          <div className="mb-3 flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
            {getFileIcon(selectedFile.name.split('.').pop() || '')}
            <span className="text-sm truncate flex-1">{selectedFile.name}</span>
            <button
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_EXTENSIONS.map(e => `.${e}`).join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="min-h-[44px] max-h-32 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          
          <Button
            onClick={handleSend}
            disabled={sending || (!content.trim() && !selectedFile)}
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
