/**
 * RTB Question Bank CSV Ingestion & Validation Pipeline
 * RFC 4180 Compliant Parser with Multi-Layer Duplicate Detection and Anti-Resurrection Safeguards.
 */

import { AppError } from '../errors/app-error';
import { Question, DifficultyLevel } from '@/types';
import { QuestionLifecycleRepository } from '@/lib/storage/question-lifecycle';

export interface CSVValidationError {
  rowNumber: number;
  field: string;
  problem: string;
  suggestedCorrection: string;
}

export interface CSVDuplicateInfo {
  rowNumber: number;
  code: string;
  stem: string;
  reason: 'ID_MATCH' | 'EXACT_STEM_MATCH' | 'INTRA_FILE_DUPLICATE';
}

export interface CSVImportPreview {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicates: number;
  newQuestions: number;
  existingQuestions: number;
  detectedColumns: string[];
  errors: CSVValidationError[];
  duplicateRows: CSVDuplicateInfo[];
  sampleQuestions: Partial<Question>[];
}

export type CSVImportMode = 'INSERT_NEW' | 'UPSERT' | 'SKIP_DUPLICATES';

/**
 * Parses raw CSV string according to RFC 4180 standard.
 */
export function parseRFC4180CSV(csvText: string): string[][] {
  const cleanText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!cleanText) return [];

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++; // Skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        if (currentRow.some((f) => f.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Normalizes header string for fuzzy matching.
 */
function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Validates CSV structure, parses taxonomy, and detects duplicates with multi-layer fingerprinting.
 */
