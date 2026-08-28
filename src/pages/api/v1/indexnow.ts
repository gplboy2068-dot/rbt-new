import type { APIRoute } from 'astro';
import { IndexNowService, INDEXNOW_KEY, INDEXNOW_KEY_LOCATION } from '@/lib/services/indexnow';
import { publicConfig } from '@/lib/config';

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      success: true,
      data: {
        service: 'IndexNow Instant Search Indexing',
        host: new URL(publicConfig.siteUrl).host,
        key: INDEXNOW_KEY,
        keyLocation: INDEXNOW_KEY_LOCATION,
        instructions: 'Send POST to this endpoint with optional { "urls": [...] } to submit immediately to search engines.',
      },
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    }
  );
};

export const POST: APIRoute = async ({ request }) => {
  try {
    let urls: string[] = [];
    try {
      const body = await request.json();
      if (Array.isArray(body?.urls) && body.urls.length > 0) {
        urls = body.urls;
      }
    } catch {}

    const result = urls.length > 0
      ? await IndexNowService.submitUrls(urls)
      : await IndexNowService.submitAllSiteUrls();

    return new Response(
      JSON.stringify({
        success: result.success,
        data: result,
      }),
      {
        status: result.success ? 200 : 202,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: error?.message || 'Failed to submit URLs to IndexNow.',
        },
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
