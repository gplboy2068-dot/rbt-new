import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Zap, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  BookOpen, 
  Brain, 
  ShieldCheck,
  ChevronRight,
  Lightbulb
} from 'lucide-react';
import { Question } from '@/types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  generatedQuestion?: Question | null;
  timestamp: number;
}

/**
 * Beautiful Markdown Parser & Renderer for Clean, Structured AI Output
 */
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');

  // Check if content contains markdown table
  const renderFormattedLine = (line: string, idx: number) => {
    const trimmed = line.trim();

    // H3 Header
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={idx} className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-4 mb-2 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-1.5">
          <span>{trimmed.replace('### ', '')}</span>
        </h3>
      );
    }

    // H4 Header
    if (trimmed.startsWith('#### ')) {
      return (
        <h4 key={idx} className="text-xs sm:text-sm font-extrabold text-emerald-700 dark:text-emerald-400 mt-3 mb-1 flex items-center gap-1.5">
          <span>{trimmed.replace('#### ', '')}</span>
        </h4>
      );
    }

    // Blockquote / Pro-Tip Callout
    if (trimmed.startsWith('> ')) {
      const quoteText = trimmed.replace(/^>\s*/, '');
      return (
        <div key={idx} className="my-2 p-3 sm:p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs sm:text-sm text-amber-900 dark:text-amber-200 flex items-start gap-2 shadow-sm">
          <Lightbulb className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="font-medium">{parseInlineFormatting(quoteText)}</div>
        </div>
      );
    }

    // Bullet List Item
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const itemText = trimmed.replace(/^[\*\-]\s+/, '');
      return (
        <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 my-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
          <div className="leading-relaxed">{parseInlineFormatting(itemText)}</div>
        </li>
      );
    }

    // Numbered List Item (e.g. 1. 2. 3.)
    if (/^\d+\.\s/.test(trimmed)) {
      const num = trimmed.match(/^(\d+)\.\s/)?.[1] || '1';
      const itemText = trimmed.replace(/^\d+\.\s+/, '');
      return (
        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 my-1.5">
          <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center justify-center shrink-0 border border-emerald-300 dark:border-emerald-800">
            {num}
          </span>
          <div className="leading-relaxed font-medium">{parseInlineFormatting(itemText)}</div>
        </div>
      );
    }

    // Horizontal Rule
    if (trimmed === '---') {
      return <hr key={idx} className="my-3 border-slate-200 dark:border-slate-700/60" />;
    }

    // Empty line
    if (!trimmed) {
      return <div key={idx} className="h-2" />;
    }

    // Regular text paragraph
    return (
      <p key={idx} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed my-1">
        {parseInlineFormatting(line)}
      </p>
    );
  };

  // Helper for bold, code badges, and inline styling
  const parseInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\$.*?\$)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[11px] text-brand-700 dark:text-brand-300 font-semibold">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return <div className="space-y-0.5">{lines.map((line, idx) => renderFormattedLine(line, idx))}</div>;
}

/**
 * Interactive Multiple-Choice Question Card inside Chat
 */
