'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';
import { Navbar } from '@/components/Navbar';

export default function SignupPage() {
    const router = useRouter();
    const supabase = createClient();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                    },
                },
            });

            if (error) {
                setError(error.message);
            } else {
                // For MVP with email confirmation off, this logs them in.
                // If email confirmation is strictly on, show "Check email" message.
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
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Create Account</h1>
                        <p className="text-slate-500">Join other founders building better products</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-6">
                        <Input
                            label="Full Name"
                            type="text"
                            placeholder="Jane Founder"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            required
                            className="w-full"
                        />

                        <Input
                            label="Email"
                            type="email"
                            placeholder="you@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="w-full"
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                            {loading ? 'Creating Account...' : 'Sign Up Free'}
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700">
                            Sign in
                        </Link>
                    </div>
                </Card>
            </div>
        </main>
    );
}
