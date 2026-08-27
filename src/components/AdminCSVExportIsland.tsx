import React, { useState } from 'react';
import { Download, CheckCircle, FileSpreadsheet, Filter } from 'lucide-react';
import { INITIAL_QUESTIONS } from '@/data/mock-data';

export default function AdminCSVExportIsland() {
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    let subset = [...INITIAL_QUESTIONS];

    if (selectedDomain !== 'All') {
      subset = subset.filter((q) => q.domainName.includes(selectedDomain));
    }
    if (selectedDifficulty !== 'All') {
      subset = subset.filter((q) => q.difficulty === selectedDifficulty);
    }

    const headers = [
      'Question ID',
      'Code',
      'Domain',
      'Topic',
      'Difficulty',
      'Question Text',
      'Option A',
      'Option B',
      'Option C',
      'Option D',
      'Correct Answer',
      'Explanation',
      'Hint',
    ];

    const csvRows = [headers.join(',')];

    for (const q of subset) {
      const escape = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;
      const row = [
        escape(q.id),
        escape(q.code),
        escape(q.domainName),
        escape(q.topicName),
        escape(q.difficulty),
        escape(q.content),
        escape(q.options[0] || ''),
        escape(q.options[1] || ''),
        escape(q.options[2] || ''),
        escape(q.options[3] || ''),
        escape(String.fromCharCode(65 + q.correctAnswer)),
        escape(q.explanation),
        escape(q.hint || ''),
      ];
      csvRows.push(row.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rbt_question_bank_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setIsExporting(false);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Download className="w-6 h-6 text-brand-600" />
          <span>Question Bank CSV Export Engine</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Export verified Question Bank records into standard RFC 4180 CSV with preserved UTF-8 formatting.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Export Filter Options</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Filter by Domain</label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Domains (Full Bank)</option>
              <option value="Measurement">Domain A: Measurement</option>
              <option value="Assessment">Domain B: Assessment</option>
              <option value="Skill Acquisition">Domain C: Skill Acquisition</option>
              <option value="Behavior Reduction">Domain D: Behavior Reduction</option>
              <option value="Ethics">Domain F: Professional Conduct</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Filter by Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating CSV...' : 'Download Question Bank CSV'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
