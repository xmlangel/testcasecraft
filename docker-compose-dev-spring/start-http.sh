#!/bin/bash

# Quick start script for HTTP mode

# Set HTTP configuration
export PROTOCOL=http
export DOMAIN=localhost
export HTTP_PORT=8080
export HTTPS_PORT=443

echo "🚀 Starting in HTTP mode..."
./start.sh