-- Sample Past Masters data for Mt. Capistrano Masonic Lodge No. 23
-- Run this SQL in your Supabase SQL editor after creating the past_masters table.

INSERT INTO public.past_masters (name, title, year_served, bio, status, sort_order, created_by)
VALUES
  ('Bro. Noel J. Blanco', 'Worshipful Master', '2023 - 2024', 'Led the lodge with a renewed focus on community service and brotherhood engagement.', 'published', 1, 'admin'),
  ('Bro. Jose Regner M. Sevilleno', 'Worshipful Master', '2022 - 2023', 'Championed youth outreach programs and strengthened ties with the district grand lodge.', 'published', 2, 'admin'),
  ('Bro. Hope Earl Bucog', 'Worshipful Master', '2021 - 2022', 'Guided the lodge through challenging times with steady leadership and unwavering dedication.', 'published', 3, 'admin');
