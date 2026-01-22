# Curriculum Implementation - Tronc Commun et Options

## 📋 Vue d'ensemble

Implémentation complète de la gestion du **tronc commun** et des **options** par spécialité pour le module Structure Académique.

## ✅ Fonctionnalités Implémentées

### 1. Tronc Commun (Core Curriculum)
- ✅ Configuration des modules communs par programme et niveau
- ✅ Ajout/Retrait de modules du tronc commun
- ✅ Visualisation des modules obligatoires pour tous les étudiants
- ✅ Validation: modification possible uniquement si pas d'inscriptions actives

### 2. Modules de Spécialité
- ✅ Association de modules spécifiques à chaque spécialité
- ✅ Types de modules:
  - **Obligatoires**: Tous les étudiants de la spécialité
  - **Optionnels**: Choix libre parmi une liste
- ✅ Gestion des capacités (places limitées) pour les options
- ✅ Suivi du nombre d'inscriptions par option

### 3. Choix d'Options Étudiants
- ✅ Interface de sélection des modules optionnels
- ✅ Validation des contraintes (min/max modules à choisir)
- ✅ Vérification de la capacité disponible
- ✅ Enregistrement et confirmation des choix
- ✅ Inscription automatique aux modules obligatoires

### 4. Visualisation
- ✅ Arbre de décision: Tronc commun → Spécialisations → Options
- ✅ Maquette pédagogique détaillée par parcours
- ✅ Vue complète du curriculum étudiant

## 📁 Structure des Fichiers

```
src/modules/StructureAcademique/
├── types/
│   └── curriculum.types.ts                    # Types TypeScript
├── admin/
│   ├── services/
│   │   └── curriculumService.ts               # Service API
│   ├── hooks/
│   │   └── useCurriculum.ts                   # React Query hooks
│   ├── components/
│   │   ├── CoreCurriculumDialog.tsx           # Gestion tronc commun
│   │   ├── SpecializationModulesDialog.tsx    # Gestion modules spécialité
│   │   ├── ElectiveChoiceDialog.tsx           # Choix options étudiants
│   │   └── CurriculumTreeView.tsx             # Visualisation arbre
│   └── __tests__/
│       └── curriculum.test.ts                 # Tests unitaires
```

## 🎯 Types Principaux

### CoreCurriculumModule
```typescript
interface CoreCurriculumModule {
  id: number;
  programme_id: number;
  level: string;
  module_id: number;
  module?: Module;
  created_at: string;
  updated_at: string;
}
```

### SpecializationModule
```typescript
interface SpecializationModule {
  id: number;
  specialization_id: number;
  module_id: number;
  type: 'Obligatoire' | 'Optionnel';
  capacity: number | null;
  current_enrollment?: number;
  module?: Module;
  created_at: string;
  updated_at: string;
}
```

### StudentModuleChoice
```typescript
interface StudentModuleChoice {
  id: number;
  student_id: number;
  module_id: number;
  specialization_id: number;
  choice_date: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  module?: Module;
  created_at: string;
  updated_at: string;
}
```

## 🔌 API Endpoints

### Tronc Commun
- `GET /api/admin/programmes/{id}/core-curriculum/{level}` - Liste modules tronc commun
- `POST /api/admin/programmes/{id}/core-curriculum/{level}` - Ajouter module
- `DELETE /api/admin/programmes/{id}/core-curriculum/{level}/{moduleId}` - Retirer module

### Modules de Spécialité
- `GET /api/admin/specializations/{id}/modules` - Liste modules spécialité
- `POST /api/admin/specializations/{id}/modules` - Ajouter module
- `DELETE /api/admin/specializations/{id}/modules/{moduleId}` - Retirer module

### Options Étudiants
- `GET /api/admin/specializations/{id}/electives` - Options disponibles
- `POST /api/admin/specializations/{id}/choose-electives` - Choisir options
- `POST /api/admin/specializations/{id}/confirm-electives` - Confirmer choix

### Curriculum Étudiant
- `GET /api/admin/student-curriculum` - Parcours complet étudiant

