'use client';

import { DashboardShell } from '@/components/DashboardShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function ReviewsPage() {
    return (
        <DashboardShell>
            <div className="mb-10">
                <h1 className="text-3xl font-bold font-heading text-slate-900 mb-2">Market Comparison</h1>
                <p className="text-slate-500">Compare your startup to similar ideas and market patterns.</p>
            </div>

            <div className="grid gap-8">
                {/* Peer Review Deprioritization Notice */}
                <Card className="p-8 bg-slate-50 border-slate-200 border-dashed text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl mx-auto mb-6">
                        🏗️
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Peer Reviews are Being Reimagined</h2>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">
                        We are moving away from manual peer reviews to provide faster, AI-powered pattern analysis.
                        Real-world data comparison is coming soon.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="outline">Back to Dashboard</Button>
                        </Link>
                        <Button className="bg-blue-600 text-white" disabled>
                            Notify Me on Launch
                        </Button>
                    </div>
                </Card>

                {/* Temporary Replacement: Compare your startup placeholder */}
                <Card className="p-12 bg-white border-slate-100 shadow-xl relative overflow-hidden">
                    <Badge className="absolute top-4 right-4 bg-blue-100 text-blue-600 border-blue-200">Coming Soon</Badge>
                    <div className="max-w-xl">
                        <h2 className="text-2xl font-black text-slate-900 mb-4">Compare Your Startup</h2>
                        <p className="text-slate-500 mb-8 leading-relaxed">
                            We'll analyze your positioning against 1,000+ successful startups to identify patterns that lead to PMF.
                            No human reviewer needed—just pure data.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-32 bg-slate-50 rounded-xl border border-slate-100 animate-pulse" />
                            <div className="h-32 bg-slate-50 rounded-xl border border-slate-100 animate-pulse" />
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardShell>
    );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${className}`}>
            {children}
        </span>
    );
}
