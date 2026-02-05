'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, TextArea } from '@/components/ui/Input';

function SubmitFormContents() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    landingPageUrl: '',
    pricingPageUrl: '',
    targetCustomer: '',
    valueProp: '',
    stage: 'pre-revenue' as 'pre-revenue' | 'early-mrr' | 'scaling' | 'established',
    productType: 'b2b-saas' as 'b2b-saas' | 'b2c' | 'marketplace' | 'other',
    parentId: '',
  });

  useEffect(() => {
    const parentId = searchParams.get('parentId');
    if (parentId) {
      setFormData(prev => ({
        ...prev,
        parentId: parentId || '',
        landingPageUrl: searchParams.get('url') || '',
        targetCustomer: searchParams.get('customer') || '',
        valueProp: searchParams.get('prop') || '',
        productType: (searchParams.get('type') as any) || 'b2b-saas',
        stage: (searchParams.get('stage') as any) || 'pre-revenue',
      }));
    }
  }, [searchParams]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.landingPageUrl) {
        newErrors.landingPageUrl = 'Landing page URL is required';
      } else if (!formData.landingPageUrl.match(/^https?:\/\/.+/)) {
        newErrors.landingPageUrl = 'Please enter a valid URL';
      }
    }

    if (currentStep === 2) {
      if (!formData.targetCustomer || formData.targetCustomer.length < 10) {
        newErrors.targetCustomer = 'Please describe your target customer (at least 10 characters)';
      }
      if (!formData.valueProp || formData.valueProp.length < 10) {
        newErrors.valueProp = 'Please describe your value proposition (at least 10 characters)';
      }
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
        // Store analysis in localStorage for MVP
        localStorage.setItem(data.analysisId, JSON.stringify(data.analysis));
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
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-heading mb-4 text-slate-900">
          {formData.parentId ? 'Iterate Your' : 'Get Your'} <span className="text-blue-600">Feedback</span>
        </h1>
        <p className="text-lg text-slate-500">
          {formData.parentId ? 'Compare your new landing page version with the previous one.' : 'Submit your product and get AI analysis + peer reviews'}
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${s === step
                ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-600/30'
                : s < step
                  ? 'bg-green-500 text-white'
                  : 'bg-white border-2 border-slate-200 text-slate-400'
                }`}
            >
              {s < step ? '✓' : s}
            </div>
            {s < 3 && (
              <div
                className={`w-12 h-1 mx-2 rounded-full ${s < step ? 'bg-green-500' : 'bg-slate-200'
                  }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card className="p-10 shadow-xl border-slate-100">
        {/* Step 1: URLs */}
        {step === 1 && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-slate-900">Step 1: Your Product</h2>
              <p className="text-slate-500">
                Share your landing page so we can analyze your positioning
              </p>
            </div>

            <div className="space-y-6">
              <Input
                label="Landing Page URL *"
                placeholder="https://yourproduct.com"
                value={formData.landingPageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, landingPageUrl: e.target.value })
                }
                error={errors.landingPageUrl}
              />

              <Input
                label="Pricing Page URL (Optional)"
                placeholder="https://yourproduct.com/pricing"
                value={formData.pricingPageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, pricingPageUrl: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleNext} size="lg" className="bg-blue-600 text-white">Next →</Button>
            </div>
          </div>
        )}

        {/* Step 2: Context */}
        {step === 2 && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-slate-900">Step 2: Your Target</h2>
              <p className="text-slate-500">
                Help us understand who you're building for
              </p>
            </div>

            <div className="space-y-6">
              <TextArea
                label="Who is your target customer? *"
                placeholder="e.g., Freelance designers who struggle with client feedback management"
                rows={3}
                value={formData.targetCustomer}
                onChange={(e) =>
                  setFormData({ ...formData, targetCustomer: e.target.value })
                }
                error={errors.targetCustomer}
              />

              <TextArea
                label="What's your value proposition? *"
                placeholder="e.g., We help designers collect, organize, and act on client feedback in one place"
                rows={3}
                value={formData.valueProp}
                onChange={(e) =>
                  setFormData({ ...formData, valueProp: e.target.value })
                }
                error={errors.valueProp}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={() => setStep(1)} size="lg">
                ← Back
              </Button>
              <Button onClick={handleNext} className="flex-1 bg-blue-600 text-white" size="lg">
                Next →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Stage */}
        {step === 3 && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-slate-900">Step 3: Your Stage</h2>
              <p className="text-slate-500">
                This helps us match you with similar founders
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Current Stage *
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'pre-revenue', label: 'Pre-Revenue' },
                  { value: 'early-mrr', label: 'Early MRR' },
                  { value: 'scaling', label: 'Scaling' },
                  { value: 'established', label: 'Established' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        stage: option.value as typeof formData.stage,
                      })
                    }
                    className={`p-4 rounded-xl border-2 transition-all font-medium ${formData.stage === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Product Type *
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'b2b-saas', label: 'B2B SaaS' },
                  { value: 'b2c', label: 'B2C' },
                  { value: 'marketplace', label: 'Marketplace' },
                  { value: 'other', label: 'Other' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        productType: option.value as typeof formData.productType,
                      })
                    }
                    className={`p-4 rounded-xl border-2 transition-all font-medium ${formData.productType === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={() => setStep(2)} size="lg">
                ← Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white"
                size="lg"
              >
                {loading ? 'Analyzing...' : 'Get My Feedback →'}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {loading && (
        <div className="mt-8 text-center animate-pulse">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-white rounded-full shadow-lg border border-slate-100">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-600 font-medium">
              Analyzing your product... This may take 20-30 seconds
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SubmitPage() {
  return (
    <main className="min-h-screen py-24 px-4 bg-slate-50 text-slate-900">
      <Suspense fallback={
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading form...</p>
        </div>
      }>
        <SubmitFormContents />
      </Suspense>
    </main>
  );
}
