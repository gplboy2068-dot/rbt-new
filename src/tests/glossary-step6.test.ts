import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CMSService } from '../lib/services/cms';
import { GLOSSARY_TERMS } from '../data/glossary-data';
import { INITIAL_STUDY_GUIDES } from '../data/mock-data';

describe('RBT & ABA Glossary (Step 6 Verification)', () => {
  it('1. Glossary dataset contains at least 70 authentic educational terms', () => {
    assert.ok(GLOSSARY_TERMS.length >= 70, `Expected >= 70 terms, got ${GLOSSARY_TERMS.length}`);
    console.log(`Total Glossary Terms Verified: ${GLOSSARY_TERMS.length}`);
  });

  it('2. Every glossary term has complete clinical fields and educational example', () => {
    const slugs = new Set<string>();

    for (const item of GLOSSARY_TERMS) {
      // Slugs must be unique and valid
      assert.ok(item.slug, 'Term must have a slug');
      assert.ok(!slugs.has(item.slug), `Duplicate slug detected: "${item.slug}"`);
      slugs.add(item.slug);

      // Core content fields
      assert.ok(item.term && item.term.length > 1, `Term title required for "${item.slug}"`);
      assert.ok(item.shortDefinition && item.shortDefinition.length > 20, `Short definition required for "${item.slug}"`);
      assert.ok(item.inSimpleTerms && item.inSimpleTerms.length > 15, `In simple terms required for "${item.slug}"`);
      assert.ok(item.example && item.example.length > 20, `Educational example required for "${item.slug}"`);
      assert.ok(item.example.startsWith('Example scenario:'), `Example must start with "Example scenario:" for "${item.slug}"`);
      assert.ok(item.whyItMatters && item.whyItMatters.length > 15, `Why it matters required for "${item.slug}"`);
      assert.ok(item.commonMistake && item.commonMistake.length > 15, `Common mistake required for "${item.slug}"`);

      // Letter alignment
      assert.strictEqual(item.letter, item.term.charAt(0).toUpperCase(), `Letter must match first char of term for "${item.term}"`);
    }
  });

  it('3. Alphabet coverage spans at least 20 distinct letters', () => {
    const letters = new Set(GLOSSARY_TERMS.map(t => t.letter));
    console.log(`Alphabet letters covered (${letters.size}):`, [...letters].sort().join(', '));
    assert.ok(letters.size >= 20, `Expected at least 20 alphabet letters, found ${letters.size}`);
  });

  it('4. Study guide references link exclusively to real published pillar guides', () => {
    const validGuideSlugs = new Set(INITIAL_STUDY_GUIDES.map(g => g.slug));

    for (const item of GLOSSARY_TERMS) {
      if (item.studyGuideSlug) {
        assert.ok(
          validGuideSlugs.has(item.studyGuideSlug),
          `Term "${item.slug}" references non-existent study guide: "${item.studyGuideSlug}"`
        );
      }
    }
  });

  it('5. CMSService glossary methods operate reliably', () => {
    const terms = CMSService.getGlossaryTerms();
    assert.strictEqual(terms.length, GLOSSARY_TERMS.length);

    const termA = CMSService.getGlossaryTermBySlug('abc-data');
    assert.ok(termA);
    assert.strictEqual(termA.slug, 'abc-data');

    const invalid = CMSService.getGlossaryTermBySlug('unknown-fake-slug-xyz');
    assert.strictEqual(invalid, null);
  });

  it('6. Sitemap XML includes the primary /glossary route', () => {
    const sitemap = CMSService.generateSitemapXml('https://rbtpracticeexam.xyz');
    assert.ok(
      sitemap.includes('https://rbtpracticeexam.xyz/glossary'),
      'Sitemap XML must include the /glossary primary URL'
    );
  });
});
