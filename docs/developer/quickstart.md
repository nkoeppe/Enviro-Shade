# Developer Quickstart Guide

Get up and running with Enviro-Shade development in minutes.

## Prerequisites

- **Node.js** (for development tools, optional)
- **Git** for version control
- **Chrome** or **Firefox** for testing
- **Code Editor** (VS Code recommended)

## Quick Setup

### 1. Clone & Setup
```bash
# Clone the repository
git clone https://github.com/nkoeppe/Enviro-Shade.git
cd Enviro-Shade

# No build step required - plain JavaScript!
```

### 2. Install in Browser

#### Chrome Development
```bash
# 1. Open chrome://extensions/
# 2. Enable "Developer mode" (top-right toggle)
# 3. Click "Load unpacked"
# 4. Select the src/ folder (contains manifest.json)
```

#### Firefox Development
```bash
# 1. Open about:debugging
# 2. Click "This Firefox"  
# 3. Click "Load Temporary Add-on"
# 4. Select manifest.json from the src/ folder
```

### 3. Test the Extension
1. Open any website (e.g., `http://localhost:3000`)
2. You should see the environment overlay
3. Click the extension icon to open options
4. Try adding/editing rules

## Project Structure

```
Enviro-Shade/
├── src/                    # Extension source code
│   ├── manifest.json      # Extension manifest
│   ├── background.js      # Service worker (main logic)
│   ├── content.js         # Injected overlay script  
│   ├── options.html       # Settings page
│   ├── options.js         # Settings logic
│   ├── options.css        # Settings styles
│   └── icons/             # Extension icons
├── scripts/               # Development & automation tools
│   ├── screenshots-chrome.js  # Chrome screenshot automation
│   ├── screenshots.js     # Firefox screenshot automation
│   └── demo/              # Demo applications for testing
├── docs/                  # Documentation
│   ├── developer/         # Dev guides
│   ├── user/             # User guides
│   ├── automation/       # Screenshot automation docs
│   └── assets/           # Generated screenshots & assets
├── package.json          # NPM scripts & dependencies
└── .github/              # GitHub workflows
    └── workflows/
        └── release.yml   # Auto-release workflow
```

## Key Files

### `src/manifest.json` 
Extension configuration and permissions
```json
{
  "version": "1.4.2",           // Auto-managed by workflow
  "permissions": ["tabs", "storage", "webNavigation"],
  "browser_specific_settings": {
    "gecko": {
      "id": "env-color-banner@fancyguysdev.de"  // Firefox ID
    }
  }
}
```

### `src/background.js`
- Rule evaluation logic
- Default environment patterns  
- Badge updates
- Storage management
- URL pattern matching (glob support)

### `src/content.js`
- DOM manipulation for overlays
- Watermark and banner rendering
- Dynamic style injection

### `src/options.js`
- Settings UI logic
- Rule management (CRUD)
- Live preview functionality
- URL testing/matching

## Development Workflow

### 1. Make Changes
Edit any file in `src/` directly - no build process needed!

### 2. Reload Extension
- **Chrome**: Go to `chrome://extensions/` → Click reload button
- **Firefox**: Go to `about:debugging` → Click reload

### 3. Test Changes
- Refresh web pages to see content script changes
- Open options page to test UI changes
- Check browser console for errors

### 4. Debug Issues

**Extension Console:**
```bash
# Chrome: chrome://extensions/ → "Inspect views: background page"
# Firefox: about:debugging → "Inspect" next to extension
```

**Content Script Console:**
```bash
# Open browser DevTools on any page
# Look for console logs from content.js
```

**Common Debug Commands:**
```javascript
// In background.js console
chrome.storage.sync.get(null, console.log)  // View all rules

// In content.js console  
console.log('Enviro-Shade overlay active')  // Check if injected
```

## Adding Features

### New Rule Types
1. **Edit `src/background.js`**: Add pattern matching logic
2. **Edit `src/options.js`**: Add UI controls for new rule type
3. **Test**: Create rules and verify they work

### New Overlay Styles
1. **Edit `src/content.js`**: Modify `createOverlay()` function
2. **Add CSS**: Update inline styles or add new classes  
3. **Test**: Verify on different websites

### New Configuration Options
1. **Edit `src/options.html`**: Add form controls
2. **Edit `src/options.js`**: Handle save/load logic
3. **Edit `src/background.js`**: Use new options in rule evaluation

## Testing

### Automated Screenshots
Generate screenshots for documentation and testing:

```bash
# Install dependencies
npm install

# Start demo applications
npm run demo:start

# Generate Chrome Web Store ready screenshots
npm run screenshots:chrome

# Generate Firefox screenshots
npm run screenshots:firefox

# Stop demo applications
npm run demo:stop
```

See [Screenshot Automation Documentation](../automation/screenshot-automation.md) for detailed information.

### Manual Testing
- **Multiple Environments**: Test localhost, staging, production URLs
- **Different Browsers**: Chrome, Firefox, Edge  
- **Different Rule Types**: Glob patterns, exact matches, regex
- **Edge Cases**: Long URLs, special characters, Unicode

### Test URLs
```bash
# Demo applications (start with npm run demo:start)
http://localhost:3000        # Production dashboard demo
http://localhost:3001        # QA/Staging environment demo

# Other test cases
https://staging.example.com  # Create custom staging rule  
https://app.production.com   # Create custom PROD rule
https://qa-env.company.com   # Create custom QA rule
```

### Browser Compatibility
```javascript
// Test browser-specific features
const isFirefox = typeof browser !== 'undefined'
const api = isFirefox ? browser : chrome

// Use consistent API calls
api.storage.sync.get(...)
api.tabs.query(...)
```

## Common Issues

### "Extension doesn't load"
- ✅ Check `src/manifest.json` syntax
- ✅ Verify all file paths exist  
- ✅ Check browser console for errors

### "Overlay not showing"
- ✅ Verify rules match current URL
- ✅ Check if content script injected
- ✅ Look for JavaScript errors in page console

### "Options page broken"  
- ✅ Check `src/options.js` for syntax errors
- ✅ Verify HTML form elements exist
- ✅ Test storage permissions

### "Changes not visible"
- ✅ Reload extension after code changes
- ✅ Refresh web pages to update content scripts  
- ✅ Clear browser cache if needed

## Release Process

Our automated workflow handles releases:

1. **Push to main** → Triggers release workflow
2. **Version management** → Auto-increments or uses manifest version  
3. **GitHub release** → Creates release with changelog
4. **Firefox publishing** → Submits to Mozilla Add-ons Store

See [Automation Setup](automation-setup.md) for configuration details.

## Getting Help

- **GitHub Issues**: Report bugs or request features
- **Documentation**: Check `docs/` folder for detailed guides
- **Code Review**: Submit PRs for community feedback
- **Browser DevTools**: Use built-in debugging tools

## Next Steps

1. **Read the code**: Start with `src/background.js` and `src/options.js`
2. **Create test rules**: Set up your own environment patterns
3. **Try modifications**: Change colors, add new features
4. **Submit PRs**: Contribute improvements back to the project

Happy coding! 🚀