import * as React from "react";
import {
  Archive as ArchiveIcon,
  AlertCircle as AlertCircleIcon,
  AlertTriangle as AlertTriangleIcon,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  ArrowUp as ArrowUpIcon,
  BarChart3 as BarChart3Icon,
  Briefcase as BriefcaseIcon,
  Calendar as CalendarIconBase,
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  CheckCircle2 as CheckCircle2Icon,
  CheckSquare as CheckSquareIcon,
  ChevronDown as ChevronDownIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ChevronUp as ChevronUpIcon,
  ChevronsUpDown as ChevronsUpDownIcon,
  Circle as CircleIcon,
  Clock as ClockIcon,
  Copy as CopyIcon,
  Dot as DotIcon,
  Download as DownloadIcon,
  ExternalLink as ExternalLinkIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  File as FileIcon,
  FileSpreadsheet as FileSpreadsheetIcon,
  FileText as FileTextIcon,
  FileVideo as FileVideoIcon,
  Filter as FilterIcon,
  Folder as FolderIcon,
  FolderPlus as FolderPlusIcon,
  GripVertical as GripVerticalIcon,
  HelpCircle as HelpCircleIcon,
  Home as HomeIcon,
  Inbox as InboxIcon,
  Image as ImageIcon,
  Layers as LayersIcon,
  LayoutDashboard as LayoutDashboardIcon,
  Loader2 as Loader2Icon,
  Lock as LockIcon,
  LogOut as LogOutIcon,
  Link2 as Link2Icon,
  Mail as MailIcon,
  MapPin as MapPinIcon,
  MessageCircle as MessageCircleIcon,
  MessageSquare as MessageSquareIcon,
  MoreHorizontal as MoreHorizontalIcon,
  MoreVertical as MoreVerticalIcon,
  Palette as PaletteIcon,
  PanelLeft as PanelLeftIcon,
  Paperclip as PaperclipIcon,
  PlayCircle as PlayCircleIcon,
  Plus as PlusIcon,
  Pencil as PencilIcon,
  RefreshCw as RefreshCwIcon,
  RotateCcw as RotateCcwIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  Send as SendIcon,
  Settings as SettingsIcon,
  SlidersHorizontal as SlidersHorizontalIcon,
  Star as StarIcon,
  Shield as ShieldIcon,
  ShieldX as ShieldXIcon,
  ArrowUpFromDot as SparklesIcon,
  Target as TargetIcon,
  ThumbsDown as ThumbsDownIcon,
  ThumbsUp as ThumbsUpIcon,
  Trash2 as Trash2Icon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  Upload as UploadIcon,
  UserRound as UserIcon,
  UserRoundCog as UserCogIcon,
  UserRoundPlus as UserPlusIcon,
  UserRoundX as UserRoundXIcon,
  UsersRound as UsersIcon,
  Video as VideoIcon,
  SquarePen as SquarePenIcon,
  X as XIcon,
  XCircle as XCircleIcon,
  Youtube as YoutubeIcon,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { streamlineIconRawByKey } from "@/components/ui/streamline-icon-raw.generated";

const sizeMap: Record<string, number> = {
  "3": 12,
  "3.5": 14,
  "4": 16,
  "5": 20,
  "6": 24,
  "7": 28,
  "8": 32,
  "9": 36,
  "10": 40,
  "12": 48,
  "14": 56,
  "16": 64,
};

const getSizeFromClassName = (className?: string) => {
  if (!className) return undefined;
  const match = className.match(/(?:^|\s)w-([0-9.]+)/);
  if (!match) return undefined;
  return sizeMap[match[1]];
};

type StreamlineSpec = {
  viewBox: string;
  innerSvg: string;
};

const streamlineSpecCache = new Map<string, StreamlineSpec | null>();

const toKebabCase = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .toLowerCase();

const streamlineAliasByKey: Record<string, string[]> = {
  search: ["magnifying-glass"],
  settings: ["cog"],
  "settings-2": ["vertical-slider-2"],
  inbox: ["inbox"],
  layers: ["layers-1"],
  filter: ["filter-2"],
  calendar: ["calendar-mark"],
  "external-link": ["arrow-diagonal-2", "share-link"],
  "refresh-cw": ["arrow-reload-horizontal-2"],
  "link-2": ["link-chain", "link-share-2"],
  paperclip: ["paperclip-2"],
  trash2: ["recycle-bin-2"],
  "trash-2": ["recycle-bin-2"],
  download: ["download-square"],
  check: ["check"],
  star: ["star-2"],
  "thumbs-up": ["like-1"],
  "user-plus": ["user-add-plus"],
  users: ["user-multiple-circle"],
  lock: ["padlock-square-1", "padlock-square-2"],
  mail: ["forward-email", "mail-send-email-message"],
  send: ["mail-send-email-message"],
  video: ["webcam-video", "video-subtitles"],
  upload: ["arrow-up-large-2"],
  "message-square": ["align-left-1"],
  "bar-chart-3": ["pie-chart", "graph-arrow-user-increase"],
};

const getStreamlineSpec = (streamlineKey: string): StreamlineSpec | null => {
  const key = streamlineKey.trim().toLowerCase();
  if (!key) return null;

  if (streamlineSpecCache.has(key)) {
    return streamlineSpecCache.get(key) ?? null;
  }

  const raw = streamlineIconRawByKey[key];
  if (!raw) {
    streamlineSpecCache.set(key, null);
    return null;
  }

  const viewBoxMatch = raw.match(/viewBox=['"]([^'"]+)['"]/i);
  const viewBox = viewBoxMatch?.[1] ?? "0 0 24 24";

  const innerSvg = raw
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .replace(/^[\s\S]*?<svg[^>]*>/i, "")
    .replace(/<\/svg>\s*$/i, "")
    .replace(/\sstyle=['"][^'"]*['"]/gi, "")
    .replace(/\scolor=['"][^'"]*['"]/gi, "")
    .replace(/\sstroke=['"](?!none)[^'"]*['"]/gi, ' stroke="currentColor"')
    .replace(/\sfill=['"](?!none)[^'"]*['"]/gi, ' fill="none"');

  const spec = { viewBox, innerSvg };
  streamlineSpecCache.set(key, spec);
  return spec;
};

// NOTE: fractional stroke widths tend to look like "double lines" at low opacity due to antialiasing.
// Keep this an integer so icons stay crisp across the app.
const createIcon = (
  Icon: LucideIcon,
  fallbackSize = 20,
  strokeWidth = 2,
  streamlineKeyOverride?: string | string[],
) => {
  const Wrapped = React.forwardRef<SVGSVGElement, LucideProps & { className?: string }>(
    ({ className, size, strokeWidth: strokeOverride, ...props }, ref) => {
      const resolvedSize = size ?? getSizeFromClassName(className) ?? fallbackSize;
      const derivedKey = streamlineKeyOverride || toKebabCase(Icon.displayName || Icon.name || "");
      const explicitKeys = Array.isArray(derivedKey) ? derivedKey : [derivedKey];
      const candidateKeys = [
        ...explicitKeys,
        ...explicitKeys.flatMap((key) => streamlineAliasByKey[key] || []),
      ].filter(Boolean);
      const streamlineSpec = candidateKeys.map((key) => getStreamlineSpec(key)).find(Boolean) || null;

      if (streamlineSpec) {
        return (
          <svg
            ref={ref}
            xmlns="http://www.w3.org/2000/svg"
            viewBox={streamlineSpec.viewBox}
            width={resolvedSize}
            height={resolvedSize}
            fill="none"
            className={cn("icon-crisp", className)}
            dangerouslySetInnerHTML={{ __html: streamlineSpec.innerSvg }}
            {...props}
          />
        );
      }

      return (
        <Icon
          ref={ref}
          size={resolvedSize}
          strokeWidth={strokeOverride ?? strokeWidth}
          className={cn("lucide-icon icon-crisp", className)}
          {...props}
        />
      );
    },
  );

  Wrapped.displayName = "Icon";
  return Wrapped;
};

export const AlertCircle = createIcon(AlertCircleIcon);
export const AlertTriangle = createIcon(AlertTriangleIcon);
export const Archive = createIcon(ArchiveIcon);
export const ArrowLeft = createIcon(ArrowLeftIcon);
export const ArrowRight = createIcon(ArrowRightIcon);
export const ArrowUp = createIcon(ArrowUpIcon);
export const BarChart3 = createIcon(BarChart3Icon);
export const Briefcase = createIcon(BriefcaseIcon);
export const CalendarIcon = createIcon(CalendarIconBase, 20, 2, "calendar");
export const Calendar = createIcon(CalendarIconBase, 20, 2, "calendar");
export const Check = createIcon(CheckIcon);
export const CheckCircle = createIcon(CheckCircleIcon);
export const CheckCircle2 = createIcon(CheckCircle2Icon);
export const CheckSquare = createIcon(CheckSquareIcon);
export const ChevronDown = createIcon(ChevronDownIcon);
export const ChevronLeft = createIcon(ChevronLeftIcon);
export const ChevronRight = createIcon(ChevronRightIcon);
export const ChevronUp = createIcon(ChevronUpIcon);
export const ChevronsUpDown = createIcon(ChevronsUpDownIcon);
export const Circle = createIcon(CircleIcon);
export const Clock = createIcon(ClockIcon);
export const Copy = createIcon(CopyIcon);
export const Dot = createIcon(DotIcon);
export const Download = createIcon(DownloadIcon, 20, 2, "download-square");
export const ExternalLink = createIcon(ExternalLinkIcon);
export const Eye = createIcon(EyeIcon);
export const EyeOff = createIcon(EyeOffIcon);
export const File = createIcon(FileIcon);
export const FileSpreadsheet = createIcon(FileSpreadsheetIcon);
export const FileText = createIcon(FileTextIcon);
export const FileVideo = createIcon(FileVideoIcon);
export const Filter = createIcon(FilterIcon);
export const Folder = createIcon(FolderIcon);
export const FolderPlus = createIcon(FolderPlusIcon);
export const GripVertical = createIcon(GripVerticalIcon);
export const HelpCircle = createIcon(HelpCircleIcon);
export const Home = createIcon(HomeIcon);
export const Inbox = createIcon(InboxIcon);
export const Image = createIcon(ImageIcon);
export const Layers = createIcon(LayersIcon);
export const LayoutDashboard = createIcon(LayoutDashboardIcon);
export const Loader2 = createIcon(Loader2Icon);
export const Lock = createIcon(LockIcon);
export const LogOut = createIcon(LogOutIcon);
export const Link2 = createIcon(Link2Icon);
export const LinkChain = createIcon(Link2Icon, 20, 2, "link-chain");
export const Mail = createIcon(MailIcon);
export const MapPin = createIcon(MapPinIcon);
export const MessageCircle = createIcon(MessageCircleIcon);
export const MessageSquare = createIcon(MessageSquareIcon);
export const MoreHorizontal = createIcon(MoreHorizontalIcon);
export const MoreVertical = createIcon(MoreVerticalIcon);
export const HorizontalMenuSquare = createIcon(MoreHorizontalIcon, 20, 2, "horizontal-menu-square");
export const Palette = createIcon(PaletteIcon);
export const PanelLeft = createIcon(PanelLeftIcon);
export const Paperclip = createIcon(PaperclipIcon);
export const PlayCircle = createIcon(PlayCircleIcon);
export const Plus = createIcon(PlusIcon);
export const Pencil = createIcon(PencilIcon);
export const RefreshCw = createIcon(RefreshCwIcon);
export const RotateCcw = createIcon(RotateCcwIcon);
export const Save = createIcon(SaveIcon);
export const Search = createIcon(SearchIcon);
export const Send = createIcon(SendIcon, 20, 2, "mail-send-email-message");
export const Settings = createIcon(SettingsIcon);
export const Settings2 = createIcon(SlidersHorizontalIcon, 20, 2, "settings-2");
export const Star = createIcon(StarIcon);
export const Shield = createIcon(ShieldIcon);
export const Shield2 = createIcon(ShieldIcon, 20, 2, "shield-2");
export const ShieldX = createIcon(ShieldXIcon);
export const Sparkles = createIcon(SparklesIcon, 20, 2, "sparkles");
export const Target = createIcon(TargetIcon);
export const SignalFull = createIcon(TargetIcon, 20, 2, "signal-full");
export const ThumbsDown = createIcon(ThumbsDownIcon);
export const ThumbsUp = createIcon(ThumbsUpIcon);
export const Trash2 = createIcon(Trash2Icon);
export const TrendingDown = createIcon(TrendingDownIcon);
export const TrendingUp = createIcon(TrendingUpIcon);
export const Upload = createIcon(UploadIcon);
export const User = createIcon(UserIcon, 20, 2, "user");
export const UserCog = createIcon(UserCogIcon, 20, 2, "user-cog");
export const UserPlus = createIcon(UserPlusIcon, 20, 2, "user-plus");
export const UserRoundX = createIcon(UserRoundXIcon);
export const Users = createIcon(UsersIcon, 20, 2, "users");
export const UserWorkLaptopWifi = createIcon(UsersIcon, 20, 2, "user-work-laptop-wifi");
export const Video = createIcon(VideoIcon);
export const SquarePen = createIcon(SquarePenIcon, 20, 2, "chat-bubble-square-write");
export const PlayList1 = createIcon(LayersIcon, 20, 2, "play-list-1");
export const Script1 = createIcon(FileTextIcon, 20, 2, "script-1");
export const Like1 = createIcon(ThumbsUpIcon, 20, 2, "like-1");
export const ZipFile = createIcon(FileIcon, 20, 2, "zip-file");
export const CleanBroomWipe = createIcon(CheckSquareIcon, 20, 2, "clean-broom-wipe");
export const X = createIcon(XIcon);
export const XCircle = createIcon(XCircleIcon);
export const Youtube = createIcon(YoutubeIcon);
