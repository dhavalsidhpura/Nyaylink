'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { MASTER_SERVICES } from '@/data/services';
import { getServiceStructure } from '@/data/serviceDetails';
import { INDIAN_STATES, getStateIntakeGuidance } from '@/data/india';
import { calculateOrderTotals } from '@/lib/pricing';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function ServiceDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = (params?.slug as string) || 'private-limited-company';
  const prefilledName = searchParams?.get('name') || searchParams?.get('brand') || '';
  const prefilledState = searchParams?.get('state') || '';

  const masterService = MASTER_SERVICES.find((s) => s.slug === slug) || {
    id: 'srv-custom',
    slug: slug,
    category: 'company-reg',
    title: slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    price: 6999,
    govtFee: 'Standard Official Portal Charges Apply',
    sla: '7–10 working days',
    badge: 'NyayaLink Assured',
    sacCode: '998221',
    icon: '🏢',
    desc: 'Professional legal and statutory filing executed directly by Chartered Accountants and Legal Advocates.',
    docs: 'PAN, ID, Address Proof, Commercial Documents',
  };

  const details = getServiceStructure(slug);

  // Form States
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [isVerifyingPan, setIsVerifyingPan] = useState(false);
  const [panFormatValid, setPanFormatValid] = useState(false);

  const [businessName, setBusinessName] = useState(prefilledName);
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const stateGuidance = getStateIntakeGuidance(selectedState);
  const [location, setLocation] = useState('');
  const [entityType, setEntityType] = useState('Private Limited Company');
  const [employeeCount, setEmployeeCount] = useState('0-19');
  const [businessActivity, setBusinessActivity] = useState('');
  const [formError, setFormError] = useState('');

  // FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (prefilledName) setBusinessName(prefilledName);
  }, [prefilledName]);

  useEffect(() => {
    if (INDIAN_STATES.includes(prefilledState as (typeof INDIAN_STATES)[number])) {
      setSelectedState(prefilledState);
    }
  }, [prefilledState]);

  const estimatedTotals = calculateOrderTotals(masterService.price);
  const gstAmount = estimatedTotals.taxAmount;
  const totalDue = estimatedTotals.amount;

  const handleVerifyPAN = async () => {
    if (panNumber.length !== 10) return;
    setIsVerifyingPan(true);
    try {
      const res = await fetch('/api/verify/pan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pan: panNumber }),
      });
      const data = await res.json();
      if (data.success && data.verified && data.legalName) {
        setFullName(data.legalName);
        setPanFormatValid(true);
      } else if (data.success && data.formatValid) {
        setPanFormatValid(true);
        setFormError(data.message || 'PAN format is valid. Live verification is not enabled yet.');
      } else {
        setPanFormatValid(false);
        setFormError(data.error || 'Invalid PAN format');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifyingPan(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setFormError('');

    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceSlug: slug,
            state: selectedState,
            intakeData: {
              businessName,
              location,
              entityType,
              employeeCount,
              businessActivity,
            },
          }),
      });

      const data = await res.json();

      if (res.status === 401) {
        router.push(`/login?callbackUrl=${encodeURIComponent(`/services/${slug}`)}`);
        return;
      }

      if (!res.ok || !data.success) {
          setFormError(data.error || 'Payment gateway initialization failed.');
          setIsProcessing(false);
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: 'INR',
        name: 'NyayaLink Legal Services',
        description: `Retainer: ${businessName || details.title}`,
        order_id: data.orderId,
        prefill: { name: fullName, email, contact: phone },
        theme: { color: '#073B5C' },
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderNumber: data.orderNumber,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            router.push(`/orders/${data.orderNumber}`);
          } else {
            setFormError(verifyData.error || 'Payment verification failed.');
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        setFormError('Secure payment checkout is not available. Please try again or contact support.');
        setIsProcessing(false);
        return;
      }
    } catch (err) {
      console.error(err);
      setFormError('Network error. Please try again or contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans text-slate-800 flex flex-col antialiased pb-20 lg:pb-0">
      {/* Top Bar */}
      <header className="bg-[#073B5C] text-white py-3.5 px-4 sm:px-8 sticky top-0 z-50 border-b border-[#0E7490]/40 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="bg-[#0E7490] text-white font-black text-xl px-3.5 py-1 rounded-xl font-mono shadow border border-cyan-400/30">
              Nyaya<span className="text-[#F4B942]">Link</span>
            </Link>
            <span className="hidden sm:inline-block text-[11px] text-cyan-200 font-semibold border-l border-white/20 pl-3">
              Direct Compliance Desk
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-xs text-white/90 hover:text-white font-semibold">
              Vault Login
            </Link>
            <Link href="/#catalog-section" className="text-xs text-[#F4B942] font-extrabold hover:underline">
              ← All Services
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Strip */}
      <section className="bg-[#073B5C] text-white py-8 sm:py-10 px-4 sm:px-6 border-b border-cyan-900 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-[#0E7490] text-[#F4B942] font-extrabold text-[10px] uppercase px-3 py-1 rounded-full border border-cyan-400/30">
                ⚡ {details.badge}
              </span>
              <span className="text-cyan-200 text-xs font-mono">SAC: {masterService.sacCode}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {details.title}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {details.whyShouldBuy}
            </p>
          </div>

          <div className="flex gap-4 sm:gap-6 bg-white/10 p-3.5 sm:p-4 rounded-2xl border border-white/15 text-xs text-white">
            <div>
              <span className="text-slate-300 text-[10px] block uppercase">Timeframe</span>
              <strong className="text-sm sm:text-base font-extrabold text-[#F4B942]">{details.timeframe}</strong>
            </div>
            <div className="border-l border-white/20 pl-4 sm:pl-6">
              <span className="text-slate-300 text-[10px] block uppercase">Official Fees</span>
              <strong className="text-sm sm:text-base font-extrabold text-emerald-300">{masterService.govtFee}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dual-Column Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Structured Pattern Data (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Block 1: Who Should Buy & Why You Should Buy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-[#073B5C] font-extrabold text-sm">
                  <span>🎯</span>
                  <h4>Who Should Buy</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {details.whoShouldBuy}
                </p>
              </div>

              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-[#073B5C] font-extrabold text-sm">
                  <span>💡</span>
                  <h4>Why You Should Buy</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {details.whyShouldBuy}
                </p>
              </div>
            </div>

            {/* Block 2: Specific Documents Required */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#073B5C] flex items-center gap-2">
                    <span>📁</span> Specific Documents Required
                  </h3>
                  <p className="text-xs text-slate-500">Keep clear scanned color copies ready for instant upload:</p>
                </div>
                <span className="bg-cyan-100 text-[#0E7490] text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                  {details.specificDocs.length} Requirements
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {details.specificDocs.map((doc, idx) => (
                  <div key={idx} className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                    <span className="text-emerald-700 font-extrabold text-sm mt-0.5">✓</span>
                    <span className="text-slate-700 font-medium leading-relaxed">{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Block 3: Important Considerations */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-amber-200/80 bg-amber-50/20 shadow-sm space-y-3">
              <h3 className="text-base sm:text-lg font-extrabold text-[#073B5C] flex items-center gap-2 border-b border-amber-200/60 pb-3">
                <span>⚠️</span> Important Regulatory Considerations
              </h3>

              <div className="space-y-2 text-xs">
                {details.importantConsiderations.map((note, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-slate-700">
                    <span className="text-amber-600 font-black">•</span>
                    <span className="leading-relaxed">{note}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Block 4: Deliverables Kit */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base sm:text-lg font-extrabold text-[#073B5C] flex items-center gap-2">
                  <span>📦</span> Official Deliverables Included
                </h3>
                <p className="text-xs text-slate-500">Delivered directly to your encrypted customer vault upon approval.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {details.deliverables.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                    <strong className="text-[#073B5C] font-bold block">{item.title}</strong>
                    <p className="text-slate-500 text-[11px] leading-tight">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Block 5: FAQs Accordion */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base sm:text-lg font-extrabold text-[#073B5C] flex items-center gap-2 border-b border-slate-100 pb-3">
                <span>💡</span> Frequently Asked Questions
              </h3>

              <div className="space-y-2 text-xs">
                {details.faqs.map((faq, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full text-left p-4 font-bold text-[#073B5C] flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <span className="text-sm text-slate-400 font-mono">{openFaq === idx ? '−' : '+'}</span>
                    </button>
                    {openFaq === idx && (
                      <div className="p-4 bg-white text-slate-600 text-xs leading-relaxed border-t border-slate-100">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Sticky 3-Step Intake Widget (5 Cols) */}
          <div className="lg:col-span-5" id="intake-form-section">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xl space-y-6 sticky top-20">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-[#073B5C] text-base sm:text-lg">Filing Intake Form</h3>
                  <span className="text-[11px] text-slate-400">Step {currentStep} of 3 • Team review</span>
                </div>
                <div className="flex gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${currentStep >= 1 ? 'bg-[#0E7490]' : 'bg-slate-200'}`}></span>
                  <span className={`w-2.5 h-2.5 rounded-full ${currentStep >= 2 ? 'bg-[#0E7490]' : 'bg-slate-200'}`}></span>
                  <span className={`w-2.5 h-2.5 rounded-full ${currentStep === 3 ? 'bg-[#0E7490]' : 'bg-slate-200'}`}></span>
                </div>
              </div>

              <form onSubmit={handlePayment} className="space-y-4 text-xs">
                {formError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">{formError}</p>}
                
                {/* Step 1: Applicant Identity & PAN */}
                {currentStep === 1 && (
                  <div className="space-y-3.5">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-bold text-[#073B5C]">Applicant / Director PAN *</label>
                        {panFormatValid && <span className="text-emerald-700 font-extrabold text-[10px]">✓ Format valid</span>}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          maxLength={10}
                          value={panNumber}
                          onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                          onBlur={handleVerifyPAN}
                          placeholder="ABCDE1234F"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyPAN}
                          disabled={panNumber.length !== 10 || isVerifyingPan}
                          className="absolute right-2 top-2 bg-[#073B5C] text-[#F4B942] px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          {isVerifyingPan ? 'Checking...' : 'Check format'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#073B5C] mb-1">Applicant Full Name *</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Dhaval Sidhpura"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#073B5C] mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="dhaval@example.com"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#073B5C] mb-1">Mobile Number (+91) *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 9920054785"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={!fullName || !email || !phone}
                      onClick={() => setCurrentStep(2)}
                      className="w-full bg-[#073B5C] hover:bg-[#0E7490] disabled:bg-slate-300 text-white font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-wider transition shadow cursor-pointer"
                    >
                      Continue to Details →
                    </button>
                  </div>
                )}

                {/* Step 2: Entity Name & State */}
                {currentStep === 2 && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="font-bold text-[#073B5C] block mb-1">Proposed Entity / Brand / Case Name *</label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Acme Enterprises / Brand Name"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#073B5C] mb-1">Operational State *</label>
                        <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-bold text-[#073B5C] focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                      >
                        {INDIAN_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="font-bold text-[#073B5C] block mb-1">{stateGuidance.locationLabel} *</label>
                        <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} placeholder={stateGuidance.locationPlaceholder} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0E7490]" />
                      </div>
                      <div>
                        <label className="font-bold text-[#073B5C] block mb-1">Business type *</label>
                        <select value={entityType} onChange={(e) => setEntityType(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-bold text-[#073B5C] focus:outline-none focus:ring-2 focus:ring-[#0E7490]"><option>Private Limited Company</option><option>LLP</option><option>Proprietorship</option><option>Partnership</option><option>Individual / Freelancer</option><option>Trust / Society / NGO</option></select>
                      </div>
                      <div>
                        <label className="font-bold text-[#073B5C] block mb-1">Approx. employees</label>
                        <select value={employeeCount} onChange={(e) => setEmployeeCount(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-bold text-[#073B5C] focus:outline-none focus:ring-2 focus:ring-[#0E7490]"><option>0-19</option><option>20-49</option><option>50-99</option><option>100+</option><option>Not applicable</option></select>
                      </div>
                      <div>
                        <label className="font-bold text-[#073B5C] block mb-1">Business activity *</label>
                        <input type="text" required value={businessActivity} onChange={(e) => setBusinessActivity(e.target.value)} placeholder="e.g. food, trading, IT services" className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0E7490]" />
                      </div>
                    </div>

                    <div className="rounded-xl border border-cyan-200 bg-cyan-50/70 p-3 text-[11px] leading-relaxed text-[#073B5C]"><strong>{stateGuidance.label} checklist:</strong> {stateGuidance.note}</div>

                    <div className="p-3 bg-cyan-50/70 border border-cyan-200 rounded-xl text-[11px] text-[#073B5C]">
                      <span>Filing Service: <strong>{details.title}</strong></span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="w-1/3 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl cursor-pointer"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        disabled={!businessName || !location || !businessActivity}
                        onClick={() => setCurrentStep(3)}
                        className="w-2/3 bg-[#073B5C] hover:bg-[#0E7490] disabled:bg-slate-300 text-white font-extrabold py-3 rounded-xl uppercase tracking-wider transition cursor-pointer"
                      >
                        Review Quotation →
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Quotation & Checkout */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Professional Retainer Fee:</span>
                        <strong className="text-slate-900">₹{masterService.price.toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">GST (currently shown at 18%):</span>
                        <strong className="text-slate-900">₹{gstAmount.toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-2 font-extrabold text-[#073B5C] text-sm">
                        <span>Estimated total:</span>
                        <span className="text-emerald-700">₹{totalDue.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
                      <span className="font-bold block">Team review after payment</span>
                      <span>Your case will be routed based on state, service, and team availability after payment confirmation.</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="w-1/3 bg-slate-100 text-slate-700 font-bold py-3.5 rounded-xl cursor-pointer"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-2/3 bg-[#F4B942] hover:bg-amber-500 text-[#073B5C] font-black text-xs py-3.5 rounded-xl uppercase tracking-wider transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {isProcessing ? 'Opening Gateway...' : 'Continue to secure payment →'}
                      </button>
                    </div>
                  </div>
                )}

              </form>
            </div>
          </div>

        </div>
      </main>

      {/* Floating Bottom Bar for Mobile Devices */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#073B5C] text-white p-3 px-4 flex items-center justify-between z-40 border-t border-cyan-800 shadow-2xl">
        <div>
          <span className="text-[10px] text-slate-300 block">Estimated total</span>
          <strong className="text-base font-black text-[#F4B942]">₹{totalDue.toLocaleString()}</strong>
        </div>
        <button
          onClick={() => {
            const formElem = document.getElementById('intake-form-section');
            formElem?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-[#F4B942] text-[#073B5C] font-black text-xs px-5 py-2.5 rounded-xl uppercase tracking-wider shadow cursor-pointer"
        >
          Apply Now ↑
        </button>
      </div>

    </div>
  );
}

export default function ServicePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs">Loading service workspace...</div>}>
      <ServiceDetailContent />
    </Suspense>
  );
}