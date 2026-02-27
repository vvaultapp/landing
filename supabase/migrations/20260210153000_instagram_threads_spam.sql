-- Add spam flag to Instagram threads (Inbox "Spam" view)

ALTER TABLE public.instagram_threads
  ADD COLUMN IF NOT EXISTS is_spam BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_instagram_threads_spam
  ON public.instagram_threads(workspace_id, is_spam);

