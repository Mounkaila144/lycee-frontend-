# Guide de Déploiement Continu avec GitHub Actions

Ce guide explique comment le système de déploiement continu fonctionne avec GitHub Actions.

## 📋 Vue d'ensemble

Le système fonctionne comme suit :
1. Vous faites un `git push` sur la branche `master`
2. GitHub Actions se déclenche automatiquement
3. Le workflow se connecte au serveur via SSH
4. Le script `deploy.sh` est exécuté : `git pull`, `npm build`, et redémarrage PM2
5. Vous recevez une notification du résultat dans l'onglet Actions de GitHub

## ✅ Avantages de GitHub Actions

- **Intégration native** : Logs centralisés dans GitHub
- **Sécurité** : Pas de serveur webhook à maintenir
- **Fiabilité** : Retries automatiques en cas d'échec
- **Visibilité** : Interface graphique pour suivre les déploiements
- **Notifications** : Alertes automatiques par email

## 🔧 Configuration Initiale

### 1. Clé SSH (déjà configurée)

Une clé SSH dédiée a été créée pour GitHub Actions :

```bash
# Clé publique dans authorized_keys
~/.ssh/github_actions.pub

# Clé privée ajoutée aux secrets GitHub
~/.ssh/github_actions
```

### 2. Secrets GitHub (requis)

Les secrets suivants doivent être configurés dans GitHub :

**Repository** → **Settings** → **Secrets and variables** → **Actions**

| Secret | Valeur | Description |
|--------|--------|-------------|
| `SSH_HOST` | `school.ptrniger.com` | Domaine du serveur |
| `SSH_USER` | `root` | Utilisateur SSH |
| `SSH_PRIVATE_KEY` | *(clé privée complète)* | Clé SSH pour connexion |
| `SSH_PORT` | `22` | Port SSH (optionnel) |

### 3. Workflow GitHub Actions

Le workflow est défini dans `.github/workflows/deploy.yml` et :

- Se déclenche sur **push vers master**
- Utilise l'action `appleboy/ssh-action` pour se connecter au serveur
- Exécute le script `deploy.sh`
- Affiche le résultat dans l'onglet Actions

## 🚀 Utilisation

### Déployer une nouvelle version

```bash
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin master
```

Le déploiement se lance automatiquement ! 🎉

### Suivre le déploiement

1. Allez sur votre repository GitHub
2. Cliquez sur l'onglet **Actions**
3. Vous verrez le workflow "Deploy to Production" en cours
4. Cliquez dessus pour voir les logs en temps réel

### Redéployer une version précédente

1. Allez dans l'onglet **Actions**
2. Trouvez le workflow que vous voulez redéployer
3. Cliquez sur **Re-run jobs**

## 📝 Script de Déploiement

Le script `deploy.sh` effectue les opérations suivantes :

```bash
1. Vérification de la branche (doit être master)
2. Fetch des modifications depuis Git
3. Stash des modifications locales si nécessaire
4. Pull des dernières modifications
5. Installation des dépendances (npm ci)
6. Build du projet (npm run build)
7. Redémarrage PM2
8. Restauration des modifications locales
```

### Logs de déploiement

```bash
# Voir les logs du script de déploiement
tail -f /var/www/gestion-scolaire-front/deploy.log

# Voir les logs de l'application PM2
pm2 logs school-frontend
```

## 🔍 Dépannage

### Le workflow échoue avec "Permission denied"

- Vérifiez que la clé SSH privée est correctement configurée dans les secrets GitHub
- Vérifiez que la clé publique est dans `~/.ssh/authorized_keys`

### Le build échoue

- Vérifiez les logs dans l'onglet Actions sur GitHub
- Vérifiez les logs locaux : `cat /var/www/gestion-scolaire-front/deploy.log`
- Vérifiez que les dépendances sont à jour

### L'application ne redémarre pas

```bash
# Vérifier le statut PM2
pm2 status

# Redémarrer manuellement
pm2 restart school-frontend

# Voir les logs d'erreur
pm2 logs school-frontend --err
```

## 🏗️ Architecture

### Structure des fichiers

```
/var/www/gestion-scolaire-front/
├── .github/
│   └── workflows/
│       ├── deploy.yml          # Workflow GitHub Actions
│       └── README.md            # Documentation workflow
├── deploy.sh                    # Script de déploiement
├── ecosystem.config.js          # Configuration PM2
├── deploy.log                   # Logs de déploiement
└── logs/                        # Logs de l'application
    ├── app-error.log
    ├── app-out.log
    └── app-combined.log
```

### Configuration PM2

```javascript
{
  name: 'school-frontend',
  script: 'npm',
  args: 'start',
  env: {
    NODE_ENV: 'production',
    PORT: 3000
  }
}
```

### Configuration Apache

Apache proxifie les requêtes :
- `/api/*` → Laravel backend
- `/storage/*` → Fichiers Laravel
- `/*` → Next.js (port 3000)

## 📊 Monitoring

### Vérifier l'état de l'application

```bash
# Statut PM2
pm2 status

# Informations détaillées
pm2 info school-frontend

# Métriques en temps réel
pm2 monit
```

### Logs en temps réel

```bash
# Tous les logs
pm2 logs school-frontend

# Seulement les erreurs
pm2 logs school-frontend --err

# Dernières 100 lignes
pm2 logs school-frontend --lines 100
```

## 🔄 Rollback Manuel

En cas de problème, vous pouvez revenir à une version précédente :

```bash
cd /var/www/gestion-scolaire-front

# Voir les derniers commits
git log --oneline -10

# Revenir à un commit précédent
git checkout <commit-hash>

# Rebuild et redémarrer
npm ci
npm run build
pm2 restart school-frontend
```

## 🛠️ Maintenance

### Mettre à jour Node.js ou npm

```bash
# Vérifier la version actuelle
node -v
npm -v

# Après mise à jour, redémarrer l'app
pm2 restart school-frontend
```

### Nettoyer les anciens builds

```bash
cd /var/www/gestion-scolaire-front

# Nettoyer le cache
npm cache clean --force

# Supprimer node_modules et réinstaller
rm -rf node_modules .next
npm ci
npm run build
pm2 restart school-frontend
```

### Sauvegarder la configuration PM2

```bash
# Sauvegarder l'état actuel
pm2 save

# Configurer le démarrage automatique
pm2 startup
```

## 🚀 Améliorations Futures

- [ ] Notifications Slack/Discord lors des déploiements
- [ ] Tests automatiques avant déploiement
- [ ] Rollback automatique en cas d'erreur
- [ ] Déploiement Blue/Green pour zero-downtime
- [ ] Health check après déploiement
- [ ] Intégration avec un système de monitoring (Sentry, New Relic)

## 📚 Ressources

- [Documentation GitHub Actions](https://docs.github.com/en/actions)
- [Documentation PM2](https://pm2.keymetrics.io/docs/)
- [Documentation Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Dernière mise à jour** : 2026-02-04 - Migration vers GitHub Actions ✅
