import React, { useState, useMemo } from 'react';
import { GlossaryTerm } from '@/types';
import { 
  Search, 
  X, 
  BookOpen, 
  HelpCircle, 
  AlertCircle, 
  Lightbulb, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Filter,
  Sparkles,
  Link as LinkIcon,
  Check
} from 'lucide-react';

interface GlossaryIslandProps {
  terms: GlossaryTerm[];
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const DOMAIN_OPTIONS = [
  { label: 'All Domains', value: 'ALL' },
  { label: 'Domain A — Measurement', value: 'Domain A' },
  { label: 'Domain B — Assessment', value: 'Domain B' },
  { label: 'Domain C — Skill Acquisition', value: 'Domain C' },
  { label: 'Domain D — Behavior Reduction', value: 'Domain D' },
  { label: 'Domain E — Documentation', value: 'Domain E' },
  { label: 'Domain F — Ethics', value: 'Domain F' },
];

export default function GlossaryIsland({ terms }: GlossaryIslandProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string>('ALL');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [expandedSlugs, setExpandedSlugs] = useState<Record<string, boolean>>({});
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Compute term counts per letter
  const letterCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const letter of ALPHABET) {
      counts[letter] = 0;
    }
    for (const t of terms) {
      const firstChar = t.letter.toUpperCase();
      if (counts[firstChar] !== undefined) {
        counts[firstChar] += 1;
      }
    }
    return counts;
  }, [terms]);

  // Filtered terms
  const filteredTerms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return terms.filter((item) => {
      // Letter filter
      if (selectedLetter !== 'ALL' && item.letter.toUpperCase() !== selectedLetter) {
        return false;
      }

      // Domain filter
      if (selectedDomain !== 'ALL') {
        if (!item.domain || !item.domain.startsWith(selectedDomain)) {
          return false;
        }
      }

      // Search query filter (matches term name, short definition, inSimpleTerms, and keywords)
      if (query) {
        const matchesTerm = item.term.toLowerCase().includes(query);
        const matchesDef = item.shortDefinition.toLowerCase().includes(query);
        const matchesSimple = item.inSimpleTerms.toLowerCase().includes(query);
        const matchesKeywords = item.keywords?.some((k) => k.toLowerCase().includes(query));
        const matchesMistake = item.commonMistake?.toLowerCase().includes(query);

        if (!matchesTerm && !matchesDef && !matchesSimple && !matchesKeywords && !matchesMistake) {
          return false;
        }
      }

      return true;
    });
  }, [terms, searchQuery, selectedLetter, selectedDomain]);

  const toggleExpand = (slug: string) => {
    setExpandedSlugs((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/glossary#${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedLetter('ALL');
    setSelectedDomain('ALL');
  };

  return (
    <div className="space-y-8">
      {/* Control Bar: Search & Domain Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <label htmlFor="glossary-search" className="sr-only">
              Search RBT and ABA terminology
            </label>
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              id="glossary-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by term, keyword, or concept (e.g., reinforcement, extinction, prompt)..."
              className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Domain Dropdown */}
          <div className="w-full md:w-64 shrink-0">
            <label htmlFor="glossary-domain-filter" className="sr-only">
              Filter by RBT Curriculum Domain
            </label>
            <div className="relative">
              <select
                id="glossary-domain-filter"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full appearance-none px-4 py-3 pr-10 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer transition-all"
              >
                {DOMAIN_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* A–Z Alphabet Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter by First Letter:</span>
          </div>

          <div className="flex flex-wrap gap-1 sm:gap-1.5" role="toolbar" aria-label="A to Z Alphabet Filter">
            <button
              type="button"
              onClick={() => setSelectedLetter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedLetter === 'ALL'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All ({terms.length})
            </button>

            {ALPHABET.map((letter) => {
              const count = letterCounts[letter] || 0;
              const isAvailable = count > 0;
              const isSelected = selectedLetter === letter;

              return (
                <button
                  key={letter}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => setSelectedLetter(letter)}
                  aria-label={`Letter ${letter}, ${count} terms available`}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : isAvailable
                      ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-amber-100 dark:hover:bg-amber-950/60 hover:text-amber-800 dark:hover:text-amber-300'
                      : 'bg-slate-50 dark:bg-slate-900/40 text-slate-300 dark:text-slate-700 cursor-not-allowed border border-transparent'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filter Indicators & Results Count */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div aria-live="polite" className="font-medium">
            Showing <strong className="text-slate-900 dark:text-white">{filteredTerms.length}</strong> of{' '}
            {terms.length} verified terms
            {(selectedLetter !== 'ALL' || selectedDomain !== 'ALL' || searchQuery) && (
              <span className="text-amber-600 dark:text-amber-400 font-semibold ml-1">
                (filtered)
              </span>
            )}
          </div>

          {(selectedLetter !== 'ALL' || selectedDomain !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Reset all filters</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Terms List */}
      {filteredTerms.length > 0 ? (
        <div className="space-y-4" role="feed" aria-label="RBT Terms List">
          {filteredTerms.map((item) => {
            const isExpanded = expandedSlugs[item.slug];
            const isCopied = copiedSlug === item.slug;

            return (
              <article
                key={item.slug}
                id={item.slug}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm hover:border-amber-300 dark:hover:border-amber-700/60 transition-all duration-200 space-y-4"
              >
                {/* Term Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center justify-center text-xs font-black">
                        {item.letter}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {item.term}
                      </h2>
                    </div>

                    {item.domain && (
                      <span className="inline-block text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                        {item.domain}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(item.slug)}
                      title="Copy permalink to term"
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      aria-label={`Copy link for ${item.term}`}
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <LinkIcon className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleExpand(item.slug)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
                      aria-expanded={isExpanded}
                      aria-controls={`details-${item.slug}`}
                    >
                      <span>{isExpanded ? 'Less Details' : 'Full Clinical Details'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Concise Definition */}
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Clinical Definition:
                  </div>
                  <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {item.shortDefinition}
                  </p>
                </div>

                {/* "In Simple Terms" Highlight Box */}
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-1.5">
                  <div className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>In Simple Terms:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {item.inSimpleTerms}
                  </p>
                </div>

                {/* Expandable Details Section */}
                {isExpanded && (
                  <div
                    id={`details-${item.slug}`}
                    className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-fadeIn"
                  >
                    {/* Detailed Explanation */}
                    {item.detailedExplanation && (
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Clinical Context & Application:
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {item.detailedExplanation}
                        </p>
                      </div>
                    )}

                    {/* Original Fictional Scenario */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
                        <span>Clinical Example Scenario:</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                        {item.example}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Why It Matters */}
                      <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-1">
                        <div className="text-xs font-bold text-blue-900 dark:text-blue-300">
                          Why It Matters for RBTs:
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {item.whyItMatters}
                        </p>
                      </div>

                      {/* Common Confusion / Mistake */}
                      <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 space-y-1">
                        <div className="text-xs font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Common Learner Confusion:</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {item.commonMistake}
                        </p>
                      </div>
                    </div>

                    {/* Related Terms Cross-links */}
                    {item.relatedTerms && item.relatedTerms.length > 0 && (
                      <div className="pt-2">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Related Terms in Glossary:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.relatedTerms.map((relSlug) => {
                            const relatedObj = terms.find((t) => t.slug === relSlug);
                            const label = relatedObj ? relatedObj.term : relSlug.replace(/-/g, ' ');
                            return (
                              <button
                                key={relSlug}
                                type="button"
                                onClick={() => {
                                  setSearchQuery(label.split(' ')[0]);
                                  setSelectedLetter('ALL');
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-amber-950 text-slate-700 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
                              >
                                #{label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Action Links */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
                  {item.studyGuideSlug && (
                    <a
                      href={`/study-guides/${item.studyGuideSlug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Explore Pillar Study Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {item.topicSlug && (
                    <a
                      href={`/topics/${item.topicSlug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      <span>Curriculum Topic</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {item.practiceDomain && (
                    <a
                      href={`/practice-questions?domain=${encodeURIComponent(item.practiceDomain)}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline ml-auto"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Practice {item.domain?.split('—')[0]?.trim() || 'Domain'} Questions</span>
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto text-2xl font-bold">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              No matching glossary terms found
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              We couldn't find any terms matching "{searchQuery}". Try searching with a broader keyword (e.g. "reinforce" or "measurement") or reset your filters.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-md transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
