import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
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
              The Founder's Strategic Audit
            </div>

            <h1 className="text-5xl md:text-7xl font-bold font-heading mb-8 leading-tight tracking-tight text-slate-900">
              Get <span className="text-blue-600 italic">brutally honest</span> feedback on your pitch.
            </h1>

            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mb-12 leading-relaxed font-medium">
              Don't let a confusing landing page kill your conversion. Upload your link for an instant 30-second AI audit, then match with founders to see if they actually get what you're building.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center mb-10">
              <Link href="/submit">
                <Button size="lg" className="px-10 py-5 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 rounded-full">
                  Start Your Free Audit →
                </Button>
              </Link>
              <div className="flex items-center gap-3 text-slate-400 text-sm font-bold px-6 border-l border-slate-100 hidden sm:flex">
                Joined by founders from <br /> YC, Antler & Techstars
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { icon: '🤖', text: 'AI Logic Analysis (Positioning & ICP)' },
                { icon: '👥', text: '3 Peer Reviews from active founders' },
                { icon: '⚡', text: 'Results in under 3 minutes' },
                { icon: '🎯', text: 'Actionable 10-point checklist' }
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
                <div className="ml-4 text-[10px] text-slate-500 font-mono">analysis_report_v1.sh</div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="h-4 w-1/3 bg-slate-700 rounded-full" />
                  <div className="h-4 w-full bg-slate-800 rounded-full" />
                  <div className="h-4 w-2/3 bg-slate-800 rounded-full" />
                </div>

                <div className="p-6 bg-blue-600/10 rounded-2xl border border-blue-600/20">
                  <div className="text-[10px] font-bold text-blue-400 uppercase mb-3 tracking-widest">AI Strategic Verdict</div>
                  <div className="text-3xl font-black text-white mb-2">7.8<span className="text-xl text-slate-500 ml-1">/10</span></div>
                  <p className="text-xs text-slate-400 leading-relaxed">"Your 'Value Prop' is buried. You describe the features, but not the outcome. Move the pricing above the fold."</p>
                </div>

                <div className="flex gap-4">
                  <div className="h-20 flex-1 bg-slate-800 rounded-2xl border border-white/5 p-4">
                    <div className="text-[8px] text-slate-500 uppercase font-black mb-1">Peer 1</div>
                    <div className="h-2 w-1/2 bg-slate-700 rounded-full mb-1" />
                    <div className="h-2 w-full bg-slate-700 rounded-full" />
                  </div>
                  <div className="h-20 flex-1 bg-slate-800 rounded-2xl border border-white/5 p-4">
                    <div className="text-[8px] text-slate-500 uppercase font-black mb-1">Peer 2</div>
                    <div className="h-2 w-2/3 bg-slate-700 rounded-full mb-1" />
                    <div className="h-2 w-full bg-slate-700 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
            {/* Floating Decorative Card */}
            <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-xl border border-slate-100 z-20 hidden md:block animate-bounce-slow">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">✓</div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Feedback Received</div>
                  <div className="text-sm font-bold text-slate-900">12 AI Insights Ready</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6 text-slate-900">Simple, powerful insights.</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">We break down your business into the metrics that actually matter.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎯',
                title: 'Instant AI Score',
                desc: 'Upload your link and get a strategic breakdown in 30 seconds. No waiting.',
                bg: 'bg-blue-50',
                color: 'text-blue-600'
              },
              {
                icon: '💬',
                title: 'Peer Reviews',
                desc: 'Get matched with 3 other founders for structured, high-signal feedback.',
                bg: 'bg-purple-50',
                color: 'text-purple-600'
              },
              {
                icon: '📈',
                title: 'Action Plan',
                desc: 'Receive a clear list of what to fix: from confusing copy to pricing logic.',
                bg: 'bg-green-50',
                color: 'text-green-600'
              }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all hover:border-blue-100">
                <div className={`w-16 h-16 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Deep Dive */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="bg-slate-900 rounded-[2.5rem] p-10 relative z-10 rotate-[-1deg] border border-slate-800 text-white shadow-2xl">
              <div className="flex justify-between items-end border-b border-white/10 pb-6 mb-8">
                <div>
                  <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">AI Strategic Verdict</div>
                  <div className="text-5xl font-black">8.4<span className="text-2xl text-slate-500 font-medium ml-1">/10</span></div>
                </div>
                <Badge variant="info">Strong Positioning</Badge>
              </div>

              <div className="space-y-6 mb-8">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">AI Insight</div>
                  <p className="text-sm text-slate-300">"Your headline focuses on cost-saving, but your ICP (founders) cares more about time-to-market. Adjust your lead copy."</p>
                </div>
                <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                  <div className="text-[10px] font-bold text-purple-400 uppercase mb-2">Peer Feedback</div>
                  <p className="text-sm text-slate-300">"As a fellow B2B founder, I wouldn't pay $49/mo for this until I see an API integration. The value isn't clear enough yet."</p>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="h-2 flex-grow bg-blue-600 rounded-full" />
                <div className="h-2 w-1/3 bg-slate-700 rounded-full" />
              </div>
            </div>

            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl" />
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-8 leading-tight text-slate-900">
              The only platform that <br />
              <span className="text-blue-600 italic">checks your blindspots.</span>
            </h2>
            <p className="text-xl text-slate-500 mb-10 leading-relaxed font-medium">
              We don't just give you a score. We give you a roadmap. By combining AI-powered strategic analysis with real-world peer pressure, we help you build something people actually want.
            </p>

            <div className="space-y-6">
              {[
                { title: 'AI Positioning Analysis', desc: 'Our engine parses your copy to see if your problem-solution fit is actually clear.' },
                { title: 'The Founder Pod', desc: 'Get matched with 3 founders at your stage. Give feedback to receive feedback.' },
                { title: 'Unified Insights Report', desc: 'A master checklist that aggregates AI and human findings into actionable steps.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">{i + 1}</div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-heading mb-4 text-slate-900">Why FounderFeedback?</h2>
            <p className="text-slate-500">Unlike "roast" sites or generic AI tools, we focus on strategy.</p>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-6 text-sm font-bold text-slate-400 uppercase tracking-widest">Feedback Type</th>
                  <th className="p-6 text-sm font-bold text-blue-600 uppercase tracking-widest text-center">Our Platform</th>
                  <th className="p-6 text-sm font-bold text-slate-400 uppercase tracking-widest text-center">Others</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                <tr>
                  <td className="p-6 text-slate-700">Strategic Alignment (ICP)</td>
                  <td className="p-6 text-center text-green-500 font-bold">✓ Full Analysis</td>
                  <td className="p-6 text-center text-slate-300">Basic Roast</td>
                </tr>
                <tr>
                  <td className="p-6 text-slate-700">Peer Matching</td>
                  <td className="p-6 text-center text-green-500 font-bold">✓ Founder Pods</td>
                  <td className="p-6 text-center text-slate-300">Random Comments</td>
                </tr>
                <tr>
                  <td className="p-6 text-slate-700">Actionable Roadmap</td>
                  <td className="p-6 text-center text-green-500 font-bold">✓ Step-by-Step</td>
                  <td className="p-6 text-center text-slate-300">Generic Tips</td>
                </tr>
                <tr>
                  <td className="p-6 text-slate-700">Give-to-Receive Loop</td>
                  <td className="p-6 text-center text-green-500 font-bold">✓ Enforced</td>
                  <td className="p-6 text-center text-slate-300">Hit or Miss</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold font-heading mb-12 text-center text-slate-900">Frequently Asked</h2>
          <div className="space-y-6">
            {[
              { q: "Is the AI feedback actually good?", a: "We use specialized strategic prompts that focus on positioning and 'Time to Value' rather than just grammar or design. It acts as an expert startup advisor." },
              { q: "How does matching work?", a: "We group you with 2 other founders at a similar stage (e.g., Pre-Revenue or Early MRR). This ensures the feedback you get is from people currently in the trenches." },
              { q: "What is the 'Give-to-Receive' loop?", a: "To ensure everyone gets high-quality feedback, you must review your 2 pod-mates before you can unlock the human feedback on your own project." }
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-3">{item.q}</h4>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto bg-blue-600 rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-600/30 transform hover:scale-[1.01] transition-transform duration-500">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <h2 className="text-4xl md:text-6xl font-bold font-heading mb-8 relative z-10 italic">Ready to fix your pitch?</h2>
          <p className="text-xl text-blue-100 mb-12 max-w-xl mx-auto relative z-10 font-medium">
            Join 500+ founders getting high-signal feedback today.
          </p>

          <Link href="/submit" className="relative z-10">
            <Button size="lg" className="bg-white !text-blue-600 hover:bg-slate-50 shadow-xl px-16 py-6 text-xl font-bold rounded-full">
              Analyze My Idea Free
            </Button>
          </Link>
          <p className="mt-8 text-sm text-blue-200 relative z-10 font-medium">No credit card required • Result in 2 minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-white border-t border-slate-100 text-center text-slate-400 text-sm font-medium">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">F</div>
            <span className="font-bold text-slate-900">FounderFeedback</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Twitter</a>
          </div>
          <p>© 2026 FounderFeedback. Built for the arena.</p>
        </div>
      </footer>
    </main>
  );
}
