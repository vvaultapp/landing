import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Archive,
  ArrowLeft,
  Check,
  ChevronDown,
  Copy,
  FileText,
  Loader2,
  Paperclip,
  Pencil,
  SquarePen,
  Search as SearchIcon,
  Star,
  Send,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
} from '@/components/ui/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { authedInvoke } from '@/integrations/supabase/authedInvoke';
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type UploadStatus = 'pending' | 'uploading' | 'complete' | 'failed';

type AttachedFile = {
  id: string;
  file: File;
  type: string;
  preview: string | null;
  uploadStatus: UploadStatus;
  extractedText: string;
};

type PastedSnippet = {
  id: string;
  content: string;
  createdAt: string;
};

type ChatAttachment = {
  id: string;
  kind: 'image' | 'file' | 'snippet';
  name?: string;
  type?: string;
  size?: number;
  previewUrl?: string;
  text?: string;
};

type ChatMessageFeedback = 'like' | 'dislike' | null;

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  apiContent?: string;
  attachments?: ChatAttachment[];
  feedback?: ChatMessageFeedback;
  createdAt: string;
};

type ChatLog = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  starred?: boolean;
  messages: ChatMessage[];
};

type DashboardModelOptionId = 'saturn' | 'saturn-light';

type DashboardModelOption = {
  id: DashboardModelOptionId;
  label: string;
  description: string;
  modelCandidates: string[];
};

type PendingDashboardSend = {
  workspaceId: string;
  conversationId: string;
  userMessage: ChatMessage;
  fallbackTitle: string;
  createdAt: string;
  modelOptionId?: DashboardModelOptionId;
};

type DashboardClaudeChatMode = 'dashboard' | 'chat-log';

type DashboardClaudeChatProps = {
  workspaceId: string | null | undefined;
  mode?: DashboardClaudeChatMode;
};

const MAX_CHAT_LOGS = 80;
const CLAUDE_MODEL_CANDIDATES = [
  'claude-sonnet-4-20250514',
  'claude-3-7-sonnet-latest',
  'claude-3-5-sonnet-latest',
];
const MAX_FILE_ATTACHMENTS = 10;
const MAX_IMAGE_ATTACHMENTS = 10;
const DASHBOARD_MODEL_OPTIONS: DashboardModelOption[] = [
  {
    id: 'saturn',
    label: 'Saturn 1.1',
    description: 'Built for deeper strategy and high-accuracy reasoning on complex business decisions.',
    modelCandidates: CLAUDE_MODEL_CANDIDATES,
  },
  {
    id: 'saturn-light',
    label: 'Saturn Light',
    description: 'A lighter profile for quicker drafts, iterations, and rapid day-to-day execution.',
    modelCandidates: CLAUDE_MODEL_CANDIDATES,
  },
];
const DEFAULT_MODEL_OPTION_ID: DashboardModelOptionId = 'saturn';

function toDashboardModelOptionId(value: unknown): DashboardModelOptionId {
  const normalized = String(value || '').trim().toLowerCase();
  return DASHBOARD_MODEL_OPTIONS.some((option) => option.id === normalized)
    ? (normalized as DashboardModelOptionId)
    : DEFAULT_MODEL_OPTION_ID;
}

