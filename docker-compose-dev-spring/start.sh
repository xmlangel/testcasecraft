#!/bin/bash

# Test Case Management - Spring Boot Only Development Environment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Load environment variables
if [ -f .env ]; then
    source .env
fi

# Default values
PROTOCOL=${PROTOCOL:-http}
DOMAIN=${DOMAIN:-localhost}
HTTP_PORT=${HTTP_PORT:-8080}
Https_PORT=${HTTPS_PORT:-443}

# --- Argument Handling ---
case "$1" in
    stop)
        echo "🛑 Stopping Test Case Management services..."

        # Set server port and SSL based on protocol for docker-compose to use
        if [ "$PROTOCOL" = "https" ]; then
            export SERVER_PORT=8443
            export SERVER_SSL_ENABLED=true
        else
            export SERVER_PORT=8080
            export SERVER_SSL_ENABLED=false
        fi

        # Export variables for docker-compose
        export PROTOCOL HTTP_PORT HTTPS_PORT SERVER_PORT SERVER_SSL_ENABLED

        docker-compose down

        echo ""
        echo "✅ Services stopped successfully!"
        echo "🗑️  To remove all data, run: docker-compose down -v"
        echo ""
        exit 0
        ;;
    status)
        echo "📊 Checking service status..."
        docker-compose ps
        exit 0
        ;;
    restart)
        echo "🔄 Restarting services..."
        "$0" stop
        echo ""
        "$0" start
        exit 0
        ;;
    start|"")
        # Proceed with the start logic below
        ;;
    *)
        echo "❌ Invalid command: $1"
        echo "Usage: $0 [start|stop|restart|status]"
        exit 1
        ;;
esac
# --- End Argument Handling ---


# Start command execution
echo "🚀 Starting Test Case Management - Spring Boot Only..."
echo "📋 Configuration:"
echo "   Protocol: $PROTOCOL"
echo "   Domain: $DOMAIN"
echo "   HTTP Port: $HTTP_PORT"
echo "   HTTPS Port: $HTTPS_PORT"

# Function to validate SSL certificate
validate_ssl_cert() {
    if [ "$PROTOCOL" = "https" ]; then
        if [ ! -f "ssl/keystore.p12" ]; then
            echo "❌ HTTPS mode requires SSL certificate!"
            echo ""
            echo "🔧 To create a self-signed certificate for development:"
            echo "   keytool -genkeypair -alias testcase -keyalg RSA -keysize 2048 "\
            echo "           -storetype PKCS12 -keystore ssl/keystore.p12 "\
            echo "           -dname \"CN=$DOMAIN,OU=Dev,O=TestCase,L=Seoul,ST=Seoul,C=KR\" "\
            echo "           -storepass changeit -keypass changeit -validity 365"
            echo ""
            echo "📋 Or see ssl/README.md for more options"
            return 1
        else
            echo "✅ SSL certificate found: ssl/keystore.p12"
        fi
    fi
    return 0
}

# Function to check if service is healthy
check_service_health() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for $service to be healthy..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose ps $service | grep -q "healthy"; then
            echo "✅ $service is healthy!"
            return 0
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            echo "❌ $service failed to become healthy after $max_attempts attempts"
            return 1
        fi
        
        echo "Attempt $attempt/$max_attempts - waiting for $service..."
        sleep 5
        ((attempt++))
    done
}

# Function to check port availability
check_port() {
    local port=$1
    local protocol_name=$2
    
    if lsof -i :$port > /dev/null 2>&1; then
        echo "❌ Port $port is already in use (required for $protocol_name)"
        echo "   To find what's using the port: lsof -i :$port"
        echo "   To kill process: lsof -ti:$port | xargs kill -9"
        return 1
    fi
    return 0
}

# Check if JAR file exists, if not build it
echo "🔍 Checking application build..."
# Check for executable JAR (not -plain.jar)
EXECUTABLE_JAR_COUNT=0
for jar in ../build/libs/TestCaseCraft-*.jar; do
    if [ -f "$jar" ] && [[ "$jar" != *"-plain.jar" ]]; then
        EXECUTABLE_JAR_COUNT=$((EXECUTABLE_JAR_COUNT + 1))
    fi
done

if [ $EXECUTABLE_JAR_COUNT -eq 0 ]; then
    echo "⚠️  JAR file not found. Building application..."
    cd ..
    ./gradlew clean bootJar
    if [ $? -ne 0 ]; then
        echo "❌ Failed to build application"
        exit 1
    fi
    cd docker-compose-dev-spring
    echo "✅ Application built successfully"
