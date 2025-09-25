#!/bin/bash

echo "Starting demo test applications..."

# Stop any existing containers
docker stop enviro-shade-demo1 enviro-shade-demo2 2>/dev/null
docker rm enviro-shade-demo1 enviro-shade-demo2 2>/dev/null

# Start test app 1 on port 3000
echo "Starting Test App 1 on http://localhost:3000"
docker run -d \
  --name enviro-shade-demo1 \
  -p 3000:80 \
  -v "$(pwd)/site1:/usr/share/nginx/html" \
  nginx:alpine

# Start test app 2 on port 3001
echo "Starting Test App 2 on http://localhost:3001"
docker run -d \
  --name enviro-shade-demo2 \
  -p 3001:80 \
  -v "$(pwd)/site2:/usr/share/nginx/html" \
  nginx:alpine

echo ""
echo "Demo applications are now running:"
echo "  Test App 1: http://localhost:3000"
echo "  Test App 2: http://localhost:3001"
echo ""
echo "To stop the demo apps, run: ./stop.sh"