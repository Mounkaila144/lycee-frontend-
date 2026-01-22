# 📋 Curriculum - Intégrations Restantes

## ✅ Déjà Intégré

- ✅ **SpecializationModulesDialog** - Bouton ajouté dans SpecializationList

---

## 🔜 À Intégrer

### 1. CoreCurriculumDialog (Tronc Commun)

**Où**: Dans `ProgrammeList.tsx` ou `ProgrammeListTable.tsx`

**Bouton à ajouter**: 
- Icône: `ri-book-2-line` (livre avec marque-page)
- Couleur: Primary (bleu)
- Tooltip: "Tronc Commun"

**Code à ajouter**:

```typescript
// Dans ProgrammeListTable.tsx

// 1. Ajouter la prop
interface ProgrammeListTableProps {
  // ... props existantes
  onManageCoreCurriculum: (programme: Programme, level: string) => void
}

// 2. Ajouter le bouton dans les actions
<Tooltip title="Tronc Commun">
  <IconButton 
    size="small" 
    color="primary" 
    onClick={() => onManageCoreCurriculum(programme, 'L3')}
  >
    <i className="ri-book-2-line" />
  </IconButton>
</Tooltip>

// Dans ProgrammeList.tsx

// 1. Import
import { CoreCurriculumDialog } from './CoreCurriculumDialog'

// 2. State
const [coreCurriculumOpen, setCoreCurriculumOpen] = useState(false)
const [selectedProgramme, setSelectedProgramme] = useState<Programme | null>(null)
const [selectedLevel, setSelectedLevel] = useState('L3')

// 3. Handler
const handleManageCoreCurriculum = (programme: Programme, level: string) => {
  setSelectedProgramme(programme)
  setSelectedLevel(level)
  setCoreCurriculumOpen(true)
}

// 4. Dialog
{selectedProgramme && (
  <CoreCurriculumDialog
    open={coreCurriculumOpen}
    onClose={() => setCoreCurriculumOpen(false)}
    programme={selectedProgramme}
    level={selectedLevel}
  />
)}
```

---

### 2. CurriculumTreeView (Visualisation)

**Où**: Nouvelle page ou onglet dans ProgrammeDetails

**Options d'intégration**:

#### Option A: Onglet dans ProgrammeDetails
```typescript
// Ajouter un onglet "Curriculum" dans les détails du programme
<Tab label="Curriculum" />

<TabPanel value={tabValue} index={X}>
  <CurriculumTreeView
    programme={programme}
    level="L3"
  />
</TabPanel>
```

#### Option B: Page dédiée
```typescript
// Créer une nouvelle page
// src/app/[lang]/admin/programmes/[id]/curriculum/page.tsx

import { CurriculumTreeView } from '@/modules/StructureAcademique'

export default function ProgrammeCurriculumPage({ params }) {
  // Fetch programme
  return <CurriculumTreeView programme={programme} level="L3" />
}
```

#### Option C: Dialog depuis ProgrammeList
```typescript
// Bouton "Voir Curriculum" dans ProgrammeList
<Tooltip title="Voir Curriculum">
  <IconButton onClick={() => handleViewCurriculum(programme)}>
    <i className="ri-organization-chart" />
  </IconButton>
</Tooltip>

// Dialog
<Dialog open={curriculumOpen} onClose={...} maxWidth="lg" fullWidth>
  <DialogTitle>Curriculum - {programme.code}</DialogTitle>
  <DialogContent>
    <CurriculumTreeView programme={programme} level="L3" />
  </DialogContent>
</Dialog>
```

---

### 3. ElectiveChoiceDialog (Choix Options Étudiants)

**Où**: Dans l'interface étudiant (frontend)

**Contexte**: Ce composant est pour les **étudiants**, pas les admins

**Intégration**:

```typescript
// Dans StudentDashboard ou StudentModules

// 1. Import
import { ElectiveChoiceDialog } from '@/modules/StructureAcademique'

// 2. Bouton pour l'étudiant
<Button 
  variant="contained" 
  onClick={() => setElectiveOpen(true)}
>
  Choisir mes options
</Button>

// 3. Dialog
<ElectiveChoiceDialog
  open={electiveOpen}
  onClose={() => setElectiveOpen(false)}
  specialization={studentSpecialization}
  studentId={currentStudentId}
/>
```