else
    echo "✅ JAR file found"
fi

# Copy JAR file to current directory for Docker build
echo "📦 Preparing JAR file for Docker build..."
# Find the executable JAR (not the -plain.jar)
JAR_FILE=""
for jar in ../build/libs/TestCaseCraft-*.jar; do
    if [ -f "$jar" ] && [[ "$jar" != *"-plain.jar" ]]; then
        JAR_FILE="$jar"
        break
    fi
done

if [ -n "$JAR_FILE" ]; then
    cp "$JAR_FILE" ./app.jar
    echo "✅ JAR file copied: $(basename "$JAR_FILE")"
else
    echo "❌ Executable JAR file not found in ../build/libs/"
    echo "   Available files:"
    ls -la ../build/libs/ || echo "   Directory not found"
    exit 1
fi

# Validate configuration
echo "🔍 Validating configuration..."

# Check ports
if [ "$PROTOCOL" = "http" ]; then
    if ! check_port $HTTP_PORT "HTTP"; then
        exit 1
    fi
elif [ "$PROTOCOL" = "https" ]; then
    if ! check_port $HTTPS_PORT "HTTPS"; then
        exit 1
    fi
    if ! validate_ssl_cert; then
        exit 1
    fi
else
    echo "❌ Invalid PROTOCOL: $PROTOCOL (must be 'http' or 'https')"
    exit 1
fi

# Set server port and SSL based on protocol
# Note: Spring Boot runs internally on 8080, external ports are mapped
if [ "$PROTOCOL" = "https" ]; then
    export SERVER_PORT=8443  # Internal HTTPS port
    export SERVER_SSL_ENABLED=true
else
    export SERVER_PORT=8080  # Internal HTTP port
    export SERVER_SSL_ENABLED=false
fi

# Export environment variables for docker-compose
export PROTOCOL DOMAIN HTTP_PORT HTTPS_PORT SERVER_PORT SERVER_SSL_ENABLED
export SSL_KEYSTORE_PATH SSL_KEYSTORE_PASSWORD SSL_KEYSTORE_TYPE

# Start services
echo "📦 Building and starting services..."
docker-compose -f docker-compose-dev.yml up -d --build

# Wait for database to be ready
if ! check_service_health "postgres"; then
    echo "❌ Database failed to start properly"
    docker-compose logs postgres
    exit 1
fi

# Wait for application to be ready
if ! check_service_health "app"; then
    echo "❌ Application failed to start properly"
    echo "📋 Application logs:"
    docker-compose logs app
    exit 1
fi

# Determine access URL
if [ "$PROTOCOL" = "https" ]; then
    if [ "$HTTPS_PORT" = "443" ]; then
        BASE_URL="https://$DOMAIN"
    else
        BASE_URL="https://$DOMAIN:$HTTPS_PORT"
    fi
    HEALTH_URL="$BASE_URL/actuator/health"
else
    if [ "$HTTP_PORT" = "80" ]; then
        BASE_URL="http://$DOMAIN"
    else
        BASE_URL="http://$DOMAIN:$HTTP_PORT"
    fi
    HEALTH_URL="$BASE_URL/actuator/health"
fi

echo ""
echo "🎉 Test Case Management is now running!"
echo ""
echo "📍 Access URLs:"
echo "   🌐 Application:     $BASE_URL"
echo "   📊 Swagger UI:      $BASE_URL/swagger-ui.html"
echo "   🏥 Health Check:    $HEALTH_URL"
echo "   🐘 PostgreSQL:      localhost:5433"
echo ""
echo "🔐 Default Login:"
echo "   👤 Username: admin"
echo "   🔑 Password: admin"
echo ""
echo "🛠️  Management Commands:"
echo "   🚀 Start services:    ./start.sh [start]"
    echo "   🔄 Restart services:  ./start.sh restart"
echo "   📊 View status:     ./start.sh status"
echo "   📋 View logs:       docker-compose logs -f"
echo "   📋 View app logs:   docker-compose logs -f app"
echo "   🛑 Stop services:   ./start.sh stop"
echo "   🗑️  Clean up:        ./start.sh stop && docker-compose down -v"
echo ""

# SSL certificate info for HTTPS
if [ "$PROTOCOL" = "https" ]; then
    echo "🔒 SSL Certificate Info:"
    echo "   📁 Certificate:     ssl/keystore.p12"
    echo "   🔑 Default Password: changeit"
    echo "   ⚠️  Self-signed certificates will show security warnings in browsers"
    echo ""
fi
