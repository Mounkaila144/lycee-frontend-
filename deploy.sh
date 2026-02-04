#!/bin/bash

# Script de déploiement automatique optimisé
# Détection intelligente des changements

set -e

# Configuration
PROJECT_DIR="/var/www/gestion-scolaire-front"
PM2_APP_NAME="school-frontend"
LOG_FILE="$PROJECT_DIR/deploy.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "========================================="
log "⚡ Déploiement"
log "========================================="

cd "$PROJECT_DIR"

# Sauvegarder le commit actuel
OLD_COMMIT=$(git rev-parse HEAD)

# Pull
log "📥 Git pull..."
git pull origin master --quiet

# Détecter les fichiers modifiés
CHANGED_FILES=$(git diff --name-only $OLD_COMMIT HEAD)
log "📝 Fichiers modifiés:"
echo "$CHANGED_FILES" | sed 's/^/  - /' | tee -a "$LOG_FILE"

# Vérifier si package.json a changé
DEPS_CHANGED=false
if echo "$CHANGED_FILES" | grep -qE "^(package\.json|package-lock\.json)$"; then
    DEPS_CHANGED=true
    log "📦 Dépendances modifiées"
fi

# npm install seulement si nécessaire
if [ "$DEPS_CHANGED" = true ]; then
    log "📦 npm install..."
    npm install --production=false --prefer-offline
else
    log "⏭️  Skip npm install"
fi

# Build
log "🔨 Build..."
npm run build

# Reload PM2
log "🔄 PM2 reload..."
pm2 reload "$PM2_APP_NAME" --update-env

log "✅ Terminé!"
