'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FounderReport } from '@/components/FounderReport';
import { DashboardShell } from '@/components/DashboardShell';

export default function AnalysisPage() {
  const params = useParams();
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchReport = async () => {
      const id = params.id as string;
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Fetch Founder Report & Submission
      const { data: report, error: reportError } = await supabase
        .from('founder_reports')
        .select(`
          *,
          execution_tasks (*),
          submissions (landing_page_url)
        `)
        .or(`submission_id.eq.${id},id.eq.${id}`)
        .single();

      if (report) {
        // 2. Fetch Task Progress
        const { data: progress } = await supabase
          .from('task_progress')
          .select('*')
          .in('task_id', report.execution_tasks.map((t: any) => t.id));

        const progressMap = (progress || []).reduce((acc: any, p: any) => {
          acc[p.task_id] = p.status;
          return acc;
        }, {});

        setReportData({
          id: report.id,
          positioningVerdict: report.positioning_verdict,
          brutalTruth: report.brutal_truth,
          focusAreas: report.focus_areas,
          ignoreAreas: report.ignore_areas,
          sevenDayPlan: report.execution_tasks.map((t: any) => ({
            id: t.id,
            day: t.day,
            description: t.description,
            status: progressMap[t.id]
          })).sort((a: any, b: any) => a.day - b.day),
          landingPageUrl: report.submissions?.landing_page_url
        });
      }

      setLoading(false);
    };

    fetchReport();
  }, [params.id, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium font-heading">Generating your Clarity Report...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Report Not Found</h2>
          <p className="text-slate-500">We couldn't find the report you're looking for.</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardShell>
      <div className="py-12 px-4 bg-slate-50 min-h-screen">
        <FounderReport data={reportData} />
      </div>
    </DashboardShell>
  );
}
