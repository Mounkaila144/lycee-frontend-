# Implémentation Frontend: Gestion des Prérequis entre Modules

## Story
**structure-academique.gestion-modules.02-gestion-prerequis**
- Epic: Gestion des Modules
- Priorité: Moyenne
- Complexité: Moyenne
- Status Backend: ✅ Ready for Review
- Status Frontend: ✅ COMPLETE

## Objectif
Définir les dépendances pédagogiques entre modules pour assurer une progression cohérente des apprentissages, avec détection automatique des cycles et visualisation du graphe de dépendances.

## Fichiers Créés

### 1. Types TypeScript
**Fichier**: `src/modules/StructureAcademique/types/modulePrerequisite.types.ts`

**Contenu**:
- `ModulePrerequisite` - Interface principale
- `AddPrerequisiteRequest` - Données pour ajouter un prérequis
- `DependencyNode` - Nœud du graphe de dépendances
- `EnrollmentEligibility` - Éligibilité d'inscription
- Types: `PrerequisiteType` ('Strict' | 'Recommandé')
- Helpers: `getPrerequisiteTypeLabel`, `getPrerequisiteTypeBadgeColor`

### 2. Service API
**Fichier**: `src/modules/StructureAcademique/admin/services/modulePrerequisiteService.ts`

**Méthodes**:
- `getPrerequisites(moduleId, tenantId)` - Liste des prérequis d'un module
- `addPrerequisite(moduleId, data, tenantId)` - Ajouter un prérequis
- `removePrerequisite(moduleId, prerequisiteId, tenantId)` - Supprimer un prérequis
- `getDependencyGraph(moduleId, tenantId)` - Graphe de dépendances complet
- `checkEnrollmentEligibility(studentId, moduleId, tenantId)` - Vérifier éligibilité inscription

### 3. Hooks Personnalisés
**Fichier**: `src/modules/StructureAcademique/admin/hooks/useModulePrerequisites.ts`

**Hooks**:
1. **`useModulePrerequisites(moduleId)`**:
   - Gestion des prérequis d'un module
   - CRUD operations (add, remove)
   - Refresh automatique

2. **`useModuleDependencyGraph(moduleId)`**:
   - Récupération du graphe de dépendances
   - Affichage hiérarchique des prérequis

### 4. Dialog Gestion des Prérequis
**Fichier**: `src/modules/StructureAcademique/admin/components/ModulePrerequisitesDialog.tsx`

**Caractéristiques**:
- Dialog modal fullWidth
- **Section Ajout**:
  - Autocomplete pour sélectionner un module prérequis
  - Filtrage automatique (exclut module actuel et prérequis déjà ajoutés)
  - Sélection du type (Strict/Recommandé)
  - Affichage détaillé des modules (code, nom, niveau, semestre, crédits)
  - Bouton "Ajouter" avec loading state
  - Message d'info sur les types de prérequis
- **Section Liste**:
  - Liste des prérequis actuels
  - Affichage: code, nom, niveau, semestre, crédits
  - Badge coloré selon le type (rouge=Strict, orange=Recommandé)
  - Bouton supprimer pour chaque prérequis
  - Message si aucun prérequis
