import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Brain,
  Sparkles,
  CheckCircle,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Eye,
  CheckSquare,
  Square,
  AlertCircle,
  History,
} from 'lucide-react';
import { FlashcardLifecycleRepository } from '@/lib/storage/flashcard-lifecycle';
import { QuestionLifecycleRepository } from '@/lib/storage/question-lifecycle';
import { Flashcard } from '@/types';

export default function AdminFlashcardsIsland() {
  const [allCards, setAllCards] = useState<Flashcard[]>(() => FlashcardLifecycleRepository.getAllFlashcards());
  const [selectedStatusTab, setSelectedStatusTab] = useState<'active' | 'deleted' | 'archived' | 'all'>('active');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshCards = async () => {
    try {
      const res = await fetch('/api/v1/flashcards?status=all', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.items)) {
          setAllCards(data.data.items);
          return;
        }
      }
    } catch {}
    setAllCards(FlashcardLifecycleRepository.getAllFlashcards());
  };

  useEffect(() => {
    refreshCards();
  }, []);

  const activeCards = allCards.filter(
    (c) => (c.status === 'active' || !c.status) && c.status !== 'deleted' && c.status !== 'archived' && !FlashcardLifecycleRepository.isDeleted(c.id)
  );
  const deletedCards = allCards.filter(
    (c) => c.status === 'deleted' || FlashcardLifecycleRepository.isDeleted(c.id)
  );
  const archivedCards = allCards.filter(
    (c) => c.status === 'archived' && !FlashcardLifecycleRepository.isDeleted(c.id)
  );

  let pool = activeCards;
  if (selectedStatusTab === 'deleted') pool = deletedCards;
  if (selectedStatusTab === 'archived') pool = archivedCards;
  if (selectedStatusTab === 'all') pool = allCards;

  const filtered = pool.filter((c) => {
    const matchesDomain = selectedDomain === 'All' || c.domain.toLowerCase().includes(selectedDomain.toLowerCase());
    const matchesSearch =
      c.front.toLowerCase().includes(search.toLowerCase()) ||
      c.back.toLowerCase().includes(search.toLowerCase()) ||
      c.topic.toLowerCase().includes(search.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  const isAllSelected = filtered.length > 0 && filtered.every((c) => selectedIds.has(c.id));
  const isPartiallySelected = filtered.some((c) => selectedIds.has(c.id)) && !isAllSelected;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((c) => c.id)));
    }
  };

  // SOFT-DELETE ACTION
  const handleDeleteSingle = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this Flashcard? It will be moved to the Deleted Archive.')) {
      FlashcardLifecycleRepository.softDeleteFlashcard(id, 'Admin Single Delete', 'Admin');
      try {
        await fetch('/api/v1/flashcards', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cardId: id, reason: 'Admin UI action' }),
        });
      } catch {}
      refreshCards();
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setNotification('🗑️ Flashcard soft-deleted. Moved to Deleted Archive.');
      setTimeout(() => setNotification(null), 3500);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    const ids = Array.from(selectedIds);
    if (window.confirm(`Are you sure you want to delete ${count} selected Flashcard(s)?`)) {
      FlashcardLifecycleRepository.bulkSoftDeleteFlashcards(ids, 'Admin Bulk Delete', 'Admin');
      try {
        await fetch('/api/v1/flashcards', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cardIds: ids, reason: 'Admin Bulk action' }),
        });
      } catch {}
      refreshCards();
      setSelectedIds(new Set());
      setNotification(`🗑️ Successfully deleted ${count} Flashcards.`);
      setTimeout(() => setNotification(null), 3500);
    }
  };

  // EXPLICIT RESTORE ACTION
  const handleRestoreSingle = async (id: string) => {
    if (window.confirm('Restore this deleted Flashcard back to Active status?')) {
      FlashcardLifecycleRepository.restoreDeletedFlashcard(id);
      try {
        await fetch('/api/v1/flashcards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'restore', cardId: id }),
        });
      } catch {}
      refreshCards();
      setNotification('✅ Flashcard restored to Active status!');
      setTimeout(() => setNotification(null), 3500);
    }
  };

  const handleBulkRestore = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    const ids = Array.from(selectedIds);
    if (window.confirm(`Restore ${count} selected Flashcard(s) back to Active?`)) {
      for (const id of ids) {
        FlashcardLifecycleRepository.restoreDeletedFlashcard(id);
        try {
          await fetch('/api/v1/flashcards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'restore', cardId: id }),
          });
        } catch {}
      }
      refreshCards();
      setSelectedIds(new Set());
      setNotification(`✅ Restored ${count} Flashcards to Active status!`);
      setTimeout(() => setNotification(null), 3500);
    }
  };

  const handleBulkConvertAllQuestions = async () => {
    setLoading(true);
    try {
      const activeQuestions = QuestionLifecycleRepository.getActiveQuestions();
      const qids = activeQuestions.map((q) => q.id);
      const res = await fetch('/api/v1/flashcards/convert-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionIds: qids }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(`✅ Converted ${data.data?.convertedCount || 0} questions! (Skipped deleted cards).`);
        refreshCards();
      } else {
        setNotification('❌ Bulk conversion failed.');
      }
    } catch {
      setNotification('❌ Network error during conversion.');
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-brand-600" />
            <span>Flashcards & Lifecycle Studio</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage active flashcard decks with persistent soft-deletion, audit history, and explicit restore controls.
          </p>
        </div>

        <button
          onClick={handleBulkConvertAllQuestions}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Converting...' : 'Convert Active Questions to Cards'}</span>
        </button>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold animate-fadeIn">
          {notification}
        </div>
      )}

      {/* Lifecycle Status Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => {
            setSelectedStatusTab('active');
            setSelectedIds(new Set());
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            selectedStatusTab === 'active'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <span>Active Flashcards</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 dark:bg-black/20">
            {activeCards.length}
          </span>
        </button>

        <button
          onClick={() => {
            setSelectedStatusTab('deleted');
            setSelectedIds(new Set());
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            selectedStatusTab === 'deleted'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <span>Deleted Archive</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 dark:bg-black/20">
            {deletedCards.length}
          </span>
        </button>

        <button
          onClick={() => {
            setSelectedStatusTab('all');
            setSelectedIds(new Set());
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            selectedStatusTab === 'all'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <span>All Flashcards</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 dark:bg-black/20">
            {allCards.length}
          </span>
        </button>
      </div>

      {/* Floating Sticky Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-20 z-40 bg-white dark:bg-slate-900 border-2 border-brand-500/80 rounded-2xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-fadeIn backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-brand-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
              {selectedIds.size}
            </span>
            <div className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
              {selectedIds.size} Flashcard{selectedIds.size > 1 ? 's' : ''} Selected
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {selectedStatusTab === 'deleted' ? (
              <button
                onClick={handleBulkRestore}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restore Selected ({selectedIds.size})</span>
              </button>
            ) : (
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedIds.size})</span>
              </button>
            )}
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-600 dark:text-slate-300 text-xs font-semibold"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search prompt, concept, topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium"
          />
        </div>

        <select
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
          aria-label="Filter by Domain"
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold"
        >
          <option value="All">All Domains</option>
          <option value="Measurement">A: Measurement</option>
          <option value="Assessment">B: Assessment</option>
          <option value="Skill Acquisition">C: Skill Acquisition</option>
          <option value="Behavior Reduction">D: Behavior Reduction</option>
          <option value="Ethics">F: Professional Conduct</option>
        </select>
      </div>

      {/* Cards Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <div>
            Showing <span className="font-bold text-slate-900 dark:text-white">{filtered.length}</span> card(s) in{' '}
            <span className="font-bold text-slate-900 dark:text-white capitalize">{selectedStatusTab}</span> view
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-2xl">
              🗂️
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {selectedStatusTab === 'deleted' ? 'No Deleted Flashcards in Archive' : 'No Flashcards Found'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {selectedStatusTab === 'deleted'
                  ? 'All flashcard records are active and protected.'
                  : 'No cards match the selected filter criteria.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isPartiallySelected;
                      }}
                      onChange={toggleSelectAll}
                      aria-label="Select all flashcards"
                      className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                    />
                  </th>
                  <th className="p-4">Status / Track</th>
                  <th className="p-4">Front Prompt</th>
                  <th className="p-4">Back Definition</th>
                  <th className="p-4">Domain & Topic</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((c) => {
                  const isSelected = selectedIds.has(c.id);
                  const isDel = c.status === 'deleted' || FlashcardLifecycleRepository.isDeleted(c.id);

                  return (
                    <tr
                      key={c.id}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-brand-50/70 dark:bg-brand-950/40'
                          : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(c.id)}
                          aria-label={`Select card ${c.id}`}
                          className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                        />
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-wide ${
                            isDel
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200'
                              : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200'
                          }`}
                        >
                          {isDel ? 'DELETED' : c.certification || 'RBT'}
                        </span>
                        {isDel && c.deletedAt && (
                          <div className="text-[9px] text-rose-500 mt-1 font-mono">
                            Deleted {new Date(c.deletedAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white max-w-xs">{c.front}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 max-w-sm line-clamp-2">{c.back}</td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{c.domain}</div>
                        <div className="text-[10px] text-slate-400">{c.topic}</div>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap space-x-2">
                        {isDel ? (
                          <button
                            onClick={() => handleRestoreSingle(c.id)}
                            title="Restore Flashcard"
                            className="px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold inline-flex items-center gap-1 hover:bg-emerald-100"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Restore</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDeleteSingle(c.id)}
                            title="Soft-Delete Flashcard"
                            className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
