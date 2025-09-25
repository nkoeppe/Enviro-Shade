#!/bin/bash

echo "Starting demo test applications..."

# Stop any existing Node processes
pkill -f "node start-node.js" 2>/dev/null || true

# Start Node.js servers
echo "Starting Node.js demo servers..."
node start-node.js &

echo ""
echo "Demo applications are now running:"
echo "  Test App 1 (Production): http://localhost:3000"
echo "  Test App 2 (Staging): http://localhost:3001"
echo ""
echo "To stop the demo apps, run: ./stop.sh"