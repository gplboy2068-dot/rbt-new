import { R2StorageService } from '../lib/services/storage';

export async function testStorage(): Promise<boolean> {
  console.log('🧪 Testing Cloudflare R2 Storage Service Abstraction...');

  const mockR2Bucket = {
    list: async () => ({ objects: [] }),
    put: async (key: string, data: any) => ({
      key,
      size: 1024,
      etag: 'etag_123',
      uploaded: new Date(),
    }),
    get: async (key: string) => ({
      key,
      size: 1024,
      etag: 'etag_123',
      uploaded: new Date(),
      body: 'stream',
    }),
    delete: async (key: string) => {},
  };

  const service = new R2StorageService(mockR2Bucket);
  const health = await service.healthCheck();

  if (!health.healthy) {
    console.error('❌ R2 Storage Health check failed.');
    return false;
  }

  const putRes = await service.putObject('test.csv', 'data');
  if (putRes.key !== 'test.csv') {
    console.error('❌ R2 Storage putObject failed.');
    return false;
  }

  console.log('✅ R2 Storage Service Tests Passed.');
  return true;
}
