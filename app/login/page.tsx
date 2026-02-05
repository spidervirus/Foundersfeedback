'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';
import { Navbar } from '@/components/Navbar';

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="min-h-screen py-24 px-4 flex items-center justify-center">
                <Card className="w-full max-w-md p-10 shadow-xl border-slate-100 bg-white">
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-block mb-6">
                            <span className="text-2xl font-bold font-heading text-slate-900">
                                Founder<span className="text-blue-600">Feedback</span>
                            </span>
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h1>
                        <p className="text-slate-500">Sign in to access your dashboard</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full"
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full"
                        />

                        {error && (
                            <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-500">
                        Don't have an account?{' '}
                        <Link href="/signup" className="font-bold text-blue-600 hover:text-blue-700">
                            Sign up
                        </Link>
                    </div>
                </Card>
            </div>
        </main>
    );
}
