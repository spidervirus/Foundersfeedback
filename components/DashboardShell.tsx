'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

interface DashboardShellProps {
    children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
    const router = useRouter();
    const supabase = createClient();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
            } else {
                setUser(user);
            }
            setLoading(false);
        };

        getUser();
    }, [router, supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Navigation */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-8">
                            <Link href="/dashboard" className="flex-shrink-0 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-600/20">F</div>
                                <span className="text-lg font-bold tracking-tight text-slate-900 font-heading">
                                    Founder<span className="text-blue-600">Clarity</span>
                                </span>
                            </Link>

                            <div className="hidden md:flex gap-1">
                                <Link href="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-slate-900 bg-slate-100">
                                    Dashboard
                                </Link>
                                <Link href="/dashboard/reviews" className="px-3 py-2 rounded-md text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                                    Peer Reviews
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="hidden md:block text-sm font-medium text-slate-600">
                                {user.user_metadata?.full_name || user.email}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSignOut}
                                className="border-slate-200 text-slate-600 hover:bg-slate-50"
                            >
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
