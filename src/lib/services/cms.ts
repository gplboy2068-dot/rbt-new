/**
 * Dynamic Content Management System (CMS) & SEO Service
 * Manages Study Guides, Clinical Articles, FAQs, Navigation, Branding,
 * In-App Broadcast Notifications, and Dynamic Sitemap Generation.
 */

import { StudyGuide, GlossaryTerm } from '../../types';
import { INITIAL_STUDY_GUIDES, INITIAL_DOMAINS, INITIAL_TOPICS } from '../../data/mock-data';
import { GLOSSARY_TERMS } from '../../data/glossary-data';
import { AppError } from '../errors/app-error';

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  domain: string;
  readTimeMinutes: number;
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt: string;
  updatedAt: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  orderIndex: number;
  status: 'published' | 'draft' | 'archived';
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'announcement' | 'update' | 'maintenance' | 'feature';
  priority: 'low' | 'medium' | 'high';
  isActive: boolean;
  actionUrl?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface SiteBrandingConfig {
  siteName: string;
  brandTagline: string;
  supportEmail: string;
  copyrightText: string;
  headerAnnouncement?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  orderIndex: number;
  isExternal: boolean;
  isVisible: boolean;
}

// In-Memory CMS Stores (Backed by Cloudflare D1 in production)
const articlesStore = new Map<string, Article>();
const studyGuidesStore = new Map<string, StudyGuide>();
const faqStore = new Map<string, FAQItem>();
const notificationsStore = new Map<string, InAppNotification>();

let brandingConfig: SiteBrandingConfig = {
  siteName: 'RBT Practice Exam',
  brandTagline: '100% Free BACB RBT Practice Exams, Mock Exams & AI Prep',
  supportEmail: 'support@rbtpracticeexam.xyz',
  copyrightText: '© 2026 RBT Practice Exam (rbtpracticeexam.xyz). Not affiliated with the Behavior Analyst Certification Board (BACB).',
  headerAnnouncement: '100% Free & Open Access — No Login Wall',
};

// Seed Study Guides from authentic mock-data
for (const g of INITIAL_STUDY_GUIDES) {
  studyGuidesStore.set(g.id, g);
}

import { ARTICLES_DATA } from '../../data/articles-data';

// Seed initial authentic Clinical Articles
for (const art of ARTICLES_DATA) {
  articlesStore.set(art.id, art);
}

// Seed initial authentic FAQs
const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq_001',
    question: 'Is this RBT Exam Prep platform completely free to use?',
    answer: 'Yes! The platform is 100% free with zero student login, zero signup walls, and zero mandatory account creation. All practice questions, mock exams, flashcards, and AI tutor features are open access.',
    category: 'Platform & Access',
    orderIndex: 1,
    status: 'published',
  },
  {
    id: 'faq_002',
    question: 'How does local progress saving work without an account?',
    answer: 'Your question attempts, practice test scores, flashcard spaced repetition intervals, and bookmarks are saved locally in your browser’s IndexedDB (RTB_StudyDB). You can download a 1-Click JSON backup anytime from the Analytics tab to transfer your progress.',
    category: 'Platform & Access',
    orderIndex: 2,
    status: 'published',
  },
  {
    id: 'faq_003',
    question: 'Which examination blueprint are these questions aligned with?',
    answer: 'All questions, flashcards, and diagnostic drills are strictly aligned with the current BACB Registered Behavior Technician® (RBT®) Test Content Outline (3rd ed.) across Domains A through F.',
    category: 'Curriculum & Exam',
    orderIndex: 3,
    status: 'published',
  },
];

for (const f of INITIAL_FAQS) {
  faqStore.set(f.id, f);
}

// Seed broadcast notifications
notificationsStore.set('notif_001', {
  id: 'notif_001',
  title: 'Open Access Launch',
  message: 'Welcome to the new Independent RBT Exam Prep Platform. Zero login friction.',
  type: 'announcement',
  priority: 'medium',
  isActive: true,
  createdAt: new Date().toISOString(),
});

export class CMSService {
  // Articles CRUD
  static getPublishedArticles(): Article[] {
    return Array.from(articlesStore.values()).filter((a) => a.status === 'published');
  }

