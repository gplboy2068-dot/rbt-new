import { AIJsonParser } from '../lib/ai/json-parser';
import { AIBatchGenerator, RawAIQuestionPayload } from '../lib/ai/batch-generator';
import { rateLimiter } from '../lib/rate-limit/rate-limiter';
import { PROVIDERS_MAP } from '../lib/ai/providers';

export async function testAIEngine(): Promise<boolean> {
  console.log('🧪 Testing AI Engine & Multi-Provider Architecture (Phase 4)...');

  // ==========================================
  // TEST 1: Robust JSON Extraction from Markdown Code Fences
  // ==========================================
  console.log('   - Test 1: Testing JSON extraction from noisy markdown output...');
  const noisyOutput = `Here is the requested question:
\`\`\`json
[
  {
    "question_text": "What is the primary characteristic of an extinction burst?",
    "option_a": "A temporary decrease in behavior",
    "option_b": "A temporary spike in frequency, duration, or intensity",
    "option_c": "The permanent elimination of behavior",
    "option_d": "The immediate emergence of spontaneous recovery",
    "correct_answer_id": "B",
    "answer_explanation": "An extinction burst is a predictable temporary increase in target behavior.",
    "domain": "D: Behavior Reduction"
  }
]
\`\`\`
Hope this helps!`;

  const parsed = AIJsonParser.extractAndParse<any[]>(noisyOutput);
  if (!Array.isArray(parsed) || parsed.length !== 1 || parsed[0].correct_answer_id !== 'B') {
    console.error('❌ JSON Extraction from markdown failed:', parsed);
    return false;
  }
  console.log('   - Successfully extracted JSON array from noisy markdown wrapper.');

  // ==========================================
  // TEST 2: Malformed JSON Repair (Trailing Commas)
  // ==========================================
  console.log('   - Test 2: Testing Malformed JSON Repair (trailing commas, quotes)...');
  const malformedJson = `{"name": "MSWO", "steps": 4, }`;
  const repaired = AIJsonParser.extractAndParse<any>(malformedJson);
  if (repaired.name !== 'MSWO' || repaired.steps !== 4) {
    console.error('❌ Malformed JSON repair failed:', repaired);
    return false;
  }
  console.log('   - Repaired trailing comma in malformed JSON string.');

  // ==========================================
  // TEST 3: Small Batch Sub-Batch Splitting (Max 5 / batch)
  // ==========================================
  console.log('   - Test 3: Testing Small Batch Chunking (17 questions -> [5, 5, 5, 2])...');
  const subBatches = AIBatchGenerator.computeSubBatches(17);
  console.log(`   - Chunked 17 questions into sub-batches: [${subBatches.join(', ')}]`);

  if (subBatches.length !== 4 || subBatches.some((count) => count > 5)) {
    console.error('❌ Sub-batch computation exceeded max batch size of 5:', subBatches);
    return false;
  }

  // ==========================================
  // TEST 4: Schema Validation & Question Formatting
  // ==========================================
  console.log('   - Test 4: Testing AI Question Schema Validation & Formatting...');
  const rawPayload: RawAIQuestionPayload = {
    question_text: 'Which measurement method requires recording whether a behavior occurs for the entire interval?',
    option_a: 'Partial interval recording',
    option_b: 'Whole interval recording',
    option_c: 'Momentary time sampling',
    option_d: 'Permanent product recording',
    correct_answer_id: 'B',
    answer_explanation: 'Whole interval recording requires behavior to occur throughout the entire interval.',
    domain: 'A: Measurement',
    difficulty: 'Easy',
  };

  const formatted = AIBatchGenerator.validateAndFormatQuestion(rawPayload, 0);
  if (formatted.correctAnswer !== 1 || formatted.options.length !== 4 || formatted.difficulty !== 'Easy') {
    console.error('❌ Question formatting / validation mismatch:', formatted);
    return false;
  }
  console.log(`   - Formatted Question: Code=${formatted.code}, Domain=${formatted.domainName}, CorrectIdx=${formatted.correctAnswer}`);

  // ==========================================
  // TEST 5: Anonymous Sliding-Window Rate Limiter
  // ==========================================
  console.log('   - Test 5: Testing Anonymous Sliding-Window IP Rate Limiter...');
  const testIp = `192.168.1.${Math.floor(Math.random() * 200) + 10}`;

  // Initial check should be allowed
  const check1 = rateLimiter.checkLimit(testIp);
  if (!check1.allowed || check1.remainingHourly <= 0) {
    console.error('❌ Rate limiter initial check failed:', check1);
    return false;
  }

  // Record usage
  rateLimiter.recordUsage(testIp);
  const check2 = rateLimiter.checkLimit(testIp);
  if (check2.remainingHourly !== check1.remainingHourly - 1) {
    console.error('❌ Rate limiter remaining decrement failed:', check2);
    return false;
  }
  console.log(`   - Rate limiter tracked usage: Remaining Hourly=${check2.remainingHourly}/${rateLimiter.getConfig().aiQueriesPerHourPerIp}`);

  // ==========================================
  // TEST 6: Multi-Provider Adapter Health
  // ==========================================
  console.log('   - Test 6: Testing Multi-Provider Adapter Health Checks...');
  const deepseek = PROVIDERS_MAP.deepseek;
  const health = await deepseek.healthCheck();

  if (!health.healthy) {
    console.error('❌ DeepSeek adapter health check failed:', health);
    return false;
  }
  console.log(`   - DeepSeek Provider Adapter: Healthy (Latency: ${health.latencyMs}ms)`);

  console.log('✅ AI Engine & Multi-Provider Architecture Tests Passed.');
  return true;
}
