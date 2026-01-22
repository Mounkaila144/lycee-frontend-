# ⚠️ Backend Endpoints Manquants

## 🔴 Problème Identifié

L'erreur **"Erreur lors du chargement des modules"** indique que **l'endpoint backend n'existe pas encore**.

---

## 📍 Endpoint Manquant

### Ce Qui Est Appelé
```
GET /admin/specializations/{id}/modules
```

### Ce Qui Est Attendu
```json
{
  "data": [
    {
      "id": 1,
      "specialization_id": 1,
      "module_id": 5,
      "type": "Obligatoire",
      "capacity": null,
      "current_enrollment": 0,
      "module": {
        "id": 5,
        "code": "MOD001",
        "name": "Algorithmique Avancée",
        "credits_ects": 6,
        "coefficient": 1.5
      }
    }
  ]
}
```

---

## 🛠️ Solution Backend (Laravel)

### 1. Créer la Migration

```bash
php artisan make:migration create_specialization_modules_table
```

```php
// database/migrations/xxxx_create_specialization_modules_table.php
Schema::create('specialization_modules', function (Blueprint $table) {
    $table->id();
    $table->foreignId('specialization_id')->constrained()->onDelete('cascade');
    $table->foreignId('module_id')->constrained()->onDelete('cascade');
    $table->enum('type', ['Obligatoire', 'Optionnel'])->default('Obligatoire');
    $table->integer('capacity')->nullable(); // Pour les optionnels
    $table->integer('current_enrollment')->default(0);
    $table->timestamps();
    
    // Unique constraint
    $table->unique(['specialization_id', 'module_id']);
});
```

### 2. Créer le Modèle

```bash
php artisan make:model SpecializationModule
```

```php
// app/Models/SpecializationModule.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpecializationModule extends Model
{
    protected $fillable = [
        'specialization_id',
        'module_id',
        'type',
        'capacity',
        'current_enrollment',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'current_enrollment' => 'integer',
    ];

    public function specialization()
    {
        return $this->belongsTo(Specialization::class);
    }

    public function module()
    {
        return $this->belongsTo(Module::class);
    }
}
```

### 3. Ajouter la Relation dans Specialization

```php
// app/Models/Specialization.php
public function specializationModules()
{
    return $this->hasMany(SpecializationModule::class);
}

public function modules()
{
    return $this->belongsToMany(Module::class, 'specialization_modules')
        ->withPivot('type', 'capacity', 'current_enrollment')
        ->withTimestamps();
}
```

### 4. Créer le Controller

```bash
php artisan make:controller Admin/SpecializationModuleController
```

```php
// app/Http/Controllers/Admin/SpecializationModuleController.php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Specialization;
use App\Models\SpecializationModule;
use Illuminate\Http\Request;

class SpecializationModuleController extends Controller
{
    /**
     * Get all modules for a specialization
     */
    public function index(Specialization $specialization)
    {
        $modules = $specialization->specializationModules()
            ->with('module')
            ->get();

        return response()->json([
            'data' => $modules
        ]);
    }

    /**
     * Add a module to specialization
     */
    public function store(Request $request, Specialization $specialization)
    {
        $validated = $request->validate([
            'module_id' => 'required|exists:modules,id',
            'type' => 'required|in:Obligatoire,Optionnel',
            'capacity' => 'nullable|integer|min:1',
        ]);

        // Check if module already exists
        $exists = SpecializationModule::where('specialization_id', $specialization->id)
            ->where('module_id', $validated['module_id'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Ce module est déjà dans la spécialité'
            ], 422);
        }

        $specializationModule = SpecializationModule::create([
            'specialization_id' => $specialization->id,
            'module_id' => $validated['module_id'],
            'type' => $validated['type'],
            'capacity' => $validated['capacity'] ?? null,
        ]);

        $specializationModule->load('module');

        return response()->json([
            'data' => $specializationModule,
            'message' => 'Module ajouté avec succès'
        ], 201);
    }

    /**
     * Remove a module from specialization
     */
    public function destroy(Specialization $specialization, $moduleId)
    {
        $specializationModule = SpecializationModule::where('specialization_id', $specialization->id)
            ->where('module_id', $moduleId)
            ->firstOrFail();

        $specializationModule->delete();

        return response()->json([
            'message' => 'Module retiré avec succès'
        ]);
    }

    /**
     * Update module settings (capacity, type)
     */
    public function update(Request $request, Specialization $specialization, $moduleId)
    {
        $validated = $request->validate([
            'type' => 'sometimes|in:Obligatoire,Optionnel',
            'capacity' => 'nullable|integer|min:1',
        ]);

        $specializationModule = SpecializationModule::where('specialization_id', $specialization->id)
            ->where('module_id', $moduleId)
            ->firstOrFail();

        $specializationModule->update($validated);
        $specializationModule->load('module');

        return response()->json([
            'data' => $specializationModule,
            'message' => 'Module mis à jour avec succès'
        ]);
    }
}
```

