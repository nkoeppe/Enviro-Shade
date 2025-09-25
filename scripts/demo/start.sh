#!/bin/bash

echo "Starting demo test applications..."

# Stop any existing containers
docker-compose down 2>/dev/null || true

# Build and start containers
echo "Building and starting demo applications..."
docker-compose up -d --build

echo ""
echo "Demo applications are now running:"
echo "  Test App 1 (Production): http://localhost:3000"
echo "  Test App 2 (Staging): http://localhost:3001"
echo ""
echo "To stop the demo apps, run: ./stop.sh"