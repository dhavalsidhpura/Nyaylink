'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  body: string;
  isInternal: boolean;
  isQuery: boolean;
  createdAt: string;
  author: { name: string; role: string };
}

export default function OrderMessages({ orderNumber, mode }: { orderNumber: string; mode: 'client' | 'staff' }) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState('');
  const [kind, setKind] = useState<'message' | 'query' | 'internal'>('message');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}/messages`);
    const data = await res.json();
    if (data.success) setMessages(data.messages);
  }, [orderNumber]);

  useEffect(() => {
    load();
  }, [load]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, isQuery: kind === 'query', isInternal: kind === 'internal' }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Could not send message.');
        return;
      }
      setBody('');
      setKind('message');
      await load();
      router.refresh(); // status may have changed (query raised / answered)
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <h3 className="font-extrabold text-[#073B5C] text-sm">{mode === 'staff' ? 'Client Conversation & Notes' : 'Messages with your compliance desk'}</h3>
      </div>
      <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
        {messages.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No messages yet.</p>}
        {messages.map((m) => {
          const fromClient = m.author.role === 'CLIENT';
          return (
            <div key={m.id} className={`flex ${fromClient === (mode === 'client') ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs space-y-1 ${
                  m.isInternal
                    ? 'bg-yellow-50 border border-yellow-200 text-yellow-900'
                    : m.isQuery
                    ? 'bg-orange-50 border border-orange-200 text-orange-900'
                    : fromClient
                    ? 'bg-[#073B5C] text-white'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                <div className="flex gap-2 items-center text-[10px] opacity-80 font-bold">
                  <span>{m.author.name}</span>
                  {m.isInternal && <span className="uppercase">· Internal note</span>}
                  {m.isQuery && <span className="uppercase">· Query</span>}
                  <span className="font-normal">{new Date(m.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={send} className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
        {mode === 'staff' && (
          <div className="flex flex-wrap gap-2 text-[11px] font-bold">
            {([
              ['message', 'Message client'],
              ['query', 'Raise query (needs response)'],
              ['internal', 'Internal note'],
            ] as const).map(([value, label]) => (
              <button
                type="button"
                key={value}
                onClick={() => setKind(value)}
                className={`px-3 py-1.5 rounded-full border ${kind === value ? 'bg-[#073B5C] text-[#F4B942] border-[#073B5C]' : 'bg-white text-slate-600 border-slate-300'}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            maxLength={4000}
            placeholder={mode === 'client' ? 'Ask a question or reply to your desk…' : 'Write a message…'}
            className="flex-1 bg-white border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
          />
          <button
            type="submit"
            disabled={sending || !body.trim()}
            className="bg-[#073B5C] hover:bg-[#0E7490] disabled:bg-slate-300 text-[#F4B942] font-bold text-xs px-4 rounded-xl cursor-pointer"
          >
            {sending ? '…' : 'Send'}
          </button>
        </div>
        {error && <p className="text-[11px] text-rose-700 font-semibold">{error}</p>}
      </form>
    </div>
  );
}
