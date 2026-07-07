import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  X,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSavedSchemes, useApplications, useSearchHistory } from '../hooks';
import { generateWithGemini, isGeminiConfigured } from '../services';

export const AIAssistant: React.FC = () => {
  const { user, profile } = useAuth();
  const { savedSchemes } = useSavedSchemes();
  const { applications } = useApplications();
  const { history } = useSearchHistory();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const context = {
        user: {
          name: profile?.name,
          email: profile?.email,
          age: profile?.age,
          state: profile?.state,
          occupation: profile?.occupation,
          education: profile?.education,
          incomeRange: profile?.income_range,
        },
        savedSchemes: savedSchemes.map((s) => ({
          name: s.scheme_name,
          provider: s.provider,
          category: s.category,
          matchScore: s.match_score,
        })),
        applications: applications.map((a) => ({
          scheme: a.scheme_name,
          status: a.current_status,
          progress: a.progress_percentage,
        })),
        recentSearches: history.slice(0, 5).map((h) => ({
          category: h.category,
          query: h.query,
        })),
      };

      const systemPrompt = `You are SchemeMatch AI, a friendly, intelligent government benefits advisor. Help the user with questions about government schemes, applications, saved schemes, and recommendations. Use the user's profile, saved schemes, applications, and recent searches to provide personalized advice. Keep responses clear, concise, and easy to understand. Avoid jargon.

User Context:
${JSON.stringify(context, null, 2)}`;

      let response = '';

      if (isGeminiConfigured) {
        response = await generateWithGemini(systemPrompt);
      } else {
        response = "I'm here to help! To use my full AI capabilities, please configure your Gemini API key in the settings. For now, I can help you navigate the app and answer basic questions about SchemeMatch.";
      }

      const assistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('AI Error:', err);
      const errorMessage = {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: 'Sorry, I encountered an issue. Please try again later.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="w-80 md:w-96 h-[500px] mb-4 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-premium flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between bg-gradient-to-r from-brand-50 dark:from-brand-950/30 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-purple flex items-center justify-center text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    SchemeMatch AI
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                    Your personal benefits advisor
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-brand-500" />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-sans">
                    Hi! I'm SchemeMatch AI. Ask me anything about government schemes, your applications, or recommendations!
                  </p>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed font-sans ${
                      msg.role === 'user'
                        ? 'bg-brand-600 text-white rounded-tr-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 rounded-tl-sm">
                    <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                      Thinking...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask SchemeMatch AI..."
                  className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/50 transition-all font-sans"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="p-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-purple text-white shadow-premium flex items-center justify-center"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>
    </div>
  );
};
