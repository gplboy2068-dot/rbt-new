import type { APIRoute } from 'astro';
import { apiSuccess } from '@/lib/api/response';
import { publicConfig } from '@/lib/config';

export const GET: APIRoute = async ({ locals }) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: publicConfig.apiVersion,
    environment: publicConfig.appEnv,
    services: {
      application: 'UP',
      d1_database: 'ATTACHED',
      r2_storage: 'ATTACHED',
      kv_cache: 'ATTACHED',
      queues: 'ATTACHED',
    },
  };

  return apiSuccess(healthData, { requestId: locals.requestId });
};
