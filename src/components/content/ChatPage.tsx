import { useState, useEffect, useRef } from 'react';
import { Plus, MessageSquare, Trash2, Send, Loader2, Sparkles, TrendingUp, BarChart3, Video } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useAIChat } from '@/hooks/useAIChat';
import type { AIChat, ConnectedChannel, YouTubeVideo } from '@/hooks/useContentData';

interface ChatPageProps {
  chats: AIChat[];
  channels: ConnectedChannel[];
  videos: YouTubeVideo[];
  onCreateChat: (title?: string, contextType?: string) => Promise<AIChat | null>;
  onDeleteChat: (chatId: string) => Promise<boolean>;
  onUpdateChatTitle: (chatId: string, title: string) => Promise<boolean>;
}

const SUGGESTION_CARDS = [
  {
    icon: Sparkles,
    title: 'Video ideas',
    description: 'Based on my channel, what video ideas do you have for me?',
    prompt: 'Based on my channel niche and my previous successful videos, what are 10 video ideas that would resonate with my audience and have good potential for views? Consider what\'s worked well for me before.',
  },
  {
    icon: TrendingUp,
    title: 'More views',
    description: 'How do I get more views?',
    prompt: 'I want to get more views on my videos. Based on my channel performance and recent videos, what are the 5 most impactful things I can do right now to increase my reach and views?',
  },
  {
    icon: BarChart3,
    title: 'Channel audit',
    description: 'Can you audit my channel?',
    prompt: 'Please do a comprehensive audit of my YouTube channel. Look at my recent videos, titles, thumbnails patterns, and any insights you can see. Give me specific, actionable feedback on what I\'m doing well and what I should improve. Be direct and honest.',
  },
  {
    icon: Video,
    title: 'Video review',
    description: 'Give me feedback on my latest video',
    prompt: 'Review my most recent video. Analyze the title, description, and based on the engagement metrics, tell me what worked and what could be improved for future videos. Also suggest 5 better title alternatives.',
  },
];

export function ChatPage({
  chats,
  channels,
  videos,
  onCreateChat,
  onDeleteChat,
  onUpdateChatTitle,
}: ChatPageProps) {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedChat = chats.find(c => c.id === selectedChatId);
  const primaryChannel = channels[0] || null;

  const {
    messages,
    isLoading,
    streamingContent,
    sendMessage,
    fetchMessages,
    setMessages,
  } = useAIChat({
    chatId: selectedChatId || '',
    channelContext: primaryChannel,
    videosContext: videos,
  });

  // Handle pending question from AskAcquizitorBubble
  useEffect(() => {
    const pendingQuestion = sessionStorage.getItem('pendingAIQuestion');
    const pendingChatId = sessionStorage.getItem('pendingAIChatId');
    
    if (pendingQuestion && pendingChatId) {
      // Clear immediately to prevent double-send
      sessionStorage.removeItem('pendingAIQuestion');
      sessionStorage.removeItem('pendingAIChatId');
      
      // Select the chat and send the message
      setSelectedChatId(pendingChatId);
      setTimeout(async () => {
        await sendMessage(pendingQuestion);
      }, 200);
    }
  }, [sendMessage]);

  useEffect(() => {
    if (selectedChatId) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [selectedChatId, fetchMessages, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSuggestionClick = async (prompt: string, title: string) => {
    const chat = await onCreateChat(title, 'suggestion');
    if (chat) {
      setSelectedChatId(chat.id);
      // Small delay to let the chat be selected before sending
      setTimeout(() => {
        setInputValue(prompt);
      }, 100);
    }
  };

  const handleNewChat = async () => {
    const chat = await onCreateChat();
    if (chat) {
      setSelectedChatId(chat.id);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const message = inputValue;
    setInputValue('');
    
    if (!selectedChatId) {
      // Create new chat first
      const chat = await onCreateChat(message.slice(0, 50));
      if (chat) {
        setSelectedChatId(chat.id);
        // Need to wait for chat to be selected
        setTimeout(async () => {
          await sendMessage(message);
          // Update title based on first message
          onUpdateChatTitle(chat.id, message.slice(0, 50) + (message.length > 50 ? '...' : ''));
        }, 100);
      }
    } else {
      await sendMessage(message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4">
      {/* Chat History Sidebar */}
      <div className="w-64 shrink-0 flex flex-col border border-border rounded-lg bg-card/50">
        <div className="p-3 border-b-[0.5px] border-border">
          <Button
            onClick={handleNewChat}
            className="w-full justify-start"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={cn(
                  'w-full text-left p-2 rounded-lg text-sm transition-colors group',
                  'hover:bg-accent',
                  selectedChatId === chat.id && 'bg-accent'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MessageSquare className="w-4 h-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{chat.title}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                      if (selectedChatId === chat.id) {
                        setSelectedChatId(null);
                      }
                    }}
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(chat.updated_at), { addSuffix: true })}
                </p>
              </button>
            ))}

            {chats.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No chats yet
              </p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col border border-border rounded-lg bg-card/50">
        {!selectedChatId && messages.length === 0 ? (
          /* Welcome Screen */
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <h2 className="text-3xl font-bold mb-3">How can I help you today?</h2>

            <div className="grid grid-cols-2 gap-3 max-w-2xl w-full mt-8">
              {SUGGESTION_CARDS.map((card) => (
                <button
                  key={card.title}
                  onClick={() => handleSuggestionClick(card.prompt, card.title)}
                  className="p-5 rounded-xl border border-border bg-card/50 hover:bg-accent/50 text-left transition-all group relative overflow-hidden"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-muted group-hover:bg-accent transition-colors">
                      <card.icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1">{card.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
                    </div>
                  </div>
                  {/* Arrow indicator */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'rounded-lg px-4 py-2 max-w-[85%]',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}

                {streamingContent && (
                  <div className="flex justify-start">
                    <div className="rounded-lg px-4 py-2 max-w-[85%] bg-muted">
                      <p className="text-sm whitespace-pre-wrap">{streamingContent}</p>
                    </div>
                  </div>
                )}

                {isLoading && !streamingContent && (
                  <div className="flex justify-start">
                    <div className="rounded-lg px-4 py-2 bg-muted">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t-[0.5px] border-border">
              <div className="flex gap-2 max-w-3xl mx-auto">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 input-fade-border bg-transparent"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Input for welcome screen */}
        {!selectedChatId && messages.length === 0 && (
          <div className="p-4 border-t-[0.5px] border-border">
            <div className="flex gap-2 max-w-3xl mx-auto">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about YouTube growth..."
                className="flex-1 input-fade-border bg-transparent"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
