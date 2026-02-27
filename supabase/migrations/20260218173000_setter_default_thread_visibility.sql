-- Restore setter dashboard access:
-- By default, non-private Instagram threads should be visible to setters.
-- Private leads are handled via `hidden_from_setters = true`.

ALTER TABLE public.instagram_threads
  ALTER COLUMN shared_with_setters SET DEFAULT TRUE;

-- Backfill existing rows so setters can see the coach inbox again.
UPDATE public.instagram_threads
SET shared_with_setters = TRUE
WHERE COALESCE(hidden_from_setters, FALSE) = FALSE
  AND COALESCE(shared_with_setters, FALSE) = FALSE;

-- Safety: private threads should never be shared with setters.
UPDATE public.instagram_threads
SET shared_with_setters = FALSE
WHERE COALESCE(hidden_from_setters, FALSE) = TRUE
  AND COALESCE(shared_with_setters, FALSE) = TRUE;

