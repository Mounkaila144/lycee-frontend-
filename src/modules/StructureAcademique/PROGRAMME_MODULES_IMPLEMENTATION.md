# Implémentation: Association Programme ↔ Module

## 📋 Vue d'ensemble

Implémentation complète de la gestion des associations entre Programmes et Modules via la table pivot `module_programs`.

**Date:** 2026-01-13  
**Agent:** James (dev)  
**Status:** ✅ COMPLETED

---

## 🎯 Objectif

Permettre aux responsables pédagogiques d'associer des modules à des programmes de formation, avec validation de cohérence niveau et statistiques.

---

## 📁 Fichiers Créés

### Types
- `src/modules/StructureAcademique/types/programmeModule.types.ts`
  - ProgrammeModule interface
  - AssociateModulesData
  - ProgrammeModulesResponse
  - ModulesByLevel
  - ProgrammeModuleStats
  - Helper functions: groupModulesByLevel, calculateModuleStats

### Services
- `src/modules/StructureAcademique/admin/services/programmeModuleService.ts`
  - getModules(programmeId) - Récupérer modules associés
  - associateModules(programmeId, data) - Associer plusieurs modules
  - removeModule(programmeId, moduleId) - Dissocier un module
  - getAvailableModules() - Liste tous les modules disponibles

### Hooks
- `src/modules/StructureAcademique/admin/hooks/useProgrammeModules.ts`
  - State management pour modules d'un programme
  - Auto-fetch on programmeId change
  - Mutation functions avec auto-refresh
  - Error handling

### Composants
- `src/modules/StructureAcademique/admin/components/ProgrammeModuleSelector.tsx`
  - Sélecteur de modules groupés par niveau
  - Checkboxes avec sélection niveau complet
  - Filtrage automatique selon niveaux du programme
  - Badges visuels (ECTS, Type, Éliminatoire)
  - Accordéons par niveau (L1, L2, L3, M1, M2)

- `src/modules/StructureAcademique/admin/components/ProgrammeModulesDialog.tsx`
  - Dialog de gestion des modules
  - Affichage statistiques (total, crédits, types)
  - Sauvegarde avec validation
  - Loading states et error handling

### Fichiers Modifiés
- `src/modules/StructureAcademique/admin/components/ProgrammeListTable.tsx`
  - Ajout bouton "Gérer les modules" (icône ri-book-line)
  - Handler handleOpenModulesDialog
  - State modulesDialogOpen
  - Render ProgrammeModulesDialog

- `src/modules/StructureAcademique/admin/index.ts`
  - Export ProgrammeModulesDialog
  - Export ProgrammeModuleSelector
  - Export useProgrammeModules hook
  - Export programmeModuleService

- `src/modules/StructureAcademique/types/index.ts`
  - Export types programmeModule
  - Export helper functions

---

## 🔌 API Endpoints Requis

### Backend Laravel (À implémenter)

```php
// Routes dans Modules/StructureAcademique/Routes/admin.php

Route::prefix('programmes/{programme}')->group(function () {
    // Récupérer les modules associés
    Route::get('/modules', [ProgrammeModuleController::class, 'index']);
    
    // Associer plusieurs modules (remplace les associations existantes)
    Route::post('/modules', [ProgrammeModuleController::class, 'store']);
    
    // Dissocier un module
    Route::delete('/modules/{module}', [ProgrammeModuleController::class, 'destroy']);
});
```

### Controller à créer

```php
<?php

namespace Modules\StructureAcademique\Http\Controllers\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\StructureAcademique\Entities\Programme;
use Modules\StructureAcademique\Entities\Module;
use Modules\StructureAcademique\Http\Requests\AssociateModulesRequest;
use Modules\StructureAcademique\Http\Resources\ModuleResource;

class ProgrammeModuleController extends Controller
{
    /**
     * Liste des modules associés à un programme
     */
    public function index(Programme $programme): JsonResponse
    {
        $modules = $programme->modules()
            ->with(['programs'])
            ->orderBy('level')
            ->orderBy('semester')
            ->get();

        return response()->json([
            'data' => ModuleResource::collection($modules),
        ]);
    }

    /**
     * Associer plusieurs modules à un programme
     * Remplace les associations existantes
     */
    public function store(AssociateModulesRequest $request, Programme $programme): JsonResponse
    {
        // Valider que les modules sont cohérents avec les niveaux du programme
        $programmeLevels = $programme->levels->pluck('level')->toArray();
        $modules = Module::whereIn('id', $request->module_ids)->get();
        
        foreach ($modules as $module) {
            if (!in_array($module->level, $programmeLevels)) {
                return response()->json([
                    'message' => "Le module {$module->code} (niveau {$module->level}) n'est pas cohérent avec les niveaux du programme.",
                ], 422);
            }
        }

        // Sync modules (remplace les associations existantes)
        $programme->modules()->sync($request->module_ids);

        // Recharger les modules
        $modules = $programme->modules()
            ->with(['programs'])
            ->orderBy('level')
            ->orderBy('semester')
            ->get();

        return response()->json([
            'message' => 'Modules associés avec succès.',
            'data' => ModuleResource::collection($modules),
        ]);
    }

    /**
     * Dissocier un module d'un programme
     */
    public function destroy(Programme $programme, Module $module): JsonResponse
    {
        $programme->modules()->detach($module->id);

        return response()->json([
            'message' => 'Module dissocié avec succès.',
        ]);
    }
}
```

