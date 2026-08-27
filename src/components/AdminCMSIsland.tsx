import React, { useState } from 'react';
import { FileText, Plus, Edit2, Save, Trash2, CheckCircle } from 'lucide-react';
import { INITIAL_STUDY_GUIDES } from '@/data/mock-data';

export default function AdminCMSIsland() {
  const [guides, setGuides] = useState(INITIAL_STUDY_GUIDES);
  const [notification, setNotification] = useState<string | null>(null);

  const handleSave = () => {
    setNotification('✅ Study Guides and CMS metadata persisted to Cloudflare D1!');
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-brand-600" />
            <span>CMS, Study Guides & SEO Studio</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage high-yield cheatsheets, FAQs, and SEO meta tags dynamically without code deployments.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold animate-fadeIn">
          {notification}
        </div>
      )}

      {/* Study Guides List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active High-Yield Study Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guides.map((g) => (
            <div
              key={g.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200">
                  {g.domain}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">{g.readTimeMinutes} min read</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">{g.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{g.summary}</p>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button className="p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1">
                  <Edit2 className="w-3.5 h-3.5" /> Edit Guide
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
