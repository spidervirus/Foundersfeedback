'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/DashboardShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';

interface SubmissionToReview {
    landing_page_url: string;
    target_customer: string;
    value_prop: string;
}

interface PodMemberData {
    pod_id: string;
    submission_id: string;
    submissions: SubmissionToReview;
}

export default function ReviewFormPage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();
    const [memberData, setMemberData] = useState<PodMemberData | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [answers, setAnswers] = useState({
        q1: '',
        q2: '',
        q3: '',
        q4: '',
    });

    useEffect(() => {
        const fetchMemberData = async () => {
            try {
                const { data, error } = await supabase
                    .from('pod_members')
                    .select(`
              pod_id,
              submission_id,
              submissions (
                landing_page_url,
                target_customer,
                value_prop
              )
            `)
                    .eq('id', params.id)
                    .single();

                if (data) {
                    setMemberData(data as any);
                }
            } catch (err) {
                console.error('Fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMemberData();
    }, [params.id, supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !memberData) return;

            const { error } = await supabase
                .from('reviews')
                .insert({
                    pod_id: memberData.pod_id,
                    reviewer_id: user.id,
                    submission_id: memberData.submission_id,
                    question_1: answers.q1,
                    question_2: answers.q2,
                    question_3: answers.q3,
                    question_4: answers.q4,
                });

            if (error) {
                alert(error.message);
            } else {
                alert('Review submitted successfully!');
                router.push('/dashboard/reviews');
            }
        } catch (err) {
            console.error('Submit error:', err);
            alert('Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <DashboardShell>
                <div className="animate-pulse space-y-4">
                    <div className="h-64 bg-slate-200 rounded-2xl" />
                </div>
            </DashboardShell>
        );
    }

    if (!memberData) {
        return (
            <DashboardShell>
                <Card className="text-center py-20">
                    <h2 className="text-xl font-bold">Review match not found</h2>
                    <Button onClick={() => router.back()} className="mt-4">Back</Button>
                </Card>
            </DashboardShell>
        );
    }

    return (
        <DashboardShell>
            <div className="max-w-3xl mx-auto mb-10">
                <h1 className="text-3xl font-bold font-heading text-slate-900 mb-6 italic">Founder Peer Review</h1>

                {/* Context Card */}
                <Card className="bg-slate-900 text-white p-8 mb-10 shadow-2xl overflow-hidden relative border-none">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">You are reviewing</div>
                        <h2 className="text-2xl font-bold mb-6">
                            <a href={memberData.submissions.landing_page_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition-colors flex items-center gap-2">
                                {memberData.submissions.landing_page_url.replace(/^https?:\/\//, '')}
                                <span className="text-sm">↗</span>
                            </a>
                        </h2>

                        <div className="grid sm:grid-cols-2 gap-8">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Target Customer</p>
                                <p className="text-slate-100 text-sm leading-relaxed">{memberData.submissions.target_customer}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Stated Value Prop</p>
                                <p className="text-slate-100 text-sm leading-relaxed">{memberData.submissions.value_prop}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Form Card */}
                <Card className="bg-white p-10 shadow-xl border-slate-100">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="space-y-6">
                            <TextArea
                                label="1. In your own words, who is this product for?"
                                placeholder="Be honest—is it clear who their buyer is?"
                                rows={4}
                                required
                                value={answers.q1}
                                onChange={(e) => setAnswers({ ...answers, q1: e.target.value })}
                            />
                            <TextArea
                                label="2. What specific problem do you think it solves?"
                                placeholder="Does the landing page make the pain point obvious?"
                                rows={4}
                                required
                                value={answers.q2}
                                onChange={(e) => setAnswers({ ...answers, q2: e.target.value })}
                            />
                            <TextArea
                                label="3. Would YOU pay for this? Why or why not?"
                                placeholder="If not, what is the missing piece?"
                                rows={4}
                                required
                                value={answers.q3}
                                onChange={(e) => setAnswers({ ...answers, q3: e.target.value })}
                            />
                            <TextArea
                                label="4. What part of the landing page was most confusing?"
                                placeholder="Copy, design, features, pricing?"
                                rows={4}
                                required
                                value={answers.q4}
                                onChange={(e) => setAnswers({ ...answers, q4: e.target.value })}
                            />
                        </div>

                        <div className="pt-6 flex gap-4">
                            <Button type="button" variant="outline" onClick={() => router.back()} className="px-8 h-14">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 bg-blue-600 text-white h-14 text-lg font-bold shadow-lg shadow-blue-600/20"
                            >
                                {submitting ? 'Submitting...' : 'Submit Review →'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </DashboardShell>
    );
}
