-- Add explicit deny policies for email_verifications table (defense-in-depth)
-- Only edge functions using service role should be able to INSERT/UPDATE/DELETE

CREATE POLICY "Deny client token creation"
ON public.email_verifications FOR INSERT
WITH CHECK (false);

CREATE POLICY "Deny client token updates"
ON public.email_verifications FOR UPDATE
USING (false);

CREATE POLICY "Deny client token deletion"
ON public.email_verifications FOR DELETE
USING (false);

-- Add explicit deny policies for password_resets table (defense-in-depth)
-- Only edge functions using service role should be able to INSERT/UPDATE/DELETE

CREATE POLICY "Deny client reset creation"
ON public.password_resets FOR INSERT
WITH CHECK (false);

CREATE POLICY "Deny client reset updates"
ON public.password_resets FOR UPDATE
USING (false);

CREATE POLICY "Deny client reset deletion"
ON public.password_resets FOR DELETE
USING (false);