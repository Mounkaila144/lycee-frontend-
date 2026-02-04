#!/bin/bash

# Script de déploiement automatique optimisé
# Détection intelligente des changements pour un déploiement ultra-rapide

set -e  # Arrêter le script en cas d'erreur

# Configuration
PROJECT_DIR="/var/www/gestion-scolaire-front"
PM2_APP_NAME="school-frontend"
LOG_FILE="$PROJECT_DIR/deploy.log"

# Fonction de logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "========================================="
log "⚡ Déploiement rapide démarré"
log "========================================="

# Se déplacer dans le répertoire du projet
cd "$PROJECT_DIR"

# Sauvegarder la branche actuelle
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
log "Branche: $CURRENT_BRANCH"

# Vérifier qu'on est sur master
if [ "$CURRENT_BRANCH" != "master" ]; then
    log "❌ ERREUR: Le déploiement ne fonctionne que sur la branche master"
    exit 1
fi

# Sauvegarder le commit actuel pour comparaison
OLD_COMMIT=$(git rev-parse HEAD)

# Récupérer les dernières modifications
log "📡 Fetch depuis Git..."
git fetch origin master

# Vérifier s'il y a des changements
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/master)

if [ "$LOCAL" = "$REMOTE" ]; then
    log "✅ Aucune modification, déploiement annulé"
    exit 0
fi

log "📦 Nouvelles modifications détectées"

# Stash les modifications locales si nécessaire
if ! git diff-index --quiet HEAD --; then
    log "💾 Sauvegarde des modifications locales..."
    git stash
    STASHED=true
fi

# Pull les modifications
log "⬇️  Pull des modifications..."
git pull origin master --quiet

# Détecter les fichiers modifiés
CHANGED_FILES=$(git diff --name-only $OLD_COMMIT HEAD)
log "📝 Fichiers modifiés:"
echo "$CHANGED_FILES" | sed 's/^/  - /' | tee -a "$LOG_FILE"

# Vérifier si package.json ou package-lock.json ont changé
DEPS_CHANGED=false
if echo "$CHANGED_FILES" | grep -qE "^(package\.json|package-lock\.json)$"; then
    DEPS_CHANGED=true
    log "📦 Dépendances modifiées détectées"
fi

# Vérifier si un build est nécessaire
# Skip build si seulement des fichiers non-source ont changé
BUILD_NEEDED=true
if echo "$CHANGED_FILES" | grep -qvE "\.(tsx?|jsx?|css|scss|json|md|txt|sh|yml|yaml)$"; then
    BUILD_NEEDED=true
elif echo "$CHANGED_FILES" | grep -qE "\.(md|txt|LICENSE|gitignore|env\.example)$" && \
     ! echo "$CHANGED_FILES" | grep -qvE "\.(md|txt|LICENSE|gitignore|env\.example)$"; then
    BUILD_NEEDED=false
    log "⏭️  Seuls des fichiers de documentation modifiés, build non nécessaire"
fi

# Vérifier si des fichiers source ont vraiment changé
if echo "$CHANGED_FILES" | grep -qE "^src/.*\.(tsx?|jsx?|css|scss)$"; then
    BUILD_NEEDED=true
    log "🔨 Fichiers source modifiés, build nécessaire"
fi

# Installer les dépendances seulement si nécessaire
if [ "$DEPS_CHANGED" = true ]; then
    log "📦 Installation des dépendances..."
    npm install --production=false --prefer-offline
else
    log "⏭️  Skip npm install (dépendances non modifiées)"
fi

# Build seulement si nécessaire
if [ "$BUILD_NEEDED" = true ]; then
    log "🔨 Build du projet..."
    npm run build
else
    log "⏭️  Skip build (pas de changements source)"
fi

# Reload PM2 (zero-downtime, plus rapide que restart)
log "🔄 Reload de l'application (zero-downtime)..."
pm2 reload "$PM2_APP_NAME" --update-env

# Restaurer les modifications locales si elles ont été stashed
if [ "$STASHED" = true ]; then
    log "♻️  Restauration des modifications locales..."
    git stash pop
fi

log "========================================="
log "✅ Déploiement terminé avec succès!"
log "========================================="

# Afficher l'état de l'application
pm2 describe "$PM2_APP_NAME" | grep -E "status|uptime|restarts" | tee -a "$LOG_FILE"
