# Automation & Publishing Setup

This guide covers setting up automated releases and publishing for Enviro-Shade development.

## GitHub Actions Workflow

Our repository includes an automated workflow that:

- ✅ **Runs on**: Push to main branch + manual dispatch with force publish option
- ✅ **Smart versioning**: Compares `manifest.json` with latest GitHub release
- ✅ **Auto-increment**: Bumps version if needed or uses manifest version
- ✅ **src/ change detection**: Only publishes when extension source code changes
- ✅ **Creates releases**: With auto-generated changelog and installation notes
- ✅ **Publishes to Chrome**: Automatic submission to Chrome Web Store (PlasmoHQ/bpp)
- ✅ **Publishes to Firefox**: Automatic submission to Mozilla Add-ons Store
- ✅ **Fail-safe ordering**: Publishes to stores first, then creates GitHub release

## Store Publishing Setup

### Chrome Web Store Publishing (PlasmoHQ/bpp)

We use **PlasmoHQ/bpp v3** for Chrome Web Store publishing - a modern, reliable action designed specifically for browser extensions.

#### Prerequisites
1. **Chrome Developer Account**: Pay the $5 developer registration fee
2. **Existing Extension**: Must be manually published once to get Extension ID
3. **Google Cloud Project**: With Chrome Web Store API enabled
4. **OAuth2 Credentials**: For automated publishing

#### Setup Instructions

##### 1. Initial Manual Publication
**You must publish your extension manually the first time:**

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Click **"Add new item"**
3. Upload your ZIP file
4. Complete store listing (description, screenshots, etc.)
5. Submit for review and wait for approval
6. **Copy the Extension ID** (32-character string from the dashboard)

##### 2. Google Cloud Project Setup (Official Chrome Tutorial)

**Follow the official Chrome Web Store API tutorial**: https://developer.chrome.com/docs/webstore/using-api

1. **Prerequisites**:
   - Enable 2-step verification for your Google Account
   - Complete Store listing and Privacy tabs in Developer Dashboard

2. **Create/Select Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create or select a project
   - Search for and enable **"Chrome Web Store API"**

##### 3. OAuth Consent Screen Configuration

1. Go to OAuth consent screen in Google Cloud Console
2. Select **"External"** consent type
3. Fill required fields:
   - **App name**: "Chrome Webstore Upload" 
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Add your email as a **test user**
5. **Publish the app** when ready

##### 4. Create OAuth Client (Web Application)

1. Navigate to **"Credentials"** in Google Cloud Console
2. Click **"Create OAuth client ID"**
3. Choose **"Web application"** type (NOT Chrome Extension)
4. Add redirect URI: `https://developers.google.com/oauthplayground`
5. Download client ID and client secret

##### 5. Generate Refresh Token (OAuth Playground Method)

**Use Google's OAuth Playground** (recommended by Chrome team):

1. **Open OAuth Playground**: https://developers.google.com/oauthplayground
2. **Configure OAuth client**:
   - Click gear icon (⚙️) in top right
   - Check "Use your own OAuth credentials"
   - Enter your **Client ID** and **Client Secret**
3. **Add Chrome Web Store scope**:
   - In left panel, manually add: `https://www.googleapis.com/auth/chromewebstore`
4. **Authorize APIs**: Click "Authorize APIs" button
5. **Login and authorize** your app
6. **Exchange code for tokens**: Click "Exchange authorization code for tokens"
7. **Copy the refresh token** from the response

##### 6. Configure GitHub Secrets

In your repository (**Settings → Secrets and variables → Actions**):

**Required Secrets:**
```
CHROME_CLIENT_ID        = your-web-application-client-id
CHROME_CLIENT_SECRET    = your-web-application-client-secret  
CHROME_REFRESH_TOKEN    = your-oauth-playground-refresh-token
CHROME_EXTENSION_ID     = your-chrome-extension-id
```

**Repository Variables:**
```
PUBLISH_CHROME = true    (to enable Chrome publishing)
```

##### 7. Workflow Behavior
- **PlasmoHQ/bpp v3**: Modern action with better error handling
- **OAuth Authentication**: Secure, token-based publishing using official Chrome API
- **Web Application OAuth**: Uses Google's recommended OAuth flow for server applications
- **Automatic Upload**: Submits extension for review via Chrome Web Store API
- **Review Process**: Google reviews typically take 1-3 days
- **Auto-Approval**: Once approved, updates are often auto-approved
- **Verbose Logging**: Detailed output for debugging

**Important Notes:**
- Uses **Web Application** OAuth client (not Chrome Extension type)
- Follows official Google Chrome Web Store API documentation
- OAuth Playground method is Google's recommended approach for getting refresh tokens
- Same Google Account must own both the Cloud Project and Chrome Web Store items

### Firefox Add-ons Store Publishing

### Prerequisites

1. **Existing Add-on**: Your extension must already be published on Mozilla Add-ons Store
2. **Mozilla Developer Account**: With API access enabled
3. **GitHub Repository**: With proper secrets configured

### Setup Instructions

#### 1. Get Mozilla API Credentials

