/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (C) 2025 Nicolas Köppe
 */

const { firefox } = require('playwright');
const { withExtension } = require('playwright-webextext');
const path = require('path');
const fs = require('fs');

async function takeScreenshots() {
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, '../docs/assets/screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('🚀 Starting Firefox with Enviro-Shade extension loaded...');
  
  // Load extension from src directory (where manifest.json is located)  
  const browserTypeWithExtension = withExtension(firefox, path.join(__dirname, '../src'));
  
  // Use persistent context with fixed profile for extension access
  console.log('🔧 Using persistent context for extension access...');
  const context = await browserTypeWithExtension.launchPersistentContext(path.join(__dirname, '../firefox-profile'), {
    headless: false,
    viewport: { width: 1280, height: 800 },
    args: ['--width=1280', '--height=800']
  });

  const page = await context.newPage();
  
  // Try to get the extension UUID from persistent context
  console.log('🆔 Getting extension UUID...');
  let optionsOpened = false;
  
  // Try to access the extension directly with persistent context
  try {
    // Check if we can access extension pages in persistent context
    await page.goto('about:debugging#/runtime/this-firefox', { waitUntil: 'load', timeout: 5000 });
    console.log('✅ Accessed debugging page in persistent context');
    
    // Try to find the extension UUID
    const extensionInfo = await page.evaluate(() => {
      const text = document.body.textContent || '';
      // Look for our extension ID pattern
      const match = text.match(/([a-f0-9-]{36})/g);
      if (match) {
        console.log('🔍 Found UUIDs:', match);
        return match[0]; // Return first UUID found
      }
      return null;
    });
    
    if (extensionInfo) {
      console.log('🎯 Extension UUID:', extensionInfo);
      const optionsUrl = `moz-extension://${extensionInfo}/options.html`;
      console.log('🔗 Attempting to navigate to:', optionsUrl);
      
      await page.goto(optionsUrl, { waitUntil: 'networkidle' });
      console.log('✅ Successfully navigated to extension options!');
      optionsOpened = true;
    }
    
  } catch (e) {
    console.log('⚠️ Persistent context approach failed:', e.message);
  }

  console.log('📱 Taking screenshots of demo applications...');

  try {
    // Navigate to Production app with default rules
    console.log('🔴 Navigating to Production app (localhost:3000) with default rules...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000); // Give extension time to inject overlay
    
    // Check what's in the top right corner
    const prodBadge = await page.evaluate(() => {
      const chip = document.getElementById('ecb-chip');
      return chip ? chip.textContent : 'No chip found';
    });
    console.log(`🔍 Production badge shows: "${prodBadge}"`);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'firefox-production-app.png'),
      fullPage: false
    });

    // Navigate to Staging app  
    console.log('🟡 Navigating to Staging app (localhost:3001) with default rules...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000); // Give extension time to inject overlay
    
    const stagingBadge = await page.evaluate(() => {
      const chip = document.getElementById('ecb-chip');
      return chip ? chip.textContent : 'No chip found';
    });
    console.log(`🔍 Staging badge shows: "${stagingBadge}"`);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'firefox-staging-app.png'),
      fullPage: false
    });

    console.log('✅ Firefox screenshots completed!');
    console.log('📁 Files created:');
    console.log('  - firefox-production-app.png (Production app with default rules)');
    console.log('  - firefox-staging-app.png (Staging app with default rules)');

  } catch (error) {
    console.error('❌ Error taking screenshots:', error);
    console.log('💡 Make sure demo apps are running: cd scripts/demo && ./start.sh');
  }

  await context.close();
}

// Check if demo apps are running
async function checkDemoApps() {
  console.log('🔍 Checking if demo apps are running...');
  
  try {
    const fetch = require('http').get;
    
    const checkUrl = (url) => {
      return new Promise((resolve) => {
        const req = require('http').get(url, (res) => {
          resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(3000, () => {
          req.destroy();
          resolve(false);
        });
      });
    };

    const app1Running = await checkUrl('http://localhost:3000');
    const app2Running = await checkUrl('http://localhost:3001');

    if (!app1Running || !app2Running) {
      console.log('⚠️  Demo apps not running. Please start them first:');
      console.log('   cd scripts/demo && ./start.sh');
      return false;
    }

    console.log('✅ Demo apps are running');
    return true;
  } catch (error) {
    console.log('⚠️  Could not check demo apps. Make sure they are running:');
    console.log('   cd demo && ./start.sh');
    return false;
  }
}

async function main() {
  console.log('🎬 Enviro-Shade Screenshot Automation');
  console.log('=====================================');
  
  const demoAppsReady = await checkDemoApps();
  if (!demoAppsReady) {
    process.exit(1);
  }

  await takeScreenshots();
}

main().catch(console.error);