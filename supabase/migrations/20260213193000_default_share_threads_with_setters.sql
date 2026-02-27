-- By default, new Instagram threads should be visible to appointment setters.
-- Owners can still make a lead private via `hidden_from_setters` in the UI.

ALTER TABLE public.instagram_threads
  ALTER COLUMN shared_with_setters SET DEFAULT TRUE;

-- Backfill: make existing non-private, unassigned threads visible to setters.
UPDATE public.instagram_threads
SET
  shared_with_setters = TRUE,
  updated_at = now()
WHERE COALESCE(shared_with_setters, FALSE) = FALSE
  AND COALESCE(hidden_from_setters, FALSE) = FALSE
  AND assigned_user_id IS NULL;

