'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import type { PackageItem } from '@/data/packages';
import { formatINR } from '@/lib/pricing';
import { BRAND } from '@/lib/constants';

export interface ServiceCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  displayTitle: string;
  displaySac: string;
  signedIn: boolean;
  effectivePackage: PackageItem | null;
  otpStep: 'form' | 'otp';
  setOtpStep: (step: 'form' | 'otp') => void;
  fullName: string;
  setFullName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  aadhaarPhone: string;
  setAadhaarPhone: (v: string) => void;
  entityName: string;
  setEntityName: (v: string) => void;
  entityNameChoice2: string;
  setEntityNameChoice2: (v: string) => void;
  consent: boolean;
  setConsent: (v: boolean) => void;
  isPureService: boolean;
  isStateSpecificService: boolean;
  selectedState: string;
  payAdvance: boolean;
  totalEstimatedCost: number;
  activePayAmount: number;
  checkoutError: string;
  setCheckoutError: (v: string) => void;
  pendingOrder: string | null;
  isProcessing: boolean;
  otpCode: string;
  setOtpCode: (v: string) => void;
  otpCooldown: number;
  onSubmitForm: (e: React.FormEvent) => void;
  onVerifyOtp: (e: React.FormEvent) => void;
  onResendOtp: () => void;
  onSaveDraftAndSignIn: () => void;
}

