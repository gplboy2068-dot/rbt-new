import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CMSService } from '../lib/services/cms';
import { GLOSSARY_TERMS } from '../data/glossary-data';
import { STUDY_GUIDES_DATA } from '../data/study-guides-data';

describe('30-Day RBT Study Plan Article (Step 9 Verification)', () => {
  const slug = 'how-to-pass-rbt-exam-30-day-study-plan';
  const article = CMSService.getArticleBySlug(slug);
  const validGuideSlugs = new Set(STUDY_GUIDES_DATA.map((g) => `/study-guides/${g.slug}`));
  const validGlossaryAnchors = new Set(GLOSSARY_TERMS.map((t) => `/glossary#${t.slug}`));

  it('1. Article exists, is published, and has correct metadata', () => {
    assert.ok(article, `Article with slug "${slug}" must exist in CMSService`);
    assert.strictEqual(article.status, 'published');
    assert.strictEqual(article.slug, slug);
    assert.ok(article.title.includes('30 Days') || article.title.includes('Study Plan'));
    assert.ok(article.author.includes('RBTPracticeExam Educational Content Team'));
    assert.ok(article.readTimeMinutes >= 15);
  });

  it('2. Article exceeds comprehensive word count benchmark (>= 1,800 words)', () => {
    assert.ok(article);
    const words = article.content.split(/\s+/).filter(Boolean).length;
    console.log(`Step 9 Article "${slug}" Total Word Count: ${words}`);
    assert.ok(
      words >= 1800,
      `Expected >= 1,800 words, got ${words} words`
    );
  });

  it('3. Covers all 30 days sequentially from Day 1 through Day 30', () => {
    assert.ok(article);
    for (let day = 1; day <= 30; day++) {
      const dayPattern = new RegExp(`Day\\s+${day}\\b`, 'i');
      assert.ok(
        dayPattern.test(article.content),
        `Missing coverage for Day ${day} in 30-day study plan`
      );
    }
  });

  it('4. Integrates all six current BACB domains (Domains A through F)', () => {
    assert.ok(article);
    const domains = [
      'Domain A',
      'Domain B',
      'Domain C',
      'Domain D',
      'Domain E',
      'Domain F'
    ];
    for (const d of domains) {
      assert.ok(
        article.content.includes(d),
        `Content must explicitly reference and cover ${d}`
      );
    }
  });

  it('5. Contains ethical disclaimers and avoids false pass guarantees', () => {
    assert.ok(article);
    const content = article.content.toLowerCase();
    
    // Must contain disclaimer of BACB endorsement and non-guarantee
    assert.ok(
      content.includes('not an official bacb') || content.includes('does not guarantee passing') || content.includes('independent'),
      'Must contain explicit independence notice and clarify no pass guarantee'
    );
    assert.ok(
      content.includes('benchmark') && content.includes('80%'),
      'Must clarify 80% is an internal benchmark, not the official passing score'
    );
  });

  it('6. Accurately describes Pearson VUE exam structure and test-day protocols', () => {
    assert.ok(article);
    // 85 total items, 75 scored, 10 pilot/unscored, 90 minutes
    assert.ok(article.content.includes('85'));
    assert.ok(article.content.includes('75'));
    assert.ok(article.content.includes('10'));
    assert.ok(article.content.includes('90 minutes'));
    assert.ok(article.content.includes('Pearson VUE'));
    assert.ok(article.content.includes('identification') || article.content.includes('IDs'));
  });

  it('7. Internal links to study guides and glossary resolve to valid targets', () => {
    assert.ok(article);
    
    // Check study guide links
    const studyGuideLinks = Array.from(article.content.matchAll(/\]\((\/study-guides\/[a-z0-9-]+)\)/g)).map((m) => m[1]);
    assert.ok(studyGuideLinks.length >= 6, 'Must link to all 6 pillar study guides');
    for (const link of studyGuideLinks) {
      assert.ok(validGuideSlugs.has(link), `Study guide link "${link}" must match an existing guide`);
    }

    // Check glossary links
    const glossaryLinks = Array.from(article.content.matchAll(/\]\((\/glossary#[a-z0-9-]+)\)/g)).map((m) => m[1]);
    assert.ok(glossaryLinks.length >= 8, 'Must link to key glossary anchors');
    for (const link of glossaryLinks) {
      assert.ok(validGlossaryAnchors.has(link), `Glossary anchor "${link}" must match an existing glossary term`);
    }

    // Check practice and mock exam links
    assert.ok(article.content.includes('/mock-exams'), 'Must link to mock exams');
    assert.ok(article.content.includes('/flashcards'), 'Must link to flashcards');
    assert.ok(article.content.includes('/practice-questions'), 'Must link to practice questions');
  });
});
