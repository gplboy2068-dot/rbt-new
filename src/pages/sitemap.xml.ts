import type { APIRoute } from 'astro';
import { CMSService } from '@/lib/services/cms';
import { publicConfig } from '@/lib/config';

export const GET: APIRoute = async () => {
  const xml = CMSService.generateSitemapXml(publicConfig.siteUrl);

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
