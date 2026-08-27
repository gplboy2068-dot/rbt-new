import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Send, Zap } from 'lucide-react';
import { Question } from '@/types';
import { progressRepo } from '@/lib/storage/progress-repo';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  generatedQuestion?: Question | null;
  timestamp: number;
}

export default function AITutorIsland() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `👋 **Welcome to your Open Access RBT AI Study Tutor!**\n\nAsk any question regarding BACB Task List 2nd Edition domains, measurement formulas, DTT prompting hierarchies, differential reinforcement (DRA/DRI/DRO), or generate custom exam scenarios.\n\n*Zero sign-up required. Free daily usage is managed anonymously by IP.*`,
      timestamp: Date.now(),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quota, setQuota] = useState<{ remainingHourly: number; remainingDaily: number }>({
    remainingHourly: 15,
    remainingDaily: 50,
  });

  const loadQuota = async () => {
    try {
      const res = await fetch('/api/ai/limits');
      const data = await res.json();
      if (res.ok) {
        setQuota({
          remainingHourly: data.status.remainingHourly,
          remainingDaily: data.status.remainingDaily,
        });
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadQuota();
  }, []);

  const handleSend = async (customText?: string, actionType = 'chat') => {
    const query = customText || inputQuery;
    if (!query.trim() || isLoading) return;

    setMessages((p) => [...p, { id: `u_${Date.now()}`, sender: 'user', text: query, timestamp: Date.now() }]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionType, query }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessages((p) => [
          ...p,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: data.reply,
            generatedQuestion: data.generatedQuestion,
            timestamp: Date.now(),
          },
        ]);
      } else {
        setMessages((p) => [
          ...p,
          {
            id: `err_${Date.now()}`,
            sender: 'ai',
            text: `⚠️ ${data.message || 'Request limit exceeded.'}`,
            timestamp: Date.now(),
          },
        ]);
      }
    } catch {
      setMessages((p) => [
        ...p,
        { id: `err_${Date.now()}`, sender: 'ai', text: '❌ Network connection error.', timestamp: Date.now() },
      ]);
    } finally {
      setIsLoading(false);
      loadQuota();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span>Anonymous RBT Study Companion</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-1">
            <Bot className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            <span>AI Study Tutor</span>
          </h1>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 text-xs">
          <div>
            <div className="text-slate-500 font-medium">Daily IP Allowance</div>
            <div className="font-bold text-slate-900 dark:text-white">
              <span className="text-emerald-600 dark:text-emerald-400">{quota.remainingDaily}</span> / 50 left
            </div>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <div className="text-slate-500 font-medium">Hourly Window</div>
            <div className="font-bold text-slate-900 dark:text-white">
              <span className="text-blue-600">{quota.remainingHourly}</span> / 15 left
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500">Quick Prompt:</span>
        <button
          onClick={() => handleSend('Explain the difference between DRA and DRI with clear clinical examples', 'chat')}
          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
        >
          DRA vs DRI Examples
        </button>
        <button
          onClick={() => handleSend('Generate an RBT exam scenario testing continuous measurement rate calculation', 'generate_question')}
          className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 text-xs font-bold flex items-center gap-1"
        >
          <Zap className="w-3 h-3" /> Generate Scenario
        </button>
      </div>

      {/* Messages */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 min-h-[460px] max-h-[560px] overflow-y-auto space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 sm:gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Bot className="w-5 h-5" />
              </div>
            )}
            <div
              className={`max-w-2xl p-4 sm:p-5 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-brand-600 text-white rounded-br-none shadow-md font-medium'
                  : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}
        {isLoading && <div className="text-xs text-slate-400">AI Tutor is reasoning...</div>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Ask a question or request an RBT concept breakdown..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          disabled={isLoading}
          className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm shadow-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-bold disabled:opacity-40"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
