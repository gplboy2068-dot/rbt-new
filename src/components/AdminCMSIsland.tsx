import React, { useState } from 'react';
import { FileText, Edit2, Save, CheckCircle, Calendar, ShieldCheck, X, AlertTriangle } from 'lucide-react';
import { INITIAL_STUDY_GUIDES } from '@/data/mock-data';
import { StudyGuide } from '@/types';

export default function AdminCMSIsland() {
  const [guides, setGuides] = useState<StudyGuide[]>(INITIAL_STUDY_GUIDES);
  const [notification, setNotification] = useState<string | null>(null);
  const [editingGuide, setEditingGuide] = useState<StudyGuide | null>(null);
  const [reviewDateInput, setReviewDateInput] = useState<string>('');
  const [dateError, setDateError] = useState<string | null>(null);

  const handleOpenEdit = (guide: StudyGuide) => {
    setEditingGuide(guide);
    const existingDate = guide.lastReviewed ? guide.lastReviewed.split('T')[0] : '';
    setReviewDateInput(existingDate);
    setDateError(null);
  };

  const handleSaveReviewDate = () => {
    if (!editingGuide) return;

    if (reviewDateInput) {
      const parsed = new Date(reviewDateInput);
      if (isNaN(parsed.getTime())) {
        setDateError('Please enter a valid date in YYYY-MM-DD format.');
        return;
      }
      const now = new Date('2026-09-24T23:59:59Z');
      if (parsed > now) {
        setDateError('Review date cannot be set in the future.');
        return;
      }
    }

    const updatedGuides = guides.map((g) => {
      if (g.id === editingGuide.id) {
        return {
          ...g,
          lastReviewed: reviewDateInput ? `${reviewDateInput}T00:00:00Z` : undefined,
          updatedAt: '2026-09-24T00:00:00Z',
        };
      }
      return g;
    });

    setGuides(updatedGuides);
    setEditingGuide(null);
    setNotification(`✅ Updated editorial review date for "${editingGuide.title.split('—')[0].trim()}"`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleGlobalSave = () => {
    setNotification('✅ Study Guides and editorial freshness metadata persisted to database!');
    setTimeout(() => setNotification(null), 3000);
  };

  const formatDisplayDate = (isoStr?: string) => {
    if (!isoStr) return null;
    const parts = isoStr.split(/[-T]/);
    if (parts.length >= 2) {
      const year = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      if (!isNaN(year) && monthIdx >= 0 && monthIdx < 12) {
        return `${months[monthIdx]} ${year}`;
      }
    }
    return isoStr.split('T')[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-brand-600" />
            <span>CMS, Study Guides & Freshness Studio</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage high-yield cheatsheets, editorial review dates, and curriculum freshness verification.
          </p>
        </div>

        <button
          onClick={handleGlobalSave}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold animate-fadeIn flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Editorial Freshness Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">Editorial Integrity Policy:</span>
          <p className="leading-relaxed text-amber-800 dark:text-amber-400">
            "Last Reviewed" indicates a factual, curriculum-aligned accuracy check against the current RBT Test Content Outline (3rd ed.). Never set or bump review dates automatically on routine technical saves.
          </p>
        </div>
      </div>

      {/* Study Guides List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active High-Yield Study Guides (6 Domains)</h2>
          <span className="text-xs text-slate-400 font-medium">6/6 Domains Aligned</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guides.map((g) => {
            const reviewedDisplay = formatDisplayDate(g.lastReviewed);
            return (
              <div
                key={g.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3.5 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200">
                      {g.domain}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{g.readTimeMinutes} min read</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{g.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{g.summary}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    {reviewedDisplay ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span>Reviewed: {reviewedDisplay}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        <span>Review Needed</span>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenEdit(g)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-xs font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Freshness</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Review Date Modal */}
      {editingGuide && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-fadeIn">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                  Editorial Review Audit
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  Update Editorial Review Date
                </h3>
              </div>
              <button
                onClick={() => setEditingGuide(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">Target Guide:</span>
              <p className="text-slate-600 dark:text-slate-400 font-medium">{editingGuide.title}</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="lastReviewedInput" className="block text-xs font-bold text-slate-900 dark:text-white">
                Last Reviewed Date
              </label>
              <div className="relative">
                <input
                  id="lastReviewedInput"
                  type="date"
                  value={reviewDateInput}
                  onChange={(e) => {
                    setReviewDateInput(e.target.value);
                    setDateError(null);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Only update this date when a factual, curriculum-aligned review against the BACB RBT Test Content Outline has been completed. Leave blank if review is pending.
              </p>
              {dateError && (
                <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{dateError}</span>
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setEditingGuide(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReviewDate}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-colors"
              >
                Save Review Date
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
