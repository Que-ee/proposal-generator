-- Proposal Generator for Freelancers — initial schema
--
-- Scope: freelancer_profiles, experience_entries, proposals only.
-- No auth tables are created here; Supabase Auth (auth.users) is assumed to
-- be enabled on the project by default, which is why `user_id` below can
-- already reference it even though no login flow exists yet.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- freelancer_profiles
-- ---------------------------------------------------------------------------
-- Identity note: `user_id` is nullable for now because there is no auth flow
-- yet, so profiles can't be tied to a signed-in user. It already references
-- auth.users so that wiring up authentication later is a data migration
-- (backfill user_id, then make it NOT NULL) rather than a schema redesign.
create table if not exists public.freelancer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  full_name text not null,
  professional_title text not null,
  bio text not null default '',
  years_experience integer not null default 0,
  portfolio_url text,
  skills text[] not null default '{}',
  -- ProposalPreferences: { tone, preferredLength, ctaStyle }
  proposal_preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists freelancer_profiles_user_id_idx
  on public.freelancer_profiles (user_id);

-- ---------------------------------------------------------------------------
-- experience_entries
-- ---------------------------------------------------------------------------
create table if not exists public.experience_entries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.freelancer_profiles (id) on delete cascade,
  title text not null,
  company text not null,
  role text not null,
  description text not null default '',
  skills text[] not null default '{}',
  evidence text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists experience_entries_profile_id_idx
  on public.experience_entries (profile_id);

-- ---------------------------------------------------------------------------
-- proposals
-- ---------------------------------------------------------------------------
create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.freelancer_profiles (id) on delete cascade,
  job_title text not null,
  company_name text not null,
  raw_job_post text not null,
  -- JobAnalysis: { clientNeeds, requiredSkills, painPoints,
  --   relevantProfileEvidence, missingExperience, proposalAngle }
  analysis jsonb not null default '{}'::jsonb,
  generated_proposal text not null default '',
  edited_proposal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists proposals_profile_id_idx
  on public.proposals (profile_id);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.freelancer_profiles
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.experience_entries
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.proposals
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- RLS is enabled on every table from day one — it is never safe to leave it
-- disabled, even during development, because these tables are reachable with
-- the public anon key.
--
-- However, there is no auth flow yet, so `user_id` is always null and there
-- is no session to scope policies to. The only two honest options were:
--   (a) enable RLS with no policies at all, which blocks all anon access and
--       makes the app unusable before auth exists, or
--   (b) enable RLS with an explicit, clearly-labeled temporary policy that
--       allows access to profiles (and their children) that have no owner
--       yet, i.e. rows created before auth existed.
--
-- We take option (b) so the MVP stays usable, but it is a deliberate,
-- temporary development decision, not real security: anyone with the anon
-- key can currently read/write any profile with user_id is null. It must be
-- replaced (not just supplemented) as soon as authentication ships — see the
-- migration note at the bottom of this file.

alter table public.freelancer_profiles enable row level security;
alter table public.experience_entries enable row level security;
alter table public.proposals enable row level security;

-- TEMPORARY (pre-auth): allow full access to ownerless profiles.
create policy "dev_preauth_full_access"
  on public.freelancer_profiles
  for all
  using (user_id is null)
  with check (user_id is null);

-- TEMPORARY (pre-auth): allow full access to experience entries that belong
-- to an ownerless profile.
create policy "dev_preauth_full_access"
  on public.experience_entries
  for all
  using (
    exists (
      select 1 from public.freelancer_profiles p
      where p.id = experience_entries.profile_id
        and p.user_id is null
    )
  )
  with check (
    exists (
      select 1 from public.freelancer_profiles p
      where p.id = experience_entries.profile_id
        and p.user_id is null
    )
  );

-- TEMPORARY (pre-auth): allow full access to proposals that belong to an
-- ownerless profile.
create policy "dev_preauth_full_access"
  on public.proposals
  for all
  using (
    exists (
      select 1 from public.freelancer_profiles p
      where p.id = proposals.profile_id
        and p.user_id is null
    )
  )
  with check (
    exists (
      select 1 from public.freelancer_profiles p
      where p.id = proposals.profile_id
        and p.user_id is null
    )
  );

-- ---------------------------------------------------------------------------
-- Data API privileges (anon role)
-- ---------------------------------------------------------------------------
-- "Automatically expose new tables" is disabled on this project, so Supabase
-- does not silently grant its usual default table privileges when a table is
-- created via migration. Without an explicit GRANT here, PostgREST's queries
-- (run as the `anon` role for the publishable/anon client) would be rejected
-- by Postgres for lacking table privileges — before RLS is even evaluated.
-- RLS restricts *which rows* a role can see/change; GRANT is the separate,
-- more basic permission for whether the role may touch the table at all.
-- Both layers are required, and both are already in place except this one.
--
-- Grants below are scoped to exactly what the current app does today:
--   - freelancer_profiles: the profile form reads, creates, and updates a
--     profile, but never deletes one -> select, insert, update.
--   - experience_entries: the form fully replaces a profile's entries on
--     save (delete all, then insert the current set) and never updates a
--     row in place -> select, insert, delete.
--   - proposals: the generator saves a new row after each successful AI
--     generation, and updates that same row's `edited_proposal` when the
--     user edits the text in place -> select, insert, update. Nothing in
--     the product deletes a proposal yet, so no `delete`.
--
-- None of this replaces RLS: even with these grants, the existing
-- `dev_preauth_full_access` policies above still restrict every anon query
-- to rows where the related profile's `user_id is null`. Grant says whether
-- the operation is allowed at all; policy says which rows it can touch.

grant usage on schema public to anon;

grant select, insert, update on public.freelancer_profiles to anon;
grant select, insert, delete on public.experience_entries to anon;
grant select, insert, update on public.proposals to anon;

-- ---------------------------------------------------------------------------
-- Migration note for when authentication is introduced:
--   1. Backfill `freelancer_profiles.user_id` for existing rows.
--   2. Alter `freelancer_profiles.user_id` to `not null`.
--   3. Drop the three `dev_preauth_full_access` policies above.
--   4. Add real ownership policies, e.g.:
--      create policy "owner_full_access" on public.freelancer_profiles
--        for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
--      (and equivalent join-based policies for experience_entries/proposals)
-- ---------------------------------------------------------------------------
