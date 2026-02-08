#!/bin/sh
set -e

# Extract hosts (remove port if present)
AUTH_HOST=$(echo $AUTH_SERVICE_URL | cut -d: -f1)
CORE_HOST=$(echo $CORE_SERVICE_URL | cut -d: -f1)

echo "Waiting for services to be resolvable..."
# Wait for Auth Service
while ! ping -c 1 -W 1 $AUTH_HOST >/dev/null 2>&1; do
    echo "Waiting for $AUTH_HOST..."
    sleep 2
done

# Wait for Core Service
while ! ping -c 1 -W 1 $CORE_HOST >/dev/null 2>&1; do
    echo "Waiting for $CORE_HOST..."
    sleep 2
done

echo "Services are ready!"

# Replace environment variables in nginx.conf
envsubst '${PORT} ${AUTH_SERVICE_URL} ${CORE_SERVICE_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Start Nginx
exec nginx -g 'daemon off;'
