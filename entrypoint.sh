#!/bin/ash

echo "Waiting for Postgres..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done
echo "PostgreSQL started!"

exec "$@"
