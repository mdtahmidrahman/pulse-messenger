#!/bin/sh
set -e

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Seed admin user (safe to run multiple times due to updateOrCreate)
echo "Seeding admin user..."
php artisan db:seed --class=AdminUserSeeder --force

# Optimize Laravel (but DON'T cache config - env vars are injected at runtime by Render)
echo "Preparing Laravel..."
php artisan package:discover --ansi
php artisan config:clear
php artisan event:cache
php artisan route:cache
php artisan view:cache

# Start Supervisord
echo "Starting Supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
