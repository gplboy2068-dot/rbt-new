import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CMSService } from '../lib/services/cms';
import { ARTICLES_DATA } from '../data/articles-data';
import { STUDY_GUIDES_DATA } from '../data/study-guides-data';

describe('Editorial Review Dates & Freshness System (Step 10 Verification)', () => {
  const publishedArticles = CMSService.getPublishedArticles();
  const maxValidTimestamp = new Date('2026-09-25T00:00:00Z').getTime();

  it('1. All published articles have genuine, verified lastReviewed dates (September 2026)', () => {
    assert.ok(publishedArticles.length >= 3, `Expected at least 3 articles, got ${publishedArticles.length}`);

    for (const art of publishedArticles) {
      assert.ok(
        art.lastReviewed,
        `Article "${art.slug}" must have a lastReviewed date field`
      );
      assert.ok(
        art.lastReviewed.startsWith('2026-09'),
        `Article "${art.slug}" lastReviewed must be September 2026, got: ${art.lastReviewed}`
      );

      // Verify not a future date
      const revTime = new Date(art.lastReviewed).getTime();
      assert.ok(
        revTime <= maxValidTimestamp,
        `Article "${art.slug}" lastReviewed cannot be in the future (${art.lastReviewed})`
      );
    }
  });

  it('2. Articles maintain honest separation between publishedAt, updatedAt, and lastReviewed', () => {
    const art1 = CMSService.getArticleBySlug('continuous-vs-discontinuous-measurement-rbt-guide');
    assert.ok(art1);
    assert.ok(art1.publishedAt.startsWith('2026-01'), `Article 1 should preserve original January 2026 publishedAt, got: ${art1.publishedAt}`);
    assert.ok(art1.updatedAt.startsWith('2026-09'), `Article 1 updatedAt must be September 2026, got: ${art1.updatedAt}`);
    assert.ok(art1.lastReviewed?.startsWith('2026-09'), `Article 1 lastReviewed must be September 2026, got: ${art1.lastReviewed}`);

    const art2 = CMSService.getArticleBySlug('the-4-functions-of-behavior-seat-explained');
    assert.ok(art2);
    assert.ok(art2.publishedAt.startsWith('2026-01'), `Article 2 should preserve original January 2026 publishedAt, got: ${art2.publishedAt}`);
    assert.ok(art2.updatedAt.startsWith('2026-09'), `Article 2 updatedAt must be September 2026, got: ${art2.updatedAt}`);
    assert.ok(art2.lastReviewed?.startsWith('2026-09'), `Article 2 lastReviewed must be September 2026, got: ${art2.lastReviewed}`);

    const art3 = CMSService.getArticleBySlug('how-to-pass-rbt-exam-30-day-study-plan');
    assert.ok(art3);
    assert.ok(art3.publishedAt.startsWith('2026-09'), `Article 3 (created in Step 9) publishedAt must be September 2026, got: ${art3.publishedAt}`);
    assert.ok(art3.lastReviewed?.startsWith('2026-09'), `Article 3 lastReviewed must be September 2026, got: ${art3.lastReviewed}`);
  });

  it('3. All 6 Pillar Study Guides have verified lastReviewed dates (September 2026)', () => {
    assert.strictEqual(STUDY_GUIDES_DATA.length, 6, 'Must have exactly 6 pillar study guides');

    for (const guide of STUDY_GUIDES_DATA) {
      assert.ok(
        guide.lastReviewed,
        `Guide "${guide.slug}" must have lastReviewed property`
      );
      assert.ok(
        guide.lastReviewed.startsWith('2026-09'),
        `Guide "${guide.slug}" lastReviewed must be September 2026, got: ${guide.lastReviewed}`
      );
      assert.ok(
        guide.publishedAt,
        `Guide "${guide.slug}" must have publishedAt property`
      );
      assert.ok(
        guide.updatedAt,
        `Guide "${guide.slug}" must have updatedAt property`
      );

      // Verify date is not in the future
      const revTime = new Date(guide.lastReviewed).getTime();
      assert.ok(revTime <= maxValidTimestamp, `Guide "${guide.slug}" cannot have future review date`);
    }
  });

  it('4. Study guides preserve original published dates for older domains vs newer domains', () => {
    const guideA = STUDY_GUIDES_DATA.find((g) => g.slug === 'measurement-guide');
    assert.ok(guideA);
    assert.ok(guideA.publishedAt?.startsWith('2026-01'), `Domain A should preserve January 2026 published date`);
    assert.ok(guideA.updatedAt?.startsWith('2026-09'), `Domain A updatedAt should reflect September 2026 audit`);

    const guideD = STUDY_GUIDES_DATA.find((g) => g.slug === 'behavior-reduction-guide');
    assert.ok(guideD);
    assert.ok(guideD.publishedAt?.startsWith('2026-01'), `Domain D should preserve January 2026 published date`);
    assert.ok(guideD.updatedAt?.startsWith('2026-09'), `Domain D updatedAt should reflect September 2026 audit`);

    const guideB = STUDY_GUIDES_DATA.find((g) => g.slug === 'behavior-assessment');
    assert.ok(guideB);
    assert.ok(guideB.publishedAt?.startsWith('2026-09'), `Domain B (created Step 5) should have September 2026 published date`);

    const guideF = STUDY_GUIDES_DATA.find((g) => g.slug === 'ethics');
    assert.ok(guideF);
    assert.ok(guideF.publishedAt?.startsWith('2026-09'), `Domain F (created Step 5) should have September 2026 published date`);
  });

  it('5. No dynamic new Date().toISOString() anti-patterns in static data structures', () => {
    for (const art of ARTICLES_DATA) {
      assert.strictEqual(typeof art.publishedAt, 'string');
      assert.strictEqual(typeof art.updatedAt, 'string');
      // Confirm fixed date strings rather than real-time changing objects
      assert.ok(/^\d{4}-\d{2}-\d{2}/.test(art.publishedAt));
      assert.ok(/^\d{4}-\d{2}-\d{2}/.test(art.updatedAt));
    }

    for (const guide of STUDY_GUIDES_DATA) {
      assert.ok(guide.publishedAt && /^\d{4}-\d{2}-\d{2}/.test(guide.publishedAt));
      assert.ok(guide.updatedAt && /^\d{4}-\d{2}-\d{2}/.test(guide.updatedAt));
      assert.ok(guide.lastReviewed && /^\d{4}-\d{2}-\d{2}/.test(guide.lastReviewed));
    }
  });
});
