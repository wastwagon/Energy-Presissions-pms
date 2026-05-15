#!/bin/sh
cd /app

# Anonymous node_modules volume starts empty; install from lockfile before start.
if [ ! -f node_modules/.deps-ready ]; then
  echo "Installing frontend dependencies (first start or fresh volume)..."
  if [ -f package-lock.json ]; then
    npm ci --legacy-peer-deps || npm install --legacy-peer-deps
  else
    npm install --legacy-peer-deps
  fi
  touch node_modules/.deps-ready
fi

exec npm start
