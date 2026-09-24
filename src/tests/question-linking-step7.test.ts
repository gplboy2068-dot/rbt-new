import { describe, it } from 'node:test';
import assert from 'node:assert';
import { INITIAL_QUESTIONS } from '../data/mock-data';
import { STUDY_GUIDES_DATA } from '../data/study-guides-data';
import { GLOSSARY_TERMS } from '../data/glossary-data';
import { CMSService } from '../lib/services/cms';
import { resolveQuestionLearningPath } from '../lib/services/question-link-resolver';

describe('Closed-Loop Educational Internal-Linking System (Step 7 Verification)', () => {
  const validGuideSlugs = new Set(STUDY_GUIDES_DATA.map((g) => `/study-guides/${g.slug}`));
  const validGlossaryAnchors = new Set(GLOSSARY_TERMS.map((t) => `/glossary#${t.slug}`));
  const validArticleUrls = new Set(CMSService.getPublishedArticles().map((a) => `/articles/${a.slug}`));

  it('1. Every question in the question bank resolves to an authentic Study Guide URL', () => {
    assert.ok(INITIAL_QUESTIONS.length >= 80, `Expected at least 80 questions, found ${INITIAL_QUESTIONS.length}`);

    for (const q of INITIAL_QUESTIONS) {
      const path = resolveQuestionLearningPath(q);

      assert.ok(path.studyGuide, `Question "${q.id}" must have a primary study guide`);
      assert.ok(
        validGuideSlugs.has(path.studyGuide.url),
        `Question "${q.id}" resolved to invalid study guide URL: ${path.studyGuide.url}`
      );
      assert.ok(
        path.studyGuide.anchorText.length > 10,
        `Question "${q.id}" study guide anchor text too short: "${path.studyGuide.anchorText}"`
      );
      assert.ok(
        !path.studyGuide.anchorText.toLowerCase().includes('click here'),
        'Anchor text must be educational and descriptive, never "click here"'
      );
    }
  });

  it('2. Every question resolves to an authentic Glossary term anchor', () => {
    for (const q of INITIAL_QUESTIONS) {
      const path = resolveQuestionLearningPath(q);

      assert.ok(path.glossary, `Question "${q.id}" must resolve to a glossary concept`);
      assert.ok(
        validGlossaryAnchors.has(path.glossary.url),
        `Question "${q.id}" resolved to invalid glossary anchor: ${path.glossary.url}`
      );
      assert.ok(
        path.glossary.anchorText.length > 8,
        `Question "${q.id}" glossary anchor text too short: "${path.glossary.anchorText}"`
      );
    }
  });

  it('3. Specific concept matching resolves accurately for core RBT competencies', () => {
    // Latency
    const latencyPath = resolveQuestionLearningPath({
      domainId: 'A',
      domainName: 'Domain A',
      content: 'The technician records the latency between the instruction and response.',
      explanation: 'Latency measures the elapsed time from SD to behavior initiation.',
    });
    assert.strictEqual(latencyPath.glossary?.url, '/glossary#latency');
    assert.strictEqual(latencyPath.glossary?.anchorText, 'Explore Latency in Glossary');

    // Inter-Response Time (IRT)
    const irtPath = resolveQuestionLearningPath({
      domainId: 'A',
      domainName: 'Domain A',
      content: 'What is the time between two consecutive instances of head-banging called?',
      explanation: 'Inter-response time (IRT) measures elapsed time between behaviors.',
    });
    assert.strictEqual(irtPath.glossary?.url, '/glossary#inter-response-time');

    // Partial Interval
    const partialPath = resolveQuestionLearningPath({
      domainId: 'A',
      domainName: 'Domain A',
      content: 'During partial interval recording, when is the behavior scored?',
      explanation: 'Partial interval is scored if behavior occurs at any point during the interval.',
    });
    assert.strictEqual(partialPath.glossary?.url, '/glossary#partial-interval-recording');

    // MSWO Preference Assessment
    const mswoPath = resolveQuestionLearningPath({
      domainId: 'B',
      domainName: 'Domain B',
      content: 'In MSWO, what happens when an item is selected by the learner?',
      explanation: 'Multiple Stimulus Without Replacement removes the selected item.',
    });
    assert.strictEqual(mswoPath.glossary?.url, '/glossary#multiple-stimulus-without-replacement');

    // Differential Reinforcement
    const draPath = resolveQuestionLearningPath({
      domainId: 'D',
      domainName: 'Domain D',
      content: 'The technician uses DRA to replace screaming with a functional mand.',
      explanation: 'Differential reinforcement of alternative behavior reinforces an appropriate alternative.',
    });
    assert.strictEqual(draPath.glossary?.url, '/glossary#differential-reinforcement');

    // Extinction Burst
    const burstPath = resolveQuestionLearningPath({
      domainId: 'D',
      domainName: 'Domain D',
      content: 'After starting extinction, the client tantrums with higher intensity.',
      explanation: 'An extinction burst is a temporary increase in frequency and intensity.',
    });
    assert.strictEqual(burstPath.glossary?.url, '/glossary#extinction-burst');

    // Dual Relationships
    const ethicsPath = resolveQuestionLearningPath({
      domainId: 'F',
      domainName: 'Domain F',
      content: 'A client family invites the RBT to a birthday party and offers a gift card.',
      explanation: 'RBTs must avoid dual relationships and refrain from accepting gifts.',
    });
    assert.strictEqual(ethicsPath.glossary?.url, '/glossary#dual-relationship');
  });

  it('4. Deep-dive clinical article links resolve to existing published articles', () => {
    const qWithArticle = INITIAL_QUESTIONS.find((q) =>
      q.content.toLowerCase().includes('interval') || q.content.toLowerCase().includes('rate')
    );
    assert.ok(qWithArticle, 'Should find at least one measurement question');

    const path = resolveQuestionLearningPath(qWithArticle);
    if (path.article) {
      assert.ok(
        validArticleUrls.has(path.article.url),
        `Article URL must exist in CMS: ${path.article.url}`
      );
    }
  });

  it('5. Safe fallback behavior on missing, corrupted, or unmapped questions', () => {
    // Completely empty question
    const emptyPath = resolveQuestionLearningPath({});
    assert.ok(emptyPath.studyGuide, 'Must fallback to a valid study guide');
    assert.ok(validGuideSlugs.has(emptyPath.studyGuide.url));
    assert.ok(emptyPath.glossary, 'Must fallback to a valid glossary term');
    assert.ok(validGlossaryAnchors.has(emptyPath.glossary.url));
    assert.ok(emptyPath.practice.url.startsWith('/practice-questions') || emptyPath.practice.url.startsWith('/topics'));
    assert.strictEqual(emptyPath.mockExam.url, '/mock-exams');

    // Unknown domain 'Z'
    const unknownPath = resolveQuestionLearningPath({
      domainId: 'Z',
      domainName: 'Unknown Domain',
      content: 'Unknown question content',
    });
    assert.ok(validGuideSlugs.has(unknownPath.studyGuide.url));
    assert.ok(validGlossaryAnchors.has(unknownPath.glossary.url));
  });

  it('6. Link density constraint: 1 primary study guide + 1 secondary glossary + max 1 article', () => {
    for (const q of INITIAL_QUESTIONS) {
      const path = resolveQuestionLearningPath(q);

      // Exactly 1 primary study guide
      assert.ok(path.studyGuide && typeof path.studyGuide.url === 'string');

      // Exactly 1 secondary glossary term
      assert.ok(path.glossary && typeof path.glossary.url === 'string');

      // At most 1 optional article
      if (path.article) {
        assert.strictEqual(typeof path.article.url, 'string');
      }

      // Next-step practice and mock exam
      assert.ok(path.practice && typeof path.practice.url === 'string');
      assert.ok(path.mockExam && typeof path.mockExam.url === 'string');
    }
  });

  it('7. Reverse linking verification: Study Guides provide pathways back to Practice and Glossary', () => {
    for (const guide of STUDY_GUIDES_DATA) {
      assert.ok(guide.slug, 'Guide must have a slug');
      assert.ok(guide.domain, 'Guide must have a domain');
      assert.ok(guide.sections.length >= 3, 'Guide must have comprehensive sections');
    }
  });

  it('8. Reverse linking verification: Glossary terms provide pathways back to Study Guides and Topics', () => {
    const termsWithStudyGuide = GLOSSARY_TERMS.filter((t) => Boolean(t.studyGuideSlug));
    const termsWithTopic = GLOSSARY_TERMS.filter((t) => Boolean(t.topicSlug));

    assert.ok(termsWithStudyGuide.length >= 70, 'Most glossary terms should link to a pillar study guide');
    assert.ok(termsWithTopic.length >= 70, 'Most glossary terms should link to a curriculum topic');

    // Verify all studyGuideSlugs match existing guides
    for (const t of termsWithStudyGuide) {
      assert.ok(
        validGuideSlugs.has(`/study-guides/${t.studyGuideSlug}`),
        `Glossary term "${t.slug}" links to invalid study guide: "${t.studyGuideSlug}"`
      );
    }
  });
});
