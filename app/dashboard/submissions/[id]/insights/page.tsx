'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/DashboardShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/client';

interface Review {
    id: string;
    question_1: string;
    question_2: string;
    question_3: string;
    question_4: string;
    reviewer_id: string;
}

interface AnalysisData {
    positioning: { score: number; feedback: string; improvementDelta?: number };
    icp: { score: number; feedback: string; improvementDelta?: number };
    differentiation: { score: number; feedback: string };
    pricing: { score: number; feedback: string };
    competitors: { name: string; description: string; weakness: string; strength: string }[];
    headlineSuggestions: string[];
}

export default function InsightsPage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();
    const [submission, setSubmission] = useState<any>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
    const [reviewsCompleted, setReviewsCompleted] = useState(0);
    const [loading, setLoading] = useState(true);

    const REQUIRED_REVIEWS = 2; // Each founder in a pod of 3 must review the other 2

    useEffect(() => {
        const fetchData = async () => {
            const subId = params.id as string;
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch Submission & AI Analysis
            const { data: subData } = await supabase
                .from('submissions')
                .select(`
          *,
          analyses (
            id,
            full_report
          )
        `)
                .eq('id', subId)
                .single();

            if (subData) {
                setSubmission(subData);
                setAnalysis(subData.analyses?.[0]?.full_report as AnalysisData);

                // 2. Fetch User's Pod Membership to check review progress
                const { data: membershipData } = await supabase
                    .from('pod_members')
                    .select('reviews_completed')
                    .eq('submission_id', subId)
                    .eq('user_id', user.id)
                    .single();

                if (membershipData) {
                    setReviewsCompleted(membershipData.reviews_completed);
                }
            }

            // 3. Fetch Human Reviews (Other founders reviewing ME)
            const { data: reviewData } = await supabase
                .from('reviews')
                .select('*')
                .eq('submission_id', subId);

            if (reviewData) {
                setReviews(reviewData);
            }

            setLoading(false);
        };

        fetchData();
    }, [params.id, supabase]);

    if (loading) {
        return (
            <DashboardShell>
                <div className="animate-pulse space-y-8">
                    <div className="h-64 bg-slate-200 rounded-3xl" />
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="h-96 bg-slate-100 rounded-3xl" />
                        <div className="h-96 bg-slate-100 rounded-3xl" />
                    </div>
                </div>
            </DashboardShell>
        );
    }

    if (!submission) return null;

    const isLocked = reviewsCompleted < REQUIRED_REVIEWS;

    return (
        <DashboardShell>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-bold text-blue-600 mb-4 uppercase tracking-widest">
                            Founder Insights Report
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black font-heading text-slate-900 mb-4 tracking-tight">
                            {submission.landing_page_url.replace(/^https?:\/\//, '')}
                        </h1>
                        <p className="text-xl text-slate-500 font-medium">
                            Mapping AI Strategic Analysis against Human Peer Reviews.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => router.back()} className="border-slate-200">Back</Button>
                        <Button className="bg-blue-600 text-white shadow-lg shadow-blue-600/20 px-8" disabled={isLocked}>Export PDF</Button>
                    </div>
                </div>

                {/* Top Summary Cards */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <Card className="p-8 bg-white border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">AI Score</p>
                            <p className="text-4xl font-black text-slate-900">{analysis ? Math.round((analysis.positioning.score + analysis.icp.score + analysis.differentiation.score + analysis.pricing.score) / 4) : 'N/A'}<span className="text-xl text-slate-300">/10</span></p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl">🤖</div>
                    </Card>

                    <Card className={`p-8 bg-white border-slate-100 shadow-sm flex items-center justify-between transition-all ${isLocked ? 'opacity-60 saturate-0' : ''}`}>
                        <div>
                            <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">Human Reviews</p>
                            <p className="text-4xl font-black text-slate-900">{reviews.length}<span className="text-xl text-slate-300">/2</span></p>
                        </div>
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl">🤝</div>
                    </Card>

                    <Card className="p-8 bg-slate-900 text-white border-none shadow-xl flex items-center justify-between overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-blue-400 mb-1 uppercase tracking-widest">Your Progress</p>
                            <p className="text-xl font-bold">{reviewsCompleted}/{REQUIRED_REVIEWS} Reviews Given</p>
                        </div>
                        <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center text-xl">
                            {isLocked ? '🔒' : '🔓'}
                        </div>
                    </Card>
                </div>

                {/* Main Comparison Section */}
                <div className="grid lg:grid-cols-2 gap-12">

                    {/* AI Column - Always Unlocked */}
                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-900 px-2">
                            <span className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-sm italic">AI</span>
                            Strategic Breakdown
                        </h2>

                        {analysis && (
                            <div className="space-y-6">
                                {[
                                    { key: 'positioning' as const, title: 'Positioning', color: 'bg-blue-500' },
                                    { key: 'icp' as const, title: 'ICP Alignment', color: 'bg-purple-500' },
                                    { key: 'differentiation' as const, title: 'Differentiation', color: 'bg-orange-500' },
                                    { key: 'pricing' as const, title: 'Pricing Logic', color: 'bg-green-500' },
                                ].map((dim) => {
                                    const data = analysis[dim.key];
                                    return (
                                        <Card key={dim.key} className="p-6 bg-white border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="font-bold text-slate-700">{dim.title}</span>
                                                <Badge variant={data.score >= 7 ? 'success' : data.score >= 5 ? 'warning' : 'error'}>
                                                    {data.score}/10
                                                </Badge>
                                            </div>
                                            <div className="h-2 w-full bg-slate-50 rounded-full mb-4 overflow-hidden">
                                                <div className={`h-full ${dim.color}`} style={{ width: `${data.score * 10}%` }} />
                                            </div>
                                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                                {data.feedback}
                                            </p>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Human Column - Locked if user hasn't completed their reviews */}
                    <div className="space-y-8 relative">
                        <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-900 px-2">
                            <span className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-sm">🤝</span>
                            Peer Founder Reviews
                        </h2>

                        <div className="relative">
                            {isLocked && (
                                <div className="absolute inset-0 z-20 backdrop-blur-md bg-white/40 rounded-3xl flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-200">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-3xl mb-6 animate-bounce">
                                        🔒
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">Feedback Locked</h3>
                                    <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium">
                                        You've received {reviews.length} reviews, but you must complete your {REQUIRED_REVIEWS} peer reviews to unlock them.
                                    </p>
                                    <Button
                                        onClick={() => router.push('/dashboard/reviews')}
                                        className="bg-purple-600 text-white shadow-lg shadow-purple-600/20 px-8"
                                    >
                                        Complete Peer Reviews →
                                    </Button>
                                </div>
                            )}

                            <div className={`space-y-6 ${isLocked ? 'select-none pointer-events-none' : ''}`}>
                                {reviews.length === 0 ? (
                                    <Card className="p-12 text-center bg-slate-50 border-dashed border-2 border-slate-200 shadow-none">
                                        <p className="text-slate-400 font-medium">Waiting for peer reviews...</p>
                                    </Card>
                                ) : (
                                    reviews.map((review, i) => (
                                        <Card key={review.id} className="p-8 bg-white border-slate-100 shadow-sm">
                                            <div className="flex items-center gap-4 mb-8">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-xs font-bold text-purple-700">
                                                    F{i + 1}
                                                </div>
                                                <div className="text-sm font-bold text-slate-900">Founder Reviewer #{i + 1}</div>
                                            </div>

                                            <div className="space-y-6">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Q: Who is this for?</p>
                                                    <p className="text-sm text-slate-700 font-medium">{review.question_1}</p>
                                                </div>
                                                <div className="pt-4 border-t border-slate-50">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Q: Would they pay?</p>
                                                    <p className={`text-sm font-bold ${review.question_3.toLowerCase().includes('yes') ? 'text-green-600' : 'text-slate-700'}`}>
                                                        {review.question_3}
                                                    </p>
                                                </div>
                                                <div className="pt-4 border-t border-slate-50 bg-slate-50/50 p-4 rounded-xl">
                                                    <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">CRITICAL WEAKNESS</p>
                                                    <p className="text-sm text-slate-600 italic">"{review.question_4}"</p>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Deep Intelligence: Competitors & Headlines */}
                        <div className="mt-20 space-y-20">
                            {/* The Copy Editor */}
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-blue-600/20">✍️</div>
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900">The Copy Editor</h2>
                                        <p className="text-slate-500 font-medium font-heading">High-conversion headline alternatives based on feedback.</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-6">
                                    {analysis?.headlineSuggestions?.map((headline, i) => (
                                        <Card key={i} className="p-8 bg-white border-slate-100 shadow-sm hover:border-blue-200 transition-colors relative group">
                                            <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-md">
                                                {i + 1}
                                            </div>
                                            <p className="text-lg font-bold text-slate-800 leading-tight mb-4">
                                                "{headline}"
                                            </p>
                                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0 h-auto">
                                                Copy to Clipboard
                                            </Button>
                                        </Card>
                                    )) || (
                                            <p className="text-slate-400 italic">No headline suggestions available for this analysis.</p>
                                        )}
                                </div>
                            </section>

                            {/* Competitive Benchmark */}
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-slate-900/20">🎯</div>
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900">Competitive Benchmark</h2>
                                        <p className="text-slate-500 font-medium font-heading">Where you stand against the market leaders.</p>
                                    </div>
                                </div>

                                <div className="grid lg:grid-cols-3 gap-8">
                                    {analysis?.competitors?.map((comp, i) => (
                                        <Card key={i} className="bg-white border-slate-100 shadow-sm overflow-hidden group">
                                            <div className="p-6 border-b border-slate-50 bg-slate-50/50 group-hover:bg-slate-100/50 transition-colors">
                                                <h3 className="text-xl font-black text-slate-900 mb-1">{comp.name}</h3>
                                                <p className="text-sm text-slate-500 line-clamp-2">{comp.description}</p>
                                            </div>
                                            <div className="p-6 space-y-6">
                                                <div>
                                                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-2">Their Strength</p>
                                                    <p className="text-sm text-slate-700 font-medium leading-relaxed">
                                                        {comp.strength}
                                                    </p>
                                                </div>
                                                <div className="pt-4 border-t border-slate-50">
                                                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Your Opportunity (Their Weakness)</p>
                                                    <p className="text-sm text-slate-600 italic leading-relaxed">
                                                        "{comp.weakness}"
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>
                                    )) || (
                                            <p className="text-slate-400 italic">Competitive benchmark data not available.</p>
                                        )}
                                </div>
                            </section>
                        </div>

                        {/* Actionable Checklist - Also Locked? Maybe partial view */}
                        <div className="mt-20">
                            <Card className="p-12 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
                                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                                <h2 className="text-3xl font-bold mb-10 relative z-10 flex items-center gap-4">
                                    <span className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl">✅</span>
                                    Your Unified Action Plan
                                </h2>

                                <div className="grid md:grid-cols-2 gap-8 relative z-10">
                                    <div className="p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                                        <h3 className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-6">AI Strategic Fixes</h3>
                                        <ul className="space-y-4">
                                            {analysis && [
                                                ...analysis.positioning.feedback.split('.').slice(0, 2),
                                                ...analysis.differentiation.feedback.split('.').slice(0, 1)
                                            ].filter(s => s.trim().length > 10).map((task, i) => (
                                                <li key={i} className="flex items-start gap-4">
                                                    <div className="w-6 h-6 rounded-full border border-blue-500/30 flex items-center justify-center text-[10px] text-blue-400 flex-shrink-0 mt-0.5">✓</div>
                                                    <span className="text-slate-300 text-sm">{task.trim()}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className={`p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm relative ${isLocked ? 'overflow-hidden' : ''}`}>
                                        {isLocked && (
                                            <div className="absolute inset-0 z-10 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center text-center p-4">
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Locked: Complete peer reviews</p>
                                            </div>
                                        )}
                                        <h3 className="text-purple-400 font-bold uppercase tracking-widest text-xs mb-6">Human Reality Checks</h3>
                                        <ul className="space-y-4">
                                            {reviews.map((r, i) => (
                                                <li key={i} className="flex items-start gap-4">
                                                    <div className="w-6 h-6 rounded-full border border-purple-500/30 flex items-center justify-center text-[10px] text-purple-400 flex-shrink-0 mt-0.5">!</div>
                                                    <span className="text-slate-300 text-sm line-clamp-2">Founder Feedback: {r.question_4.trim()}</span>
                                                </li>
                                            ))}
                                            {reviews.length === 0 && <li className="text-slate-500 text-sm italic">Waiting for peer reviews to populate human insights...</li>}
                                        </ul>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
