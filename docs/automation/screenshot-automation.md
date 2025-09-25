# Screenshot Automation

This document explains how to automatically generate screenshots for the Enviro-Shade browser extension using Playwright automation.

## Overview

We have two automated screenshot systems:

1. **Chrome Screenshots** (`scripts/screenshots-chrome.js`) - Full automation with custom rule manipulation
2. **Firefox Screenshots** (`scripts/screenshots.js`) - Basic screenshots with default rules

## Prerequisites

### 1. Install Dependencies

```bash
npm install playwright playwright-webextext
```

### 2. Start Demo Applications

```bash
cd scripts/demo
./start.sh
```

This starts two Docker containers:
- `localhost:3000` - Production-style dashboard (blue gradient theme)
- `localhost:3001` - QA/Testing environment (orange/yellow theme)

## Chrome Screenshot Automation

### Features
- Full Chrome extension loading via `launchPersistentContext`
- Custom rule manipulation through Chrome extension APIs
- Chrome Web Store formatted screenshots (1280x800)
- Automated options page configuration

### Usage

```bash
node scripts/screenshots-chrome.js
```

### What it does:

1. **Loads Extension**: Uses Chromium with persistent context and loads the extension
2. **Configures Rules**: Automatically clears default rules and adds custom ones:
   - `PRO` label for `localhost:3000/*` (red, high severity)
   - `STAGING` label for `localhost:3001/*` (orange, medium severity)
   - Additional demo rules for variety
3. **Takes Screenshots**:
   - `docs/assets/screenshots/webstore-options-1280x800.png` - Extension options page
   - `docs/assets/screenshots/webstore-production-1280x800.png` - Production app with PRO badge
   - `docs/assets/screenshots/webstore-staging-1280x800.png` - Staging app with STAGING badge

### Chrome Web Store Requirements
All screenshots are exactly **1280x800 pixels** as required by Chrome Web Store:
- No padding or borders
- Square corners
- Exact viewport clipping

## Firefox Screenshot Automation

### Features
- Basic Firefox extension loading via `playwright-webextext`
- Uses default extension rules (no manipulation)
- Standard screenshot dimensions

### Usage

```bash
node scripts/screenshots.js
```

### What it does:

1. **Loads Extension**: Uses Firefox with `playwright-webextext` wrapper
2. **Uses Default Rules**: No rule manipulation (Firefox API limitations)
3. **Takes Screenshots**:
   - `docs/assets/screenshots/firefox-production-app.png` - Production app with default rules
   - `docs/assets/screenshots/firefox-staging-app.png` - Staging app with default rules

### Limitations
Firefox automation has known limitations:
- Cannot access `about:` pages from Playwright
- Extension storage manipulation is unreliable
- Rule configuration must be done manually

## Demo Applications

### Production App (`localhost:3000`)
- **Theme**: Professional dashboard with blue gradient background
- **Content**: System metrics, server status, revenue data, security alerts
- **Purpose**: Demonstrates high-severity production environment warnings

### QA/Staging App (`localhost:3001`)
- **Theme**: Testing environment with orange/yellow gradient
- **Content**: Test suites, coverage metrics, debug console, environment status
- **Purpose**: Demonstrates medium-severity staging/QA warnings

## Troubleshooting

### Demo Apps Not Running
```bash
cd scripts/demo
./start.sh
```

### Chrome Profile Issues
Delete the Chrome profile and restart:
```bash
rm -rf chrome-profile/
node scripts/screenshots-chrome.js
```

### Firefox Extension Not Loading
Check that `playwright-webextext` is installed:
```bash
npm install playwright-webextext
```

### Screenshots Not Generated
1. Ensure demo apps are accessible at `localhost:3000` and `localhost:3001`
2. Check that the `docs/assets/screenshots/` directory exists
3. Verify no other processes are using the ports

## File Structure

```
scripts/
├── screenshots-chrome.js     # Chrome automation (full featured)
├── screenshots.js            # Firefox automation (basic)
└── demo/                     # Demo applications
    ├── start.sh              # Start Docker containers
    ├── stop.sh               # Stop Docker containers
    ├── site1/                # Production dashboard
    └── site2/                # QA testing environment

docs/assets/screenshots/      # Generated screenshots
├── webstore-options-1280x800.png
├── webstore-production-1280x800.png
├── webstore-staging-1280x800.png
├── firefox-production-app.png
└── firefox-staging-app.png
```

## Integration with CI/CD

Screenshots can be automatically generated in your CI/CD pipeline:

```yaml
- name: Generate Screenshots
  run: |
    cd scripts/demo && ./start.sh
    sleep 10
    cd ../.. && npm run screenshots:chrome
    cd scripts/demo && ./stop.sh
```

This ensures documentation always has up-to-date screenshots reflecting the latest extension behavior.