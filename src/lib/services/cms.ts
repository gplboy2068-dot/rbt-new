/**
 * Dynamic Content Management System (CMS) & SEO Service
 * Manages Study Guides, Clinical Articles, FAQs, Navigation, Branding,
 * In-App Broadcast Notifications, and Dynamic Sitemap Generation.
 */

import { StudyGuide } from '../../types';
import { INITIAL_STUDY_GUIDES, INITIAL_DOMAINS, INITIAL_TOPICS } from '../../data/mock-data';
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

// Seed initial authentic Clinical Articles
const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art_001',
    slug: 'continuous-vs-discontinuous-measurement-rbt-guide',
    title: 'Continuous vs. Discontinuous Measurement: The Complete RBT Exam Guide',
    excerpt: 'Master the critical differences between Frequency, Duration, Latency, IRT, Whole Interval, Partial Interval, and Momentary Time Sampling.',
    content: `## Understanding Behavioral Measurement in ABA\n\nMeasurement is the cornerstone of Applied Behavior Analysis (ABA). As a Registered Behavior Technician (RBT), you are responsible for collecting accurate, objective data across continuous and discontinuous recording procedures.\n\n### 1. Continuous Measurement\nContinuous measurement records every single instance of a behavior during the observation period:\n* **Frequency (Count)**: Total count of discrete behaviors with a clear beginning and end.\n* **Rate**: Frequency divided by total observation time (e.g. 6 occurrences per hour).\n* **Duration**: Total time elapsed from when the behavior starts to when it stops.\n* **Latency**: Time elapsed between the presentation of the SD and response initiation.\n* **Inter-Response Time (IRT)**: Elapsed time between the end of one response and the beginning of the next.\n\n### 2. Discontinuous Measurement\nDiscontinuous measurement samples intervals of time:\n* **Partial Interval**: Overestimates behavior duration.\n* **Whole Interval**: Underestimates behavior occurrence.\n* **Momentary Time Sampling**: Easiest for therapists managing multiple clients simultaneously.`,
    author: 'RBT Clinical Curriculum Team',
    domain: 'A: Measurement',
    readTimeMinutes: 6,
    seoTitle: 'Continuous vs Discontinuous Measurement RBT Guide',
    seoDescription: 'Master continuous and discontinuous measurement for the BACB RBT 2nd Edition exam with clinical examples.',
    status: 'published',
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'art_002',
    slug: 'the-4-functions-of-behavior-seat-explained',
    title: 'The 4 Functions of Behavior (SEAT) Explained for RBTs',
    excerpt: 'How to identify Sensory, Escape, Attention, and Tangible functions in clinical practice.',
    content: `## Why Does Behavior Occur?\n\nAll human behavior serves a function. In behavior analysis, every operant behavior is maintained by one or more of the four environmental functions (acronym: **SEAT**):\n\n1. **S - Sensory / Automatic Reinforcement**: The behavior produces internal physical stimulation.\n2. **E - Escape / Avoidance**: The behavior terminates or avoids an aversive demand or stimulus.\n3. **A - Attention**: The behavior results in social reaction from others (positive or negative).\n4. **T - Tangible**: The behavior produces access to preferred items, activities, or food.`,
    author: 'RBT Clinical Curriculum Team',
    domain: 'D: Behavior Reduction',
    readTimeMinutes: 5,
    seoTitle: 'The 4 Functions of Behavior (SEAT) RBT Study Guide',
    seoDescription: 'Learn the SEAT acronym and how to identify behavioral functions on the RBT examination.',
    status: 'published',
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

for (const art of INITIAL_ARTICLES) {
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
    question: 'Which BACB Task List Edition are these questions aligned with?',
    answer: 'All questions, flashcards, and diagnostic drills are strictly mapped to the BACB Registered Behavior Technician (RBT) Task List (2nd Edition) across Domains A through F.',
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
      '/articles',
      '/analytics',
      '/faq',
      '/about',
      '/contact',
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
