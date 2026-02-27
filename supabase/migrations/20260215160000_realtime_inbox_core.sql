-- Ensure inbox core tables emit realtime events for postgres_changes subscriptions.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'instagram_threads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.instagram_threads;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'instagram_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.instagram_messages;
  END IF;
END
$$;

