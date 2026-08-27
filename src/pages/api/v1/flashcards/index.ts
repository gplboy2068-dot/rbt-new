import type { APIRoute } from 'astro';
import { ServerFlashcardStore } from '@/lib/storage/server-flashcard-store';
import { FlashcardLifecycleRepository } from '@/lib/storage/flashcard-lifecycle';

export const GET: APIRoute = async ({ url, locals }) => {
  const domain = url.searchParams.get('domain') || undefined;
  const certification = url.searchParams.get('certification') || undefined;
  const search = url.searchParams.get('search') || undefined;
  const status = url.searchParams.get('status') || 'active';

  let cards = [];
  if (status === 'deleted') {
    cards = await ServerFlashcardStore.getDeletedFlashcards(locals);
  } else if (status === 'all') {
    cards = await ServerFlashcardStore.getAllFlashcards(locals);
  } else {
    cards = await ServerFlashcardStore.getActiveFlashcards({ domain, certification, search }, locals);
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        total: cards.length,
        items: cards,
      },
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { cardId, cardIds, reason, deletedBy } = body;

    if (cardIds && Array.isArray(cardIds)) {
      const count = await ServerFlashcardStore.softDeleteFlashcardsBatch(
        cardIds,
        reason || 'Admin Bulk Delete',
        deletedBy || 'Admin',
        locals
      );
      for (const cid of cardIds) {
        FlashcardLifecycleRepository.softDeleteFlashcard(cid, reason || 'Admin Bulk Delete', deletedBy || 'Admin');
      }
      return new Response(
        JSON.stringify({
          success: true,
          data: { deletedCount: count },
          message: `Successfully soft-deleted ${count} flashcard(s).`,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
      );
    }

    if (cardId) {
      const ok = await ServerFlashcardStore.softDeleteFlashcard(
        cardId,
        reason || 'Admin Single Delete',
        deletedBy || 'Admin',
        locals
      );
      FlashcardLifecycleRepository.softDeleteFlashcard(cardId, reason, deletedBy);

      if (!ok) {
        return new Response(
          JSON.stringify({ success: false, error: { code: 'NOT_FOUND', message: 'Flashcard not found' } }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({
          success: true,
          data: { cardId, status: 'deleted' },
          message: `Flashcard ${cardId} soft-deleted.`,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: { code: 'BAD_REQUEST', message: 'cardId or cardIds required' } }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: { code: 'SERVER_ERROR', message: err.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { action, cardId, cardIds } = body;

    if (action === 'restore') {
      if (cardIds && Array.isArray(cardIds)) {
        await ServerFlashcardStore.restoreFlashcardsBatch(cardIds, locals);
        for (const cid of cardIds) {
          FlashcardLifecycleRepository.restoreDeletedFlashcard(cid);
        }
        return new Response(
          JSON.stringify({ success: true, message: `Restored ${cardIds.length} flashcard(s).` }),
          { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
        );
      }

      if (cardId) {
        const ok = await ServerFlashcardStore.restoreFlashcard(cardId, locals);
        FlashcardLifecycleRepository.restoreDeletedFlashcard(cardId);

        if (!ok) {
          return new Response(
            JSON.stringify({ success: false, error: { code: 'NOT_FOUND', message: 'Flashcard not found' } }),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return new Response(
          JSON.stringify({ success: true, message: `Flashcard ${cardId} restored to active.` }),
          { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid action' } }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: { code: 'SERVER_ERROR', message: err.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
