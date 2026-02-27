-- Add UPDATE policy for run_data table to restrict modifications to run owners
CREATE POLICY "Users can update their run data"
ON public.run_data
FOR UPDATE
USING (is_run_owner(run_id))
WITH CHECK (is_run_owner(run_id));