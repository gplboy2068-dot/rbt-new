import type { APIRoute } from 'astro';

export const POST: APIRoute = async () => {
  return new Response(
    JSON.stringify({ success: true, meta: { timestamp: Math.floor(Date.now() / 1000) } }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
