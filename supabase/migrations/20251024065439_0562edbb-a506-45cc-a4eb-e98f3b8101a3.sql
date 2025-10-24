-- Add UPDATE policy for cover_letters table
CREATE POLICY "Users can update their own cover letters" 
ON public.cover_letters 
FOR UPDATE 
USING (auth.uid() = user_id);