import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/Navbar';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="pt-48 pb-32 px-6 bg-white relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50 -z-10 translate-x-1/2" />
        <div className="absolute bottom-20 left-0 w-72 h-72 bg-purple-50 rounded-full blur-3xl opacity-50 -z-10 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-sm font-bold text-blue-600 mb-8">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              Decision-Driven Founder Execution System
            </div>

            <h1 className="text-5xl md:text-7xl font-bold font-heading mb-8 leading-tight tracking-tight text-slate-900">
              Stop guessing. Start <span className="text-blue-600 italic">executing.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mb-12 leading-relaxed font-medium">
              FounderClarity tells you exactly what to do next — not just what’s wrong. Get a brutally honest clarity report and a strict 7-day execution plan.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center mb-10">
              <Link href="/submit">
                <Button size="lg" className="px-10 py-5 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 rounded-full">
                  Get My Clarity Report →
                </Button>
              </Link>
              <div className="flex items-center gap-3 text-slate-400 text-sm font-bold px-6 border-l border-slate-100 hidden sm:flex">
                Used by founders to <br /> move 10x faster
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { icon: '🎯', text: 'Brutally Honest Positioning Verdict' },
                { icon: '💀', text: 'Hard Truths about your blindspots' },
                { icon: '📅', text: 'Strict 7-Day Execution Plan' },
                { icon: '✅', text: 'Interactive Task Progress Loop' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-600 font-bold text-sm">
                  <span className="text-lg">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="bg-slate-900 rounded-[3rem] p-8 shadow-2xl relative z-10 border border-slate-800 transform lg:rotate-2">
              <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-6">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="ml-4 text-[10px] text-slate-500 font-mono">clarity_report.v2</div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-blue-600/10 rounded-2xl border border-blue-600/20">
                  <div className="text-[10px] font-bold text-blue-400 uppercase mb-3 tracking-widest">Positioning Verdict</div>
                  <div className="text-xl font-bold text-white mb-2 italic">"You are building a vitamins app for people who only care about painkillers."</div>
                </div>

                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">7-Day Plan</div>
                  <div className="space-y-2">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-600 rounded text-[10px] flex items-center justify-center font-bold">D1</div>
                      <div className="h-2 w-2/3 bg-slate-700 rounded-full" />
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                      <div className="w-6 h-6 bg-slate-700 rounded text-[10px] flex items-center justify-center font-bold">D2</div>
                      <div className="h-2 w-1/2 bg-slate-800 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Philosophy */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-8 italic">"Feedback is a distraction. Execution is the cure."</h2>
          <p className="text-xl text-slate-600 leading-relaxed font-medium">
            Founders don't need more opinions. They need more clarity. We force you to lock in decisions, reveal your most uncomfortable truths, and give you a checklist that produces momentum.
          </p>
        </div>
      </section>

      {/* Simple, powerful insights */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎯',
                title: 'No-BS Advisor',
                desc: 'AI that acts as a brutally honest advisor. It makes decisions for you instead of expanding your options.',
                bg: 'bg-blue-50',
                color: 'text-blue-600'
              },
              {
                icon: '💀',
                title: 'Uncomfortable Truths',
                desc: 'We identify exactly what is weak in your positioning and where your biggest risks lie.',
                bg: 'bg-red-50',
                color: 'text-red-600'
              },
              {
                icon: '⚡',
                title: 'Momentum Loop',
                desc: 'A daily execution loop keeps you focused on the top 3-5 priorities that actually move the needle.',
                bg: 'bg-green-50',
                color: 'text-green-600'
              }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-sm hover:shadow-lg transition-all">
                <div className={`w-16 h-16 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center text-3xl mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-600/10 transition-transform duration-500">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <h2 className="text-4xl md:text-6xl font-bold font-heading mb-8 relative z-10 italic">Ready to execute?</h2>
          <p className="text-xl text-slate-400 mb-12 max-w-xl mx-auto relative z-10 font-medium">
            Get your Founder Clarity Report and start your 7-day plan in under 60 seconds.
          </p>

          <Link href="/submit" className="relative z-10">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl px-16 py-6 text-xl font-bold rounded-full border-none">
              Start Now →
            </Button>
          </Link>
          <p className="mt-8 text-sm text-slate-500 relative z-10 font-medium font-mono">Decision-Driven • Momentum-Focused</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-white border-t border-slate-100 text-center text-slate-400 text-sm font-medium">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">F</div>
            <span className="font-bold text-slate-900 italic tracking-tighter">FounderClarity</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Twitter</a>
          </div>
          <p>© 2026 FounderClarity. Not a chatbot. Not a coach. An execution engine.</p>
        </div>
      </footer>
    </main>
  );
}
