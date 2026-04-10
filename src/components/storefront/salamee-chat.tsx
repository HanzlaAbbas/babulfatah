'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { SalameeIcon } from '@/components/storefront/salamee-icon';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// ─── Salamee AI Chat Widget ───────────────────────────────────────────────────
// Floating AI chatbot for Bab-ul-Fatah Islamic bookstore.
// Renders via React Portal to document.body for guaranteed bottom positioning.
// Mobile: bottom sheet (85vh). Desktop: bottom-right panel (380px).
// ───────────────────────────────────────────────────────────────────────────────

export function SalameeChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Initialize with welcome message on first open
  useEffect(() => {
    if (isOpen && !hasInitialized.current) {
      hasInitialized.current = true;
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content:
            "Assalamu Alaikum! I'm Salamee, your Islamic knowledge assistant. How can I help you today? I can recommend books, answer Islamic questions, or help you find the perfect product.",
        },
      ]);
    }
  }, [isOpen]);

  // ── Send message handler ──
  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/salamee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: data.reply,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: "Sorry, I couldn't process that. Please try again.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Network error. Please check your connection and try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  if (!mounted) return null;

  return createPortal(
    <>
      {/* ═══ Floating Open Button — bottom-right ═══ */}
      {!isOpen && (
        <div style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 99999 }}>
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open Salamee AI Chat"
            className="hover:scale-105 active:scale-95 transition-transform"
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1D333B, #2A4A55)',
              color: '#C9A84C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(29,51,59,0.3), 0 0 0 3px rgba(201,168,76,0.15)',
              border: 'none',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            <SalameeIcon size={28} />
          </button>
        </div>
      )}

      {/* ═══ Chat Panel ═══ */}
      {isOpen && (
        <>
          {/* Backdrop (mobile only) */}
          <div
            className="sm:hidden"
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 99998,
            }}
          />

          {/* Responsive panel: mobile bottom-sheet, desktop side-panel */}
          <style>{`
            @media (min-width: 640px) {
              #salamee-panel {
                left: auto !important;
                right: 20px !important;
                bottom: 24px !important;
                height: auto !important;
                max-height: 500px !important;
                width: 380px !important;
              }
            }
          `}</style>

          <div
            id="salamee-panel"
            className="animate-fade-in-up"
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              height: '85vh',
              zIndex: 99999,
              background: '#fff',
              boxShadow: '0 -4px 32px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '16px 16px 0 0',
            }}
          >
            {/* ── Header ── */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: 'linear-gradient(135deg, #1D333B, #142229)',
                borderRadius: '16px 16px 0 0',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'rgba(201,168,76,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SalameeIcon size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>
                    Salamee AI
                  </h3>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', margin: 0 }}>
                    Islamic Knowledge Assistant
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* ── Messages Area ── */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      borderRadius: 16,
                      padding: '10px 14px',
                      fontSize: 13,
                      lineHeight: 1.6,
                      background: msg.role === 'user' ? '#1D333B' : '#F8F6F3',
                      color: msg.role === 'user' ? '#fff' : '#1D333B',
                      borderBottomRightRadius: msg.role === 'user' ? 6 : 16,
                      borderBottomLeftRadius: msg.role === 'user' ? 16 : 6,
                      border: msg.role === 'assistant' ? '1px solid rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div
                    style={{
                      background: '#F8F6F3',
                      borderRadius: 16,
                      borderBottomLeftRadius: 6,
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      border: '1px solid rgba(0,0,0,0.06)',
                    }}
                  >
                    <Loader2 style={{ width: 14, height: 14, color: '#1D333B', animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: 12, color: '#64748b' }}>Salamee is thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input Area ── */}
            <div
              style={{
                padding: '12px 16px',
                borderTop: '1px solid rgba(0,0,0,0.06)',
                flexShrink: 0,
                background: '#fff',
                borderRadius: '0 0 16px 16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about Islamic books..."
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    height: 40,
                    paddingLeft: 14,
                    paddingRight: 14,
                    background: '#F8F6F3',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: 20,
                    fontSize: 14,
                    color: '#1D333B',
                    outline: 'none',
                  }}
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  style={{ width: 40, height: 40, borderRadius: '50%', background: '#1D333B', flexShrink: 0 }}
                  aria-label="Send message"
                >
                  <Send style={{ width: 16, height: 16 }} />
                </Button>
              </div>
              <p style={{ fontSize: 10, textAlign: 'center', color: 'rgba(100,116,139,0.5)', marginTop: 8 }}>
                Powered by Salamee AI — Bab-ul-Fatah
              </p>
            </div>
          </div>
        </>
      )}
    </>,
    document.body
  );
}
