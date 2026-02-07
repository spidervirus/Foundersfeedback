'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/client';

interface Task {
    id: string;
    day: number;
    description: string;
    status?: 'done' | 'skipped';
}

interface ReportData {
    id?: string;
    positioningVerdict: string;
    brutalTruth: string;
    focusAreas: string[];
    ignoreAreas: string[];
    sevenDayPlan: Task[];
}

export function FounderReport({ data }: { data: ReportData }) {
    const [tasks, setTasks] = useState<Task[]>(data.sevenDayPlan);
    const supabase = createClient();

    const handleTaskUpdate = async (taskId: string, status: 'done' | 'skipped') => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Optimistic update
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));

            const { error } = await supabase
                .from('task_progress')
                .upsert({
                    task_id: taskId,
                    user_id: user.id,
                    status,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'task_id,user_id' });

            if (error) throw error;
        } catch (error) {
            console.error('Failed to update task progress:', error);
        }
    };

    return (
        <div className="space-y-12 max-w-4xl mx-auto pb-24">
            {/* 1. Positioning Verdict */}
            <section className="animate-fadeIn">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 border border-blue-200 mb-6 shadow-sm">
                    <span className="text-sm font-bold text-blue-700">🎯 Positioning Verdict</span>
                </div>
                <Card className="p-8 bg-white border-blue-100 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <p className="text-3xl font-black text-slate-900 leading-tight italic relative z-10">
                        "{data.positioningVerdict}"
                    </p>
                </Card>
            </section>

            {/* 2. Brutal Truth */}
            <section className="animate-fadeIn delay-100">
                <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
                    <span>💀</span> Brutal Truth
                </h3>
                <Card className="p-6 bg-red-50 border-red-100 text-red-900 font-medium leading-relaxed italic">
                    {data.brutalTruth}
                </Card>
            </section>

            <div className="grid md:grid-cols-2 gap-8">
                {/* 3. Focus Areas */}
                <section className="animate-fadeIn delay-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span>🔥</span> Focus (This Week)
                    </h3>
                    <Card className="p-6 bg-white border-slate-100 shadow-sm">
                        <ul className="space-y-4">
                            {data.focusAreas.map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="text-blue-500 font-bold">→</span>
                                    <span className="text-slate-700 font-bold">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </section>

                {/* 4. What to Ignore */}
                <section className="animate-fadeIn delay-300">
                    <h3 className="text-xl font-bold text-slate-400 mb-4 flex items-center gap-2">
                        <span>🙈</span> Ignore (For Now)
                    </h3>
                    <Card className="p-6 bg-slate-50 border-slate-200 opacity-60">
                        <ul className="space-y-4">
                            {data.ignoreAreas.map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="text-slate-400 font-bold">✕</span>
                                    <span className="text-slate-500 line-through">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </section>
            </div>

            {/* 5. 7-Day Execution Plan */}
            <section className="animate-fadeIn delay-400">
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-slate-900 mb-2">7-Day Execution Plan</h2>
                    <p className="text-slate-500 font-medium">Follow this strictly to create momentum.</p>
                </div>

                <div className="space-y-4">
                    {tasks.map((task) => (
                        <Card key={task.id} className={`p-6 bg-white border-slate-100 transition-all ${task.status === 'done' ? 'opacity-50' : 'shadow-md'}`}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shadow-sm ${task.status === 'done' ? 'bg-green-100 text-green-600' : 'bg-slate-900 text-white'
                                        }`}>
                                        D{task.day}
                                    </div>
                                    <p className={`font-bold text-lg ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                        {task.description}
                                    </p>
                                </div>

                                <div className="flex gap-2 shrink-0">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleTaskUpdate(task.id, 'done')}
                                        className={task.status === 'done' ? 'bg-green-600 text-white border-green-600' : ''}
                                    >
                                        {task.status === 'done' ? '✅ Done' : 'Mark Done'}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={task.status === 'skipped' ? 'secondary' : 'outline'}
                                        onClick={() => handleTaskUpdate(task.id, 'skipped')}
                                        disabled={task.status === 'done'}
                                    >
                                        {task.status === 'skipped' ? '💨 Skipped' : 'Skip'}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Progress Loop CTA */}
            <Card className="p-12 mt-16 text-center bg-blue-600 text-white shadow-2xl relative overflow-hidden rounded-3xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-4">You're making progress.</h2>
                    <p className="text-blue-100 mb-8 max-w-xl mx-auto text-lg">
                        Return every day to track your execution. Iteration is the only way to win.
                    </p>
                    <Button variant="outline" className="bg-white text-blue-600 border-white hover:bg-blue-50 font-bold px-10">
                        Set Reminder
                    </Button>
                </div>
            </Card>
        </div>
    );
}
