# Implémentation Frontend: CRUD Modules/UE

## Story
**structure-academique.gestion-modules.01-crud-modules-ue**
- Epic: Gestion des Modules
- Priorité: Haute
- Complexité: Moyenne
- Status Backend: ✅ Ready for Review (24 tests passent)
- Status Frontend: ✅ COMPLETE

## Objectif
Créer, modifier, consulter et gérer les modules/UE (Unités d'Enseignement) avec leurs caractéristiques pédagogiques (code, crédits ECTS, coefficient, volume horaire CM/TD/TP, etc.).

## Fichiers Créés

### 1. Types TypeScript
**Fichier**: `src/modules/StructureAcademique/types/module.types.ts`

**Contenu**:
- `Module` - Interface principale
- `ModuleFormData` - Données du formulaire
- `ModuleQueryParams` - Paramètres de requête (filtres, pagination)
- `PaginatedModulesResponse` - Réponse paginée
- `ModuleStatistics` - Statistiques
- Types: `ModuleType`, `ModuleSemester`, `ModuleLevel`
- Helpers: `getModuleTypeLabel`, `getModuleTypeBadgeColor`, `getSemestersForLevel`, `isSemesterLevelConsistent`

### 2. Service API
**Fichier**: `src/modules/StructureAcademique/admin/services/moduleService.ts`

**Méthodes**:
- `getModules(params, tenantId)` - Liste paginée avec filtres
- `getModule(id, tenantId)` - Détails d'un module
- `createModule(data, tenantId)` - Création
- `updateModule(id, data, tenantId)` - Modification
- `deleteModule(id, tenantId)` - Suppression (soft delete)
- `searchModules(query, tenantId)` - Recherche autocomplete
- `getStatistics(tenantId)` - Statistiques

### 3. Hook Personnalisé
**Fichier**: `src/modules/StructureAcademique/admin/hooks/useModules.ts`

**Fonctionnalités**:
- Gestion de l'état (modules, loading, error, pagination)
- Pagination (setPage, setPageSize)
- Recherche (setSearch)
- Filtres (setFilters)
- CRUD operations (createModule, updateModule, deleteModule)
- Refresh automatique après modifications

### 4. Composant Formulaire
**Fichier**: `src/modules/StructureAcademique/admin/components/ModuleFormDialog.tsx`

**Caractéristiques**:
- Dialog modal fullWidth
- React Hook Form + Valibot validation
- Champs:
  - Code module (unique)
  - Nom
  - Niveau (L1-M2)
  - Semestre (S1-S10, filtré selon niveau)
  - Crédits ECTS (2-6)
  - Coefficient (0.5-5)
  - Type (Obligatoire/Optionnel)
  - Volume horaire (CM, TD, TP)
  - Description
  - Module éliminatoire (checkbox)
- Validation:
  - Crédits ECTS: 2-6
  - Coefficient: 0.5-5
  - Total heures >= 15h (alerte si < 15h)
  - Cohérence semestre/niveau
- Calcul automatique du total d'heures
- Mise à jour automatique des semestres disponibles selon le niveau
- Restrictions en mode édition si notes saisies

### 5. Composant Suppression
**Fichier**: `src/modules/StructureAcademique/admin/components/ModuleDeleteDialog.tsx`

**Caractéristiques**:
- Dialog de confirmation
- Affichage des informations du module
- Alerte si inscriptions actives
- Message d'impact (X étudiants inscrits)
- Soft delete (réversible)
- Désactivation si `can_be_deleted === false`

### 6. Composant Liste (Context Provider)
**Fichier**: `src/modules/StructureAcademique/admin/components/ModuleList.tsx`

**Fonctionnalités**:
- Context Provider pour partager l'état
- Hook `useModulesContext()` pour accéder au context
- Container avec ModuleListTable

### 7. Composant Tableau
**Fichier**: `src/modules/StructureAcademique/admin/components/ModuleListTable.tsx`

**Caractéristiques**:
- DataTable avec TanStack Table
- Colonnes configurables (11 colonnes):
  - Code (avec avatar)
  - Nom
  - Niveau (badge coloré)
  - Semestre
  - Crédits ECTS (badge)
  - Coefficient
  - Type (badge Obligatoire/Optionnel)
  - Volume Horaire (total + détail CM/TD/TP)
  - Éliminatoire (badge rouge si oui)
  - Programmes (count)
  - Créé le
- Actions:
  - Ajouter (bouton principal)
  - Éditer (icône)
  - Supprimer (icône)
- Recherche globale (code, nom)
- Pagination (10, 25, 50, 100 par page)
- Tri sur toutes les colonnes
- Vue mobile responsive (cartes)
- Sauvegarde de la visibilité des colonnes dans localStorage

### 8. Page Next.js
**Fichier**: `src/app/[lang]/admin/structure/modules/page.tsx`

**Contenu**:
- Import et rendu du composant `ModuleList`
- Route: `/[lang]/admin/structure/modules`

### 9. Exports Mis à Jour
**Fichiers**:
- `src/modules/StructureAcademique/admin/index.ts` - Exports des composants, hooks, services
- `src/modules/StructureAcademique/types/index.ts` - Exports des types et helpers

## Fonctionnalités Implémentées

### ✅ Création de Module
- Formulaire complet avec tous les champs requis
- Validation stricte (crédits 2-6, coefficient 0.5-5, total heures >= 15h)
- Cohérence semestre/niveau automatique
- Calcul automatique du total d'heures

### ✅ Modification de Module
- Formulaire pré-rempli avec les données existantes
- Restrictions si notes saisies (seuls description et volume horaire modifiables)
- Alerte visuelle des restrictions

### ✅ Consultation
- Liste paginée avec 11 colonnes configurables
- Recherche globale (code, nom)
- Filtres: niveau, semestre, type, éliminatoire
- Vue détaillée dans le formulaire
- Badges visuels:
  - Éliminatoire (rouge)
  - Optionnel (orange)
  - Obligatoire (bleu)
  - Niveau (bleu pour Licence, violet pour Master)

### ✅ Suppression
- Soft delete uniquement
- Confirmation avec affichage de l'impact
- Impossible si inscriptions actives ou notes saisies
- Message d'information sur la réversibilité

### ✅ Gestion Volume Horaire
- Répartition CM/TD/TP
- Calcul automatique du total
- Alerte si total < 15h (minimum réglementaire)
- Affichage détaillé dans le tableau

### ✅ Vue Mobile
- Cartes responsives
- Toutes les informations essentielles
- Actions accessibles (éditer, supprimer)
- Badges colorés pour le type et le statut

## Validation Implémentée

### Validation Formulaire (Valibot)
```typescript
- code: required, string
- name: required, string
- credits_ects: required, number, min:2, max:6
- coefficient: required, number, min:0.5, max:5
- type: required, in:['Obligatoire','Optionnel']
- semester: required, in:['S1'-'S10']
- level: required, in:['L1','L2','L3','M1','M2']
- hours_cm: optional, number, min:0
- hours_td: optional, number, min:0
- hours_tp: optional, number, min:0
- description: optional, string
- is_eliminatory: boolean
```

### Validation Métier
- Total heures >= 15h (alerte visuelle)
- Cohérence semestre/niveau (S1-S2 pour L1, etc.)
- Semestres disponibles filtrés selon le niveau sélectionné

## Intégration Backend

### API Endpoints Utilisés
```
GET    /api/admin/modules              - Liste paginée
POST   /api/admin/modules              - Création
GET    /api/admin/modules/{id}         - Détails
PUT    /api/admin/modules/{id}         - Modification
DELETE /api/admin/modules/{id}         - Suppression
GET    /api/admin/modules/search       - Recherche
GET    /api/admin/modules/statistics   - Statistiques
```

### Headers Automatiques
- `Authorization: Bearer {token}`
- `X-Tenant-ID: {tenantId}` (admin context)
- `Accept-Language: {locale}`

### Gestion d'Erreurs
- 401 → Auto logout + redirect
- 403 → Permission denied
- 404 → Not found
- 422 → Validation errors (affichés dans le formulaire)

## Tests à Effectuer

### ✅ Test 1: Création de Module
1. Aller sur `/admin/structure/modules`
2. Cliquer sur "Ajouter"
3. Remplir le formulaire:
   - Code: INF101
   - Nom: Programmation Orientée Objet
   - Niveau: L1
   - Semestre: S1 (auto-filtré)
   - Crédits ECTS: 3
   - Coefficient: 1
   - Type: Obligatoire
   - CM: 20, TD: 15, TP: 10 (total: 45h)
   - Description: Introduction à la POO
   - Éliminatoire: Non
4. Cliquer "Créer"
5. ✅ **Vérifier**: Module créé et affiché dans la liste

### ✅ Test 2: Validation Crédits ECTS
1. Créer un module avec crédits ECTS = 1
2. ✅ **Vérifier**: Erreur "Minimum 2 crédits"
3. Créer un module avec crédits ECTS = 7
4. ✅ **Vérifier**: Erreur "Maximum 6 crédits"

### ✅ Test 3: Validation Volume Horaire
1. Créer un module avec CM:5, TD:5, TP:0 (total: 10h)
2. ✅ **Vérifier**: Alerte "Minimum réglementaire: 15h"
3. Module peut quand même être créé (alerte, pas erreur bloquante)

### ✅ Test 4: Cohérence Semestre/Niveau
1. Sélectionner Niveau: L1
2. ✅ **Vérifier**: Semestres disponibles: S1, S2 uniquement
3. Sélectionner Niveau: M2
4. ✅ **Vérifier**: Semestres disponibles: S9, S10 uniquement

### ✅ Test 5: Modification de Module
1. Cliquer sur l'icône éditer d'un module
2. Modifier le nom et la description
3. Cliquer "Modifier"
4. ✅ **Vérifier**: Modifications sauvegardées

### ✅ Test 6: Suppression de Module
1. Cliquer sur l'icône supprimer
2. ✅ **Vérifier**: Dialog de confirmation s'affiche
3. ✅ **Vérifier**: Informations du module affichées
4. Cliquer "Supprimer"
5. ✅ **Vérifier**: Module supprimé de la liste

### ✅ Test 7: Recherche
1. Taper "INF" dans la barre de recherche
2. ✅ **Vérifier**: Seuls les modules avec "INF" dans le code ou nom sont affichés

### ✅ Test 8: Vue Mobile
1. Réduire la fenêtre (< 768px)
2. ✅ **Vérifier**: Affichage en cartes
3. ✅ **Vérifier**: Toutes les informations visibles
4. ✅ **Vérifier**: Actions accessibles

### ✅ Test 9: Badges Visuels
1. Créer un module Obligatoire
2. ✅ **Vérifier**: Badge bleu "Obligatoire"
3. Créer un module Optionnel
4. ✅ **Vérifier**: Badge orange "Optionnel"
5. Créer un module éliminatoire
6. ✅ **Vérifier**: Badge rouge "Éliminatoire"

### ✅ Test 10: Pagination
1. Créer plus de 10 modules
2. ✅ **Vérifier**: Pagination affichée
3. Changer le nombre par page (25, 50, 100)
4. ✅ **Vérifier**: Affichage mis à jour

## Patterns Utilisés

### 1. Service Layer Pattern
```typescript
moduleService.getModules() → API call → Return data
```

### 2. Custom Hook Pattern
```typescript
useModules() → State management + CRUD operations
```

### 3. Context Provider Pattern
```typescript
ModuleList → Context Provider → ModuleListTable
```

### 4. Form Validation Pattern
```typescript
React Hook Form + Valibot → Type-safe validation
```

### 5. DataTable Pattern
```typescript
TanStack Table + Custom DataTable component
```

## Cohérence avec le Projet

### ✅ Suit les Standards
- MUI components (primary)
- React Hook Form + Valibot
- TypeScript strict
- Service layer pattern
- Custom hooks
- Context API
- Multi-tenancy support

### ✅ Réutilise les Composants
- `DataTable` (shared)
- `StandardMobileCard` (shared)
- `CustomAvatar` (core)
- Patterns identiques à `ProgrammeList`

### ✅ Intégration Multi-Tenant
- `createApiClient(tenantId)` dans tous les services
- `useTenant()` hook pour récupérer le tenantId
- Headers automatiques (`X-Tenant-ID`)

## Résumé

✅ **8 fichiers créés** (types, service, hook, 4 composants, page)
✅ **CRUD complet** (Create, Read, Update, Delete)
✅ **Validation stricte** (Valibot + validation métier)
✅ **Volume horaire** (CM/TD/TP avec calcul automatique)
✅ **Badges visuels** (Type, Niveau, Éliminatoire)
✅ **Recherche et filtres** (code, nom, niveau, semestre, type)
✅ **Pagination** (10, 25, 50, 100 par page)
✅ **Vue mobile** (cartes responsives)
✅ **Multi-tenancy** (support complet)
✅ **Aucune erreur TypeScript**
✅ **Cohérence** avec les patterns du projet

Le frontend pour la gestion des modules/UE est maintenant complet et prêt à être testé! 🎉
