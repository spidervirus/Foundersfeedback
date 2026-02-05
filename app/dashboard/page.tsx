'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/DashboardShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/client';

// Define types locally for now (typically would be in a types file)
interface Submission {
    id: string;
    parent_id?: string;
    landing_page_url: string;
    created_at: string;
    status: 'pending' | 'analyzed' | 'matched' | 'reviewed';
    target_customer: string;
    value_prop: string;
    product_type: string;
    stage: string;
    analysis?: {
        id: string;
        positioning_score: number;
        icp_score: number;
        differentiation_score: number;
        pricing_score: number;
    };
    reviews_completed: number;
}

export default function DashboardPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchSubmissions = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: subs, error } = await supabase
                .from('submissions')
                .select(`
                  id,
                  parent_id,
                  landing_page_url,
                  target_customer,
                  value_prop,
                  product_type,
                  stage,
                  created_at,
                  status,
                  analyses (
                    id,
                    positioning_score,
                    icp_score,
                    differentiation_score,
                    pricing_score
                  ),
                  pod_members (
                    reviews_completed
                  )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (subs) {
                const formattedSubmissions = subs.map(sub => ({
                    ...sub,
                    analysis: sub.analyses?.[0] || null,
                    reviews_completed: sub.pod_members?.[0]?.reviews_completed || 0
                }));
                setSubmissions(formattedSubmissions as any);
            }
            setLoading(false);
        };

        fetchSubmissions();
    }, [supabase]);

    const getScoreColor = (score: number) => {
        if (score >= 8) return 'success';
        if (score >= 6) return 'warning';
        return 'error';
    };

    const getAverageScore = (analysis: any) => {
        if (!analysis) return 0;
        return Math.round(
            (analysis.positioning_score +
                analysis.icp_score +
                analysis.differentiation_score +
                analysis.pricing_score) / 4
        );
    };

    const handleMatch = async (submissionId: string) => {
        try {
            const response = await fetch('/api/matching', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ submissionId }),
            });
            const data = await response.json();
            if (data.success) {
                alert(data.message);
                window.location.reload();
            } else {
                alert(data.message || 'Added to waiting pool.');
                window.location.reload();
            }
        } catch (error) {
            console.error('Matching error:', error);
            alert('Failed to trigger matching.');
        }
    };

    return (
        <DashboardShell>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-slate-900 mb-2">Your Dashboard</h1>
                    <p className="text-slate-500">Track your product analyses and peer reviews.</p>
                </div>
                <Link href="/submit">
                    <Button className="bg-blue-600 text-white shadow-lg shadow-blue-600/20" size="lg">
                        + New Analysis
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="space-y-4 animate-pulse">
                    <div className="h-40 bg-slate-200 rounded-2xl w-full" />
                    <div className="h-40 bg-slate-200 rounded-2xl w-full" />
                </div>
            ) : submissions.length === 0 ? (
                <Card className="text-center py-20 bg-white shadow-sm border-slate-100">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                        🚀
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-3">No submissions yet</h2>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">
                        Submit your landing page to get instant AI feedback and start the matching process.
                    </p>
                    <Link href="/submit">
                        <Button size="lg" className="bg-blue-600 text-white">Get Started</Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {submissions.map((sub: any) => {
                        const avgScore = sub.analysis ? getAverageScore(sub.analysis) : 0;
                        const isMatched = sub.status === 'matched' || sub.status === 'reviewed';
                        const isLocked = isMatched && (sub.reviews_completed || 0) < 2;

                        return (
                            <Card key={sub.id} className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-all p-6 flex flex-col lg:flex-row gap-6 items-center">

                                {/* Score & Meta */}
                                <div className="flex flex-row lg:flex-col items-center gap-4 flex-shrink-0">
                                    {sub.analysis ? (
                                        <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border-4 ${avgScore >= 8 ? 'border-green-100 bg-green-50 text-green-700' :
                                            avgScore >= 6 ? 'border-orange-100 bg-orange-50 text-orange-700' :
                                                'border-red-100 bg-red-50 text-red-700'
                                            }`}>
                                            <span className="text-2xl font-black">{avgScore}</span>
                                            <span className="text-[10px] font-bold uppercase opacity-70 tracking-tighter">Avg Score</span>
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">
                                            ⏳
                                        </div>
                                    )}
                                    {sub.parent_id && (
                                        <Badge variant="info" className="bg-blue-50 text-blue-600 whitespace-nowrap">Iteration V2+</Badge>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-grow text-center lg:text-left min-w-0">
                                    <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                                        <h3 className="text-lg font-bold text-slate-900 truncate">
                                            {sub.landing_page_url.replace(/^https?:\/\//, '')}
                                        </h3>
                                        {sub.status === 'reviewed' && <Badge className="bg-green-100 text-green-700">Ready</Badge>}
                                    </div>
                                    <div className="text-sm text-slate-500 mb-3 block">
                                        {new Date(sub.created_at).toLocaleDateString()} • {
                                            sub.status === 'analyzed' ? 'Pending Matching' :
                                                sub.status === 'matched' ? 'Looking for Reviews' :
                                                    sub.status === 'reviewed' ? 'Reviews Complete' : 'Processing'
                                        }
                                    </div>

                                    {sub.analysis && (
                                        <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                                            <Badge variant="outline" className="text-[10px] text-slate-500 bg-slate-50">
                                                Positioning: {sub.analysis.positioning_score}/10
                                            </Badge>
                                            <Badge variant="outline" className="text-[10px] text-slate-500 bg-slate-50">
                                                ICP: {sub.analysis.icp_score}/10
                                            </Badge>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 w-full lg:w-48">
                                    <Link href={sub.analysis ? `/analysis/${sub.analysis.id}` : '#'}>
                                        <Button
                                            variant="outline"
                                            className="w-full h-9 border-slate-200 text-sm"
                                            disabled={!sub.analysis}
                                        >
                                            View AI Report
                                        </Button>
                                    </Link>

                                    {/* Improvement Loop: Iterate Button */}
                                    <Link href={{
                                        pathname: '/submit',
                                        query: {
                                            parentId: sub.id,
                                            url: sub.landing_page_url,
                                            customer: sub.target_customer,
                                            prop: sub.value_prop,
                                            type: sub.product_type,
                                            stage: sub.stage
                                        }
                                    }}>
                                        <Button variant="ghost" className="w-full h-9 text-blue-600 bg-blue-50 hover:bg-blue-100 text-sm font-bold">
                                            🚀 Iterate Version
                                        </Button>
                                    </Link>

                                    {sub.parent_id && (
                                        <Link href={`/dashboard/submissions/${sub.id}/compare`}>
                                            <Button variant="outline" className="w-full h-9 border-purple-200 text-purple-600 text-sm">
                                                ⚖️ Compare Versions
                                            </Button>
                                        </Link>
                                    )}

                                    {isMatched ? (
                                        <Link href={`/dashboard/submissions/${sub.id}/insights`}>
                                            <Button className={`w-full h-9 ${isLocked ? 'bg-slate-200 text-slate-500' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'} text-sm`}>
                                                {isLocked ? '🔒 Insights Locked' : 'View Insights'}
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button
                                            className="w-full h-9 bg-slate-900 text-white text-sm"
                                            onClick={() => handleMatch(sub.id)}
                                            disabled={sub.status === 'pending' || !sub.analysis}
                                        >
                                            Find Peer Match
                                        </Button>
                                    )}
                                </div>

                            </Card>
                        );
                    })}
                </div>
            )}
        </DashboardShell>
    );
}
