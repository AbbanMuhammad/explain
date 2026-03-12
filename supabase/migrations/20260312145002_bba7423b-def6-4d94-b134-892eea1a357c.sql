-- Create a table for storing student questions
CREATE TABLE public.questions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    question_text TEXT NOT NULL,
    subject TEXT NOT NULL DEFAULT 'Not specified',
    class_level TEXT NOT NULL DEFAULT 'JSS1',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts
CREATE POLICY "Anyone can insert questions"
ON public.questions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow reading questions for analytics
CREATE POLICY "Anyone can read questions"
ON public.questions
FOR SELECT
TO anon, authenticated
USING (true);