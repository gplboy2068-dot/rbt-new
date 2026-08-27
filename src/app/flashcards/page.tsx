'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  RotateCw,
  CheckCircle,
  Clock,
  Plus,
  ArrowRight,
  Brain,
  HardDrive,
  Eye,
  Info,
} from 'lucide-react';
import { INITIAL_FLASHCARDS } from '@/data/mock-data';
import { Flashcard, FlashcardSRSState } from '@/types';
import { progressRepo } from '@/lib/storage/progress-repo';
import { ReviewGrade } from '@/lib/srs/sm2';

export default function FlashcardsSRSPage() {
  const [cards, setCards] = useState<Flashcard[]>(INITIAL_FLASHCARDS);
  const [srsStates, setSrsStates] = useState<Record<string, FlashcardSRSState>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCard, setNewCard] = useState({ subject: 'Mathematics', front: '', back: '', notes: '' });

  useEffect(() => {
    const loadStates = async () => {
      const allStates = await progressRepo.getAllSRSStates();
      const map: Record<string, FlashcardSRSState> = {};
      for (const st of allStates) {
        map[st.cardId] = st;
      }
      setSrsStates(map);
    };
    loadStates();
  }, []);

  const currentCard = cards[currentIndex];
  const currentState = currentCard ? srsStates[currentCard.id] : null;

  const handleGrade = async (grade: ReviewGrade) => {
    if (!currentCard) return;

    // Run SM-2 algorithm & update IndexedDB
    const updated = await progressRepo.reviewFlashcard(currentCard.id, grade);
    setSrsStates((prev) => ({
      ...prev,
      [currentCard.id]: updated,
    }));

    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Loop or finish
      setCurrentIndex(0);
    }
  };

  const handleAddCustomCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.front || !newCard.back) return;

    const created: Flashcard = {
      id: `custom_fc_${Date.now()}`,
      deckId: 'user_custom',
      subject: newCard.subject as any,
      front: newCard.front,
      back: newCard.back,
      notes: newCard.notes,
    };

    setCards((prev) => [created, ...prev]);
    setShowAddModal(false);
    setNewCard({ subject: 'Mathematics', front: '', back: '', notes: '' });
  };

  const masteredCount = Object.values(srsStates).filter((s) => s.status === 'mastered').length;
  const learningCount = Object.values(srsStates).filter((s) => s.status === 'learning' || s.status === 'review').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            <Brain className="w-4 h-4" />
            <span>SuperMemo-2 Adaptive SRS Algorithm</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 mt-1">
            <Layers className="w-8 h-8 text-brand-600 dark:text-brand-400" />
            <span>Spaced Repetition Flashcards</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Optimize long-term memory retention without login walls. All review intervals are calculated locally in your browser.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Flashcard</span>
          </button>
        </div>
      </div>

      {/* SRS Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="text-xs text-slate-500 font-semibold uppercase">Total Cards</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{cards.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="text-xs text-slate-500 font-semibold uppercase">In Learning / Review</div>
          <div className="text-2xl font-black text-amber-500 mt-0.5">{learningCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="text-xs text-slate-500 font-semibold uppercase">Mastered (21d+)</div>
          <div className="text-2xl font-black text-emerald-500 mt-0.5">{masteredCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="text-xs text-slate-500 font-semibold uppercase">Engine</div>
          <div className="text-xs font-bold text-brand-600 dark:text-brand-400 mt-2">IndexedDB SM-2</div>
        </div>
      </div>

      {/* Interactive 3D Flashcard Deck */}
      {currentCard ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Card {currentIndex + 1} of {cards.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                {currentCard.subject}
              </span>
              {currentState && (
                <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-bold capitalize">
                  Status: {currentState.status} ({currentState.interval}d interval)
                </span>
              )}
            </div>
          </div>

          {/* Flashcard Area */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer min-h-[300px] sm:min-h-[360px] rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 shadow-lg p-8 flex flex-col justify-between transition-all group select-none relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>{isFlipped ? 'Answer / Explanation' : 'Prompt / Question'}</span>
              <span className="flex items-center gap-1 text-brand-600 group-hover:underline">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Click anywhere to flip</span>
              </span>
            </div>

            {/* Card Content */}
            <div className="py-6 text-center space-y-4">
              {!isFlipped ? (
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
                  {currentCard.front}
                </h2>
              ) : (
                <div className="space-y-3 animate-fadeIn">
                  <h3 className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 whitespace-pre-line leading-relaxed">
                    {currentCard.back}
                  </h3>
                  {currentCard.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto pt-2 border-t border-slate-100 dark:border-slate-800">
                      💡 {currentCard.notes}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="text-center text-xs text-slate-400">
              {isFlipped ? 'Rate your recall accuracy below to schedule next review' : 'Think of the answer, then click to check'}
            </div>
          </div>

          {/* Spaced Repetition Grading Controls */}
          {isFlipped ? (
            <div className="space-y-3 animate-fadeIn">
              <div className="text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                How easily did you recall this?
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => handleGrade('again')}
                  className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-900/60 font-bold text-sm transition-all"
                >
                  <div className="text-xs font-medium text-rose-600 dark:text-rose-400">Blackout</div>
                  <span>Again (1d)</span>
                </button>
                <button
                  onClick={() => handleGrade('hard')}
                  className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/60 font-bold text-sm transition-all"
                >
                  <div className="text-xs font-medium text-amber-600 dark:text-amber-400">Struggled</div>
                  <span>Hard</span>
                </button>
                <button
                  onClick={() => handleGrade('good')}
                  className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/60 font-bold text-sm transition-all"
                >
                  <div className="text-xs font-medium text-blue-600 dark:text-blue-400">Normal</div>
                  <span>Good</span>
                </button>
                <button
                  onClick={() => handleGrade('easy')}
                  className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 font-bold text-sm transition-all"
                >
                  <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Instant</div>
                  <span>Easy (Max)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => setIsFlipped(true)}
                className="px-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span>Show Answer</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-slate-600 dark:text-slate-400">No flashcards available.</p>
        </div>
      )}

      {/* Add Flashcard Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Custom Flashcard</h3>
            <form onSubmit={handleAddCustomCard} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject
                </label>
                <select
                  value={newCard.subject}
                  onChange={(e) => setNewCard({ ...newCard, subject: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="Reasoning">Reasoning</option>
                  <option value="Verbal">Verbal</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Front (Prompt)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. What is Hooke's Law?"
                  value={newCard.front}
                  onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Back (Answer)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. F = -k·x where k is spring constant"
                  value={newCard.back}
                  onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold"
                >
                  Save Flashcard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
