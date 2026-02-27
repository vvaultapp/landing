-- Inbox "Book Call" per lead:
-- - store a workspace-wide booking URL
-- - cache a per-thread tracked booking link slug

ALTER TABLE public.workspaces
  ADD COLUMN IF NOT EXISTS booking_url TEXT;

ALTER TABLE public.instagram_threads
  ADD COLUMN IF NOT EXISTS booking_link_slug TEXT;

