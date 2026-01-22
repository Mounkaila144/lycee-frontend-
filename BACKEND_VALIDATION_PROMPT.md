# 🔧 Backend - Validation Association Module ↔ Programme

## 🎯 Objectif
Ajouter une validation stricte pour empêcher l'association de modules dont le niveau ne correspond pas aux niveaux du programme.

---

## 🐛 Problème Actuel

### Situation
Un programme **Master** avec niveau **M1** a un module **L1** associé dans la table `module_programs`, ce qui est **incohérent**.

### Données Problématiques
```json
// Programme ID: 3
{
  "id": 3,
  "code": "23",
  "type": "Master",
  "levels": ["M1"]
}

// Module associé (INCOHÉRENT)
{
  "id": 2,
  "code": "test2",
  "level": "L1",  // ❌ Ne correspond pas au niveau M1 du programme
  "pivot": {
    "programme_id": 3,
    "module_id": 2
  }
}
```

### Requête SQL pour Identifier le Problème
```sql
-- Trouver toutes les associations incohérentes
SELECT 
    mp.programme_id,
    p.code as programme_code,
    p.type as programme_type,
    pl.level as programme_level,
    m.id as module_id,
    m.code as module_code,
    m.level as module_level
FROM module_programs mp
JOIN programmes p ON mp.programme_id = p.id
JOIN program_levels pl ON p.id = pl.program_id
JOIN modules m ON mp.module_id = m.id
WHERE m.level NOT IN (
    SELECT level 
    FROM program_levels 
    WHERE program_id = p.id
);
```

---

## ✅ Solution à Implémenter

### 1. Validation dans `AssociateModulesRequest`

**Fichier:** `Modules/StructureAcademique/Http/Requests/AssociateModulesRequest.php`

```php
<?php

namespace Modules\StructureAcademique\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\StructureAcademique\Entities\Module;

class AssociateModulesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Géré par middleware/policies
    }

    public function rules(): array
    {
        return [
            'module_ids' => ['required', 'array', 'min:1'],
            'module_ids.*' => ['required', 'integer', 'exists:modules,id'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // IMPORTANT: Récupérer le programme depuis la route
            // Si route model binding n'est pas configuré, utiliser find()
            $programmeId = $this->route('programme');
            
            // Si c'est une string/int, charger le modèle manuellement
            if (is_string($programmeId) || is_int($programmeId)) {
                $programme = \Modules\StructureAcademique\Entities\Programme::on('tenant')->find($programmeId);
            } else {
                // Si c'est déjà un objet Programme
                $programme = $programmeId;
            }
            
            if (!$programme) {
                $validator->errors()->add('programme', 'Programme introuvable.');
                return;
            }
            
            $moduleIds = $this->input('module_ids', []);
            
            // Récupérer les niveaux du programme
            $programmeLevels = $programme->levels()->pluck('level')->toArray();
            
            // Vérifier que le programme a au moins un niveau
            if (empty($programmeLevels)) {
                $validator->errors()->add(
                    'module_ids',
                    'Le programme doit avoir au moins un niveau associé avant d\'ajouter des modules.'
                );
                return;
            }
            
            // Vérifier que tous les modules correspondent aux niveaux du programme
            $modules = Module::on('tenant')->whereIn('id', $moduleIds)->get();
            
            $invalidModules = [];
            foreach ($modules as $module) {
                if (!in_array($module->level, $programmeLevels)) {
                    $invalidModules[] = sprintf(
                        "Module %s (%s) - niveau %s incompatible avec les niveaux du programme (%s)",
                        $module->code,
                        $module->name,
                        $module->level,
                        implode(', ', $programmeLevels)
                    );
                }
            }
            
            if (!empty($invalidModules)) {
                $validator->errors()->add('module_ids', $invalidModules);
            }
        });
    }

    public function messages(): array
    {
        return [
            'module_ids.required' => 'Veuillez sélectionner au moins un module.',
            'module_ids.array' => 'Le format des modules est invalide.',
            'module_ids.*.exists' => 'Un ou plusieurs modules sélectionnés n\'existent pas.',
        ];
    }
}
```

---

### 2. Mise à Jour du Controller

**Fichier:** `Modules/StructureAcademique/Http/Controllers/Admin/ProgrammeModuleController.php`

Vérifier que le controller utilise bien `AssociateModulesRequest`:

