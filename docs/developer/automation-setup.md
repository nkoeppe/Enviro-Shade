# Automation & Publishing Setup

This guide covers setting up automated releases and publishing for Enviro-Shade development.

## GitHub Actions Workflow

Our repository includes an automated workflow that:

- ✅ **Runs on**: Push to main branch + manual dispatch
- ✅ **Smart versioning**: Compares `manifest.json` with latest GitHub release
- ✅ **Auto-increment**: Bumps version if needed or uses manifest version
- ✅ **Creates releases**: With auto-generated changelog and installation notes
- ✅ **Publishes to Firefox**: Automatic submission to Mozilla Add-ons Store

## Store Publishing Setup

### Chrome Web Store Publishing

#### Prerequisites
1. **Chrome Developer Account**: Pay the $5 developer registration fee
2. **Existing Extension**: Must be manually published once to get Extension ID
3. **Google API Credentials**: OAuth2 credentials for Chrome Web Store API

#### Setup Instructions

##### 1. Initial Manual Publication
**You must publish your extension manually the first time:**

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Click **"Add new item"**
3. Upload your ZIP file
4. Complete store listing (description, screenshots, etc.)
5. Submit for review and wait for approval
6. **Copy the Extension ID** (32-character string from the dashboard)

##### 2. Get Google API Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Chrome Web Store API**
4. Go to **Credentials → Create Credentials → OAuth Client ID**
5. Application type: **Desktop application**
6. Download the credentials JSON file
7. **Generate Refresh Token**:

```bash
# Use the OAuth playground or run this flow:
# 1. Visit: https://accounts.google.com/oauth/authorize?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&client_id=YOUR_CLIENT_ID&redirect_uri=urn:ietf:wg:oauth:2.0:oob&access_type=offline
# 2. Get authorization code
# 3. Exchange for refresh token using your client credentials
```

##### 3. Configure GitHub Secrets

In your repository (**Settings → Secrets and variables → Actions**):

**Required Secrets:**
```
CHROME_CLIENT_ID        = your-google-oauth-client-id
CHROME_CLIENT_SECRET    = your-google-oauth-client-secret  
CHROME_REFRESH_TOKEN    = your-google-oauth-refresh-token
CHROME_EXTENSION_ID     = epdlbkjhnbhhaecjebhfnimenndpgalc
```

**Repository Variables:**
```
PUBLISH_CHROME = true    (to enable Chrome publishing)
```

##### 4. Workflow Behavior
- **Upload & Publish**: Automatically submits for review
- **Review Process**: Google reviews typically take 1-3 days
- **Auto-Approval**: Once approved, updates are often auto-approved

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

#### Version Management
- **If manifest version > latest release**: Uses manifest version
- **If manifest version ≤ latest release**: Auto-increments patch version
- **Updates manifest.json**: Commits version changes back to repo

#### Release Creation
- **Generates changelog**: From git commits since last release
- **Creates GitHub release**: With ZIP attachment and install instructions
- **Skip duplicates**: Won't create release if version already exists

#### Firefox Publishing
- **Upload ZIP**: Same file attached to GitHub release  
- **Review submission**: Goes through Mozilla's review process
- **Approval notes**: Includes version details and source links

## Manual Operations

### Manual Workflow Trigger
```bash
# From GitHub UI: Actions → Auto Release Extension → Run workflow
# Or via CLI:
gh workflow run release.yml
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
# Set repository variable PUBLISH_FIREFOX to false
gh variable set PUBLISH_FIREFOX --body "false"
```

## Troubleshooting

### Common Issues

**❌ "Add-on not found"**
- Verify the add-on exists on Mozilla Add-ons Store
- Check the GUID matches exactly: `env-color-banner@fancyguysdev.de`

**❌ "Authentication failed"** 
- Verify `FIREFOX_JWT_ISSUER` and `FIREFOX_JWT_SECRET` are correct
- Check API credentials haven't expired

**❌ "Version already exists"**
- Workflow automatically skips duplicate versions
- Manually increment version in manifest.json if needed

**❌ "Copy directory error"**
- Workflow uses selective copying to avoid this issue
- Check for any new problematic directories

### Debug Mode

Enable verbose logging by editing the workflow:
```yaml
- name: Debug Information
  run: |
    echo "Manifest version: $(jq -r '.version' manifest.json)"
    echo "Latest release: $(gh release list --limit 1 --json tagName --jq '.[0].tagName')"
    echo "Publish Firefox: ${{ vars.PUBLISH_FIREFOX }}"
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