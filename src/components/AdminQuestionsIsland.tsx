import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Archive,
  Layers,
  CheckCircle,
  AlertCircle,
  Sparkles,
  CheckSquare,
  Square,
  MinusSquare,
  Award,
  RotateCcw,
  Upload,
  RefreshCw,
  Eye,
  History,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { QuestionLifecycleRepository } from '@/lib/storage/question-lifecycle';
import { Question, QuestionStatus } from '@/types';

export default function AdminQuestionsIsland() {
  const [allQuestions, setAllQuestions] = useState<Question[]>(() => QuestionLifecycleRepository.getAllQuestions());
  const [selectedStatusTab, setSelectedStatusTab] = useState<'active' | 'deleted' | 'archived' | 'all'>('active');
  const [search, setSearch] = useState('');
  const [selectedCertification, setSelectedCertification] = useState('All');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedVersion, setSelectedVersion] = useState('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  // Range and Batch migration states
  const [rangeFrom, setRangeFrom] = useState('2251');
  const [rangeTo, setRangeTo] = useState('3180');
  const [lastNCount, setLastNCount] = useState('930');

  // Fetch Central Server Database Questions
  const fetchCentralQuestions = async () => {
    try {
      const res = await fetch('/api/v1/questions?status=all&limit=20000', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.items)) {
          setAllQuestions(data.data.items);
          // Sync local repository
          data.data.items.forEach((q: Question) => {
            if (q.status === 'deleted') {
              QuestionLifecycleRepository.softDeleteQuestion(q.id, q.deletionReason, q.deletedBy);
            }
          });
          return;
        }
      }
    } catch (e) {
      console.warn('Central fetch fallback to local store', e);
    }
    setAllQuestions(QuestionLifecycleRepository.getAllQuestions());
  };

  useEffect(() => {
    fetchCentralQuestions();
  }, []);

  const activeQuestions = allQuestions.filter(
    (q) => (q.status === 'active' || q.status === 'published' || !q.status) && q.status !== 'deleted' && q.status !== 'archived' && !QuestionLifecycleRepository.isDeleted(q.id)
  );
  const deletedQuestions = allQuestions.filter(
    (q) => q.status === 'deleted' || QuestionLifecycleRepository.isDeleted(q.id)
  );
  const archivedQuestions = allQuestions.filter(
    (q) => q.status === 'archived' && !QuestionLifecycleRepository.isDeleted(q.id)
  );

  // Filter based on selected status tab
  let poolByStatus = activeQuestions;
  if (selectedStatusTab === 'deleted') poolByStatus = deletedQuestions;
  if (selectedStatusTab === 'archived') poolByStatus = archivedQuestions;
  if (selectedStatusTab === 'all') poolByStatus = allQuestions;

  // Filter with additional criteria
  const filtered = poolByStatus.filter((q) => {
    const matchesSearch =
      q.content.toLowerCase().includes(search.toLowerCase()) ||
      q.code.toLowerCase().includes(search.toLowerCase()) ||
      q.topicName.toLowerCase().includes(search.toLowerCase());
    const matchesCert =
      selectedCertification === 'All' ||
      (q.certification || 'RBT').toUpperCase() === selectedCertification.toUpperCase();
    const matchesDomain = selectedDomain === 'All' || q.domainName.includes(selectedDomain);
    const matchesDifficulty = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
    const matchesVersion =
      selectedVersion === 'All' || (q.certificationVersion || '6th Edition') === selectedVersion;
    return matchesSearch && matchesCert && matchesDomain && matchesDifficulty && matchesVersion;
  });

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCertification, selectedDomain, selectedDifficulty, selectedVersion, selectedStatusTab, pageSize]);

  const effectivePageSize = pageSize === 0 ? filtered.length : pageSize;
  const totalPages = Math.max(1, Math.ceil(filtered.length / effectivePageSize));
  const paginatedList = pageSize === 0 ? filtered : filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const isAllSelected = filtered.length > 0 && filtered.every((q) => selectedIds.has(q.id));
  const isPartiallySelected = filtered.some((q) => selectedIds.has(q.id)) && !isAllSelected;

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
      setSelectedIds(new Set(filtered.map((q) => q.id)));
    }
  };

  // SERVER-AUTHORITATIVE SOFT-DELETE
  const handleDeleteSingle = async (id: string, code: string) => {
    if (window.confirm(`Are you sure you want to delete question "${code}" from the central database?`)) {
      setLoading(true);
      try {
        const res = await fetch('/api/v1/questions', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionId: id, reason: 'Admin UI Action' }),
        });

        if (res.ok) {
          QuestionLifecycleRepository.softDeleteQuestion(id, 'Admin Single Delete', 'Admin');
          await fetchCentralQuestions();
          setSelectedIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          setNotification(`🗑️ Question ${code} soft-deleted from central database!`);
        } else {
          setNotification('❌ Failed to delete question on server.');
        }
      } catch {
        setNotification('❌ Network error while deleting.');
      } finally {
        setLoading(false);
        setTimeout(() => setNotification(null), 3500);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    const ids = Array.from(selectedIds);
    if (window.confirm(`Delete ${count} questions permanently from central database?`)) {
      setLoading(true);
      try {
        const res = await fetch('/api/v1/questions', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionIds: ids, reason: 'Admin Bulk Delete' }),
        });

        if (res.ok) {
          QuestionLifecycleRepository.bulkSoftDeleteQuestions(ids, 'Admin Bulk Delete', 'Admin');
          await fetchCentralQuestions();
          setSelectedIds(new Set());
          setNotification(`🗑️ Successfully deleted ${count} questions in central database.`);
        } else {
          setNotification('❌ Server error during bulk delete.');
        }
      } catch {
        setNotification('❌ Network error during bulk delete.');
      } finally {
        setLoading(false);
        setTimeout(() => setNotification(null), 3500);
      }
    }
  };

  // SERVER-AUTHORITATIVE RESTORE
  const handleRestoreSingle = async (id: string, code: string) => {
    if (window.confirm(`Restore deleted question "${code}" back to Active status in central database?`)) {
      setLoading(true);
      try {
        const res = await fetch('/api/v1/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'restore', questionId: id }),
        });

        if (res.ok) {
          QuestionLifecycleRepository.restoreDeletedQuestion(id);
          await fetchCentralQuestions();
          setNotification(`✅ Question ${code} restored in central database!`);
        } else {
          setNotification('❌ Server failed to restore question.');
        }
      } catch {
        setNotification('❌ Network error during restore.');
      } finally {
        setLoading(false);
        setTimeout(() => setNotification(null), 3500);
      }
    }
  };

  const handleBulkRestore = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    const ids = Array.from(selectedIds);
    if (window.confirm(`Restore ${count} selected questions back to Active in central database?`)) {
      setLoading(true);
      try {
        const res = await fetch('/api/v1/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'restore', questionIds: ids }),
        });

        if (res.ok) {
          ids.forEach((id) => QuestionLifecycleRepository.restoreDeletedQuestion(id));
          await fetchCentralQuestions();
          setSelectedIds(new Set());
          setNotification(`✅ Restored ${count} questions in central database!`);
        } else {
          setNotification('❌ Server error during bulk restore.');
        }
      } catch {
        setNotification('❌ Network error during bulk restore.');
      } finally {
        setLoading(false);
        setTimeout(() => setNotification(null), 3500);
      }
    }
  };

  // RESTORE SETTINGS ONLY
  const handleRestoreSettingsOnly = () => {
    if (
      window.confirm(
        'Restore Default System Configuration (theme, rate limits, UI preferences)?\n\nNOTE: This will NOT restore deleted questions. Central database deletions remain preserved.'
      )
    ) {
      const result = QuestionLifecycleRepository.restoreDefaultConfiguration();
      setNotification(`⚙️ System settings reset. ${result.deletedQuestionsPreservedCount} deleted question(s) preserved.`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // PURGE ALL QUESTIONS FROM CENTRAL DATABASE
  const handlePurgeAllQuestions = async () => {
    if (
      window.confirm(
        '⚠️ PERMANENTLY DELETE ALL QUESTIONS?\n\nThis will purge all questions from the central database across Localhost and Live Server (0 active questions). Are you sure?'
      )
    ) {
      setLoading(true);
      try {
        const res = await fetch('/api/v1/questions', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ purgeAll: true }),
        });
        if (res.ok) {
          const allQ = QuestionLifecycleRepository.getAllQuestions();
          QuestionLifecycleRepository.bulkSoftDeleteQuestions(allQ.map((q) => q.id), 'Purge All', 'Admin');
          await fetchCentralQuestions();
          setSelectedIds(new Set());
          setNotification('🗑️ All questions have been completely deleted from central database (0 active questions).');
        } else {
          setNotification('❌ Failed to purge questions on server.');
        }
      } catch {
        setNotification('❌ Network error during purge.');
      } finally {
        setLoading(false);
        setTimeout(() => setNotification(null), 4000);
      }
    }
  };

  // BULK SET CERTIFICATION TRACK (RBT / BACB)
  const handleBulkSetTrack = async (targetTrack: 'BACB' | 'RBT') => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/questions/bulk-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionIds: ids,
          certification: targetTrack,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotification(`✅ Successfully moved ${data.data?.updatedCount || ids.length} questions to ${targetTrack} track!`);
        setAllQuestions((prev) =>
          prev.map((q) => (selectedIds.has(q.id) || selectedIds.has(q.code) ? { ...q, certification: targetTrack } : q))
        );
        QuestionLifecycleRepository.bulkUpdateCertification(ids, targetTrack);
        setSelectedIds(new Set());
      } else {
        setNotification(`❌ Error updating track: ${data.error?.message || 'Failed'}`);
      }
    } catch {
      QuestionLifecycleRepository.bulkUpdateCertification(ids, targetTrack);
      setAllQuestions((prev) =>
        prev.map((q) => (selectedIds.has(q.id) || selectedIds.has(q.code) ? { ...q, certification: targetTrack } : q))
      );
      setNotification(`✅ Moved ${ids.length} questions to ${targetTrack} track.`);
      setSelectedIds(new Set());
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleSelectAllFiltered = () => {
    const nextSet = new Set<string>();
    filtered.forEach((q) => nextSet.add(q.id));
    setSelectedIds(nextSet);
  };

  // SMART AUTO-DETECT BACB QUESTIONS
  const handleAutoDetectBACB = async () => {
    const bacbIds: string[] = [];
    const keywords = ['bacb', 'bcba', 'bcaba', 'supervising bcba', 'ethics code', 'task list specification', 'mswo', 'preference assessment', 'continuous measurement', 'task list'];
    
    allQuestions.forEach((q) => {
      const text = `${q.content} ${q.code} ${q.referenceSource || ''} ${(q.tags || []).join(' ')} ${q.domainName}`.toLowerCase();
      if (keywords.some((kw) => text.includes(kw))) {
        bacbIds.push(q.id);
      }
    });

    if (bacbIds.length === 0) {
      setNotification('No questions matched automatic BACB criteria.');
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (window.confirm(`Auto-detect found ${bacbIds.length} questions matching BACB keywords. Move these to BACB Practice Track?`)) {
      setSelectedIds(new Set(bacbIds));
      await handleBulkSetTrackDirect(bacbIds, 'BACB');
    }
  };

  // MOVE LAST N QUESTIONS (e.g. 930) TO BACB
  const handleMoveLastNToBACB = async (count: number) => {
    if (!count || count <= 0) return;
    const targetSlice = allQuestions.slice(-count);
    const ids = targetSlice.map((q) => q.id);

    if (window.confirm(`Move the last ${ids.length} questions in the database to BACB Practice Track?`)) {
      setSelectedIds(new Set(ids));
      await handleBulkSetTrackDirect(ids, 'BACB');
    }
  };

  // MOVE RANGE (e.g. 2251 to 3180) TO BACB
  const handleMoveRangeToBACB = async (fromIndex: number, toIndex: number) => {
    if (!fromIndex || !toIndex || fromIndex < 1 || toIndex < fromIndex) {
      alert('Please enter a valid range (e.g. From 2251 To 3180).');
      return;
    }
    const targetSlice = allQuestions.slice(fromIndex - 1, toIndex);
    const ids = targetSlice.map((q) => q.id);

    if (window.confirm(`Move ${ids.length} questions (from #${fromIndex} to #${toIndex}) to BACB Practice Track?`)) {
      setSelectedIds(new Set(ids));
      await handleBulkSetTrackDirect(ids, 'BACB');
    }
  };

  const handleBulkSetTrackDirect = async (ids: string[], targetTrack: 'BACB' | 'RBT') => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/questions/bulk-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionIds: ids,
          certification: targetTrack,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotification(`✅ Successfully moved ${data.data?.updatedCount || ids.length} questions to ${targetTrack} track!`);
        setAllQuestions((prev) =>
          prev.map((q) => (ids.includes(q.id) || ids.includes(q.code) ? { ...q, certification: targetTrack } : q))
        );
        QuestionLifecycleRepository.bulkUpdateCertification(ids, targetTrack);
        setSelectedIds(new Set());
      } else {
        setNotification(`❌ Error updating track: ${data.error?.message || 'Failed'}`);
      }
    } catch {
      QuestionLifecycleRepository.bulkUpdateCertification(ids, targetTrack);
      setAllQuestions((prev) =>
        prev.map((q) => (ids.includes(q.id) || ids.includes(q.code) ? { ...q, certification: targetTrack } : q))
      );
      setNotification(`✅ Moved ${ids.length} questions to ${targetTrack} track locally.`);
      setSelectedIds(new Set());
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleConvertToFlashcard = async (q: Question) => {
    try {
      const res = await fetch('/api/v1/flashcards/convert-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionIds: [q.id] }),
      });
      if (res.ok) {
        setNotification(`✅ Question ${q.code} converted to Flashcard!`);
      } else {
        setNotification('❌ Conversion failed.');
      }
    } catch {
      setNotification('❌ Network error during conversion.');
    }
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>RBT 6th Edition & BACB Database-Synchronized Question Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2 mt-1">
            <HelpCircle className="w-7 h-7 text-brand-600" />
            <span>Question Bank Studio</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Managing <strong className="text-slate-900 dark:text-white">{allQuestions.length}</strong> total questions in central Cloudflare database.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={handlePurgeAllQuestions}
            disabled={loading}
            title="Purge/Delete All Questions from Database"
            className="px-3.5 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge All Questions</span>
          </button>
          <button
            onClick={handleRestoreSettingsOnly}
            title="Restore Default System Configuration (Settings Only)"
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Restore Settings</span>
          </button>
          <a
            href="/admin/csv-import"
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-sm flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </a>
          <a
            href="/admin/csv-export"
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors"
          >
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold animate-fadeIn">
          {notification}
        </div>
      )}

      {/* Track Distribution & Quick Migration Studio Card */}
      <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
          <div className="space-y-0.5">
            <div className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Certification Track Distribution & Batch Migration Tool</span>
            </div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white">
              Currently in Database: <span className="text-emerald-600 font-black">{allQuestions.filter((q) => (q.certification || 'RBT').toUpperCase() === 'RBT' && q.status !== 'deleted' && !QuestionLifecycleRepository.isDeleted(q.id)).length} RBT Questions</span> | <span className="text-purple-600 font-black">{allQuestions.filter((q) => (q.certification || '').toUpperCase() === 'BACB' && q.status !== 'deleted' && !QuestionLifecycleRepository.isDeleted(q.id)).length} BACB Questions</span>
            </div>
          </div>

          <button
            onClick={handleAutoDetectBACB}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>⚡ Auto-Detect & Move BACB Questions</span>
          </button>
        </div>

        {/* Quick Batch Migration Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Quick Option 1: Move Last N Questions */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Move Last N Questions (e.g. 930 BACB questions):
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Last</span>
              <input
                type="number"
                value={lastNCount}
                onChange={(e) => setLastNCount(e.target.value)}
                className="w-24 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                placeholder="930"
              />
              <span className="text-xs text-slate-500 font-semibold">questions</span>
              <button
                type="button"
                onClick={() => handleMoveLastNToBACB(parseInt(lastNCount, 10))}
                disabled={loading || !lastNCount}
                className="ml-auto px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                🟣 Move to BACB
              </button>
            </div>
          </div>

          {/* Quick Option 2: Move Range */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Move Specific Index Range to BACB:
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">From #</span>
              <input
                type="number"
                value={rangeFrom}
                onChange={(e) => setRangeFrom(e.target.value)}
                className="w-20 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                placeholder="2251"
              />
              <span className="text-xs text-slate-500 font-semibold">To #</span>
              <input
                type="number"
                value={rangeTo}
                onChange={(e) => setRangeTo(e.target.value)}
                className="w-20 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                placeholder="3180"
              />
              <button
                type="button"
                onClick={() => handleMoveRangeToBACB(parseInt(rangeFrom, 10), parseInt(rangeTo, 10))}
                disabled={loading || !rangeFrom || !rangeTo}
                className="ml-auto px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                🟣 Move Range
              </button>
            </div>
          </div>
        </div>
      </div>

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
          <span>Active Questions</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 dark:bg-black/20">
            {activeQuestions.length}
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
            {deletedQuestions.length}
          </span>
        </button>

        <button
          onClick={() => {
            setSelectedStatusTab('archived');
            setSelectedIds(new Set());
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            selectedStatusTab === 'archived'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <span>Archived</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 dark:bg-black/20">
            {archivedQuestions.length}
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
          <span>All Records</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 dark:bg-black/20">
            {allQuestions.length}
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
            <div>
              <div className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                {selectedIds.size} Question{selectedIds.size > 1 ? 's' : ''} Selected
              </div>
              <div className="text-[11px] text-slate-500">Apply central database action</div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {selectedStatusTab === 'deleted' ? (
              <button
                onClick={handleBulkRestore}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restore Selected ({selectedIds.size})</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleBulkSetTrack('BACB')}
                  disabled={loading}
                  title="Assign selected questions to BACB Practice Track"
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors"
                >
                  <span>🟣 Move to BACB Track ({selectedIds.size})</span>
                </button>
                <button
                  onClick={() => handleBulkSetTrack('RBT')}
                  disabled={loading}
                  title="Assign selected questions to RBT Track"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors"
                >
                  <span>🟢 Move to RBT Track ({selectedIds.size})</span>
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={loading}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete ({selectedIds.size})</span>
                </button>
              </>
            )}
            {filtered.length > selectedIds.size && (
              <button
                onClick={handleSelectAllFiltered}
                className="px-3 py-2 rounded-xl border border-brand-300 dark:border-brand-700 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 text-xs font-bold hover:bg-brand-100 transition-colors"
              >
                Select All Filtered ({filtered.length})
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
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search code or stem..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium"
          />
        </div>

        <select
          value={selectedCertification}
          onChange={(e) => setSelectedCertification(e.target.value)}
          aria-label="Filter by Certification Track"
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-brand-600"
        >
          <option value="All">All Certifications</option>
          <option value="RBT">RBT Certification Track</option>
          <option value="BACB">BACB Certification Track</option>
        </select>

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

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          aria-label="Filter by Difficulty"
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold"
        >
          <option value="All">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <select
          value={selectedVersion}
          onChange={(e) => setSelectedVersion(e.target.value)}
          aria-label="Filter by Certification Version"
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold"
        >
          <option value="All">All Versions</option>
          <option value="6th Edition">6th Edition</option>
          <option value="Standard">Standard Scope</option>
        </select>
      </div>

      {/* Questions Data Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-semibold">
          <div>
            Showing <span className="font-bold text-slate-900 dark:text-white">{filtered.length}</span> question(s) in{' '}
            <span className="font-bold text-slate-900 dark:text-white capitalize">{selectedStatusTab}</span> view
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
              className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="250">250</option>
              <option value="500">500</option>
              <option value="1000">1000</option>
              <option value="0">All ({filtered.length})</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-2xl">
              {selectedStatusTab === 'deleted' ? '🛡️' : '📋'}
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {selectedStatusTab === 'deleted' ? 'No Deleted Questions in Archive' : 'No Questions Found'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {selectedStatusTab === 'deleted'
                  ? 'All central database Question Bank items are active.'
                  : 'No questions match the selected filter criteria. Upload questions via CSV Import.'}
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
                      aria-label="Select all questions"
                      className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                    />
                  </th>
                  <th className="p-4">Status / Track</th>
                  <th className="p-4">Code & Stem</th>
                  <th className="p-4">Domain & Topic</th>
                  <th className="p-4">Difficulty</th>
                  <th className="p-4 text-right">Central Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedList.map((q) => {
                  const isSelected = selectedIds.has(q.id);
                  const cert = q.certification || 'RBT';
                  const isDel = q.status === 'deleted' || QuestionLifecycleRepository.isDeleted(q.id);

                  return (
                    <tr
                      key={q.id}
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
                          onChange={() => toggleSelect(q.id)}
                          aria-label={`Select question ${q.code}`}
                          className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                        />
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-wide ${
                              isDel
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200'
                                : cert === 'BACB'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200'
                            }`}
                          >
                            {isDel ? 'DELETED' : cert}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {q.certificationVersion || '6th Edition'}
                          </span>
                        </div>
                        {isDel && q.deletedAt && (
                          <div className="text-[9px] text-rose-500 mt-1 font-mono">
                            Deleted {new Date(q.deletedAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="p-4 max-w-md">
                        <div className="font-mono font-bold text-brand-600 dark:text-brand-400 text-xs">
                          {q.code}
                        </div>
                        <div className="font-medium text-slate-900 dark:text-white line-clamp-2 mt-0.5">
                          {q.content}
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{q.domainName}</div>
                        <div className="text-[10px] text-slate-400">{q.topicName}</div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap space-x-2">
                        {isDel ? (
                          <button
                            onClick={() => handleRestoreSingle(q.id, q.code)}
                            title="Restore Question in Central Database"
                            className="px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold inline-flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Restore</span>
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleConvertToFlashcard(q)}
                              title="Convert to Flashcard"
                              className="p-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                            >
                              <Layers className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSingle(q.id, q.code)}
                              title="Delete from Central Database"
                              className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Navigation Bar */}
        {filtered.length > 0 && pageSize > 0 && totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-900 dark:text-white">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-bold text-slate-900 dark:text-white">
                {Math.min(currentPage * pageSize, filtered.length)}
              </span>{' '}
              of <span className="font-bold text-slate-900 dark:text-white">{filtered.length}</span> questions
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
