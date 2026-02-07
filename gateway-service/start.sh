#!/bin/sh
set -e

# Replace environment variables in nginx.conf
envsubst '${PORT} ${AUTH_SERVICE_URL} ${CORE_SERVICE_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Start Nginx
exec nginx -g 'daemon off;'
