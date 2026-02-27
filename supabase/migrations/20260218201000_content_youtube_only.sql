-- Content 2.1 (YouTube-only Command Center):
-- - Remove Instagram ROI artifacts from Content 2.0
-- - Restrict content_ctas to YouTube videos only

-- Remove any Instagram CTA mappings (no longer supported).
DELETE FROM public.content_ctas
WHERE source_type = 'instagram';

-- Drop manual Instagram sources table (no longer used).
DROP TABLE IF EXISTS public.instagram_content_items;

-- Restrict CTA mappings to YouTube videos only.
ALTER TABLE public.content_ctas
  DROP CONSTRAINT IF EXISTS content_ctas_source_type_check;

ALTER TABLE public.content_ctas
  ADD CONSTRAINT content_ctas_source_type_check
  CHECK (source_type IN ('youtube_video'));

