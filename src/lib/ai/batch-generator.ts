/**
 * Small-Batch AI Question Generation Pipeline
 * Enforces maximum 5 questions per sub-batch request,
 * 6th Edition schema validation, and fault-isolated batch staging.
 */

import { Question, DifficultyLevel } from '../../types';
import { AIJsonParser } from './json-parser';
import { AppError } from '../errors/app-error';

export interface RawAIQuestionPayload {
  question_text: string;
  scenario_text?: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer_id: string; // 'A' | 'B' | 'C' | 'D'
  answer_explanation: string;
  clinical_explanation?: string;
  exam_tips?: string;
  domain?: string;
  topic?: string;
  difficulty?: string;
  references?: string;
  certification?: string;
  certification_version?: string;
}

export interface BatchGenerationResult {
  totalRequested: number;
  totalGenerated: number;
  batchesExecuted: number;
  questions: Question[];
  errors: Array<{ batchNumber: number; error: string }>;
}

export class AIBatchGenerator {
  public static readonly MAX_QUESTIONS_PER_SUBBATCH = 5;

  /**
   * Validates and transforms a raw LLM JSON question payload into a standard 6th Edition Question.
   * Marks AI-generated items with status 'review_required' until explicitly approved by Admin.
   */
  static validateAndFormatQuestion(raw: RawAIQuestionPayload, index = 0): Question {
    const stem = (raw.question_text || '').trim();
    const optA = (raw.option_a || '').trim();
    const optB = (raw.option_b || '').trim();
    const optC = (raw.option_c || '').trim();
    const optD = (raw.option_d || '').trim();
    const correctLetter = (raw.correct_answer_id || 'A').toUpperCase().trim();

    if (!stem || stem.length < 10) {
      throw new Error(`Question stem is invalid or too short (< 10 chars).`);
    }

    if (!optA || !optB || !optC || !optD) {
      throw new Error(`All four options (A, B, C, D) must be populated with distinct values.`);
    }

    let correctIdx = 0;
    if (correctLetter === 'B' || correctLetter === '1') correctIdx = 1;
    if (correctLetter === 'C' || correctLetter === '2') correctIdx = 2;
    if (correctLetter === 'D' || correctLetter === '3') correctIdx = 3;

    let diff: DifficultyLevel = 'Medium';
    const rawDiff = (raw.difficulty || '').toLowerCase();
    if (rawDiff.includes('easy')) diff = 'Easy';
    if (rawDiff.includes('hard')) diff = 'Hard';

    const domainName = raw.domain || 'A — Data Collection and Graphing';
    const topicName = raw.topic || 'Continuous Measurement (A-01)';
    const scenario = (raw.scenario_text || '').trim();
    const explanation = (raw.answer_explanation || 'Correct based on RBT 6th Edition Task List concepts.').trim();
    const clinical = (raw.clinical_explanation || '').trim();

    const fullContent = scenario ? `[Scenario]: ${scenario}\n\n${stem}` : stem;
    const fullExplanation = clinical ? `${explanation}\n\n[Clinical Context]: ${clinical}` : explanation;
    const code = `AI-6TH-${Date.now().toString().slice(-4)}-${index + 1}`;

    return {
      id: `ai_q_${Date.now()}_${index}`,
      code,
      certification: raw.certification || 'RBT',
      certificationVersion: raw.certification_version || '6th Edition',
      domainId: domainName.split('—')[0]?.trim() || 'A',
      domainName,
      topicId: topicName.split(' ')[0] || 'A-01',
      topicName,
      difficulty: diff,
      content: fullContent,
      options: [optA, optB, optC, optD],
      correctAnswer: correctIdx,
      explanation: fullExplanation,
      hint: raw.exam_tips || 'Focus on observable behavioral terms and 6th Edition definitions.',
      referenceSource:
        raw.references ||
        'Original Practice Question — Aligned to RBT 6th Edition Scope (Independent Educational Prep, Not Official BACB Material)',
      tags: ['AI-Generated', '6th-Edition', domainName.split('—')[0]?.trim() || 'General', diff],
      status: 'review_required', // Strict requirement: AI generated items must be reviewed before active pool publishing
    };
  }

  /**
   * Splits a large request into safe 5-question sub-batches.
   */
  static computeSubBatches(totalCount: number): number[] {
    const batches: number[] = [];
    let remaining = totalCount;
    while (remaining > 0) {
      const take = Math.min(remaining, AIBatchGenerator.MAX_QUESTIONS_PER_SUBBATCH);
      batches.push(take);
      remaining -= take;
    }
    return batches;
  }
}
