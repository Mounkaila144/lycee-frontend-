# Calendrier Académique - Frontend TODO

## ✅ Statut Backend: Ready for Review

Le backend est complet avec:
- ✅ Migrations (academic_years, semesters, academic_periods)
- ✅ Models (AcademicYear, Semester, AcademicPeriod)
- ✅ Controllers (AcademicYearController, SemesterController)
- ✅ Service (SemesterClosureService)
- ✅ Tests complets

## 📋 Frontend à Implémenter

### ✅ Déjà Créé
1. **Types TypeScript** - `types/academicCalendar.types.ts`
   - AcademicYear, Semester, AcademicPeriod
   - Form inputs et helpers

2. **Service API** - `admin/services/academicCalendarService.ts`
   - CRUD complet pour années académiques
   - CRUD complet pour semestres
   - CRUD complet pour périodes académiques
   - Activation d'année
   - Clôture de semestre

### 🔨 À Créer

#### 3. Hooks React
- `admin/hooks/useAcademicYears.ts`
  - Chargement des années académiques
  - CRUD avec mutations
  - Activation d'année

- `admin/hooks/useSemesters.ts`
  - Chargement des semestres
  - CRUD avec mutations
  - Clôture de semestre

- `admin/hooks/useAcademicPeriods.ts`
  - Chargement des périodes
  - CRUD avec mutations

#### 4. Composants UI

**Liste des Années Académiques:**
- `admin/components/AcademicYearList.tsx` - Container avec context
- `admin/components/AcademicYearListTable.tsx` - Table avec actions
- `admin/components/AcademicYearFormDialog.tsx` - Formulaire création/édition
- `admin/components/AcademicYearDeleteDialog.tsx` - Confirmation suppression

**Gestion des Semestres:**
- `admin/components/SemesterManagementDialog.tsx` - Dialog principal pour gérer les semestres d'une année
- `admin/components/SemesterFormDialog.tsx` - Formulaire semestre
- `admin/components/SemesterClosureDialog.tsx` - Confirmation clôture avec vérifications

**Périodes Académiques:**
- `admin/components/AcademicPeriodsDialog.tsx` - Gestion des périodes d'un semestre
- `admin/components/AcademicPeriodFormDialog.tsx` - Formulaire période
- `admin/components/AcademicCalendarView.tsx` - Vue calendrier visuelle (optionnel)

#### 5. Pages
- `app/[lang]/admin/structure/academic-years/page.tsx` - Page principale

#### 6. Menu
- Ajouter entrée dans `menu.config.ts`:
  ```typescript
  {
    id: 'academic-calendar',
    label: 'Calendrier Académique',
    href: '/admin/structure/academic-years',
    icon: 'ri-calendar-line',
    permissions: ['academic_years.manage']
  }
  ```

## 🎯 Fonctionnalités Clés

### Années Académiques
- ✅ Liste avec statut (Active/Terminée/Archivée)
- ✅ Création avec validation (9-12 mois)
- ✅ Activation (une seule active à la fois)
- ✅ Badge visuel pour l'année active
- ✅ Affichage des 2 semestres associés

### Semestres
- ✅ 2 semestres par année (S1, S2)
- ✅ Dates début/fin
- ✅ Périodes configurables:
  - Cours (courses_start_date, courses_end_date)
  - Examens (exams_start_date, exams_end_date)
- ✅ Validation: S1 avant S2, pas de chevauchement
- ✅ Clôture avec verrouillage

### Périodes Spéciales
- ✅ Types: Jours fériés, Vacances, Examens, Inscription, Rattrapage
- ✅ Dates début/fin
- ✅ Affichage avec couleurs par type
- ✅ Gestion par semestre

## 📊 Structure des Données

### AcademicYear
```typescript
{
  id: number
  name: string // "2025-2026"
  start_date: string
  end_date: string
  is_active: boolean
  status: 'Active' | 'Terminée' | 'Archivée'
  semesters?: Semester[]
}
```