1. Sign in to [addons.mozilla.org](https://addons.mozilla.org/)
2. Navigate to **Tools → Manage API Keys**
3. Accept the API License Agreement
4. Generate new API credentials
5. Copy the **Issuer ID** and **Secret** (keep them secure!)

#### 2. Configure GitHub Secrets

In your repository settings (**Settings → Secrets and variables → Actions**):

**Required Secrets:**
```
FIREFOX_JWT_ISSUER    = your-mozilla-issuer-id
FIREFOX_JWT_SECRET    = your-mozilla-api-secret
```

**Repository Variables:**
```
PUBLISH_FIREFOX = true    (to enable Firefox publishing)
```

#### 3. Workflow Configuration

The workflow is configured with:
- **Add-on GUID**: `env-color-banner@fancyguysdev.de` (from manifest.json)
- **Conditional Publishing**: Only runs when `PUBLISH_FIREFOX = true`
- **Approval Notes**: Includes version info and changelog links

### Testing the Setup

1. **Dry Run**: Set `PUBLISH_FIREFOX = false` to test without publishing
2. **Check Logs**: Monitor GitHub Actions for detailed execution logs  
3. **Monitor AMO**: Check your Mozilla Add-ons Developer Dashboard
4. **Version Bumps**: Test both manual manifest updates and auto-increment

### Workflow Behavior

#### Smart Publishing Logic
- **src/ Change Detection**: Only publishes when extension source code changes
- **Force Publish Option**: Manual trigger can override src/ change requirement
- **Release Ordering**: Publishes to stores first, then creates GitHub release
- **Failure Recovery**: If publishing fails, GitHub release isn't created (preserves diff detection)

#### Version Management
- **If manifest version > latest release**: Uses manifest version
- **If manifest version ≤ latest release**: Auto-increments patch version
- **Updates manifest.json**: Commits version changes back to repo

#### Publishing Process
1. **Detect Changes**: Check if src/ directory changed since last release
2. **Create ZIP**: Package extension from src/ directory
3. **Publish Firefox**: Upload to Mozilla Add-ons Store (if enabled)
4. **Publish Chrome**: Upload to Chrome Web Store (if enabled)
5. **Create Release**: GitHub release with changelog and ZIP attachment

#### Store Publishing
- **Chrome (PlasmoHQ/bpp)**: Modern OAuth-based publishing with verbose logging
- **Firefox (wdzeng/firefox-addon)**: JWT-based publishing with approval notes
- **Conditional**: Only runs when respective `PUBLISH_*` variables are true

## Manual Operations

### Manual Workflow Trigger
```bash
# From GitHub UI: Actions → Auto Release Extension → Run workflow
# Optional: Check "Force publish even without src/ changes"
# Or via CLI:
gh workflow run release.yml
gh workflow run release.yml -f force_publish=true  # Force publish
```

### Manual Version Bump
```json
// In manifest.json
{
  "version": "1.5.0"  // Update to desired version
}
```

### Emergency Disable
```bash
# Disable Firefox publishing
gh variable set PUBLISH_FIREFOX --body "false"

# Disable Chrome publishing  
gh variable set PUBLISH_CHROME --body "false"

# Disable all publishing
gh variable set PUBLISH_FIREFOX --body "false"
gh variable set PUBLISH_CHROME --body "false"
```

## Troubleshooting

### Common Issues

#### Chrome Publishing Issues

**❌ "No client ID provided"**
- Verify `CHROME_CLIENT_ID` secret is set correctly
- Ensure OAuth credentials are from **Web Application** type (follow official Chrome tutorial)

**❌ "Authentication failed"**
- Check `CHROME_CLIENT_SECRET` and `CHROME_REFRESH_TOKEN` are correct
- Verify Chrome Web Store API is enabled in Google Cloud Console
- Ensure OAuth app is published (not in testing mode)
- Confirm you used OAuth Playground method to generate refresh token
- Verify the same Google Account owns both Cloud Project and Chrome Web Store items

**❌ "Extension not found"**
- Verify `CHROME_EXTENSION_ID` matches your published extension
- Ensure extension was manually published once before automation

#### Firefox Publishing Issues

**❌ "Add-on not found"**
- Verify the add-on exists on Mozilla Add-ons Store
- Check the GUID matches exactly: `env-color-banner@fancyguysdev.de`

**❌ "Authentication failed"** 
- Verify `FIREFOX_JWT_ISSUER` and `FIREFOX_JWT_SECRET` are correct
- Check API credentials haven't expired

#### General Issues

**❌ "Version already exists"**
- Workflow automatically skips duplicate versions
- Manually increment version in manifest.json if needed

**❌ "No changes in src/ directory"**
- Expected behavior - workflow only publishes when extension code changes
- Use "Force publish" option for manual releases without src/ changes

**❌ "Publishing failed but release was created"**
- This shouldn't happen with current workflow (publishes first, then creates release)
- If it does, delete the GitHub release and retry

### Debug Mode

The workflow includes verbose logging for Chrome publishing. For additional debugging:

```yaml
- name: Debug Information
  run: |
    echo "Manifest version: $(jq -r '.version' src/manifest.json)"
    echo "Latest release: $(gh release list --limit 1 --json tagName --jq '.[0].tagName')"
    echo "Publish Chrome: ${{ vars.PUBLISH_CHROME }}"
    echo "Publish Firefox: ${{ vars.PUBLISH_FIREFOX }}"
    echo "Force publish: ${{ inputs.force_publish }}"
    echo "Has src changes: ${{ steps.src_changes.outputs.has_changes }}"
    echo "Should publish: ${{ steps.should_publish.outputs.should_publish }}"
```

## Security Notes

- **Never commit API secrets** to the repository
- **Use GitHub secrets** for all sensitive credentials  
- **Review approval notes** before they're sent to Mozilla
- **Monitor published releases** for any unauthorized changes

## Development Workflow

Recommended development flow:

1. **Feature Development**: Work on feature branches
2. **Pull Request**: Create PR to main branch
3. **Code Review**: Review and approve changes
4. **Merge to Main**: Triggers automated release process
5. **Monitor Release**: Check GitHub Actions and AMO dashboard
6. **User Notification**: Release notes are auto-generated

This automation ensures consistent releases and reduces manual overhead for publishing updates.