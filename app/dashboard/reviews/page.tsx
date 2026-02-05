'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/DashboardShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/client';

interface PodMember {
    id: string;
    user_id: string;
    submission_id: string;
    submissions: {
        landing_page_url: string;
        target_customer: string;
        value_prop: string;
    };
    profiles: {
        full_name: string;
    };
}

interface Pod {
    id: string;
    status: string;
    pod_members: PodMember[];
}

export default function ReviewsPage() {
    const [pods, setPods] = useState<Pod[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }
            setCurrentUserId(user.id);

            // Fetch pods where user is a member
            const { data: podData, error } = await supabase
                .from('review_pods')
                .select(`
          id,
          status,
          pod_members (
            id,
            user_id,
            submission_id,
            submissions (
              landing_page_url,
              target_customer,
              value_prop
            ),
            profiles (
              full_name
            )
          )
        `)
                .order('created_at', { ascending: false });

            if (podData) {
                setPods(podData as any);
            }
            setLoading(false);
        };

        fetchData();
    }, [supabase]);

    if (loading) {
        return (
            <DashboardShell>
                <div className="space-y-4 animate-pulse">
                    <div className="h-64 bg-slate-200 rounded-2xl w-full" />
                </div>
            </DashboardShell>
        );
    }

    return (
        <DashboardShell>
            <div className="mb-10">
                <h1 className="text-3xl font-bold font-heading text-slate-900 mb-2">Peer Reviews</h1>
                <p className="text-slate-500">Review other founders' startups and get feedback on yours.</p>
            </div>

            {pods.length === 0 ? (
                <Card className="text-center py-20 bg-white shadow-sm border-slate-100">
                    <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                        🤝
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-3">No active matches</h2>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">
                        Once you are matched with other founders, they will appear here.
                        Go to your dashboard to trigger a match.
                    </p>
                    <Link href="/dashboard">
                        <Button size="lg" className="bg-blue-600 text-white">Go to Dashboard</Button>
                    </Link>
                </Card>
            ) : (
                <div className="space-y-8">
                    {pods.map((pod) => (
                        <div key={pod.id} className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                                    Review Pod <span className="text-sm font-normal text-slate-400">#{pod.id.slice(0, 8)}</span>
                                </h2>
                                <Badge variant={pod.status === 'active' ? 'info' : 'success'}>
                                    {pod.status.toUpperCase()}
                                </Badge>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pod.pod_members.map((member) => {
                                    const isMe = member.user_id === currentUserId;

                                    return (
                                        <Card key={member.id} className={`bg-white border-slate-100 shadow-sm transition-all p-6 ${isMe ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:shadow-md'}`}>
                                            <div className="mb-4">
                                                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1 flex justify-between items-center">
                                                    <span>{member.profiles?.full_name || 'Founder'}</span>
                                                    {isMe && <Badge variant="info" className="text-[10px] px-2 py-0">You</Badge>}
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-900 truncate">
                                                    {member.submissions?.landing_page_url.replace(/^https?:\/\//, '')}
                                                </h3>
                                            </div>

                                            <div className="space-y-3 mb-6">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1">Target Customer</p>
                                                    <p className="text-sm text-slate-600 line-clamp-2">{member.submissions?.target_customer}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1">Value Prop</p>
                                                    <p className="text-sm text-slate-600 line-clamp-2">{member.submissions?.value_prop}</p>
                                                </div>
                                            </div>

                                            {isMe ? (
                                                <Button className="w-full bg-slate-100 text-slate-400 cursor-not-allowed" size="sm" disabled>
                                                    Your Submission
                                                </Button>
                                            ) : (
                                                <Link href={`/dashboard/reviews/${member.id}`}>
                                                    <Button className="w-full bg-slate-900 text-white hover:bg-slate-800" size="sm">
                                                        Write Review
                                                    </Button>
                                                </Link>
                                            )}
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardShell>
    );
}
