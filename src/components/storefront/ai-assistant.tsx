'use client';

import { useChat } from 'ai/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Loader2, Minimize2, Maximize2, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import { createPortal } from 'react-dom';
import { SalameeIcon } from '@/components/storefront/salamee-icon';

// ═══════════════════════════════════════════════════════════════════════════════
// Bab-ul-Fatah AI Assistant — Powered by Real Open Source LLM
// ─────────────────────────────────────────────────────────────────────────────────
// Uses the Vercel AI SDK `useChat` hook which handles:
// - Real streaming responses (token by token from Llama 3.3 70B / Gemini)
// - Multi-turn conversation memory (automatic)
// - Loading states, error handling, message state
//
// BACKEND: Dual-provider AI route
//   PRIMARY:   Groq → Llama 3.3 70B (open source, insanely fast)
//   FALLBACK:  Google → Gemini 2.0 Flash
//   OFFLINE:   Smart topic-based responses
//
// SETUP: Add your FREE API key to Vercel:
//   GROQ_API_KEY = https://console.groq.com/keys (recommended)
//   GOOGLE_GENERATIVE_AI_API_KEY = https://aistudio.google.com/apikey (alternate)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Quick Actions ────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: 'Quran Collection', icon: '📖', query: 'Tell me about your Quran collection — translations, tajweed, and hafzi copies' },
  { label: 'Hadith Books', icon: '📜', query: 'What hadith books do you carry? I want authentic collections' },
  { label: 'Book Recs', icon: '📚', query: 'Recommend some popular Islamic books for someone getting started' },
  { label: 'Children Books', icon: '👶', query: 'What Islamic books do you have for children? Group by age please' },
  { label: 'Shipping Info', icon: '🚚', query: 'What are your shipping and payment options in Pakistan?' },
  { label: 'Prayer Mats & Products', icon: '🕌', query: 'Show me your Islamic products — prayer mats, attar, decor' },
];