## 🎨 Composants

### 1. CoreCurriculumDialog
**Usage**: Gestion du tronc commun par programme/niveau

```tsx
import { CoreCurriculumDialog } from '@/modules/StructureAcademique';

<CoreCurriculumDialog
  open={open}
  onClose={handleClose}
  programme={programme}
  level="L3"
/>
```

**Fonctionnalités**:
- Affichage des modules du tronc commun
- Ajout de nouveaux modules via Autocomplete
- Retrait de modules existants
- Filtrage automatique des modules déjà ajoutés

### 2. SpecializationModulesDialog
**Usage**: Gestion des modules de spécialité (obligatoires et optionnels)

```tsx
import { SpecializationModulesDialog } from '@/modules/StructureAcademique';

<SpecializationModulesDialog
  open={open}
  onClose={handleClose}
  specialization={specialization}
/>
```

**Fonctionnalités**:
- Onglets séparés pour modules obligatoires et optionnels
- Configuration du type de module (Obligatoire/Optionnel)
- Définition de la capacité pour les options
- Affichage du taux de remplissage

### 3. ElectiveChoiceDialog
**Usage**: Interface de choix des options pour les étudiants

```tsx
import { ElectiveChoiceDialog } from '@/modules/StructureAcademique';

<ElectiveChoiceDialog
  open={open}
  onClose={handleClose}
  specialization={specialization}
  studentId={studentId}
/>
```

**Fonctionnalités**:
- Liste des options disponibles avec capacités
- Sélection multiple avec validation des contraintes
- Barre de progression (min/max options)
- Enregistrement et confirmation des choix
- Blocage des options pleines

### 4. CurriculumTreeView
**Usage**: Visualisation de l'arbre de décision du curriculum

```tsx
import { CurriculumTreeView } from '@/modules/StructureAcademique';

<CurriculumTreeView
  programme={programme}
  level="L3"
/>
```

**Fonctionnalités**:
- Affichage hiérarchique: Tronc commun → Spécialisations → Modules
- Accordéons pour navigation facile
- Badges de type (Obligatoire/Optionnel)
- Affichage des capacités et crédits

## 🪝 Hooks

### useCoreCurriculum
```typescript
const { data, isLoading, error } = useCoreCurriculum(programmeId, level);
```

### useCoreCurriculumMutations
```typescript
const { addModule, removeModule, isAdding, isRemoving } = useCoreCurriculumMutations();

addModule({ programmeId, level, data });
removeModule({ programmeId, level, moduleId });
```

### useSpecializationModules
```typescript
const { data, isLoading, error } = useSpecializationModules(specializationId);
```

### useSpecializationModuleMutations
```typescript
const { addModule, removeModule, isAdding, isRemoving } = useSpecializationModuleMutations();

addModule({ specializationId, data });
removeModule({ specializationId, moduleId });
```

### useAvailableElectives
```typescript
const { data, isLoading, error } = useAvailableElectives(specializationId);
// data.data: AvailableElective[]
// data.constraints: { min_electives, max_electives }
```

### useElectiveChoiceMutations
```typescript
const { chooseElectives, confirmElectives, isChoosing, isConfirming } = useElectiveChoiceMutations();

chooseElectives({ specializationId, data: { student_id, module_ids } });
confirmElectives({ specializationId, studentId });
```

### useStudentCurriculum
```typescript
const { data, isLoading, error } = useStudentCurriculum({
  student_id: 1,
  programme_id: 2,
  level: 'L3',
  specialization_id: 5,
});
```

## 🧪 Tests

### Exécuter les tests
```bash
npm test curriculum.test.ts
```

### Tests couverts
- ✅ Helper functions (labels, colors)
- ✅ Type validation
- ✅ Status mapping

## 📖 Exemples d'Utilisation

