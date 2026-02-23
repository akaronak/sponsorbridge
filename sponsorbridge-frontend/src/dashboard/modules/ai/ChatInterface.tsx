import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { aiApi, type ChatHistoryEntry, type RecommendedSponsor } from '../../../api/ai';

// ── Types ────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actions?: QuickAction[];
  sponsors?: RecommendedSponsor[];
  compatibilityScore?: number;
  isError?: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  type: string;
}

// ── Constants ────────────────────────────────────────────────

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hello! I'm your Eventra AI Assistant powered by Gemini. I can help you find ideal sponsors, optimize your event listings, analyze market trends, and draft professional proposals. What would you like to work on today?",
  timestamp: new Date().toISOString(),
  actions: [
    { id: 'a1', label: 'Find sponsors for my event', type: 'MATCH_SPONSOR' },
    { id: 'a2', label: 'Optimize my event listing', type: 'OPTIMIZE_EVENT' },
    { id: 'a3', label: 'Draft a sponsorship proposal', type: 'SEND_PROPOSAL' },
    { id: 'a4', label: 'Analyze sponsorship market', type: 'ANALYZE_MARKET' },
  ],
};

// ── Component ────────────────────────────────────────────────

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef(false);

  // Smooth scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input after AI response
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  /**
   * Build conversation history from messages for the API.
   * Maps 'assistant' -> 'model' for Gemini format.
   * Excludes the welcome message and error messages.
   */
  const buildHistory = useCallback((msgs: ChatMessage[]): ChatHistoryEntry[] => {
    return msgs
      .filter((m) => m.id !== 'welcome' && !m.isError)
      .map((m) => ({
        role: (m.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
        content: m.content,
      }));
  }, []);

  /**
   * Send a message to the Gemini backend and process the response.
   * Prevents double submission via isLoading guard.
   */
  const sendMessage = useCallback(
    async (userText: string) => {
      if (isLoading || !userText.trim()) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: userText.trim(),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsLoading(true);
      abortRef.current = false;

      try {
        // Build history from existing messages (before adding the new user message)
        const history = buildHistory([...messages, userMsg]);

        // Remove the latest user entry from history since the API takes it as 'message'
        // The history should be everything BEFORE the current message
        const historyWithoutCurrent = history.slice(0, -1);

        const response = await aiApi.chat(userText.trim(), historyWithoutCurrent);

        if (abortRef.current) return; // User reset conversation

        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: response.reply,
          timestamp: new Date().toISOString(),
          sponsors: response.recommendedSponsors ?? undefined,
          compatibilityScore: response.compatibilityScore ?? undefined,
          isError: !!response.error,
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err: unknown) {
        if (abortRef.current) return;

        let errorMessage = 'Something went wrong. Please try again.';
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosErr = err as { response?: { status?: number; data?: { reply?: string } } };
          if (axiosErr.response?.status === 429) {
            errorMessage = 'Too many requests. Please wait a moment and try again.';
          } else if (axiosErr.response?.status === 503) {
            errorMessage = axiosErr.response.data?.reply || 'AI service is temporarily unavailable.';
          } else if (axiosErr.response?.status === 401) {
            errorMessage = 'Your session has expired. Please log in again.';
          }
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: errorMessage,
            timestamp: new Date().toISOString(),
            isError: true,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, buildHistory]
  );

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
  };

  const handleAction = (action: QuickAction) => {
    if (isLoading) return;
    sendMessage(action.label);
  };

  const handleReset = () => {
    abortRef.current = true;
    setMessages([WELCOME_MESSAGE]);
    setInput('');
    setIsLoading(false);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Markdown renderer ──────────────────────────────────────

  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line) => {
        let html = line.replace(
          /\*\*(.*?)\*\*/g,
          '<strong class="text-white font-semibold">$1</strong>'
        );
        if (line.startsWith('###')) {
          html = `<h3 class="text-white font-semibold text-sm mt-2">${html.replace('### ', '')}</h3>`;
        }
        if (line.startsWith('- ')) {
          html = `<li class="ml-4 text-sm">${html.replace(/^-\s/, '')}</li>`;
        }
        if (/^\d+\.\s/.test(line)) {
          html = `<li class="ml-4 text-sm">${html.replace(/^\d+\.\s/, '')}</li>`;
        }
        if (line.trim() === '---') return '<hr class="border-slate-700 my-3" />';
        if (line.trim() === '') return '<br />';
        return `<p class="text-sm leading-relaxed">${html}</p>`;
      })
      .join('');
  };

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="h-14 px-5 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">AI Assistant</p>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" />
              Gemini 1.5 Pro
            </p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          title="New conversation"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  msg.isError
                    ? 'bg-red-500/20'
                    : 'bg-gradient-to-br from-indigo-500 to-purple-500'
                }`}
              >
                {msg.isError ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                )}
              </div>
            )}

            <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-first' : ''}`}>
              <div
                className={`px-4 py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-md'
                    : msg.isError
                    ? 'bg-red-500/10 text-red-300 rounded-bl-md border border-red-500/30'
                    : 'bg-slate-800/80 text-slate-300 rounded-bl-md border border-slate-700/50'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
              </div>

              {/* Compatibility score badge */}
              {msg.compatibilityScore != null && (
                <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg w-fit">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-medium">
                    Compatibility Score: {msg.compatibilityScore}%
                  </span>
                </div>
              )}

              {/* Sponsor cards */}
              {msg.sponsors && msg.sponsors.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {msg.sponsors.map((s, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg"
                    >
                      <p className="text-xs font-semibold text-indigo-300">{s.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {s.matchScore}% match{s.industry ? ` | ${s.industry}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick actions */}
              {msg.actions && !isLoading && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {msg.actions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleAction(action)}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-400 hover:bg-indigo-500/20 transition-all disabled:opacity-50"
                    >
                      <Zap className="w-3 h-3" />
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Copy button */}
              {msg.role === 'assistant' && !msg.isError && (
                <button
                  onClick={() => handleCopy(msg.content, msg.id)}
                  className="flex items-center gap-1 mt-1.5 px-2 py-1 rounded text-xs text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {copied === msg.id ? (
                    <>
                      <Check className="w-3 h-3" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy
                    </>
                  )}
                </button>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
            </div>
            <div className="px-4 py-3 bg-slate-800/80 rounded-2xl rounded-bl-md border border-slate-700/50">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div
                    className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <div
                    className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <div
                    className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
                <span className="text-xs text-slate-500 ml-1">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? 'Waiting for AI response...' : 'Ask me about sponsors, events, proposals...'}
            className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all disabled:opacity-50"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-indigo-600 rounded-xl text-white hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title={isLoading ? 'Waiting for response...' : 'Send message'}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-slate-600 mt-2 text-center">
          Powered by Gemini 1.5 Pro. AI responses are suggestions -- always verify before acting.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