```php
<?php

namespace Modules\StructureAcademique\Http\Controllers\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Modules\StructureAcademique\Entities\Programme;
use Modules\StructureAcademique\Http\Requests\AssociateModulesRequest;
use Modules\StructureAcademique\Http\Resources\ModuleResource;

class ProgrammeModuleController extends Controller
{
    /**
     * Récupérer les modules associés à un programme
     */
    public function index(Programme $programme): JsonResponse
    {
        $modules = $programme->modules()->get();
        
        return response()->json([
            'data' => ModuleResource::collection($modules),
        ]);
    }

    /**
     * Associer des modules à un programme
     * Remplace les associations existantes
     */
    public function store(AssociateModulesRequest $request, Programme $programme): JsonResponse
    {
        $moduleIds = $request->input('module_ids', []);
        
        // Sync modules (remplace les associations existantes)
        $programme->modules()->sync($moduleIds);
        
        // Recharger les modules avec leurs relations
        $modules = $programme->modules()->get();
        
        return response()->json([
            'message' => 'Modules associés avec succès.',
            'data' => ModuleResource::collection($modules),
        ]);
    }

    /**
     * Dissocier un module d'un programme
     */
    public function destroy(Programme $programme, int $moduleId): JsonResponse
    {
        $programme->modules()->detach($moduleId);
        
        return response()->json([
            'message' => 'Module dissocié avec succès.',
        ]);
    }
}
```

---

### 3. Vérifier les Routes

**Fichier:** `Modules/StructureAcademique/Routes/admin.php`

```php
// Routes pour la gestion des modules d'un programme
Route::prefix('programmes/{programme}')->group(function () {
    Route::get('modules', [ProgrammeModuleController::class, 'index']);
    Route::post('modules', [ProgrammeModuleController::class, 'store']);
    Route::delete('modules/{moduleId}', [ProgrammeModuleController::class, 'destroy']);
});
```

---

## 🧪 Tests à Ajouter

### Test 1: Validation - Module Incompatible

**Fichier:** `tests/Feature/StructureAcademique/ProgrammeModuleValidationTest.php`

```php
<?php

namespace Tests\Feature\StructureAcademique;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\StructureAcademique\Entities\Programme;
use Modules\StructureAcademique\Entities\Module;

class ProgrammeModuleValidationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function cannot_associate_module_with_incompatible_level()
    {
        // Créer un programme Master avec niveau M1
        $programme = Programme::factory()->create(['type' => 'Master']);
        $programme->levels()->create(['level' => 'M1']);
        
        // Créer un module L1 (incompatible)
        $moduleL1 = Module::factory()->create(['level' => 'L1']);
        
        // Tenter d'associer le module L1 au programme Master
        $response = $this->postJson("/api/admin/programmes/{$programme->id}/modules", [
            'module_ids' => [$moduleL1->id]
        ]);
        
        // Doit échouer avec erreur 422
        $response->assertStatus(422);
        $response->assertJsonValidationErrors('module_ids');
        
        // Vérifier que le module n'a pas été associé
        $this->assertCount(0, $programme->fresh()->modules);
    }

    /** @test */
    public function can_associate_modules_with_compatible_levels()
    {
        // Créer un programme Master avec niveaux M1 et M2
        $programme = Programme::factory()->create(['type' => 'Master']);
        $programme->levels()->create(['level' => 'M1']);
        $programme->levels()->create(['level' => 'M2']);
        
        // Créer des modules M1 et M2 (compatibles)
        $moduleM1 = Module::factory()->create(['level' => 'M1']);
        $moduleM2 = Module::factory()->create(['level' => 'M2']);
        
        // Associer les modules
        $response = $this->postJson("/api/admin/programmes/{$programme->id}/modules", [
            'module_ids' => [$moduleM1->id, $moduleM2->id]
        ]);
        
        // Doit réussir
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'message',
            'data' => [
                '*' => ['id', 'code', 'name', 'level']
            ]
        ]);
        
        // Vérifier que les modules ont été associés
        $this->assertCount(2, $programme->fresh()->modules);
    }

    /** @test */
    public function cannot_associate_modules_if_programme_has_no_levels()
    {
        // Créer un programme sans niveaux
        $programme = Programme::factory()->create(['type' => 'Licence']);
        
        // Créer un module L1
        $moduleL1 = Module::factory()->create(['level' => 'L1']);
        
        // Tenter d'associer le module
        $response = $this->postJson("/api/admin/programmes/{$programme->id}/modules", [
            'module_ids' => [$moduleL1->id]
        ]);
        
        // Doit échouer
        $response->assertStatus(422);
        $response->assertJsonValidationErrors('module_ids');
        $response->assertJson([
            'errors' => [
                'module_ids' => [
                    'Le programme doit avoir au moins un niveau associé avant d\'ajouter des modules.'
                ]
            ]
        ]);
    }

    /** @test */
    public function can_replace_modules_with_sync()
    {
        // Créer un programme Licence avec niveaux L1, L2, L3
        $programme = Programme::factory()->create(['type' => 'Licence']);
        $programme->levels()->create(['level' => 'L1']);
        $programme->levels()->create(['level' => 'L2']);
        
        // Créer des modules
        $moduleL1_1 = Module::factory()->create(['level' => 'L1']);
        $moduleL1_2 = Module::factory()->create(['level' => 'L1']);
        $moduleL2 = Module::factory()->create(['level' => 'L2']);
        
        // Première association
        $programme->modules()->attach([$moduleL1_1->id]);
        $this->assertCount(1, $programme->fresh()->modules);
        
        // Remplacer par de nouveaux modules (sync)
        $response = $this->postJson("/api/admin/programmes/{$programme->id}/modules", [
            'module_ids' => [$moduleL1_2->id, $moduleL2->id]
        ]);
        
        $response->assertStatus(200);
        
        // Vérifier que les anciens modules ont été remplacés
        $programme = $programme->fresh();
        $this->assertCount(2, $programme->modules);
        $this->assertTrue($programme->modules->contains($moduleL1_2));
        $this->assertTrue($programme->modules->contains($moduleL2));
        $this->assertFalse($programme->modules->contains($moduleL1_1));
    }
}
```