**Note**: Nécessite :
- Authentification étudiant
- Récupération de la spécialité de l'étudiant
- ID de l'étudiant connecté

---

## 🎯 Ordre d'Intégration Recommandé

### Phase 1: Admin (Priorité Haute)
1. ✅ **SpecializationModulesDialog** - FAIT
2. 🔜 **CoreCurriculumDialog** - À faire
3. 🔜 **CurriculumTreeView** - À faire

### Phase 2: Étudiant (Priorité Moyenne)
4. 🔜 **ElectiveChoiceDialog** - À faire quand l'interface étudiant existe

---

## 📝 Checklist d'Intégration

### Pour chaque composant :

- [ ] Import du composant
- [ ] Ajout du state (open/close)
- [ ] Ajout du handler
- [ ] Ajout du bouton dans l'UI
- [ ] Ajout du dialog/composant
- [ ] Test fonctionnel
- [ ] Vérification des permissions

---

## 🔧 Code Complet pour CoreCurriculumDialog

Voici le code complet à ajouter dans `ProgrammeList.tsx` :

```typescript
'use client'

import { useState } from 'react'
// ... autres imports
import { CoreCurriculumDialog } from './CoreCurriculumDialog'

const ProgrammeList = () => {
  // ... states existants
  
  // NOUVEAU: State pour CoreCurriculum
  const [coreCurriculumOpen, setCoreCurriculumOpen] = useState(false)
  const [selectedProgramme, setSelectedProgramme] = useState<Programme | null>(null)
  const [selectedLevel, setSelectedLevel] = useState('L3')

  // NOUVEAU: Handler
  const handleManageCoreCurriculum = (programme: Programme, level: string) => {
    setSelectedProgramme(programme)
    setSelectedLevel(level)
    setCoreCurriculumOpen(true)
  }

  return (
    <Box>
      {/* ... contenu existant */}
      
      <ProgrammeListTable
        programmes={programmes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onManageCoreCurriculum={handleManageCoreCurriculum} // NOUVEAU
      />

      {/* ... dialogs existants */}

      {/* NOUVEAU: CoreCurriculum Dialog */}
      {selectedProgramme && (
        <CoreCurriculumDialog
          open={coreCurriculumOpen}
          onClose={() => setCoreCurriculumOpen(false)}
          programme={selectedProgramme}
          level={selectedLevel}
        />
      )}
    </Box>
  )
}
```

Et dans `ProgrammeListTable.tsx` :

```typescript
interface ProgrammeListTableProps {
  programmes: Programme[]
  onEdit: (programme: Programme) => void
  onDelete: (programme: Programme) => void
  onManageCoreCurriculum: (programme: Programme, level: string) => void // NOUVEAU
}

// Dans les actions de chaque ligne :
<Tooltip title="Tronc Commun">
  <IconButton 
    size="small" 
    color="primary" 
    onClick={() => onManageCoreCurriculum(programme, 'L3')}
  >
    <i className="ri-book-2-line" />
  </IconButton>
</Tooltip>
```

---

## 🎨 Icônes Recommandées

| Composant | Icône | Classe Remix Icon |
|-----------|-------|-------------------|
| Modules Spécialité | 📚 | `ri-book-line` |
| Tronc Commun | 📖 | `ri-book-2-line` |
| Curriculum Tree | 🌳 | `ri-organization-chart` |
| Choix Options | ✅ | `ri-checkbox-multiple-line` |

---

## ✅ Validation

Après intégration, vérifiez :

1. ✅ Le bouton apparaît dans l'UI
2. ✅ Le dialog s'ouvre au clic
3. ✅ Les données se chargent
4. ✅ Les actions fonctionnent (ajout/retrait)
5. ✅ Le dialog se ferme correctement
6. ✅ Les données se rafraîchissent après modification

---

**Besoin d'aide pour intégrer ?** Dites-moi quel composant vous voulez intégrer et je vous fournirai le code exact !
