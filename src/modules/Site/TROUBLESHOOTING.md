# Guide de dépannage - Module Site (Tenants)

## Problèmes courants et solutions

### 1. Les tenants ne s'affichent pas dans le tableau

#### Symptôme
Le tableau reste vide alors que l'API retourne des données.

#### Causes possibles
1. **company_name est null** - Le composant affiche maintenant un fallback automatique
2. **Erreur de réseau** - Vérifier la console navigateur
3. **Mauvaise URL API** - Vérifier la configuration de l'API client

#### Solution
Le composant gère automatiquement les cas où `company_name` est null en affichant :
1. Le `company_name` si disponible
2. Sinon, l'`id` du tenant
3. Sinon, le domaine principal
4. Sinon, "Sans nom"

**Affichage avec avertissement :**
```
┌─────────────────────────────────────┐
│ CO  company-xyz                     │
│     ⚠ Nom de société manquant       │
│     xyz.localhost                    │
└─────────────────────────────────────┘
```

### 2. Champs manquants dans les tenants existants

#### Symptôme
Certains tenants affichent "Non renseigné" ou des tirets (-) dans plusieurs champs.

#### Cause
Les tenants ont été créés sans renseigner les champs optionnels (`company_name`, `company_email`, etc.).

#### Solution
Utiliser le formulaire de modification pour compléter les informations :

1. Cliquer sur le bouton "Modifier" du tenant
2. Remplir les champs manquants :
   - Nom de la société
   - Email
   - Téléphone
   - Adresse
3. Enregistrer

**Exemple de mise à jour :**
```typescript
await updateSite("company-xyz", {
  company_name: "XYZ Corporation",
  company_email: "contact@xyz.com",
  company_phone: "+1234567890"
});
```

### 3. Erreur lors de la création d'un tenant

#### Symptôme
```
Error: The id has already been taken.
```

#### Cause
L'ID du tenant doit être unique dans tout le système.

#### Solution
Choisir un autre ID. Format recommandé :
- Lettres minuscules
- Chiffres
- Tirets ou underscores
- Exemple : `company-abc`, `client_xyz`, `tenant-123`

#### Symptôme
```
Error: Au moins un domaine est requis
```

#### Cause
Le formulaire a filtré tous les domaines vides.

#### Solution
Renseigner au moins un domaine valide dans le formulaire.

### 4. Impossible de supprimer un domaine

#### Symptôme
```
Error: Impossible de supprimer le domaine principal.
```

#### Cause
Vous tentez de supprimer le domaine marqué comme principal alors que d'autres domaines existent.

#### Solution
1. **Option 1** : Supprimer d'abord les autres domaines
2. **Option 2** : Définir un autre domaine comme principal via l'API :
   ```typescript
   await addDomain("tenant-id", {
     domain: "new.localhost",
     is_primary: true  // Le nouveau devient principal
   });
   // Puis supprimer l'ancien
   await removeDomain("tenant-id", oldDomainId);
   ```

### 5. Les statistiques ne s'affichent pas

#### Symptôme
Les cartes de statistiques restent en mode "chargement" ou affichent 0 partout.

#### Cause
L'endpoint `/api/superadmin/tenants/statistics` n'existe pas côté backend.

#### Solution
Le service utilise un **fallback automatique** :
- Il charge tous les tenants (avec `per_page=1000`)
- Calcule les stats côté client :
  - Total : nombre total de tenants
  - Actifs : `is_active === true`
  - Inactifs : `is_active === false`
  - Taux : `(actifs / total) * 100`

**Pour de meilleures performances**, implémenter l'endpoint côté backend :

```php
// Laravel
Route::get('/superadmin/tenants/statistics', function() {
    return response()->json([
        'data' => [
            'total' => Tenant::count(),
            'active' => Tenant::where('is_active', true)->count(),
            'inactive' => Tenant::where('is_active', false)->count(),
        ]
    ]);
});
```

### 6. Erreur 401 - Non authentifié

#### Symptôme
```
Error: Failed to load tenants
Status: 401 Unauthorized
```

#### Cause
Le token d'authentification est manquant, expiré ou invalide.

#### Solution
1. Vérifier que vous êtes connecté en tant que super admin
2. Vérifier que le token est bien envoyé dans les headers
3. Si le token a expiré, se reconnecter

### 7. Tenant non trouvé (404)

#### Symptôme
```
Error: No query results for model [Tenant] {id}
```

#### Cause
L'ID du tenant n'existe pas dans la base de données.

#### Solution
- Vérifier l'ID utilisé (sensible à la casse)
- Lister tous les tenants pour confirmer l'ID exact
- Le tenant a peut-être été supprimé

### 8. Conflit de domaine

#### Symptôme
```
Error: The domain has already been taken.
```

#### Cause
Le domaine que vous tentez d'ajouter est déjà utilisé par un autre tenant.

#### Solution
Les domaines doivent être **uniques dans tout le système**. Choisir un autre domaine.

## Bonnes pratiques

### Création de tenant

✅ **Recommandé :**
```typescript
{
  id: "company-abc",                    // ID unique et descriptif
  company_name: "ABC Corporation",      // Toujours renseigner
  company_email: "contact@abc.com",     // Email valide
  company_phone: "+33123456789",        // Format international
  company_address: "123 Rue de Paris",  // Adresse complète
  is_active: true,
  domains: [
    { domain: "abc.com" },              // Domaine principal
    { domain: "www.abc.com" }           // Alias
  ]
}
```

❌ **À éviter :**
```typescript
{
  id: "1",                              // ID trop court/non descriptif
  company_name: null,                   // Manquant
  domains: []                           // Vide - erreur
}
```

### Gestion des domaines

- **Un domaine principal** : Toujours en premier dans la liste
- **Domaines multiples** : Utile pour www, api, admin, etc.
- **Format** : Sans protocole (http/https), juste le domaine
  - ✅ `company.localhost`
  - ❌ `http://company.localhost`

### Recherche

Le champ de recherche interroge :
- ID du tenant
- Nom de la société
- Email de la société

**Ne recherche PAS** : Téléphone, Adresse, Domaines

### Performance

Pour de meilleures performances avec beaucoup de tenants :
- Utiliser la pagination (15-25 par page recommandé)
- Ne pas charger tous les tenants d'un coup
- Implémenter l'endpoint statistics côté backend

## Debugging

### Console navigateur

Ouvrir la console (F12) et chercher :

**Erreurs réseau :**
```
GET http://api.local/api/superadmin/tenants?per_page=15
Status: 500 Internal Server Error
```

**Erreurs JavaScript :**
```
TypeError: Cannot read property 'substring' of null
  at SitesTable.tsx:101
```

### Vérifier les données de l'API

```bash
# Tester directement l'API
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://api.local/api/superadmin/tenants?per_page=5
```

### Activer les logs détaillés

Dans le service :
```typescript
// siteService.ts
async getSites(filters?: SiteFilters): Promise<SitesListResponse> {
  console.log('🔍 Fetching tenants with filters:', filters);
  const response = await client.get<SitesListResponse>('/superadmin/tenants', { params });
  console.log('✅ Tenants loaded:', response.data.data.length);
  return response.data;
}
```

## Support

Si le problème persiste :

1. Vérifier les logs du serveur backend
2. Vérifier la documentation API : `C:\laragon\www\crm-api\USERS_TENANTS_API.md`
3. Consulter `MIGRATION_TENANTS.md` pour les détails de compatibilité
4. Vérifier que l'API backend est bien démarrée et accessible
