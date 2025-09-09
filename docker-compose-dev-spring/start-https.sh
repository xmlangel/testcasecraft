#!/bin/bash

# Quick start script for HTTPS mode

# Set HTTPS configuration
export PROTOCOL=https
export DOMAIN=${1:-localhost}
export HTTP_PORT=8080
export HTTPS_PORT=443

echo "🚀 Starting in HTTPS mode for domain: $DOMAIN"

# Check if SSL certificate exists
if [ ! -f "ssl/keystore.p12" ]; then
    echo "⚠️  SSL certificate not found. Creating self-signed certificate for $DOMAIN..."
    
    # Create ssl directory if not exists
    mkdir -p ssl
    
    # Generate self-signed certificate
    keytool -genkeypair -alias testcase -keyalg RSA -keysize 2048 \
            -storetype PKCS12 -keystore ssl/keystore.p12 \
            -dname "CN=$DOMAIN,OU=Dev,O=TestCase,L=Seoul,ST=Seoul,C=KR" \
            -storepass changeit -keypass changeit \
            -validity 365
    
    echo "✅ Self-signed certificate created for $DOMAIN"
fi

./start.sh