'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface IntakeFormProps {
  serviceId: string;
  serviceTitle: string;
  totalPrice: number;
}

export default function IntakeForm({ serviceId, serviceTitle, totalPrice }: IntakeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          serviceId,
          totalAmount: totalPrice,
          formData: { companyName },
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push(`/orders/${data.orderNumber}`);
      } else {
        alert(data.error || 'Failed to submit application.');
      }
    } catch (err: any) {
      alert('Application error: ' + (err.message || 'Check terminal logs.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <h3 className="text-lg font-bold text-slate-900 border-b pb-3">Apply for {serviceTitle}</h3>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name *</label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Dhaval Sidhpura"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email Address *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Mobile Number *</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 9876543210"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Proposed / Existing Company Name</label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="e.g. Acro Tech Solutions Pvt Ltd"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors mt-2 text-sm"
      >
        {loading ? 'Creating Application...' : `Submit Application (₹${totalPrice.toLocaleString('en-IN')})`}
      </button>
    </form>
  );
}