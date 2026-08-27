import { CMSService } from '../lib/services/cms';

export async function testCMSAndSEO(): Promise<boolean> {
  console.log('🧪 Testing CMS, SEO, Branding & Notification Engine (Phase 6)...');

  // ==========================================
  // TEST 1: Published Articles Retrieval & Slug Lookup
  // ==========================================
  console.log('   - Test 1: Testing Published Articles retrieval and slug resolution...');
  const articles = CMSService.getPublishedArticles();
  if (articles.length === 0) {
    console.error('❌ No published articles found.');
    return false;
  }

  const sampleSlug = articles[0].slug;
  const retrieved = CMSService.getArticleBySlug(sampleSlug);
  if (!retrieved || retrieved.id !== articles[0].id) {
    console.error('❌ Failed to retrieve article by slug:', sampleSlug);
    return false;
  }
  console.log(`   - Retrieved Article: "${retrieved.title}" (Slug: ${retrieved.slug})`);

  // ==========================================
  // TEST 2: Dynamic Sitemap XML Generation
  // ==========================================
  console.log('   - Test 2: Testing Dynamic Sitemap XML Generation...');
  const sitemapXml = CMSService.generateSitemapXml('https://rbtprep.internal');

  if (!sitemapXml.includes('<urlset') || !sitemapXml.includes('/practice-questions') || !sitemapXml.includes('/study-guides/')) {
    console.error('❌ Sitemap XML generation failed or missing public routes:', sitemapXml);
    return false;
  }
  if (sitemapXml.includes('/admin') || sitemapXml.includes('/api/')) {
    console.error('❌ Sitemap XML accidentally exposed private /admin or /api routes!');
    return false;
  }
  console.log('   - Sitemap XML validated: Contains published public routes, excludes admin/api.');

  // ==========================================
  // TEST 3: Broadcast Notifications
  // ==========================================
  console.log('   - Test 3: Testing Active Broadcast Notifications...');
  const activeNotifs = CMSService.getActiveNotifications();
  if (activeNotifs.length === 0) {
    console.error('❌ No active notifications retrieved.');
    return false;
  }
  console.log(`   - Active Notification: "${activeNotifs[0].title}" (Type: ${activeNotifs[0].type})`);

  // ==========================================
  // TEST 4: Site Branding Dynamic Update
  // ==========================================
  console.log('   - Test 4: Testing Dynamic Branding Configuration Updates...');
  const originalBranding = CMSService.getBranding();
  const updated = CMSService.updateBranding({ brandTagline: 'Updated Diagnostic Test Engine' });

  if (updated.brandTagline !== 'Updated Diagnostic Test Engine') {
    console.error('❌ Branding update failed.');
    return false;
  }
  // Restore
  CMSService.updateBranding({ brandTagline: originalBranding.brandTagline });
  console.log('   - Branding configuration successfully read and updated.');

  console.log('✅ CMS, SEO, Branding & Notification Engine Tests Passed.');
  return true;
}
