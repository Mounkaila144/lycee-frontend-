#!/bin/bash

# Script de déploiement automatique
# Ce script est exécuté lors d'un push sur la branche master

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
log "Démarrage du déploiement"
log "========================================="

# Se déplacer dans le répertoire du projet
cd "$PROJECT_DIR"

# Sauvegarder la branche actuelle
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
log "Branche actuelle: $CURRENT_BRANCH"

# Vérifier qu'on est sur master
if [ "$CURRENT_BRANCH" != "master" ]; then
    log "ERREUR: Le déploiement ne fonctionne que sur la branche master"
    exit 1
fi

# Récupérer les dernières modifications
log "Récupération des modifications depuis Git..."
git fetch origin master

# Vérifier s'il y a des changements
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/master)

if [ "$LOCAL" = "$REMOTE" ]; then
    log "Aucune modification détectée, déploiement annulé"
    exit 0
fi

log "Nouvelles modifications détectées"

# Stash les modifications locales si nécessaire
if ! git diff-index --quiet HEAD --; then
    log "Sauvegarde des modifications locales..."
    git stash
    STASHED=true
fi

# Pull les modifications
log "Pull des modifications..."
git pull origin master

# Installer/mettre à jour les dépendances
log "Vérification des dépendances..."
npm ci

# Build du projet
log "Build du projet (cela peut prendre quelques minutes)..."
npm run build

# Redémarrer PM2
log "Redémarrage de l'application PM2..."
pm2 restart "$PM2_APP_NAME"

# Restaurer les modifications locales si elles ont été stashed
if [ "$STASHED" = true ]; then
    log "Restauration des modifications locales..."
    git stash pop
fi

log "========================================="
log "Déploiement terminé avec succès!"
log "========================================="

# Afficher l'état de l'application
pm2 info "$PM2_APP_NAME" --no-daemon
