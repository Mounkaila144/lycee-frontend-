# Migration vers l'API Tenants

Ce document décrit les changements effectués pour migrer le module Site de l'ancienne API vers la nouvelle API Tenants Laravel.

## Vue d'ensemble

Le module Site a été entièrement refactorisé pour être compatible avec l'API Tenants documentée dans `C:\laragon\www\crm-api\USERS_TENANTS_API.md`.

## Principaux changements

### 1. Types TypeScript (`types/site.types.ts`)

#### Ancien modèle (Sites)
```typescript
interface Site {
  id: number;
  host: string;
  database: SiteDatabase;
  themes: SiteThemes;
  availability: SiteAvailability;
  // ...
}
```

#### Nouveau modèle (Tenants)
```typescript
interface Site {
  id: string;  // ID est maintenant une string
  company_name: string;
  company_email: string | null;
  company_phone: string | null;
  company_address: string | null;
  company_logo: string | null;
  is_active: boolean;
  domains: TenantDomain[];  // Gestion multi-domaines
  // ...
}

interface TenantDomain {
  id: number;
  domain: string;
  tenant_id: string;
  is_primary: boolean;
  // ...
}
```

### 2. Service (`services/siteService.ts`)

#### Endpoints mis à jour
- `GET /superadmin/sites` → `GET /superadmin/tenants`
- `POST /superadmin/sites` → `POST /superadmin/tenants`
- `PUT /superadmin/sites/{id}` → `PUT /superadmin/tenants/{id}`
- `DELETE /superadmin/sites/{id}` → `DELETE /superadmin/tenants/{id}`

#### Nouvelles méthodes
- `toggleActive(id: string)` - Activer/désactiver un tenant
- `addDomain(tenantId: string, data)` - Ajouter un domaine
- `removeDomain(tenantId, domainId)` - Supprimer un domaine

#### Méthodes supprimées
- `testConnection()` - N'existe plus dans l'API Tenants
- `updateDatabaseSize()` - N'existe plus dans l'API Tenants
- `toggleAvailability()` - Remplacé par `toggleActive()`

### 3. Hooks

#### `useSite.ts`
- Changement de signature : `id: number` → `id: string`
- Nouvelles méthodes : `toggleActive`, `addDomain`, `removeDomain`
- Méthodes supprimées : `testConnection`, `updateDatabaseSize`, `toggleAvailability`

#### `useSites.ts`
- Pas de changements majeurs, juste mise à jour des messages d'erreur

### 4. Composants

#### `SitesTable.tsx`
**Avant :**
- Colonnes : ID, Domaine, Base de données, Type, Société, Disponibilité, Dernière connexion
- Actions : Voir, Modifier, Tester connexion, Supprimer

**Après :**
- Colonnes : ID, Société, Domaines, Email, Téléphone, Statut, Créé le
- Actions : Voir, Modifier, Supprimer
- Affichage des domaines multiples avec badge "Principal"

