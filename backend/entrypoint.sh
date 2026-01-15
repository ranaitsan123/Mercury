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
import os
from django.contrib.auth import get_user_model

User = get_user_model()

username = os.getenv("DJANGO_SUPERUSER_USERNAME")
email = os.getenv("DJANGO_SUPERUSER_EMAIL")
password = os.getenv("DJANGO_SUPERUSER_PASSWORD")

if username and password and email:
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        print("✅ Superuser created")
    else:
        print("ℹ️ Superuser already exists")
else:
    print("⚠️ Superuser env vars not set, skipping")
EOF


echo "🚀 Starting Django server..."
exec python manage.py runserver 0.0.0.0:8000
