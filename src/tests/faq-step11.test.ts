import { describe, it } from 'node:test';
import assert from 'node:assert';
import { FAQ_CATEGORIES, FAQ_ENTRIES, OFFICIAL_RESOURCES } from '../data/faq-data';
import { CMSService } from '../lib/services/cms';

describe('Step 11 — FAQ Expansion & Quality Verification', () => {

  it('1. FAQ categories are properly structured with no thin single-question categories', () => {
    assert.strictEqual(FAQ_CATEGORIES.length, 6, 'Should have exactly 6 distinct categories');
    
    const requiredCategoryIds = [
      'exam-basics',
      'study-prep',
      'practice-scoring',
      'exam-day',
      'results-retesting',
      'platform-transparency'
    ];

    for (const catId of requiredCategoryIds) {
      const cat = FAQ_CATEGORIES.find(c => c.id === catId);
      assert.ok(cat, `Category "${catId}" must exist`);
      
      const itemsInCat = FAQ_ENTRIES.filter(e => e.categoryId === catId);
      assert.ok(
        itemsInCat.length >= 2,
        `Category "${catId}" must have at least 2 questions to avoid thin UX (has ${itemsInCat.length})`
      );
    }
  });

  it('2. Total question count and coverage meets educational standards', () => {
    assert.ok(
      FAQ_ENTRIES.length >= 20,
      `Expected at least 20 comprehensive questions, got ${FAQ_ENTRIES.length}`
    );

    // Verify all entries have valid id, categoryId, question, answerHtml, and answerText
    for (const item of FAQ_ENTRIES) {
      assert.ok(item.id && item.id.startsWith('faq-'), `Item ID "${item.id}" must be well-formed`);
      assert.ok(item.question && item.question.length > 10, `Question "${item.question}" is too short`);
      assert.ok(item.answerHtml && item.answerHtml.length > 50, `Answer HTML for "${item.id}" is too short`);
      assert.ok(item.answerText && item.answerText.length > 40, `Answer text for "${item.id}" is too short`);
      assert.ok(
        !item.answerText.includes('<p>') && !item.answerText.includes('href='),
        `Answer text for schema in "${item.id}" must not contain raw HTML tags`
      );
    }
  });

  it('3. Exam-day and Pearson VUE testing rules are factually verified', () => {
    // ID verification
    const idItem = FAQ_ENTRIES.find(e => e.id === 'faq-what-id-needed');
    assert.ok(idItem, 'Must have ID verification question');
    assert.ok(idItem.answerText.includes('two valid') || idItem.answerText.includes('2 valid'), 'Must specify two forms of ID');
    assert.ok(idItem.answerText.includes('signature'), 'Must specify signature requirement on IDs');
    assert.ok(idItem.answerText.includes('government-issued'), 'Must specify government-issued photo ID');

    // Arrival time
    const arrivalItem = FAQ_ENTRIES.find(e => e.id === 'faq-when-to-arrive');
    assert.ok(arrivalItem, 'Must have arrival time question');
    assert.ok(arrivalItem.answerText.includes('30 minutes'), 'Must specify 30 minutes early arrival');

    // Calculator rule
    const calcItem = FAQ_ENTRIES.find(e => e.id === 'faq-can-i-bring-calculator');
    assert.ok(calcItem, 'Must have calculator rule question');
    assert.ok(calcItem.answerText.toLowerCase().includes('prohibited'), 'Handheld calculators must be stated as prohibited');
    assert.ok(calcItem.answerText.includes('on-screen digital calculator'), 'Must mention on-screen calculator provided');

    // Scratch paper rule
    const scratchItem = FAQ_ENTRIES.find(e => e.id === 'faq-can-i-use-scratch-paper');
    assert.ok(scratchItem, 'Must have scratch paper rule question');
    assert.ok(scratchItem.answerText.toLowerCase().includes('erasable'), 'Must mention erasable whiteboard/booklet provided by center');

    // Break rule
    const breakItem = FAQ_ENTRIES.find(e => e.id === 'faq-can-i-take-break');
    assert.ok(breakItem, 'Must have break rule question');
    assert.ok(breakItem.answerText.includes('timer does NOT pause') || breakItem.answerText.includes('clock continues'), 'Must state 90-minute timer does not pause');

    // Lockers / Personal items
    const lockerItem = FAQ_ENTRIES.find(e => e.id === 'faq-personal-items-lockers');
    assert.ok(lockerItem, 'Must have locker / personal items question');
    assert.ok(lockerItem.answerText.toLowerCase().includes('locker'), 'Must state items must be stored in lockers');

    // Rescheduling policy
    const reschedItem = FAQ_ENTRIES.find(e => e.id === 'faq-how-to-reschedule');
    assert.ok(reschedItem, 'Must have rescheduling rule question');
    assert.ok(reschedItem.answerText.includes('48 hours'), 'Must state 48-hour advance rescheduling requirement');
  });

  it('4. Results and Retesting policies reflect official BACB guidelines', () => {
    // Immediate results printout
    const resultsItem = FAQ_ENTRIES.find(e => e.id === 'faq-when-results-received');
    assert.ok(resultsItem, 'Must have score reporting question');
    assert.ok(resultsItem.answerText.includes('PASS') || resultsItem.answerText.includes('pass'), 'Must explain pass notification');
    assert.ok(resultsItem.answerText.toLowerCase().includes('diagnostic'), 'Must explain diagnostic feedback for failing candidates');

    // Retest rules
    const retestItem = FAQ_ENTRIES.find(e => e.id === 'faq-retesting-policy');
    assert.ok(retestItem, 'Must have retest policy question');
    assert.ok(retestItem.answerText.includes('8'), 'Must state up to 8 attempts in 1 year');
    assert.ok(retestItem.answerText.includes('7-day') || retestItem.answerText.includes('7 days'), 'Must state 7-day waiting period');
  });

  it('5. Independent status, no BACB endorsement claim, and practice score disclaimers are clear', () => {
    // Independent status
    const officialQuestions = FAQ_ENTRIES.find(e => e.id === 'faq-are-questions-official');
    assert.ok(officialQuestions, 'Must have official questions question');
    assert.ok(officialQuestions.answerText.startsWith('No.'), 'Must clearly say No to official BACB questions');

    // Practice score prediction disclaimer
    const scorePredictItem = FAQ_ENTRIES.find(e => e.id === 'faq-practice-score-prediction');
    assert.ok(scorePredictItem, 'Must have score prediction question');
    assert.ok(scorePredictItem.answerText.startsWith('No.'), 'Must clearly say No to guaranteed pass or official score prediction');

    // Developer identity transparency
    const creatorItem = FAQ_ENTRIES.find(e => e.id === 'faq-who-maintains-site');
    assert.ok(creatorItem, 'Must have creator transparency question');
    assert.ok(creatorItem.answerText.includes('Firoz Khan'), 'Must name developer Firoz Khan');
    assert.ok(creatorItem.answerText.includes('FK Digital Media'), 'Must name FK Digital Media');
    assert.ok(creatorItem.answerText.toLowerCase().includes('software engineer'), 'Must state software engineer background honestly');
  });

  it('6. Internal links in answerHtml point to valid existing routes', () => {
    const validRoutes = [
      '/study-guides/measurement-guide',
      '/study-guides/behavior-assessment',
      '/study-guides/behavior-acquisition',
      '/study-guides/behavior-reduction-guide',
      '/study-guides/documentation-and-reporting',
      '/study-guides/ethics',
      '/study-guides',
      '/topics',
      '/glossary',
      '/practice-questions',
      '/mock-exams',
      '/study',
      '/analytics',
      '/about',
      '/editorial-policy',
      '/methodology',
      '/contact',
      '/articles/how-to-pass-rbt-exam-30-day-study-plan',
      '/articles/continuous-vs-discontinuous-measurement-rbt-guide',
      '/articles/the-4-functions-of-behavior-seat-explained'
    ];

    const linkRegex = /href="(\/[^"#?]+)(?:#[^"]*)?"/g;

    for (const item of FAQ_ENTRIES) {
      let match;
      while ((match = linkRegex.exec(item.answerHtml)) !== null) {
        const route = match[1];
        assert.ok(
          validRoutes.includes(route),
          `Invalid internal route "${route}" found in question "${item.id}"`
        );
      }
    }
  });

  it('7. Official resources list points to verified authoritative BACB and Pearson VUE sites', () => {
    assert.ok(OFFICIAL_RESOURCES.length >= 4, 'Must have at least 4 authoritative resources');
    
    const bacbResource = OFFICIAL_RESOURCES.find(r => r.url === 'https://www.bacb.com');
    assert.ok(bacbResource, 'Must link to official BACB website');

    const handbookResource = OFFICIAL_RESOURCES.find(r => r.url === 'https://www.bacb.com/rbt-handbook/');
    assert.ok(handbookResource, 'Must link to official BACB RBT Handbook');

    const pearsonResource = OFFICIAL_RESOURCES.find(r => r.url === 'https://home.pearsonvue.com/bacb');
    assert.ok(pearsonResource, 'Must link to official Pearson VUE BACB portal');
  });

  it('8. CMSService retrieves published FAQs from the updated store', () => {
    const publishedFaqs = CMSService.getPublishedFAQs();
    assert.ok(
      publishedFaqs.length >= FAQ_ENTRIES.length,
      `CMSService must have at least ${FAQ_ENTRIES.length} FAQs, got ${publishedFaqs.length}`
    );
  });
});
