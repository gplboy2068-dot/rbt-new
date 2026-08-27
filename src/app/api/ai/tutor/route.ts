import { NextResponse } from 'next/server';
import { rateLimiter } from '@/lib/rate-limit/rate-limiter';

export async function POST(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

  // Check rate limit for this anonymous IP
  const limitCheck = rateLimiter.checkLimit(ip);
  if (!limitCheck.allowed) {
    return NextResponse.json(
      {
        error: 'RATE_LIMIT_EXCEEDED',
        message: limitCheck.reason || 'Rate limit exceeded. Please try again later.',
        remainingHourly: limitCheck.remainingHourly,
        remainingDaily: limitCheck.remainingDaily,
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { action, query, questionContext, subject } = body;

    // Record the usage against the client IP
    rateLimiter.recordUsage(ip);

    let reply = '';
    let generatedQuestion = null;

    if (action === 'explain_question' && questionContext) {
      reply = `### 🧠 AI Step-by-Step Breakdown\n\n**Topic:** ${questionContext.topic || 'General'}\n**Question:** *${questionContext.question}*\n\n#### 1. Core Principle & Recognition\nTo solve this effectively, identify the governing formula and conditions. For **${questionContext.subject}**, accuracy comes from isolating the given parameters before calculating.\n\n#### 2. Why Option ${String.fromCharCode(65 + (questionContext.correctAnswer ?? 0))} is Correct:\n${questionContext.explanation || 'This option represents the direct consequence of the governing formula without arithmetic distortion.'}\n\n#### 3. Common Pitfalls & Traps\n* Watch out for sign errors or unit mismatch during intermediate steps.\n* Distractors often calculate intermediate values before final simplification.\n\n#### 💡 Quick Pro-Tip / Mnemonic\nAlways double-check boundary constraints when eliminating incorrect choices!`;
    } else if (action === 'generate_question') {
      const targetSubject = subject || 'Mathematics';
      generatedQuestion = {
        id: `ai_gen_${Date.now()}`,
        subject: targetSubject,
        topic: query || 'Adaptive Concept Reinforcement',
        difficulty: 'Medium',
        question: `[AI Generated] What is the primary characteristic of a converged sequence in metric spaces under ${targetSubject} fundamentals?`,
        options: [
          'It is strictly monotonic and unbounded',
          'Every subsequence converges to the same unique limit',
          'Its terms alternate in sign indefinitely',
          'It cannot contain isolated points',
        ],
        correctAnswer: 1,
        explanation: 'In metric spaces, every subsequence of a convergent sequence converges to the exact same unique limit point.',
        hint: 'Think about the uniqueness of limits.',
        tags: ['AI-Generated', targetSubject, 'Adaptive'],
      };
      reply = `I have generated a new practice challenge for you on **${targetSubject}**! Try answering it below.`;
    } else {
      // General Tutor Dialogue
      const cleanQuery = (query || '').toLowerCase();
      if (cleanQuery.includes('srs') || cleanQuery.includes('spaced repetition')) {
        reply = `### 📚 How Spaced Repetition (SRS) Works on RTB\n\nSpaced Repetition schedules flashcard reviews right before your brain is about to forget the concept.\n\n1. **Again (1)**: Resets interval to 1 day if you missed it.\n2. **Hard (3)**: Shorter step forward.\n3. **Good (4)**: Multiplies interval by the ease factor.\n4. **Easy (5)**: Maximum interval leap for mastered knowledge.\n\nBecause RTB is completely **open and login-free**, all your intervals are safely calculated and cached in your browser's IndexedDB engine!`;
      } else if (cleanQuery.includes('calculus') || cleanQuery.includes('derivative') || cleanQuery.includes('integral')) {
        reply = `### 📐 Calculus Mastery Tip\n\nWhen dealing with composite functions $f(g(x))$, always apply the **Chain Rule**:\n$$\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$$\n\nFor integration, check for logarithmic substitutions: whenever the numerator is the derivative of the denominator, $\\int \\frac{u'}{u} dx = \\ln|u| + C$.`;
      } else {
        reply = `### 🎓 AI Tutor Response\n\nYou asked: *"${query}"*\n\nHere is the key breakdown:\n1. **Fundamental Principle**: Focus on first-principles understanding rather than rote memorization.\n2. **Application in Tests**: Exam questions frequently test edge cases or subtle counterexamples.\n3. **Recommended Next Step**: Head to our **Practice Questions** or **Flashcards** section to reinforce this topic actively.\n\n*Feel free to ask for step-by-step math derivations, physics formulas, reasoning logic, or coding explanations!*`;
      }
    }

    const updatedStatus = rateLimiter.checkLimit(ip);

    return NextResponse.json({
      reply,
      generatedQuestion,
      quota: {
        remainingHourly: updatedStatus.remainingHourly,
        remainingDaily: updatedStatus.remainingDaily,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to process AI tutor query' }, { status: 500 });
  }
}
