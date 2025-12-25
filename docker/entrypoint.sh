#!/bin/sh
set -e

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Optimize Laravel
echo "Caching configuration..."
php artisan config:cache
php artisan event:cache
php artisan route:cache
php artisan view:cache

# Start Supervisord
echo "Starting Supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
