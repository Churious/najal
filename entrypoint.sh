#!/bin/sh
set -e
echo "Running prisma migrate deploy..."
npx prisma migrate deploy || { echo "Migration failed. Exiting."; exit 1; }
echo "Starting Next.js standalone server..."
exec node server.js