- **Gestion d'erreurs**:
  - Détection de cycles (message d'erreur du backend)
  - Validation des contraintes (niveau, etc.)

### 5. Dialog Graphe de Dépendances
**Fichier**: `src/modules/StructureAcademique/admin/components/ModuleDependencyGraphDialog.tsx`

**Caractéristiques**:
- Dialog modal fullWidth (lg)
- Affichage hiérarchique des dépendances
- **Composant récursif** `DependencyNodeComponent`:
  - Affiche un module avec ses informations
  - Indentation selon le niveau de profondeur
  - Bordure colorée (bleu=module principal, violet=prérequis)
  - Badges: niveau, semestre, crédits ECTS
  - Indicateur de niveau de prérequis
- **Visualisation arborescente**:
  - Module principal en haut
  - Prérequis directs en dessous
  - Prérequis des prérequis (chaîne complète)
  - Bordure gauche pour montrer la hiérarchie
- Message d'info explicatif
- Message si aucun prérequis

### 6. Modifications ModuleListTable
**Fichier**: `src/modules/StructureAcademique/admin/components/ModuleListTable.tsx`

**Ajouts**:
- Bouton "Gérer les prérequis" (icône `ri-links-line`)
- Bouton "Graphe de dépendances" (icône `ri-node-tree`)
- Handlers pour ouvrir les dialogs
- Intégration des dialogs dans le render
- Actions disponibles sur desktop et mobile

## Fonctionnalités Implémentées

### ✅ Définition des Prérequis
- Association N modules prérequis à 1 module cible
- Sélection multiple avec autocomplete
- Filtrage intelligent (exclut module actuel et prérequis existants)
- Type de prérequis:
  - **Strict**: Module prérequis doit être validé (note >= 10)
  - **Recommandé**: Prérequis conseillé mais non bloquant
- Sauvegarde en table pivot `module_prerequisites`

### ✅ Visualisation
- Graphe de dépendances hiérarchique
- Affichage prérequis dans dialog dédié
- Badges colorés selon le type (Strict=rouge, Recommandé=orange)
- Détection cycles avec message d'erreur

### ✅ Gestion des Chaînes
- Visualisation chaîne complète: INF101 → INF201 → INF301
- Affichage récursif de tous les niveaux de prérequis
- Indentation et bordures pour montrer la hiérarchie

### ✅ Interface Utilisateur
- 2 boutons dans la liste des modules:
  - 🔗 Gérer les prérequis
  - 🌳 Graphe de dépendances
- Dialogs modaux pour chaque fonctionnalité
- Autocomplete avec recherche
- Loading states
- Messages d'erreur clairs
- Responsive (desktop et mobile)

## Validation Implémentée

### Validation Backend (gérée par l'API)
- Prérequis ne peut pas être le module lui-même
- Détection de cycles avec rejet
- Prérequis doit être de niveau inférieur ou égal
- Code unique (module_id, prerequisite_module_id)

### Validation Frontend
- Filtrage automatique des modules invalides
- Affichage des erreurs du backend
- Désactivation du bouton "Ajouter" si aucun module sélectionné

## Intégration Backend

### API Endpoints Utilisés
```
GET    /api/admin/modules/{id}/prerequisites              - Liste prérequis
POST   /api/admin/modules/{id}/prerequisites              - Ajout prérequis
DELETE /api/admin/modules/{id}/prerequisites/{prereqId}   - Suppression
GET    /api/admin/modules/{id}/dependency-graph           - Graphe dépendances
POST   /api/admin/students/{id}/check-prerequisites/{moduleId} - Vérification (future)
```

### Détection de Cycles
Le backend utilise un algorithme de parcours en profondeur (DFS) pour détecter les cycles:
- Si un cycle est détecté → Erreur 422 avec message explicite
- Frontend affiche l'erreur dans une Alert

### Types de Prérequis
- **Strict**: Bloque l'inscription si non validé
- **Recommandé**: Warning seulement, inscription autorisée

## Tests à Effectuer

### ✅ Test 1: Ajouter un Prérequis Strict
1. Aller sur `/admin/structure/modules`
2. Cliquer sur l'icône 🔗 d'un module (ex: INF201)
3. Dialog "Gestion des Prérequis" s'ouvre
4. Sélectionner un module prérequis (ex: INF101)
5. Type: Strict
6. Cliquer "Ajouter"
7. ✅ **Vérifier**: Prérequis ajouté avec badge rouge "Strict"

### ✅ Test 2: Ajouter un Prérequis Recommandé
1. Ouvrir le dialog de prérequis
2. Sélectionner un module
3. Type: Recommandé
4. Cliquer "Ajouter"
5. ✅ **Vérifier**: Prérequis ajouté avec badge orange "Recommandé"

### ✅ Test 3: Supprimer un Prérequis
1. Ouvrir le dialog de prérequis
2. Cliquer sur l'icône poubelle d'un prérequis
3. ✅ **Vérifier**: Prérequis supprimé de la liste

### ✅ Test 4: Détection de Cycle
1. Créer: INF101 → INF201
2. Créer: INF201 → INF301
3. Essayer de créer: INF301 → INF101 (cycle!)
4. ✅ **Vérifier**: Erreur affichée "Cycle détecté"

### ✅ Test 5: Graphe de Dépendances Simple
1. Créer: INF101 (pas de prérequis)
2. Créer: INF201 → INF101
3. Cliquer sur l'icône 🌳 de INF201
4. ✅ **Vérifier**: Graphe affiche INF201 en haut, INF101 en dessous

### ✅ Test 6: Graphe de Dépendances Complexe
1. Créer: MATH101 (pas de prérequis)
2. Créer: INF101 → MATH101
3. Créer: INF201 → INF101
4. Créer: INF301 → INF201
5. Cliquer sur l'icône 🌳 de INF301
6. ✅ **Vérifier**: Graphe affiche:
   - INF301 (niveau 0)
   - └─ INF201 (niveau 1)
   -    └─ INF101 (niveau 2)
   -       └─ MATH101 (niveau 3)

### ✅ Test 7: Filtrage Autocomplete
1. Module INF201 a déjà INF101 comme prérequis
2. Ouvrir le dialog de prérequis de INF201
3. Ouvrir l'autocomplete
4. ✅ **Vérifier**: INF201 n'apparaît pas (module actuel)
5. ✅ **Vérifier**: INF101 n'apparaît pas (déjà ajouté)

### ✅ Test 8: Affichage Détaillé
1. Ouvrir l'autocomplete
2. ✅ **Vérifier**: Chaque module affiche:
   - Code + Nom (ligne 1)
   - Niveau + Semestre + Crédits (ligne 2)

### ✅ Test 9: Vue Mobile
1. Réduire la fenêtre (< 768px)
2. ✅ **Vérifier**: Boutons 🔗 et 🌳 visibles dans les actions de la carte
3. Cliquer sur 🔗
4. ✅ **Vérifier**: Dialog s'ouvre correctement

### ✅ Test 10: Module Sans Prérequis
1. Cliquer sur l'icône 🌳 d'un module sans prérequis
2. ✅ **Vérifier**: Message "Ce module n'a aucun prérequis défini"

## Patterns Utilisés

### 1. Service Layer Pattern
```typescript
modulePrerequisiteService.getPrerequisites() → API call → Return data
```

### 2. Custom Hook Pattern
```typescript
useModulePrerequisites() → State management + CRUD operations
useModuleDependencyGraph() → Fetch and display graph
```

### 3. Recursive Component Pattern
```typescript
DependencyNodeComponent → Renders itself recursively for nested prerequisites
```

### 4. Dialog Modal Pattern
```typescript
ModuleListTable → Opens Dialog → Manages prerequisites → Closes Dialog
```

## Cohérence avec le Projet

### ✅ Suit les Standards
- MUI components (primary)
- TypeScript strict
- Service layer pattern
- Custom hooks
- Dialog modals
- Multi-tenancy support

### ✅ Réutilise les Composants
- `Dialog`, `Autocomplete`, `List` (MUI)
- `IconButton`, `Chip`, `Alert` (MUI)
- Patterns identiques à `ProgrammeList` et `ModuleList`

### ✅ Intégration Multi-Tenant
- `createApiClient(tenantId)` dans tous les services
- `useTenant()` hook pour récupérer le tenantId
- Headers automatiques (`X-Tenant-ID`)

## Architecture

```
ModuleListTable
├── Bouton "Gérer les prérequis" 🔗
│   └── ModulePrerequisitesDialog
│       ├── Section Ajout
│       │   ├── Autocomplete (modules disponibles)
│       │   ├── Select (type: Strict/Recommandé)
│       │   └── Bouton "Ajouter"
│       └── Section Liste
│           └── Liste des prérequis actuels
│
└── Bouton "Graphe de dépendances" 🌳
    └── ModuleDependencyGraphDialog
        └── DependencyNodeComponent (récursif)
            ├── Affichage module
            └── Affichage prérequis (récursif)
```

## Résumé

✅ **5 fichiers créés** (types, service, hooks, 2 composants)
✅ **Gestion complète des prérequis** (ajout, suppression, liste)
✅ **Graphe de dépendances** (visualisation hiérarchique)
✅ **Détection de cycles** (gérée par le backend)
✅ **Types de prérequis** (Strict/Recommandé avec badges colorés)
✅ **Autocomplete intelligent** (filtrage automatique)
✅ **Visualisation récursive** (chaîne complète de prérequis)
✅ **Vue mobile** (boutons accessibles)
✅ **Multi-tenancy** (support complet)
✅ **Aucune erreur TypeScript**
✅ **Cohérence** avec les patterns du projet

Le frontend pour la gestion des prérequis entre modules est maintenant complet et prêt à être testé! 🎉

## Prochaines Étapes (Phase 2)

Les fonctionnalités suivantes sont prévues pour une future itération:
- [ ] Override admin pour inscription exceptionnelle
- [ ] Badge "Prérequis: INF101, MATH102" dans la fiche module
- [ ] Export PDF de la maquette avec prérequis
- [ ] Validation lors de l'inscription étudiant (intégration avec module Inscriptions)
