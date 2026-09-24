import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CMSService } from '../lib/services/cms';
import { ARTICLES_DATA } from '../data/articles-data';
import { GLOSSARY_TERMS } from '../data/glossary-data';
import { STUDY_GUIDES_DATA } from '../data/study-guides-data';

describe('Authoritative Articles Expansion (Step 8 Verification)', () => {
  const published = CMSService.getPublishedArticles();
  const validGuideSlugs = new Set(STUDY_GUIDES_DATA.map((g) => `/study-guides/${g.slug}`));
  const validGlossaryAnchors = new Set(GLOSSARY_TERMS.map((t) => `/glossary#${t.slug}`));

  it('1. Authoritative articles exist with preserved canonical slugs', () => {
    assert.ok(published.length >= 2, `Expected at least 2 articles, found ${published.length}`);

    const slugs = published.map((a) => a.slug);
    assert.ok(
      slugs.includes('continuous-vs-discontinuous-measurement-rbt-guide'),
      'Missing continuous vs discontinuous measurement article'
    );
    assert.ok(
      slugs.includes('the-4-functions-of-behavior-seat-explained'),
      'Missing 4 functions of behavior article'
    );
  });

  it('2. Both articles meet the comprehensive 1,500+ word depth benchmark', () => {
    for (const art of published) {
      const words = art.content.split(/\s+/).filter(Boolean).length;
      console.log(`Article "${art.slug}" Word Count: ${words}`);
      assert.ok(
        words >= 1500,
        `Article "${art.slug}" has ${words} words, expected >= 1500 words of authentic educational content`
      );
    }
  });

  it('3. Article 1 (Continuous vs Discontinuous) covers all core dimensions, comparison table, and scenarios', () => {
    const art = CMSService.getArticleBySlug('continuous-vs-discontinuous-measurement-rbt-guide');
    assert.ok(art, 'Article 1 must exist');

    const content = art.content;

    // Core continuous concepts
    assert.ok(content.includes('Frequency'), 'Must explain Frequency');
    assert.ok(content.includes('Rate'), 'Must explain Rate');
    assert.ok(content.includes('Duration'), 'Must explain Duration');
    assert.ok(content.includes('Latency'), 'Must explain Latency');
    assert.ok(content.includes('Inter-Response Time') || content.includes('IRT'), 'Must explain IRT');

    // Core discontinuous concepts
    assert.ok(content.includes('Partial-Interval Recording') || content.includes('PIR'), 'Must explain Partial-Interval');
    assert.ok(content.includes('Whole-Interval Recording') || content.includes('WIR'), 'Must explain Whole-Interval');
    assert.ok(content.includes('Momentary Time Sampling') || content.includes('MTS'), 'Must explain Momentary Time Sampling');

    // Clinical Comparison Table
    assert.ok(content.includes('| Measurement Procedure |'), 'Must include a clinical comparison table');

    // Practical scenarios & decision-making
    assert.ok(content.includes('Practical Examples: One Behavior Measured Three Ways'), 'Must include practical scenario comparison');
    assert.ok(content.includes('Decision-Making: What Each System Captures and What It Misses'), 'Must include decision-making analysis');
    assert.ok(content.includes('Common Conceptual Confusions on the RBT Exam'), 'Must include common confusions');
    assert.ok(content.includes('Measurement Concepts to Know for RBT Practice'), 'Must include exam prep section');

    // Authoritative citations
    assert.ok(content.includes('Cooper, J. O.'), 'Must cite Cooper et al.');
    assert.ok(content.includes('RBT Test Content Outline (3rd ed.)'), 'Must reference 3rd ed. outline');
  });

  it('4. Article 2 (Four Functions) covers all 4 functions, SEAT clarification, and topography vs function', () => {
    const art = CMSService.getArticleBySlug('the-4-functions-of-behavior-seat-explained');
    assert.ok(art, 'Article 2 must exist');

    const content = art.content;

    // SEAT clarification: Not an official BACB framework
    assert.ok(
      content.includes('not an official') || content.includes('not a trademark') || content.includes('mnemonic'),
      'Must clarify that SEAT is an educational mnemonic, not an official BACB framework'
    );

    // Four individual functions
    assert.ok(content.includes('Attention'), 'Must cover Attention');
    assert.ok(content.includes('Escape'), 'Must cover Escape');
    assert.ok(content.includes('Tangible Access'), 'Must cover Tangible Access');
    assert.ok(content.includes('Automatic Reinforcement') || content.includes('Sensory'), 'Must cover Automatic/Sensory');

    // Topography vs Function
    assert.ok(content.includes('Topography vs. Function'), 'Must detail Topography vs Function');
    assert.ok(content.includes('Assessment Limitations & Scope of Practice'), 'Must include assessment scope');
    assert.ok(content.includes('Four Functions of Behavior: What to Remember for RBT Practice'), 'Must include practice takeaways');

    // Comparison table
    assert.ok(content.includes('| Behavioral Function |'), 'Must include a 4-function comparison table');

    // Citations
    assert.ok(content.includes('Iwata') || content.includes('Cooper'), 'Must cite Iwata or Cooper');
  });

  it('5. Internal links within articles resolve to valid site routes', () => {
    for (const art of published) {
      // Find all markdown links: [text](url)
      const matches = Array.from(art.content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g));
      assert.ok(matches.length >= 8, `Article "${art.slug}" should contain at least 8 internal links`);

      for (const match of matches) {
        const url = match[2];
        assert.ok(url.startsWith('/'), `Link "${url}" must be an internal root-relative path`);

        if (url.startsWith('/study-guides/')) {
          assert.ok(validGuideSlugs.has(url), `Broken study guide link in "${art.slug}": ${url}`);
        } else if (url.startsWith('/glossary#')) {
          assert.ok(validGlossaryAnchors.has(url), `Broken glossary anchor in "${art.slug}": ${url}`);
        } else if (url.startsWith('/topics/')) {
          assert.ok(
            url.length > 8,
            `Malformed topic link in "${art.slug}": ${url}`
          );
        } else if (url.startsWith('/practice-questions') || url.startsWith('/mock-exams')) {
          assert.ok(true);
        }
      }
    }
  });

  it('6. Honest E-E-A-T: No false BCBA claims or BACB endorsement implications', () => {
    for (const art of published) {
      assert.ok(
        !art.author.includes('BCBA'),
        `Author field must not claim false BCBA credentials: "${art.author}"`
      );
      assert.ok(
        !art.content.includes('official BACB practice questions'),
        'Must not claim questions are official BACB questions'
      );
      assert.ok(
        art.content.includes('independent educational prep resource') ||
        art.content.includes('does not endorse'),
        'Must include explicit non-affiliation / non-endorsement notice'
      );
    }
  });
});
