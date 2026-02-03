# Guide Rapide - Déploiement Continu

## ✅ Ce qui est déjà configuré

- ✅ Script de déploiement (`deploy.sh`)
- ✅ Serveur webhook (`webhook-server.js`)
- ✅ Configuration PM2 (`ecosystem.config.js`)
- ✅ Les deux services sont démarrés et fonctionnent :
  - `school-frontend` sur le port 3000
  - `webhook-server` sur le port 9002
- ✅ Secret sécurisé généré et configuré

## 🔑 Votre Secret Webhook

Votre secret webhook sécurisé a été généré :

```
aa41dbc1f2fa29f3409797e42d231665544e7d56daf70426f72564f97f607e44
```

**⚠️ Gardez ce secret confidentiel !** Vous en aurez besoin pour la configuration GitHub.

## 📋 Prochaines étapes

### 1. Ouvrir le port du firewall (si nécessaire)

```bash
sudo ufw allow 9002
sudo ufw reload
```

### 2. Configurer le webhook sur GitHub

1. Allez sur votre repository GitHub
2. Cliquez sur **Settings** → **Webhooks** → **Add webhook**
3. Configurez :

   - **Payload URL** : `http://VOTRE_IP_SERVEUR:9002/webhook`
     - Remplacez `VOTRE_IP_SERVEUR` par l'IP publique de votre serveur

   - **Content type** : `application/json`

   - **Secret** : Collez le secret ci-dessus

   - **Which events would you like to trigger this webhook?**
     - Sélectionnez "Just the `push` event"

   - **Active** : ✓ Coché

4. Cliquez sur **Add webhook**

### 3. Tester le webhook

Après avoir créé le webhook sur GitHub :

1. GitHub envoie automatiquement un "ping". Vérifiez les logs :

```bash
pm2 logs webhook-server --lines 20
```

Vous devriez voir : `🏓 Ping reçu de GitHub`

2. Faites un commit et push sur la branche master :

```bash
git add .
git commit -m "test: trigger deployment"
git push origin master
```

3. Suivez le déploiement en temps réel :

```bash
# Logs du webhook
tail -f /var/www/gestion-scolaire-front/webhook.log

# Logs du déploiement
tail -f /var/www/gestion-scolaire-front/deploy.log
```

## 🔒 Option Recommandée : Utiliser HTTPS avec un domaine

Si vous avez un nom de domaine, il est **fortement recommandé** d'utiliser un reverse proxy Nginx avec HTTPS :

```nginx
server {
    listen 443 ssl http2;
    server_name webhook.votre-domaine.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location /webhook {
        proxy_pass http://localhost:9002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Dans ce cas, l'URL du webhook sera : `https://webhook.votre-domaine.com/webhook`

## 📊 Commandes utiles

```bash
# Vérifier l'état des services
pm2 status

# Voir les logs en temps réel
pm2 logs webhook-server
pm2 logs school-frontend

# Redémarrer un service
pm2 restart webhook-server
pm2 restart school-frontend

# Tester manuellement le déploiement
bash /var/www/gestion-scolaire-front/deploy.sh

# Voir les derniers déploiements
tail -50 /var/www/gestion-scolaire-front/deploy.log
```

## 🎯 Workflow de déploiement

1. Vous faites `git push` sur la branche master
2. GitHub envoie un webhook à votre serveur
3. Le serveur webhook reçoit la notification
4. Le script `deploy.sh` s'exécute automatiquement :
   - `git pull` pour récupérer les changements
   - `pnpm install` pour mettre à jour les dépendances
   - `pnpm build` pour rebuilder l'application
   - `pm2 restart school-frontend` pour redémarrer l'app
5. Votre application est à jour !

## ❓ Problèmes courants

### Le webhook ne se déclenche pas

- Vérifiez que le port 9002 est ouvert dans le firewall
- Vérifiez les logs : `pm2 logs webhook-server`
- Testez la connectivité depuis GitHub : Settings → Webhooks → Recent Deliveries

### Erreur "Invalid signature"

- Vérifiez que le secret dans GitHub correspond exactement au secret configuré

### Le build échoue

- Vérifiez l'espace disque : `df -h`
- Vérifiez les logs : `tail -f deploy.log`
- Testez manuellement : `bash deploy.sh`

## 📖 Documentation complète

Pour plus de détails, consultez le fichier `DEPLOY.md`.
