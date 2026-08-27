import fs from 'fs';
import path from 'path';
import { parseRFC4180CSV, validateAndPreviewCSV, processCSVToQuestions } from '../lib/csv/importer';

export async function testCSVImport(): Promise<boolean> {
  console.log('🧪 Testing Authentic CSV Parser & Ingestion Pipeline...');

  const csvPath = path.resolve(process.cwd(), 'data/csv/rbt_frequency_questions.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('❌ Authentic CSV file not found at:', csvPath);
    return false;
  }

  const csvContent = fs.readFileSync(csvPath, 'utf8');

  // 1. Test Raw RFC 4180 Parse
  const rows = parseRFC4180CSV(csvContent);
  console.log(`   - Parsed ${rows.length} total rows from authentic CSV (1 header + ${rows.length - 1} questions).`);

  if (rows.length < 10) {
    console.error('❌ Insufficient rows parsed from CSV:', rows.length);
    return false;
  }

  // 2. Test Validation & Preview
  const preview = validateAndPreviewCSV(csvContent);
  console.log(`   - Preview detected ${preview.validRows} valid rows, ${preview.invalidRows} invalid rows, ${preview.duplicates} duplicates.`);

  if (preview.validRows === 0) {
    console.error('❌ Validation returned 0 valid rows.');
    return false;
  }

  // 3. Test Full Processing & Conversion to Questions
  const { questions, report } = processCSVToQuestions(csvContent);
  console.log(`   - Ingestion converted ${questions.length} questions.`);

  const sample = questions[0];
  console.log(`   - Sample Question Check: Code=${sample.code}, Diff=${sample.difficulty}, Options=${sample.options.length}, CorrectIdx=${sample.correctAnswer}`);

  if (!sample.content || sample.options.length < 2 || sample.correctAnswer === undefined) {
    console.error('❌ Converted question schema invalid:', sample);
    return false;
  }

  // Verify Zero Data Loss on sample question
  if (!sample.explanation || sample.explanation.length < 10) {
    console.error('❌ Explanation was truncated or lost in conversion.');
    return false;
  }

  console.log('✅ Authentic CSV Ingestion Pipeline Tests Passed.');
  return true;
}
