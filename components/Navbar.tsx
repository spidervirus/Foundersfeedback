'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function Navbar() {
    return (
        <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-600/20 italic">F</div>
                    <span className="text-xl font-bold tracking-tight text-slate-900 font-heading italic">
                        Founder<span className="text-blue-600">Clarity</span>
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
                    <Link href="/#how-it-works" className="hover:text-blue-600 transition-colors">How it works</Link>
                    <Link href="/#features" className="hover:text-blue-600 transition-colors">Philosophy</Link>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/login">
                        <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600">Sign In</Button>
                    </Link>
                    <Link href="/submit">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">Get Clarity Report</Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
