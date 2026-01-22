# Curriculum - Guide de Démarrage Rapide

## 🚀 Utilisation Rapide

### 1. Gérer le Tronc Commun

```tsx
import { CoreCurriculumDialog } from '@/modules/StructureAcademique';

// Dans votre composant
const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>
  Tronc Commun
</Button>

<CoreCurriculumDialog
  open={open}
  onClose={() => setOpen(false)}
  programme={programme}
  level="L3"
/>
```

### 2. Gérer les Modules de Spécialité

```tsx
import { SpecializationModulesDialog } from '@/modules/StructureAcademique';

<SpecializationModulesDialog
  open={open}
  onClose={() => setOpen(false)}
  specialization={specialization}
/>
```

### 3. Choix d'Options Étudiant

```tsx
import { ElectiveChoiceDialog } from '@/modules/StructureAcademique';

<ElectiveChoiceDialog
  open={open}
  onClose={() => setOpen(false)}
  specialization={specialization}
  studentId={123}
/>
```

### 4. Visualiser le Curriculum

```tsx
import { CurriculumTreeView } from '@/modules/StructureAcademique';

<CurriculumTreeView
  programme={programme}
  level="L3"
/>
```

## 📦 Exports Disponibles

```typescript
// Types
import type {
  CoreCurriculumModule,
  SpecializationModule,
  StudentModuleChoice,
  AvailableElective,
  StudentCurriculum,
} from '@/modules/StructureAcademique';

// Hooks
import {
  useCoreCurriculum,
  useCoreCurriculumMutations,
  useSpecializationModules,
  useSpecializationModuleMutations,
  useAvailableElectives,
  useElectiveChoiceMutations,
  useStudentCurriculum,
} from '@/modules/StructureAcademique';

// Services
import { curriculumService } from '@/modules/StructureAcademique';

// Components
import {
  CoreCurriculumDialog,
  SpecializationModulesDialog,
  ElectiveChoiceDialog,
  CurriculumTreeView,
} from '@/modules/StructureAcademique';
```

## 🎯 Cas d'Usage Courants

### Ajouter un bouton "Tronc Commun" dans ProgrammeList

```tsx
// Dans ProgrammeListTable.tsx
<IconButton
  onClick={() => {
    setSelectedProgramme(programme);
    setCoreCurriculumOpen(true);
  }}
  title="Tronc Commun"
>
  <i className="ri-book-2-line" />
</IconButton>
```

### Ajouter un bouton "Modules" dans SpecializationList

```tsx
// Dans SpecializationListTable.tsx
<IconButton
  onClick={() => {
    setSelectedSpec(specialization);
    setModulesOpen(true);
  }}
  title="Gérer les modules"
>
  <i className="ri-book-line" />
</IconButton>
```

### Afficher le curriculum dans StudentDashboard

```tsx
// Dans StudentDashboard.tsx
const { data: curriculum } = useStudentCurriculum({
  student_id: studentId,
  programme_id: programmeId,
  level: 'L3',
  specialization_id: specializationId,
});

// Afficher les modules
{curriculum?.data.core_modules.map(module => (
  <ModuleCard key={module.id} module={module} />
))}
```

## 🔧 API Directe (sans composants)

### Récupérer le tronc commun

```typescript
import { curriculumService } from '@/modules/StructureAcademique';

const coreModules = await curriculumService.getCoreCurriculum(
  programmeId,
  'L3',
  tenantId
);
```

### Ajouter un module au tronc commun

```typescript
await curriculumService.addCoreCurriculumModule(
  programmeId,
  'L3',
  {
    programme_id: programmeId,
    level: 'L3',
    module_id: moduleId,
  },
  tenantId
);
```

### Récupérer les options disponibles

```typescript
const { data, constraints } = await curriculumService.getAvailableElectives(
  specializationId,
  tenantId
);

console.log(`Min: ${constraints.min_electives}, Max: ${constraints.max_electives}`);
console.log(`Options: ${data.length}`);
```

## 📚 Documentation Complète

Pour plus de détails, consultez:
- `CURRICULUM_IMPLEMENTATION.md` - Documentation complète
- `types/curriculum.types.ts` - Définitions TypeScript
- `admin/services/curriculumService.ts` - API service
- `admin/hooks/useCurriculum.ts` - React Query hooks

## 🐛 Dépannage Rapide

**Problème**: Modules non chargés
```typescript
// Vérifier le tenantId
const { tenantId } = useTenant();
console.log('Tenant ID:', tenantId);
```

**Problème**: Mutation ne met pas à jour l'UI
```typescript
// Invalider le cache manuellement
import { useQueryClient } from '@tanstack/react-query';
const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: ['coreCurriculum'] });
```

**Problème**: Validation échoue
```typescript
// Vérifier les contraintes
const { data } = useAvailableElectives(specializationId);
console.log('Constraints:', data?.constraints);
```

## ✅ Checklist d'Intégration

- [ ] Importer les composants nécessaires
- [ ] Ajouter les boutons d'action dans les listes
- [ ] Gérer l'état d'ouverture des dialogs
- [ ] Passer les bonnes props (programme, specialization, studentId)
- [ ] Tester avec différents niveaux (L1, L2, L3, M1, M2)
- [ ] Vérifier les permissions utilisateur
- [ ] Tester la validation des contraintes
- [ ] Vérifier le comportement avec capacités pleines

---

**Prêt à utiliser !** 🎉
