-- Create the weekly_reports table
CREATE TABLE weekly_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT NOT NULL, -- Storing the mock user ID (e.g., 'u2') or later Supabase Auth ID
  user_name TEXT NOT NULL,
  committee TEXT NOT NULL,
  week_start_date DATE NOT NULL,
  week_end_date DATE,
  summary TEXT NOT NULL,
  challenges TEXT,
  plans_for_next_week TEXT,
  remarks TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed'))
);

-- Enable Row Level Security (RLS) if you want protection, 
-- but for now we will leave it open or simple since we are using anonymous access initially without full Auth
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;

-- Policy to allow anonymous read/write (since we are not fully using Supabase Auth yet)
-- WARNING: This allows anyone with your API key to read/write. 
-- For production, you MUST implement Supabase Auth.
CREATE POLICY "Allow public access" ON weekly_reports
FOR ALL USING (true);
