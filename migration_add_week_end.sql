-- Migration to add week_end_date column
ALTER TABLE weekly_reports ADD COLUMN week_end_date DATE;

-- Optional: Backfill existing rows (assuming 6 days after start date)
UPDATE weekly_reports SET week_end_date = week_start_date + INTERVAL '6 days' WHERE week_end_date IS NULL;
