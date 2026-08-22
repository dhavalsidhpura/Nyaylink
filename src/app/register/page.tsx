'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (password.length < 8) {
      setErrorMsg('Use at least 8 characters for your password.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Registration failed.');
        setLoading(false);
        return;
      }

      alert('Account registered successfully! Please sign in.');
      router.push('/login');
    } catch (err) {
      setErrorMsg('Failed to connect to registration server.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block bg-[#0E7490] text-white font-black text-2xl px-4 py-1.5 rounded-2xl font-mono shadow-md border border-cyan-400/30">
          Nyaya<span className="text-[#F4B942]">Link</span>
        </Link>
        <h2 className="mt-4 text-2xl font-extrabold text-[#073B5C]">Create Your Legal Vault</h2>
        <p className="mt-1 text-xs text-slate-500">Track company filings, GST returns, and document approvals</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200 shadow-xl space-y-5">
          {errorMsg && (
            <div role="alert" className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-semibold">
              {errorMsg}
            </div>
          )}

          <form className="space-y-4 text-xs" onSubmit={handleRegister}>
            <div>
              <label className="block font-bold text-[#073B5C] mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dhaval Sidhpura"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#073B5C] mb-1">Email Address</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#073B5C] mb-1">Mobile Number (+91)</label>
              <input
                type="tel"
                required
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9920054785"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#073B5C] mb-1">Password</label>
              <p className="mb-2 text-[11px] text-slate-500">Use at least 8 characters. Never reuse your banking or email password.</p>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#073B5C] hover:bg-[#0E7490] disabled:bg-slate-300 text-[#F4B942] font-black py-3.5 rounded-xl uppercase tracking-wider transition-all shadow cursor-pointer text-xs"
            >
              {loading ? 'Creating Account...' : 'Register Account →'}
            </button>
          </form>

          <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-[#0E7490] hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}