  static getArticleBySlug(slug: string): Article | null {
    for (const a of articlesStore.values()) {
      if (a.slug === slug && a.status === 'published') return a;
    }
    return null;
  }

  static saveArticle(article: Omit<Article, 'id' | 'publishedAt' | 'updatedAt'> & { id?: string }): Article {
    const id = article.id || `art_${Date.now()}`;
    const fullArticle: Article = {
      ...article,
      id,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    articlesStore.set(id, fullArticle);
    return fullArticle;
  }

  // Study Guides
  static getPublishedStudyGuides(): StudyGuide[] {
    return Array.from(studyGuidesStore.values());
  }

  static getStudyGuideBySlug(slug: string): StudyGuide | null {
    for (const g of studyGuidesStore.values()) {
      if (g.slug === slug) return g;
    }
    return null;
  }

  // Glossary
  static getGlossaryTerms(): GlossaryTerm[] {
    return GLOSSARY_TERMS;
  }

  static getGlossaryTermBySlug(slug: string): GlossaryTerm | null {
    return GLOSSARY_TERMS.find((t) => t.slug === slug) || null;
  }

  // FAQs
  static getPublishedFAQs(): FAQItem[] {
    return Array.from(faqStore.values())
      .filter((f) => f.status === 'published')
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  // Active Broadcast Notifications
  static getActiveNotifications(): InAppNotification[] {
    return Array.from(notificationsStore.values()).filter((n) => n.isActive);
  }

  static saveNotification(notif: Omit<InAppNotification, 'id' | 'createdAt'> & { id?: string }): InAppNotification {
    const id = notif.id || `notif_${Date.now()}`;
    const fullNotif: InAppNotification = {
      ...notif,
      id,
      createdAt: new Date().toISOString(),
    };
    notificationsStore.set(id, fullNotif);
    return fullNotif;
  }

  // Branding
  static getBranding(): SiteBrandingConfig {
    return { ...brandingConfig };
  }

  static updateBranding(config: Partial<SiteBrandingConfig>): SiteBrandingConfig {
    brandingConfig = { ...brandingConfig, ...config };
    return brandingConfig;
  }

  /**
   * Generates dynamic Sitemap XML from published public entities.
   */
  static generateSitemapXml(baseUrl = 'http://localhost:4321'): string {
    const publishedArticles = this.getPublishedArticles();
    const publishedGuides = this.getPublishedStudyGuides();

    const staticRoutes = [
      '',
      '/study',
      '/practice-questions',
      '/practice-tests',
      '/mock-exams',
      '/flashcards',
      '/ai-tutor',
      '/topics',
      '/study-guides',
      '/glossary',
      '/articles',
      '/analytics',
      '/faq',
      '/about',
      '/contact',
      '/editorial-policy',
      '/methodology',
      '/privacy-policy',
      '/privacy',
      '/terms-and-conditions',
      '/terms',
      '/disclaimer',
    ];

    let urls = staticRoutes.map(
      (r) => `  <url>
    <loc>${baseUrl}${r}</loc>
    <changefreq>daily</changefreq>
    <priority>${r === '' ? '1.0' : '0.8'}</priority>
  </url>`
    );

    // Add published study guides
    for (const g of publishedGuides) {
      urls.push(`  <url>
    <loc>${baseUrl}/study-guides/${g.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
    }

    // Add published curriculum topic guides (RBT TCO 3rd ed.)
    const publishedTopics = [
      'continuous-measurement',
      'discontinuous-measurement',
      'permanent-product',
      'graphing-data',
      'preference-assessments',
      'abc-narrative-data',
      'skill-acquisition-plans',
      'prompting-hierarchies',
      'shaping-chaining',
      'behavior-reduction-plans',
      'differential-reinforcement',
      'extinction-procedures',
      'objective-session-notes',
      'incident-reporting',
      'professional-boundaries-gifts',
      'client-dignity-communication',
    ];

    for (const t of publishedTopics) {
      urls.push(`  <url>
    <loc>${baseUrl}/topics/${t}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
    }

    // Add published articles
    for (const a of publishedArticles) {
      urls.push(`  <url>
    <loc>${baseUrl}/articles/${a.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
  }
}
