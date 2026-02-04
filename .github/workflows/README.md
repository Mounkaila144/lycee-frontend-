# GitHub Actions - Déploiement Automatique

Ce projet utilise GitHub Actions pour déployer automatiquement sur le serveur de production lors d'un push sur la branche `master`.

## 🔧 Configuration des Secrets GitHub

Pour que le workflow fonctionne, vous devez configurer les secrets suivants dans votre repository GitHub :

1. Allez sur votre repository GitHub
2. Cliquez sur **Settings** > **Secrets and variables** > **Actions**
3. Cliquez sur **New repository secret** et ajoutez :

### Secrets requis :

| Secret | Valeur | Description |
|--------|--------|-------------|
| `SSH_HOST` | `school.ptrniger.com` | Nom de domaine ou IP du serveur |
| `SSH_USER` | `root` | Utilisateur SSH |
| `SSH_PRIVATE_KEY` | *Voir ci-dessous* | Clé privée SSH complète |
| `SSH_PORT` | `22` | Port SSH (optionnel, défaut: 22) |

### 🔑 Clé SSH Privée

La clé privée SSH a été générée et configurée sur le serveur. Copiez **TOUT** le contenu de la clé privée (y compris les lignes `-----BEGIN` et `-----END`).

Pour récupérer la clé :

```bash
cat ~/.ssh/github_actions
```

## 🚀 Fonctionnement

1. **Déclencheur** : Push sur la branche `master`
2. **Actions** :
   - Checkout du code
   - Connexion SSH au serveur
   - Exécution du script `deploy.sh`
3. **Résultat** : L'application est automatiquement mise à jour

## 📋 Script de déploiement

Le workflow exécute le script `deploy.sh` qui :
- Pull les dernières modifications de Git
- Installe les dépendances avec `npm ci`
- Build le projet avec `npm run build`
- Redémarre l'application PM2

## 🔒 Sécurité

- Une clé SSH dédiée a été créée spécifiquement pour GitHub Actions
- La clé privée est stockée de manière sécurisée dans les secrets GitHub
- Seuls les membres autorisés du repository peuvent modifier les secrets

## ⚠️ Important

- Ne commitez **JAMAIS** la clé privée dans le repository
- Les secrets GitHub sont chiffrés et ne sont jamais exposés dans les logs
- Seuls les workflows GitHub Actions peuvent accéder aux secrets

## 📊 Logs de déploiement

Pour voir les logs :
- **GitHub Actions** : Onglet "Actions" de votre repository
- **Serveur** : `tail -f /var/www/gestion-scolaire-front/deploy.log`

## 🛠️ Dépannage

Si le déploiement échoue :

1. Vérifiez les logs dans l'onglet **Actions** sur GitHub
2. Vérifiez que tous les secrets sont correctement configurés
3. Testez la connexion SSH manuellement :
   ```bash
   ssh -i ~/.ssh/github_actions root@school.ptrniger.com
   ```

## 🔄 Migration depuis Webhook

Ce système remplace l'ancien système de webhook. Les avantages :
- ✅ Meilleure intégration avec GitHub
- ✅ Logs centralisés dans GitHub
- ✅ Pas besoin de maintenir un serveur webhook
- ✅ Retries automatiques en cas d'échec
- ✅ Notifications intégrées
