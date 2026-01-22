# 🔧 Backend Fix: Route Model Binding Error

## 🐛 Erreur

```
POST /api/admin/programmes/1/modules
Status: 500

{
  "message": "Call to a member function levels() on string",
  "exception": "Error",
  "file": "AssociateModulesRequest.php",
  "line": 30
}
```

## 🔍 Cause

Dans `AssociateModulesRequest.php`, le code essaie d'appeler `levels()` sur `$this->route('programme')`, mais cette méthode retourne une **string** (l'ID du programme) au lieu d'un **objet Programme**.

### Code Problématique
```php
public function withValidator($validator)
{
    $validator->after(function ($validator) {
        $programme = $this->route('programme');  // ❌ Retourne "1" (string)
        $programmeLevels = $programme->levels()->pluck('level')->toArray();  // ❌ ERREUR
    });
}
```

## ✅ Solution

### Option 1: Charger le Modèle Manuellement (RECOMMANDÉ)

```php
<?php

namespace Modules\StructureAcademique\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\StructureAcademique\Entities\Module;
use Modules\StructureAcademique\Entities\Programme;

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

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Récupérer l'ID du programme depuis la route
            $programmeId = $this->route('programme');
            
            // Charger le modèle Programme manuellement
            $programme = Programme::on('tenant')->find($programmeId);
            
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

### Option 2: Configurer Route Model Binding (AVANCÉ)

**Fichier:** `Modules/StructureAcademique/Routes/admin.php`

```php
use Modules\StructureAcademique\Entities\Programme;

// Avant les routes
Route::bind('programme', function ($value) {
    return Programme::on('tenant')->findOrFail($value);
});

// Routes
Route::prefix('programmes/{programme}')->group(function () {
    Route::get('modules', [ProgrammeModuleController::class, 'index']);
    Route::post('modules', [ProgrammeModuleController::class, 'store']);
    Route::delete('modules/{moduleId}', [ProgrammeModuleController::class, 'destroy']);
});
```

**Avantage:** Le binding est automatique partout  
**Inconvénient:** Plus complexe, nécessite configuration globale

---

## 🎯 Solution Recommandée

**Utilisez l'Option 1** (chargement manuel) car:
- ✅ Plus simple et explicite
- ✅ Fonctionne immédiatement
- ✅ Pas de configuration supplémentaire
- ✅ Gère correctement le contexte multi-tenant (`on('tenant')`)

---

## 📋 Checklist de Correction

### Backend
- [ ] Ouvrir `Modules/StructureAcademique/Http/Requests/AssociateModulesRequest.php`
- [ ] Remplacer le code de `withValidator()` par la version corrigée
- [ ] Ajouter `use Modules\StructureAcademique\Entities\Programme;` en haut du fichier
- [ ] Tester avec Postman/Insomnia

### Test Manuel
```bash
# Test 1: Programme Licence + Module L1 (doit réussir)
POST http://tenant1.local/api/admin/programmes/1/modules
Body: { "module_ids": [1] }
Expected: 200 OK

# Test 2: Programme Master + Module L1 (doit échouer)
POST http://tenant1.local/api/admin/programmes/3/modules
Body: { "module_ids": [1] }
Expected: 422 Unprocessable Entity
```

---

## 🧪 Vérification

### Avant le Fix
```
POST /api/admin/programmes/1/modules
Body: { "module_ids": [1] }

Response: 500 Internal Server Error
{
  "message": "Call to a member function levels() on string"
}
```

### Après le Fix
```
POST /api/admin/programmes/1/modules
Body: { "module_ids": [1] }

Response: 200 OK
{
  "message": "Modules associés avec succès.",
  "data": [...]
}
```

---

## 📝 Code Complet à Copier-Coller

```php
<?php

namespace Modules\StructureAcademique\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\StructureAcademique\Entities\Module;
use Modules\StructureAcademique\Entities\Programme;

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

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $programmeId = $this->route('programme');
            $programme = Programme::on('tenant')->find($programmeId);
            
            if (!$programme) {
                $validator->errors()->add('programme', 'Programme introuvable.');
                return;
            }
            
            $moduleIds = $this->input('module_ids', []);
            $programmeLevels = $programme->levels()->pluck('level')->toArray();
            
            if (empty($programmeLevels)) {
                $validator->errors()->add(
                    'module_ids',
                    'Le programme doit avoir au moins un niveau associé avant d\'ajouter des modules.'
                );
                return;
            }
            
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

## 🚀 Après le Fix

Une fois corrigé, vous pourrez:
1. ✅ Sélectionner des modules dans le frontend
2. ✅ Sauvegarder l'association
3. ✅ Le backend validera la cohérence des niveaux
4. ✅ Les modules incompatibles seront rejetés avec un message clair

---

**Date:** 2026-01-14  
**Priorité:** CRITIQUE  
**Impact:** Bloque l'association Module ↔ Programme  
**Temps estimé:** 5 minutes
