import React, { useState } from 'react';
import { Upload, CheckCircle, AlertTriangle, FileText, ArrowRight, RefreshCw, Download, AlertCircle, Copy, Trash2 } from 'lucide-react';
import { QuestionLifecycleRepository } from '@/lib/storage/question-lifecycle';
import { processCSVToQuestions, CSVDuplicateInfo } from '@/lib/csv/importer';

export default function AdminCSVImportIsland() {
  const [file, setFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'validating' | 'preview' | 'importing' | 'completed' | 'error'>('idle');
  const [importSummary, setImportSummary] = useState<{
    fileKey: string;
    totalRows: number;
    validRows: number;
    invalidRows: number;
    duplicates: number;
    newQuestions: number;
    existingQuestions: number;
    detectedColumns: string[];
    previewRows: string[][];
    errors: Array<{ rowNumber: number; field: string; problem: string; suggestedCorrection: string }>;
    duplicateRows?: CSVDuplicateInfo[];
  } | null>(null);
  const [conflictMode, setConflictMode] = useState<'UPSERT' | 'SKIP_DUPLICATES'>('UPSERT');
  const [targetTrack, setTargetTrack] = useState<'AUTO' | 'BACB' | 'RBT'>('AUTO');
  const [importedCount, setImportedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setStatus('idle');
      setErrorMessage(null);
    }
  };

  const handleUploadAndValidate = async () => {
    if (!file) return;
    setStatus('uploading');
    setErrorMessage(null);

    try {
      const text = await file.text();
      setCsvContent(text);

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/v1/admin/csv/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setImportSummary(data.data);
        setStatus('preview');
      } else {
        setStatus('error');
        setErrorMessage(data.error?.message || 'Failed to parse CSV file.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Network connection error during CSV upload.');
    }
  };

  const handleConfirmImport = async () => {
    if (!csvContent) return;
    setStatus('importing');

    try {
      const res = await fetch('/api/v1/admin/csv/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csvText: csvContent,
          conflictResolution: conflictMode,
          targetCertification: targetTrack !== 'AUTO' ? targetTrack : undefined,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const count = data.data?.importedCount || 0;
        setImportedCount(count);

        // Also sync local client memory repository
        const parsed = processCSVToQuestions(csvContent, conflictMode);
        if (parsed.questions.length > 0) {
          const mapped = targetTrack !== 'AUTO' 
            ? parsed.questions.map((q) => ({ ...q, certification: targetTrack }))
            : parsed.questions;
          QuestionLifecycleRepository.addOrUpsertQuestions(mapped);
        }

        setStatus('completed');
      } else {
        setStatus('error');
        setErrorMessage(data.error?.message || 'Error committing batch to database.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Connection interrupted during database ingestion.');
    }
  };

  const handlePurgeFirst = async () => {
    if (window.confirm('Delete all existing questions from database before importing?')) {
      try {
        const res = await fetch('/api/v1/questions', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ purgeAll: true }),
        });
        if (res.ok) {
          setNotification('🗑️ Database cleared! Now ready for clean import.');
          setTimeout(() => setNotification(null), 3500);
        }
      } catch {}
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Upload className="w-6 h-6 text-brand-600" />
            <span>Question Bank CSV Ingestion Studio</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Import Question Bank CSV files with multi-format column mapping and automatic database sync.
          </p>
        </div>

        <button
          onClick={handlePurgeFirst}
          title="Clear database before importing"
          className="px-3.5 py-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto hover:bg-rose-100 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Purge Question Bank</span>
        </button>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold animate-fadeIn">
          {notification}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 1: Upload Dropzone */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center mx-auto shadow-sm">
          <FileText className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {file ? file.name : 'Select or Drag & Drop Question Bank CSV'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Supports RFC 4180 format with Question Text/Stem, Options A-D, Answer Explanation, and Domain Taxonomy.
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md transition-all">
            <span>Browse CSV File</span>
            <input type="file" accept=".csv" onChange={handleFileDrop} className="hidden" />
          </label>

          {file && status === 'idle' && (
            <button
              onClick={handleUploadAndValidate}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <span>Validate & Preview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Step 2: Preview & Validation Report */}
      {status === 'preview' && importSummary && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase text-emerald-600">CSV Ready for Ingestion</span>
                {importSummary.duplicates > 0 && (
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[10px] border border-amber-200">
                    ℹ️ {importSummary.duplicates} Existing/Duplicate Row(s)
                  </span>
                )}
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {importSummary.totalRows} Total Rows | {importSummary.validRows} Valid Questions
              </h2>
            </div>

            <button
              onClick={handleConfirmImport}
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all shrink-0"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Commit Ingestion to Database</span>
            </button>
          </div>

          {/* Target Track Selection */}
          <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 space-y-2">
            <div className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
              <span>🎯 Target Certification Track for this CSV:</span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs font-medium">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="targetTrack"
                  value="AUTO"
                  checked={targetTrack === 'AUTO'}
                  onChange={() => setTargetTrack('AUTO')}
                  className="text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <span><strong>Auto-Detect from CSV</strong> (uses track column in file)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="targetTrack"
                  value="BACB"
                  checked={targetTrack === 'BACB'}
                  onChange={() => setTargetTrack('BACB')}
                  className="text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <span><strong className="text-purple-700 dark:text-purple-300">🟣 Set All to BACB Practice Track</strong></span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="targetTrack"
                  value="RBT"
                  checked={targetTrack === 'RBT'}
                  onChange={() => setTargetTrack('RBT')}
                  className="text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <span><strong className="text-emerald-700 dark:text-emerald-300">🟢 Set All to RBT Track</strong></span>
              </label>
            </div>
          </div>

          {/* Import / Duplicate Strategy */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Copy className="w-4 h-4 text-brand-600" />
              <span>Ingestion Action:</span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs font-medium">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="conflictMode"
                  value="UPSERT"
                  checked={conflictMode === 'UPSERT'}
                  onChange={() => setConflictMode('UPSERT')}
                  className="text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <span><strong>Import All / Update (Recommended)</strong> — Ingest all rows into database</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="conflictMode"
                  value="SKIP_DUPLICATES"
                  checked={conflictMode === 'SKIP_DUPLICATES'}
                  onChange={() => setConflictMode('SKIP_DUPLICATES')}
                  className="text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <span><strong>Skip Duplicates</strong> — Ingest only completely new rows</span>
              </label>
            </div>
          </div>

          {/* Formatting Real Errors (if any) */}
          {importSummary.errors.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-rose-600 uppercase tracking-wide flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Formatting Warnings ({importSummary.errors.length}):</span>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1 p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-xs">
                {importSummary.errors.map((e, idx) => (
                  <div key={idx} className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                    <span className="font-bold text-rose-600">Row {e.rowNumber}:</span> {e.problem}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detected Header Columns */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase">Detected Header Columns:</div>
            <div className="flex flex-wrap gap-1.5">
              {importSummary.detectedColumns.map((col, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                  {col}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Success Confirmation */}
      {status === 'completed' && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-8 text-center space-y-4 animate-fadeIn">
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-emerald-950 dark:text-emerald-200">
            CSV Ingestion Completed Successfully!
          </h2>
          <p className="text-xs text-emerald-800 dark:text-emerald-300 max-w-md mx-auto">
            {importedCount > 0
              ? `Successfully ingested ${importedCount} question(s) into the central Question Bank database.`
              : 'All question records and taxonomy associations are committed to Cloudflare D1 with zero data loss.'}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <a
              href="/admin/questions"
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md"
            >
              View Question Bank Studio
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
