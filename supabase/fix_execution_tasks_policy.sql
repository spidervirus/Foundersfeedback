-- Allow users to insert tasks for their own founder reports
create policy "Users can insert tasks for their own reports"
on public.execution_tasks
for insert
with check (
  exists (
    select 1 from public.founder_reports
    where id = execution_tasks.report_id
    and user_id = auth.uid()
  )
);
