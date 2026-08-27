import { NextResponse } from 'next/server';
import { INITIAL_QUESTIONS } from '@/data/mock-data';
import { SubjectCategory, Difficulty } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subject = searchParams.get('subject') as SubjectCategory | null;
  const difficulty = searchParams.get('difficulty') as Difficulty | null;
  const topic = searchParams.get('topic');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  let filtered = [...INITIAL_QUESTIONS];

  if (subject && subject !== ('All' as any)) {
    filtered = filtered.filter((q) => q.subject === subject);
  }

  if (difficulty && difficulty !== ('All' as any)) {
    filtered = filtered.filter((q) => q.difficulty === difficulty);
  }

  if (topic) {
    filtered = filtered.filter((q) => q.topic.toLowerCase().includes(topic.toLowerCase()));
  }

  return NextResponse.json({
    total: filtered.length,
    questions: filtered.slice(0, limit),
  });
}
