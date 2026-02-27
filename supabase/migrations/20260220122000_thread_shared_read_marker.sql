-- Global inbox read marker on each thread (shared across owner + setters).

ALTER TABLE public.instagram_threads
  ADD COLUMN IF NOT EXISTS shared_last_read_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_instagram_threads_workspace_shared_last_read_at
  ON public.instagram_threads(workspace_id, shared_last_read_at DESC);

-- Backfill from existing per-user read rows so current read state is preserved.
UPDATE public.instagram_threads t
SET shared_last_read_at = src.max_last_read_at
FROM (
  SELECT workspace_id, conversation_id, MAX(last_read_at) AS max_last_read_at
  FROM public.instagram_thread_reads
  GROUP BY workspace_id, conversation_id
) src
WHERE t.workspace_id = src.workspace_id
  AND t.conversation_id = src.conversation_id
  AND (
    t.shared_last_read_at IS NULL
    OR src.max_last_read_at > t.shared_last_read_at
  );

CREATE OR REPLACE FUNCTION public.instagram_threads_keep_shared_last_read_at_monotonic()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.shared_last_read_at IS NULL THEN
    RETURN NEW;
  END IF;

  IF OLD.shared_last_read_at IS NOT NULL AND NEW.shared_last_read_at < OLD.shared_last_read_at THEN
    NEW.shared_last_read_at := OLD.shared_last_read_at;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS keep_instagram_threads_shared_last_read_at_monotonic ON public.instagram_threads;
CREATE TRIGGER keep_instagram_threads_shared_last_read_at_monotonic
  BEFORE UPDATE ON public.instagram_threads
  FOR EACH ROW
  EXECUTE FUNCTION public.instagram_threads_keep_shared_last_read_at_monotonic();
