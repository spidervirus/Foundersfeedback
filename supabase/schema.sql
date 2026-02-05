-- ==========================================
-- 1. EXTENSIONS & BASE TABLES
-- ==========================================

create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  role text default 'founder',
  linkedin_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SUBMISSIONS
create table public.submissions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  parent_id uuid references public.submissions(id) on delete set null, -- Null for original, non-null for iterations
  landing_page_url text not null,
  target_customer text not null,
  value_prop text not null,
  stage text check (stage in ('pre-revenue', 'early-mrr', 'scaling', 'established')),
  product_type text check (product_type in ('b2b-saas', 'b2c', 'marketplace', 'other')),
  status text default 'pending' check (status in ('pending', 'analyzed', 'matched', 'reviewed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ANALYSES
create table public.analyses (
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
create table public.review_pods (
  id uuid default uuid_generate_v4() primary key,
  status text default 'forming' check (status in ('forming', 'active', 'completed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- POD MEMBERS
create table public.pod_members (
  id uuid default uuid_generate_v4() primary key,
  pod_id uuid references public.review_pods(id) on delete cascade not null,
  submission_id uuid references public.submissions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  reviews_completed integer default 0,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- REVIEWS
create table public.reviews (
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

-- ==========================================
-- 2. FUNCTIONS & TRIGGERS
-- ==========================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

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

drop trigger if exists on_review_submitted on reviews;
create trigger on_review_submitted
  after insert on reviews
  for each row execute procedure public.handle_review_submitted();

-- ==========================================
-- 3. SECURITY (RLS & POLICIES)
-- ==========================================

alter table public.profiles enable row level security;
alter table public.submissions enable row level security;
alter table public.analyses enable row level security;
alter table public.review_pods enable row level security;
alter table public.pod_members enable row level security;
alter table public.reviews enable row level security;

-- Profile Policies
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Submission Policies
create policy "Users can view own submissions." on submissions for select using (auth.uid() = user_id);
create policy "Users can insert own submissions." on submissions for insert with check (auth.uid() = user_id);
create policy "Users can update own submissions." on submissions for update using (auth.uid() = user_id);

-- pod intersection policy (viewing peer submissions)
create policy "View submissions in own pod"
  on submissions for select
  using (
    exists (
      select 1 from pod_members pm_me
      join pod_members pm_target on pm_me.pod_id = pm_target.pod_id
      where pm_me.user_id = auth.uid()
      and pm_target.submission_id = submissions.id
    )
  );

-- Analysis Policies
create policy "Users can view analyses of their own submissions." 
  on analyses for select 
  using (exists (select 1 from submissions where submissions.id = analyses.submission_id and submissions.user_id = auth.uid()));

-- Pod & Review Policies
create policy "View own pods" on review_pods for select
  using (exists (select 1 from pod_members where pod_members.pod_id = review_pods.id and pod_members.user_id = auth.uid()));

create policy "View own pod members" on pod_members for select
  using (exists (select 1 from pod_members as pm where pm.pod_id = pod_members.pod_id and pm.user_id = auth.uid()));

create policy "Insert reviews for pod" on reviews for insert
  with check (exists (select 1 from pod_members where pod_members.pod_id = reviews.pod_id and pod_members.user_id = auth.uid()));

create policy "View reviews in pod" on reviews for select
  using (reviewer_id = auth.uid() or exists (select 1 from submissions where submissions.id = reviews.submission_id and submissions.user_id = auth.uid()));
