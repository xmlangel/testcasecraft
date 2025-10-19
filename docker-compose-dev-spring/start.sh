#!/bin/bash

# Test Case Management - Spring Boot Only Development Environment

set -e

# =============================================================================
# Configuration and Global Variables
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Load environment variables
load_environment() {
    if [ -f .env ]; then
        source .env
        echo "✅ Environment variables loaded from .env"
    fi
    
    # Set default values
    PROTOCOL=${PROTOCOL:-http}
    DOMAIN=${DOMAIN:-localhost}
    HTTP_PORT=${HTTP_PORT:-8080}
    HTTPS_PORT=${HTTPS_PORT:-443}
    
    export PROTOCOL DOMAIN HTTP_PORT HTTPS_PORT
}

# =============================================================================
# Service Management Functions
# =============================================================================

stop_services() {
    echo "🛑 Stopping Test Case Management services..."
    
    configure_server_ports
    export_docker_variables
    
    docker compose down
    
    echo ""
    echo "✅ Services stopped successfully!"
    echo "🗑️  To remove all data, run: docker compose down -v"
    echo ""
}

show_status() {
    echo "📊 Checking service status..."
    docker compose ps
}

restart_services() {
    echo "🔄 Restarting services..."
    stop_services
    echo ""
    start_services
}

show_usage() {
    echo "❌ Invalid command: $1"
    echo "Usage: $0 [start|stop|restart|status]"
    exit 1
}

# =============================================================================
# Configuration Functions  
# =============================================================================

configure_server_ports() {
    # Set server port and SSL based on protocol
    if [ "$PROTOCOL" = "https" ]; then
        export SERVER_PORT=8443
        export SERVER_SSL_ENABLED=true
    else
        export SERVER_PORT=8080
        export SERVER_SSL_ENABLED=false
    fi
}

export_docker_variables() {
    # Export variables for docker compose
    export PROTOCOL HTTP_PORT HTTPS_PORT SERVER_PORT SERVER_SSL_ENABLED
    export SSL_KEYSTORE_PATH SSL_KEYSTORE_PASSWORD SSL_KEYSTORE_TYPE
}

print_configuration() {
    echo "📋 Configuration:"
    echo "   Protocol: $PROTOCOL"
    echo "   Domain: $DOMAIN"
    echo "   HTTP Port: $HTTP_PORT"
    echo "   HTTPS Port: $HTTPS_PORT"
}

# =============================================================================
# Command Line Argument Handling
# =============================================================================

handle_arguments() {
    case "$1" in
        stop)
            stop_services
            exit 0
            ;;
        status)
            show_status
            exit 0
            ;;
        restart)
            restart_services
            exit 0
            ;;
        start|"")
            # Proceed with start logic
            ;;
        *)
            show_usage "$1"
            ;;
    esac
}


# =============================================================================
# Validation Functions
# =============================================================================

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

validate_configuration() {
    echo "🔍 Validating configuration..."
    
    # Check protocol validity
    if [ "$PROTOCOL" != "http" ] && [ "$PROTOCOL" != "https" ]; then
        echo "❌ Invalid PROTOCOL: $PROTOCOL (must be 'http' or 'https')"
        return 1
    fi
    
    # Check ports
    if [ "$PROTOCOL" = "http" ]; then
        if ! check_port $HTTP_PORT "HTTP"; then
            return 1
        fi
    elif [ "$PROTOCOL" = "https" ]; then
        if ! check_port $HTTPS_PORT "HTTPS"; then
            return 1
        fi
        if ! validate_ssl_cert; then
            return 1
        fi
    fi
    
    return 0
}

# =============================================================================
# Health Check Functions
# =============================================================================

check_service_health() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for $service to be healthy..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker compose  ps $service | grep -q "healthy"; then
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

wait_for_services() {
    # Wait for database to be ready
    if ! check_service_health "postgres"; then
        echo "❌ Database failed to start properly"
        docker compose logs postgres
        return 1
    fi

    # Wait for application to be ready
    if ! check_service_health "app"; then
        echo "❌ Application failed to start properly"
        echo "📋 Application logs:"
        docker compose logs app
        return 1
    fi
    
    return 0
}

# =============================================================================
# Build Functions
# =============================================================================

