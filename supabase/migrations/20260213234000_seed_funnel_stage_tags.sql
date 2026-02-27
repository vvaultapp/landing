-- Seed funnel-stage tags (position in funnel) for inbox/leads.
-- Excludes Lost/Deposit by design.

INSERT INTO public.instagram_tags (workspace_id, name, color, icon, prompt)
SELECT t.workspace_id, 'New lead', '#ec4899', 'user-plus',
       'Brand new inbound lead that has not been worked yet.'
FROM (
  SELECT DISTINCT workspace_id
  FROM public.instagram_threads
) AS t
WHERE NOT EXISTS (
  SELECT 1
  FROM public.instagram_tags x
  WHERE x.workspace_id = t.workspace_id
    AND lower(x.name) = 'new lead'
);

INSERT INTO public.instagram_tags (workspace_id, name, color, icon, prompt)
SELECT t.workspace_id, 'In contact', '#6366f1', 'message-circle',
       'You have started a conversation with this lead.'
FROM (
  SELECT DISTINCT workspace_id
  FROM public.instagram_threads
) AS t
WHERE NOT EXISTS (
  SELECT 1
  FROM public.instagram_tags x
  WHERE x.workspace_id = t.workspace_id
    AND lower(x.name) = 'in contact'
);

INSERT INTO public.instagram_tags (workspace_id, name, color, icon, prompt)
SELECT t.workspace_id, 'Qualified', '#f59e0b', 'star',
       'Lead is a fit and has buying intent.'
FROM (
  SELECT DISTINCT workspace_id
  FROM public.instagram_threads
) AS t
WHERE NOT EXISTS (
  SELECT 1
  FROM public.instagram_tags x
  WHERE x.workspace_id = t.workspace_id
    AND lower(x.name) = 'qualified'
);

INSERT INTO public.instagram_tags (workspace_id, name, color, icon, prompt)
SELECT t.workspace_id, 'Unqualified', '#ef4444', 'x-circle',
       'Lead is not a fit or has been disqualified.'
FROM (
  SELECT DISTINCT workspace_id
  FROM public.instagram_threads
) AS t
WHERE NOT EXISTS (
  SELECT 1
  FROM public.instagram_tags x
  WHERE x.workspace_id = t.workspace_id
    AND lower(x.name) = 'unqualified'
);

INSERT INTO public.instagram_tags (workspace_id, name, color, icon, prompt)
SELECT t.workspace_id, 'Call booked', '#9ca3af', 'phone-call',
       'A call has been booked with this lead.'
FROM (
  SELECT DISTINCT workspace_id
  FROM public.instagram_threads
) AS t
WHERE NOT EXISTS (
  SELECT 1
  FROM public.instagram_tags x
  WHERE x.workspace_id = t.workspace_id
    AND lower(x.name) = 'call booked'
);

INSERT INTO public.instagram_tags (workspace_id, name, color, icon, prompt)
SELECT t.workspace_id, 'Won', '#10b981', 'trophy',
       'Lead converted successfully.'
FROM (
  SELECT DISTINCT workspace_id
  FROM public.instagram_threads
) AS t
WHERE NOT EXISTS (
  SELECT 1
  FROM public.instagram_tags x
  WHERE x.workspace_id = t.workspace_id
    AND lower(x.name) = 'won'
);

INSERT INTO public.instagram_tags (workspace_id, name, color, icon, prompt)
SELECT t.workspace_id, 'No show', '#f97316', 'user-round-x',
       'Lead did not show up to the scheduled call.'
FROM (
  SELECT DISTINCT workspace_id
  FROM public.instagram_threads
) AS t
WHERE NOT EXISTS (
  SELECT 1
  FROM public.instagram_tags x
  WHERE x.workspace_id = t.workspace_id
    AND lower(x.name) = 'no show'
);

