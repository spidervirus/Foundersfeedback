'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/client';

interface Analysis {
  positioning: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  icp: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  differentiation: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  pricing: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
}

export default function AnalysisPage() {
  const params = useParams();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchAnalysis = async () => {
      const id = params.id as string;

      // 1. Try Local Storage (Legacy/Guest flow)
      const storedData = localStorage.getItem(id); // ID is already likely the key
      if (storedData) {
        console.log("Found in local storage");
        setAnalysis(JSON.parse(storedData));
        setLoading(false);
        return;
      }

      // 2. Try Supabase (DB flow)
      // Check if ID looks like a UUID (simple check)
      if (id.length > 30 && !id.startsWith('analysis-')) {
        try {
          const { data, error } = await supabase
            .from('analyses')
            .select('full_report')
            .eq('id', id)
            .single();

          if (data && data.full_report) {
            console.log("Found in DB");
            setAnalysis(data.full_report as Analysis);
          } else if (error) {
            console.log("DB Error or not found:", error);
          }
        } catch (err) {
          console.error("Error fetching from DB:", err);
        }
      }

      setLoading(false);
    };

    fetchAnalysis();
  }, [params.id, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading your analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md text-center p-10 bg-white border-slate-100 shadow-xl">
          <div className="text-6xl mb-6">🔍</div>
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Analysis Not Found</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            We couldn't find this analysis. It may have expired or the link is incorrect.
          </p>
          <Link href="/submit">
            <Button size="lg" className="bg-blue-600 text-white shadow-lg shadow-blue-600/20">Submit New Analysis</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const dimensions = [
    {
      key: 'positioning',
      title: 'Positioning Clarity',
      icon: '🎯',
      color: 'bg-blue-500',
      bg: 'bg-blue-50',
      text: 'text-blue-700'
    },
    {
      key: 'icp',
      title: 'ICP Clarity',
      icon: '👥',
      color: 'bg-purple-500',
      bg: 'bg-purple-50',
      text: 'text-purple-700'
    },
    {
      key: 'differentiation',
      title: 'Differentiation',
      icon: '⚡',
      color: 'bg-orange-500',
      bg: 'bg-orange-50',
      text: 'text-orange-700'
    },
    {
      key: 'pricing',
      title: 'Pricing Logic',
      icon: '💰',
      color: 'bg-green-500',
      bg: 'bg-green-50',
      text: 'text-green-700'
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'error';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Strong';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Needs Work';
    return 'Critical';
  };

  const averageScore = Math.round(
    (analysis.positioning.score +
      analysis.icp.score +
      analysis.differentiation.score +
      analysis.pricing.score) /
    4
  );

  return (
    <main className="min-h-screen py-24 px-4 bg-slate-50 text-slate-900">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 border border-green-200 mb-6 shadow-sm">
            <span className="text-sm font-bold text-green-700">
              ✓ Analysis Complete
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6 text-slate-900 leading-tight">
            Your <span className="text-blue-600">Strategic Feedback</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Here's what we found about your positioning, ICP, differentiation, and pricing
          </p>
        </div>

        {/* Overall Score */}
        <Card className="p-10 mb-12 text-center bg-white shadow-xl border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-left">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Overall Score</h2>
            <p className="text-slate-500">Based on AI analysis of your landing page</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-7xl font-black text-slate-900 tracking-tighter">
              {averageScore}<span className="text-3xl text-slate-400 font-medium">/10</span>
            </div>
            <Badge variant={getScoreColor(averageScore)} className="text-lg px-6 py-2 h-fit">
              {getScoreLabel(averageScore)}
            </Badge>
          </div>
        </Card>

        {/* Detailed Analysis */}
        <div className="space-y-8">
          {dimensions.map((dim, index) => {
            const data = analysis[dim.key as keyof Analysis];
            return (
              <Card
                key={dim.key}
                className="p-8 animate-slideUp bg-white shadow-md hover:shadow-lg transition-shadow border-slate-100"
                style={{ animationDelay: `${index * 0.1}s` } as React.CSSProperties}
              >
                <div className="flex items-start gap-6 mb-8">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${dim.bg} ${dim.text}`}>
                    {dim.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-2xl font-bold text-slate-900">{dim.title}</h3>
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-slate-900">{data.score}/10</span>
                        <Badge variant={getScoreColor(data.score)}>
                          {getScoreLabel(data.score)}
                        </Badge>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${dim.color} transition-all duration-1000 ease-out`}
                        style={{ width: `${data.score * 10}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                      📝 Feedback
                    </h4>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      {data.feedback}
                    </p>
                  </div>

                  <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                    <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                      💡 Suggestions
                    </h4>
                    <ul className="space-y-3">
                      {data.suggestions.map((suggestion, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <span className="text-blue-500 font-bold mt-0.5">→</span>
                          <span className="text-slate-700 font-medium">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Next Steps */}
        <Card className="p-12 mt-16 text-center bg-slate-900 text-white shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">What's Next?</h2>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto text-lg">
              Want to get peer founder reviews on top of this AI analysis?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-10">Go to Dashboard →</Button>
              </Link>
              <Link href="/submit">
                <Button variant="outline" size="lg" className="border-slate-700 text-white hover:bg-slate-800 hover:text-white hover:border-slate-600 font-medium">
                  Submit Another Product
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