### Semester
```typescript
{
  id: number
  academic_year_id: number
  name: string // "S1" or "S2"
  start_date: string
  end_date: string
  courses_start_date: string | null
  courses_end_date: string | null
  exams_start_date: string | null
  exams_end_date: string | null
  is_closed: boolean
  periods?: AcademicPeriod[]
}
```

### AcademicPeriod
```typescript
{
  id: number
  semester_id: number
  name: string
  type: 'holiday' | 'exam' | 'registration' | 'makeup_exam' | 'vacation'
  start_date: string
  end_date: string
}
```

## 🎨 Design Guidelines

### Couleurs par Statut
- **Active**: Success (vert)
- **Terminée**: Default (gris)
- **Archivée**: Warning (orange)

### Couleurs par Type de Période
- **Jour férié**: Error (rouge)
- **Examens**: Warning (orange)
- **Inscription**: Info (bleu)
- **Rattrapage**: Secondary (violet)
- **Vacances**: Success (vert)

### Icônes
- Année académique: `ri-calendar-line`
- Semestre: `ri-calendar-2-line`
- Période: `ri-time-line`
- Clôture: `ri-lock-line`
- Activation: `ri-checkbox-circle-line`

## 🔐 Permissions

- `academic_years.manage` - Gestion des années académiques
- `semesters.close` - Clôture des semestres

## 🧪 Scénarios de Test

### Test 1: Création Année Académique
1. Créer année "2025-2026" (01/09/2025 - 30/06/2026)
2. Vérifier que 2 semestres sont auto-créés
3. Vérifier que l'année est active par défaut

### Test 2: Activation Année
1. Créer une 2ème année "2026-2027"
2. Activer la nouvelle année
3. Vérifier que l'ancienne est désactivée

### Test 3: Configuration Semestre
1. Ouvrir la gestion des semestres
2. Configurer les dates de cours et examens pour S1
3. Ajouter des périodes (vacances, jours fériés)
4. Vérifier la validation des dates

### Test 4: Clôture Semestre
1. Clôturer S1
2. Vérifier que `is_closed = true`
3. Vérifier que la saisie des notes est verrouillée (dépend module Grades)

## 📝 Notes d'Implémentation

### Validation Côté Client
- Durée année: 9-12 mois
- S1 avant S2
- Pas de chevauchement de dates
- Périodes dans les limites du semestre

### Comportements Spéciaux
- Création année → auto-création de 2 semestres
- Activation année → désactivation des autres
- Clôture semestre → vérification notes saisies (si module Grades existe)
- Suppression année → cascade sur semestres et périodes

### Intégration avec Autres Modules
- **Modules**: Les modules sont associés à des semestres
- **Évaluations**: Les évaluations sont liées à des semestres
- **Grades**: La clôture verrouille la saisie des notes
- **Inscriptions**: Les périodes d'inscription sont définies ici

## 🚀 Priorité d'Implémentation

1. **Phase 1 (Essentiel)**:
   - Hooks (useAcademicYears, useSemesters)
   - AcademicYearList + Table
   - AcademicYearFormDialog
   - Page principale

2. **Phase 2 (Important)**:
   - SemesterManagementDialog
   - SemesterFormDialog
   - Activation d'année
   - Clôture de semestre

3. **Phase 3 (Optionnel)**:
   - AcademicPeriodsDialog
   - AcademicPeriodFormDialog
   - Vue calendrier visuelle
   - Statistiques et rapports

## 📚 Références

- Story: `docs/stories/structure-academique.gestion-semestres.01-calendrier-academique.story.md`
- Backend: `Modules/StructureAcademique/` (Laravel)
- Tests Backend: `tests/Feature/StructureAcademique/AcademicCalendar/`

---

**Note**: Cette story est fondamentale pour le système. Les semestres créés ici seront utilisés partout dans l'application (modules, évaluations, notes, inscriptions).

**Prochaine étape**: Implémenter les hooks et composants de la Phase 1.
