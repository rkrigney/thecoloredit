/**
 * Visual regression test script for The Color Edit
 * Takes screenshots at various viewports and tests the auth modal
 *
 * Run with: npm run test:screenshots
 */

import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = join(__dirname, 'screenshots');
const BASE_URL = 'https://rkrigney.github.io/thecoloredit';

const viewports = {
  mobile: { width: 375, height: 667 },      // iPhone SE
  mobileLarge: { width: 414, height: 896 }, // iPhone 11 Pro Max
  tablet: { width: 768, height: 1024 },     // iPad
  desktop: { width: 1280, height: 800 },    // Laptop
};

async function runTests() {
  // Ensure screenshot directory exists
  await mkdir(SCREENSHOT_DIR, { recursive: true });

  console.log('🎨 Starting The Color Edit visual tests...\n');
  console.log(`📍 Testing: ${BASE_URL}\n`);

  const browser = await chromium.launch({ headless: true });

  try {
    for (const [name, viewport] of Object.entries(viewports)) {
      console.log(`\n📱 Testing ${name} (${viewport.width}x${viewport.height})...`);

      const context = await browser.newContext({
        viewport,
        deviceScaleFactor: 2, // Retina screenshots
      });
      const page = await context.newPage();

      // Test 1: Home page
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500); // Let animations settle
      await page.screenshot({
        path: join(SCREENSHOT_DIR, `${name}-01-home.png`),
        fullPage: false
      });
      console.log(`  ✓ Home page screenshot saved`);

      // Test 2: Click Sign In and capture modal
      const signInButton = await page.$('button:has-text("Sign in"), button:has-text("Sign In")');
      if (signInButton) {
        await signInButton.click();
        await page.waitForTimeout(300); // Wait for modal animation
        await page.screenshot({
          path: join(SCREENSHOT_DIR, `${name}-02-auth-modal.png`),
          fullPage: false
        });
        console.log(`  ✓ Auth modal screenshot saved`);

        // Close modal by clicking backdrop or X button
        const closeButton = await page.$('button[aria-label="Close"], .fixed.inset-0 > div > div > button');
        if (closeButton) {
          await closeButton.click();
          await page.waitForTimeout(200);
        } else {
          // Click backdrop
          await page.click('.fixed.inset-0', { position: { x: 10, y: 10 } });
          await page.waitForTimeout(200);
        }
      } else {
        console.log(`  ⚠ Sign in button not found`);
      }

      // Test 3: Navigate to a sample flow (if possible)
      // Try clicking "Get Started" or similar
      const getStartedButton = await page.$('button:has-text("Get Started"), a:has-text("Get Started")');
      if (getStartedButton) {
        await getStartedButton.click();
        await page.waitForTimeout(500);
        await page.screenshot({
          path: join(SCREENSHOT_DIR, `${name}-03-setup.png`),
          fullPage: false
        });
        console.log(`  ✓ Setup page screenshot saved`);
      }

      await context.close();
    }

    console.log(`\n\n✅ All screenshots saved to: ${SCREENSHOT_DIR}`);
    console.log('\nScreenshot files:');

    // List the files
    const { readdir } = await import('fs/promises');
    const files = await readdir(SCREENSHOT_DIR);
    files.sort().forEach(f => console.log(`  - ${f}`));

  } finally {
    await browser.close();
  }
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