### 5. Ajouter les Routes

```php
// routes/api.php (dans le groupe admin)
Route::prefix('admin')->middleware(['auth:sanctum', 'tenant'])->group(function () {
    // ... autres routes ...
    
    // Specialization Modules
    Route::get('specializations/{specialization}/modules', [SpecializationModuleController::class, 'index']);
    Route::post('specializations/{specialization}/modules', [SpecializationModuleController::class, 'store']);
    Route::put('specializations/{specialization}/modules/{module}', [SpecializationModuleController::class, 'update']);
    Route::delete('specializations/{specialization}/modules/{module}', [SpecializationModuleController::class, 'destroy']);
});
```

### 6. Exécuter la Migration

```bash
php artisan migrate
```

---

## 🧪 Tester l'Endpoint

### Avec cURL

```bash
# Get modules
curl -X GET http://localhost:8000/api/admin/specializations/1/modules \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"

# Add module
curl -X POST http://localhost:8000/api/admin/specializations/1/modules \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "module_id": 5,
    "type": "Obligatoire"
  }'

# Add optional module with capacity
curl -X POST http://localhost:8000/api/admin/specializations/1/modules \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "module_id": 6,
    "type": "Optionnel",
    "capacity": 30
  }'

# Remove module
curl -X DELETE http://localhost:8000/api/admin/specializations/1/modules/5 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

### Avec Postman

1. **GET** `http://localhost:8000/api/admin/specializations/1/modules`
   - Headers: `Authorization: Bearer {token}`
   - Headers: `Accept: application/json`

2. **POST** `http://localhost:8000/api/admin/specializations/1/modules`
   - Headers: `Authorization: Bearer {token}`
   - Headers: `Content-Type: application/json`
   - Body (JSON):
     ```json
     {
       "module_id": 5,
       "type": "Obligatoire"
     }
     ```

---

## 📋 Autres Endpoints Nécessaires

### Tronc Commun (Core Curriculum)

```php
// Routes
Route::get('programmes/{programme}/core-curriculum/{level}', [CoreCurriculumController::class, 'index']);
Route::post('programmes/{programme}/core-curriculum/{level}', [CoreCurriculumController::class, 'store']);
Route::delete('programmes/{programme}/core-curriculum/{level}/{module}', [CoreCurriculumController::class, 'destroy']);
```

### Choix d'Options Étudiants

```php
// Routes
Route::get('specializations/{specialization}/electives', [ElectiveController::class, 'available']);
Route::post('specializations/{specialization}/choose-electives', [ElectiveController::class, 'choose']);
Route::post('specializations/{specialization}/confirm-electives', [ElectiveController::class, 'confirm']);
```

### Curriculum Étudiant Complet

```php
// Route
Route::get('student-curriculum', [CurriculumController::class, 'show']);
```

---

## ✅ Checklist Backend

### Specialization Modules
- [ ] Migration créée
- [ ] Modèle SpecializationModule créé
- [ ] Relations ajoutées dans Specialization
- [ ] Controller créé
- [ ] Routes ajoutées
- [ ] Migration exécutée
- [ ] Endpoint testé avec cURL/Postman

### Core Curriculum
- [ ] Migration créée
- [ ] Modèle CoreCurriculumModule créé
- [ ] Controller créé
- [ ] Routes ajoutées

### Elective Choices
- [ ] Migration créée
- [ ] Modèle StudentModuleChoice créé
- [ ] Controller créé
- [ ] Routes ajoutées

---

## 🔄 Après Implémentation Backend

Une fois les endpoints créés :

1. **Rechargez la page** dans le navigateur
2. **Cliquez sur le bouton 📚** "Manage Modules"
3. Le dialog devrait maintenant charger les modules correctement
4. Vous pourrez ajouter/retirer des modules

---

## 📞 Besoin d'Aide ?

### Si l'erreur persiste après implémentation :

1. **Vérifiez les logs Laravel**
   ```bash
   tail -f storage/logs/laravel.log
   ```

2. **Vérifiez la console du navigateur** (F12 → Console)
   - Quel est le code d'erreur HTTP ? (404, 500, etc.)
   - Quel est le message d'erreur exact ?

3. **Vérifiez la requête** (F12 → Network)
   - L'URL est-elle correcte ?
   - Les headers sont-ils présents ?
   - Le token est-il valide ?

---

## 🎯 Résumé

**Problème** : L'endpoint `/admin/specializations/{id}/modules` n'existe pas dans le backend

**Solution** : Implémenter les endpoints backend selon le code ci-dessus

**Après** : Le frontend fonctionnera automatiquement sans modification

---

**Le frontend est prêt ! Il attend juste que le backend soit implémenté. 🚀**

