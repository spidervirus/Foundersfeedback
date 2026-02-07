-- ==========================================
-- 1. EXTENSIONS & BASE TABLES
-- ==========================================

create extension if not exists "uuid-ossp";

-- PROFILES
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  role text default 'founder',
  linkedin_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SUBMISSIONS
create table if not exists public.submissions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  parent_id uuid references public.submissions(id) on delete set null, -- Null for original, non-null for iterations
  landing_page_url text not null,
  target_customer text not null,
  value_prop text not null,
  stage text check (stage in ('just-an-idea', 'building-mvp', 'launched-no-users', 'some-users', 'revenue')),
  product_type text check (product_type in ('b2b-saas', 'b2c', 'marketplace', 'other')),
  status text default 'pending' check (status in ('pending', 'analyzed', 'matched', 'reviewed')),
  input_data jsonb, -- Stores structured form input
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ANALYSES
create table if not exists public.analyses (
  id uuid default uuid_generate_v4() primary key,
  submission_id uuid references public.submissions(id) on delete cascade not null,
  positioning_score integer,
  icp_score integer,
  differentiation_score integer,
  pricing_score integer,
  competitors jsonb, -- Store competitive benchmark results
  suggestions jsonb, -- Store headline alternatives
  full_report jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- REVIEW PODS
create table if not exists public.review_pods (
  id uuid default uuid_generate_v4() primary key,
  status text default 'forming' check (status in ('forming', 'active', 'completed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- POD MEMBERS
create table if not exists public.pod_members (
  id uuid default uuid_generate_v4() primary key,
  pod_id uuid references public.review_pods(id) on delete cascade not null,
  submission_id uuid references public.submissions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  reviews_completed integer default 0,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- REVIEWS
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  pod_id uuid references public.review_pods(id) on delete cascade not null,
  reviewer_id uuid references public.profiles(id) on delete cascade not null,
  submission_id uuid references public.submissions(id) on delete cascade not null,
  question_1 text,
  question_2 text,
  question_3 text,
  question_4 text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(reviewer_id, submission_id)
);

-- FOUNDER REPORTS
create table if not exists public.founder_reports (
  id uuid default uuid_generate_v4() primary key,
  submission_id uuid references public.submissions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  positioning_verdict text not null,
  brutal_truth text not null,
  focus_areas jsonb not null, -- 3-5 priorities
  ignore_areas jsonb not null, -- items to ignore
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- EXECUTION TASKS
create table if not exists public.execution_tasks (
  id uuid default uuid_generate_v4() primary key,
  report_id uuid references public.founder_reports(id) on delete cascade not null,
  day integer not null,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TASK PROGRESS
create table if not exists public.task_progress (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.execution_tasks(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text not null check (status in ('done', 'skipped')),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(task_id, user_id)
);

-- ==========================================
-- 2. FUNCTIONS & TRIGGERS
-- ==========================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for handle_new_user
do $$ 
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
  end if;
end $$;

-- Auto-increment reviews_completed
create or replace function public.handle_review_submitted()
returns trigger as $$
begin
  update public.pod_members
  set reviews_completed = reviews_completed + 1
  where pod_id = new.pod_id and user_id = new.reviewer_id;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for handle_review_submitted
do $$ 
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_review_submitted') then
    create trigger on_review_submitted
      after insert on reviews
      for each row execute procedure public.handle_review_submitted();
  end if;
end $$;

-- Pod membership check (Security Definer to avoid recursion)
create or replace function public.is_pod_member(p_pod_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.pod_members
    where pod_id = p_pod_id
    and user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- Submission visibility check (Security Definer to avoid recursion)
create or replace function public.can_view_submission(p_submission_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.pod_members pm_target
    join public.pod_members pm_me on pm_target.pod_id = pm_me.pod_id
    where pm_target.submission_id = p_submission_id
    and pm_me.user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- ==========================================
-- 3. SECURITY (RLS & POLICIES)
-- ==========================================

alter table public.profiles enable row level security;
alter table public.submissions enable row level security;
alter table public.analyses enable row level security;
alter table public.review_pods enable row level security;
alter table public.pod_members enable row level security;
alter table public.reviews enable row level security;
alter table public.founder_reports enable row level security;
alter table public.execution_tasks enable row level security;
alter table public.task_progress enable row level security;

-- Helper to drop policy if exists
create or replace function public.create_policy_if_not_exists(
  pol_name text,
  tab_name text,
  cmd text,
  usng text default null,
  chk text default null
) returns void as $$
begin
  execute format('drop policy if exists %I on %I', pol_name, tab_name);
  if usng is not null and chk is not null then
    execute format('create policy %I on %I for %s using (%s) with check (%s)', pol_name, tab_name, cmd, usng, chk);
  elsif usng is not null then
    execute format('create policy %I on %I for %s using (%s)', pol_name, tab_name, cmd, usng);
  elsif chk is not null then
    execute format('create policy %I on %I for %s with check (%s)', pol_name, tab_name, cmd, chk);
  end if;
end;
$$ language plpgsql;

-- Profile Policies
select public.create_policy_if_not_exists('Public profiles are viewable by everyone.', 'profiles', 'select', 'true');
select public.create_policy_if_not_exists('Users can update own profile.', 'profiles', 'update', 'auth.uid() = id');

-- Submission Policies
select public.create_policy_if_not_exists('Users can view own submissions.', 'submissions', 'select', 'auth.uid() = user_id');
select public.create_policy_if_not_exists('Users can insert own submissions.', 'submissions', 'insert', null, 'auth.uid() = user_id');
select public.create_policy_if_not_exists('Users can update own submissions.', 'submissions', 'update', 'auth.uid() = user_id');
select public.create_policy_if_not_exists('View submissions in own pod', 'submissions', 'select', 'can_view_submission(id)');

-- Analysis Policies
select public.create_policy_if_not_exists('Users can view analyses of their own submissions.', 'analyses', 'select', 'exists (select 1 from submissions where submissions.id = analyses.submission_id and submissions.user_id = auth.uid())');

-- Pod & Review Policies
select public.create_policy_if_not_exists('View own pods', 'review_pods', 'select', 'is_pod_member(id)');
select public.create_policy_if_not_exists('View own pod members', 'pod_members', 'select', 'is_pod_member(pod_id)');
select public.create_policy_if_not_exists('Insert reviews for pod', 'reviews', 'insert', null, 'is_pod_member(pod_id)');
select public.create_policy_if_not_exists('View reviews in pod', 'reviews', 'select', 'reviewer_id = auth.uid() or exists (select 1 from submissions where submissions.id = reviews.submission_id and submissions.user_id = auth.uid())');

-- Founder Report Policies
select public.create_policy_if_not_exists('Users can view own founder reports.', 'founder_reports', 'select', 'auth.uid() = user_id');
select public.create_policy_if_not_exists('Users can insert own founder reports.', 'founder_reports', 'insert', null, 'auth.uid() = user_id');
select public.create_policy_if_not_exists('Users can view tasks for their reports.', 'execution_tasks', 'select', 'exists (select 1 from founder_reports where founder_reports.id = execution_tasks.report_id and founder_reports.user_id = auth.uid())');
select public.create_policy_if_not_exists('Users can update own task progress.', 'task_progress', 'all', 'auth.uid() = user_id', 'auth.uid() = user_id');
