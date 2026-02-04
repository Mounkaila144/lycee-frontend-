# ⚡ Optimisations de Déploiement

Ce document explique les optimisations mises en place pour rendre le déploiement quasi-instantané.

## 📊 Gains de Performance

### Avant l'optimisation
```
┌─────────────────────┬──────────┐
│ Étape               │ Temps    │
├─────────────────────┼──────────┤
│ Git pull            │ ~5s      │
│ npm install         │ ~30-40s  │
│ npm run build       │ ~15-20s  │
│ PM2 restart         │ ~3-5s    │
├─────────────────────┼──────────┤
│ TOTAL               │ ~60s     │
└─────────────────────┴──────────┘
```

### Après l'optimisation
```
┌─────────────────────────────────┬──────────┐
│ Scénario                        │ Temps    │
├─────────────────────────────────┼──────────┤
│ Changement docs uniquement      │ ~3-5s    │
│ Changement code (sans deps)     │ ~15-20s  │
│ Changement avec dépendances     │ ~40-45s  │
└─────────────────────────────────┴──────────┘
```

**Gain moyen : 70-80% plus rapide** pour les déploiements courants ! 🚀

## ✨ Optimisations Implémentées

### 1. ⏭️ Skip npm install (intelligent)

```bash
# Détecte si package.json ou package-lock.json ont changé
if [ "$DEPS_CHANGED" = true ]; then
    npm install --production=false --prefer-offline
else
    log "Skip npm install (dépendances non modifiées)"
fi
```

**Économie** : ~30-40s quand les dépendances n'ont pas changé

### 2. ⏭️ Skip build (intelligent)

```bash
# Ne build que si des fichiers source ont changé
# Skip si seulement README.md, docs, etc.
if [ "$BUILD_NEEDED" = true ]; then
    npm run build
else
    log "Skip build (pas de changements source)"
fi
```

**Économie** : ~15-20s pour les changements de documentation

### 3. 🔄 PM2 Reload au lieu de Restart

```bash
# Zero-downtime reload au lieu de restart brutal
pm2 reload "$PM2_APP_NAME" --update-env
```

**Avantages** :
- ✅ Zero downtime (pas de coupure)
- ✅ Plus rapide (~2s au lieu de ~5s)
- ✅ Graceful shutdown

### 4. 📦 npm install --prefer-offline

```bash
npm install --production=false --prefer-offline
```

**Avantage** : Utilise le cache local quand possible (~20% plus rapide)

### 5. 🎯 Détection intelligente des fichiers

Le script analyse précisément quels fichiers ont changé :

```bash
CHANGED_FILES=$(git diff --name-only $OLD_COMMIT HEAD)
```

Puis décide intelligemment :
- 📝 `.md`, `.txt` → Skip build
- 🔧 `.sh`, `.yml` → Skip build
- 💾 `package.json` → npm install obligatoire
- 🎨 `.tsx`, `.jsx`, `.css` → Build obligatoire

## 🔥 Optimisations Supplémentaires (Optionnelles)

### Option 1 : Cache GitHub Actions

Ajouter au workflow `.github/workflows/deploy.yml` :

```yaml
- name: Cache Node modules
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

**Gain** : ~10-15s sur le runner GitHub Actions

### Option 2 : Build en parallèle avec GitHub Actions

Au lieu de builder sur le serveur, builder dans GitHub Actions :

```yaml
- name: Build
  run: npm run build

- name: Deploy via rsync
  run: |
    rsync -avz --delete .next/ user@server:/path/.next/
    ssh user@server "pm2 reload app"
```

**Avantages** :
- ✅ Build sur des machines plus puissantes
- ✅ Le serveur ne fait que recevoir les fichiers
- ⚠️ Nécessite plus de configuration

### Option 3 : Cache Next.js

Next.js cache automatiquement dans `.next/cache/`. Conservez ce dossier entre builds :

```bash
# Dans deploy.sh, ne pas supprimer .next/cache
npm run build  # Utilise automatiquement le cache
```

**Gain** : ~20-30% plus rapide pour les rebuilds incrémentaux

### Option 4 : Turborepo (pour projets multi-packages)

Si vous avez plusieurs apps/packages :

```json
{
  "scripts": {
    "build": "turbo run build"
  }
}
```

**Gain** : Build uniquement les packages modifiés

## 📈 Monitoring des Déploiements

### Voir les temps de déploiement

```bash
# Derniers déploiements avec durée
grep "Déploiement terminé" deploy.log | tail -10
```

### Statistiques détaillées

```bash
# Analyser les étapes qui prennent le plus de temps
grep -E "Skip|Build|npm install" deploy.log | tail -20
```

## 🎯 Cas d'Usage Réels

### Scénario 1 : Correction de typo dans README.md
```bash
Temps avant : ~60s
Temps après : ~3-5s
✅ Gain : 92%
```

### Scénario 2 : Modification d'un composant React
```bash
Temps avant : ~60s
Temps après : ~15-20s (skip npm install)
✅ Gain : 70%
```

### Scénario 3 : Ajout d'une nouvelle dépendance
```bash
Temps avant : ~60s
Temps après : ~40-45s
✅ Gain : 25%
```

### Scénario 4 : Modification de configuration (tsconfig, etc.)
```bash
Temps avant : ~60s
Temps après : ~15-20s
✅ Gain : 70%
```

## 🔍 Debugging

### Forcer un build complet

Si vous voulez forcer npm install et build :

```bash
# Sur le serveur
cd /var/www/gestion-scolaire-front
rm -rf node_modules .next
bash deploy.sh
```

### Voir ce qui est skippé

Les logs montrent clairement ce qui est exécuté ou skippé :

```bash
tail -f deploy.log
```

Vous verrez :
```
⏭️  Skip npm install (dépendances non modifiées)
⏭️  Skip build (pas de changements source)
```

## 💡 Conseils

1. **Commits atomiques** : Faites des commits ciblés (docs séparés du code)
2. **Branches feature** : Testez sur une branche avant master
3. **Messages clairs** : Facilitez le debugging avec des messages de commit descriptifs
4. **Monitoring** : Surveillez les temps dans GitHub Actions

## 🚀 Optimisations Futures

- [ ] Implémenter le cache GitHub Actions
- [ ] Tester le build dans GitHub Actions (plus puissant)
- [ ] Ajouter des health checks post-déploiement
- [ ] Implémenter un système de rollback automatique
- [ ] Ajouter des métriques de performance (Prometheus, Grafana)

## 📚 Ressources

- [PM2 Reload vs Restart](https://pm2.keymetrics.io/docs/usage/process-management/)
- [Next.js Build Cache](https://nextjs.org/docs/app/api-reference/next-config-js/cacheHandler)
- [GitHub Actions Cache](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)

---

**Dernière mise à jour** : 2026-02-04