// ─── Enhanced Markdown Renderer ──────────────────────────────────────────────
// Supports: **bold**, *italic*, - bullets, numbered lists, newlines

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let keyIdx = 0;

  const renderInline = (line: string, key: string) => {
    // Split by bold (**...**) and italic (*...*) patterns
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={`${key}-b${i}`} style={{ fontWeight: 600, color: '#1D333B' }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return (
          <em key={`${key}-i${i}`} style={{ fontStyle: 'italic' }}>
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines (add spacing)
    if (!trimmed) {
      elements.push(<div key={`sp-${keyIdx++}`} style={{ height: 8 }} />);
      continue;
    }

    // Bullet points (- item or * item)
    if (trimmed.match(/^[-*]\s+/)) {
      const content = trimmed.replace(/^[-*]\s+/, '');
      elements.push(
        <div key={`li-${keyIdx++}`} style={{ display: 'flex', gap: 8, paddingLeft: 4, lineHeight: 1.6 }}>
          <span style={{ color: '#C9A84C', flexShrink: 0, marginTop: 1 }}>&bull;</span>
          <span>{renderInline(content, `li-${keyIdx}`)}</span>
        </div>
      );
      continue;
    }

    // Numbered lists (1. item)
    if (trimmed.match(/^\d+\.\s+/)) {
      const match = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (match) {
        elements.push(
          <div key={`nl-${keyIdx++}`} style={{ display: 'flex', gap: 8, paddingLeft: 4, lineHeight: 1.6 }}>
            <span style={{ color: '#C9A84C', flexShrink: 0, fontWeight: 600, minWidth: 16 }}>{match[1]}.</span>
            <span>{renderInline(match[2], `nl-${keyIdx}`)}</span>
          </div>
        );
        continue;
      }
    }

    // Regular paragraph
    elements.push(
      <div key={`p-${keyIdx++}`} style={{ lineHeight: 1.65 }}>
        {renderInline(trimmed, `p-${keyIdx}`)}
      </div>
    );
  }

  return elements;
}

// ─── Chat Widget ──────────────────────────────────────────────────────────────

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // VERCEL AI SDK — useChat hook
  // Handles: streaming, conversation memory, loading, errors, everything
  // ═══════════════════════════════════════════════════════════════════════════
  const {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    error,
    setMessages,
  } = useChat({
    api: '/api/assistant',
    id: 'babulfatah-assistant',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content:
          "Assalamu Alaikum! Welcome to Bab-ul-Fatah — Pakistan's premier online Islamic bookstore. I'm your AI assistant and I can help you find the perfect Islamic books and products.\n\nI know our entire collection of 1,200+ books including Quran, Hadith, Tafseer, Seerah, Fiqh, Children's books, and Islamic products.\n\nJust ask me anything or tap a quick action below to get started!",
      },
    ],
  });

  // Quick actions visible only before first user message
  const showQuickActions = messages.filter((m) => m.role === 'user').length === 0;

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

  // Quick action handler
  const handleQuickAction = useCallback(
    (query: string) => {
      setInput(query);
      setTimeout(() => {
        const form = document.querySelector('#bf-chat-form') as HTMLFormElement;
        if (form) form.requestSubmit();
      }, 50);
    },
    [setInput]
  );

  // Clear chat
  const handleClearChat = useCallback(() => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content:
          'Assalamu Alaikum! How can I help you today? Ask me about our books, products, shipping, or any Islamic knowledge.',
      },
    ]);
  }, [setMessages]);

  // Form key handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const form = document.querySelector('#bf-chat-form') as HTMLFormElement;
        if (form && input.trim()) form.requestSubmit();
      }
    },
    [input]
  );

  return createPortal(
    <>
      {/* ═══ Floating Button ═══ */}
      {!isOpen && (
        <div style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 99999 }}>
          <div
            style={{
              position: 'absolute',
              inset: -4,
              borderRadius: '50%',
              border: '2px solid rgba(201,168,76,0.3)',
              animation: 'bf-pulse 2s ease-in-out infinite',
            }}
          />
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open AI Assistant"
            className="hover:scale-110 active:scale-95 transition-transform duration-200"
            style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1D333B 0%, #2A4A55 100%)',
              color: '#C9A84C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(29,51,59,0.4), 0 0 0 3px rgba(201,168,76,0.12)',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <SalameeIcon size={28} />
            <div
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#22C55E',
                border: '2px solid #1D333B',
              }}
            />
          </button>

          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              right: 0,
              marginBottom: 12,
              background: '#1D333B',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              padding: '6px 14px',
              borderRadius: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              whiteSpace: 'nowrap',
              opacity: 0.95,
            }}
          >
            Need help? Chat with us
            <div
              style={{
                position: 'absolute',
                bottom: -5,
                right: 20,
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid #1D333B',
              }}
            />
          </div>
        </div>
      )}

      {/* ═══ Chat Panel ═══ */}
      {isOpen && (
        <>
          {/* Backdrop (mobile) */}
          <div
            className="sm:hidden"
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 99998,
              backdropFilter: 'blur(2px)',
            }}
          />

          <style>{`
            @media (min-width: 640px) {
              #bf-assistant-panel {
                left: auto !important;
                right: 20px !important;
                bottom: 24px !important;
                height: auto !important;
                max-height: ${isExpanded ? '85vh' : '560px'} !important;
                width: 400px !important;
                border-radius: 20px !important;
              }
            }
            @keyframes bf-pulse {
              0%, 100% { transform: scale(1); opacity: 0.5; }
              50% { transform: scale(1.15); opacity: 0; }
            }
            @keyframes bf-slide-up {
              from { transform: translateY(100%); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            @keyframes bf-slide-in {
              from { transform: translateY(20px) scale(0.95); opacity: 0; }
              to { transform: translateY(0) scale(1); opacity: 1; }
            }
            #bf-assistant-panel { animation: bf-slide-up 0.3s ease-out; }
            @media (min-width: 640px) {
              #bf-assistant-panel { animation: bf-slide-in 0.25s ease-out; }
            }
            .bf-quick-btn { transition: all 0.15s ease; }
            .bf-quick-btn:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(29,51,59,0.1); }
            .bf-quick-btn:active { transform: translateY(0); }
          `}</style>

          <div
            id="bf-assistant-panel"
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              height: '85vh',
              zIndex: 99999,
              background: '#FAFAF8',
              boxShadow: '0 -4px 40px rgba(0,0,0,0.12)',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '20px 20px 0 0',
              overflow: 'hidden',
            }}
          >
            {/* ── Header ── */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 18px',
                background: 'linear-gradient(135deg, #1D333B 0%, #0F1B21 100%)',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.08))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid rgba(201,168,76,0.25)',
                  }}
                >
                  <SalameeIcon size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>
                      Bab-ul-Fatah AI
                    </h3>
                    <Sparkles style={{ width: 14, height: 14, color: '#C9A84C' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#22C55E',
                        boxShadow: '0 0 6px rgba(34,197,94,0.5)',
                      }}
                    />
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                      Online — Powered by Llama 3.3 70B
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={handleClearChat}
                  aria-label="Clear chat"
                  className="hidden sm:flex"
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)', border: 'none',
                    cursor: 'pointer', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  <Trash2 style={{ width: 14, height: 14 }} />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  aria-label={isExpanded ? 'Minimize' : 'Expand'}
                  className="hidden sm:flex"
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)', border: 'none',
                    cursor: 'pointer', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  {isExpanded ? <Minimize2 style={{ width: 14, height: 14 }} /> : <Maximize2 style={{ width: 14, height: 14 }} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)', border: 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#fff',
                  }}
                >
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>

            {/* ── Messages Area ── */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '18px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                scrollBehavior: 'smooth',
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
                  {msg.role === 'assistant' && (
                    <div
                      style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginRight: 8, flexShrink: 0, marginTop: 2,
                      }}
                    >
                      <SalameeIcon size={14} />
                    </div>
                  )}
                  <div
                    style={{
                      maxWidth: msg.role === 'user' ? '80%' : '88%',
                      borderRadius: 18,
                      padding: msg.role === 'user' ? '10px 16px' : '12px 16px',
                      fontSize: 13.5,
                      lineHeight: 1.65,
                      background:
                        msg.role === 'user'
                          ? 'linear-gradient(135deg, #1D333B, #2A4A55)'
                          : '#FFFFFF',
                      color: msg.role === 'user' ? '#fff' : '#2D3748',
                      borderBottomRightRadius: msg.role === 'user' ? 6 : 18,
                      borderBottomLeftRadius: msg.role === 'user' ? 18 : 6,
                      border: msg.role === 'assistant' ? '1px solid rgba(29,51,59,0.06)' : 'none',
                      boxShadow: msg.role === 'assistant' ? '0 1px 4px rgba(0,0,0,0.04)' : '0 2px 8px rgba(29,51,59,0.2)',
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.role === 'user' ? msg.content : renderMarkdown(msg.content)}
                  </div>
                </div>
              ))}

              {/* Error display */}
              {error && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '12px 14px',
                    background: '#FEF2F2',
                    borderRadius: 14,
                    border: '1px solid rgba(239,68,68,0.15)',
                  }}
                >
                  <AlertCircle style={{ width: 16, height: 16, color: '#EF4444', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#991B1B', margin: '0 0 4px 0' }}>
                      Something went wrong
                    </p>
                    <p style={{ fontSize: 12, color: '#B91C1C', margin: 0 }}>
                      Please try again. If this persists, WhatsApp us at +92 326 5903300.
                    </p>
                  </div>
                </div>
              )}

              {/* Typing indicator */}
              {isLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                  <div
                    style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginRight: 8, flexShrink: 0,
                    }}
                  >
                    <SalameeIcon size={14} />
                  </div>
                  <div
                    style={{
                      background: '#FFFFFF',
                      borderRadius: 18,
                      borderBottomLeftRadius: 6,
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      border: '1px solid rgba(29,51,59,0.06)',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: '#C9A84C',
                            animation: `bounce 1.4s ${i * 0.2}s infinite ease-in-out both`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              {showQuickActions && !isLoading && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 8,
                    marginTop: 4,
                  }}
                >
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action.query)}
                      className="bf-quick-btn"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 12px',
                        background: '#FFFFFF',
                        border: '1px solid rgba(29,51,59,0.08)',
                        borderRadius: 12,
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#1D333B',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{action.icon}</span>
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input Area ── */}
            <div
              style={{
                padding: '14px 16px',
                borderTop: '1px solid rgba(29,51,59,0.06)',
                flexShrink: 0,
                background: '#FFFFFF',
              }}
            >
              <form id="bf-chat-form" onSubmit={handleSubmit}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: '#F8F7F4',
                    borderRadius: 24,
                    padding: '4px 4px 4px 18px',
                    border: '1px solid rgba(29,51,59,0.06)',
                  }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    name="message"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about books, products, Islamic knowledge..."
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      height: 38,
                      background: 'transparent',
                      border: 'none',
                      fontSize: 14,
                      color: '#1D333B',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    aria-label="Send message"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background:
                        isLoading || !input.trim()
                          ? 'rgba(29,51,59,0.15)'
                          : 'linear-gradient(135deg, #1D333B, #2A4A55)',
                      border: 'none',
                      cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isLoading || !input.trim() ? 'rgba(255,255,255,0.4)' : '#C9A84C',
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                    }}
                  >
                    {isLoading ? (
                      <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <Send style={{ width: 15, height: 15 }} />
                    )}
                  </button>
                </div>
              </form>
              <p
                style={{
                  fontSize: 10,
                  textAlign: 'center',
                  color: 'rgba(100,116,139,0.4)',
                  marginTop: 10,
                  letterSpacing: 0.3,
                }}
              >
                Bab-ul-Fatah AI — Powered by Llama 3.3 70B (Open Source)
              </p>
            </div>
          </div>
        </>
      )}
    </>,
    document.body
  );
}
