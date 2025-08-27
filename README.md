# Enviro-Shade

Ever accidentally push to production because you lost track of which environment you were in? We've all been there (or close to it). Enviro-Shade is your safety net, making it visually impossible to mistake your environments.

A browser extension for developers that adds a prominent, customizable banner and watermark to web pages, making it easy to identify which environment (e.g., `LOCAL`, `QA`, `PROD`) you are currently on.

## Features

- **Visual Environment Indicators:** Displays a highly visible color chip and a diagonal watermark on pages that match your configured rules.
- **Severity Levels:** Adjust the prominence of the overlay (subtle for `LOCAL`, strong for `PROD`) with `low`, `medium`, and `high` severity settings.
- **Toolbar Badge:** Shows a compact environment label in the browser's toolbar for quick identification.
- **Fully Customizable:** Configure URL patterns (with glob support), labels, colors, and severity to match your team's workflow.
- **Smart Defaults:** Comes pre-configured with common patterns for `localhost`, `127.0.0.1`, and other typical development environments.
- **Live Preview:** A powerful options page that lets you preview your rules and test URL matching in real-time.
- **Easy Configuration:** Add new rules manually, or create them directly from your currently open tabs.
- **Cross-Browser Support:** Works on both Chrome and Firefox.

## Installation

You can install the extension from the official web stores:

- **Chrome:** ~~[Link to Chrome Web Store](https://github.com/nkoeppe/Enviro-Shade)~~ _(Chrome users can install manually using the instructions below)_
- **Firefox:** [Link to Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/enviro-shade/)

### Manual Installation (for development)

1. Download the extension:
   - Clone this repository: `git clone https://github.com/nkoeppe/Enviro-Shade.git`
   - Or download the latest release as a ZIP file from the [releases page](https://github.com/nkoeppe/Enviro-Shade/releases)
2. **For Chrome:**
    - Open Chrome and navigate to `chrome://extensions`.
    - Enable "Developer mode".
    - Click "Load unpacked" and select the cloned repository folder.
3. **For Firefox:**
    - Open Firefox and navigate to `about:debugging`.
    - Click "This Firefox" and then "Load Temporary Add-on...".
    - Select the `manifest.json` file from the cloned repository.

## Configuration

1. Click the extension icon in your browser's toolbar to open the options page.
2. Here you can:
    - **Add a new rule:** Click the "Add" button.
    - **Add from a tab:** Click "Add from open tabs" to create a rule based on a currently open page.
    - **Edit a rule:** Change the pattern, label, color, or severity directly in the table.
    - **Re-order rules:** Drag and drop rules to change their priority. The first matching rule from the top down is applied.
    - **Test URLs:** Use the "Preview & match checker" to see which rule a specific URL will match.

## Development

This project is built with plain JavaScript, CSS, and HTML. No build step is required.

- **Code Structure:**
  - `manifest.json`: The extension's manifest file.
  - `background.js`: The service worker for handling all background tasks. It includes rule evaluation, badge updates, storage management, and default rule definitions.
  - `content.js`: The script injected into pages to display the overlay.
  - `options.html`/`options.js`/`options.css`: The options page UI and logic.

## Privacy

This extension is designed with your privacy in mind.

- It runs entirely on your local machine.
- It does not collect or transmit any browsing data or personal information to any external server.
- All your configuration rules are stored locally on your computer using the browser's sync storage, which may sync them across your devices if you are logged into your browser account.
