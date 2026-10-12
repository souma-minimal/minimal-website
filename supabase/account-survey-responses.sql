-- minimal Accounts: optional, owner-only customer research responses.
-- Run this in the Supabase SQL Editor, then expose this table in Data API
-- settings and run the final revoke/grant section below.

create table if not exists public.account_survey_responses (
  user_id uuid primary key references auth.users(id) on delete cascade,
  uses text not null default '',
  interest text not null default '',
  notes text not null default '',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint account_survey_uses_length check (char_length(uses) <= 64),
  constraint account_survey_interest_length check (char_length(interest) <= 64),
  constraint account_survey_notes_length check (char_length(notes) <= 600)
);

alter table public.account_survey_responses enable row level security;

-- The browser never queries this table directly.  It is read and written by
-- the authenticated Cloudflare API route with a service-role key instead.
revoke all on table public.account_survey_responses from anon, authenticated;
grant select, insert, update, delete on table public.account_survey_responses to service_role;
