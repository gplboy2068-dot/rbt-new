/**
 * IndexNow Protocol Service
 * Automatically submits new, updated, and all site URLs to search engines
 * (Bing, Yandex, Seznam, Naver, etc.) for instantaneous crawl & indexing.
 */

import { publicConfig } from '../config';
import { CMSService } from './cms';

export const INDEXNOW_KEY = 'd26bdf68026541dda2e45c1b5986da13';
export const INDEXNOW_KEY_LOCATION = `${publicConfig.siteUrl}/${INDEXNOW_KEY}.txt`;

export interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

export interface IndexNowResponse {
  success: boolean;
  statusCode: number;
  submittedCount: number;
  message: string;
  endpoints: Array<{ endpoint: string; status: number }>;
}

export class IndexNowService {
  /**
   * Submit a list of URLs to the IndexNow protocol endpoints.
   */
  static async submitUrls(urls: string[]): Promise<IndexNowResponse> {
    if (!urls || urls.length === 0) {
      return {
        success: false,
        statusCode: 400,
        submittedCount: 0,
        message: 'No URLs provided for submission.',
        endpoints: [],
      };
    }

    const host = new URL(publicConfig.siteUrl).host;
    const cleanUrls = Array.from(new Set(urls.map((u) => (u.startsWith('http') ? u : `${publicConfig.siteUrl}${u}`))));

    const payload: IndexNowPayload = {
      host,
      key: INDEXNOW_KEY,
      keyLocation: `${publicConfig.siteUrl}/${INDEXNOW_KEY}.txt`,
      urlList: cleanUrls,
    };

    const endpoints = [
      'https://api.indexnow.org/IndexNow',
      'https://www.bing.com/indexnow',
    ];

    const results: Array<{ endpoint: string; status: number }> = [];

    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify(payload),
        });
        results.push({ endpoint: ep, status: res.status });
      } catch (err: any) {
        results.push({ endpoint: ep, status: 500 });
      }
    }

    const hasSuccess = results.some((r) => r.status === 200 || r.status === 202);

    return {
      success: hasSuccess,
      statusCode: hasSuccess ? 200 : (results[0]?.status || 500),
      submittedCount: cleanUrls.length,
      message: hasSuccess
        ? `Successfully submitted ${cleanUrls.length} URLs to IndexNow engines.`
        : `IndexNow submission completed with status: ${results.map((r) => `${r.endpoint}: ${r.status}`).join(', ')}`,
      endpoints: results,
    };
  }

  /**
   * Submit all comprehensive public platform URLs to IndexNow.
   */
  static async submitAllSiteUrls(): Promise<IndexNowResponse> {
    const siteUrl = publicConfig.siteUrl;

    const baseRoutes = [
      '/',
      '/study',
      '/practice-questions',
      '/practice-tests',
      '/mock-exams',
      '/flashcards',
      '/ai-tutor',
      '/study-guides',
      '/topics',
      '/articles',
      '/analytics',
      '/about',
      '/contact',
      '/faq',
    ];

    // Dynamic routes from CMS
    const articles = CMSService.getPublishedArticles();
    const articleRoutes = articles.map((a) => `/articles/${a.slug}`);

    const studyGuides = CMSService.getAllStudyGuides();
    const guideRoutes = studyGuides.map((g) => `/study-guides/${g.slug}`);

    const allPaths = Array.from(new Set([...baseRoutes, ...articleRoutes, ...guideRoutes]));
    const fullUrls = allPaths.map((p) => `${siteUrl}${p}`);

    return this.submitUrls(fullUrls);
  }
}
