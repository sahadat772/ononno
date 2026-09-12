-- Progressive class unlock for students
alter table if exists public.student_profiles
  add column if not exists unlocked_class_level text;

update public.student_profiles
set unlocked_class_level = class_level
where unlocked_class_level is null and class_level is not null;
