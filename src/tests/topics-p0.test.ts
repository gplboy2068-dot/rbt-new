import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('P0 Topics Taxonomy & Soft-404 Validation', () => {
  it('verifies all 16 published topic slugs exist in data and have required fields', async () => {
    const publishedSlugs = [
      'continuous-measurement',
      'discontinuous-measurement',
      'permanent-product',
      'graphing-data',
      'preference-assessments',
      'abc-narrative-data',
      'skill-acquisition-plans',
      'prompting-hierarchies',
      'shaping-chaining',
      'behavior-reduction-plans',
      'differential-reinforcement',
      'extinction-procedures',
      'objective-session-notes',
      'incident-reporting',
      'professional-boundaries-gifts',
      'client-dignity-communication',
    ];

    // Read the topic data definitions from the page
    const fs = await import('fs');
    const topicPageContent = fs.readFileSync('src/pages/topics/[slug].astro', 'utf-8');

    for (const slug of publishedSlugs) {
      assert.ok(
        topicPageContent.includes(`'${slug}':`),
        `Missing topic slug in TOPICS_DATA: ${slug}`
      );
    }
  });

  it('verifies soft-404 fallback is eliminated and 404 status is set', async () => {
    const fs = await import('fs');
    const topicPageContent = fs.readFileSync('src/pages/topics/[slug].astro', 'utf-8');

    // Must NOT have the old silent fallback to continuous-measurement
    assert.ok(
      !topicPageContent.includes("|| TOPICS_DATA['continuous-measurement']"),
      'Old soft-404 fallback still exists in topics/[slug].astro!'
    );

    // Must set Astro.response.status = 404 when topic is null
    assert.ok(
      topicPageContent.includes('Astro.response.status = 404'),
      'Missing Astro.response.status = 404 in topics/[slug].astro'
    );

    // Must display Topic Not Found UI
    assert.ok(
      topicPageContent.includes('Topic Not Found'),
      'Missing 404 Topic Not Found UI in topics/[slug].astro'
    );
  });

  it('verifies Domain E exists as a first-class domain in topics/index.astro', async () => {
    const fs = await import('fs');
    const indexContent = fs.readFileSync('src/pages/topics/index.astro', 'utf-8');

    assert.ok(
      indexContent.includes('Domain E — Documentation and Reporting'),
      'Domain E is missing from topics/index.astro!'
    );
    assert.ok(
      indexContent.includes('objective-session-notes'),
      'objective-session-notes is missing from topics/index.astro!'
    );
    assert.ok(
      indexContent.includes('incident-reporting'),
      'incident-reporting is missing from topics/index.astro!'
    );
    assert.ok(
      !indexContent.includes('Task List 2nd Edition Directory'),
      'Outdated Task List 2nd Edition Directory header found in topics/index.astro!'
    );
  });
});
