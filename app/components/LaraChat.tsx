'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function LaraChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const initialized = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let id = localStorage.getItem('lara_session_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('lara_session_id', id);
    }
    setSessionId(id);
  }, []);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-lara', handler);
    return () => window.removeEventListener('open-lara', handler);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const isInit = text === '__init__';

    if (!isInit) {
      setMessages(prev => [...prev, { role: 'user', content: text }]);
    }
    setTyping(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lara/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: text, context: 'website' }),
      });
      const data = await res.json();
      const delay = Math.min(Math.max(data.reply.length * 40, 1000), 4000);

      setTimeout(() => {
        setTyping(false);
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      }, delay);
    } catch {
      setTyping(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (open && sessionId && !initialized.current) {
      initialized.current = true;
      sendMessage('__init__');
    }
  }, [open, sessionId, sendMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || typing) return;
    setInput('');
    sendMessage(text);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Listar meu passeio"
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
            width: 56, height: 56, borderRadius: '50%',
            background: '#FF2924', border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(255,41,36,.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform .15s, box-shadow .15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.07)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <svg width="24" height="24" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: 360, height: 540,
          background: '#fff', borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,.15)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'laraSlideUp .2s ease',
        }}>

          {/* Header */}
          <div style={{
            background: '#FF2924', padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Lara</div>
              <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 11 }}>Envago · assistente</div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,.75)', padding: 4, lineHeight: 1,
            }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '16px 12px',
            background: '#f5f5f3', display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '80%', padding: '9px 13px', borderRadius: 12,
                  fontSize: 13, lineHeight: 1.5,
                  background: msg.role === 'user' ? '#FF2924' : '#fff',
                  color: msg.role === 'user' ? '#fff' : '#111',
                  borderBottomRightRadius: msg.role === 'user' ? 3 : 12,
                  borderBottomLeftRadius: msg.role === 'assistant' ? 3 : 12,
                  boxShadow: '0 1px 3px rgba(0,0,0,.07)',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {typing && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  background: '#fff', padding: '10px 14px', borderRadius: 12,
                  borderBottomLeftRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,.07)',
                  display: 'flex', gap: 4, alignItems: 'center',
                }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: 6, height: 6, borderRadius: '50%', background: '#ccc',
                      animation: `laraDot .9s ${i * 0.15}s infinite`,
                      display: 'inline-block',
                    }}/>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} style={{
            padding: '10px 12px', background: '#fff',
            borderTop: '1px solid #f0ede8',
            display: 'flex', gap: 8, alignItems: 'flex-end',
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escreva aqui..."
              rows={1}
              style={{
                flex: 1, resize: 'none', border: '1.5px solid #e5e5e5',
                borderRadius: 10, padding: '8px 12px', fontSize: 13,
                fontFamily: 'inherit', outline: 'none', lineHeight: 1.5,
                maxHeight: 80, overflowY: 'auto',
              }}
              onFocus={e => (e.target.style.borderColor = '#FF2924')}
              onBlur={e => (e.target.style.borderColor = '#e5e5e5')}
            />
            <button type="submit" disabled={!input.trim() || typing} style={{
              width: 36, height: 36, borderRadius: '50%',
              background: input.trim() && !typing ? '#FF2924' : '#e5e5e5',
              border: 'none', cursor: input.trim() && !typing ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'background .15s',
            }}>
              <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes laraSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes laraDot {
          0%, 60%, 100% { transform: translateY(0); opacity: .4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </>
  );
}
