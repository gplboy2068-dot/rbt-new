import { publicConfig, getServerConfig, validateConfig } from '../lib/config';

export function testConfig(): boolean {
  console.log('🧪 Testing Configuration System...');

  const validation = validateConfig();
  if (!validation.valid) {
    console.error('❌ Config validation failed:', validation.issues);
    return false;
  }

  const serverConfig = getServerConfig({ ADMIN_JWT_SECRET: 'test-secret' });
  if (serverConfig.jwtSecret !== 'test-secret') {
    console.error('❌ Server config failed to read JWT secret.');
    return false;
  }

  console.log('✅ Configuration System Tests Passed.');
  return true;
}