---

## 🧹 Nettoyage des Données Existantes

### Script SQL pour Nettoyer les Associations Incohérentes

```sql
-- 1. Identifier les associations incohérentes
SELECT 
    mp.programme_id,
    p.code as programme_code,
    p.type,
    GROUP_CONCAT(DISTINCT pl.level) as programme_levels,
    m.id as module_id,
    m.code as module_code,
    m.level as module_level
FROM module_programs mp
JOIN programmes p ON mp.programme_id = p.id
LEFT JOIN program_levels pl ON p.id = pl.program_id
JOIN modules m ON mp.module_id = m.id
WHERE m.level NOT IN (
    SELECT level 
    FROM program_levels 
    WHERE program_id = p.id
)
GROUP BY mp.programme_id, p.code, p.type, m.id, m.code, m.level;

-- 2. Supprimer les associations incohérentes
DELETE mp FROM module_programs mp
JOIN programmes p ON mp.programme_id = p.id
JOIN modules m ON mp.module_id = m.id
WHERE m.level NOT IN (
    SELECT level 
    FROM program_levels pl
    WHERE pl.program_id = p.id
);

-- 3. Vérifier qu'il n'y a plus d'incohérences
SELECT COUNT(*) as remaining_inconsistencies
FROM module_programs mp
JOIN programmes p ON mp.programme_id = p.id
JOIN modules m ON mp.module_id = m.id
WHERE m.level NOT IN (
    SELECT level 
    FROM program_levels pl
    WHERE pl.program_id = p.id
);
-- Résultat attendu: 0
```

---

## 📋 Checklist d'Implémentation

### Backend
- [ ] Créer/Mettre à jour `AssociateModulesRequest` avec validation
- [ ] Vérifier que `ProgrammeModuleController` utilise la Request
- [ ] Vérifier les routes dans `admin.php`
- [ ] Créer les tests dans `ProgrammeModuleValidationTest.php`
- [ ] Exécuter les tests: `php artisan test --filter=ProgrammeModuleValidation`
- [ ] Nettoyer les données existantes avec le script SQL

### Validation
- [ ] Tester manuellement avec Postman/Insomnia:
  - Créer programme Master M1
  - Tenter d'associer module L1 → doit échouer (422)
  - Associer module M1 → doit réussir (200)
- [ ] Vérifier les messages d'erreur sont clairs
- [ ] Vérifier que le frontend affiche correctement les erreurs

---

## 🎯 Résultat Attendu

### Avant
```bash
POST /api/admin/programmes/3/modules
Body: { "module_ids": [2] }  # Module L1

Response: 200 OK ❌ (accepte module incompatible)
```

### Après
```bash
POST /api/admin/programmes/3/modules
Body: { "module_ids": [2] }  # Module L1

Response: 422 Unprocessable Entity ✅
{
  "message": "The given data was invalid.",
  "errors": {
    "module_ids": [
      "Module test2 (test2) - niveau L1 incompatible avec les niveaux du programme (M1)"
    ]
  }
}
```

---

## 📞 Questions / Clarifications

Si vous avez des questions sur l'implémentation:

1. **Où se trouve le controller actuel?**
   - Vérifier: `Modules/StructureAcademique/Http/Controllers/Admin/ProgrammeModuleController.php`

2. **La Request existe-t-elle déjà?**
   - Vérifier: `Modules/StructureAcademique/Http/Requests/AssociateModulesRequest.php`

3. **Les routes sont-elles configurées?**
   - Vérifier: `Modules/StructureAcademique/Routes/admin.php`

4. **Comment tester?**
   ```bash
   # Exécuter tous les tests
   php artisan test
   
   # Exécuter uniquement les tests de validation
   php artisan test --filter=ProgrammeModuleValidation
   
   # Avec coverage
   php artisan test --coverage
   ```

---

**Date:** 2026-01-13  
**Priorité:** HAUTE  
**Impact:** Intégrité des données  
**Temps estimé:** 1-2 heures
