'use client';

import { useState } from 'react';

interface Props {
  orderNumber: string;
  clientPhone?: string | null;
  clientName: string;
  serviceTitle: string;
  currentStatus: string;
  srn?: string | null;
}

export default function WhatsAppNotificationCard({
  orderNumber,
  clientPhone,
  clientName,
  serviceTitle,
  currentStatus,
  srn,
}: Props) {
  const [phone, setPhone] = useState(clientPhone || '');
  const [isSending, setIsSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  const handleSendTestAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid 10-digit WhatsApp phone number.' });
      return;
    }

    setIsSending(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`/api/orders/${orderNumber}/whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isEditingPhone ? 'update_phone' : 'send_test',
          phone: phone.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg({
          type: 'success',
          text: data.simulated
            ? `✓ Simulated alert dispatched to +${data.phone} (Check server logs)`
            : `✓ Live WhatsApp notification dispatched to +${data.phone}!`,
        });
        setIsEditingPhone(false);
      } else {
        setStatusMsg({
          type: 'error',
          text: data.error?.message || data.message || 'Failed to dispatch alert. Check phone format.',
        });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Network error sending alert.' });
    } finally {
      setIsSending(false);
    }
  };

  const isComplete = currentStatus === 'APPROVED';
  const isFiled = Boolean(srn);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5 text-xs font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-xl shrink-0 shadow-sm">
            💬
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-[#073B5C]">
                WhatsApp Milestone Alert Engine
              </h3>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold px-2.5 py-0.5 rounded-full text-[10px] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Automated milestone alerts dispatched to your WhatsApp at every statutory step. Zero black box.
            </p>
          </div>
        </div>

        {phone && !isEditingPhone ? (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="font-mono font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200 text-xs">
              +{phone.replace(/\D/g, '')}
            </span>
            <button
              type="button"
              onClick={() => setIsEditingPhone(true)}
              className="text-[#0E7490] hover:underline font-bold text-[11px]"
            >
              Change
            </button>
          </div>
        ) : null}
      </div>

      {/* 4 Crucial Milestones Visual Map */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
        <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-2xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Milestone 1</span>
            <span className="text-emerald-700 font-bold text-xs">✓ Sent</span>
          </div>
          <strong className="block text-[#073B5C] text-xs font-bold">Booking &amp; CA Desk</strong>
          <p className="text-[10px] text-slate-500 leading-tight">
            Token confirmed, senior CA assigned, and KYC requirements sent.
          </p>
        </div>

        <div className={`p-3 rounded-2xl border space-y-1 ${
          currentStatus !== 'PENDING_PAYMENT' && currentStatus !== 'DOCS_PENDING'
            ? 'bg-emerald-50/70 border-emerald-200'
            : 'bg-slate-50 border-slate-200 opacity-80'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Milestone 2</span>
            <span className="text-xs font-bold text-[#0E7490]">
              {currentStatus !== 'PENDING_PAYMENT' && currentStatus !== 'DOCS_PENDING' ? '✓ Processed' : '⏳ Next'}
            </span>
          </div>
          <strong className="block text-[#073B5C] text-xs font-bold">Name Approval (ROC)</strong>
          <p className="text-[10px] text-slate-500 leading-tight">
            MCA Rule 8 clearance letter and draft e-MOA/AoA dispatch.
          </p>
        </div>

        <div className={`p-3 rounded-2xl border space-y-1 ${
          isFiled ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-80'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Milestone 3</span>
            <span className="text-xs font-bold text-[#0E7490]">
              {isFiled ? '✓ Submitted' : '⏳ Queued'}
            </span>
          </div>
          <strong className="block text-[#073B5C] text-xs font-bold">Portal SRN Challan</strong>
          <p className="text-[10px] text-slate-500 leading-tight">
            Official government filing challan and live SRN tracker link.
          </p>
        </div>

        <div className={`p-3 rounded-2xl border space-y-1 ${
          isComplete ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-80'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Milestone 4</span>
            <span className="text-xs font-bold text-[#0E7490]">
              {isComplete ? '🎉 Delivered' : '⏳ Final'}
            </span>
          </div>
          <strong className="block text-[#073B5C] text-xs font-bold">COI &amp; Tax Kit</strong>
          <p className="text-[10px] text-slate-500 leading-tight">
            21-digit CIN, certificate download link, and corporate e-PAN.
          </p>
        </div>
      </div>

      {/* Editing Phone or Disconnected state */}
      {(!phone || isEditingPhone) && (
        <form onSubmit={handleSendTestAlert} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-[#073B5C] mb-1">
                Your WhatsApp Phone Number (10 digits):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-slate-400">+91</span>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-12 pr-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-end gap-2 pt-1 sm:pt-0">
              <button
                type="submit"
                disabled={isSending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition disabled:opacity-50 text-xs shrink-0"
              >
                {isSending ? 'Sending...' : 'Save & Send Test Alert'}
              </button>
              {isEditingPhone && (
                <button
                  type="button"
                  onClick={() => setIsEditingPhone(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-3 rounded-xl transition text-xs"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      )}

      {/* Status Msg */}
      {statusMsg && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Quick Actions Row */}
      {phone && !isEditingPhone && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <span>🛡️</span>
            <span>Zero Spam Guarantee · Transactional statutory alerts only.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSending}
              onClick={handleSendTestAlert}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 px-3 rounded-xl transition text-[11px] disabled:opacity-50"
            >
              {isSending ? 'Sending...' : '⚡ Send Test WhatsApp Alert'}
            </button>

            <a
              href={`https://wa.me/919920054785?text=${encodeURIComponent(
                `Hello NyayaLink CA Desk, I am tracking Order #${orderNumber} (${serviceTitle}). Please provide an update on my filing.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl shadow-xs transition"
            >
              <span>💬</span> Chat with Assigned CA
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
