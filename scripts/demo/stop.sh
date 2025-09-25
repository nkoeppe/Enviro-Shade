#!/bin/bash

echo "Stopping demo test applications..."

# Stop and remove containers
docker stop enviro-shade-demo1 enviro-shade-demo2 2>/dev/null
docker rm enviro-shade-demo1 enviro-shade-demo2 2>/dev/null

echo "Demo applications stopped."