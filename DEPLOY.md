# Guide de Configuration du Déploiement Continu

Ce guide explique comment configurer le système de déploiement continu pour ce projet.

## 📋 Vue d'ensemble

Le système fonctionne comme suit :
1. Vous faites un `git push` sur la branche `master`
2. GitHub envoie un webhook à votre serveur
3. Le serveur webhook reçoit la notification et exécute le script de déploiement
4. Le script fait `git pull`, `pnpm build`, et redémarre PM2

## 🔧 Installation

### 1. Créer les répertoires nécessaires

```bash
mkdir -p /var/www/gestion-scolaire-front/logs
```

### 2. Rendre le script de déploiement exécutable

```bash
chmod +x /var/www/gestion-scolaire-front/deploy.sh
```

### 3. Générer un secret sécurisé

```bash
openssl rand -hex 32
```

Copiez le résultat et mettez-le dans :
- Le fichier `.env.webhook` (variable `WEBHOOK_SECRET`)
- Le fichier `ecosystem.config.js` (dans l'app `webhook-server`, variable `WEBHOOK_SECRET`)

⚠️ **IMPORTANT** : Ce secret doit être le même dans les deux fichiers ET dans la configuration du webhook GitHub !

### 4. Démarrer les services avec PM2

```bash
cd /var/www/gestion-scolaire-front

# Arrêter l'ancienne instance si elle existe
pm2 delete school-frontend 2>/dev/null || true

# Démarrer avec le nouveau fichier ecosystem
pm2 start ecosystem.config.js

# Sauvegarder la configuration PM2
pm2 save

# S'assurer que PM2 démarre au boot
pm2 startup
```

### 5. Vérifier que tout fonctionne

```bash
# Vérifier l'état des processus
pm2 status

# Vérifier les logs du webhook
pm2 logs webhook-server --lines 50

# Tester l'endpoint de santé
curl http://localhost:9000/health
```

## 🔒 Configuration du Webhook sur GitHub

### 1. Aller dans les paramètres du repository

1. Ouvrez votre repository sur GitHub
2. Allez dans **Settings** → **Webhooks** → **Add webhook**

### 2. Configurer le webhook

- **Payload URL** : `http://VOTRE_SERVEUR_IP:9002/webhook`
  - Remplacez `VOTRE_SERVEUR_IP` par l'IP publique de votre serveur
  - Ou utilisez un nom de domaine si vous en avez un

- **Content type** : `application/json`

- **Secret** : Collez le secret généré à l'étape 3 de l'installation

- **Which events would you like to trigger this webhook?**
  - Sélectionnez "Just the `push` event"

- **Active** : Cochez la case

- Cliquez sur **Add webhook**

### 3. Tester le webhook

GitHub envoie automatiquement un événement "ping" lors de la création. Vous pouvez vérifier :

```bash
# Voir les logs du serveur webhook
pm2 logs webhook-server

# Ou voir le fichier de log directement
tail -f /var/www/gestion-scolaire-front/webhook.log
```

Vous devriez voir un message `🏓 Ping reçu de GitHub`.

## 🔐 Sécurité : Utiliser un Reverse Proxy (Recommandé)

### Pourquoi ?

- Éviter d'exposer directement le port 9000
- Utiliser HTTPS pour sécuriser les communications
- Meilleure gestion des certificats SSL

### Configuration avec Nginx

Ajoutez cette configuration à votre Nginx :

```nginx
server {
    listen 80;
    server_name webhook.votre-domaine.com;

    # Redirection vers HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name webhook.votre-domaine.com;

    ssl_certificate /etc/letsencrypt/live/webhook.votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/webhook.votre-domaine.com/privkey.pem;

    location /webhook {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Puis rechargez Nginx :

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Dans ce cas, l'URL du webhook GitHub sera : `https://webhook.votre-domaine.com/webhook`

**Note:** Dans la configuration Nginx ci-dessus, remplacez `http://localhost:9000` par `http://localhost:9002`

## 📊 Surveillance et Logs

### Logs du déploiement

```bash
# Voir les logs de déploiement
tail -f /var/www/gestion-scolaire-front/deploy.log

# Voir les logs du webhook
tail -f /var/www/gestion-scolaire-front/webhook.log

# Logs PM2
pm2 logs
pm2 logs webhook-server
pm2 logs school-frontend
```

### Commandes utiles

```bash
# Redémarrer le serveur webhook
pm2 restart webhook-server

# Redémarrer l'application
pm2 restart school-frontend

# Voir l'état détaillé
pm2 info webhook-server
pm2 info school-frontend

# Voir les métriques en temps réel
pm2 monit
```

## 🧪 Test manuel du déploiement

Pour tester le script de déploiement sans passer par GitHub :

```bash
cd /var/www/gestion-scolaire-front
bash deploy.sh
```

## ❌ Dépannage

### Le webhook ne reçoit rien

1. Vérifiez que le serveur webhook est en cours d'exécution :
   ```bash
   pm2 status webhook-server
   ```

2. Vérifiez que le port est ouvert :
   ```bash
   sudo netstat -tlnp | grep 9002
   ```

3. Vérifiez le firewall :
   ```bash
   sudo ufw status
   # Si nécessaire, ouvrir le port
   sudo ufw allow 9002
   ```

4. Testez depuis GitHub :
   - Allez dans Settings → Webhooks
   - Cliquez sur votre webhook
   - Cliquez sur "Recent Deliveries"
   - Vérifiez le statut de la dernière livraison

### Erreur de signature invalide

- Vérifiez que le secret est identique dans :
  - `.env.webhook`
  - `ecosystem.config.js`
  - Configuration du webhook GitHub

### Le build échoue

```bash
# Vérifier les logs
tail -f /var/www/gestion-scolaire-front/deploy.log

# Vérifier l'espace disque
df -h

# Vérifier les permissions
ls -la /var/www/gestion-scolaire-front
```

### PM2 ne redémarre pas

```bash
# Vérifier que l'app existe
pm2 list

# Forcer le redémarrage
pm2 restart school-frontend --update-env
```

## 🔄 Mise à jour du système

Si vous modifiez les fichiers de configuration :

```bash
# Après modification de ecosystem.config.js
pm2 delete all
pm2 start ecosystem.config.js
pm2 save

# Après modification de webhook-server.js
pm2 restart webhook-server

# Après modification de deploy.sh
chmod +x deploy.sh
```

## 📝 Notes importantes

- Le déploiement se fait **uniquement sur la branche master**
- Le build peut prendre quelques minutes
- Pendant le build, l'application continue de fonctionner
- Le redémarrage PM2 provoque une courte interruption (< 1 seconde)
- Les logs sont conservés dans le dossier `logs/`
- Pensez à monitorer l'espace disque (les logs peuvent grossir)

## 🎯 Workflow recommandé

1. Développez sur une branche de feature
2. Testez localement
3. Créez une Pull Request vers master
4. Après review et merge, le déploiement se fait automatiquement
5. Vérifiez les logs pour confirmer le succès du déploiement

## 🚀 Améliorations futures possibles

- [ ] Notifications Slack/Discord lors des déploiements
- [ ] Tests automatiques avant déploiement
- [ ] Rollback automatique en cas d'erreur
- [ ] Déploiement Blue/Green pour zero-downtime
- [ ] Health check après déploiement
- [ ] Intégration avec un système de monitoring (Sentry, New Relic, etc.)

---

**Dernière mise à jour** : 2026-02-03 - Système de déploiement automatique testé et fonctionnel ✅