function getDashboardModelOption(modelOptionId: DashboardModelOptionId): DashboardModelOption {
  return DASHBOARD_MODEL_OPTIONS.find((option) => option.id === modelOptionId) || DASHBOARD_MODEL_OPTIONS[0];
}

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 Bytes';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const val = bytes / 1024 ** i;
  return `${val.toFixed(val >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
}

function isTextLikeFile(file: File) {
  const type = String(file.type || '').toLowerCase();
  if (type.startsWith('text/')) return true;
  if (type.includes('json') || type.includes('javascript') || type.includes('xml') || type.includes('csv')) {
    return true;
  }

  const name = String(file.name || '').toLowerCase();
  return (
    name.endsWith('.txt') ||
    name.endsWith('.md') ||
    name.endsWith('.json') ||
    name.endsWith('.csv') ||
    name.endsWith('.js') ||
    name.endsWith('.ts') ||
    name.endsWith('.tsx') ||
    name.endsWith('.jsx') ||
    name.endsWith('.html') ||
    name.endsWith('.css')
  );
}

function compactText(value: string, limit: number) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, limit);
}

function toChatTitle(value: string) {
  const title = compactText(value, 68);
  return title || 'New AI conversation';
}

function normalizeChatAttachments(value: unknown): ChatAttachment[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((raw) => {
      const entry = (raw || {}) as Record<string, unknown>;
      const kindRaw = String(entry.kind || '').toLowerCase();
      const kind: ChatAttachment['kind'] =
        kindRaw === 'image' || kindRaw === 'snippet' ? (kindRaw as ChatAttachment['kind']) : 'file';
      const id = String(entry.id || crypto.randomUUID());
      const name = String(entry.name || '').trim();
      const type = String(entry.type || '').trim();
      const previewUrl = String(entry.previewUrl || '').trim();
      const text = String(entry.text || '').trim();
      const sizeValue = Number(entry.size || 0);
      const size = Number.isFinite(sizeValue) && sizeValue > 0 ? sizeValue : undefined;

      const normalized: ChatAttachment = {
        id,
        kind,
      };

      if (name) normalized.name = name;
      if (type) normalized.type = type;
      if (size) normalized.size = size;
      if (previewUrl) normalized.previewUrl = previewUrl;
      if (text) normalized.text = text;

      return normalized;
    })
    .filter((entry) => {
      if (entry.kind === 'image') return Boolean(entry.previewUrl);
      if (entry.kind === 'snippet') return Boolean(entry.text);
      return Boolean(entry.name);
    });
}

function toChatMessageFeedback(value: unknown): ChatMessageFeedback {
  const normalized = String(value || '').toLowerCase();
  if (normalized === 'like' || normalized === 'dislike') return normalized;
  return null;
}

function fileToDataUrl(file: File) {
  return new Promise<string | null>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      resolve(result || null);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

function parseDataUrlParts(dataUrl: string) {
  const match = String(dataUrl || '').match(
    /^data:(image\/[a-z0-9.+-]+)(?:;[a-z0-9-]+=[^;,]+)*;base64,([A-Za-z0-9+/=]+)$/i,
  );
  if (!match) return null;
  return {
    mediaType: String(match[1] || '').trim().toLowerCase(),
    base64: String(match[2] || '').trim(),
  };
}

async function downscaleImageDataUrl(
  sourceDataUrl: string,
  maxSide = 1400,
  quality = 0.84,
): Promise<string | null> {
  const parsed = parseDataUrlParts(sourceDataUrl);
  if (!parsed) return sourceDataUrl;
  if (!parsed.mediaType.startsWith('image/')) return sourceDataUrl;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const width = Number(img.naturalWidth || img.width || 0);
        const height = Number(img.naturalHeight || img.height || 0);
        if (!width || !height) {
          resolve(sourceDataUrl);
          return;
        }

        const scale = Math.min(1, maxSide / Math.max(width, height));
        const targetWidth = Math.max(1, Math.round(width * scale));
        const targetHeight = Math.max(1, Math.round(height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(sourceDataUrl);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(jpegDataUrl || sourceDataUrl);
      } catch {
        resolve(sourceDataUrl);
      }
    };
    img.onerror = () => resolve(sourceDataUrl);
    img.src = sourceDataUrl;
  });
}

async function imageFileToCompactDataUrl(file: File): Promise<string | null> {
  const source = await fileToDataUrl(file);
  if (!source) return null;
  return downscaleImageDataUrl(source, 1400, 0.84);
}

function toPlainAssistantText(value: string) {
  const normalized = String(value || '').replace(/\r\n/g, '\n');
  if (!normalized) return '';

  const withCleanLines = normalized
    .split('\n')
    .map((line) => {
      const heading = line.match(/^\s{0,3}#{1,6}\s+(.*)$/);
      if (heading) return heading[1] || '';

      const bullet = line.match(/^\s*[-*+]\s+(.*)$/);
      if (bullet) return `• ${bullet[1] || ''}`;

      return line;
    })
    .join('\n');

  return withCleanLines
    .replace(/```([\s\S]*?)```/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/(^|[^\S\n])\*([^*\n]+)\*(?=[^\S\n]|$)/g, '$1$2')
    .replace(/(^|[^\S\n])_([^_\n]+)_(?=[^\S\n]|$)/g, '$1$2')
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function renderAssistantContent(content: string) {
  const blocks = String(content || '')
    .split(/\n{2,}/)
    .map((block) =>
      block
        .split('\n')
        .map((line) => line.replace(/\s+$/g, ''))
        .filter((line) => line.trim().length > 0),
    )
    .filter((lines) => lines.length > 0);

  const renderLines = (lines: string[], keyPrefix: string) => {
    const allBullets = lines.every((line) => /^•\s+/.test(line.trim()));

    if (allBullets) {
      return (
        <div className="space-y-3">
          {lines.map((line, idx) => (
            <div key={`${keyPrefix}-bullet-${idx}`} className="flex items-start gap-2 text-[15px] leading-[1.56] text-white/86">
              <span className="mt-[1px] text-white/84">•</span>
              <span>{line.trim().replace(/^•\s+/, '')}</span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-2.5">
        {lines.map((line, idx) => {
          const bullet = line.trim().match(/^•\s+(.+)$/);
          if (bullet) {
            return (
              <div key={`${keyPrefix}-mixed-bullet-${idx}`} className="flex items-start gap-2 text-[15px] leading-[1.56] text-white/86">
                <span className="mt-[1px] text-white/84">•</span>
                <span>{bullet[1]}</span>
              </div>
            );
          }

          return (
            <p key={`${keyPrefix}-paragraph-${idx}`} className="text-[15px] leading-[1.7] text-white/86">
              {line.trim()}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {blocks.map((lines, blockIdx) => {
        const first = lines[0].trim();
        const numberedHeading = first.match(/^(\d+)[\.\)]\s+(.+):$/);
        if (numberedHeading && numberedHeading[2].length <= 96) {
          const rest = lines.slice(1);
          return (
            <div key={`assistant-block-heading-${blockIdx}`} className="space-y-4">
              <p className="text-[18px] md:text-[19px] font-semibold leading-[1.28] text-white/94">
                {numberedHeading[1]}. {numberedHeading[2]}:
              </p>
              {rest.length > 0 ? renderLines(rest, `assistant-block-${blockIdx}`) : null}
            </div>
          );
        }

        return <div key={`assistant-block-${blockIdx}`}>{renderLines(lines, `assistant-block-${blockIdx}`)}</div>;
      })}
    </div>
  );
}

function buildAttachmentContext(files: AttachedFile[], snippets: PastedSnippet[]) {
  const parts: string[] = [];

  const textFiles = files
    .filter((f) => f.extractedText)
    .map((f) => `File: ${f.file.name}\n${compactText(f.extractedText, 4000)}`);

  const imageFiles = files
    .filter((f) => !f.extractedText && f.type.startsWith('image/'))
    .map((f) => f.file.name)
    .filter(Boolean);

  if (textFiles.length > 0) {
    parts.push(`Attached file context:\n${textFiles.join('\n\n')}`);
  }

  if (imageFiles.length > 0) {
    parts.push(`Image attachments included: ${imageFiles.join(', ')}`);
  }

  if (snippets.length > 0) {
    const snippetText = snippets
      .map((s, idx) => `Snippet ${idx + 1}: ${compactText(s.content, 2000)}`)
      .join('\n\n');
    parts.push(`Pasted context:\n${snippetText}`);
  }

  if (parts.length === 0) return '';
  return parts.join('\n\n').slice(0, 12000);
}

async function buildUserMessageAttachments(files: AttachedFile[], snippets: PastedSnippet[]) {
  const fromFiles = await Promise.all(
    files.map(async (entry): Promise<ChatAttachment | null> => {
      const isImage = entry.type.startsWith('image/');
      if (isImage) {
        const inlinePreview = await imageFileToCompactDataUrl(entry.file);
        if (!inlinePreview) return null;
        const parsed = parseDataUrlParts(inlinePreview);
        return {
          id: entry.id,
          kind: 'image',
          name: entry.file.name,
          type: parsed?.mediaType || entry.type,
          size: entry.file.size,
          previewUrl: inlinePreview,
        };
      }

      return {
        id: entry.id,
        kind: 'file',
        name: entry.file.name,
        type: entry.type,
        size: entry.file.size,
      };
    }),
  );

  const fromSnippets = snippets.map(
    (snippet): ChatAttachment => ({
      id: snippet.id,
      kind: 'snippet',
      text: snippet.content,
    }),
  );

  return [...fromFiles.filter((item): item is ChatAttachment => Boolean(item)), ...fromSnippets];
}

function readChatLogs(storageKey: string): ChatLog[] {
  if (!storageKey) return [];

  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? (JSON.parse(raw) as ChatLog[]) : [];
    return (Array.isArray(parsed) ? parsed : [])
      .map((log) => ({
        id: String(log?.id || ''),
        title: toChatTitle(String(log?.title || '')),
        createdAt: String(log?.createdAt || new Date().toISOString()),
        updatedAt: String(log?.updatedAt || log?.createdAt || new Date().toISOString()),
        starred: Boolean((log as any)?.starred),
        messages: Array.isArray(log?.messages)
          ? log.messages
              .map((m: any) => ({
                role: m?.role === 'assistant' ? 'assistant' : 'user',
                content: String(m?.content || '').trim(),
                id: String(m?.id || crypto.randomUUID()),
                apiContent: typeof m?.apiContent === 'string' ? m.apiContent : undefined,
                attachments: normalizeChatAttachments(m?.attachments),
                feedback: toChatMessageFeedback(m?.feedback),
                createdAt: String(m?.createdAt || new Date().toISOString()),
              }))
              .map((m) =>
                m.role === 'assistant'
                  ? {
                      ...m,
                      content: toPlainAssistantText(m.content),
                    }
                  : m,
              )
              .filter((m) => Boolean(m.content))
          : [],
      }))
      .filter((log) => log.id)
      .sort(
        (a, b) =>
          Number(Boolean(b.starred)) - Number(Boolean(a.starred)) ||
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, MAX_CHAT_LOGS);
  } catch {
    return [];
  }
}

function persistChatLogs(storageKey: string, logs: ChatLog[]) {
  if (!storageKey) return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(logs.slice(0, MAX_CHAT_LOGS)));
  } catch {
    // ignore write failures
  }
}

function upsertChatLogs(
  prev: ChatLog[],
  chatId: string,
  nextMessages: ChatMessage[],
  fallbackTitle?: string,
): ChatLog[] {
  const now = new Date().toISOString();
  const idx = prev.findIndex((x) => x.id === chatId);

  if (idx === -1) {
    const firstUserMessage =
      nextMessages.find((m) => m.role === 'user')?.content || fallbackTitle || 'New AI conversation';
    const created: ChatLog = {
      id: chatId,
      title: toChatTitle(firstUserMessage),
      createdAt: now,
      updatedAt: now,
      starred: false,
      messages: nextMessages,
    };
    return [created, ...prev].slice(0, MAX_CHAT_LOGS);
  }

  const updated: ChatLog = {
    ...prev[idx],
    updatedAt: now,
    messages: nextMessages,
  };
  const clone = prev.slice();
  clone[idx] = updated;
  return clone
    .sort(
      (a, b) =>
        Number(Boolean(b.starred)) - Number(Boolean(a.starred)) ||
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, MAX_CHAT_LOGS);
}

function parsePendingSend(raw: string | null): PendingDashboardSend | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PendingDashboardSend>;
    const rawMessage: any = parsed?.userMessage;
    const messageId = String(rawMessage?.id || '');
    const conversationId = String(parsed?.conversationId || '');
    const workspaceId = String(parsed?.workspaceId || '');
    if (!messageId || !conversationId || !workspaceId) return null;

    const userMessage: ChatMessage = {
      id: messageId,
      role: rawMessage?.role === 'assistant' ? 'assistant' : 'user',
      content: String(rawMessage?.content || '').trim(),
      apiContent: typeof rawMessage?.apiContent === 'string' ? rawMessage.apiContent : undefined,
      attachments: normalizeChatAttachments(rawMessage?.attachments),
      feedback: toChatMessageFeedback(rawMessage?.feedback),
      createdAt: String(rawMessage?.createdAt || new Date().toISOString()),
    };

    if (!userMessage.content) return null;

    return {
      workspaceId,
      conversationId,
      userMessage,
      fallbackTitle: String(parsed?.fallbackTitle || userMessage.content),
      createdAt: String(parsed?.createdAt || new Date().toISOString()),
      modelOptionId: toDashboardModelOptionId(parsed?.modelOptionId),
    };
  } catch {
    return null;
  }
}

function AttachmentCard({ file, onRemove }: { file: AttachedFile; onRemove: (id: string) => void }) {
  const isImage = Boolean(file.preview) && file.type.startsWith('image/');

  return (
    <div className="relative group flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-white/10 bg-[#141414]">
      {isImage ? (
        <img src={file.preview || ''} alt={file.file.name} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full p-2.5 flex flex-col justify-between">
          <div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-white/[0.06] border border-white/10">
            <FileText className="h-3.5 w-3.5 text-white/70" />
          </div>
          <div>
            <div className="text-[10px] text-white/50 truncate" title={file.file.name}>
              {file.file.name}
            </div>
            <div className="text-[10px] text-white/35">{formatFileSize(file.file.size)}</div>
          </div>
        </div>
      )}

      {file.uploadStatus === 'uploading' ? (
        <div className="absolute inset-0 bg-black/65 grid place-items-center">
          <Loader2 className="h-4 w-4 text-white animate-spin" />
        </div>
      ) : null}

      {file.uploadStatus === 'complete' ? (
        <div className="absolute bottom-1.5 left-1.5 h-5 w-5 rounded-full bg-[#1f3b68] border border-[#2f5da6] grid place-items-center">
          <Check className="h-3 w-3 text-[#a9c8ff]" />
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => onRemove(file.id)}
        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/70 border border-white/10 text-white/80 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Remove file"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

function SnippetCard({ snippet, onRemove }: { snippet: PastedSnippet; onRemove: (id: string) => void }) {
  return (
    <div className="relative group flex-shrink-0 w-28 h-28 rounded-xl overflow-hidden border border-white/10 bg-[#141414] p-2.5">
      <div className="text-[10px] leading-relaxed text-white/55 line-clamp-5 break-words whitespace-pre-wrap">
        {snippet.content}
      </div>
      <button
        type="button"
        onClick={() => onRemove(snippet.id)}
        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/70 border border-white/10 text-white/80 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Remove snippet"
      >
        <X className="h-3 w-3" />
      </button>
      <div className="absolute bottom-1.5 left-1.5 text-[9px] uppercase tracking-wide text-white/40">Pasted</div>
    </div>
  );
}

export function DashboardClaudeChat({ workspaceId, mode = 'dashboard' }: DashboardClaudeChatProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [snippets, setSnippets] = useState<PastedSnippet[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  const [activeChatId, setActiveChatId] = useState('');
  const [sending, setSending] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [typewriterPhraseIdx, setTypewriterPhraseIdx] = useState(0);
  const [typewriterCharCount, setTypewriterCharCount] = useState(0);
  const [typewriterDeleting, setTypewriterDeleting] = useState(false);
  const [typingAssistantId, setTypingAssistantId] = useState('');
  const [typingAssistantChars, setTypingAssistantChars] = useState(0);
  const [chatSearchOpen, setChatSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameTargetId, setRenameTargetId] = useState('');
  const [renameDraft, setRenameDraft] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState('');
  const [selectedModelOptionId, setSelectedModelOptionId] =
    useState<DashboardModelOptionId>(DEFAULT_MODEL_OPTION_ID);
  const [hoveredModelOptionId, setHoveredModelOptionId] = useState<DashboardModelOptionId | null>(null);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const historyRef = useRef<HTMLDivElement | null>(null);
  const chatSearchInputRef = useRef<HTMLInputElement | null>(null);
  const pendingHandledMessageIdRef = useRef('');

  const isChatLogMode = mode === 'chat-log';
  const chatStorageKey = workspaceId ? `acq_dashboard_ai_logs:${workspaceId}` : '';
  const pendingStorageKey = workspaceId ? `acq_dashboard_ai_pending_send:${workspaceId}` : '';
  const dashboardTypewriterPhrases = useMemo(
    () => [
      'Show me the hottest leads to follow up with first',
      'Draft replies for inbound messages I have not answered yet',
      "Give me today's highest-impact actions to improve response time",
    ],
    [],
  );

  const chatQueryId = useMemo(() => {
    if (!isChatLogMode) return '';
    const params = new URLSearchParams(location.search);
    return String(params.get('chat') || '').trim();
  }, [isChatLogMode, location.search]);

  const activeChatTitle = useMemo(() => {
    const active = chatLogs.find((log) => log.id === activeChatId);
    if (active) return active.title;
    if (messages.length > 0) {
      const firstUser = messages.find((m) => m.role === 'user');
      if (firstUser?.content) return toChatTitle(firstUser.content);
    }
    return 'New chat';
  }, [chatLogs, activeChatId, messages]);
  const activeChat = useMemo(
    () => chatLogs.find((log) => log.id === activeChatId) || null,
    [chatLogs, activeChatId],
  );
  const selectedModelOption = useMemo(
    () => getDashboardModelOption(selectedModelOptionId),
    [selectedModelOptionId],
  );
  const modelOptionPreview = useMemo(
    () => getDashboardModelOption(hoveredModelOptionId || selectedModelOptionId),
    [hoveredModelOptionId, selectedModelOptionId],
  );
  const visibleChatLogs = useMemo(() => {
    const query = chatSearchQuery.trim().toLowerCase();
    return chatLogs.filter((log) => {
      if (showStarredOnly && !log.starred) return false;
      if (!query) return true;
      const titleMatch = String(log.title || '').toLowerCase().includes(query);
      if (titleMatch) return true;
      return (Array.isArray(log.messages) ? log.messages : []).some((msg) =>
        String(msg?.content || '').toLowerCase().includes(query),
      );
    });
  }, [chatLogs, showStarredOnly, chatSearchQuery]);

  const canSend = Boolean(workspaceId) && (Boolean(message.trim()) || files.length > 0 || snippets.length > 0) && !sending;
  const chatLogRailClass = 'mx-auto w-full max-w-[700px] md:max-w-[770px] lg:max-w-[840px]';
  const chatLogContentInsetClass = 'px-[22px] md:px-6';

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [message]);

  useEffect(() => {
    if (isChatLogMode || dashboardTypewriterPhrases.length === 0) return;

    const fullPhrase = `${dashboardTypewriterPhrases[typewriterPhraseIdx] || ''}...`;
    let timer = 0;

    if (!typewriterDeleting && typewriterCharCount >= fullPhrase.length) {
      timer = window.setTimeout(() => setTypewriterDeleting(true), 1200);
      return () => window.clearTimeout(timer);
    }

    if (typewriterDeleting && typewriterCharCount <= 0) {
      timer = window.setTimeout(() => {
        setTypewriterDeleting(false);
        setTypewriterPhraseIdx((prev) => (prev + 1) % dashboardTypewriterPhrases.length);
      }, 260);
      return () => window.clearTimeout(timer);
    }

    timer = window.setTimeout(
      () => setTypewriterCharCount((prev) => prev + (typewriterDeleting ? -1 : 1)),
      typewriterDeleting ? 24 : 42,
    );

    return () => window.clearTimeout(timer);
  }, [
    isChatLogMode,
    dashboardTypewriterPhrases,
    typewriterPhraseIdx,
    typewriterCharCount,
    typewriterDeleting,
  ]);

  useEffect(() => {
    const el = historyRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, sending]);

  useEffect(() => {
    if (!chatSearchOpen || !isChatLogMode) return;
    const timer = window.setTimeout(() => chatSearchInputRef.current?.focus(), 10);
    return () => window.clearTimeout(timer);
  }, [chatSearchOpen, isChatLogMode]);

  useEffect(() => {
    if (!typingAssistantId || !isChatLogMode) return;
    const target = messages.find((m) => m.id === typingAssistantId && m.role === 'assistant');
    if (!target) {
      setTypingAssistantId('');
      setTypingAssistantChars(0);
      return;
    }
    if (typingAssistantChars >= target.content.length) return;
    const timer = window.setTimeout(() => {
      setTypingAssistantChars((prev) => Math.min(prev + 2, target.content.length));
    }, 16);
    return () => window.clearTimeout(timer);
  }, [typingAssistantId, typingAssistantChars, messages, isChatLogMode]);

  useEffect(() => {
    pendingHandledMessageIdRef.current = '';

    if (!workspaceId || !chatStorageKey) {
      setChatLogs([]);
      setActiveChatId('');
      setMessages([]);
      setBootstrapped(true);
      return;
    }

    const logs = readChatLogs(chatStorageKey);
    setChatLogs(logs);

    const preferredId = isChatLogMode
      ? chatQueryId || logs[0]?.id || crypto.randomUUID()
      : logs[0]?.id || crypto.randomUUID();

    setActiveChatId(preferredId);
    setMessages(logs.find((log) => log.id === preferredId)?.messages || []);
    setBootstrapped(true);
  }, [workspaceId, chatStorageKey, isChatLogMode, chatQueryId]);

  useEffect(() => {
    persistChatLogs(chatStorageKey, chatLogs);
  }, [chatStorageKey, chatLogs]);

  useEffect(() => {
    return () => {
      files.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
    };
  }, [files]);

  const handleFiles = useCallback(async (list: FileList | File[]) => {
    const incoming = Array.from(list);
    if (incoming.length === 0) return;

    const existingTotal = files.length;
    const existingImageCount = files.filter((entry) => entry.type.startsWith('image/')).length;
    const remainingTotalSlots = Math.max(0, MAX_FILE_ATTACHMENTS - existingTotal);
    let remainingImageSlots = Math.max(0, MAX_IMAGE_ATTACHMENTS - existingImageCount);

    if (remainingTotalSlots <= 0) {
      toast.info(`You can attach up to ${MAX_FILE_ATTACHMENTS} files.`);
      return;
    }

    const accepted: File[] = [];
    let skippedForImageLimit = 0;

    for (const file of incoming) {
      if (accepted.length >= remainingTotalSlots) break;
      const isImage = file.type.startsWith('image/');
      if (isImage && remainingImageSlots <= 0) {
        skippedForImageLimit += 1;
        continue;
      }
      accepted.push(file);
      if (isImage) remainingImageSlots -= 1;
    }

    if (accepted.length === 0) {
      if (skippedForImageLimit > 0) {
        toast.info(`You can attach up to ${MAX_IMAGE_ATTACHMENTS} images.`);
      }
      return;
    }

    const skippedForTotalLimit = Math.max(0, incoming.length - accepted.length - skippedForImageLimit);
    if (skippedForImageLimit > 0) {
      toast.info(`Only ${MAX_IMAGE_ATTACHMENTS} images are allowed per message.`);
    } else if (skippedForTotalLimit > 0) {
      toast.info(`Only ${MAX_FILE_ATTACHMENTS} files are allowed per message.`);
    }

    const next: AttachedFile[] = accepted.map((file) => {
      const isImage = file.type.startsWith('image/');
      return {
        id: crypto.randomUUID(),
        file,
        type: String(file.type || 'application/octet-stream'),
        preview: isImage ? URL.createObjectURL(file) : null,
        uploadStatus: 'uploading',
        extractedText: '',
      };
    });

    setFiles((prev) => [...prev, ...next]);

    await Promise.all(
      next.map(async (entry) => {
        let extracted = '';
        if (isTextLikeFile(entry.file)) {
          try {
            extracted = compactText(await entry.file.text(), 6000);
          } catch {
            extracted = '';
          }
        }

        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id
              ? {
                  ...f,
                  uploadStatus: 'complete',
                  extractedText: extracted,
                }
              : f,
          ),
        );
      }),
    );
  }, [files]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const removeSnippet = useCallback((id: string) => {
    setSnippets((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const clearComposer = useCallback(() => {
    setMessage('');
    setFiles((prev) => {
      prev.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
      return [];
    });
    setSnippets([]);
  }, []);

  const upsertChatLog = useCallback((chatId: string, nextMessages: ChatMessage[], fallbackTitle?: string) => {
    setChatLogs((prev) => upsertChatLogs(prev, chatId, nextMessages, fallbackTitle));
  }, []);

  const runAssistantReply = useCallback(
    async (
      conversationId: string,
      sourceMessages: ChatMessage[],
      fallbackTitle: string,
      modelOptionId: DashboardModelOptionId,
    ) => {
      if (!workspaceId) return;
      const modelOption = getDashboardModelOption(modelOptionId);

      setSending(true);
      try {
        const apiMessages = sourceMessages.map((m) => ({
          role: m.role,
          content: m.apiContent || m.content,
          attachments:
            m.role === 'user'
              ? (m.attachments || [])
                  .filter((attachment) => attachment.kind === 'image' && attachment.previewUrl)
                  .slice(0, MAX_IMAGE_ATTACHMENTS)
                  .map((attachment) => ({
                    kind: 'image',
                    previewUrl: attachment.previewUrl,
                    type: attachment.type || 'image/jpeg',
                    name: attachment.name || '',
                  }))
              : [],
        }));
        let resolvedReply = '';
        let lastError: Error | null = null;

        for (const candidateModel of modelOption.modelCandidates) {
          const { data, error } = await authedInvoke<any>('dashboard-ai-chat', {
            body: {
              workspaceId,
              modelId: candidateModel,
              modelProfile: modelOption.id,
              messages: apiMessages,
            },
          });

          if (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            continue;
          }

          const reply = toPlainAssistantText(String(data?.reply || '').trim());
          const degraded = Boolean(data?.degraded);
          if (data?.success && !degraded && reply) {
            resolvedReply = reply;
            break;
          }

          lastError = new Error(String(data?.error || reply || 'Failed to get assistant response'));
        }

        if (!resolvedReply) throw lastError || new Error('Failed to get assistant response');

        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: resolvedReply,
          createdAt: new Date().toISOString(),
        };

        const withAssistant: ChatMessage[] = [
          ...sourceMessages,
          assistantMessage,
        ];

        setMessages(withAssistant);
        setTypingAssistantId(assistantMessage.id);
        setTypingAssistantChars(0);
        upsertChatLog(conversationId, withAssistant, fallbackTitle);
      } catch (e: any) {
        console.error('dashboard claude chat error:', e);
        const fallbackText = toPlainAssistantText(
          'AI is temporarily unavailable. Your message was saved. Please try again in a few seconds.',
        );

        const assistantFallback: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: fallbackText,
          createdAt: new Date().toISOString(),
        };

        const withFallback: ChatMessage[] = [
          ...sourceMessages,
          assistantFallback,
        ];

        setMessages(withFallback);
        setTypingAssistantId(assistantFallback.id);
        setTypingAssistantChars(0);
        upsertChatLog(conversationId, withFallback, fallbackTitle);
        toast.error('AI unavailable. Please try again.');
      } finally {
        setSending(false);
      }
    },
    [workspaceId, upsertChatLog],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const clipboardItems = Array.from(e.clipboardData.items || []);
      const fileItems = clipboardItems
        .filter((item) => item.kind === 'file')
        .map((item) => item.getAsFile())
        .filter(Boolean) as File[];

      if (fileItems.length > 0) {
        e.preventDefault();
        handleFiles(fileItems);
        return;
      }

      const text = e.clipboardData.getData('text');
      if (text && text.trim().length > 320) {
        e.preventDefault();
        setSnippets((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            content: text.trim(),
            createdAt: new Date().toISOString(),
          },
        ]);

        if (!message.trim()) {
          setMessage('Use the pasted context to help me.');
        }
      }
    },
    [handleFiles, message],
  );

  const send = useCallback(async () => {
    if (!workspaceId || !canSend) return;

    const createNewConversation = !isChatLogMode;
    const conversationId = createNewConversation ? crypto.randomUUID() : activeChatId || crypto.randomUUID();
    setActiveChatId(conversationId);

    const userAttachments = await buildUserMessageAttachments(files, snippets);
    const hasImageAttachments = userAttachments.some((attachment) => attachment.kind === 'image');
    const userVisible = message.trim() || (hasImageAttachments ? 'Please analyze the attached image(s).' : 'Analyze the attached context.');
    const attachmentContext = buildAttachmentContext(files, snippets);
    const userApiContentBase = attachmentContext
      ? `${userVisible}\n\nAdditional context:\n${attachmentContext}`
      : userVisible;
    const userApiContent = hasImageAttachments
      ? `${userApiContentBase}\n\nWhen images are attached, analyze them visually and answer from what you see.`
      : userApiContentBase;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userVisible,
      apiContent: userApiContent,
      attachments: userAttachments,
      createdAt: new Date().toISOString(),
    };

    const baseMessages = createNewConversation ? [] : messages;
    const nextMessages = [...baseMessages, userMessage];

    setMessages(nextMessages);
    upsertChatLog(conversationId, nextMessages, userVisible);
    clearComposer();

    if (createNewConversation) {
      if (pendingStorageKey) {
        const payload: PendingDashboardSend = {
          workspaceId: String(workspaceId),
          conversationId,
          userMessage,
          fallbackTitle: userVisible,
          createdAt: new Date().toISOString(),
          modelOptionId: selectedModelOptionId,
        };
        try {
          sessionStorage.setItem(pendingStorageKey, JSON.stringify(payload));
        } catch {
          // ignore storage failures
        }
      }

      navigate(`/dashboard/chat-log?chat=${encodeURIComponent(conversationId)}`);
      return;
    }

    await runAssistantReply(conversationId, nextMessages, userVisible, selectedModelOptionId);
  }, [
    workspaceId,
    canSend,
    isChatLogMode,
    activeChatId,
    message,
    files,
    snippets,
    messages,
    upsertChatLog,
    clearComposer,
    pendingStorageKey,
    navigate,
    runAssistantReply,
    selectedModelOptionId,
  ]);

  const openChatLog = useCallback(
    (logId: string) => {
      const target = chatLogs.find((log) => log.id === logId);
      if (!target) return;

      setActiveChatId(logId);
      setMessages(target.messages || []);

      if (isChatLogMode) {
        navigate(`/dashboard/chat-log?chat=${encodeURIComponent(logId)}`);
      }
    },
    [chatLogs, isChatLogMode, navigate],
  );

  const startNewChat = useCallback(() => {
    const fresh = crypto.randomUUID();
    clearComposer();
    setActiveChatId(fresh);
    setMessages([]);
    navigate(`/dashboard/chat-log?chat=${encodeURIComponent(fresh)}`);
  }, [clearComposer, navigate]);

  const toggleStarChat = useCallback((chatId: string) => {
    if (!chatId) return;
    setChatLogs((prev) =>
      prev
        .map((log) => (log.id === chatId ? { ...log, starred: !log.starred } : log))
        .sort(
          (a, b) =>
            Number(Boolean(b.starred)) - Number(Boolean(a.starred)) ||
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
        .slice(0, MAX_CHAT_LOGS),
    );
  }, []);

  const openRenameChat = useCallback(
    (chatId: string) => {
      if (!chatId) return;
      const current = chatLogs.find((log) => log.id === chatId);
      setRenameTargetId(chatId);
      setRenameDraft(current?.title || '');
      setRenameDialogOpen(true);
    },
    [chatLogs],
  );

  const submitRenameChat = useCallback(() => {
    if (!renameTargetId) return;
    const nextTitle = toChatTitle(String(renameDraft || '').trim());
    if (!nextTitle) return;
    setChatLogs((prev) =>
      prev.map((log) =>
        log.id === renameTargetId ? { ...log, title: nextTitle, updatedAt: new Date().toISOString() } : log,
      ),
    );
    setRenameDialogOpen(false);
    setRenameTargetId('');
    setRenameDraft('');
  }, [renameTargetId, renameDraft]);

  const closeRenameDialog = useCallback((open: boolean) => {
    setRenameDialogOpen(open);
    if (!open) {
      setRenameTargetId('');
      setRenameDraft('');
    }
  }, []);

  const commitDeleteChat = useCallback(
    (chatId: string) => {
      if (!chatId) return;
      const filtered = chatLogs.filter((log) => log.id !== chatId);
      setChatLogs(filtered);
      if (activeChatId === chatId) {
        const fallbackId = filtered[0]?.id || crypto.randomUUID();
        setActiveChatId(fallbackId);
        setMessages(filtered.find((log) => log.id === fallbackId)?.messages || []);
        if (isChatLogMode) {
          navigate(`/dashboard/chat-log?chat=${encodeURIComponent(fallbackId)}`);
        }
      }
    },
    [chatLogs, activeChatId, isChatLogMode, navigate],
  );

  const openDeleteChat = useCallback((chatId: string) => {
    if (!chatId) return;
    setDeleteTargetId(chatId);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDeleteChat = useCallback(() => {
    if (!deleteTargetId) return;
    commitDeleteChat(deleteTargetId);
    setDeleteDialogOpen(false);
    setDeleteTargetId('');
  }, [deleteTargetId, commitDeleteChat]);

  const toggleSearchChat = useCallback(() => {
    setChatSearchOpen((prev) => {
      const next = !prev;
      if (!next) setChatSearchQuery('');
      return next;
    });
  }, []);

  const toggleStarredFilter = useCallback(() => {
    setShowStarredOnly((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!isChatLogMode || !workspaceId || !pendingStorageKey || !bootstrapped || sending) return;

    const pending = parsePendingSend(sessionStorage.getItem(pendingStorageKey));
    if (!pending) return;

    if (pending.workspaceId !== String(workspaceId)) {
      try {
        sessionStorage.removeItem(pendingStorageKey);
      } catch {
        // ignore storage failures
      }
      return;
    }

    if (pending.conversationId !== activeChatId) return;
    if (pendingHandledMessageIdRef.current === pending.userMessage.id) return;

    pendingHandledMessageIdRef.current = pending.userMessage.id;

    try {
      sessionStorage.removeItem(pendingStorageKey);
    } catch {
      // ignore storage failures
    }

    const existingLog = chatLogs.find((log) => log.id === pending.conversationId);
    const existingMessages = existingLog?.messages || [];
    const hasPendingMessage = existingMessages.some((m) => m.id === pending.userMessage.id);
    const sourceMessages = hasPendingMessage ? existingMessages : [...existingMessages, pending.userMessage];

    setMessages(sourceMessages);
    upsertChatLog(pending.conversationId, sourceMessages, pending.fallbackTitle || pending.userMessage.content);
    void runAssistantReply(
      pending.conversationId,
      sourceMessages,
      pending.fallbackTitle || pending.userMessage.content,
      pending.modelOptionId || selectedModelOptionId,
    );
  }, [
    isChatLogMode,
    workspaceId,
    pendingStorageKey,
    bootstrapped,
    sending,
    activeChatId,
    chatLogs,
    upsertChatLog,
    runAssistantReply,
    selectedModelOptionId,
  ]);

  const copyAssistantMessage = useCallback(async (content: string) => {
    const text = String(content || '').trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Unable to copy');
    }
  }, []);

  const setAssistantFeedback = useCallback(
    (messageId: string, nextFeedback: Exclude<ChatMessageFeedback, null>) => {
      if (!messageId) return;

      setMessages((prev) => {
        const nextMessages = prev.map((entry) => {
          if (entry.id !== messageId || entry.role !== 'assistant') return entry;
          const currentFeedback = toChatMessageFeedback(entry.feedback);
          return {
            ...entry,
            feedback: currentFeedback === nextFeedback ? null : nextFeedback,
          };
        });

        if (activeChatId) {
          setChatLogs((prevLogs) => upsertChatLogs(prevLogs, activeChatId, nextMessages, activeChatTitle));
        }

        return nextMessages;
      });
    },
    [activeChatId, activeChatTitle],
  );

  const onComposerDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onComposerDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onComposerDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const renderComposer = (variant: 'dashboard' | 'chat-log') => {
    const isDashboardVariant = variant === 'dashboard';
    const composerRadius = isDashboardVariant ? 'rounded-[32px]' : 'rounded-[24px]';
    const typedRecommendation = `${dashboardTypewriterPhrases[typewriterPhraseIdx] || ''}...`.slice(
      0,
      typewriterCharCount,
    );
    const showTypewriter = isDashboardVariant && !message.trim() && Boolean(typedRecommendation);

    return (
      <div
        className="relative group/composer cursor-text"
        onDragOver={onComposerDragOver}
        onDragLeave={onComposerDragLeave}
        onDrop={onComposerDrop}
      >
        <div
          className={cn(
            'relative transform-gpu cursor-text',
            composerRadius,
            isDashboardVariant
              ? 'z-20 bg-[#121212] shadow-[0_0_52px_rgba(0,0,0,0.055),0_0_120px_rgba(0,0,0,0.028)]'
              : 'bg-[#1a1a1a] shadow-[0_0_22px_rgba(0,0,0,0.05),0_0_36px_rgba(0,0,0,0.024)]',
          )}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('button')) return;
            textareaRef.current?.focus();
          }}
        >
          <div
            className={cn(
              'pointer-events-none absolute inset-0 border transition-[border-color,opacity] duration-200 ease-out',
              composerRadius,
              isDashboardVariant ? 'border-white/[0.03]' : 'border-white/[0.035]',
              'opacity-45 group-hover/composer:opacity-55 group-focus-within/composer:opacity-55',
              isDashboardVariant
                ? 'group-hover/composer:border-white/[0.065] group-focus-within/composer:border-white/[0.065]'
                : 'group-hover/composer:border-white/[0.075] group-focus-within/composer:border-white/[0.075]',
            )}
          />
          <div className={cn(isDashboardVariant ? 'px-5 pb-4 pt-4 space-y-3' : 'px-4 pb-3.5 pt-3.5 space-y-2.5')}>
            {files.length > 0 || snippets.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {snippets.map((snippet) => (
                  <SnippetCard key={snippet.id} snippet={snippet} onRemove={removeSnippet} />
                ))}
                {files.map((file) => (
                  <AttachmentCard key={file.id} file={file} onRemove={removeFile} />
                ))}
              </div>
            ) : null}

            <div
              className={cn(
                'overflow-y-auto',
                isDashboardVariant ? 'min-h-[48px] max-h-[160px]' : 'min-h-[54px] max-h-[168px]',
              )}
            >
              <div className="relative">
                {showTypewriter ? (
                  <div className="pointer-events-none absolute inset-0 text-[15px] leading-relaxed text-[#9a9a9a]/55">
                    {typedRecommendation}
                    <span className="ml-[1px] inline-block h-[1.05em] w-[1px] align-[-1px] bg-[#8c8c8c]/45 animate-pulse" />
                  </div>
                ) : null}
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onPaste={handlePaste}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder={
                    isChatLogMode
                      ? messages.length > 0
                        ? 'Reply...'
                        : 'Message ACQ AI...'
                      : ''
                  }
                  className={cn(
                    'w-full bg-transparent border-0 outline-none resize-none text-white/90 placeholder:text-white/50',
                    isDashboardVariant ? 'text-[15px] leading-relaxed' : 'text-[15px] leading-[1.5]',
                  )}
                  rows={1}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-0.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'rounded-xl text-white/62 hover:text-white grid place-items-center transition-colors cursor-pointer',
                  isDashboardVariant ? 'h-8 w-8' : 'h-[30px] w-[30px]',
                )}
                aria-label="Attach files"
                title="Attach files"
              >
                <Paperclip
                  className={cn('text-white/90', isDashboardVariant ? 'h-[18px] w-[18px]' : 'h-[17px] w-[17px]')}
                  strokeWidth={2.2}
                />
              </button>

              <div className="flex items-center gap-1.5">
                <DropdownMenu
                  open={modelMenuOpen}
                  onOpenChange={(open) => {
                    setModelMenuOpen(open);
                    if (!open) setHoveredModelOptionId(null);
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        'chat-model-font inline-flex items-center gap-1 rounded-lg px-2.5 text-white/66 transition-colors',
                        'hover:bg-black/45 hover:text-white/84 focus-visible:bg-black/45 focus-visible:text-white/84',
                        modelMenuOpen ? 'bg-black/45 text-white/84' : '',
                        isDashboardVariant ? 'h-8 text-[14px]' : 'h-[30px] text-[13.5px]',
                      )}
                      aria-label="Select AI model"
                      title="Select AI model"
                    >
                      <span>{selectedModelOption.label}</span>
                      <ChevronDown className={cn('h-3.5 w-3.5 text-white/48 transition-transform', modelMenuOpen ? 'rotate-180' : '')} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    className="w-[306px] rounded-2xl border border-white/12 bg-[#090909]/98 p-1.5 shadow-[0_14px_34px_rgba(0,0,0,0.18)] backdrop-blur-md"
                  >
                    <div className="space-y-1">
                      {DASHBOARD_MODEL_OPTIONS.map((option) => {
                        const isSelected = option.id === selectedModelOptionId;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onMouseEnter={() => setHoveredModelOptionId(option.id)}
                            onFocus={() => setHoveredModelOptionId(option.id)}
                            onClick={() => {
                              setSelectedModelOptionId(option.id);
                              setModelMenuOpen(false);
                              setHoveredModelOptionId(null);
                            }}
                            className={cn(
                              'chat-model-font w-full h-9 rounded-xl px-2.5 text-left inline-flex items-center justify-between transition-colors',
                              isSelected ? 'bg-white/[0.08] text-white' : 'text-white/74 hover:bg-black/48 hover:text-white',
                            )}
                          >
                            <span className="text-[13.5px]">{option.label}</span>
                            {isSelected ? <Check className="h-3.5 w-3.5 text-white/82" /> : null}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-1.5 rounded-xl border border-white/10 bg-black/48 px-3 py-2.5">
                      <div className="text-[12.5px] font-normal text-white/90">{modelOptionPreview.label}</div>
                      <p className="mt-1 text-[12px] leading-relaxed text-white/66">{modelOptionPreview.description}</p>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <button
                  type="button"
                  onClick={send}
                  disabled={!canSend}
                  className={cn(
                    'rounded-xl grid place-items-center transition-colors cursor-pointer',
                    isDashboardVariant ? 'h-8 w-8' : 'h-[30px] w-[30px]',
                    canSend
                      ? 'bg-transparent text-white/72 hover:text-white'
                      : 'bg-transparent text-white/10 cursor-not-allowed',
                  )}
                  aria-label="Send message"
                  title="Send message"
                >
                  <Send className="h-[18px] w-[18px]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {isDragging ? (
          <div
            className={cn(
              'pointer-events-none absolute inset-0 border-2 border-dashed border-[#2f5da6] bg-black/70 backdrop-blur-sm grid place-items-center',
              isDashboardVariant ? 'rounded-3xl' : 'rounded-2xl',
            )}
          >
            <div className="inline-flex flex-col items-center gap-2 text-[#bcd3ff]">
              <Archive className="h-8 w-8" />
              <div className="text-sm font-medium">Drop files to attach</div>
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  if (!isChatLogMode) {
    return (
      <div className="relative w-full max-w-[780px] mx-auto">
        {renderComposer('dashboard')}

        <div className="mt-3 flex items-center justify-start">
          <button
            type="button"
            onClick={() => navigate('/dashboard/chat-log')}
            className="show-chat-log-font h-9 rounded-full bg-white/[0.026] px-4 text-[13px] text-white/68 backdrop-blur-lg transition-colors hover:bg-white/[0.045] hover:text-white/86"
          >
            Show chat log
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 w-full bg-[#131313]">
      <div className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
	        <aside className="min-h-0 border-r-[0.5px] border-white/10 bg-[#111111] flex flex-col">
	          <div className="px-4 pt-6 pb-4">
	            <Button
	              type="button"
	              variant="ghost"
	              onClick={() => navigate('/dashboard')}
	              className="-ml-2 rounded-2xl text-white/78 hover:text-white"
	              aria-label="Back to dashboard"
	              title="Back to dashboard"
	            >
	              <ArrowLeft className="h-4 w-4 mr-2" />
	              Back
	            </Button>
	          </div>

          <div className="chatlog-sidebar-light px-4 pt-1 pb-4 space-y-2">
            <button
              type="button"
              onClick={startNewChat}
              className="w-full h-9 rounded-xl text-left text-[14px] font-normal text-white/78 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <span className="inline-flex w-full items-center justify-start gap-2 pl-3">
                <SquarePen className="h-3.5 w-3.5 text-white/64" />
                <span className="font-normal">New chat</span>
              </span>
            </button>
            <button
              type="button"
              onClick={toggleSearchChat}
              className="w-full h-9 rounded-xl text-left text-[14px] font-normal text-white/78 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <span className="inline-flex w-full items-center justify-start gap-2 pl-3">
                <SearchIcon className="h-3.5 w-3.5 text-white/64" />
                <span className="font-normal">Search chat</span>
              </span>
            </button>
            <button
              type="button"
              onClick={toggleStarredFilter}
              className={cn(
                'w-full h-9 rounded-xl text-left text-[14px] font-normal transition-colors',
                showStarredOnly
                  ? 'bg-white/[0.09] text-white'
                  : 'text-white/78 hover:text-white hover:bg-white/[0.06]',
              )}
            >
              <span className="inline-flex w-full items-center justify-start gap-2 pl-3">
                <Star className={cn('h-3.5 w-3.5', showStarredOnly ? 'text-[#f4c76f] fill-[#f4c76f]' : 'text-white/64')} />
                <span className="font-normal">Starred</span>
              </span>
            </button>
            {chatSearchOpen ? (
              <div className="pt-1">
                <input
                  ref={chatSearchInputRef}
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full h-9 rounded-xl border border-white/10 bg-white/[0.02] px-3 text-[13px] text-white/85 placeholder:text-white/35 outline-none focus:border-white/20"
                />
              </div>
            ) : null}
          </div>

          <div className="chatlog-sidebar-light px-4 pt-5 pb-3 text-[13px] font-normal text-white/22">
            <span className="inline-block pl-3">Recents</span>
          </div>
          <div className="chatlog-sidebar-light flex-1 min-h-0 overflow-y-auto space-y-1 px-4 pb-5">
            {visibleChatLogs.length === 0 ? (
              <div className="px-3 py-3 text-sm font-normal text-white/45">
                {chatLogs.length === 0
                  ? 'No previous conversations yet.'
                  : showStarredOnly
                    ? 'No starred chats yet.'
                    : chatSearchQuery.trim()
                      ? 'No chats match your search.'
                      : 'No previous conversations yet.'}
              </div>
            ) : (
              visibleChatLogs.map((log) => (
                <div
                  key={log.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openChatLog(log.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openChatLog(log.id);
                    }
                  }}
                  className={cn(
                    'w-full text-left rounded-xl pl-0 pr-2 py-2 font-normal transition-colors flex items-center gap-2 cursor-pointer',
                    activeChatId === log.id ? 'bg-white/10 text-white' : 'text-white/82 hover:bg-[#171717]',
                  )}
                >
                  <div className="min-w-0 flex-1 text-[13px] font-normal leading-tight truncate text-white/78 pl-3">
                    <span className="truncate block">{log.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStarChat(log.id);
                    }}
                    className="h-6 w-6 rounded-md inline-flex items-center justify-center hover:bg-white/[0.08] transition-colors"
                    aria-label={log.starred ? 'Unstar chat' : 'Star chat'}
                    title={log.starred ? 'Unstar' : 'Star'}
                  >
                    <Star
                      className={cn(
                        'h-3.5 w-3.5',
                        log.starred ? 'text-[#f4c76f] fill-[#f4c76f]' : 'text-white/22',
                      )}
                    />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        <section className="min-h-0 flex flex-col bg-[#131313]">
          <div className="h-14 px-4 md:px-6 flex items-center gap-2">
            <div className="truncate text-[14px] text-white/75">{activeChatTitle}</div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-7 w-7 rounded-md text-white/55 hover:text-white hover:bg-white/[0.05] transition-colors inline-flex items-center justify-center"
                  aria-label="Chat actions"
                  title="Chat actions"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44 rounded-xl">
                <DropdownMenuItem onClick={() => toggleStarChat(activeChatId)}>
                  <Star className="h-4 w-4 mr-2" />
                  {activeChat?.starred ? 'Unstar' : 'Star'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openRenameChat(activeChatId)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openDeleteChat(activeChatId)} className="text-red-400 focus:text-red-300">
                  <Trash2 className="h-4 w-4 mr-2 text-red-400" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="relative flex-1 min-h-0 bg-[#131313]">
            <div ref={historyRef} className="h-full overflow-y-auto px-3 md:px-8 lg:px-12 pt-5 pb-[248px] md:pb-[264px] space-y-1">
              <div className={cn(chatLogRailClass, chatLogContentInsetClass)}>
                {messages.length === 0 ? (
                  <div className="text-sm text-white/42 px-1 py-2">Select a chat log or start a new chat.</div>
                ) : (
                  messages.map((m, idx) => {
                    const prevRole = idx > 0 ? messages[idx - 1]?.role : null;
                    const isAssistantTyping = typingAssistantId === m.id && typingAssistantChars < m.content.length;
                    const messageFeedback = toChatMessageFeedback(m.feedback);
                    const imageAttachments = (m.attachments || []).filter(
                      (attachment) => attachment.kind === 'image' && attachment.previewUrl,
                    );
                    const fileAttachments = (m.attachments || []).filter(
                      (attachment) => attachment.kind === 'file' && attachment.name,
                    );
                    const snippetAttachments = (m.attachments || []).filter(
                      (attachment) => attachment.kind === 'snippet' && attachment.text,
                    );
                    return (
                    <div
                      key={m.id}
                      className={cn(
                        'flex w-full',
                        m.role === 'user' ? 'justify-end' : 'justify-start',
                        idx === 0
                          ? 'mt-0'
                          : prevRole !== m.role
                            ? m.role === 'user'
                              ? 'mt-14'
                              : 'mt-12'
                            : 'mt-1.5',
                      )}
                    >
                      {m.role === 'assistant' ? (
                        <div className="group/assistant max-w-[92%] md:max-w-[84%] py-0.5">
                          {isAssistantTyping ? (
                            <div className="text-[15px] leading-[1.56] whitespace-pre-wrap text-white/86">
                              {m.content.slice(0, typingAssistantChars)}
                              <span className="ml-[1px] inline-block h-[1.05em] w-[1px] align-[-2px] bg-white/45 animate-pulse" />
                            </div>
                          ) : (
                            <div>{renderAssistantContent(m.content)}</div>
                          )}
                          {!isAssistantTyping ? (
                            <div className="mt-4 flex items-center gap-1.5 opacity-0 pointer-events-none translate-y-0.5 transition-all duration-150 group-hover/assistant:opacity-100 group-hover/assistant:pointer-events-auto group-hover/assistant:translate-y-0">
                              <button
                                type="button"
                                onClick={() => copyAssistantMessage(m.content)}
                                className="h-8 w-8 rounded-md inline-flex items-center justify-center text-white/72 hover:text-white hover:bg-white/[0.055] transition-colors"
                                aria-label="Copy message"
                                title="Copy"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setAssistantFeedback(m.id, 'like')}
                                className={cn(
                                  'h-8 w-8 rounded-md inline-flex items-center justify-center transition-colors',
                                  messageFeedback === 'like'
                                    ? 'text-white bg-white/[0.08]'
                                    : 'text-white/72 hover:text-white hover:bg-white/[0.055]',
                                )}
                                aria-label="Like response"
                                title="Like"
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setAssistantFeedback(m.id, 'dislike')}
                                className={cn(
                                  'h-8 w-8 rounded-md inline-flex items-center justify-center transition-colors',
                                  messageFeedback === 'dislike'
                                    ? 'text-white bg-white/[0.08]'
                                    : 'text-white/72 hover:text-white hover:bg-white/[0.055]',
                                )}
                                aria-label="Dislike response"
                                title="Dislike"
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-2.5 w-fit max-w-[68%] md:max-w-[60%] lg:max-w-[56%]">
                          {imageAttachments.length > 0 ? (
                            <div
                              className={cn(
                                'grid gap-2',
                                imageAttachments.length === 1
                                  ? 'grid-cols-1'
                                  : imageAttachments.length <= 4
                                    ? 'grid-cols-2'
                                    : 'grid-cols-3',
                              )}
                            >
                              {imageAttachments.map((attachment) => (
                                <div
                                  key={attachment.id}
                                  className="overflow-hidden rounded-[14px] border border-white/10 bg-black/35"
                                >
                                  <img
                                    src={attachment.previewUrl || ''}
                                    alt={attachment.name || 'Attachment'}
                                    className="h-[92px] w-[92px] sm:h-[108px] sm:w-[108px] md:h-[124px] md:w-[124px] object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          ) : null}

                          {fileAttachments.length > 0 ? (
                            <div className="flex flex-col items-end gap-2 w-full">
                              {fileAttachments.map((attachment) => (
                                <div
                                  key={attachment.id}
                                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0f0f0f] px-3 py-2 text-[12px] text-white/78"
                                >
                                  <FileText className="h-3.5 w-3.5 text-white/60" />
                                  <span className="max-w-[180px] truncate">{attachment.name}</span>
                                </div>
                              ))}
                            </div>
                          ) : null}

                          {snippetAttachments.length > 0 ? (
                            <div className="flex flex-col items-end gap-2 w-full">
                              {snippetAttachments.map((attachment) => (
                                <div
                                  key={attachment.id}
                                  className="max-w-[320px] rounded-xl border border-white/10 bg-[#0f0f0f] px-3 py-2 text-[12px] leading-relaxed text-white/72 line-clamp-3"
                                >
                                  {attachment.text}
                                </div>
                              ))}
                            </div>
                          ) : null}

                          <div className="inline-flex items-center w-fit rounded-[20px] px-5 py-3 text-[15px] leading-[1.34] whitespace-pre-wrap break-words bg-[#0f0f0f] text-white">
                            {m.content}
                          </div>
                        </div>
                      )}
                    </div>
                    );
                  })
                )}

                {sending ? (
                  <div className="flex justify-start">
                    <div className="px-1 py-1 text-[13px] font-medium tracking-[0.01em]">
                      <span className="acq-thinking-shimmer">Thinking for a strong answer</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-[156px] bg-[#131313] pointer-events-none z-10" />
            <div className="absolute inset-x-0 bottom-9 md:bottom-10 px-3 md:px-8 lg:px-12 z-20">
              <div className={chatLogRailClass}>{renderComposer('chat-log')}</div>
            </div>
          </div>
        </section>
      </div>

      <Dialog open={renameDialogOpen} onOpenChange={closeRenameDialog}>
        <DialogContent className="max-w-sm rounded-2xl border border-white/10 bg-[#111111]">
          <DialogHeader>
            <DialogTitle>Rename chat</DialogTitle>
          </DialogHeader>
          <input
            value={renameDraft}
            onChange={(e) => setRenameDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submitRenameChat();
              }
            }}
            placeholder="Enter chat name"
            className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-white/88 placeholder:text-white/35 outline-none focus:border-white/20"
          />
          <DialogFooter className="gap-2 sm:gap-2">
            <button
              type="button"
              onClick={() => closeRenameDialog(false)}
              className="h-9 px-4 rounded-xl border border-white/12 bg-transparent text-sm text-white/70 hover:text-white hover:bg-white/[0.03] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitRenameChat}
              disabled={!renameDraft.trim()}
              className="h-9 px-4 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setDeleteTargetId('');
        }}
      >
        <AlertDialogContent className="max-w-sm rounded-2xl border border-white/10 bg-[#111111]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this chat log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-white/12 bg-transparent text-white/70 hover:bg-white/[0.03] hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteChat}
              className="rounded-xl border-0 bg-[#dc2626] text-white hover:bg-[#b91c1c]"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}

export default DashboardClaudeChat;
