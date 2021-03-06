#!/bin/ash

echo "Waiting for Postgres..."
while ! nc -z $PGHOST $PGPORT; do
  sleep 1
done
echo "PostgreSQL started!"

exec "$@"
