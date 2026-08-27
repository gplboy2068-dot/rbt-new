import React, { useState } from 'react';
import { BookOpen, CheckCircle, HelpCircle, ArrowRight, Brain, Layers, ArrowLeft } from 'lucide-react';
import { INITIAL_QUESTIONS, INITIAL_FLASHCARDS } from '@/data/mock-data';

interface TopicDetailProps {
  slug: string;
  code: string;
  name: string;
  domainName: string;
  summary: string;
  keyPoints: string[];
}

export default function TopicDetailIsland({
  slug,
  code,
  name,
  domainName,
  summary,
  keyPoints,
}: TopicDetailProps) {
  const relatedQuestions = INITIAL_QUESTIONS.filter(
    (q) => q.topicName.toLowerCase().includes(name.toLowerCase()) || q.domainName.includes(domainName)
  ).slice(0, 3);

  const relatedFlashcards = INITIAL_FLASHCARDS.filter((f) =>
    f.domain.includes(domainName)
  ).slice(0, 3);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showExplanations, setShowExplanations] = useState<Record<string, boolean>>({});

  const handleSelect = (qid: string, optIndex: number) => {
    setSelectedAnswers((p) => ({ ...p, [qid]: optIndex }));
    setShowExplanations((p) => ({ ...p, [qid]: true }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <a href="/topics" className="hover:text-brand-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> All Task List Topics
        </a>
        <span>/</span>
        <span className="text-slate-900 dark:text-white font-bold">{domainName}</span>
      </div>

      {/* Hero */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-800 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200">
            Task List Item {code}
          </span>
          <span className="text-xs font-bold text-slate-500">{domainName}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          {name}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          {summary}
        </p>

        {keyPoints.length > 0 && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Core High-Yield Concepts & Formulas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {keyPoints.map((pt, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 flex items-start gap-2"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mini Diagnostic Quiz */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-brand-600" />
            <span>Instant Topic Mastery Check</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {relatedQuestions.length} Questions
          </span>
        </div>

        <div className="space-y-4">
          {relatedQuestions.map((q, qIndex) => {
            const isAnswered = selectedAnswers[q.id] !== undefined;
            const chosen = selectedAnswers[q.id];
            const isCorrect = chosen === q.correctAnswer;

            return (
              <div
                key={q.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-400">Question {qIndex + 1}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                    {q.difficulty}
                  </span>
                </div>

                <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                  {q.content}
                </p>

                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    let style =
                      'border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200';
                    if (isAnswered) {
                      if (optIdx === q.correctAnswer) {
                        style = 'border-emerald-500 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-200 font-bold';
                      } else if (chosen === optIdx && !isCorrect) {
                        style = 'border-rose-500 bg-rose-50 text-rose-950 dark:bg-rose-950/60 dark:text-rose-200';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={isAnswered}
                        onClick={() => handleSelect(q.id, optIdx)}
                        className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center gap-3 ${style}`}
                      >
                        <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center font-bold text-xs shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 animate-fadeIn">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {isCorrect ? (
                        <span className="text-emerald-600">✓ Correct Choice</span>
                      ) : (
                        <span className="text-rose-600">✗ Incorrect Choice</span>
                      )}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA to Flashcards & Study Guides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        <a
          href="/flashcards"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 shadow-sm flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-bold uppercase">Spaced Repetition</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Practice Domain Flashcards
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
        </a>

        <a
          href="/practice-questions"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 shadow-sm flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-bold uppercase">Question Bank</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Solve All 85+ Questions
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
        </a>
      </div>
    </div>
  );
}
