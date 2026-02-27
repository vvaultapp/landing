import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';
import { toast } from 'sonner';
import type { AIMessage, ConnectedChannel, YouTubeVideo } from './useContentData';

interface UseChatStreamOptions {
  chatId: string;
  channelContext?: ConnectedChannel | null;
  videosContext?: YouTubeVideo[];
}

export function useAIChat({ chatId, channelContext, videosContext }: UseChatStreamOptions) {
  const { workspace } = useWorkspace();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  const fetchMessages = useCallback(async () => {
    if (!chatId || !workspace?.id) return;

    const { data, error } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('chat_id', chatId)
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data as AIMessage[] || []);
  }, [chatId, workspace?.id]);

  const saveMessage = useCallback(async (role: 'user' | 'assistant', content: string) => {
    if (!chatId || !workspace?.id) return null;

    const { data, error } = await supabase
      .from('ai_messages')
      .insert({
        workspace_id: workspace.id,
        chat_id: chatId,
        role,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving message:', error);
      return null;
    }

    return data as AIMessage;
  }, [chatId, workspace?.id]);

  const sendMessage = useCallback(async (content: string) => {
    if (!chatId || !workspace?.id || isLoading) return;

    setIsLoading(true);
    setStreamingContent('');

    // Save user message
    const userMessage = await saveMessage('user', content);
    if (userMessage) {
      setMessages(prev => [...prev, userMessage]);
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Prepare messages for API
      const apiMessages = [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content },
      ];

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/content-ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          messages: apiMessages,
          workspaceId: workspace.id,
          chatId,
          channelContext,
          videosContext: videosContext?.slice(0, 10),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to get AI response');
        setIsLoading(false);
        return;
      }

      if (!response.body) {
        toast.error('No response body');
        setIsLoading(false);
        return;
      }

      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        // Process line by line
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const deltaContent = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (deltaContent) {
              assistantContent += deltaContent;
              setStreamingContent(assistantContent);
            }
          } catch {
            // Incomplete JSON, put back and wait
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const deltaContent = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (deltaContent) {
              assistantContent += deltaContent;
            }
          } catch { /* ignore */ }
        }
      }

      // Save assistant message
      if (assistantContent) {
        const assistantMessage = await saveMessage('assistant', assistantContent);
        if (assistantMessage) {
          setMessages(prev => [...prev, assistantMessage]);
        }
      }

      setStreamingContent('');
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [chatId, workspace?.id, messages, channelContext, videosContext, isLoading, saveMessage]);

  return {
    messages,
    isLoading,
    streamingContent,
    sendMessage,
    fetchMessages,
    setMessages,
  };
}
