-- Ensure inbox tag tables emit realtime events for postgres_changes subscriptions.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'instagram_conversation_tags'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.instagram_conversation_tags;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'instagram_tags'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.instagram_tags;
  END IF;
END
$$;

