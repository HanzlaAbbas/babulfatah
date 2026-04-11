'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Loader2, Minimize2, Maximize2, Trash2, Sparkles } from 'lucide-react';
import { createPortal } from 'react-dom';
import { SalameeIcon } from '@/components/storefront/salamee-icon';

// ═══════════════════════════════════════════════════════════════════════════════
// Bab-ul-Fatah AI Assistant — Premium Chat Widget v2 (Fixed)
// ─────────────────────────────────────────────────────────────────────────────────
// Fix from v1:
// - Uses messagesRef to avoid stale closure in handleSend
// - Non-streaming JSON responses (no SSE parsing)
// - Correct conversation history passed to API
// - Each message gets a unique, contextual AI response
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface QuickAction {
  label: string;
  icon: string;
  query: string;
}

// ─── Quick Actions ────────────────────────────────────────────────────────────

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Quran Collection', icon: '📖', query: 'Tell me about your Quran collection' },
  { label: 'Book Recs', icon: '📚', query: 'Recommend some popular Islamic books for me' },
  { label: 'Shipping Info', icon: '🚚', query: 'What are your shipping and payment options?' },
  { label: 'Children Books', icon: '👶', query: 'What Islamic books do you have for children?' },
  { label: 'Track Order', icon: '📦', query: 'How can I track my order?' },
  { label: 'Hadith Books', icon: '📜', query: 'Show me your Hadith collection' },
];

// ─── Simple markdown renderer (bold only) ────────────────────────────────────

function renderMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ fontWeight: 600, color: '#1D333B' }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part.split('\n').map((line, j) => (
      <span key={`${i}-${j}`}>
        {j > 0 && <br />}
        {line}
      </span>
    ));
  });
}

