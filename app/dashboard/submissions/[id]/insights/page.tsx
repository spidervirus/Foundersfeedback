'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FounderReport } from '@/components/FounderReport';
import { DashboardShell } from '@/components/DashboardShell';

export default function InsightsPage() {
    const params = useParams();
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchReport = async () => {
            const subId = params.id as string;

            // Fetch Founder Report & Submission
            const { data: report } = await supabase
                .from('founder_reports')
                .select(`
          *,
          execution_tasks (*),
          execution_tasks (*),
          submissions (landing_page_url),
          reviews (
            id,
            question_1,
            question_2,
            question_3,
            question_4,
            created_at
          )
        `)
                .eq('submission_id', subId)
                .single();

            if (report) {
                // Fetch Task Progress
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
                    ignore_areas: report.ignore_areas,
                    sevenDayPlan: report.execution_tasks.map((t: any) => ({
                        id: t.id,
                        day: t.day,
                        description: t.description,
                        status: progressMap[t.id]
                    })).sort((a: any, b: any) => a.day - b.day),
                    reviews: report.reviews || []
                });
            }

            setLoading(false);
        };

        fetchReport();
    }, [params.id, supabase]);

    if (loading) {
        return (
            <DashboardShell>
                <div className="animate-pulse space-y-8 py-12">
                    <div className="h-32 bg-slate-200 rounded-3xl" />
                    <div className="h-96 bg-slate-100 rounded-3xl" />
                </div>
            </DashboardShell>
        );
    }

    if (!reportData) {
        return (
            <DashboardShell>
                <div className="text-center py-24">
                    <h2 className="text-2xl font-bold mb-4 text-slate-900">Clarity Report Not Found</h2>
                    <p className="text-slate-500">You need to submit your startup for analysis first.</p>
                </div>
            </DashboardShell>
        );
    }

    return (
        <DashboardShell>
            <div className="py-12">
                <FounderReport data={reportData} />

                {reportData.reviews && reportData.reviews.length > 0 && (
                    <div className="mt-16 max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6 flex items-center gap-2">
                            <span className="text-3xl">💬</span>
                            Peer Feedback
                        </h2>

                        <div className="grid gap-6">
                            {reportData.reviews.map((review: any) => (
                                <div key={review.id} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                                        Review from Peer • {new Date(review.created_at).toLocaleDateString()}
                                    </h3>

                                    <div className="space-y-6">
                                        <div>
                                            <p className="font-bold text-slate-900 mb-1">Does the value prop make sense?</p>
                                            <p className="text-slate-600 italic">"{review.question_1}"</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 mb-1">Who is this for?</p>
                                            <p className="text-slate-600 italic">"{review.question_2}"</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 mb-1">Biggest risk seen?</p>
                                            <p className="text-slate-600 italic">"{review.question_3}"</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 mb-1">One thing to change?</p>
                                            <p className="text-slate-600 italic">"{review.question_4}"</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}
