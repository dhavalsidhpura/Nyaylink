'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setErrorMsg(res.error);
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setErrorMsg('Failed to sign in. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block bg-[#0E7490] text-white font-black text-2xl px-4 py-1.5 rounded-2xl font-mono shadow-md border border-cyan-400/30">
          Nyaya<span className="text-[#F4B942]">Link</span>
        </Link>
        <h2 className="mt-4 text-2xl font-extrabold text-[#073B5C]">Sign in to your account</h2>
        <p className="mt-1 text-xs text-slate-500">Access your compliance workspace and legal vault</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200 shadow-xl space-y-5">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-semibold">
              {errorMsg}
            </div>
          )}

          <form className="space-y-4 text-xs" onSubmit={handleLogin}>
            <div>
              <label className="block font-bold text-[#073B5C] mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#073B5C] mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#073B5C] hover:bg-[#0E7490] disabled:bg-slate-300 text-[#F4B942] font-black py-3.5 rounded-xl uppercase tracking-wider transition-all shadow cursor-pointer text-xs"
            >
              {loading ? 'Authenticating...' : 'Sign In →'}
            </button>
          </form>

          <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-[#0E7490] hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}