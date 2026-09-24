import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CMSService } from '../lib/services/cms';
import { INITIAL_STUDY_GUIDES } from '../data/mock-data';

describe('Domain Pillar Study Guides (Step 5 Verification)', () => {
  const expectedPillarSlugs = [
    'measurement-guide',
    'behavior-assessment',
    'behavior-acquisition',
    'behavior-reduction-guide',
    'documentation-and-reporting',
    'ethics',
  ];

  it('1. All 6 Domain pillar study guides are registered in INITIAL_STUDY_GUIDES and CMSService', () => {
    assert.strictEqual(INITIAL_STUDY_GUIDES.length, 6, 'Should have exactly 6 pillar study guides');

    for (const slug of expectedPillarSlugs) {
      const guide = CMSService.getStudyGuideBySlug(slug);
      assert.ok(guide, `Study guide for slug "${slug}" must exist in CMSService`);
      assert.strictEqual(guide.slug, slug);
      assert.ok(guide.title.length > 10, `Title must be descriptive for "${slug}"`);
      assert.ok(guide.sections.length >= 4, `Guide "${slug}" must have at least 4 detailed sections`);
    }
  });

  it('2. The 4 newly required pillar guides (B, C, E, F) meet in-depth word count standards (>=1,500 words)', () => {
    const targetSlugs = ['behavior-assessment', 'behavior-acquisition', 'documentation-and-reporting', 'ethics'];

    for (const slug of targetSlugs) {
      const guide = CMSService.getStudyGuideBySlug(slug);
      assert.ok(guide, `Guide "${slug}" must exist`);
      
      const wordCount = guide.sections.reduce((acc, s) => {
        const contentWords = s.content.split(/\s+/).filter(Boolean).length;
        const pointWords = s.keyFormulasOrPoints 
          ? s.keyFormulasOrPoints.join(' ').split(/\s+/).filter(Boolean).length 
          : 0;
        return acc + contentWords + pointWords;
      }, 0);

      console.log(`Pillar Guide "${slug}" Word Count: ${wordCount}`);
      assert.ok(
        wordCount >= 1500,
        `Guide "${slug}" word count must be >= 1,500 words (actual: ${wordCount})`
      );
    }
  });

  it('3. Each pillar guide contains clinical tables, common pitfalls, and FAQs', () => {
    for (const slug of expectedPillarSlugs) {
      const guide = CMSService.getStudyGuideBySlug(slug)!;
      const combinedContent = guide.sections.map(s => s.title + ' ' + s.content).join(' ');

      // Must have FAQ section
      const hasFaq = guide.sections.some(s => s.title.toLowerCase().includes('faq') || s.title.toLowerCase().includes('frequently asked'));
      assert.ok(hasFaq, `Guide "${slug}" must contain a FAQ section`);

      // Must have Common Pitfalls or Mistakes
      const hasPitfalls = guide.sections.some(s => s.title.toLowerCase().includes('pitfall') || s.title.toLowerCase().includes('mistake'));
      assert.ok(hasPitfalls, `Guide "${slug}" must contain a Common Pitfalls or Mistakes section`);

      // Must have clinical tables or comparison matrices
      const hasTable = combinedContent.includes('| :---') || combinedContent.includes('| ---');
      assert.ok(hasTable, `Guide "${slug}" must contain structured Markdown comparison tables`);
    }
  });

  it('4. Sitemap XML contains all 6 study guide URLs', () => {
    const sitemap = CMSService.generateSitemapXml('https://rbtpracticeexam.xyz');

    for (const slug of expectedPillarSlugs) {
      const expectedUrl = `https://rbtpracticeexam.xyz/study-guides/${slug}`;
      assert.ok(
        sitemap.includes(expectedUrl),
        `Sitemap XML must include study guide URL: ${expectedUrl}`
      );
    }
  });

  it('5. CMSService returns null for unrecognized slugs to support clean 404s', () => {
    const invalidGuide = CMSService.getStudyGuideBySlug('non-existent-domain-xyz');
    assert.strictEqual(invalidGuide, null, 'Unrecognized slug must return null');
  });
});
