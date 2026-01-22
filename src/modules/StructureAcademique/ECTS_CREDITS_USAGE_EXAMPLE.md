# Exemples d'Utilisation - Configuration Crédits ECTS

## 📄 Pages Next.js

### Page Configuration Globale

**Fichier:** `src/app/[lang]/admin/structure/credits/page.tsx`

```tsx
'use client';

import { Box, Container } from '@mui/material';
import { GlobalLevelCreditConfig } from '@/modules/StructureAcademique';

export default function GlobalCreditsPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <GlobalLevelCreditConfig />
      </Box>
    </Container>
  );
}
```

### Page Configuration Programme

**Fichier:** `src/app/[lang]/admin/programmes/[id]/credits/page.tsx`

```tsx
'use client';

import { useParams } from 'next/navigation';
import { Box, Container, CircularProgress } from '@mui/material';
import { ProgramLevelCreditConfig } from '@/modules/StructureAcademique';
import { programmeService } from '@/modules/StructureAcademique';
import { useTenant } from '@/shared/lib/tenant-context';
import { useState, useEffect } from 'react';

export default function ProgramCreditsPage() {
  const params = useParams();
  const { tenantId } = useTenant();
  const programId = Number(params.id);
  
  const [programme, setProgramme] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgramme = async () => {
      try {
        const data = await programmeService.getProgramme(programId, tenantId);
        setProgramme(data);
      } catch (error) {
        console.error('Error fetching programme:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgramme();
  }, [programId, tenantId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!programme) {
    return <Box>Programme non trouvé</Box>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <ProgramLevelCreditConfig
          programId={programId}
          programName={programme.libelle}
        />
      </Box>
    </Container>
  );
}
```

## 🔧 Intégration dans un Composant Existant

### Ajouter un Onglet dans ProgrammeDetail

```tsx
'use client';

import { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { ProgramLevelCreditConfig } from '@/modules/StructureAcademique';

interface ProgrammeDetailProps {
  programme: Programme;
}

export default function ProgrammeDetail({ programme }: ProgrammeDetailProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box>
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
        <Tab label="Informations" />
        <Tab label="Niveaux" />
        <Tab label="Crédits ECTS" />
        <Tab label="Historique" />
      </Tabs>

      {activeTab === 0 && <ProgrammeInfo programme={programme} />}
      {activeTab === 1 && <ProgrammeLevels programme={programme} />}
      {activeTab === 2 && (
        <ProgramLevelCreditConfig
          programId={programme.id}
          programName={programme.libelle}
        />
      )}
      {activeTab === 3 && <ProgrammeHistory programme={programme} />}
    </Box>
  );
}
```

## 🎯 Utilisation des Hooks

### Hook: useGlobalLevelCredits

```tsx
'use client';

import { useGlobalLevelCredits } from '@/modules/StructureAcademique';
import { Button, Box, Alert } from '@mui/material';

export default function GlobalCreditsManager() {
  const {
    configurations,
    loading,
    error,
    refresh,
    updateConfiguration
  } = useGlobalLevelCredits();

  const handleUpdate = async () => {
    try {
      await updateConfiguration({
        level: 'L1',
        semester_1_credits: 32,
        semester_2_credits: 28
      });
      alert('Configuration mise à jour!');
    } catch (err) {
      alert('Erreur lors de la mise à jour');
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  return (
    <Box>
      <pre>{JSON.stringify(configurations, null, 2)}</pre>
      <Button onClick={handleUpdate}>Mettre à jour L1</Button>
      <Button onClick={refresh}>Actualiser</Button>
    </Box>
  );
}
```

### Hook: useProgramLevelCredits

```tsx
'use client';

import { useProgramLevelCredits } from '@/modules/StructureAcademique';
import { Button, Box } from '@mui/material';

export default function ProgramCreditsManager({ programId }: { programId: number }) {
  const {
    configurations,
    loading,
    error,
    updateConfiguration
  } = useProgramLevelCredits(programId);

  const handleOverride = async () => {
    try {
      await updateConfiguration({
        level: 'M1',
        semester_1_credits: 35,
        semester_2_credits: 25
      });
      alert('Configuration programme mise à jour!');
    } catch (err) {
      alert('Erreur');
    }
  };

  return (
    <Box>
      <h3>Configurations pour le programme {programId}</h3>
      {configurations.map(config => (
        <div key={config.id}>
          {config.level}: {config.semester_1_credits} + {config.semester_2_credits} = {config.total_credits}
        </div>
      ))}
      <Button onClick={handleOverride}>Override M1</Button>
    </Box>
  );
}
```

### Hook: useProgramCreditValidation

```tsx
'use client';

import { useProgramCreditValidation } from '@/modules/StructureAcademique';
import { Button, Box, Alert } from '@mui/material';

export default function ProgramValidator({ programId }: { programId: number }) {
  const {
    validationReport,
    loading,
    error,
    validate
  } = useProgramCreditValidation(programId);

  if (loading) return <div>Validation en cours...</div>;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  const hasErrors = validationReport && Object.values(validationReport).some(r => r.status === 'KO');

  return (
    <Box>
      <Button onClick={validate}>Valider la maquette</Button>
      
      {hasErrors && (
        <Alert severity="error">
          Incohérences détectées! Le programme ne peut pas être activé.
        </Alert>
      )}

      {validationReport && (
        <Box sx={{ mt: 2 }}>
          {Object.entries(validationReport).map(([level, result]) => (
            <Box key={level} sx={{ mb: 1 }}>
              <strong>{level}:</strong> {result.configured_credits} configurés, {result.modules_credits} modules
              {result.gap !== 0 && <span> (Écart: {result.gap})</span>}
              <span> - {result.status}</span>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
```

