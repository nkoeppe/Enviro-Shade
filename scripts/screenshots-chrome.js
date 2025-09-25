const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function takeScreenshotsChrome() {
  // Automated screenshot capture for Chrome extension demo
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, '../docs/assets/screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('🚀 Starting Chrome with Enviro-Shade extension loaded...');
  
  // Load extension from src directory
  const pathToExtension = path.join(__dirname, '../src');
  
  const context = await chromium.launchPersistentContext(path.join(__dirname, '../chrome-profile'), {
    channel: 'chromium', // Use Chromium instead of Chrome
    headless: false,
    viewport: { width: 1280, height: 800 }, // Chrome Web Store requirement: 1280x800
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--window-size=1280,800', // Force exact window size
      '--start-maximized=false', // Don't maximize
    ]
  });

  try {
    console.log('⏱️ Waiting for service worker and extension to load...');
    
    // Wait for service worker to be ready
    let serviceWorker = context.serviceWorkers()[0];
    if (!serviceWorker) {
      serviceWorker = await context.waitForEvent('serviceworker');
    }
    
    // Get extension ID from service worker URL
    const extensionId = serviceWorker.url().split('/')[2];
    console.log('🆔 Extension ID:', extensionId);
    
    // Create a new page
    const page = await context.newPage();
    
    // Step 1: Navigate to extension options page DIRECTLY
    console.log('🔧 Opening Chrome extension options page...');
    const optionsUrl = `chrome-extension://${extensionId}/options.html`;
    console.log('🌐 Options URL:', optionsUrl);
    
    await page.goto(optionsUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log('✅ Successfully opened extension options page!');
    console.log('📍 Current URL:', page.url());
    console.log('📄 Page title:', await page.title());
    
    // Step 2: Clear existing rules and add our custom ones
    console.log('🗑️ Clearing existing rules and adding custom rules...');
    
    // Clear all rules first
    await page.evaluate(async () => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.sync.clear();
        console.log('🧹 Cleared Chrome storage');
      }
    });
    
    await page.waitForTimeout(500);
    
    // Add our custom rules one by one with pauses
    const customRules = [
      {
        id: 'prod-chrome',
        pattern: 'http://localhost:3000/*',
        label: 'PRO',
        color: '#dc2626',
        severity: 'high',
        enabled: true
      },
      {
        id: 'stage-chrome',
        pattern: 'http://localhost:3001/*',
        label: 'STAGING',
        color: '#d97706',
        severity: 'medium',
        enabled: true
      },
      {
        id: 'prod-demo',
        pattern: '*production*',
        label: 'PROD',
        color: '#dc2626',
        severity: 'high',
        enabled: true
      },
      {
        id: 'staging-demo',
        pattern: '*staging*',
        label: 'STAGE',
        color: '#f59e0b',
        severity: 'medium',
        enabled: true
      },
      {
        id: 'qa-demo',
        pattern: '*qa*',
        label: 'QA',
        color: '#3b82f6',
        severity: 'low',
        enabled: true
      }
    ];

    console.log('➕ Adding custom rules with Chrome extension API...');
    
    for (let i = 0; i < customRules.length; i++) {
      const rule = customRules[i];
      console.log(`📝 Adding rule ${i+1}/5: ${rule.label} (${rule.pattern})`);
      
      await page.evaluate(async (rules) => {
        if (typeof chrome !== 'undefined' && chrome.runtime) {
          try {
            await chrome.runtime.sendMessage({
              type: 'ecb:saveRules',
              payload: rules
            });
            console.log('✅ Rules saved via Chrome extension API');
          } catch (e) {
            console.log('❌ Chrome API failed, using direct storage');
            if (chrome.storage && chrome.storage.sync) {
              await chrome.storage.sync.set({ rules: rules, blocklist: [] });
            }
          }
        }
      }, customRules.slice(0, i + 1));
      
      // Visual pause
      await page.waitForTimeout(200);
    }

    console.log('✅ All custom rules added!');
    await page.waitForTimeout(2000);
    
    // Step 3: Take screenshot of configured options page (Chrome Web Store format)
    console.log('📸 Taking Chrome Web Store formatted screenshot of options page (1280x800)...');
    
    // Ensure exact viewport size for Chrome Web Store
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({
      path: path.join(screenshotsDir, 'webstore-options-1280x800.png'),
      fullPage: false, // Don't use fullPage - use exact viewport
      clip: { x: 0, y: 0, width: 1280, height: 800 } // Exact Chrome Web Store dimensions
    });
    
    // Step 4: Test the rules on demo applications (Chrome Web Store format)
    console.log('🔴 Testing Production app with Chrome Web Store formatting...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(4000);
    
    const prodBadge = await page.evaluate(() => {
      const chip = document.getElementById('ecb-chip');
      return chip ? chip.textContent : 'No chip found';
    });
    console.log(`🏷️ Production badge shows: "${prodBadge}"`);
    
    await page.screenshot({
      path: path.join(screenshotsDir, 'webstore-production-1280x800.png'),
      fullPage: false,
      clip: { x: 0, y: 0, width: 1280, height: 800 } // Chrome Web Store exact dimensions
    });
    
    console.log('🟡 Testing Staging app with Chrome Web Store formatting...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(4000);
    
    const stagingBadge = await page.evaluate(() => {
      const chip = document.getElementById('ecb-chip');
      return chip ? chip.textContent : 'No chip found';
    });
    console.log(`🏷️ Staging badge shows: "${stagingBadge}"`);
    
    await page.screenshot({
      path: path.join(screenshotsDir, 'webstore-staging-1280x800.png'),
      fullPage: false,
      clip: { x: 0, y: 0, width: 1280, height: 800 } // Chrome Web Store exact dimensions
    });
    
    console.log('✅ Chrome Web Store screenshots completed!');
    console.log('📁 Chrome Web Store ready files (1280x800):');
    console.log('  - webstore-options-1280x800.png (Extension options page)');
    console.log('  - webstore-production-1280x800.png (PRO environment demo)'); 
    console.log('  - webstore-staging-1280x800.png (STAGING environment demo)');
    console.log('');
    console.log('🏪 These screenshots are formatted exactly for Chrome Web Store submission!');
    
    if (prodBadge.includes('PRO') || stagingBadge.includes('STAGING')) {
      console.log('🎉 SUCCESS! Extension rules are working correctly!');
    } else {
      console.log('⚠️ Rules may not be working - badges show:', prodBadge, stagingBadge);
    }

  } catch (error) {
    console.error('❌ Error taking Chrome screenshots:', error);
  }

  await context.close();
}

// Check if demo apps are running
async function checkDemoApps() {
  const http = require('http');
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(3000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  console.log('🎬 Enviro-Shade Chrome Extension Screenshot Automation');
  console.log('====================================================');
  
  const demoAppsReady = await checkDemoApps();
  if (!demoAppsReady) {
    console.log('⚠️ Demo apps not running. Please start them first: cd scripts/demo && ./start.sh');
    process.exit(1);
  }

  await takeScreenshotsChrome();
}

main().catch(console.error);