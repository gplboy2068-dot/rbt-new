'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  FileCheck2,
  Layers,
  Bot,
  GraduationCap,
  BarChart3,
  Moon,
  Sun,
  HardDrive,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { progressRepo } from '@/lib/storage/progress-repo';

export default function Navbar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);

  useEffect(() => {
    // Check initial dark mode from system/localStorage
    const isDarkMode =
      localStorage.getItem('rtb_theme') === 'dark' ||
      (!localStorage.getItem('rtb_theme') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Refresh attempts count for badge
    const loadCount = async () => {
      try {
        const stats = await progressRepo.getStats();
        setTotalAttempts(stats.totalAnswered);
      } catch {
        // ignore
      }
    };
    loadCount();
  }, [pathname]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('rtb_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('rtb_theme', 'light');
    }
  };

  const navLinks = [
    { name: 'Practice', href: '/practice', icon: BookOpen },
    { name: 'Mock Exams', href: '/mock-exam', icon: FileCheck2 },
    { name: 'Flashcards (SRS)', href: '/flashcards', icon: Layers },
    { name: 'AI Tutor', href: '/ai-tutor', icon: Bot, highlight: true },
    { name: 'Study Guides', href: '/study-guides', icon: GraduationCap },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  RTB <span className="text-brand-600 dark:text-brand-400 text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800">FREE & OPEN</span>
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5 font-medium">
                  Ready To Boost • Zero Login
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                  {link.highlight && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Action Area (Local Storage Status + Theme Toggle - Zero Auth) */}
          <div className="hidden sm:flex items-center space-x-3">
            <Link
              href="/analytics"
              title="Browser-side local progress is automatically saved via IndexedDB"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <HardDrive className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">Local DB:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{totalAttempts} solved</span>
            </Link>

            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <span>{link.name}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-brand-500" /> Storage: IndexedDB
            </span>
            <span className="text-brand-600 font-semibold">{totalAttempts} Questions Done</span>
          </div>
        </div>
      )}
    </nav>
  );
}
