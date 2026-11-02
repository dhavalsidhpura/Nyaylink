'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface GovernmentCredentialsData {
  portalName: string;
  portalUrl: string;
  username: string;
  password?: string;
  arnOrCin?: string;
  remarks?: string;
  vaultedAt?: string;
  vaultedBy?: string;
}

interface Props {
  orderId: string;
  orderNumber: string;
  serviceTitle: string;
  clientName: string;
  clientPhone?: string | null;
  credentials?: GovernmentCredentialsData | null;
  mode: 'client' | 'staff';
}

const PRESET_PORTALS = [
  { name: 'GSTN Official Tax Portal', url: 'https://services.gst.gov.in/services/login', defaultArnPrefix: 'ARN' },
  { name: 'MCA V3 Corporate Registry', url: 'https://www.mca.gov.in/mcafoportal/login.do', defaultArnPrefix: 'SRN' },
  { name: 'FoSCoS FSSAI Food Safety Portal', url: 'https://foscos.fssai.gov.in/', defaultArnPrefix: 'License' },
  { name: 'DGFT Customs & IEC Portal', url: 'https://www.dgft.gov.in/CP/', defaultArnPrefix: 'IEC' },
  { name: 'IP India Trade Marks Portal', url: 'https://ipindiaservices.gov.in/eregister/eregister.aspx', defaultArnPrefix: 'TM App' },
  { name: 'Income Tax e-Filing Portal', url: 'https://eportal.incometax.gov.in/iec/foservices/#/login', defaultArnPrefix: 'PAN' },
];

