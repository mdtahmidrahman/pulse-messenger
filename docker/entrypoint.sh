#!/bin/sh
set -e

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Seed admin user (safe to run multiple times due to updateOrCreate)
echo "Seeding admin user..."
php artisan db:seed --class=AdminUserSeeder --force

# Optimize Laravel (but DON'T cache config/routes - env vars and providers load at runtime)
echo "Preparing Laravel..."
php artisan package:discover --ansi
php artisan config:clear
php artisan route:clear
php artisan event:cache
php artisan view:cache
php artisan storage:link --force

# Start Supervisord
echo "Starting Supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
