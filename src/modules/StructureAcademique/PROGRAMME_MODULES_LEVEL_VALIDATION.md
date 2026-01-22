# Programme Modules - Validation des Niveaux

## 🐛 Problème Identifié

### Symptôme
Lors de l'ouverture du dialog "Gérer les Modules" pour un programme Master M1:
- Le message "Aucun module disponible" s'affiche
- Mais l'API retourne un module L1 associé au programme
- Les statistiques affichent "Total modules: 1"

### Cause Racine
**Le backend a associé un module L1 à un programme Master M1**, ce qui est **incohérent**.

### Données API
```json
// Programme
{
  "id": 3,
  "type": "Master",
  "levels": ["M1"]
}

// Modules associés (PROBLÈME ICI)
{
  "data": [{
    "id": 2,
    "code": "test2",
    "level": "L1",  // ❌ INCOHÉRENT avec programme Master M1
    "pivot": {
      "programme_id": 3,
      "module_id": 2
    }
  }]
}
```

---

## ✅ Solution Implémentée (Frontend)

### 1. Filtrage Strict par Niveau
Le composant `ProgrammeModuleSelector` filtre les modules:
```typescript
const filteredModules = availableModules.filter(module =>
  programmeLevels.includes(module.level as ProgrammeLevel)
);
```

**Résultat:** Le module L1 est **filtré** et n'apparaît pas dans la liste.

---

### 2. Message d'Erreur Amélioré
Avant:
```
Aucun module disponible pour les niveaux de ce programme.
```

Après:
```
⚠️ Aucun module compatible trouvé.

Ce programme nécessite des modules de niveau M1.
Les modules existants ne correspondent pas à ces niveaux.

Créez des modules pour les niveaux M1 ou vérifiez les associations existantes.
```

---

### 3. Détection des Modules Incompatibles
Si des modules incompatibles sont déjà associés, un avertissement s'affiche:

```
⚠️ Modules incompatibles détectés

Les modules suivants sont associés mais ne correspondent pas aux niveaux du programme (M1):
• test2 - test2 (Niveau: L1)

Ces modules seront automatiquement dissociés lors de la sauvegarde.
```

---

## 🔧 Solution Backend (À Implémenter)

### Validation lors de l'Association

**Fichier:** `Modules/StructureAcademique/Http/Requests/AssociateModulesRequest.php`

```php
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
        $programme = $this->route('programme');
        $moduleIds = $this->input('module_ids', []);
        
        // Récupérer les niveaux du programme
        $programmeLevels = $programme->levels()->pluck('level')->toArray();
        
        if (empty($programmeLevels)) {
            $validator->errors()->add(
                'module_ids',
                'Le programme doit avoir au moins un niveau associé avant d\'ajouter des modules.'
            );
            return;
        }
        
        // Vérifier que tous les modules correspondent aux niveaux du programme
        $modules = Module::whereIn('id', $moduleIds)->get();
        
        foreach ($modules as $module) {
            if (!in_array($module->level, $programmeLevels)) {
                $validator->errors()->add(
                    'module_ids',
                    "Le module {$module->code} (niveau {$module->level}) ne correspond pas aux niveaux du programme (" . implode(', ', $programmeLevels) . ")."
                );
            }
        }
    });
}
```

---

### Controller - Validation Supplémentaire

**Fichier:** `Modules/StructureAcademique/Http/Controllers/Admin/ProgrammeModuleController.php`

```php
public function store(AssociateModulesRequest $request, Programme $programme)
{
    $moduleIds = $request->input('module_ids', []);
    
    // Validation supplémentaire
    $programmeLevels = $programme->levels()->pluck('level')->toArray();
    $modules = Module::whereIn('id', $moduleIds)->get();
    
    $invalidModules = $modules->filter(function ($module) use ($programmeLevels) {
        return !in_array($module->level, $programmeLevels);
    });
    
    if ($invalidModules->isNotEmpty()) {
        return response()->json([
            'message' => 'Certains modules ne correspondent pas aux niveaux du programme.',
            'errors' => [
                'module_ids' => $invalidModules->map(function ($module) use ($programmeLevels) {
                    return "Module {$module->code} (niveau {$module->level}) incompatible avec les niveaux du programme (" . implode(', ', $programmeLevels) . ").";
                })->toArray()
            ]
        ], 422);
    }
    
    // Sync modules
    $programme->modules()->sync($moduleIds);
    
    return response()->json([
        'message' => 'Modules associés avec succès.',
        'data' => $programme->modules()->get()
    ]);
}
```

