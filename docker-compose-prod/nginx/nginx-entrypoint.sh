#!/bin/sh

# Check if HTTPS is enabled
if [ "$ENABLE_HTTPS" = "true" ]; then
    echo "HTTPS is enabled. Configuring Nginx for HTTPS."

    # Copy HTTPS template to active config
    # Use envsubst to replace variables in the template
    envsubst '$DOMAIN_NAME $EXTRA_DOMAINS' < /etc/nginx/conf.d/https.conf.template > /etc/nginx/conf.d/https.conf

    # Create a separate config for HTTP to HTTPS redirect
    cat <<EOF > /etc/nginx/conf.d/default_http_redirect.conf
server {
    listen 80;
    server_name ${DOMAIN_NAME} ${EXTRA_DOMAINS};

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        try_files \$uri =404;
    }

    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}
EOF
    # Remove original default.conf if it's not needed for HTTP traffic anymore
    # For this setup, default.conf will still be loaded but default_http_redirect.conf will take precedence for port 80
else
    echo "HTTPS is disabled. Configuring Nginx for HTTP only."
    # Ensure https.conf and redirect config are not present if they were previously created
    rm -f /etc/nginx/conf.d/https.conf
    rm -f /etc/nginx/conf.d/default_http_redirect.conf
    # default.conf will handle all HTTP traffic
fi