### Exemple 1: Configurer le Tronc Commun
```tsx
// Dans ProgrammeList.tsx
import { CoreCurriculumDialog } from '@/modules/StructureAcademique';

const [coreCurriculumOpen, setCoreCurriculumOpen] = useState(false);
const [selectedProgramme, setSelectedProgramme] = useState<Programme | null>(null);
const [selectedLevel, setSelectedLevel] = useState('L3');

<Button onClick={() => {
  setSelectedProgramme(programme);
  setSelectedLevel('L3');
  setCoreCurriculumOpen(true);
}}>
  Tronc Commun
</Button>

<CoreCurriculumDialog
  open={coreCurriculumOpen}
  onClose={() => setCoreCurriculumOpen(false)}
  programme={selectedProgramme!}
  level={selectedLevel}
/>
```

### Exemple 2: Gérer les Modules de Spécialité
```tsx
// Dans SpecializationList.tsx
import { SpecializationModulesDialog } from '@/modules/StructureAcademique';

const [modulesOpen, setModulesOpen] = useState(false);
const [selectedSpec, setSelectedSpec] = useState<Specialization | null>(null);

<IconButton onClick={() => {
  setSelectedSpec(specialization);
  setModulesOpen(true);
}}>
  <i className="ri-book-line" />
</IconButton>

<SpecializationModulesDialog
  open={modulesOpen}
  onClose={() => setModulesOpen(false)}
  specialization={selectedSpec!}
/>
```

### Exemple 3: Choix d'Options Étudiant
```tsx
// Dans StudentDashboard.tsx
import { ElectiveChoiceDialog } from '@/modules/StructureAcademique';

const [electiveOpen, setElectiveOpen] = useState(false);
const studentId = 123; // From auth context
const specialization = { id: 5, name: 'Informatique' };

<Button onClick={() => setElectiveOpen(true)}>
  Choisir mes options
</Button>

<ElectiveChoiceDialog
  open={electiveOpen}
  onClose={() => setElectiveOpen(false)}
  specialization={specialization}
  studentId={studentId}
/>
```

### Exemple 4: Visualiser le Curriculum
```tsx
// Dans ProgrammeDetails.tsx
import { CurriculumTreeView } from '@/modules/StructureAcademique';

<CurriculumTreeView
  programme={programme}
  level="L3"
/>
```

## 🔒 Permissions

### Backend
- `curriculum.manage` - Gérer tronc commun et modules de spécialité
- `modules.choose_electives` - Choisir des options (étudiants)

### Rôles
- **Superadmin/Responsable**: Configuration complète
- **Étudiant**: Choix des options uniquement

## 🚀 Prochaines Étapes

### Fonctionnalités Futures
- [ ] Export PDF du parcours personnalisé étudiant
- [ ] Historique des choix d'options
- [ ] Notifications de places disponibles
- [ ] Recommandations d'options basées sur le profil
- [ ] Statistiques de popularité des options

### Améliorations Possibles
- [ ] Drag & drop pour réorganiser les modules
- [ ] Prévisualisation du parcours avant confirmation
- [ ] Comparaison de parcours entre spécialisations
- [ ] Import/Export de configurations de curriculum

## 📝 Notes Importantes

1. **Validation Backend**: Le backend doit valider les contraintes (min/max, capacités)
2. **Transactions**: Les opérations de choix doivent être atomiques
3. **Cache**: Utiliser React Query pour optimiser les appels API
4. **Permissions**: Vérifier les permissions avant chaque action
5. **UX**: Afficher des messages clairs pour les erreurs de validation

## 🐛 Dépannage

### Problème: Modules non chargés
**Solution**: Vérifier que le `tenantId` est correctement passé au service

### Problème: Capacité non mise à jour
**Solution**: Invalider le cache React Query après mutation

### Problème: Validation échoue
**Solution**: Vérifier les contraintes min/max dans la réponse API

## 📞 Support

Pour toute question ou problème, consulter:
- Story: `structure-academique.gestion-specialites.02-tronc-commun-options.story.md`
- Backend: `Modules/StructureAcademique/Services/CurriculumService.php`
- Tests: `tests/Feature/StructureAcademique/CurriculumApiTest.php`

---

**Implémenté par**: James (dev agent)
**Date**: 2026-01-17
**Status**: ✅ Ready for Review
