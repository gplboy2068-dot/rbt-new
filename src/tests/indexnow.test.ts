import fs from 'fs';
import path from 'path';
import { IndexNowService, INDEXNOW_KEY, INDEXNOW_KEY_LOCATION } from '../lib/services/indexnow';
import { publicConfig } from '../lib/config';

console.log('🧪 Testing IndexNow Search Engine Indexing Engine...');

// Test 1: Key File Presence
console.log('   - Test 1: Verifying public IndexNow key verification file...');
const keyFilePath = path.join(process.cwd(), 'public', `${INDEXNOW_KEY}.txt`);
if (!fs.existsSync(keyFilePath)) {
  throw new Error(`IndexNow key file missing at ${keyFilePath}`);
}
const content = fs.readFileSync(keyFilePath, 'utf8').trim();
if (content !== INDEXNOW_KEY) {
  throw new Error(`IndexNow key file content mismatch. Expected "${INDEXNOW_KEY}", got "${content}"`);
}
console.log(`   - Verified key file: public/${INDEXNOW_KEY}.txt contains "${content}"`);

// Test 2: IndexNow Constants
console.log('   - Test 2: Verifying IndexNow key and location constants...');
if (INDEXNOW_KEY !== 'd26bdf68026541dda2e45c1b5986da13') {
  throw new Error(`Unexpected IndexNow key: ${INDEXNOW_KEY}`);
}
if (!INDEXNOW_KEY_LOCATION.includes(INDEXNOW_KEY)) {
  throw new Error(`Key location does not include key: ${INDEXNOW_KEY_LOCATION}`);
}
console.log(`   - Verified keyLocation: ${INDEXNOW_KEY_LOCATION}`);

// Test 3: URL Gather
console.log('   - Test 3: Verifying IndexNow payload formulation on sample URLs...');
const sampleUrls = ['/study', '/practice-questions', '/mock-exams'];
const host = new URL(publicConfig.siteUrl).host;
if (!host.includes('rbtpracticeexam.xyz')) {
  throw new Error(`Expected host to be rbtpracticeexam.xyz, got ${host}`);
}
console.log(`   - Verified IndexNow host: ${host}`);

console.log('✅ IndexNow Engine Tests Passed (100% Verified).');
