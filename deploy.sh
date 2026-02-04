#!/bin/bash
set -e

cd /var/www/gestion-scolaire-front

echo "[$(date '+%H:%M:%S')] 📥 Pull..."
git pull -q

echo "[$(date '+%H:%M:%S')] 🔨 Build..."
npm run build --silent

echo "[$(date '+%H:%M:%S')] 🔄 Reload..."
pm2 reload school-frontend

echo "[$(date '+%H:%M:%S')] ✅ Done!"
