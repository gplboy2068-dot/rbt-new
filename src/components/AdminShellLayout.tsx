import React, { ReactNode } from 'react';
import {
  LayoutDashboard,
  HelpCircle,
  Upload,
  Download,
  Layers,
  Bot,
  Sliders,
  FileText,
  LogOut,
  Shield,
} from 'lucide-react';

interface AdminShellProps {
  currentTab: 'dashboard' | 'questions' | 'csv-import' | 'csv-export' | 'flashcards' | 'ai-settings' | 'cms';
  children: ReactNode;
}

export default function AdminShellLayout({ currentTab, children }: AdminShellProps) {
  const handleLogout = () => {
    document.cookie = 'rtb_admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/admin/login';
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard & Health', icon: LayoutDashboard, href: '/admin/dashboard' },
    { id: 'questions', label: 'Question Bank Studio', icon: HelpCircle, href: '/admin/questions' },
    { id: 'csv-import', label: 'CSV Ingestion Studio', icon: Upload, href: '/admin/csv-import' },
    { id: 'csv-export', label: 'CSV Export Engine', icon: Download, href: '/admin/csv-export' },
    { id: 'flashcards', label: 'Flashcards & Conversion', icon: Layers, href: '/admin/flashcards' },
    { id: 'ai-settings', label: 'AI Providers & Limits', icon: Bot, href: '/admin/ai-settings' },
    { id: 'cms', label: 'CMS, Cheatsheets & SEO', icon: FileText, href: '/admin/cms' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0">
        <div className="p-5 space-y-6">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-900 dark:text-white">Admin Control</div>
              <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Superadmin Active</div>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-bold">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <a
            href="/"
            className="block text-center text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            ← View Public Student Site
          </a>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
