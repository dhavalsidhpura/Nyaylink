'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#F0F4F8', color: '#1e293b' }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <header style={{ backgroundColor: '#073B5C', padding: '16px 24px', borderBottom: '1px solid rgba(14, 116, 144, 0.4)', color: '#ffffff' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <a href="/" style={{ backgroundColor: '#0E7490', color: '#ffffff', fontWeight: 900, fontSize: '20px', padding: '4px 14px', borderRadius: '12px', textDecoration: 'none' }}>
                Nyaya<span style={{ color: '#F4B942' }}>Link</span>
              </a>
              <span style={{ fontSize: '12px', color: '#67e8f9', fontWeight: 600 }}>
                Direct Legal &amp; Corporate Compliance Portal
              </span>
            </div>
          </header>

          <main style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
            <div style={{ maxWidth: '480px', width: '100%', backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '32px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', backgroundColor: '#fff1f2', border: '2px solid #fda4af', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '32px' }}>
                🛡️
              </div>
              <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#be123c', backgroundColor: '#ffe4e6', padding: '4px 12px', borderRadius: '9999px', marginBottom: '12px' }}>
                System Reconnecting
              </span>
              <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#073B5C', margin: '0 0 8px 0' }}>
                Database Reconnecting
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: '0 0 20px 0' }}>
                Our statutory database is currently waking up or synchronizing with government registries. Your records and uploaded vaults are completely safe.
              </p>

              {error.digest && (
                <div style={{ backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '11px', color: '#64748b', marginBottom: '20px' }}>
                  Error Digest: {error.digest}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => reset()}
                  style={{ backgroundColor: '#073B5C', color: '#F4B942', fontWeight: 900, fontSize: '12px', padding: '14px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', border: 'none', cursor: 'pointer' }}
                >
                  🔄 Retry Connection
                </button>
                <a
                  href="/"
                  style={{ backgroundColor: '#f1f5f9', color: '#073B5C', fontWeight: 800, fontSize: '12px', padding: '12px', borderRadius: '12px', textDecoration: 'none' }}
                >
                  ← Return to Home
                </a>
                <a
                  href="https://wa.me/919920054785?text=Hello%20NyayaLink%20I%20hit%20a%20database%20reconnection%20screen"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ backgroundColor: '#059669', color: '#ffffff', fontWeight: 800, fontSize: '12px', padding: '12px', borderRadius: '12px', textDecoration: 'none' }}
                >
                  💬 WhatsApp Support (+91 9920054785)
                </a>
              </div>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
