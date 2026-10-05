'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

const inputCls =
  'w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E7490]';
const labelCls = 'block font-bold text-[#073B5C] mb-1';
const primaryBtn =
  'w-full bg-[#073B5C] hover:bg-[#0E7490] disabled:bg-slate-300 text-[#F4B942] font-black py-3.5 rounded-xl uppercase tracking-wider transition-all shadow cursor-pointer text-xs';

/** Only allow same-site relative redirects. */
function safeCallback(raw: string | null) {
  return raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/dashboard';
}

function LoginForm() {
  const router = useRouter();
  const callbackUrl = safeCallback(useSearchParams()?.get('callbackUrl') ?? null);

  const [method, setMethod] = useState<'otp' | 'password'>('otp');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP state
  const [identifier, setIdentifier] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [channel, setChannel] = useState<'email' | 'phone'>('phone');

  // Password state
  const [pwEmail, setPwEmail] = useState('');
  const [password, setPassword] = useState('');

  const done = () => {
    router.push(callbackUrl);
    router.refresh();
  };

  const requestCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error || 'Could not send the code.');
        return;
      }
      setCodeSent(true);
      setIsNewUser(data.isNewUser);
      setChannel(data.channel);
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const res = await signIn('otp', {
      redirect: false,
      identifier,
      code,
      name,
      email: channel === 'phone' ? email : '',
      consent: String(consent),
    });
    setLoading(false);
    if (res?.error) {
      if (res.error === 'NEW_USER_DETAILS_REQUIRED') {
        setIsNewUser(true);
        setErrorMsg('Please tell us your name to create your account.');
      } else setErrorMsg(res.error);
      return;
    }
    done();
  };

  const passwordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const res = await signIn('credentials', { redirect: false, email: pwEmail, password });
    setLoading(false);
    if (res?.error) {
      setErrorMsg(res.error);
      return;
    }
    done();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <Link href="/" className="inline-block bg-[#0E7490] text-white font-black text-2xl px-4 py-1.5 rounded-2xl font-mono shadow-md border border-cyan-400/30">
          Nyaya<span className="text-[#F4B942]">Link</span>
        </Link>
        <h2 className="mt-4 text-2xl font-extrabold text-[#073B5C]">Sign in or create an account</h2>
        <p className="mt-1 text-xs text-slate-500">Track filings, upload documents, and book verified lawyers</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200 shadow-xl space-y-5">
          <div className="grid grid-cols-2 bg-slate-100 rounded-xl p-1 text-xs font-bold" role="tablist">
            {(['otp', 'password'] as const).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={method === m}
                onClick={() => {
                  setMethod(m);
                  setErrorMsg('');
                }}
                className={`py-2 rounded-lg cursor-pointer ${method === m ? 'bg-white text-[#073B5C] shadow' : 'text-slate-500'}`}
              >
                {m === 'otp' ? 'One-time code' : 'Password'}
              </button>
            ))}
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-semibold" role="alert">
              {errorMsg}
            </div>
          )}

          {method === 'otp' && !codeSent && (
            <form className="space-y-4 text-xs" onSubmit={requestCode}>
              <div>
                <label htmlFor="identifier" className={labelCls}>
                  Mobile number or email
                </label>
                <input
                  id="identifier"
                  required
                  autoComplete="username"
                  inputMode="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="98XXXXXXXX or name@company.com"
                  className={inputCls}
                />
              </div>
              <button type="submit" disabled={loading || identifier.trim().length < 5} className={primaryBtn}>
                {loading ? 'Sending…' : 'Send code →'}
              </button>
            </form>
          )}

          {method === 'otp' && codeSent && (
            <form className="space-y-4 text-xs" onSubmit={verifyCode}>
              <p className="text-slate-600">
                We sent a 6-digit code to <strong>{identifier}</strong>.{' '}
                <button type="button" onClick={() => setCodeSent(false)} className="text-[#0E7490] font-bold underline cursor-pointer">
                  Change
                </button>
              </p>
              <div>
                <label htmlFor="code" className={labelCls}>
                  Code
                </label>
                <input
                  id="code"
                  required
                  autoFocus
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="\d{6}"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className={`${inputCls} tracking-[0.5em] text-center font-mono text-lg`}
                />
              </div>

              {isNewUser && (
                <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <p className="font-bold text-[#073B5C]">New to NyayaLink? Just a couple of details:</p>
                  <div>
                    <label htmlFor="name" className={labelCls}>
                      Full name (as on PAN)
                    </label>
                    <input id="name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
                  </div>
                  {channel === 'phone' && (
                    <div>
                      <label htmlFor="email" className={labelCls}>
                        Email (for invoices & updates)
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  )}
                  <label className="flex items-start gap-2 text-[11px] text-slate-600">
                    <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-[#0E7490]" />
                    <span>
                      I agree to the{' '}
                      <Link href="/terms" target="_blank" className="text-[#0E7490] underline">
                        Terms
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" target="_blank" className="text-[#0E7490] underline">
                        Privacy Policy
                      </Link>
                      , and consent to NyayaLink processing my data to provide the services I request.
                    </span>
                  </label>
                </div>
              )}

              <button type="submit" disabled={loading || code.length !== 6} className={primaryBtn}>
                {loading ? 'Verifying…' : isNewUser ? 'Create account →' : 'Sign in →'}
              </button>
              <button type="button" onClick={() => requestCode()} disabled={loading} className="w-full text-[#0E7490] font-bold text-xs cursor-pointer">
                Resend code
              </button>
            </form>
          )}

          {method === 'password' && (
            <form className="space-y-4 text-xs" onSubmit={passwordLogin}>
              <div>
                <label htmlFor="pw-email" className={labelCls}>
                  Email address
                </label>
                <input
                  id="pw-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={pwEmail}
                  onChange={(e) => setPwEmail(e.target.value)}
                  placeholder="name@company.com"
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="password" className={labelCls}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputCls}
                />
              </div>
              <button type="submit" disabled={loading} className={primaryBtn}>
                {loading ? 'Signing in…' : 'Sign in →'}
              </button>
              <p className="text-center text-[11px] text-slate-500">Forgot your password? Use a one-time code instead.</p>
            </form>
          )}

          <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
            Prefer a password?{' '}
            <Link href="/register" className="font-bold text-[#0E7490] hover:underline">
              Register with email
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
