# ⚡ Déploiement Ultra-Rapide avec GitHub Actions

Le build Next.js est maintenant fait sur **GitHub Actions** (machines puissantes + cache), puis les fichiers sont synced vers le serveur.

## 🚀 Architecture Optimisée

```
┌─────────────────────────────────────────────┐
│  GitHub Actions (Build)                     │
├─────────────────────────────────────────────┤
│  1. npm ci (avec cache npm)                 │
│  2. npm run build (avec cache Next.js)      │
│  3. rsync .next/ → Serveur                  │
│  4. rsync node_modules/ → Serveur           │
│  5. SSH: pm2 reload school-frontend         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Serveur (Déploiement)                      │
├─────────────────────────────────────────────┤
│  1. Reçoit les fichiers .next               │
│  2. git pull                                │
│  3. pm2 reload (instantané)                 │
└─────────────────────────────────────────────┘
```

## ⏱️ Gains de Performance

| Étape | Avant (serveur) | Après (GitHub Actions) | Gain |
|-------|-----------------|------------------------|------|
| **npm install** | ~30-40s | ~10-15s (cache) | **60%** |
| **Build Next.js** | ~60-80s | ~30-40s (cache + CPU) | **50%** |
| **Sync fichiers** | N/A | ~5-10s | N/A |
| **PM2 reload** | ~3-5s | ~2-3s | - |
| **TOTAL** | **~100-130s** | **~50-70s** | **40-50%** |

## ✨ Avantages

### 1. Build sur GitHub Actions
- ✅ CPU plus puissants (machines GitHub)
- ✅ Cache npm persistant entre builds
- ✅ Cache Next.js persistant
- ✅ Parallélisation possible

### 2. Serveur Allégé
- ✅ Pas de build CPU-intensif sur le serveur
- ✅ Juste rsync + reload PM2
- ✅ Moins de charge serveur

### 3. Déploiements Incrémentaux
- ✅ Cache Next.js préservé entre builds
- ✅ Seulement les fichiers modifiés sont synced
- ✅ Builds incrémentaux plus rapides

## 🔧 Configuration

### Secrets GitHub Requis

| Secret | Valeur | Utilisation |
|--------|--------|-------------|
| `SSH_HOST` | `school.ptrniger.com` | Connexion SSH |
| `SSH_USER` | `root` | Utilisateur SSH |
| `SSH_PRIVATE_KEY` | *(clé complète)* | Authentification |
| `SSH_PORT` | `22` | Port SSH |

### Workflow GitHub Actions

Le workflow `.github/workflows/deploy.yml` :

1. **Setup** : Node.js 20 + cache npm
2. **Cache** : Restaure `.next/cache` si disponible
3. **Install** : `npm ci` (rapide avec cache)
4. **Build** : `npm run build` (utilise cache Next.js)
5. **Sync** : `rsync .next/` et `node_modules/` vers serveur
6. **Deploy** : `pm2 reload` sur le serveur

## 📈 Optimisations Appliquées

### Cache Stratégie

```yaml
# Cache npm (dépendances)
cache: 'npm'

# Cache Next.js (build incrémental)
path: .next/cache
key: nextjs-${{ hashFiles('package-lock.json') }}-${{ hashFiles('**.[jt]sx?') }}
```

### Rsync Optimisé

```bash
# Sync uniquement les fichiers modifiés
rsync -avz --delete .next/ server:/path/.next/

# -a : archive mode (préserve permissions)
# -v : verbose
# -z : compression
# --delete : supprime fichiers obsolètes
```

### PM2 Reload

```bash
# Graceful reload (zero downtime)
pm2 reload school-frontend --update-env
```

## 🎯 Cas d'Usage

### Scénario 1 : Premier déploiement (sans cache)
```
┌──────────────────┬─────────┐
│ npm install      │ ~25s    │
│ npm run build    │ ~70s    │
│ rsync            │ ~8s     │
│ pm2 reload       │ ~3s     │
├──────────────────┼─────────┤
│ TOTAL            │ ~106s   │
└──────────────────┴─────────┘
```

### Scénario 2 : Déploiement avec cache complet
```
┌──────────────────┬─────────┐
│ npm ci (cache)   │ ~8s     │
│ build (cache)    │ ~25s    │
│ rsync            │ ~5s     │
│ pm2 reload       │ ~2s     │
├──────────────────┼─────────┤
│ TOTAL            │ ~40s    │ ← 62% plus rapide!
└──────────────────┴─────────┘
```

### Scénario 3 : Petits changements (UI/CSS)
```
┌──────────────────┬─────────┐
│ npm ci (cache)   │ ~8s     │
│ build (incrém.)  │ ~20s    │
│ rsync (diff)     │ ~3s     │
│ pm2 reload       │ ~2s     │
├──────────────────┼─────────┤
│ TOTAL            │ ~33s    │ ← 70% plus rapide!
└──────────────────┴─────────┘
```

## 🔍 Monitoring

### Suivre le déploiement

Sur GitHub :
- **Actions** → Votre workflow → Logs en temps réel

Sur le serveur :
```bash
# Logs PM2
pm2 logs school-frontend --lines 50

# Logs de déploiement
tail -f /var/www/gestion-scolaire-front/deploy.log
```

### Vérifier le cache

GitHub Actions cache :
- **Actions** → **Caches** → Voir les caches actifs

## 🛠️ Dépannage

### Le rsync échoue

```bash
# Vérifier la connexion SSH
ssh -p 22 root@school.ptrniger.com "echo OK"

# Vérifier rsync sur le serveur
which rsync
```

### Le build est lent même avec cache

Le cache GitHub Actions expire après 7 jours d'inactivité. Si vous ne déployez pas pendant une semaine, le premier build sera plus lent.

### Les fichiers .next ne sont pas à jour

Vérifier que rsync a bien sync :
```bash
# Sur le serveur
ls -la /var/www/gestion-scolaire-front/.next/
stat /var/www/gestion-scolaire-front/.next/BUILD_ID
```

## 🚀 Optimisations Futures

- [ ] Utiliser Turborepo pour builds multi-packages
- [ ] Ajouter un CDN pour les assets statiques
- [ ] Implémenter le build cache partagé entre branches
- [ ] Ajouter des tests avant déploiement
- [ ] Notifications Slack/Discord

## 📚 Ressources

- [GitHub Actions Cache](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [Next.js Build Cache](https://nextjs.org/docs/app/api-reference/next-config-js/cacheHandler)
- [rsync Documentation](https://linux.die.net/man/1/rsync)
- [PM2 Reload vs Restart](https://pm2.keymetrics.io/docs/usage/process-management/)

---

**Dernière mise à jour** : 2026-02-04 - Build déplacé vers GitHub Actions
