-- Create the leads table for custom authentication
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL, -- The "Lead ID" or Login ID
  password TEXT NOT NULL, -- Storing text password as requested (WARNING: Not secure for production)
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'lead', 'member')),
  committee TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow public read access (so we can check login)
CREATE POLICY "Allow public read" ON leads
FOR SELECT USING (true);

-- Seed Initial Data
INSERT INTO leads (username, password, full_name, role, department)
VALUES 
  ('admin', 'admin123', 'Admin User', 'admin', 'Management'),
  ('lead01', 'password123', 'John Doe', 'lead', 'Engineering'),
  ('lead02', 'securepass', 'Jane Smith', 'lead', 'Marketing'),
  ('emp01', 'user123', 'Alice Johnson', 'member', 'Engineering');

-- Update weekly_reports to link to leads table (optional but good for referential integrity)
-- ALTER TABLE weekly_reports ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES leads(id);
