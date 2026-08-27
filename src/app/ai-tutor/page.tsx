'use client';

import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  HelpCircle,
  Zap,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Clock,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { SubjectCategory, Question } from '@/types';
import { progressRepo } from '@/lib/storage/progress-repo';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  generatedQuestion?: Question | null;
  timestamp: number;
}

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `👋 **Welcome to your Open Access AI Study Tutor!**\n\nI am here to help you master challenging concepts, break down complex derivations step-by-step, explain formulas, or generate custom practice challenges.\n\n*Zero sign-up is required. You can ask anything below or pick a prompt to start!*`,
      timestamp: Date.now(),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<SubjectCategory>('Mathematics');
  const [isLoading, setIsLoading] = useState(false);
  const [quota, setQuota] = useState<{
    remainingHourly: number;
    remainingDaily: number;
    maxHourly: number;
    maxDaily: number;
    enabled: boolean;
  }>({
    remainingHourly: 15,
    remainingDaily: 50,
    maxHourly: 15,
    maxDaily: 50,
    enabled: true,
  });

  const loadLimits = async () => {
    try {
      const res = await fetch('/api/ai/limits');
      const data = await res.json();
      if (res.ok) {
        setQuota({
          remainingHourly: data.status.remainingHourly,
          remainingDaily: data.status.remainingDaily,
          maxHourly: data.limits.maxHourly,
          maxDaily: data.limits.maxDaily,
          enabled: data.limits.aiTutorEnabled,
        });
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadLimits();
  }, []);

  const handleSendMessage = async (customText?: string, actionType: string = 'chat') => {
    const textToSend = customText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          query: textToSend,
          subject: selectedSubject,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const aiMsg: Message = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: data.reply,
          generatedQuestion: data.generatedQuestion,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        if (data.quota) {
          setQuota((prev) => ({
            ...prev,
            remainingHourly: data.quota.remainingHourly,
            remainingDaily: data.quota.remainingDaily,
          }));
        }
      } else {
        const errMsg: Message = {
          id: `err_${Date.now()}`,
          sender: 'ai',
          text: `⚠️ **Rate Limit or Notice**: ${data.message || 'Unable to process query.'}`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errMsg]);
      }
    } catch {
      const netError: Message = {
        id: `err_${Date.now()}`,
        sender: 'ai',
        text: '❌ Network connection error. Please try again in a few moments.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, netError]);
    } finally {
      setIsLoading(false);
      loadLimits();
    }
  };

  const handleQuickPrompt = (prompt: string, actionType: string = 'chat') => {
    handleSendMessage(prompt, actionType);
  };

  const handleAnswerGeneratedQuestion = async (
    q: Question,
    optIdx: number,
    isCorrect: boolean
  ) => {
    await progressRepo.saveAttempt({
      questionId: q.id,
      subject: q.subject,
      topic: q.topic,
      selectedAnswer: optIdx,
      isCorrect,
      timeSpentSeconds: 10,
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Quota Meter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span>Anonymous AI Study Assistant</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2 mt-1">
            <Bot className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            <span>AI Study Tutor</span>
          </h1>
        </div>

        {/* IP Rate Limit Gauge */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 text-xs">
          <div>
            <div className="text-slate-500 font-medium">Free Daily Allowance</div>
            <div className="font-bold text-slate-900 dark:text-white">
              <span className="text-emerald-600 dark:text-emerald-400">{quota.remainingDaily}</span> /{' '}
              {quota.maxDaily} left today
            </div>
          </div>
          <div className="border-l border-slate-200 dark:border-slate-700 pl-4">
            <div className="text-slate-500 font-medium">Hourly Window</div>
            <div className="font-bold text-slate-900 dark:text-white">
              <span className="text-blue-600 dark:text-blue-400">{quota.remainingHourly}</span> /{' '}
              {quota.maxHourly} left
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500">Try Instant Prompt:</span>
        <button
          onClick={() =>
            handleQuickPrompt(
              'Explain the difference between Dijkstra and A* pathfinding algorithm',
              'chat'
            )
          }
          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
        >
          Dijkstra vs A* Search
        </button>
        <button
          onClick={() =>
            handleQuickPrompt('How does Gibbs Free Energy determine spontaneity?', 'chat')
          }
          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
        >
          Gibbs Free Energy
        </button>
        <button
          onClick={() =>
            handleQuickPrompt('Generate a challenging calculus derivative question', 'generate_question')
          }
          className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-colors flex items-center gap-1"
        >
          <Zap className="w-3 h-3" /> Generate Question
        </button>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 min-h-[480px] max-h-[580px] overflow-y-auto space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 sm:gap-4 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
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
                  : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Render AI generated question challenge if returned */}
              {msg.generatedQuestion && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">
                    Challenge Question:
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {msg.generatedQuestion.question}
                  </div>
                  <div className="space-y-2">
                    {msg.generatedQuestion.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() =>
                          handleAnswerGeneratedQuestion(
                            msg.generatedQuestion!,
                            oIdx,
                            oIdx === msg.generatedQuestion!.correctAnswer
                          )
                        }
                        className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-xs flex items-center gap-2 bg-white dark:bg-slate-900"
                      >
                        <span className="font-bold">{String.fromCharCode(65 + oIdx)}.</span>
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div
                className={`text-[10px] mt-2 text-right ${
                  msg.sender === 'user' ? 'text-brand-100' : 'text-slate-400'
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 text-slate-400 text-xs py-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 flex items-center justify-center text-emerald-600 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
            </div>
            <span>AI Tutor is reasoning...</span>
          </div>
        )}
      </div>

      {/* Input Controls */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 sm:gap-3"
      >
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Ask a question, concept breakdown, or math proof..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isLoading}
            className="w-full p-4 pr-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold shadow-md transition-all shrink-0"
          title="Send Question"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
