-- Ensure outbound Instagram replies mark threads as read for shared inbox logic.

CREATE OR REPLACE FUNCTION public.instagram_messages_mark_thread_read_on_outbound()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_direction TEXT;
  v_conversation_id TEXT;
  v_message_at TIMESTAMP WITH TIME ZONE;
BEGIN
  v_direction := CASE
    WHEN NEW.direction IN ('inbound', 'outbound') THEN NEW.direction
    WHEN NEW.sender_id IS NOT NULL
      AND NEW.instagram_account_id IS NOT NULL
      AND NEW.sender_id::text = NEW.instagram_account_id::text
      THEN 'outbound'
    WHEN NEW.instagram_account_id IS NOT NULL
      AND COALESCE(
        NULLIF(btrim(NEW.raw_payload -> 'from' ->> 'id'), ''),
        NULLIF(btrim(NEW.raw_payload -> 'sender' ->> 'id'), '')
      ) = NEW.instagram_account_id::text
      THEN 'outbound'
    WHEN NEW.recipient_id IS NOT NULL
      AND NEW.instagram_account_id IS NOT NULL
      AND NEW.recipient_id::text = NEW.instagram_account_id::text
      THEN 'inbound'
    WHEN NEW.instagram_account_id IS NOT NULL
      AND COALESCE(
        NULLIF(btrim(NEW.raw_payload -> 'recipient' ->> 'id'), ''),
        NULLIF(btrim(NEW.raw_payload -> 'to' ->> 'id'), '')
      ) = NEW.instagram_account_id::text
      THEN 'inbound'
    WHEN NEW.instagram_account_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM jsonb_array_elements(COALESCE(NEW.raw_payload -> 'to' -> 'data', '[]'::jsonb)) to_item
        WHERE NULLIF(btrim(to_item ->> 'id'), '') = NEW.instagram_account_id::text
      )
      THEN 'inbound'
    ELSE NULL
  END;

  IF v_direction IS DISTINCT FROM 'outbound' THEN
    RETURN NEW;
  END IF;

  v_conversation_id := public.instagram_message_conversation_key(
    NEW.instagram_account_id::text,
    NEW.instagram_user_id::text,
    NEW.raw_payload
  );
  IF v_conversation_id IS NULL OR btrim(v_conversation_id) = '' THEN
    RETURN NEW;
  END IF;

  v_message_at := COALESCE(NEW.message_timestamp, NEW.created_at, now());

  UPDATE public.instagram_threads t
  SET
    shared_last_read_at = CASE
      WHEN t.shared_last_read_at IS NULL OR v_message_at > t.shared_last_read_at THEN v_message_at
      ELSE t.shared_last_read_at
    END,
    last_outbound_at = CASE
      WHEN t.last_outbound_at IS NULL OR v_message_at > t.last_outbound_at THEN v_message_at
      ELSE t.last_outbound_at
    END
  WHERE t.workspace_id = NEW.workspace_id
    AND t.conversation_id = v_conversation_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS mark_instagram_threads_read_on_outbound_message ON public.instagram_messages;
CREATE TRIGGER mark_instagram_threads_read_on_outbound_message
  AFTER INSERT OR UPDATE OF direction, message_timestamp, sender_id, recipient_id, instagram_account_id, instagram_user_id, raw_payload
  ON public.instagram_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.instagram_messages_mark_thread_read_on_outbound();

-- Backfill shared read markers from existing outbound messages.
WITH outbound_by_conversation AS (
  SELECT
    m.workspace_id,
    public.instagram_message_conversation_key(
      m.instagram_account_id::text,
      m.instagram_user_id::text,
      m.raw_payload
    ) AS conversation_id,
    MAX(COALESCE(m.message_timestamp, m.created_at)) AS max_outbound_at
  FROM public.instagram_messages m
  WHERE (
    m.direction = 'outbound'
    OR (
      m.sender_id IS NOT NULL
      AND m.instagram_account_id IS NOT NULL
      AND m.sender_id::text = m.instagram_account_id::text
    )
    OR (
      m.instagram_account_id IS NOT NULL
      AND COALESCE(
        NULLIF(btrim(m.raw_payload -> 'from' ->> 'id'), ''),
        NULLIF(btrim(m.raw_payload -> 'sender' ->> 'id'), '')
      ) = m.instagram_account_id::text
    )
  )
  GROUP BY 1, 2
)
UPDATE public.instagram_threads t
SET
  shared_last_read_at = CASE
    WHEN t.shared_last_read_at IS NULL OR src.max_outbound_at > t.shared_last_read_at THEN src.max_outbound_at
    ELSE t.shared_last_read_at
  END,
  last_outbound_at = CASE
    WHEN t.last_outbound_at IS NULL OR src.max_outbound_at > t.last_outbound_at THEN src.max_outbound_at
    ELSE t.last_outbound_at
  END
FROM outbound_by_conversation src
WHERE src.conversation_id IS NOT NULL
  AND t.workspace_id = src.workspace_id
  AND t.conversation_id = src.conversation_id
  AND (
    t.shared_last_read_at IS NULL
    OR src.max_outbound_at > t.shared_last_read_at
    OR t.last_outbound_at IS NULL
    OR src.max_outbound_at > t.last_outbound_at
  );