export default function GovernmentCredentialLocker({
  orderId,
  orderNumber,
  serviceTitle,
  clientName,
  clientPhone,
  credentials,
  mode,
}: Props) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Staff Form state
  const [isEditing, setIsEditing] = useState(!credentials);
  const [portalName, setPortalName] = useState(credentials?.portalName || PRESET_PORTALS[0].name);
  const [portalUrl, setPortalUrl] = useState(credentials?.portalUrl || PRESET_PORTALS[0].url);
  const [username, setUsername] = useState(credentials?.username || '');
  const [password, setPassword] = useState(credentials?.password || '');
  const [arnOrCin, setArnOrCin] = useState(credentials?.arnOrCin || '');
  const [remarks, setRemarks] = useState(credentials?.remarks || '');
  const [busy, setBusy] = useState(false);

  const handlePortalSelect = (name: string) => {
    setPortalName(name);
    const found = PRESET_PORTALS.find((p) => p.name === name);
    if (found) setPortalUrl(found.url);
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/api/admin/orders/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          portalName,
          portalUrl,
          username,
          password,
          arnOrCin: arnOrCin || undefined,
          remarks: remarks || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Failed to vault credentials');
        return;
      }
      setIsEditing(false);
      router.refresh();
    } catch {
      alert('Network error while saving credentials');
    } finally {
      setBusy(false);
    }
  };

  const openOtpWhatsAppSchedule = () => {
    if (!clientPhone) {
      alert('Client phone number not available.');
      return;
    }
    const clean = clientPhone.replace(/\D/g, '');
    const phoneWithCode = clean.startsWith('91') ? clean : `91${clean}`;
    const firstName = clientName.split(' ')[0] || clientName;

    const text =
      `Namaste ${firstName} ji! 🙏\n\n` +
      `Greetings from your assigned NyayaLink CA Compliance Desk.\n\n` +
      `Your *${serviceTitle}* application for Order #${orderNumber} is 100% drafted, audited, and ready for government portal submission.\n\n` +
      `⚡ *Scheduled 2-Minute OTP Window:*\n` +
      `Are you free right now to receive the official government verification OTP on your mobile/email?\n\n` +
      `Please reply with *YES* and we will initiate the generation immediately so your application is submitted before portal cutoff!`;

    window.open(`https://wa.me/${phoneWithCode}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // CLIENT MODE VIEW
  if (mode === 'client') {
    if (!credentials) return null;

    return (
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase text-[#0E7490] tracking-wider block">
              Official Statutory Asset
            </span>
            <h3 className="text-base sm:text-lg font-black text-[#073B5C] flex items-center gap-2">
              <span>🔐</span> Official Government Portal Credential Locker
            </h3>
          </div>
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto">
            100% Client Owned
          </span>
        </div>

        <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 text-xs space-y-2 border border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">🛡️ Transparency Guarantee:</span>
            <span className="text-[11px] text-slate-300">
              You own 100% of your government credentials. NyayaLink never holds your statutory logins hostage.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Portal Name & URL */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Government Ministry Portal</span>
            <strong className="text-sm font-black text-[#073B5C] block">{credentials.portalName}</strong>
            <a
              href={credentials.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-[11px] px-3.5 py-1.5 rounded-xl transition shadow-xs"
            >
              <span>Login to Government Portal</span>
              <span>↗</span>
            </a>
          </div>

          {/* ARN / CIN / Reference */}
          {credentials.arnOrCin && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                Official Registration Reference
              </span>
              <strong className="font-mono text-sm font-black text-slate-900 block">{credentials.arnOrCin}</strong>
              <button
                onClick={() => copyToClipboard(credentials.arnOrCin!, 'arn')}
                className="text-[11px] font-bold text-[#0E7490] hover:underline cursor-pointer"
              >
                {copiedField === 'arn' ? '✓ Copied Reference!' : '📋 Copy Reference'}
              </button>
            </div>
          )}

          {/* User ID / Username */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Portal User ID / Username</span>
            <div className="flex items-center justify-between gap-2 bg-white border border-slate-300 px-3 py-2 rounded-xl">
              <span className="font-mono font-bold text-xs text-slate-900 truncate">{credentials.username}</span>
              <button
                onClick={() => copyToClipboard(credentials.username, 'username')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[10px] px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer"
              >
                {copiedField === 'username' ? '✓ Copied' : 'Copy ID'}
              </button>
            </div>
          </div>

          {/* Password */}
          {credentials.password && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                Initial / Temporary Password
              </span>
              <div className="flex items-center justify-between gap-2 bg-white border border-slate-300 px-3 py-2 rounded-xl">
                <span className="font-mono font-bold text-xs text-slate-900 truncate">
                  {showPassword ? credentials.password : '••••••••••••••••'}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-500 hover:text-slate-800 text-[10px] font-bold px-1.5 py-1"
                  >
                    {showPassword ? 'Hide' : 'Reveal'}
                  </button>
                  <button
                    onClick={() => copyToClipboard(credentials.password!, 'password')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[10px] px-2.5 py-1 rounded-lg transition cursor-pointer"
                  >
                    {copiedField === 'password' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {credentials.remarks && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
            <strong>CA Note:</strong> {credentials.remarks}
          </div>
        )}

        <div className="text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2 pt-1">
          <span>
            Vaulted securely on {new Date(credentials.vaultedAt || Date.now()).toLocaleDateString('en-IN')}{' '}
            {credentials.vaultedBy ? `by ${credentials.vaultedBy}` : ''}
          </span>
          <span className="text-emerald-700 font-bold">✓ AES-256 Encrypted in Private Vault</span>
        </div>
      </section>
    );
  }

  // STAFF MODE (CA OPERATIONS DESK)
  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-3">
        <div>
          <span className="text-[10px] font-black uppercase text-[#0E7490] tracking-wider block">
            Government Registry Handover Desk
          </span>
          <h3 className="text-base font-extrabold text-[#073B5C]">Official Portal Credentials &amp; OTP Protocol</h3>
        </div>

        <div className="flex items-center gap-2">
          {clientPhone && (
            <button
              onClick={openOtpWhatsAppSchedule}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
              title="Schedule 5-minute OTP window with client via WhatsApp"
            >
              <span>💬</span> Schedule 5-Min OTP Window
            </button>
          )}

          {credentials && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-xl transition"
            >
              Edit Credentials
            </button>
          )}
        </div>
      </div>

      {!isEditing && credentials ? (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Portal</span>
              <strong className="text-slate-900 block truncate">{credentials.portalName}</strong>
              <a href={credentials.portalUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#0E7490] hover:underline">
                Open Portal ↗
              </a>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
              <span className="text-[10px] uppercase text-slate-400 font-bold block">User ID / Username</span>
              <strong className="font-mono text-slate-900 block truncate">{credentials.username}</strong>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Vaulted Password</span>
              <strong className="font-mono text-slate-900 block truncate">
                {showPassword ? credentials.password : '••••••••••••'}
              </strong>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[10px] font-bold text-[#0E7490] hover:underline"
              >
                {showPassword ? 'Hide' : 'Reveal'}
              </button>
            </div>
          </div>

          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px] flex items-center justify-between">
            <span>✓ Published to Customer Vault ({clientName} can view and copy credentials on their dashboard).</span>
            <span className="font-mono font-bold text-[10px] text-emerald-700">Ref: {credentials.arnOrCin || '—'}</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSaveCredentials} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Government Portal Name *</label>
              <select
                value={portalName}
                onChange={(e) => handlePortalSelect(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-[#073B5C] focus:outline-none"
              >
                {PRESET_PORTALS.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Direct Government Portal Login URL *</label>
              <input
                type="url"
                required
                value={portalUrl}
                onChange={(e) => setPortalUrl(e.target.value)}
                placeholder="https://services.gst.gov.in/..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Username / Login ID *</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. MH27AABCN1234F1Z5_admin"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Password / Access Code *</label>
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="e.g. NyayaLink#2026!"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">ARN / SRN / License #</label>
              <input
                type="text"
                value={arnOrCin}
                onChange={(e) => setArnOrCin(e.target.value)}
                placeholder="e.g. AA2701260012345"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Instructions for Client (Optional)</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Please update your password and set security questions on first login."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={busy}
              className="bg-[#073B5C] hover:bg-[#0E7490] text-[#F4B942] font-black text-xs px-5 py-2.5 rounded-xl transition shadow cursor-pointer disabled:opacity-50"
            >
              {busy ? 'Vaulting...' : 'Vault Credentials & Deliver to Client Dashboard →'}
            </button>
            {credentials && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