### Request Validation

```php
<?php

namespace Modules\StructureAcademique\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssociateModulesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'module_ids' => ['required', 'array', 'min:1'],
            'module_ids.*' => ['required', 'integer', 'exists:modules,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'module_ids.required' => 'Veuillez sélectionner au moins un module.',
            'module_ids.array' => 'Le format des modules est invalide.',
            'module_ids.min' => 'Veuillez sélectionner au moins un module.',
            'module_ids.*.exists' => 'Un ou plusieurs modules sélectionnés n\'existent pas.',
        ];
    }
}
```

### Relation Eloquent (déjà existante)

```php
// Dans Modules/StructureAcademique/Entities/Programme.php
public function modules(): BelongsToMany
{
    return $this->belongsToMany(Module::class, 'module_programs');
}

// Dans Modules/StructureAcademique/Entities/Module.php
public function programs(): BelongsToMany
{
    return $this->belongsToMany(Programme::class, 'module_programs');
}
```

---

## 🎨 Interface Utilisateur

### Workflow Utilisateur

1. **Accéder à la liste des programmes**
   - Route: `/admin/structure/programmes`

2. **Cliquer sur "Gérer les modules"** (icône livre)
   - Bouton dans la colonne Actions
   - À côté de "Gérer les niveaux"

3. **Dialog s'ouvre avec:**
   - Titre: "Gérer les Modules - [CODE] - [LIBELLÉ]"
   - Sélecteur de modules groupés par niveau
   - Statistiques en temps réel

4. **Sélectionner les modules:**
   - Modules filtrés selon les niveaux du programme
   - Checkbox par niveau pour sélection rapide
   - Checkbox par module individuel
   - Badges: ECTS, Type, Éliminatoire

5. **Voir les statistiques:**
   - Total modules sélectionnés
   - Total crédits ECTS
   - Répartition Obligatoires/Optionnels
   - Nombre de modules éliminatoires

6. **Enregistrer:**
   - Validation automatique
   - Sauvegarde dans `module_programs`
   - Refresh de la liste

---

## ✅ Validation Métier

### Règles Implémentées

1. **Cohérence Niveau:**
   - Seuls les modules correspondant aux niveaux du programme sont affichés
   - Si programme a [L1, L2, L3] → seuls modules L1, L2, L3 disponibles
   - Validation côté frontend ET backend

2. **Niveaux Requis:**
   - Le programme doit avoir au moins un niveau associé
   - Sinon, message d'avertissement affiché

3. **Modules Disponibles:**
   - Si aucun module disponible pour les niveaux → message informatif
   - Suggestion de créer des modules

---

## 📊 Statistiques Affichées

```typescript
interface ProgrammeModuleStats {
  total: number;                    // Nombre total de modules
  by_level: {                       // Répartition par niveau
    L1: number;
    L2: number;
    L3: number;
    M1: number;
    M2: number;
  };
  by_type: {                        // Répartition par type
    Obligatoire: number;
    Optionnel: number;
  };
  eliminatory_count: number;        // Nombre de modules éliminatoires
  total_credits: number;            // Total crédits ECTS
}
```

---

## 🎯 Cas d'Usage

### Exemple 1: Programme Licence Informatique

**Niveaux:** L1, L2, L3

**Modules L1:**
- INF101 - Algorithmique (6 ECTS, Obligatoire)
- MAT101 - Mathématiques (6 ECTS, Obligatoire)
- ANG101 - Anglais (3 ECTS, Obligatoire)
- PHY101 - Physique (5 ECTS, Obligatoire)

