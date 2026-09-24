import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { CMSService } from '../lib/services/cms';

describe('Route Consolidation & 301 Permanent Redirects Verification', () => {

  it('1. Shorthand routes contain permanent HTTP 301 redirect handlers', () => {
    const shorthandFiles = [
      { path: 'src/pages/practice.astro', target: '/practice-questions' },
      { path: 'src/pages/mock-exam/index.astro', target: '/mock-exams' },
      { path: 'src/pages/mock-exam/[id].astro', target: '/mock-exams/' },
      { path: 'src/pages/privacy.astro', target: '/privacy-policy' },
      { path: 'src/pages/terms.astro', target: '/terms-and-conditions' },
    ];

    for (const f of shorthandFiles) {
      const fullPath = path.resolve(f.path);
      assert.ok(fs.existsSync(fullPath), `Shorthand file ${f.path} must exist`);
      const content = fs.readFileSync(fullPath, 'utf8');
      
      assert.ok(
        content.includes('Astro.redirect'),
        `File ${f.path} must use Astro.redirect`
      );
      assert.ok(
        content.includes('301'),
        `File ${f.path} must return an HTTP 301 permanent redirect`
      );
      assert.ok(
        content.includes(f.target),
        `File ${f.path} must redirect to ${f.target}`
      );
      // Ensure no duplicate layout or body is rendered
      assert.ok(
        !content.includes('<Layout') && !content.includes('<html'),
        `File ${f.path} must not render duplicate HTML layout content`
      );
    }
  });

  it('2. Primary canonical pages exist and contain full implementation', () => {
    const primaryFiles = [
      'src/pages/practice-questions.astro',
      'src/pages/mock-exams/index.astro',
      'src/pages/mock-exams/[id].astro',
      'src/pages/privacy-policy.astro',
      'src/pages/terms-and-conditions.astro',
    ];

    for (const file of primaryFiles) {
      const fullPath = path.resolve(file);
      assert.ok(fs.existsSync(fullPath), `Primary canonical file ${file} must exist`);
      const content = fs.readFileSync(fullPath, 'utf8');
      assert.ok(
        content.includes('<Layout'),
        `Primary file ${file} must render its Layout component`
      );
    }
  });

  it('3. Sitemap XML includes canonical URLs and excludes shorthand redirect routes', () => {
    const sitemap = CMSService.generateSitemapXml('https://rbtpracticeexam.xyz');

    // Must include canonicals
    assert.ok(sitemap.includes('/practice-questions'), 'Sitemap must include /practice-questions');
    assert.ok(sitemap.includes('/mock-exams'), 'Sitemap must include /mock-exams');
    assert.ok(sitemap.includes('/privacy-policy'), 'Sitemap must include /privacy-policy');
    assert.ok(sitemap.includes('/terms-and-conditions'), 'Sitemap must include /terms-and-conditions');

    // Must NOT include shorthand redirect routes
    assert.ok(!sitemap.includes('<loc>https://rbtpracticeexam.xyz/privacy</loc>'), 'Sitemap must NOT include /privacy');
    assert.ok(!sitemap.includes('<loc>https://rbtpracticeexam.xyz/terms</loc>'), 'Sitemap must NOT include /terms');
    assert.ok(!sitemap.includes('<loc>https://rbtpracticeexam.xyz/mock-exam</loc>'), 'Sitemap must NOT include /mock-exam');
    assert.ok(!sitemap.includes('<loc>https://rbtpracticeexam.xyz/practice</loc>'), 'Sitemap must NOT include /practice');
  });

  it('4. Zero internal links to shorthand redirect routes in public Astro pages', () => {
    const publicPages = [
      'src/pages/index.astro',
      'src/layouts/Layout.astro',
      'src/pages/study-guides/index.astro',
      'src/pages/study-guides/[slug].astro',
      'src/pages/topics/index.astro',
      'src/pages/faq.astro',
      'src/pages/about.astro',
      'src/pages/contact.astro',
      'src/pages/disclaimer.astro',
      'src/components/layout/Navbar.tsx',
      'src/components/layout/Footer.tsx',
      'src/components/MockExamListIsland.tsx',
    ];

    const forbiddenPatterns = [
      /href=["']\/practice["']/g,
      /href=["']\/mock-exam["']/g,
      /href=["']\/privacy["']/g,
      /href=["']\/terms["']/g,
    ];

    for (const relPath of publicPages) {
      const fullPath = path.resolve(relPath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const pattern of forbiddenPatterns) {
          const match = content.match(pattern);
          assert.strictEqual(
            match,
            null,
            `File ${relPath} contains forbidden link pattern: ${pattern}`
          );
        }
      }
    }
  });
});
