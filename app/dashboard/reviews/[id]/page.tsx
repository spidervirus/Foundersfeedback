'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DashboardShell } from '@/components/DashboardShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/Input';
import { submitReview } from '@/lib/actions/reviews';

export default function ReviewSubmissionPage() {
    const params = useParams();
    const router = useRouter();
    const submissionId = params.id as string;
    const [submission, setSubmission] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const fetchSubmission = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch submission details
            const { data: sub, error } = await supabase
                .from('submissions')
                .select('*')
                .eq('id', submissionId)
                .single();

            if (sub) {
                // 2. Fetch pod ID to ensure membership
                const { data: podMember } = await supabase
                    .from('pod_members')
                    .select('pod_id')
                    .eq('submission_id', submissionId)
                    .limit(1)
                    .single();

                if (podMember) {
                    setSubmission({ ...sub, pod_id: podMember.pod_id });
                } else {
                    setSubmission(sub);
                }
            }
            setLoading(false);
        };
        fetchSubmission();
    }, [submissionId, supabase]);

    const handleSubmit = async (formData: FormData) => {
        setSubmitting(true);
        formData.append('submissionId', submissionId);
        formData.append('podId', submission?.pod_id);

        const result = await submitReview(formData);

        if (result.success) {
            router.push('/dashboard');
        } else {
            alert(result.error || 'Failed to submit review');
            setSubmitting(false);
        }
    };

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

    if (!submission) {
        return (
            <DashboardShell>
                <div className="text-center py-24">
                    <h2 className="text-2xl font-bold mb-4">Submission Not Found</h2>
                    <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
                </div>
            </DashboardShell>
        );
    }

    return (
        <DashboardShell>
            <div className="max-w-4xl mx-auto py-8">
                <div className="mb-8">
                    <Button variant="outline" onClick={() => router.back()} className="mb-4">← Back</Button>
                    <h1 className="text-3xl font-bold font-heading text-slate-900">Peer Review</h1>
                    <p className="text-slate-500">Give brutally honest feedback to help this founder succeed.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Startup Information */}
                    <div className="space-y-6">
                        <Card className="p-6 bg-slate-50 border-slate-200">
                            <div className="mb-4">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Landing Page</h3>
                                <a href={submission.landing_page_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline break-all">
                                    {submission.landing_page_url} ↗
                                </a>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Value Proposition</h3>
                                <p className="text-slate-800 font-medium">{submission.value_prop}</p>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Target Customer</h3>
                                <p className="text-slate-800 font-medium">{submission.target_customer}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Stage</h3>
                                <span className="inline-block px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-600">
                                    {submission.stage}
                                </span>
                            </div>
                        </Card>

                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-blue-800 text-sm">
                            <p className="font-bold mb-2">💡 Review Guidelines</p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Be specific, not generic ("Good job" helps no one).</li>
                                <li>Focus on the problem/solution fit.</li>
                                <li>Don't worry about being "nice", worry about being helpful.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Review Form */}
                    <div>
                        <Card className="p-8 shadow-lg border-slate-100">
                            <form action={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">
                                        1. Does the value proposition make sense immediately?
                                    </label>
                                    <TextArea name="question1" rows={3} required placeholder="Yes/No, because..." />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">
                                        2. Who do you think this product is actually for?
                                    </label>
                                    <p className="text-xs text-slate-500 mb-2">Describes the user you imagine would use this.</p>
                                    <TextArea name="question2" rows={3} required placeholder="I imagine a user who..." />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">
                                        3. What is the biggest risk you see?
                                    </label>
                                    <TextArea name="question3" rows={3} required placeholder="The risk is..." />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">
                                        4. If you could change one thing, what would it be?
                                    </label>
                                    <TextArea name="question4" rows={3} required placeholder="I would change..." />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Submitting Review...' : 'Submit Feedback'}
                                </Button>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
