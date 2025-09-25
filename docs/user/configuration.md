# Configuration Guide

Learn how to set up and customize Enviro-Shade to visually identify your deployment environments.

## Getting Started

After installing Enviro-Shade, click the extension icon in your browser toolbar to open the configuration page.

## What Enviro-Shade Does

Enviro-Shade adds visual indicators to websites so you can instantly tell which **deployment environment** you're looking at:
- **Production** servers (dangerous!)
- **QA/Testing** environments  
- **Local development** servers
- **Staging** environments
- Any custom environment you define

## Default Rules

Enviro-Shade comes with smart defaults for common deployment patterns:

| Environment | URL Patterns | Color | Severity | Purpose |
|-------------|-------------|-------|----------|---------|
| **PROD** | `*://*-pro[0-9]*.cfapps.*/*` | 🔴 Red | High | Cloud Foundry production |
| **QA** | `*://*-qa[0-9]*.cfapps.*/*` | 🟡 Yellow | Medium | Cloud Foundry QA |
| **LOCAL** | `localhost*`, `127.0.0.1*` | 🟢 Green | Low | Local development |
| **LOCAL** | `192.168.*`, `10.*`, `172.1[6-9].*` | 🟢 Green | Low | Private network ranges |

These patterns use **glob matching** and cover most common deployment scenarios.

## Adding Environment Rules

### Method 1: Manual Entry
1. Click **"Add"** button in the Rules tab
2. Configure your environment:
   - **Pattern**: URL pattern to match (e.g., `*://staging.myapp.com/*`)
   - **Label**: Environment name (e.g., "STAGING", "PROD")  
   - **Color**: Visual indicator color
   - **Severity**: How prominent the overlay should be
3. Click **"Save"**

### Method 2: From Current Tabs
1. Navigate to the environment you want to track
2. Click **"Add from open tabs"** 
3. Select the tab representing your environment
4. Enviro-Shade will suggest a pattern based on the URL
5. Customize the rule and save

## Pattern Matching

Enviro-Shade supports powerful URL pattern matching:

### Glob Patterns (Recommended)
- `*` = Match any characters
- `?` = Match single character
- `[0-9]` = Match any digit
- `[a-z]` = Match any lowercase letter

**Real-World Examples:**
```
*://app-prod*.company.com/*     → app-prod1.company.com, app-prod-east.company.com
*://*.staging.myapp.com/*       → api.staging.myapp.com, web.staging.myapp.com
*://qa[0-9].example.com/*       → qa1.example.com, qa2.example.com, qa9.example.com
*://192.168.*/*                 → Any local network IP
localhost:[0-9]*/*              → localhost:3000, localhost:8080, localhost:9000
```

### Common Deployment Patterns
```
# Kubernetes/Docker environments
*://*-prod.k8s.company.com/*    → PROD
*://*-staging.k8s.company.com/* → STAGING
*://*-dev.k8s.company.com/*     → DEV

# Subdomain environments  
*://prod.myapp.com/*            → PROD
*://staging.myapp.com/*         → STAGING
*://dev.myapp.com/*             → DEV

# Port-based local development
*://localhost:300[0-9]/*        → Frontend servers
*://localhost:800[0-9]/*        → Backend APIs
*://localhost:900[0-9]/*        → Database tools

# Cloud platforms
*://*.herokuapp.com/*           → Heroku apps
*://*.azurewebsites.net/*       → Azure apps
*://*.cfapps.io/*               → Cloud Foundry
```

## Visual Customization

### Severity Levels

**Low Severity** (Subtle indicators)
- Small corner banner
- Transparent watermark  
- Minimal visual impact
- **Perfect for**: Local development, trusted environments

**Medium Severity** (Balanced visibility)
- Prominent banner
- Visible watermark
- Moderate visual impact
- **Perfect for**: QA, staging, pre-production

**High Severity** (Maximum attention)
- Large banner with ⚠️ warning icon
- Strong watermark
- Impossible to miss
- **Perfect for**: Production, critical environments

### Environment Colors

| Environment Type | Recommended Colors | Visual Impact |
|------------------|-------------------|---------------|
| **Safe/Local** | 🟢 Green `#16a34a`, 🔵 Blue `#2563eb` | "Safe to proceed" |
| **Caution/Testing** | 🟡 Yellow `#facc15`, 🟠 Orange `#f97316` | "Be careful" |
| **Danger/Production** | 🔴 Red `#dc2626`, 🟣 Purple `#9333ea` | "Stop and think!" |

## Blocklist Feature

Sometimes you want to **prevent** overlays on certain URLs, even if they match your rules.

### Adding Blocklist Rules
1. Go to the **"Blocklist"** tab
2. Click **"Add"**
3. Enter a URL pattern to block
4. Enable the rule

### Blocklist Examples
```
*://192.168.3.27/*              → Block specific IP that shouldn't show overlay
*://internal-docs.company.com/* → Block documentation sites
*://monitoring.prod.com/*       → Block monitoring dashboards
```

### How Blocklist Works
1. **Rule matching** happens first (e.g., pattern matches `*prod*`)
2. **Blocklist checking** runs second  
3. If blocklist matches, **no overlay** is shown
4. Result: "Rule matched but blocked by blocklist"

