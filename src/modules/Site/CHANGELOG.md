# Changelog - Module Site

## [2.0.0] - Migration vers API Tenants - 2025-12-17

### 🔄 BREAKING CHANGES

#### Types modifiés
- **Site.id** : `number` → `string`
- **Site structure** : Complètement refactorisée pour correspondre à l'API Tenants
- Suppression de : `database`, `themes`, `availability`, `assets`, `access_restricted`, `type`
- Ajout de : `company_name`, `company_email`, `company_phone`, `company_address`, `domains[]`, `is_active`

#### API Endpoints
- Tous les endpoints `/superadmin/sites/*` migrés vers `/superadmin/tenants/*`

#### Service (siteService.ts)
**Méthodes supprimées :**
- `testConnection(id: number)` - Non supporté par l'API Tenants
- `updateDatabaseSize(id: number)` - Non supporté par l'API Tenants
- `toggleAvailability(data)` - Remplacé par `toggleActive(id)`

**Méthodes modifiées :**
- `getSite(id)` : `number` → `string`
- `createSite(data)` : Nouvelle structure CreateSiteData
- `updateSite(id, data)` : `number` → `string`, nouvelle structure UpdateSiteData
- `deleteSite(id)` : `number` → `string`, suppression du paramètre `deleteDatabase`

**Nouvelles méthodes :**
- `toggleActive(id: string)` - Activer/désactiver un tenant
- `addDomain(tenantId: string, data: AddDomainData)` - Ajouter un domaine
- `removeDomain(tenantId: string, domainId: number)` - Supprimer un domaine

#### Hooks

**useSite.ts - Interface UseSiteReturn :**
```typescript
// Supprimé
- testConnection: (id: number) => Promise<boolean>
- updateDatabaseSize: (id: number) => Promise<void>
- toggleAvailability: (data: ToggleAvailabilityData) => Promise<void>

// Ajouté
+ toggleActive: (id: string) => Promise<Site>
+ addDomain: (tenantId: string, data: AddDomainData) => Promise<Site>
+ removeDomain: (tenantId: string, domainId: number) => Promise<Site>

// Modifié
loadSite: (id: number) → (id: string)
createSite: nouvelle signature
updateSite: (id: number, data) → (id: string, data)
deleteSite: (id: number, deleteDatabase?) → (id: string)
```

**useSites.ts :**
- Pas de changements majeurs d'interface
- Messages d'erreur mis à jour ("sites" → "tenants")

### ✨ Nouvelles fonctionnalités

#### 1. Gestion multi-domaines
- Un tenant peut maintenant avoir plusieurs domaines
- Le premier domaine est automatiquement défini comme principal
- Interface pour ajouter/supprimer des domaines dynamiquement
- Badge visuel pour identifier le domaine principal

#### 2. Formulaire de création/modification amélioré
- Champ ID tenant (string, alpha_dash) pour la création
- Champs d'information d'entreprise : nom, email, téléphone, adresse
- Gestion dynamique des domaines (ajout/suppression)
- Validation : au moins un domaine requis

#### 3. Affichage amélioré
- Tableau redessiné avec colonnes pertinentes pour les tenants
- Carte de détails avec section dédiée aux domaines
- Statistiques adaptées : Total, Actifs, Inactifs, Taux d'activation
- Vue mobile responsive avec toutes les informations essentielles

### 🗑️ Suppressions

#### Composants
- Suppression du bouton "Tester la connexion" (non supporté)
- Suppression des sections Base de données, Thèmes, Assets du modal de détails

#### Types
- `SiteType` ('CUST' | 'ECOM' | 'CMS')
- `YesNo` ('YES' | 'NO')
- `SiteDatabase`, `SiteThemes`, `SiteAvailability`, `SiteAssets`
- `ToggleAvailabilityData`, `TestConnectionResult`

#### Filtres de recherche
Filtres non supportés par l'API Tenants :
- `available`, `admin_available`, `frontend_available`
- `is_customer`, `type`
- `sort_by`, `sort_order`

### 📝 Modifications des composants

#### SitesTable.tsx
**Anciennes colonnes :**
- ID, Domaine, Base de données, Type, Société, Statut, Dernière connexion

**Nouvelles colonnes :**
- ID, Société (+ domaine principal), Domaines, Email, Téléphone, Statut, Créé le

**Actions :**
- ❌ Supprimé : Tester la connexion
- ✅ Conservé : Voir, Modifier, Supprimer

#### SiteFormModal.tsx
Refonte complète du formulaire :
- **Création :** ID (string), Nom société, Email, Téléphone, Adresse, Statut, Domaines[]
- **Modification :** Nom société, Email, Téléphone, Adresse, Statut, Domaines[]
- Gestion dynamique des domaines avec boutons +/-
- Validation stricte : au moins un domaine requis

#### SiteDetailModal.tsx
Nouvelle structure :
- **Informations générales :** ID, Société, Email, Téléphone, Adresse, Statut, Logo
- **Domaines :** Liste complète avec badge pour le principal
- **Abonnement :** Fin d'essai, Fin d'abonnement (si présents)
- **Paramètres :** Affichage JSON des settings (si présents)
- **Historique :** Date de création, Dernière modification

#### StatisticsCards.tsx
Nouvelles statistiques :
1. Total Tenants (au lieu de Total Sites)
2. Tenants Actifs (au lieu de Sites Disponibles)
3. Tenants Inactifs (nouveau)
4. Taux d'activation % (au lieu de CRM Sites)

### 🔧 Améliorations techniques

#### Service
- Gestion d'erreur améliorée avec messages contextuels
- Fallback pour les statistiques si endpoint non disponible
- Support complet de l'API Tenants documentée

#### Types TypeScript
- Types stricts et complets pour toutes les entités
- Interfaces séparées pour les réponses API
- Documentation inline pour tous les types

#### Hooks
- Gestion d'état optimisée
- Messages d'erreur clairs et traduits
- Support complet des nouvelles fonctionnalités

### 📚 Documentation

Nouveaux fichiers de documentation :
- `MIGRATION_TENANTS.md` - Guide complet de migration
- `CHANGELOG.md` - Historique des changements (ce fichier)

### ⚠️ Points d'attention

1. **IDs Tenant** : Maintenant de type string, assurez-vous de mettre à jour toutes les références
2. **Domaines** : Impossible de supprimer le domaine principal si d'autres domaines existent
3. **Mise à jour des domaines** : Fournir le champ `domains` dans une mise à jour remplace TOUS les domaines existants
4. **Statistiques** : Utilise un fallback si l'endpoint dédié n'est pas disponible

### 🔗 Compatibilité

Compatible avec l'API Tenants documentée dans :
`C:\laragon\www\crm-api\USERS_TENANTS_API.md`

Version de l'API : Laravel Tenants Multi-database

### 🚀 Migration

Pour migrer du code existant :

1. Remplacer tous les `number` par `string` pour les IDs de tenant
2. Mettre à jour les interfaces de composants utilisant `Site`
3. Remplacer les appels à `testConnection`, `updateDatabaseSize`, `toggleAvailability`
4. Adapter les formulaires pour la nouvelle structure de données
5. Vérifier que tous les domaines sont gérés correctement

Voir `MIGRATION_TENANTS.md` pour plus de détails.

---

## [1.0.0] - Version initiale (Ancienne API Sites)

### Fonctionnalités
- Gestion CRUD des sites
- Test de connexion base de données
- Mise à jour de la taille de la base de données
- Gestion de la disponibilité (site/admin/frontend)
- Support des types de sites (CUST, ECOM, CMS)
- Gestion des thèmes et assets
- Statistiques globales
