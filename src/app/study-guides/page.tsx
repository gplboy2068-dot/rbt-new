'use client';

import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  BookOpen,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { INITIAL_STUDY_GUIDES } from '@/data/mock-data';
import { StudyGuide, SubjectCategory } from '@/types';

export default function StudyGuidesPage() {
  const [selectedSubject, setSelectedSubject] = useState<SubjectCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>(INITIAL_STUDY_GUIDES[0]?.id || null);

  const filteredGuides = INITIAL_STUDY_GUIDES.filter((guide) => {
    if (selectedSubject !== 'All' && guide.subject !== selectedSubject) return false;
    if (searchQuery && !guide.title.toLowerCase().includes(searchQuery.toLowerCase()) && !guide.summary.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          <Sparkles className="w-4 h-4" />
          <span>High-Yield Reference & Cheat Sheets</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <GraduationCap className="w-8 h-8 text-amber-500" />
          <span>Study Guides & Formula Sheets</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl">
          Comprehensive, rapid-review cheatsheets and algorithmic paradigms. Open for everyone with zero login barriers.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {['All', 'Mathematics', 'Computer Science', 'Science', 'Reasoning'].map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedSubject === sub
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search formulas, concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-sm"
          />
        </div>
      </div>

      {/* Guides Accordion List */}
      <div className="space-y-4">
        {filteredGuides.map((guide) => {
          const isExpanded = expandedGuideId === guide.id;

          return (
            <div
              key={guide.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all"
            >
              <button
                onClick={() => setExpandedGuideId(isExpanded ? null : guide.id)}
                className="w-full text-left p-6 flex items-start justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      {guide.subject}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{guide.readTimeMinutes} min read</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {guide.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    {guide.summary}
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-6 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-6 animate-fadeIn">
                  {guide.sections.map((sec, sIdx) => (
                    <div key={sIdx} className="space-y-3">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>{sec.title}</span>
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {sec.content}
                      </p>

                      {sec.keyFormulasOrPoints && (
                        <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-2">
                          <div className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                            Key Rules / Formulas:
                          </div>
                          <ul className="space-y-1.5">
                            {sec.keyFormulasOrPoints.map((pt, pIdx) => (
                              <li
                                key={pIdx}
                                className="text-xs sm:text-sm font-mono text-slate-900 dark:text-slate-100 bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-amber-100 dark:border-slate-800"
                              >
                                {pt}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