## Rule Management

### Rule Priority
Rules are evaluated **top to bottom**. The first matching rule wins.

**Example Priority:**
```
1. https://app.production.com     → PROD (Red, High)    ← Specific match
2. *production*                   → PROD-GENERAL (Red)  ← Broader match  
3. *prod*                         → PROD-CATCH (Orange) ← Catches prod1, prod-api, etc.
```

### Reordering Rules
**Drag and drop** rules in the configuration page to change their priority.

### Editing Rules
Click directly on any field in the rules table to edit:
- **Pattern**: Click to modify URL matching
- **Label**: Click to change display text
- **Color**: Click to pick new color
- **Severity**: Click to adjust visual prominence

## Testing Your Setup

### Pattern Tester
Use the **"Preview & match checker"** at the bottom of the config page:

1. **Enter a URL** you want to test
2. **See which rule matches** (if any)
3. **Preview the overlay** appearance
4. **Verify blocklist behavior**

**Test Examples:**
```
https://app.production.company.com   → Should match production rule
https://qa-env-2.staging.com         → Should match QA/staging rule
http://localhost:3000/dashboard      → Should match local rule
```

### Live Preview
Click on any rule row to see a **live preview** of how it will appear on websites.

## Environment-Specific Workflows

### Production Safety
```
Pattern: *production*, *prod*
Label: ⚠️ PRODUCTION
Color: #dc2626 (Red)
Severity: High
```

### Multi-Stage Deployment
```
*://app-dev.company.com/*     → DEV (Green, Low)
*://app-qa.company.com/*      → QA (Yellow, Medium)  
*://app-staging.company.com/* → STAGING (Orange, Medium)
*://app.company.com/*         → PROD (Red, High)
```

### Local Development Stack
```
http://localhost:3000/*       → FRONTEND (Green, Low)
http://localhost:8080/*       → API (Blue, Low)
http://localhost:5432/*       → DATABASE (Cyan, Low)
```

### Microservices Environment
```
*://auth-prod.company.com/*     → AUTH-PROD (Red, High)
*://api-prod.company.com/*      → API-PROD (Red, High)
*://web-prod.company.com/*      → WEB-PROD (Red, High)
*://admin-prod.company.com/*    → ADMIN-PROD (Red, High)
```

## Troubleshooting

### "No overlay appears"
- ✅ Check if URL matches any rule patterns
- ✅ Verify the rule is **enabled** (checkbox checked)
- ✅ Ensure URL isn't in the **blocklist**
- ✅ Refresh the page after changing rules
- ✅ Check browser console for errors

### "Wrong rule matching"  
- ✅ Check **rule priority** (first match wins)
- ✅ Make patterns more **specific**
- ✅ Use the **pattern tester** to debug
- ✅ Drag rules to reorder them

### "Rule matches but no overlay"
- ✅ Check if URL is in the **blocklist**
- ✅ Look for "blocked by blocklist" message
- ✅ Verify the website allows content scripts
- ✅ Try a different severity level

### "Pattern not working as expected"
- ✅ Test pattern with the **URL tester**
- ✅ Escape special characters if needed
- ✅ Use `*` for wildcards, not regex syntax
- ✅ Remember patterns are case-insensitive

## Best Practices

### 1. Start with Broad Patterns
```
# Good: Catches multiple production environments
*prod*

# Better: More specific but still flexible  
*://[*-]prod[*-].company.com/*
```

### 2. Use Descriptive Labels
```
# Good
PROD, QA, LOCAL

# Better
PROD-API, QA-WEB, LOCAL-DEV
```

### 3. Color Code by Risk Level
- **Green**: Safe to develop/test
- **Yellow/Orange**: Requires caution
- **Red/Purple**: High-risk production

### 4. Set Appropriate Severity
- **Local/Dev**: Low severity (don't distract)
- **QA/Staging**: Medium severity (visible reminder)
- **Production**: High severity (impossible to ignore)

### 5. Test Before Deploying
Always test your patterns with the URL checker before saving.

### 6. Document Your Rules
Keep a team wiki with your organization's standard environment patterns.

## Team Integration

### Standardize Across Team
Create a shared configuration for consistent environment identification:

```javascript
// Example team config
const teamRules = [
  { pattern: "*://app.company.com/*", label: "PROD", color: "#dc2626", severity: "high" },
  { pattern: "*://staging.company.com/*", label: "STAGING", color: "#f97316", severity: "medium" },
  { pattern: "*://qa.company.com/*", label: "QA", color: "#facc15", severity: "medium" },
  { pattern: "*://dev.company.com/*", label: "DEV", color: "#16a34a", severity: "low" }
];
```

### Share with New Developers
1. Export your rules configuration
2. Include in onboarding documentation  
3. Help new team members set up consistent rules

## Getting Help

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/nkoeppe/Enviro-Shade/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/nkoeppe/Enviro-Shade/discussions)
- 📖 **More Documentation**: Check other guides in `docs/`
- 🤝 **Community**: Share your environment patterns with other developers!