export default function ServiceCheckoutModal({
  isOpen,
  onClose,
  displayTitle,
  displaySac,
  signedIn,
  effectivePackage,
  otpStep,
  setOtpStep,
  fullName,
  setFullName,
  phone,
  setPhone,
  email,
  setEmail,
  aadhaarPhone,
  setAadhaarPhone,
  entityName,
  setEntityName,
  entityNameChoice2,
  setEntityNameChoice2,
  consent,
  setConsent,
  isPureService,
  isStateSpecificService,
  selectedState,
  payAdvance,
  totalEstimatedCost,
  activePayAmount,
  checkoutError,
  setCheckoutError,
  pendingOrder,
  isProcessing,
  otpCode,
  setOtpCode,
  otpCooldown,
  onSubmitForm,
  onVerifyOtp,
  onResendOtp,
  onSaveDraftAndSignIn,
}: ServiceCheckoutModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Express Filing Setup"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs font-black uppercase text-[#0E7490] tracking-wider block">
              Express Filing Setup
            </span>
            <h3 className="text-base sm:text-lg font-black text-[#073B5C]">
              {displayTitle}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close checkout dialog"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer transition shrink-0"
          >
            ✕
          </button>
        </div>

        {otpStep === 'form' ? (
          <form onSubmit={onSubmitForm} className="space-y-4 text-xs">
            {effectivePackage && (
              <div className="p-3 bg-gradient-to-r from-[#073B5C] to-[#0E7490] text-white rounded-2xl space-y-1">
                <span className="bg-[#F4B942] text-[#073B5C] text-[11px] font-black uppercase px-2 py-0.5 rounded-full inline-block">
                  Bundled Package • Save {effectivePackage.savingsPercent}%
                </span>
                <h4 className="font-bold text-xs">{effectivePackage.title}</h4>
                <p className="text-xs text-cyan-100">
                  Includes: {effectivePackage.includedServices.map((s) => s.name).join(' + ')}
                </p>
              </div>
            )}

            {!signedIn && (
              <div className="p-2.5 bg-cyan-50 border border-cyan-200 rounded-xl text-xs text-[#073B5C] flex items-center gap-2">
                <span className="text-base">⚡</span>
                <span>No separate sign-up required. Fast 1-click mobile verification will secure your booking room.</span>
              </div>
            )}

            <div>
              <label className="block font-bold text-[#073B5C] mb-1">
                Applicant Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#073B5C] mb-1">
                WhatsApp / Mobile Number (+91) *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#073B5C] mb-1">
                Official Business Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rahul@mycompany.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
              />
              <span className="text-xs text-cyan-800 bg-cyan-50 border border-cyan-200 p-2 rounded-lg block mt-1.5 leading-relaxed">
                🛡️ <strong>Statutory Ownership Guarantee:</strong> Your certificates and government portal credentials will be officially tied to this email.
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-[#073B5C]">
                  Director&apos;s UIDAI Aadhaar-Linked Mobile
                </label>
                <span className="text-[11px] text-slate-400">If different</span>
              </div>
              <input
                type="tel"
                value={aadhaarPhone}
                onChange={(e) => setAadhaarPhone(e.target.value)}
                placeholder="Same as WhatsApp mobile above (optional)"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
              />
            </div>

            {isPureService ? (
              <div>
                <label className="block font-bold text-[#073B5C] mb-1">
                  Business / Entity / Client Name *
                </label>
                <input
                  type="text"
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  placeholder="e.g. Acme Enterprises or Personal Name"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#073B5C] mb-1">
                    {isStateSpecificService ? 'Proposed Company Name (1st Choice)' : 'Registered Name / Trademark'}
                  </label>
                  <input
                    type="text"
                    value={entityName}
                    onChange={(e) => setEntityName(e.target.value)}
                    placeholder="e.g. Acme Innovations"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#073B5C] mb-1">
                    2nd Choice (Optional)
                  </label>
                  <input
                    type="text"
                    value={entityNameChoice2}
                    onChange={(e) => setEntityNameChoice2(e.target.value)}
                    placeholder="e.g. Acme Technologies"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                  />
                </div>
              </div>
            )}

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">
                  {isPureService ? 'Place of Supply (GST):' : 'Jurisdiction:'} {selectedState}
                </span>
                <strong className="text-slate-800 text-xs">
                  {payAdvance ? '₹999 Booking Token' : 'Full Payment'}
                </strong>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Total Scope (incl. GST &amp; Govt):</span>
                <strong className="text-emerald-700 text-sm font-black">
                  {formatINR(totalEstimatedCost)}
                </strong>
              </div>
            </div>

            {isPureService ? (
              <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl space-y-1 text-xs text-emerald-900 leading-snug">
                <span className="font-extrabold flex items-center gap-1 text-emerald-950">
                  <span>📑</span> B2B GST Invoicing &amp; Input Tax Credit (ITC):
                </span>
                <p>
                  A 100% compliant GST tax invoice with SAC {displaySac} will be generated for your business.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl space-y-1 text-xs text-amber-900 leading-snug">
                <span className="font-extrabold flex items-center gap-1 text-amber-950">
                  <span>🏛️</span> Statutory Pass-Through Disclosure (Rule 33 CGST):
                </span>
                <p>
                  Government stamp duties and ROC/IP India fees are non-refundable statutory disbursements paid at actuals as a pure agent.
                </p>
              </div>
            )}

            {payAdvance && (
              <div className="p-3 bg-cyan-50/80 border border-cyan-200/80 rounded-xl text-xs text-[#073B5C] leading-snug">
                <strong>ℹ️ Advance Token Scope:</strong>{' '}
                {isPureService
                  ? 'Locks in your assigned Chartered Accountant, onboarding briefing, and preliminary review.'
                  : 'Locks in Name Availability Search, conflict cross-check, and CA intake review.'}
              </div>
            )}

            <label className="flex items-start gap-2 text-xs text-slate-600 leading-snug cursor-pointer">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 accent-[#0E7490]"
              />
              <span>
                I agree to NyayaLink&apos;s{' '}
                <Link href="/terms" target="_blank" className="underline text-[#0E7490]">Terms</Link>,{' '}
                <Link href="/privacy" target="_blank" className="underline text-[#0E7490]">Privacy Policy</Link>,{' '}
                <Link href="/refund-policy" target="_blank" className="underline text-[#0E7490]">Refund Policy</Link>.
              </span>
            </label>

            {checkoutError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-bold">
                {checkoutError}
                {pendingOrder && (
                  <div className="pt-1">
                    <Link href={`/orders/${pendingOrder}`} className="underline text-[#073B5C]">
                      Open Saved Order #{pendingOrder} →
                    </Link>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing || !fullName || phone.length < 10 || !email}
              className="w-full bg-[#073B5C] hover:bg-[#0E7490] disabled:bg-slate-300 text-[#F4B942] font-black text-xs py-3.5 rounded-xl uppercase tracking-wider transition shadow cursor-pointer flex items-center justify-center gap-2"
            >
              {isProcessing
                ? 'Connecting Gateway…'
                : signedIn
                ? `Confirm & Pay ${formatINR(activePayAmount)} →`
                : `Verify & Pay ${formatINR(activePayAmount)} →`}
            </button>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>🔒 100% Paperless &amp; SSL Secured</span>
              {!signedIn && (
                <button
                  type="button"
                  onClick={onSaveDraftAndSignIn}
                  className="text-[#0E7490] font-bold hover:underline cursor-pointer"
                >
                  Sign in with Password →
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-xs animate-fadeIn">
            <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-2xl text-xs text-[#073B5C] space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <span>📱</span> Enter Verification Code
              </div>
              <p>
                We sent a 6-digit one-time code to <strong className="font-mono text-slate-800">{phone || email}</strong>.
              </p>
            </div>

            <form onSubmit={onVerifyOtp} className="space-y-4">
              <div>
                <label className="block font-bold text-[#073B5C] mb-1 text-center">
                  6-Digit One-Time Password (OTP) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  autoFocus
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-3 text-center text-xl font-mono tracking-widest font-black focus:outline-none focus:border-[#0E7490]"
                />
              </div>

              {checkoutError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-bold">
                  {checkoutError}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => {
                    setOtpStep('form');
                    setCheckoutError('');
                  }}
                  className="text-[#0E7490] font-bold hover:underline cursor-pointer"
                >
                  ← Change Details
                </button>

                {otpCooldown > 0 ? (
                  <span className="text-slate-400 font-mono">Resend in {otpCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={onResendOtp}
                    disabled={isProcessing}
                    className="text-[#073B5C] font-extrabold hover:underline cursor-pointer"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isProcessing || otpCode.length < 4}
                className="w-full bg-[#073B5C] hover:bg-[#0E7490] disabled:bg-slate-300 text-[#F4B942] font-black text-xs py-3.5 rounded-xl uppercase tracking-wider transition shadow cursor-pointer flex items-center justify-center gap-2"
              >
                {isProcessing ? 'Verifying & Opening Payment…' : `Verify & Launch Payment (${formatINR(activePayAmount)}) →`}
              </button>
            </form>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#073B5C] flex items-center gap-1">
                  <span>🎧</span> OTP Delayed?
                </span>
                <span className="text-[11px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                  DLT Telecom Delay Rescue
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-tight">
                If TRAI telecom scrubbing delays your SMS code, get instant verification assistance:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${BRAND.phoneTel}`}
                  className="bg-white border border-slate-300 hover:border-[#0E7490] text-[#073B5C] p-2 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition"
                >
                  <span>📞</span> Call CA Desk
                </a>
                <a
                  href={`https://wa.me/919920054785?text=${encodeURIComponent(
                    `Hi NyayaLink Support, I am booking ${displayTitle} with phone ${phone || email} and need instant verification assistance.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition"
                >
                  <span>💬</span> WhatsApp Desk
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
