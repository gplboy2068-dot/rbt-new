import React from 'react';
import { BookOpen, Sparkles, ExternalLink, FileText, ArrowRight, HelpCircle } from 'lucide-react';
import { resolveQuestionLearningPath, ResolvableQuestion } from '../lib/services/question-link-resolver';

interface QuestionRationaleLinksProps {
  question: ResolvableQuestion;
  isExamMode?: boolean;
  className?: string;
}

export default function QuestionRationaleLinks({
  question,
  isExamMode = false,
  className = '',
}: QuestionRationaleLinksProps) {
  const learningPath = resolveQuestionLearningPath(question);

  return (
    <div
      className={`mt-3.5 pt-3.5 border-t border-slate-200/90 dark:border-slate-700/80 space-y-2.5 ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <BookOpen className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
          <span>Educational Learning Pathway</span>
        </div>
        {isExamMode && (
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
            <span>Opens in new tab to preserve test progress</span>
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        {/* 1. Primary Educational Link: Domain Pillar Study Guide */}
        {learningPath.studyGuide && (
          <a
            href={learningPath.studyGuide.url}
            target={isExamMode ? '_blank' : undefined}
            rel={isExamMode ? 'noopener noreferrer' : undefined}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 text-amber-900 dark:text-amber-200 text-xs font-bold border border-amber-200 dark:border-amber-800 transition-colors shadow-2xs group"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{learningPath.studyGuide.anchorText}</span>
            {isExamMode ? (
              <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
            ) : (
              <ArrowRight className="w-3 h-3 opacity-60 group-hover:translate-x-0.5 transition-transform" />
            )}
          </a>
        )}

        {/* 2. Secondary Educational Link: Concept in RBT Glossary */}
        {learningPath.glossary && (
          <a
            href={learningPath.glossary.url}
            target={isExamMode ? '_blank' : undefined}
            rel={isExamMode ? 'noopener noreferrer' : undefined}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs group"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{learningPath.glossary.anchorText}</span>
            {isExamMode ? (
              <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
            ) : (
              <ArrowRight className="w-3 h-3 opacity-60 group-hover:translate-x-0.5 transition-transform" />
            )}
          </a>
        )}

        {/* 3. Deep-Dive Clinical Article (if applicable) */}
        {learningPath.article && (
          <a
            href={learningPath.article.url}
            target={isExamMode ? '_blank' : undefined}
            rel={isExamMode ? 'noopener noreferrer' : undefined}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-800 dark:text-indigo-200 text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition-colors shadow-2xs group"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>{learningPath.article.anchorText}</span>
            {isExamMode ? (
              <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
            ) : (
              <ArrowRight className="w-3 h-3 opacity-60 group-hover:translate-x-0.5 transition-transform" />
            )}
          </a>
        )}

        {/* 4. Related Practice Bank (not shown during active exam to avoid distraction) */}
        {!isExamMode && learningPath.practice && (
          <a
            href={learningPath.practice.url}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition-colors shadow-2xs group ml-auto"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{learningPath.practice.anchorText}</span>
            <ArrowRight className="w-3 h-3 opacity-60 group-hover:translate-x-0.5 transition-transform" />
          </a>
        )}
      </div>
    </div>
  );
}