## 🎨 Composants Standalone

### Dialogue de Configuration

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@mui/material';
import { LevelCreditConfigDialog } from '@/modules/StructureAcademique';
import type { AcademicLevel } from '@/modules/StructureAcademique';

export default function ConfigureCreditsButton() {
  const [open, setOpen] = useState(false);

  const handleSave = async (data: any) => {
    console.log('Saving:', data);
    // Call API here
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Configurer L1
      </Button>
      
      <LevelCreditConfigDialog
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        level="L1"
        title="Configuration Licence 1"
      />
    </>
  );
}
```

### Tableau de Configuration

```tsx
'use client';

import { LevelCreditConfigTable } from '@/modules/StructureAcademique';
import type { LevelCreditConfiguration, AcademicLevel } from '@/modules/StructureAcademique';

const mockConfigs: LevelCreditConfiguration[] = [
  {
    id: 1,
    program_id: null,
    level: 'L1',
    semester_1_credits: 30,
    semester_2_credits: 30,
    total_credits: 60,
    created_at: '2026-01-10',
    updated_at: '2026-01-10'
  }
];

export default function CreditsTable() {
  const handleEdit = (level: AcademicLevel, config?: LevelCreditConfiguration) => {
    console.log('Edit:', level, config);
  };

  return (
    <LevelCreditConfigTable
      configurations={mockConfigs}
      onEdit={handleEdit}
      isGlobal={true}
    />
  );
}
```

### Rapport de Validation

```tsx
'use client';

import { CreditValidationReport } from '@/modules/StructureAcademique';
import type { CreditValidationReport as ReportType } from '@/modules/StructureAcademique';

const mockReport: ReportType = {
  L1: {
    level: 'L1',
    configured_credits: 60,
    modules_credits: 58,
    status: 'KO',
    gap: 2
  },
  L2: {
    level: 'L2',
    configured_credits: 60,
    modules_credits: 60,
    status: 'OK',
    gap: 0
  }
};

export default function ValidationReportExample() {
  return (
    <CreditValidationReport
      validationReport={mockReport}
      loading={false}
      error={null}
    />
  );
}
```

## 🔗 Ajout au Menu de Navigation

### Configuration du Menu

```tsx
// src/configs/navigation.ts

export const navigationItems = [
  {
    title: 'Structure Académique',
    icon: 'ri-building-line',
    children: [
      {
        title: 'Programmes',
        path: '/admin/programmes',
        icon: 'ri-book-line'
      },
      {
        title: 'Configuration Crédits ECTS',
        path: '/admin/structure/credits',
        icon: 'ri-medal-line'
      }
    ]
  }
];
```

## 🧪 Tests d'Intégration

### Test avec React Testing Library

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GlobalLevelCreditConfig } from '@/modules/StructureAcademique';

// Mock du hook
jest.mock('@/modules/StructureAcademique', () => ({
  useGlobalLevelCredits: () => ({
    configurations: [
      {
        id: 1,
        program_id: null,
        level: 'L1',
        semester_1_credits: 30,
        semester_2_credits: 30,
        total_credits: 60,
        created_at: '2026-01-10',
        updated_at: '2026-01-10'
      }
    ],
    loading: false,
    error: null,
    updateConfiguration: jest.fn()
  })
}));

describe('GlobalLevelCreditConfig', () => {
  it('renders credit configuration table', () => {
    render(<GlobalLevelCreditConfig />);
    expect(screen.getByText('Configuration Globale des Crédits ECTS')).toBeInTheDocument();
    expect(screen.getByText('Licence 1')).toBeInTheDocument();
  });

  it('opens dialog when edit button is clicked', async () => {
    render(<GlobalLevelCreditConfig />);
    const editButton = screen.getAllByRole('button')[0];
    fireEvent.click(editButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Configuration/)).toBeInTheDocument();
    });
  });
});
```

## 📱 Responsive Design

### Mobile Layout

```tsx
'use client';

import { useMediaQuery, useTheme } from '@mui/material';
import { ProgramLevelCreditConfig } from '@/modules/StructureAcademique';

export default function ResponsiveCreditsPage({ programId, programName }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ p: isMobile ? 2 : 4 }}>
      <ProgramLevelCreditConfig
        programId={programId}
        programName={programName}
      />
    </Box>
  );
}
```

## 🎯 Permissions

### Vérification des Permissions

```tsx
'use client';

import { usePermissions } from '@/shared/contexts';
import { GlobalLevelCreditConfig } from '@/modules/StructureAcademique';
import { Alert } from '@mui/material';

export default function ProtectedCreditsPage() {
  const { hasCredential } = usePermissions();

  if (!hasCredential('levels.configure_credits')) {
    return (
      <Alert severity="error">
        Vous n'avez pas la permission de configurer les crédits ECTS.
      </Alert>
    );
  }

  return <GlobalLevelCreditConfig />;
}
```

---

**Ces exemples couvrent tous les cas d'usage courants!** 🚀
