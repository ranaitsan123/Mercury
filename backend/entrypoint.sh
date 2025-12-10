#!/bin/sh

set -e

echo "⏳ Waiting for PostgreSQL to be ready..."

while ! nc -z db 5432; do
  sleep 1
done

echo "✅ PostgreSQL is available!"

echo "📦 Applying migrations..."
python manage.py migrate --noinput

echo "👑 Creating superuser if not exists..."
python manage.py shell <<EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username="admin").exists():
    User.objects.create_superuser("admin", "admin@example.com", "adminpass")
EOF

echo "🚀 Starting Django server..."
exec python manage.py runserver 0.0.0.0:8000
