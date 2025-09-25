# Demo Test Applications

This folder contains test web applications for demonstrating the Enviro-Shade browser extension overlay functionality.

## Quick Start

```bash
cd demo
chmod +x start.sh stop.sh
./start.sh
```

This will start two test applications:
- **Test App 1**: http://localhost:3000 (purple gradient background)
- **Test App 2**: http://localhost:3001 (green gradient background)

## Usage

1. **Start the demo apps**: `./start.sh`
2. **Open both URLs** in your browser
3. **Test your extension** on both sites to see overlay behavior with different backgrounds
4. **Stop the demo apps**: `./stop.sh`

## Requirements

- Docker installed and running
- Ports 3000 and 3001 available

## Customization

You can modify the HTML files in `site1/` and `site2/` to test different scenarios:
- Different color schemes
- Various content layouts
- Light/dark content sections