check_jar_exists() {
    echo "🔍 Checking application build..."
    
    local executable_jar_count=0
    for jar in ../build/libs/TestCaseCraft-*.jar; do
        if [ -f "$jar" ] && [[ "$jar" != *"-plain.jar" ]]; then
            executable_jar_count=$((executable_jar_count + 1))
        fi
    done
    
    if [ $executable_jar_count -eq 0 ]; then
        return 1
    else
        echo "✅ JAR file found"
        return 0
    fi
}

build_application() {
    echo "⚠️  JAR file not found. Building application..."
    cd ..
    ./gradlew clean bootJar
    if [ $? -ne 0 ]; then
        echo "❌ Failed to build application"
        return 1
    fi
    cd docker compose-dev-spring
    echo "✅ Application built successfully"
    return 0
}

copy_jar_file() {
    echo "📦 Preparing JAR file for Docker build..."
    
    # Find the executable JAR (not the -plain.jar)
    local jar_file=""
    for jar in ../build/libs/TestCaseCraft-*.jar; do
        if [ -f "$jar" ] && [[ "$jar" != *"-plain.jar" ]]; then
            jar_file="$jar"
            break
        fi
    done

    if [ -n "$jar_file" ]; then
        cp "$jar_file" ./app.jar
        echo "✅ JAR file copied: $(basename "$jar_file")"
        return 0
    else
        echo "❌ Executable JAR file not found in ../build/libs/"
        echo "   Available files:"
        ls -la ../build/libs/ || echo "   Directory not found"
        return 1
    fi
}

prepare_application() {
    if ! check_jar_exists; then
        if ! build_application; then
            exit 1
        fi
    fi
    
    if ! copy_jar_file; then
        exit 1
    fi
}

# =============================================================================
# Docker Functions
# =============================================================================

start_docker_services() {
    echo "📦 Building and starting services..."
    docker compose -f docker-compose-dev.yml up -d --build
}

# =============================================================================
# URL and Display Functions
# =============================================================================

generate_access_urls() {
    # Determine access URL
    if [ "$PROTOCOL" = "https" ]; then
        if [ "$HTTPS_PORT" = "443" ]; then
            BASE_URL="https://$DOMAIN"
        else
            BASE_URL="https://$DOMAIN:$HTTPS_PORT"
        fi
    else
        if [ "$HTTP_PORT" = "80" ]; then
            BASE_URL="http://$DOMAIN"
        else
            BASE_URL="http://$DOMAIN:$HTTP_PORT"
        fi
    fi
    
    HEALTH_URL="$BASE_URL/actuator/health"
}

show_success_info() {
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
    show_management_commands
    show_ssl_info
}

show_management_commands() {
    echo "🛠️  Management Commands:"
    echo "   🚀 Start services:    ./start.sh [start]"
    echo "   🔄 Restart services:  ./start.sh restart"
    echo "   📊 View status:       ./start.sh status"
    echo "   📋 View logs:         docker compose logs -f"
    echo "   📋 View app logs:     docker compose logs -f app"
    echo "   🛑 Stop services:     ./start.sh stop"
    echo "   🗑️  Clean up:          ./start.sh stop && docker compose down -v"
    echo ""
}

show_ssl_info() {
    if [ "$PROTOCOL" = "https" ]; then
        echo "🔒 SSL Certificate Info:"
        echo "   📁 Certificate:     ssl/keystore.p12"
        echo "   🔑 Default Password: changeit"
        echo "   ⚠️  Self-signed certificates will show security warnings in browsers"
        echo ""
    fi
}

# =============================================================================
# Main Start Function
# =============================================================================

start_services() {
    echo "🚀 Starting Test Case Management - Spring Boot Only..."
    
    # Load configuration
    load_environment
    print_configuration
    
    # Validate configuration
    if ! validate_configuration; then
        exit 1
    fi
    
    # Prepare application
    prepare_application
    
    # Configure for Docker
    configure_server_ports
    export_docker_variables
    
    # Start Docker services
    start_docker_services
    
    # Wait for services to be healthy
    if ! wait_for_services; then
        exit 1
    fi
    
    # Generate URLs and show success info
    generate_access_urls
    show_success_info
}

# =============================================================================
# Main Execution
# =============================================================================

main() {
    # Initialize environment
    load_environment
    
    # Handle command line arguments
    handle_arguments "$1"
    
    # Execute start sequence
    start_services
}

# Run main function with all arguments
main "$@"
