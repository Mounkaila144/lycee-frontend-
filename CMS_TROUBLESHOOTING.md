# 🔧 CMS Frontend - Dépannage

## Problèmes courants et solutions

### ❌ Erreur : "Failed to parse URL from /api/cms/..."

**Symptôme** :
```
Failed to parse URL from /api/cms/menus/location/header
```

**Cause** : URL de l'API mal configurée ou serveur Next.js pas redémarré

**Solution** :

1. ✅ Vérifiez `.env` :
```env
NEXT_PUBLIC_API_URL=http://api.local/api
```

2. ✅ **Redémarrez le serveur Next.js** :
```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez :
npm run dev
```

3. ✅ Vérifiez que `api.local` est accessible :
```bash
curl http://api.local/api/cms/pages
```

---

### ❌ Erreur 404 : "GET http://api.local/en/cms 404"

**Symptôme** :
```
GET http://api.local/en/cms 404 (Not Found)
```

**Cause** : Next.js essaie d'appeler l'API avec le préfixe de langue

**Solution** :

C'est normal ! L'erreur 404 vient de la route Next.js, pas de l'API.

Vérifiez plutôt :
1. ✅ Que vous avez créé une page "home" dans le CMS Admin avec `template: "home"`
2. ✅ Que la page est `published` et `is_active: true`
3. ✅ Regardez la console serveur (terminal) pour les vrais messages d'erreur

---

### ❌ Erreur CORS

**Symptôme** :
```
Access to fetch at 'http://api.local/api/cms/pages' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

**Cause** : Laravel bloque les requêtes depuis Next.js

**Solution** :

Dans Laravel, éditez `config/cors.php` :

```php
<?php

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
```

Redémarrez Laravel après modification.

---

### ❌ Pages CMS vides ou erreur 404

**Symptôme** : La page `/en/cms/about` affiche une erreur 404

**Cause** : Page non publiée, inactive ou slug incorrect

**Solution** :

1. ✅ Vérifiez dans le CMS Admin (`/superadmin/cms/pages`) :
   - `slug` = "about" (exactement)
   - `status` = "published"
   - `is_active` = true

2. ✅ Testez directement l'API :
```bash
curl http://api.local/api/cms/pages/about
```

Si l'API retourne 404, la page n'existe pas ou n'est pas publiée.

---

### ❌ Blocs ne s'affichent pas

**Symptôme** : Les blocs n'apparaissent pas sur la page

**Cause** : Blocs inactifs ou mal configurés

**Solution** :

1. ✅ Vérifiez que les blocs sont :
   - `is_active` = true
   - Associés à une page ou globaux (`page_id` = null)

2. ✅ Testez l'API :
```bash
curl http://api.local/api/cms/blocks
```

3. ✅ Vérifiez que le `type` du bloc est supporté :
   - text, html, hero, cta, features, testimonials, gallery, video, contact, faq, pricing, team, stats, newsletter

---

### ❌ Menus ne s'affichent pas

**Symptôme** : Pas de menu dans le header/footer

**Cause** : Menu non créé ou mal configuré

**Solution** :

1. ✅ Créez un menu dans le CMS Admin (`/superadmin/cms/menus`) :
   - `identifier` = "main-menu" (ou autre)
   - `location` = "header" (ou "footer")
   - `is_active` = true

2. ✅ Ajoutez des éléments au menu (`/superadmin/cms/menu-items`)

3. ✅ Testez l'API :
```bash
curl http://api.local/api/cms/menus/location/header
```

---

### ❌ Styles CSS non appliqués

**Symptôme** : Le contenu HTML n'a pas de styles

**Cause** : CSS non importé

**Solution** :

Importez le CSS dans `src/app/layout.tsx` :

```tsx
import '@/modules/Cms/frontend/styles/cms-content.css'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

---

### ❌ Images ne s'affichent pas

**Symptôme** : Les images CMS ne se chargent pas

**Cause** : Domaine d'images non autorisé dans Next.js

**Solution** :

