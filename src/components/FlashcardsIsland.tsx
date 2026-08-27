import React, { useState, useEffect } from 'react';
import { Layers, RotateCw, Brain, Eye, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { INITIAL_FLASHCARDS } from '@/data/mock-data';
import { Flashcard, FlashcardSRSState } from '@/types';
import { progressRepo } from '@/lib/storage/progress-repo';
import { FlashcardLifecycleRepository } from '@/lib/storage/flashcard-lifecycle';
import { ReviewGrade } from '@/lib/srs/sm2';

export default function FlashcardsIsland() {
  const [cards, setCards] = useState<Flashcard[]>(() => FlashcardLifecycleRepository.getActiveFlashcards());
  const [srsStates, setSrsStates] = useState<Record<string, FlashcardSRSState>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('All');

  const filteredCards =
    selectedDomain === 'All'
      ? cards
      : cards.filter((c) => c.domain.toLowerCase().includes(selectedDomain.toLowerCase()));

  useEffect(() => {
    fetch('/api/v1/flashcards?status=active')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data?.items)) {
          setCards(d.data.items);
        } else {
          setCards(FlashcardLifecycleRepository.getActiveFlashcards());
        }
      })
      .catch(() => setCards(FlashcardLifecycleRepository.getActiveFlashcards()));

    progressRepo.getAllSRSStates().then((states) => {
      const map: Record<string, FlashcardSRSState> = {};
      for (const s of states) map[s.cardId] = s;
      setSrsStates(map);
    });
  }, []);

  const currentCard = filteredCards[currentIndex] || filteredCards[0];
  const currentState = currentCard ? srsStates[currentCard.id] : null;

  const handleGrade = async (grade: ReviewGrade) => {
    if (!currentCard) return;
    const updated = await progressRepo.reviewFlashcard(currentCard.id, grade);
    setSrsStates((p) => ({ ...p, [currentCard.id]: updated }));
    setIsFlipped(false);
    setCurrentIndex((p) => (p < filteredCards.length - 1 ? p + 1 : 0));
  };

  // Keyboard accessibility
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((p) => !p);
      } else if (isFlipped) {
        if (e.key === '1') handleGrade('again');
        if (e.key === '2') handleGrade('hard');
        if (e.key === '3') handleGrade('good');
        if (e.key === '4') handleGrade('easy');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFlipped, currentCard]);

  const masteredCount = Object.values(srsStates).filter((s) => s.status === 'mastered').length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            <Brain className="w-4 h-4" />
            <span>SuperMemo-2 Adaptive SRS</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-1">
            <Layers className="w-8 h-8 text-brand-600 dark:text-brand-400" />
            <span>RBT Spaced Repetition Flashcards</span>
          </h1>
        </div>

        <select
          value={selectedDomain}
          onChange={(e) => {
            setSelectedDomain(e.target.value);
            setCurrentIndex(0);
            setIsFlipped(false);
          }}
          aria-label="Filter by Domain"
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200"
        >
          <option value="All">All Task List Domains</option>
          <option value="Measurement">A: Measurement</option>
          <option value="Assessment">B: Assessment</option>
          <option value="Skill Acquisition">C: Skill Acquisition</option>
          <option value="Behavior Reduction">D: Behavior Reduction</option>
          <option value="Ethics">F: Professional Conduct</option>
        </select>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <div className="text-xs text-slate-500 font-bold uppercase">Deck Size</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{filteredCards.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <div className="text-xs text-slate-500 font-bold uppercase">Mastered (21d+)</div>
          <div className="text-2xl font-black text-emerald-500">{masteredCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center col-span-2 sm:col-span-1">
          <div className="text-xs text-slate-500 font-bold uppercase">Keyboard Shortcuts</div>
          <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mt-2">
            [Space] Flip • [1-4] Grade
          </div>
        </div>
      </div>

      {currentCard ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Card {currentIndex + 1} of {filteredCards.length}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200">
              {currentCard.domain}
            </span>
          </div>

          {/* 3D Flip Card Container */}
          <div className="relative w-full [perspective:1000px] min-h-[320px]">
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className={`w-full min-h-[320px] rounded-3xl cursor-pointer transition-transform duration-500 [transform-style:preserve-3d] ${
                isFlipped ? '[transform:rotateY(180deg)]' : ''
              }`}
            >
              {/* FRONT FACE */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-brand-500 p-8 flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>Concept / Question</span>
                  <span className="flex items-center gap-1 text-brand-600">
                    <RotateCw className="w-3.5 h-3.5" /> Tap or Spacebar to Flip
                  </span>
                </div>

                <div className="py-6 text-center">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-relaxed">
                    {currentCard.front}
                  </h2>
                </div>

                <div className="text-center text-xs text-slate-400">
                  Click anywhere to reveal definition & clinical rationale
                </div>
              </div>

              {/* BACK FACE */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-3xl bg-slate-900 dark:bg-slate-950 text-white border-2 border-brand-500 p-8 flex flex-col justify-between shadow-xl">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <span>Answer & ABA Procedure</span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Rate Recall Accuracy
                  </span>
                </div>

                <div className="py-4 text-center space-y-3">
                  <h3 className="text-lg sm:text-xl font-bold text-emerald-300 whitespace-pre-line leading-relaxed">
                    {currentCard.back}
                  </h3>
                  {currentCard.explanation && (
                    <p className="text-xs text-slate-300 pt-2 border-t border-slate-800">
                      💡 {currentCard.explanation}
                    </p>
                  )}
                </div>

                <div className="text-center text-xs text-slate-400">
                  Select your recall grade below or press [1 - 4]
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          {isFlipped ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fadeIn">
              <button
                onClick={() => handleGrade('again')}
                className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200 font-bold text-xs sm:text-sm hover:scale-[1.02] transition-all flex flex-col items-center"
              >
                <span>[1] Again</span>
                <span className="text-[10px] font-normal text-rose-600">Reset to 1d</span>
              </button>
              <button
                onClick={() => handleGrade('hard')}
                className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 font-bold text-xs sm:text-sm hover:scale-[1.02] transition-all flex flex-col items-center"
              >
                <span>[2] Hard</span>
                <span className="text-[10px] font-normal text-amber-600">Short Interval</span>
              </button>
              <button
                onClick={() => handleGrade('good')}
                className="p-3.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200 font-bold text-xs sm:text-sm hover:scale-[1.02] transition-all flex flex-col items-center"
              >
                <span>[3] Good</span>
                <span className="text-[10px] font-normal text-blue-600">Standard SM-2</span>
              </button>
              <button
                onClick={() => handleGrade('easy')}
                className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 font-bold text-xs sm:text-sm hover:scale-[1.02] transition-all flex flex-col items-center"
              >
                <span>[4] Easy</span>
                <span className="text-[10px] font-normal text-emerald-600">Long Interval</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setCurrentIndex((p) => (p > 0 ? p - 1 : filteredCards.length - 1));
                  setIsFlipped(false);
                }}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="w-4 h-4" /> Prev
              </button>

              <button
                onClick={() => setIsFlipped(true)}
                className="px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span>Show Answer (Space)</span>
              </button>

              <button
                onClick={() => {
                  setCurrentIndex((p) => (p < filteredCards.length - 1 ? p + 1 : 0));
                  setIsFlipped(false);
                }}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="text-slate-500 text-sm">No flashcards found for this domain.</div>
        </div>
      )}
    </div>
  );
}