**Modules L2:**
- INF201 - Programmation Orientée Objet (6 ECTS, Obligatoire)
- MAT201 - Algèbre Linéaire (6 ECTS, Obligatoire)
- ANG201 - Anglais Technique (3 ECTS, Obligatoire)

**Modules L3:**
- INF301 - Bases de Données (6 ECTS, Obligatoire, Éliminatoire)
- INF302 - Réseaux (6 ECTS, Obligatoire)
- INF303 - Intelligence Artificielle (6 ECTS, Optionnel)

**Total:** 10 modules, 53 ECTS, 1 éliminatoire

---

### Exemple 2: Module Transversal

**Module:** ANG101 - Anglais (3 ECTS, Obligatoire)

**Associé à:**
- Licence Informatique (L1)
- Licence Génie Civil (L1)
- Licence Électronique (L1)

**Avantage:** Un seul module partagé entre plusieurs programmes

---

## 🔄 Relation avec Autres Features

### 1. Niveaux Programme
- Les modules sont filtrés selon les niveaux du programme
- Dépendance: Programme doit avoir des niveaux associés

### 2. Crédits ECTS
- Les statistiques affichent le total des crédits
- Utile pour validation des maquettes pédagogiques

### 3. Modules Éliminatoires
- Badge rouge affiché pour modules éliminatoires
- Compteur dans les statistiques

### 4. Inscriptions Étudiants
- Les étudiants ne peuvent s'inscrire qu'aux modules de leur programme
- Validation via `module_programs`

---

## 🧪 Tests à Effectuer

### Tests Manuels

1. **Création Association:**
   - [ ] Ouvrir dialog depuis ProgrammeListTable
   - [ ] Sélectionner plusieurs modules
   - [ ] Vérifier statistiques en temps réel
   - [ ] Enregistrer et vérifier sauvegarde

2. **Validation Cohérence:**
   - [ ] Programme Licence → seuls modules L1-L3 affichés
   - [ ] Programme Master → seuls modules M1-M2 affichés
   - [ ] Programme sans niveaux → message d'avertissement

3. **Sélection Niveau:**
   - [ ] Checkbox niveau → tous modules du niveau sélectionnés
   - [ ] Décocher niveau → tous modules désélectionnés
   - [ ] État indéterminé si sélection partielle

4. **Statistiques:**
   - [ ] Total modules correct
   - [ ] Total crédits correct
   - [ ] Répartition types correcte
   - [ ] Compteur éliminatoires correct

5. **Modification:**
   - [ ] Ouvrir dialog avec modules déjà associés
   - [ ] Modules actuels pré-sélectionnés
   - [ ] Ajouter/retirer modules
   - [ ] Enregistrer modifications

---

## 📝 Notes Techniques

### Performance
- `getAvailableModules()` charge tous les modules (per_page: 1000)
- Pour grandes bases de données, implémenter pagination ou lazy loading

### Multi-Tenancy
- Tous les appels API utilisent `createApiClient(tenantId)`
- Isolation stricte par tenant

### État Loading
- Loading states pour fetch initial
- Loading states pour sauvegarde
- Disabled states pendant sauvegarde

### Error Handling
- Affichage erreurs API dans Alert
- Messages d'erreur clairs pour l'utilisateur
- Retry possible sans fermer le dialog

---

## 🚀 Prochaines Étapes

### Backend (Priorité Haute)
1. Créer `ProgrammeModuleController.php`
2. Créer `AssociateModulesRequest.php`
3. Ajouter routes dans `admin.php`
4. Tester endpoints avec Postman

### Frontend (Optionnel)
1. Ajouter badge "X modules" dans ProgrammeListTable
2. Afficher modules dans ProgrammeFormDialog (lecture seule)
3. Export PDF maquette pédagogique avec modules

### Tests (Recommandé)
1. Tests unitaires backend (validation cohérence)
2. Tests fonctionnels API (CRUD associations)
3. Tests E2E frontend (workflow complet)

---

## ✅ Checklist Implémentation

### Frontend
- [x] Types TypeScript créés
- [x] Service API créé
- [x] Hook personnalisé créé
- [x] Composant Selector créé
- [x] Composant Dialog créé
- [x] ProgrammeListTable mis à jour
- [x] Exports ajoutés dans index.ts
- [x] Documentation créée

### Backend (À faire)
- [ ] Controller créé
- [ ] Request validation créée
- [ ] Routes ajoutées
- [ ] Tests unitaires
- [ ] Tests fonctionnels

---

**Implémentation Frontend: 100% Complete ✅**  
**Backend API: En attente d'implémentation**

