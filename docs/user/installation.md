# Installation Guide

Install Enviro-Shade to start visually identifying your development environments.

## Official Store Installation (Recommended)

### Firefox
[![Firefox Add-ons](https://img.shields.io/amo/v/enviro-shade?label=Firefox%20Add-ons&logo=firefox)](https://addons.mozilla.org/en-US/firefox/addon/enviro-shade/)

1. Visit the [Firefox Add-ons Store](https://addons.mozilla.org/en-US/firefox/addon/enviro-shade/)
2. Click **"Add to Firefox"**
3. Confirm the installation when prompted
4. The extension icon will appear in your toolbar

### Chrome (Coming Soon)
Chrome Web Store listing is in progress. For now, use manual installation below.

## Manual Installation

Perfect for trying the latest version or development builds.

### Download Options

**Option 1: Latest Release (Stable)**
1. Go to [GitHub Releases](https://github.com/nkoeppe/Enviro-Shade/releases)
2. Download the latest `EnviroShade_X.X.X.zip` file
3. Extract the ZIP file to a folder

**Option 2: Development Version**
1. Clone or download from [GitHub](https://github.com/nkoeppe/Enviro-Shade)
2. Extract if downloaded as ZIP

### Browser Installation

#### Chrome/Edge/Brave
1. **Open Extensions Page**
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`

2. **Enable Developer Mode**
   - Toggle "Developer mode" (top-right corner)

3. **Load Extension**
   - Click "Load unpacked"
   - Select the extracted Enviro-Shade folder
   - Extension should now appear in your toolbar

#### Chrome Auto-Load (Windows)
To automatically load the extension on Chrome startup:

1. **Find Chrome Shortcut**
   - Navigate to `C:\ProgramData\Microsoft\Windows\Start Menu\Programs`
   - Right-click "Google Chrome" → Properties

2. **Modify Target**
   - In the "Target" field, append:
   ```
   --load-extension="C:\Path\To\EnviroShade"
   ```
   - Full example:
   ```
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --load-extension="C:\Users\YourName\Downloads\EnviroShade"
   ```

3. **Apply Changes**
   - Click OK to save
   - Chrome will now auto-load the extension

#### Firefox
1. **Open Debugging Page**
   - Navigate to `about:debugging`
   - Click "This Firefox"

2. **Load Extension**
   - Click "Load Temporary Add-on..."
   - Select `manifest.json` from the Enviro-Shade folder
   - Extension will be active until Firefox restarts

> **Note**: Firefox temporary add-ons are removed on browser restart. For permanent installation, use the Firefox Add-ons Store or sign the extension.

## First Time Setup

### 1. Verify Installation
After installing, you should see:
- 🎨 Extension icon in your browser toolbar
- Default rules already configured for `localhost` and `127.0.0.1`

### 2. Test the Extension
1. Open `http://localhost:3000` or any local development server
2. You should see a **green overlay** indicating "LOCAL" environment
3. The browser toolbar badge should show "LOCAL"

### 3. Open Configuration
1. Click the Enviro-Shade icon in your toolbar
2. This opens the configuration page where you can:
   - View existing rules
   - Add new environment rules
   - Customize colors and labels
   - Test URL patterns

## Troubleshooting Installation

### Extension Not Loading
**Chrome/Edge:**
- ✅ Ensure Developer mode is enabled
- ✅ Check for error messages in `chrome://extensions/`
- ✅ Verify you selected the correct folder (containing `manifest.json`)

**Firefox:**
- ✅ Make sure you selected `manifest.json` file specifically
- ✅ Check `about:debugging` for error messages
- ✅ Verify Firefox version compatibility (109.0+)

### No Overlay Appearing
- ✅ Check if website URL matches any rules (open options to verify)
- ✅ Ensure content scripts are allowed on the website
- ✅ Try refreshing the page after installation
- ✅ Check browser console for JavaScript errors

### Toolbar Icon Missing
- ✅ Check if extension is enabled in extensions page
- ✅ Look in browser's extension overflow menu (puzzle piece icon)
- ✅ Pin the extension to toolbar for easy access

### Permissions Issues
The extension requires these permissions:
- **Tabs**: To detect when you navigate to different URLs
- **Storage**: To save your configuration rules
- **webNavigation**: To update the toolbar badge
- **Host permissions**: To inject overlays on websites

These are necessary for the extension to function properly.

## Updating

### Automatic Updates
- **Firefox Add-ons**: Updates automatically through Firefox
- **Manual installations**: Need manual updating

### Manual Updates
1. Download the new release ZIP file
2. Extract to the same folder (overwrite existing files)
3. **Chrome**: Go to `chrome://extensions/` → Click reload button
4. **Firefox**: Reload temporary add-on in `about:debugging`

## Uninstallation

### Store Installations
- **Firefox**: Right-click extension icon → Remove Extension

### Manual Installations
- **Chrome**: Go to `chrome://extensions/` → Click "Remove"
- **Firefox**: Go to `about:debugging` → Click "Remove"

Your configuration data will be automatically cleaned up.

## Privacy & Security

Enviro-Shade is designed with privacy in mind:
- ✅ **No data collection**: Nothing is sent to external servers
- ✅ **Local storage only**: All rules stored in your browser
- ✅ **No tracking**: No analytics or telemetry
- ✅ **Open source**: Full code available for review

## Getting Help

- 📖 **Documentation**: Check other files in `docs/`
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/nkoeppe/Enviro-Shade/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/nkoeppe/Enviro-Shade/discussions)
- 📧 **Direct Contact**: Check repository for contact information

## Next Steps

After installation:
1. **Read**: [User Configuration Guide](configuration.md)
2. **Customize**: Set up rules for your specific environments
3. **Share**: Help your team stay safe with environment awareness!