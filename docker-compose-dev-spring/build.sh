#!/bin/bash

# This script is in /home/skai/kmkim/testcase-management-tool/docker-compose-dev-spring/

# 1. Backup existing app.jar in the current directory
TIMESTAMP=$(date +%Y%m%d%H%M%S)
if [ -f "app.jar" ]; then
    echo "Backing up app.jar to app.jar.$TIMESTAMP"
    mv app.jar "app.jar.$TIMESTAMP"
fi

# 2. Go to the project root to build
echo "Building the project..."
cd .. # Now in /home/skai/kmkim/testcase-management-tool/
./gradlew incrementVersion
./gradlew clean bootJar

echo "Done."
