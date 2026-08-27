import { D1Client } from '../lib/db/client';

export async function testDbClient(): Promise<boolean> {
  console.log('🧪 Testing D1 Database Client Abstraction...');

  const mockD1Binding = {
    prepare: (sql: string) => {
      const stmt = {
        bind: (...args: any[]) => stmt,
        all: async () => ({ results: [{ id: '1', ping: 1 }], success: true }),
        first: async () => ({ id: '1', ping: 1 }),
        run: async () => ({ success: true }),
      };
      return stmt;
    },
    batch: async (statements: any[]) => [{ results: [], success: true }],
  };

  const client = new D1Client(mockD1Binding);
  const health = await client.healthCheck();

  if (!health.healthy) {
    console.error('❌ D1 Client Health check failed.');
    return false;
  }

  const result = await client.query('SELECT 1 as ping');
  if (!result.success || result.results.length === 0) {
    console.error('❌ D1 Client query execution failed.');
    return false;
  }

  console.log('✅ D1 Database Client Tests Passed.');
  return true;
}
