-- Allow authenticated users to view submissions that are ready to be matched (status = 'analyzed')
-- This is necessary for the peer matching logic to find candidates running as the user.

create policy "Enable read access for matching candidates"
on public.submissions
for select
to authenticated
using (status = 'analyzed');