export function validateAndPreviewCSV(
  csvText: string,
  existingQuestionCodes: Set<string> = new Set()
): CSVImportPreview {
  const rows = parseRFC4180CSV(csvText);

  if (rows.length < 2) {
    throw new AppError({
      code: 'VALIDATION_ERROR',
      message: 'CSV file must contain a header row and at least one question row.',
      statusCode: 400,
    });
  }

  const rawHeaders = rows[0];
  const normalizedHeaders = rawHeaders.map(normalizeHeader);
  const dataRows = rows.slice(1);

  // Column Index Resolvers
  const getIdx = (candidates: string[]): number => {
    return normalizedHeaders.findIndex((h) => candidates.includes(h));
  };

  const idIdx = getIdx(['id', 'questionid', 'code', 'customid']);
  const questionTextIdx = getIdx(['questiontext', 'question', 'stem', 'content']);
  const scenarioIdx = getIdx(['scenariotext', 'scenario']);
  const optAIdx = getIdx(['optiona', 'a', 'choicea', 'option1']);
  const optBIdx = getIdx(['optionb', 'b', 'choiceb', 'option2']);
  const optCIdx = getIdx(['optionc', 'c', 'choicec', 'option3']);
  const optDIdx = getIdx(['optiond', 'd', 'choiced', 'option4']);
  const correctIdx = getIdx(['correctanswerid', 'correctanswer', 'answer', 'correct', 'correctoption']);
  const explanationIdx = getIdx(['answerexplanation', 'explanation', 'rational', 'rationale']);
  const clinicalIdx = getIdx(['clinicalexplanation', 'clinical', 'clinicalrationale']);
  const domainIdx = getIdx(['category', 'domain', 'subject', 'tasklistdomain']);
  const topicIdx = getIdx(['topic', 'subcategory', 'tasklisttopic']);
  const difficultyIdx = getIdx(['difficulty', 'level']);
  const referenceIdx = getIdx(['references', 'reference', 'source']);

  const errors: CSVValidationError[] = [];
  const duplicateRows: CSVDuplicateInfo[] = [];
  const sampleQuestions: Partial<Question>[] = [];

  // Multi-layer duplicate indices
  const seenExplicitCodesInCSV = new Set<string>();
  const seenExactStemsInCSV = new Set<string>();

  const existingExplicitCodes = new Set<string>();
  if (existingQuestionCodes instanceof Set) {
    existingQuestionCodes.forEach((c) => {
      if (c && !c.startsWith('q-') && !c.startsWith('q_')) {
        existingExplicitCodes.add(c.toLowerCase().trim());
      }
    });
  }

  let duplicates = 0;
  let newQuestions = 0;
  let existingQuestions = 0;
  let validRows = 0;
  let invalidRows = 0;

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rowNum = i + 2; // 1-indexed including header
    let rowValid = true;

    const hasExplicitId = idIdx >= 0 && row[idIdx] && row[idIdx].trim().length > 0;
    const explicitCode = hasExplicitId ? row[idIdx].trim() : '';
    const code = explicitCode || `Q-CSV-${Date.now().toString(36)}-${i + 1}`;

    const questionText = questionTextIdx >= 0 ? row[questionTextIdx].trim() : '';
    const optA = optAIdx >= 0 ? row[optAIdx].trim() : '';
    const optB = optBIdx >= 0 ? row[optBIdx].trim() : '';
    const optC = optCIdx >= 0 ? row[optCIdx].trim() : '';
    const optD = optDIdx >= 0 ? row[optDIdx].trim() : '';
    const correctLetter = (correctIdx >= 0 && row[correctIdx] ? row[correctIdx] : 'A').toUpperCase().trim();

    // Required Field Validations (Real Errors Only)
    if (!questionText || questionText.length < 5) {
      errors.push({
        rowNumber: rowNum,
        field: 'Question Text',
        problem: 'Question stem is empty or too short (< 5 characters).',
        suggestedCorrection: 'Provide a clear question text stem.',
      });
      rowValid = false;
    }

    if (!optA || !optB) {
      errors.push({
        rowNumber: rowNum,
        field: 'Options',
        problem: 'Minimum of Option A and Option B must be populated.',
        suggestedCorrection: 'Ensure Option A and Option B have distinct values.',
      });
      rowValid = false;
    }

    if (!['A', 'B', 'C', 'D', '0', '1', '2', '3', 'OPTION A', 'OPTION B', 'OPTION C', 'OPTION D'].includes(correctLetter)) {
      errors.push({
        rowNumber: rowNum,
        field: 'Correct Answer ID',
        problem: `Invalid answer key "${correctLetter}". Must be A, B, C, or D.`,
        suggestedCorrection: 'Set Correct Answer ID to A, B, C, or D.',
      });
      rowValid = false;
    }

    // ACCURATE DUPLICATE DETECTION
    const normalizedStem = questionText.toLowerCase().replace(/\s+/g, ' ').trim();
    let isDuplicate = false;
    let dupReason: 'ID_MATCH' | 'EXACT_STEM_MATCH' | 'INTRA_FILE_DUPLICATE' = 'INTRA_FILE_DUPLICATE';

    if (hasExplicitId) {
      const normCode = explicitCode.toLowerCase();
      if (seenExplicitCodesInCSV.has(normCode)) {
        isDuplicate = true;
        dupReason = 'INTRA_FILE_DUPLICATE';
      } else if (existingExplicitCodes.has(normCode)) {
        isDuplicate = true;
        dupReason = 'ID_MATCH';
      }
    }

    if (!isDuplicate && normalizedStem.length >= 20) {
      if (seenExactStemsInCSV.has(normalizedStem)) {
        isDuplicate = true;
        dupReason = 'INTRA_FILE_DUPLICATE';
      }
    }

    if (isDuplicate) {
      duplicates++;
      if (dupReason === 'ID_MATCH') {
        existingQuestions++;
      }
      duplicateRows.push({
        rowNumber: rowNum,
        code,
        stem: questionText.slice(0, 60),
        reason: dupReason,
      });
    } else {
      newQuestions++;
      if (hasExplicitId) {
        seenExplicitCodesInCSV.add(explicitCode.toLowerCase());
      }
      if (normalizedStem.length >= 20) {
        seenExactStemsInCSV.add(normalizedStem);
      }
    }

    if (rowValid) {
      validRows++;
      if (sampleQuestions.length < 5) {
        let correctIdxNum = 0;
        if (correctLetter === 'B' || correctLetter === '1' || correctLetter === 'OPTION B') correctIdxNum = 1;
        if (correctLetter === 'C' || correctLetter === '2' || correctLetter === 'OPTION C') correctIdxNum = 2;
        if (correctLetter === 'D' || correctLetter === '3' || correctLetter === 'OPTION D') correctIdxNum = 3;

        let diff: DifficultyLevel = 'Medium';
        const rawDiff = (difficultyIdx >= 0 && row[difficultyIdx] ? row[difficultyIdx] : '').toLowerCase();
        if (rawDiff.includes('easy')) diff = 'Easy';
        if (rawDiff.includes('hard')) diff = 'Hard';

        sampleQuestions.push({
          id: code,
          code,
          content: questionText,
          options: [optA, optB, optC, optD].filter(Boolean),
          correctAnswer: correctIdxNum,
          domainName: domainIdx >= 0 && row[domainIdx] ? row[domainIdx] : 'General',
          topicName: topicIdx >= 0 && row[topicIdx] ? row[topicIdx] : 'RBT Task List',
          difficulty: diff,
          explanation: explanationIdx >= 0 ? row[explanationIdx] : '',
          referenceSource: referenceIdx >= 0 ? row[referenceIdx] : '',
        });
      }
    } else {
      invalidRows++;
    }
  }

  return {
    totalRows: dataRows.length,
    validRows,
    invalidRows,
    duplicates,
    newQuestions,
    existingQuestions,
    detectedColumns: rawHeaders,
    errors,
    duplicateRows,
    sampleQuestions,
  };
}

/**
 * Execute Ingestion of Parsed CSV into In-Memory / D1 Store with chosen ImportMode.
 */
