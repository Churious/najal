#!/bin/sh
set -e
echo "Running prisma migrate deploy..."
node ./node_modules/prisma/build/index.js migrate deploy || { echo "Migration failed. Exiting."; exit 1; }
echo "Starting Next.js standalone server..."
exec node server.js