---

## 🧪 Tests à Ajouter

### Test Unitaire
```php
/** @test */
public function cannot_associate_module_with_incompatible_level()
{
    $programme = Programme::factory()->create(['type' => 'Master']);
    $programme->levels()->create(['level' => 'M1']);
    
    $moduleL1 = Module::factory()->create(['level' => 'L1']);
    
    $response = $this->postJson("/api/admin/programmes/{$programme->id}/modules", [
        'module_ids' => [$moduleL1->id]
    ]);
    
    $response->assertStatus(422);
    $response->assertJsonValidationErrors('module_ids');
}
```

### Test Fonctionnel
```php
/** @test */
public function can_only_associate_modules_matching_programme_levels()
{
    $programme = Programme::factory()->create(['type' => 'Master']);
    $programme->levels()->create(['level' => 'M1']);
    $programme->levels()->create(['level' => 'M2']);
    
    $moduleM1 = Module::factory()->create(['level' => 'M1']);
    $moduleM2 = Module::factory()->create(['level' => 'M2']);
    $moduleL1 = Module::factory()->create(['level' => 'L1']);
    
    $response = $this->postJson("/api/admin/programmes/{$programme->id}/modules", [
        'module_ids' => [$moduleM1->id, $moduleM2->id]
    ]);
    
    $response->assertStatus(200);
    $this->assertCount(2, $programme->fresh()->modules);
    
    // Tentative avec module L1 (doit échouer)
    $response = $this->postJson("/api/admin/programmes/{$programme->id}/modules", [
        'module_ids' => [$moduleM1->id, $moduleL1->id]
    ]);
    
    $response->assertStatus(422);
}
```

---

## 📋 Checklist de Correction

### Frontend ✅
- [x] Filtrage strict des modules par niveau
- [x] Message d'erreur amélioré
- [x] Détection des modules incompatibles
- [x] Avertissement visuel pour associations incohérentes

### Backend ⏳
- [ ] Validation dans `AssociateModulesRequest`
- [ ] Validation dans `ProgrammeModuleController`
- [ ] Tests unitaires
- [ ] Tests fonctionnels
- [ ] Nettoyage des associations existantes incohérentes

---

## 🚀 Actions Immédiates

### 1. Nettoyer les Données Existantes
```sql
-- Identifier les associations incohérentes
SELECT 
    mp.programme_id,
    p.type,
    pl.level as programme_level,
    m.code,
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

-- Supprimer les associations incohérentes
DELETE mp FROM module_programs mp
JOIN programmes p ON mp.programme_id = p.id
JOIN modules m ON mp.module_id = m.id
WHERE m.level NOT IN (
    SELECT level 
    FROM program_levels pl
    WHERE pl.program_id = p.id
);
```

### 2. Implémenter la Validation Backend
Suivre les exemples de code ci-dessus.

### 3. Tester
- Créer un programme Master avec niveaux M1, M2
- Créer des modules L1, M1, M2
- Tenter d'associer module L1 → doit échouer
- Associer modules M1, M2 → doit réussir

---

## 📝 Notes

- Le frontend **protège déjà** contre les associations incohérentes
- Le backend **doit aussi valider** pour éviter les manipulations directes
- Les associations existantes incohérentes doivent être **nettoyées**
- Cette validation suit le même pattern que `ProgramLevel` (Licence → L1-L3, Master → M1-M2)

---

**Date:** 2026-01-13
**Agent:** James (dev)
**Status:** Frontend ✅ | Backend ⏳