#### `SiteFormModal.tsx`
**Changements majeurs :**
- Champ `id` (string) ajouté en mode création uniquement
- Champs base de données supprimés (pas dans l'API Tenants)
- Gestion multi-domaines : possibilité d'ajouter/supprimer des domaines dynamiquement
- Le premier domaine est automatiquement le domaine principal

**Nouveaux champs :**
- `company_name` (requis)
- `company_email` (optionnel)
- `company_phone` (optionnel)
- `company_address` (optionnel)
- `domains[]` (requis, minimum 1 domaine)

#### `SiteDetailModal.tsx`
**Refonte complète :**
- Section "Domaines" avec liste de tous les domaines et badge pour le domaine principal
- Section "Abonnement" (si trial_ends_at ou subscription_ends_at présents)
- Section "Paramètres" affichant les settings JSON
- Suppression des sections : Base de données, Disponibilité, Thèmes, Assets

#### `StatisticsCards.tsx`
**Modifications :**
- "Total Sites" → "Total Tenants"
- "Sites Disponibles" → "Tenants Actifs"
- "Clients" → "Tenants Inactifs"
- "CRM Sites" → "Taux d'activation" (calculé)

## Structure de données

### Création d'un tenant

```typescript
const createData: CreateSiteData = {
  id: "company-xyz",
  company_name: "XYZ Corporation",
  company_email: "contact@xyz.com",
  company_phone: "+1234567890",
  company_address: "123 Main St, City",
  is_active: true,
  domains: [
    { domain: "xyz.localhost" },          // Sera le domaine principal
    { domain: "www.xyz.localhost" }
  ]
};
```

### Mise à jour d'un tenant

```typescript
const updateData: UpdateSiteData = {
  company_name: "XYZ Corp Updated",
  company_email: "new@xyz.com",
  is_active: false,
  domains: [
    { domain: "xyz.localhost" },
    { domain: "new.xyz.localhost" }
  ]
};
// Note: Fournir le champ domains remplace TOUS les domaines existants
```

## Points d'attention

### Compatibilité
- **ID Tenant** : Maintenant de type `string` au lieu de `number`
- **Domaines** : Un tenant peut avoir plusieurs domaines, le premier est toujours principal
- **Suppression de domaines** : Impossible de supprimer le domaine principal si d'autres existent

### Statistiques
Le service `getStatistics()` inclut un fallback :
1. Tente d'abord `GET /superadmin/tenants/statistics`
2. Si l'endpoint n'existe pas, calcule les stats à partir de la liste complète des tenants

### Filtres de recherche
L'API Tenants supporte moins de filtres que l'ancienne API :
- ✅ Supporté : `search`, `per_page`, `page`
- ❌ Supprimé : `available`, `admin_available`, `frontend_available`, `is_customer`, `type`, `sort_by`, `sort_order`

## Migration des données

Si vous migrez depuis l'ancienne API Sites :

1. Les IDs numériques doivent être convertis en strings
2. Les domaines (`host`) doivent être extraits et créés dans le tableau `domains`
3. Les champs liés à la base de données ne sont plus gérés par cette API
4. Les paramètres de disponibilité sont remplacés par un simple booléen `is_active`

## Compatibilité backend

Cette implémentation est compatible avec l'API documentée dans :
**`C:\laragon\www\crm-api\USERS_TENANTS_API.md`**

Endpoints utilisés :
- `GET /api/superadmin/tenants` - Liste paginée
- `GET /api/superadmin/tenants/{id}` - Détails
- `POST /api/superadmin/tenants` - Création
- `PUT /api/superadmin/tenants/{id}` - Mise à jour
- `DELETE /api/superadmin/tenants/{id}` - Suppression
- `POST /api/superadmin/tenants/{id}/toggle-active` - Toggle statut
- `POST /api/superadmin/tenants/{tenantId}/domains` - Ajouter domaine
- `DELETE /api/superadmin/tenants/{tenantId}/domains/{domainId}` - Supprimer domaine

## Utilisation

### Exemple d'utilisation du hook

```typescript
import { useSite } from '@/modules/Site/superadmin/hooks/useSite';
import { useSites } from '@/modules/Site/superadmin/hooks/useSites';

function MyComponent() {
  const { sites, isLoading, refresh } = useSites({ per_page: 15 });
  const { createSite, updateSite, deleteSite, toggleActive } = useSite();

  const handleCreate = async () => {
    await createSite({
      id: "my-company",
      company_name: "My Company",
      domains: [{ domain: "mycompany.localhost" }]
    });
    refresh();
  };

  const handleToggle = async (tenantId: string) => {
    await toggleActive(tenantId);
    refresh();
  };

  return (
    <SitesTable
      sites={sites}
      isLoading={isLoading}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onView={handleView}
    />
  );
}
```

## Tests recommandés

1. ✅ Création d'un tenant avec un domaine
2. ✅ Création d'un tenant avec plusieurs domaines
3. ✅ Modification d'un tenant (avec et sans modification des domaines)
4. ✅ Suppression d'un tenant
5. ✅ Toggle du statut actif/inactif
6. ✅ Ajout d'un domaine à un tenant existant
7. ✅ Suppression d'un domaine (non-principal)
8. ✅ Pagination et recherche
9. ⚠️ Tentative de suppression du domaine principal
10. ⚠️ Gestion des erreurs de validation

## Prochaines étapes

- [ ] Implémenter l'endpoint statistics côté backend si nécessaire
- [ ] Ajouter la gestion des images (company_logo)
- [ ] Implémenter la gestion des settings (JSON personnalisé)
- [ ] Ajouter la gestion des abonnements (trial_ends_at, subscription_ends_at)
