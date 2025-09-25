#!/bin/bash

echo "Stopping demo applications..."

# Stop Node.js processes
pkill -f "node start-node.js" 2>/dev/null || true

echo "Demo applications stopped."