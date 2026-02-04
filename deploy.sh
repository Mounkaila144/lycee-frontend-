#!/bin/bash

# Script de déploiement serveur
# Le build est fait par GitHub Actions, on ne fait que reload PM2

set -e

PROJECT_DIR="/var/www/gestion-scolaire-front"
PM2_APP_NAME="school-frontend"
LOG_FILE="$PROJECT_DIR/deploy.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "========================================="
log "🚀 Déploiement (build fait par GitHub Actions)"
log "========================================="

cd "$PROJECT_DIR"

# Pull
log "📥 Git pull..."
git pull origin master -q

# Reload PM2
log "🔄 PM2 reload..."
pm2 reload "$PM2_APP_NAME" --update-env

log "✅ Déploiement terminé!"
log "Les fichiers .next ont été synced par GitHub Actions"