Dans `next.config.ts`, ajoutez :

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'http',
      hostname: 'api.local',
      pathname: '/**'
    }
  ]
}
```

Redémarrez Next.js.

---

### ❌ Erreur "Connection refused"

**Symptôme** :
```
fetch failed: connect ECONNREFUSED 127.0.0.1:80
```

**Cause** : L'API Laravel n'est pas accessible

**Solution** :

1. ✅ Vérifiez que Laragon/serveur Laravel est démarré

2. ✅ Testez manuellement :
```bash
curl http://api.local
```

3. ✅ Vérifiez votre fichier `hosts` (Windows : `C:\Windows\System32\drivers\etc\hosts`) :
```
127.0.0.1 api.local
```

4. ✅ Redémarrez Laragon/Apache si nécessaire

---

### ❌ Données ne se mettent pas à jour

**Symptôme** : Modifications CMS non visibles sur le frontend

**Cause** : Cache Next.js

**Solution** :

1. ✅ Rafraîchissez la page avec `Ctrl+F5` (hard refresh)

2. ✅ Ou modifiez les services pour désactiver le cache :
```tsx
// Déjà fait par défaut
cache: 'no-store'
```

3. ✅ En production, utilisez la revalidation :
```tsx
next: { revalidate: 60 } // Revalider toutes les 60 secondes
```

---

### ❌ Erreur TypeScript

**Symptôme** : Erreurs de type TypeScript

**Cause** : Types manquants ou incompatibles

**Solution** :

1. ✅ Vérifiez que tous les types sont bien importés :
```tsx
import type { Page } from '@/modules/Cms/types/page.types'
```

2. ✅ Utilisez l'IDE pour vérifier les types requis

3. ✅ Si nécessaire, ajoutez des assertions de type :
```tsx
const page = await getPageBySlug('about') as Page
```

---

## 🧪 Tests de diagnostic

### Test 1 : API accessible

```bash
curl http://api.local/api/cms/pages
```

**Attendu** : Réponse JSON avec les pages (ou `{"data": []}` si vide)

**Si erreur** : Vérifiez que Laravel est démarré et accessible

---

### Test 2 : Page spécifique

```bash
curl http://api.local/api/cms/pages/home
```

**Attendu** : Données de la page home

**Si 404** : Créez une page avec `slug: "home"` dans le CMS Admin

---

### Test 3 : Frontend Next.js

Visitez : `http://localhost:3000/en/cms-demo`

**Attendu** : Page de démo avec données CMS

**Si erreur** :
1. Vérifiez `.env` → `NEXT_PUBLIC_API_URL=http://api.local/api`
2. Redémarrez Next.js
3. Vérifiez la console navigateur et terminal

---

## 📋 Checklist de vérification

Avant de demander de l'aide, vérifiez :

- [ ] `.env` contient `NEXT_PUBLIC_API_URL=http://api.local/api`
- [ ] Serveur Next.js redémarré après modification `.env`
- [ ] Laravel est démarré et accessible (`curl http://api.local`)
- [ ] `api.local` résout vers 127.0.0.1 (fichier hosts)
- [ ] CSS importé dans `app/layout.tsx`
- [ ] `next.config.ts` contient la config `images`
- [ ] Pages CMS sont `published` et `is_active: true`
- [ ] Blocs CMS sont `is_active: true`
- [ ] Console navigateur (F12) montre les erreurs détaillées
- [ ] Console serveur Next.js montre les logs

---

## 🆘 Support

Si le problème persiste :

1. ✅ Consultez les logs serveur (terminal Next.js)
2. ✅ Consultez la console navigateur (F12)
3. ✅ Testez les endpoints API directement avec `curl`
4. ✅ Vérifiez que les données existent dans le CMS Admin
5. ✅ Relisez [INSTALLATION.md](./src/modules/Cms/frontend/INSTALLATION.md)

---

## 💡 Astuces

### Activer les logs détaillés

Dans les services CMS, ajoutez des logs :

```tsx
export async function getPageBySlug(slug: string): Promise<Page> {
  const url = `${API_URL}/cms/pages/${slug}`

  console.log('Fetching page from:', url)

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store'
  })

  console.log('Response status:', response.status)

  // ...
}
```

### Vérifier la version de Node.js

Next.js 15 nécessite Node.js 18.18+ :

```bash
node --version
```

Si < 18.18, mettez à jour Node.js.

---

Bon débogage ! 🔍