export function processCSVToQuestions(
  csvText: string,
  importMode: CSVImportMode = 'UPSERT'
): {
  questions: Question[];
  importedCount: number;
  skippedCount: number;
  resurrectedBlockedCount: number;
} {
  const rows = parseRFC4180CSV(csvText);
  if (rows.length < 2) {
    return { questions: [], importedCount: 0, skippedCount: 0, resurrectedBlockedCount: 0 };
  }

  const rawHeaders = rows[0];
  const normalizedHeaders = rawHeaders.map(normalizeHeader);
  const dataRows = rows.slice(1);

  const getIdx = (candidates: string[]): number => {
    return normalizedHeaders.findIndex((h) => candidates.includes(h));
  };

  const idIdx = getIdx(['id', 'questionid', 'code', 'customid']);
  const questionTextIdx = getIdx(['questiontext', 'question', 'stem', 'content']);
  const optAIdx = getIdx(['optiona', 'a', 'choicea', 'option1']);
  const optBIdx = getIdx(['optionb', 'b', 'choiceb', 'option2']);
  const optCIdx = getIdx(['optionc', 'c', 'choicec', 'option3']);
  const optDIdx = getIdx(['optiond', 'd', 'choiced', 'option4']);
  const correctIdx = getIdx(['correctanswerid', 'correctanswer', 'answer', 'correct', 'correctoption']);
  const explanationIdx = getIdx(['answerexplanation', 'explanation', 'rational', 'rationale']);
  const domainIdx = getIdx(['category', 'domain', 'subject', 'tasklistdomain']);
  const topicIdx = getIdx(['topic', 'subcategory', 'tasklisttopic']);
  const difficultyIdx = getIdx(['difficulty', 'level']);
  const referenceIdx = getIdx(['references', 'reference', 'source']);

  const questions: Question[] = [];
  const seenStems = new Set<string>();
  let importedCount = 0;
  let skippedCount = 0;
  let resurrectedBlockedCount = 0;

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const questionText = questionTextIdx >= 0 ? row[questionTextIdx]?.trim() : '';
    if (!questionText || questionText.length < 5) continue;

    const stemKey = questionText.toLowerCase().replace(/\s+/g, ' ');
    if (importMode === 'SKIP_DUPLICATES' && seenStems.has(stemKey)) {
      skippedCount++;
      continue;
    }
    seenStems.add(stemKey);

    const hasExplicitId = idIdx >= 0 && row[idIdx] && row[idIdx].trim().length > 0;
    const code = hasExplicitId ? row[idIdx].trim() : `RBT-IMP-${Date.now().toString(36).slice(-4)}-${i + 1}`;
    const id = code;

    // Anti-resurrection safeguard: Prevent soft-deleted questions from silent auto-recovery unless explicitly upserted
    if (importMode !== 'UPSERT' && (QuestionLifecycleRepository.isDeleted(id) || QuestionLifecycleRepository.isDeleted(code))) {
      resurrectedBlockedCount++;
      continue;
    }

    const optA = optAIdx >= 0 ? row[optAIdx]?.trim() : '';
    const optB = optBIdx >= 0 ? row[optBIdx]?.trim() : '';
    const optC = optCIdx >= 0 ? row[optCIdx]?.trim() : '';
    const optD = optDIdx >= 0 ? row[optDIdx]?.trim() : '';
    const correctLetter = (correctIdx >= 0 && row[correctIdx] ? row[correctIdx] : 'A').toUpperCase().trim();

    let correctIdxNum = 0;
    if (correctLetter === 'B' || correctLetter === '1' || correctLetter === 'OPTION B') correctIdxNum = 1;
    if (correctLetter === 'C' || correctLetter === '2' || correctLetter === 'OPTION C') correctIdxNum = 2;
    if (correctLetter === 'D' || correctLetter === '3' || correctLetter === 'OPTION D') correctIdxNum = 3;

    let diff: DifficultyLevel = 'Medium';
    const rawDiff = (difficultyIdx >= 0 && row[difficultyIdx] ? row[difficultyIdx] : '').toLowerCase();
    if (rawDiff.includes('easy')) diff = 'Easy';
    if (rawDiff.includes('hard')) diff = 'Hard';

    const domainName = domainIdx >= 0 && row[domainIdx] ? row[domainIdx].trim() : 'Measurement';
    const topicName = topicIdx >= 0 && row[topicIdx] ? row[topicIdx].trim() : 'Continuous Measurement';

    questions.push({
      id,
      code,
      domainId: `dom_${domainName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      domainName,
      topicId: `top_${topicName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      topicName,
      difficulty: diff,
      content: questionText,
      options: [optA, optB, optC, optD].filter(Boolean),
      correctAnswer: correctIdxNum,
      explanation: explanationIdx >= 0 && row[explanationIdx] ? row[explanationIdx].trim() : 'Applied Behavior Analysis rationale.',
      referenceSource: referenceIdx >= 0 && row[referenceIdx] ? row[referenceIdx].trim() : 'BACB RBT 6th Edition Task List',
      certification: 'RBT',
      certificationVersion: '6th Edition',
      status: 'active',
      tags: [domainName, topicName, 'Imported'],
    });

    importedCount++;
  }

  return {
    questions,
    importedCount,
    skippedCount,
    resurrectedBlockedCount: 0,
  };
}
