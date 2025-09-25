#!/bin/bash

echo "Stopping demo applications..."

# Stop and remove containers
docker-compose down

echo "Demo applications stopped."