function InteractiveGeneratedQuestionCard({ question }: { question: Question }) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = selectedIdx === question.correctAnswer;

  return (
    <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-md space-y-4">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          {question.domainName || 'Practice Scenario'}
        </span>
        <span className="text-[10px] text-slate-400 font-mono font-bold">
          {question.code}
        </span>
      </div>

      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
        {question.content}
      </div>

      <div className="space-y-2">
        {question.options.map((option, idx) => {
          const letter = String.fromCharCode(65 + idx);
          let btnStyle = "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 hover:border-emerald-500";

          if (submitted) {
            if (idx === question.correctAnswer) {
              btnStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/20";
            } else if (idx === selectedIdx) {
              btnStyle = "border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 font-bold ring-2 ring-rose-500/20";
            } else {
              btnStyle = "border-slate-200 dark:border-slate-800 opacity-50 text-slate-400";
            }
          } else if (selectedIdx === idx) {
            btnStyle = "border-brand-600 bg-brand-50 dark:bg-brand-950/60 text-brand-900 dark:text-brand-200 ring-2 ring-brand-500/20 font-bold";
          }

          return (
            <button
              key={idx}
              disabled={submitted}
              onClick={() => {
                setSelectedIdx(idx);
                setSubmitted(true);
              }}
              className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm flex items-center gap-3 transition-all ${btnStyle}`}
            >
              <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                submitted && idx === question.correctAnswer 
                  ? 'bg-emerald-600 text-white' 
                  : submitted && idx === selectedIdx 
                  ? 'bg-rose-600 text-white' 
                  : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300'
              }`}>
                {letter}
              </span>
              <span className="flex-grow">{option}</span>
              {submitted && idx === question.correctAnswer && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
              {submitted && idx === selectedIdx && idx !== question.correctAnswer && (
                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {submitted && (
        <div className={`p-3.5 rounded-xl text-xs space-y-1.5 animate-fadeIn ${
          isCorrect 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
            : 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
        }`}>
          <div className="font-bold flex items-center gap-1.5">
            {isCorrect ? '✅ Correct Answer!' : '💡 Clinical Rationale:'}
          </div>
          <div className="leading-relaxed">{question.explanation}</div>
        </div>
      )}
    </div>
  );
}

export default function AITutorIsland() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `### 🎓 Welcome to your AI Clinical Tutor!

I'm your **Registered Behavior Technician (RBT®)** examination prep assistant.

---

#### 💡 How I can help you today:
* **Deep Concept Explanations:** Ask me about *DRA vs DRI vs DRO*, *Continuous vs Discontinuous measurement*, *ABC data collection*, or *4 Functions of Behavior (SEAT)*.
* **Clinical Scenarios:** Request custom mock questions to test your application skills.
* **Zero Sign-up:** 100% free and open access with anonymous daily IP quotas.

*Click any prompt below or type your question to begin!*`,
      timestamp: Date.now(),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quota, setQuota] = useState<{ remainingHourly: number; remainingDaily: number }>({
    remainingHourly: 15,
    remainingDaily: 50,
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const loadQuota = async () => {
    try {
      const res = await fetch('/api/v1/ai/limits');
      const data = await res.json();
      if (res.ok && data?.data) {
        setQuota({
          remainingHourly: data.data.remainingHourly ?? 15,
          remainingDaily: data.data.remainingDaily ?? 50,
        });
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadQuota();
  }, []);

  // Auto-scroll on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (customText?: string, actionType = 'chat') => {
    const query = customText || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMessageId = `u_${Date.now()}`;
    setMessages((p) => [...p, { id: userMessageId, sender: 'user', text: query, timestamp: Date.now() }]);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Primary route with fallback
      const res = await fetch('/api/v1/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionType, query }),
      });
      const data = await res.json();

      if (res.ok && (data.reply || data.data?.reply)) {
        const replyText = data.reply || data.data?.reply;
        const generatedQ = data.generatedQuestion || data.data?.generatedQuestion;

        setMessages((p) => [
          ...p,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: replyText,
            generatedQuestion: generatedQ,
            timestamp: Date.now(),
          },
        ]);

        if (data.quota || data.data?.quota) {
          setQuota(data.quota || data.data?.quota);
        }
      } else {
        setMessages((p) => [
          ...p,
          {
            id: `err_${Date.now()}`,
            sender: 'ai',
            text: `⚠️ **Notice:** ${data.message || data.error?.message || 'Rate limit reached. Please try again shortly.'}`,
            timestamp: Date.now(),
          },
        ]);
      }
    } catch {
      setMessages((p) => [
        ...p,
        { 
          id: `err_${Date.now()}`, 
          sender: 'ai', 
          text: '❌ **Connection Error:** Unable to reach AI Tutor. Please check your internet connection and try again.', 
          timestamp: Date.now() 
        },
      ]);
    } finally {
      setIsLoading(false);
      loadQuota();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: 'ai',
        text: `### 🎓 Chat Session Reset

What RBT exam concept or BACB task list domain would you like to review next?`,
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span>Open Access RBT Exam Coach</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 mt-1">
            <Bot className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            <span>AI Clinical Tutor</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetChat}
            title="Reset Chat History"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 text-xs">
            <div>
              <div className="text-slate-400 text-[10px] font-bold uppercase">Daily IP Quota</div>
              <div className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                <span className="text-emerald-600 dark:text-emerald-400">{quota.remainingDaily}</span> / 50 left
              </div>
            </div>
            <div className="border-l border-slate-200 dark:border-slate-800 pl-3">
              <div className="text-slate-400 text-[10px] font-bold uppercase">Hourly Window</div>
              <div className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                <span className="text-blue-600">{quota.remainingHourly}</span> / 15 left
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Prompts Carousel */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          High-Yield Exam Topics (Click to ask):
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleSend('Explain the difference between DRA, DRI, and DRO with clear exam examples', 'chat')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-sm"
          >
            <span>🔄 DRA vs DRI vs DRO</span>
          </button>
          
          <button
            onClick={() => handleSend('Explain Continuous vs Discontinuous measurement (Partial vs Whole Interval vs MTS)', 'chat')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-sm"
          >
            <span>📊 Interval Measurement Formulas</span>
          </button>

          <button
            onClick={() => handleSend('Explain the 4 Functions of Behavior (SEAT) with clinical examples', 'chat')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-sm"
          >
            <span>🧩 4 Functions (S-E-A-T)</span>
          </button>

          <button
            onClick={() => handleSend('Explain prompting hierarchies from Most-to-Least vs Least-to-Most', 'chat')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-sm"
          >
            <span>🪜 Prompting Hierarchies</span>
          </button>

          <button
            onClick={() => handleSend('Generate an RBT exam scenario testing continuous measurement rate calculation', 'generate_question')}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
          >
            <Zap className="w-3.5 h-3.5" /> 
            <span>Generate Scenario Question</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div 
        ref={chatContainerRef}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 min-h-[480px] max-h-[620px] overflow-y-auto space-y-6 scroll-smooth"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 sm:gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shrink-0 shadow-md">
                <Brain className="w-5 h-5" />
              </div>
            )}

            <div
              className={`max-w-2xl sm:max-w-3xl p-4 sm:p-6 rounded-3xl text-sm ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none shadow-md font-medium text-sm sm:text-base leading-relaxed'
                  : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm'
              }`}
            >
              {msg.sender === 'user' ? (
                <div className="whitespace-pre-wrap">{msg.text}</div>
              ) : (
                <>
                  <MarkdownRenderer content={msg.text} />
                  {msg.generatedQuestion && (
                    <InteractiveGeneratedQuestionCard question={msg.generatedQuestion} />
                  )}
                </>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 sm:gap-4 justify-start items-center">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-md animate-pulse">
              <Bot className="w-5 h-5" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">AI Clinical Tutor is analyzing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Message Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 sm:gap-3"
      >
        <input
          type="text"
          placeholder="Ask any RBT exam concept, formula, ABA principle, or type 'generate scenario'..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          disabled={isLoading}
          className="flex-grow p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm shadow-md focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-400 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className="p-4 sm:px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-bold disabled:opacity-40 transition-all flex items-center gap-2"
        >
          <Send className="w-5 h-5" />
          <span className="hidden sm:inline text-xs font-bold">Ask AI</span>
        </button>
      </form>
    </div>
  );
}