// ─── Chat Widget ──────────────────────────────────────────────────────────────

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);

  // KEY FIX: Use a ref to always have the latest messages
  // This prevents the stale closure bug where handleSend captured old messages
  const messagesRef = useRef<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Keep messagesRef in sync with state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    setMounted(true);
    return () => {
      abortControllerRef.current?.abort();
    };
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
      const welcomeMsg: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content:
          "Assalamu Alaikum! Welcome to Bab-ul-Fatah. I'm your AI assistant — here to help you find the perfect Islamic books and products. Ask me anything about our collection, shipping, or Islamic knowledge!",
      };
      setMessages([welcomeMsg]);
      messagesRef.current = [welcomeMsg];
    }
  }, [isOpen]);

  // ── Send handler (NO stale closure) ──
  // Uses messagesRef instead of messages state to always get latest data
  const handleSend = useCallback(async (queryOverride?: string) => {
    const trimmed = (queryOverride || input).trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    const assistantId = `ai-${Date.now()}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
    };

    // Update both state and ref immediately
    const newMessages = [...messagesRef.current, userMessage, assistantPlaceholder];
    setMessages(newMessages);
    messagesRef.current = newMessages;
    setInput('');
    setIsLoading(true);
    setShowQuickActions(false);

    try {
      // Build history from ref (always up-to-date, excludes the empty placeholder)
      const historyForAPI = messagesRef.current
        .filter((m) => m.content.length > 0) // Exclude empty placeholder
        .slice(-10) // Last 10 messages with content
        .map((m) => ({ role: m.role, content: m.content }));

      abortControllerRef.current = new AbortController();

      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyForAPI,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      if (data.reply) {
        // Update the placeholder with the real response
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: data.reply }
              : m
          )
        );
        // Keep ref in sync
        messagesRef.current = messagesRef.current.map((m) =>
          m.id === assistantId
            ? { ...m, content: data.reply }
            : m
        );
      } else {
        const errorContent = "Sorry, I couldn't process that. Please try again.";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: errorContent } : m
          )
        );
        messagesRef.current = messagesRef.current.map((m) =>
          m.id === assistantId ? { ...m, content: errorContent } : m
        );
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      const errorContent = 'Network error. Please check your connection and try again.';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: errorContent } : m
        )
      );
      messagesRef.current = messagesRef.current.map((m) =>
        m.id === assistantId ? { ...m, content: errorContent } : m
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [input, isLoading]); // NOTE: messages NOT in deps — we use messagesRef instead

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // ── Clear chat ──
  const handleClearChat = useCallback(() => {
    const freshMessages: ChatMessage[] = [
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: 'Assalamu Alaikum! How can I help you today? Feel free to ask about our books, products, or any Islamic knowledge.',
      },
    ];
    setMessages(freshMessages);
    messagesRef.current = freshMessages;
    setShowQuickActions(true);
  }, []);

  // ── Quick action click ──
  const handleQuickAction = useCallback(
    (query: string) => {
      handleSend(query);
    },
    [handleSend]
  );

  if (!mounted) return null;

  return createPortal(
    <>
      {/* ═══ Floating Open Button ═══ */}
      {!isOpen && (
        <div style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 99999 }}>
          <div
            style={{
              position: 'absolute',
              inset: -4,
              borderRadius: '50%',
              border: '2px solid rgba(201,168,76,0.3)',
              animation: 'assistant-pulse 2s ease-in-out infinite',
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
          {/* Backdrop (mobile only) */}
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
                max-height: ${isExpanded ? '85vh' : '520px'} !important;
                width: 400px !important;
                border-radius: 20px !important;
              }
            }
            @keyframes assistant-pulse {
              0%, 100% { transform: scale(1); opacity: 0.5; }
              50% { transform: scale(1.15); opacity: 0; }
            }
            @keyframes assistant-slide-up {
              from { transform: translateY(100%); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            @keyframes assistant-slide-in {
              from { transform: translateY(20px) scale(0.95); opacity: 0; }
              to { transform: translateY(0) scale(1); opacity: 1; }
            }
            #bf-assistant-panel {
              animation: assistant-slide-up 0.3s ease-out;
            }
            @media (min-width: 640px) {
              #bf-assistant-panel {
                animation: assistant-slide-in 0.25s ease-out;
              }
            }
            .quick-action-btn {
              transition: all 0.15s ease;
            }
            .quick-action-btn:hover {
              transform: translateY(-1px);
              box-shadow: 0 2px 8px rgba(29,51,59,0.1);
            }
            .quick-action-btn:active {
              transform: translateY(0);
            }
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
                      Online — Typically replies instantly
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
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                    border: 'none',
                    cursor: 'pointer',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                    border: 'none',
                    cursor: 'pointer',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  {isExpanded ? (
                    <Minimize2 style={{ width: 14, height: 14 }} />
                  ) : (
                    <Maximize2 style={{ width: 14, height: 14 }} />
                  )}
                </button>

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
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 8,
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      <SalameeIcon size={14} />
                    </div>
                  )}
                  <div
                    style={{
                      maxWidth: msg.role === 'user' ? '80%' : '85%',
                      borderRadius: 18,
                      padding: msg.role === 'user' ? '10px 16px' : '11px 15px',
                      fontSize: 13.5,
                      lineHeight: 1.65,
                      background:
                        msg.role === 'user'
                          ? 'linear-gradient(135deg, #1D333B, #2A4A55)'
                          : '#FFFFFF',
                      color: msg.role === 'user' ? '#fff' : '#2D3748',
                      borderBottomRightRadius: msg.role === 'user' ? 6 : 18,
                      borderBottomLeftRadius: msg.role === 'user' ? 18 : 6,
                      border:
                        msg.role === 'assistant'
                          ? '1px solid rgba(29,51,59,0.06)'
                          : 'none',
                      boxShadow:
                        msg.role === 'assistant'
                          ? '0 1px 4px rgba(0,0,0,0.04)'
                          : '0 2px 8px rgba(29,51,59,0.2)',
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.role === 'user' ? msg.content : renderMarkdown(msg.content)}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 8,
                      flexShrink: 0,
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
              {showQuickActions && messages.length <= 1 && !isLoading && (
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
                      className="quick-action-btn"
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
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about books, products..."
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
                  onClick={() => handleSend()}
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
                    cursor:
                      isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isLoading || !input.trim() ? 'rgba(255,255,255,0.4)' : '#C9A84C',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }}
                >
                  {isLoading ? (
                    <Loader2
                      style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }}
                    />
                  ) : (
                    <Send style={{ width: 15, height: 15 }} />
                  )}
                </button>
              </div>
              <p
                style={{
                  fontSize: 10,
                  textAlign: 'center',
                  color: 'rgba(100,116,139,0.45)',
                  marginTop: 10,
                  letterSpacing: 0.3,
                }}
              >
                Bab-ul-Fatah AI Assistant — babulfatah.com
              </p>
            </div>
          </div>
        </>
      )}
    </>,
    document.body
  );
}
