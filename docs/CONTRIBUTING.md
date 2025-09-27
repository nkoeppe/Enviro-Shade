# Contributing to Enviro-Shade

Thank you for your interest in contributing to Enviro-Shade! This guide will help you get started.

## Quick Start

1. **Fork** the repository
2. **Clone** your fork locally
3. **Make changes** (no build step required!)
4. **Test** your changes in Chrome/Firefox
5. **Submit** a pull request

## Development Setup

### Prerequisites
- **Chrome** or **Firefox** for testing
- **Git** for version control
- **Code editor** (VS Code recommended)

### Local Development
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Enviro-Shade.git
cd Enviro-Shade

# No build step needed - it's plain JavaScript!
```

### Load Extension for Testing
- **Chrome**: `chrome://extensions/` → Enable Developer mode → Load unpacked
- **Firefox**: `about:debugging` → This Firefox → Load Temporary Add-on

## Project Structure

```
Enviro-Shade/
├── manifest.json           # Extension configuration
├── background.js          # Main logic (rules, matching, badge)
├── content.js            # Overlay injection
├── options.html/js/css   # Settings page
├── icons/               # Extension icons
└── docs/               # Documentation
    ├── developer/      # Dev guides  
    └── user/          # User guides
```

## Types of Contributions

### 🐛 Bug Reports
Found a bug? Help us fix it:

1. **Check existing issues** first
2. **Create detailed report** with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser version and OS
   - Extension version
   - Console errors (if any)

### ✨ Feature Requests
Have an idea? We'd love to hear it:

1. **Search existing issues** for similar requests
2. **Describe the problem** your feature would solve
3. **Explain your proposed solution**
4. **Consider alternative approaches**

### 🔧 Code Contributions

#### Areas Needing Help
- **Pattern matching improvements** (better glob support)
- **UI/UX enhancements** (options page design)
- **Performance optimizations** (memory usage, speed)
- **Cross-browser compatibility** (Edge, Safari support)
- **Accessibility improvements** (a11y compliance)
- **Test coverage** (automated testing)

#### Development Guidelines

**Code Style:**
- Use **meaningful variable names**
- Add **comments** for complex logic
- Follow **existing patterns** in the codebase
- Keep functions **small and focused**

**Testing Changes:**
- **Test in both Chrome and Firefox**
- **Try various URL patterns** and edge cases
- **Check options page functionality**
- **Verify storage persistence**
- **Test with different severity levels**

**Common Patterns:**
```javascript
// Use the unified API wrapper
const API = typeof browser !== "undefined" ? browser : chrome;

// Pattern matching with glob support  
function globToRegex(glob) {
  // Implementation in background.js
}

// Consistent error handling
try {
  await API.storage.sync.get(...);
} catch {
  // Fallback behavior
}
```

## Contributor License Agreement (CLA)

**IMPORTANT:** All contributors must agree to our CLA before their contributions can be accepted.

By submitting a pull request, you acknowledge that:
- You have read and agree to the terms in [CLA.md](../CLA.md)
- You grant full ownership of your contributions to Nicolas Köppe
- **Nicolas Köppe** may relicense your contributions for commercial use

**First-time contributors:** Please review the [CLA.md](../CLA.md) file in the root directory.

## Pull Request Process

### Before Submitting
1. **Test thoroughly** in multiple browsers
2. **Update documentation** if needed
3. **Follow commit message conventions**
4. **Keep changes focused** (one feature/fix per PR)

### Commit Message Format
```
type: brief description

Optional longer explanation of changes.
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix  
- `chore:` Maintenance (deps, build, etc.)
- `docs:` Documentation updates
- `style:` Code formatting
- `refactor:` Code restructuring
- `test:` Test additions/fixes

**Examples:**
```
feat: add regex pattern support for advanced users

fix: prevent overlay flicker on SPA navigation

docs: update installation guide for Firefox

chore: bump manifest version to 1.5.0
```

### Pull Request Template
When creating a PR, please include:

```markdown
## Description
Brief summary of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature  
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Other: ___________

## Testing
- [ ] Tested in Chrome
- [ ] Tested in Firefox
- [ ] Verified options page works
- [ ] Tested pattern matching
- [ ] Checked for console errors

## Screenshots (if UI changes)
[Add screenshots here]
```

## Development Tips

### Debugging
```javascript
// Background script debugging
console.log("Rule matched:", match);

// Content script debugging  
console.log("Overlay applied:", payload);

// Options page debugging
console.log("Rules saved:", state.rules);
```

### Testing Patterns
```javascript
// Test URL matching
const pattern = "*://app-prod*.company.com/*";
const regex = globToRegex(pattern);
console.log(regex.test("https://app-prod1.company.com/dashboard"));
```

### Storage Inspection
```javascript
// View all stored data
chrome.storage.sync.get(null, console.log);

// Clear storage for testing
chrome.storage.sync.clear();
```

## Documentation

### Writing Style
- **Clear and concise** language
- **Step-by-step instructions** with examples
- **Code blocks** for technical content
- **Screenshots** for UI guidance

### Areas Needing Documentation
- **Advanced pattern examples** for complex environments
- **Troubleshooting guides** for common issues
- **Integration examples** with popular development stacks
- **Video tutorials** for setup and usage

## Community Guidelines

### Be Respectful
- **Welcome newcomers** and help them get started
- **Provide constructive feedback** on PRs and issues
- **Be patient** with questions and different skill levels
- **Assume good intentions** in discussions

### Communication
- **Use clear, descriptive titles** for issues and PRs
- **Provide context** and examples when possible
- **Follow up** on your contributions if questions arise
- **Search existing content** before creating new issues

## Release Process

Our automated workflow handles releases:

1. **Push to main** triggers the release workflow
2. **Version management** auto-increments or uses manifest version
3. **GitHub release** created with categorized changelog
4. **Store publishing** to Firefox Add-ons and Chrome Web Store

## Getting Help

### For Contributors
- 💬 **GitHub Discussions** for questions and ideas
- 🐛 **GitHub Issues** for bugs and feature requests
- 📧 **Direct contact** via repository maintainer info

### For Users
- 📖 **Documentation** in the `docs/` folder
- 🆘 **Installation help** in `docs/user/installation.md`
- ⚙️ **Configuration guide** in `docs/user/configuration.md`

## Recognition

Contributors are recognized in:
- **GitHub contributors list**
- **Release notes** for significant contributions
- **Documentation credits** for major improvements

Thank you for making Enviro-Shade better for everyone! 🎉