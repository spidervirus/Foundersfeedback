'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, TextArea } from '@/components/ui/Input';

function SubmitFormContents() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    building: '',
    whoIsFor: '',
    painPoint: '',
    stage: 'just-an-idea',
    landingPageUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1 && !formData.building) {
      newErrors.building = 'Please describe what you are building';
    }
    if (currentStep === 2 && !formData.whoIsFor) {
      newErrors.whoIsFor = 'Please specify who this is for';
    }
    if (currentStep === 3 && !formData.painPoint) {
      newErrors.painPoint = 'Please describe the primary pain point';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    setLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/analysis/${data.analysisId}`);
      } else {
        alert(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-heading mb-4 text-slate-900">
          Founder <span className="text-blue-600">Clarity Report</span>
        </h1>
        <p className="text-lg text-slate-500">
          Tell us about your startup and get a decisive execution plan.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-10">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${s === step
                ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-600/30'
                : s < step
                  ? 'bg-green-500 text-white'
                  : 'bg-white border-2 border-slate-200 text-slate-400'
                }`}
            >
              {s < step ? '✓' : s}
            </div>
            {s < 5 && (
              <div className={`w-8 h-1 mx-1 rounded-full ${s < step ? 'bg-green-500' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      <Card className="p-10 shadow-xl border-slate-100 min-h-[400px] flex flex-col justify-between">
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-slate-900">What are you building?</h2>
              <p className="text-slate-500">1–2 clear sentences describe your product.</p>
            </div>
            <TextArea
              placeholder="e.g., A mobile app that connects local farmers with urban consumers for direct-to-door organic produce delivery."
              rows={4}
              value={formData.building}
              onChange={(e) => setFormData({ ...formData, building: e.target.value })}
              error={errors.building}
            />
            <div className="flex justify-end pt-4">
              <Button onClick={handleNext} size="lg" className="bg-blue-600 text-white">Next →</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-slate-900">Who is this for?</h2>
              <p className="text-slate-500">Be as specific as possible.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {['Solo Founders', 'SMBs', 'Students', 'Agencies', 'Other'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, whoIsFor: type })}
                  className={`p-4 rounded-xl border-2 transition-all font-medium ${formData.whoIsFor === type
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
            {formData.whoIsFor === 'Other' && (
              <Input
                placeholder="Specify your target audience"
                value={formData.whoIsFor === 'Other' ? '' : formData.whoIsFor}
                onChange={(e) => setFormData({ ...formData, whoIsFor: e.target.value })}
              />
            )}
            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={() => setStep(step - 1)} size="lg">← Back</Button>
              <Button onClick={handleNext} className="flex-1 bg-blue-600 text-white" size="lg">Next →</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-slate-900">What is the primary pain/problem?</h2>
              <p className="text-slate-500">Focus on the pain, not features.</p>
            </div>
            <TextArea
              placeholder="e.g., Urban families want fresh organic food but find farmers markets inconvenient and supermarket produce untrustworthy/expensive."
              rows={4}
              value={formData.painPoint}
              onChange={(e) => setFormData({ ...formData, painPoint: e.target.value })}
              error={errors.painPoint}
            />
            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={() => setStep(step - 1)} size="lg">← Back</Button>
              <Button onClick={handleNext} className="flex-1 bg-blue-600 text-white" size="lg">Next →</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-slate-900">Current stage</h2>
              <p className="text-slate-500">Where are you right now?</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'just-an-idea', label: 'Just an idea' },
                { id: 'building-mvp', label: 'Building MVP' },
                { id: 'launched-no-users', label: 'Launched, no users' },
                { id: 'some-users', label: 'Some users, no revenue' },
                { id: 'revenue', label: 'Revenue' },
              ].map((stage) => (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, stage: stage.id })}
                  className={`p-4 rounded-xl border-2 text-left transition-all font-medium ${formData.stage === stage.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                    }`}
                >
                  {stage.label}
                </button>
              ))}
            </div>
            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={() => setStep(step - 1)} size="lg">← Back</Button>
              <Button onClick={handleNext} className="flex-1 bg-blue-600 text-white" size="lg">Next →</Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-slate-900">Landing Page (Optional)</h2>
              <p className="text-slate-500">Provide a URL if you want us to analyze your current positioning.</p>
            </div>
            <Input
              label="URL"
              placeholder="https://yourstartup.com"
              value={formData.landingPageUrl}
              onChange={(e) => setFormData({ ...formData, landingPageUrl: e.target.value })}
            />
            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={() => setStep(step - 1)} size="lg">← Back</Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white"
                size="lg"
              >
                {loading ? 'Generating Report...' : 'Get My Clarity Report →'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function SubmitPage() {
  return (
    <main className="min-h-screen py-24 px-4 bg-slate-50 text-slate-900">
      <Suspense fallback={<p>Loading...</p>}>
        <SubmitFormContents />
      </Suspense>
    </main>
  );
}
