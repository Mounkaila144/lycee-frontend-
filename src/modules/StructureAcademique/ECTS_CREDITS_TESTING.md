# 🧪 Guide de Tests - Configuration Crédits ECTS

## 📋 Vue d'ensemble

Ce document fournit des exemples de tests pour les composants de configuration des crédits ECTS.

---

## 🔧 Configuration des Tests

### Installation des Dépendances
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev jest @types/jest
```

### Configuration Jest
**Fichier:** `jest.config.js`
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

**Fichier:** `jest.setup.js`
```javascript
import '@testing-library/jest-dom';
```

---

## 🧪 Tests Unitaires

### Test: levelCreditService

**Fichier:** `__tests__/services/levelCreditService.test.ts`
```typescript
import { levelCreditService } from '@/modules/StructureAcademique/admin/services/levelCreditService';
import { createApiClient } from '@/shared/lib/api-client';

jest.mock('@/shared/lib/api-client');

describe('levelCreditService', () => {
  const mockClient = {
    get: jest.fn(),
    post: jest.fn(),
  };

  beforeEach(() => {
    (createApiClient as jest.Mock).mockReturnValue(mockClient);
    jest.clearAllMocks();
  });

  describe('getGlobalConfigurations', () => {
    it('should fetch global configurations', async () => {
      const mockData = {
        data: [
          {
            id: 1,
            program_id: null,
            level: 'L1',
            semester_1_credits: 30,
            semester_2_credits: 30,
            total_credits: 60,
            created_at: '2026-01-10',
            updated_at: '2026-01-10',
          },
        ],
      };

      mockClient.get.mockResolvedValue({ data: mockData });

      const result = await levelCreditService.getGlobalConfigurations('tenant-1');

      expect(createApiClient).toHaveBeenCalledWith('tenant-1');
      expect(mockClient.get).toHaveBeenCalledWith('/admin/levels/credits');
      expect(result).toEqual(mockData.data);
    });

    it('should handle errors', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(
        levelCreditService.getGlobalConfigurations('tenant-1')
      ).rejects.toThrow('Network error');
    });
  });

  describe('updateGlobalConfiguration', () => {
    it('should update global configuration', async () => {
      const formData = {
        level: 'L1' as const,
        semester_1_credits: 32,
        semester_2_credits: 28,
      };

      const mockResponse = {
        data: {
          data: {
            id: 1,
            program_id: null,
            ...formData,
            total_credits: 60,
            created_at: '2026-01-10',
            updated_at: '2026-01-10',
          },
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await levelCreditService.updateGlobalConfiguration(formData, 'tenant-1');

      expect(mockClient.post).toHaveBeenCalledWith('/admin/levels/credits', formData);
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('validateProgramCredits', () => {
    it('should validate program credits', async () => {
      const mockReport = {
        data: {
          data: {
            L1: {
              level: 'L1',
              configured_credits: 60,
              modules_credits: 58,
              status: 'KO',
              gap: 2,
            },
          },
        },
      };

      mockClient.get.mockResolvedValue(mockReport);

      const result = await levelCreditService.validateProgramCredits(1, 'tenant-1');

      expect(mockClient.get).toHaveBeenCalledWith('/admin/programmes/1/credits/validate');
      expect(result).toEqual(mockReport.data.data);
    });
  });
});
```

### Test: useLevelCredits Hook

**Fichier:** `__tests__/hooks/useLevelCredits.test.ts`
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useGlobalLevelCredits } from '@/modules/StructureAcademique/admin/hooks/useLevelCredits';
import { levelCreditService } from '@/modules/StructureAcademique/admin/services/levelCreditService';

jest.mock('@/modules/StructureAcademique/admin/services/levelCreditService');
jest.mock('@/shared/lib/tenant-context', () => ({
  useTenant: () => ({ tenantId: 'tenant-1' }),
}));

describe('useGlobalLevelCredits', () => {
  const mockConfigurations = [
    {
      id: 1,
      program_id: null,
      level: 'L1' as const,
      semester_1_credits: 30,
      semester_2_credits: 30,
      total_credits: 60,
      created_at: '2026-01-10',
      updated_at: '2026-01-10',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch configurations on mount', async () => {
    (levelCreditService.getGlobalConfigurations as jest.Mock).mockResolvedValue(
      mockConfigurations
    );

    const { result } = renderHook(() => useGlobalLevelCredits());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.configurations).toEqual(mockConfigurations);
    expect(result.current.error).toBeNull();
  });

  it('should handle errors', async () => {
    const error = new Error('Failed to fetch');
    (levelCreditService.getGlobalConfigurations as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useGlobalLevelCredits());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.configurations).toEqual([]);
  });

  it('should update configuration', async () => {
    (levelCreditService.getGlobalConfigurations as jest.Mock).mockResolvedValue(
      mockConfigurations
    );
    (levelCreditService.updateGlobalConfiguration as jest.Mock).mockResolvedValue(
      mockConfigurations[0]
    );

    const { result } = renderHook(() => useGlobalLevelCredits());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const formData = {
      level: 'L1' as const,
      semester_1_credits: 32,
      semester_2_credits: 28,
    };

    await result.current.updateConfiguration(formData);

    expect(levelCreditService.updateGlobalConfiguration).toHaveBeenCalledWith(
      formData,
      'tenant-1'
    );
  });
});
```

---

## 🎨 Tests de Composants

### Test: LevelCreditConfigDialog

**Fichier:** `__tests__/components/LevelCreditConfigDialog.test.tsx`
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LevelCreditConfigDialog from '@/modules/StructureAcademique/admin/components/LevelCreditConfigDialog';

describe('LevelCreditConfigDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default values', () => {
    render(
      <LevelCreditConfigDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        level="L1"
      />
    );

    expect(screen.getByLabelText('Crédits Semestre 1')).toHaveValue(30);
    expect(screen.getByLabelText('Crédits Semestre 2')).toHaveValue(30);
    expect(screen.getByText('60 crédits')).toBeInTheDocument();
  });

  it('renders with existing configuration', () => {
    const existingConfig = {
      id: 1,
      program_id: null,
      level: 'L1' as const,
      semester_1_credits: 32,
      semester_2_credits: 28,
      total_credits: 60,
      created_at: '2026-01-10',
      updated_at: '2026-01-10',
    };

    render(
      <LevelCreditConfigDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        level="L1"
        existingConfig={existingConfig}
      />
    );

    expect(screen.getByLabelText('Crédits Semestre 1')).toHaveValue(32);
    expect(screen.getByLabelText('Crédits Semestre 2')).toHaveValue(28);
  });

  it('shows warning for non-LMD total', () => {
    render(
      <LevelCreditConfigDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        level="L1"
      />
    );

    const s1Input = screen.getByLabelText('Crédits Semestre 1');
    fireEvent.change(s1Input, { target: { value: '40' } });

    expect(screen.getByText(/Le total annuel devrait être de 60 crédits/)).toBeInTheDocument();
  });

  it('shows info for unbalanced distribution', () => {
    render(
      <LevelCreditConfigDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        level="L1"
      />
    );

    const s1Input = screen.getByLabelText('Crédits Semestre 1');
    fireEvent.change(s1Input, { target: { value: '40' } });

    const s2Input = screen.getByLabelText('Crédits Semestre 2');
    fireEvent.change(s2Input, { target: { value: '20' } });

    expect(screen.getByText(/La répartition est déséquilibrée/)).toBeInTheDocument();
  });

  it('calls onSave with correct data', async () => {
    mockOnSave.mockResolvedValue(undefined);

    render(
      <LevelCreditConfigDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        level="L1"
      />
    );

    const s1Input = screen.getByLabelText('Crédits Semestre 1');
    fireEvent.change(s1Input, { target: { value: '32' } });

    const s2Input = screen.getByLabelText('Crédits Semestre 2');
    fireEvent.change(s2Input, { target: { value: '28' } });

    const saveButton = screen.getByText('Enregistrer');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        level: 'L1',
        semester_1_credits: 32,
        semester_2_credits: 28,
      });
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('disables save button for invalid values', () => {
    render(
      <LevelCreditConfigDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        level="L1"
      />
    );

    const s1Input = screen.getByLabelText('Crédits Semestre 1');
    fireEvent.change(s1Input, { target: { value: '10' } }); // < 15

    const saveButton = screen.getByText('Enregistrer');
    expect(saveButton).toBeDisabled();
  });
});
```

### Test: LevelCreditConfigTable

**Fichier:** `__tests__/components/LevelCreditConfigTable.test.tsx`
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import LevelCreditConfigTable from '@/modules/StructureAcademique/admin/components/LevelCreditConfigTable';

describe('LevelCreditConfigTable', () => {
  const mockOnEdit = jest.fn();

  const mockConfigurations = [
    {
      id: 1,
      program_id: null,
      level: 'L1' as const,
      semester_1_credits: 30,
      semester_2_credits: 30,
      total_credits: 60,
      created_at: '2026-01-10',
      updated_at: '2026-01-10',
    },
    {
      id: 2,
      program_id: null,
      level: 'L2' as const,
      semester_1_credits: 35,
      semester_2_credits: 25,
      total_credits: 60,
      created_at: '2026-01-10',
      updated_at: '2026-01-10',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all 5 levels', () => {
    render(
      <LevelCreditConfigTable
        configurations={mockConfigurations}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByText('Licence 1')).toBeInTheDocument();
    expect(screen.getByText('Licence 2')).toBeInTheDocument();
    expect(screen.getByText('Licence 3')).toBeInTheDocument();
    expect(screen.getByText('Master 1')).toBeInTheDocument();
    expect(screen.getByText('Master 2')).toBeInTheDocument();
  });

  it('shows configured values', () => {
    render(
      <LevelCreditConfigTable
        configurations={mockConfigurations}
        onEdit={mockOnEdit}
      />
    );

    // L1: 30+30
    const l1Row = screen.getByText('Licence 1').closest('tr');
    expect(l1Row).toHaveTextContent('30 crédits');
    expect(l1Row).toHaveTextContent('60 crédits');

    // L2: 35+25
    const l2Row = screen.getByText('Licence 2').closest('tr');
    expect(l2Row).toHaveTextContent('35 crédits');
    expect(l2Row).toHaveTextContent('25 crédits');
  });

  it('shows default values for unconfigured levels', () => {
    render(
      <LevelCreditConfigTable
        configurations={mockConfigurations}
        onEdit={mockOnEdit}
      />
    );

    const l3Row = screen.getByText('Licence 3').closest('tr');
    expect(l3Row).toHaveTextContent('(Valeurs par défaut)');
    expect(l3Row).toHaveTextContent('30 crédits');
  });

  it('shows LMD badge for 60 credits', () => {
    render(
      <LevelCreditConfigTable
        configurations={mockConfigurations}
        onEdit={mockOnEdit}
      />
    );

    const lmdBadges = screen.getAllByText('LMD');
    expect(lmdBadges.length).toBeGreaterThan(0);
  });

  it('shows balanced/unbalanced status', () => {
    render(
      <LevelCreditConfigTable
        configurations={mockConfigurations}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByText('Équilibré')).toBeInTheDocument();
    expect(screen.getByText('Déséquilibré')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <LevelCreditConfigTable
        configurations={mockConfigurations}
        onEdit={mockOnEdit}
      />
    );

    const editButtons = screen.getAllByRole('button');
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith('L1', mockConfigurations[0]);
  });
});
```

### Test: CreditValidationReport

**Fichier:** `__tests__/components/CreditValidationReport.test.tsx`
```typescript
import { render, screen } from '@testing-library/react';
import CreditValidationReport from '@/modules/StructureAcademique/admin/components/CreditValidationReport';

describe('CreditValidationReport', () => {
  const mockValidationReport = {
    L1: {
      level: 'L1' as const,
      configured_credits: 60,
      modules_credits: 58,
      status: 'KO' as const,
      gap: 2,
    },
    L2: {
      level: 'L2' as const,
      configured_credits: 60,
      modules_credits: 60,
      status: 'OK' as const,
      gap: 0,
    },
  };

  it('shows loading state', () => {
    render(
      <CreditValidationReport
        validationReport={null}
        loading={true}
        error={null}
      />
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error state', () => {
    const error = new Error('Validation failed');

    render(
      <CreditValidationReport
        validationReport={null}
        loading={false}
        error={error}
      />
    );

    expect(screen.getByText(/Erreur lors de la validation/)).toBeInTheDocument();
  });

  it('shows validation report', () => {
    render(
      <CreditValidationReport
        validationReport={mockValidationReport}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText('Licence 1')).toBeInTheDocument();
    expect(screen.getByText('Licence 2')).toBeInTheDocument();
    expect(screen.getByText('60 crédits')).toBeInTheDocument();
    expect(screen.getByText('58 crédits')).toBeInTheDocument();
  });

  it('shows error alert when validation has errors', () => {
    render(
      <CreditValidationReport
        validationReport={mockValidationReport}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText(/Incohérences détectées/)).toBeInTheDocument();
  });

  it('shows success alert when validation is OK', () => {
    const okReport = {
      L1: {
        level: 'L1' as const,
        configured_credits: 60,
        modules_credits: 60,
        status: 'OK' as const,
        gap: 0,
      },
    };

    render(
      <CreditValidationReport
        validationReport={okReport}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText(/Maquette pédagogique valide/)).toBeInTheDocument();
  });

  it('shows gap information', () => {
    render(
      <CreditValidationReport
        validationReport={mockValidationReport}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText('Manque 2')).toBeInTheDocument();
  });

  it('shows status badges', () => {
    render(
      <CreditValidationReport
        validationReport={mockValidationReport}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText('Valide')).toBeInTheDocument();
    expect(screen.getByText('Invalide')).toBeInTheDocument();
  });
});
```

---

## 🔄 Tests d'Intégration

### Test: GlobalLevelCreditConfig (Full Flow)

**Fichier:** `__tests__/integration/GlobalLevelCreditConfig.test.tsx`
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GlobalLevelCreditConfig from '@/modules/StructureAcademique/admin/components/GlobalLevelCreditConfig';
import { levelCreditService } from '@/modules/StructureAcademique/admin/services/levelCreditService';

jest.mock('@/modules/StructureAcademique/admin/services/levelCreditService');
jest.mock('@/shared/lib/tenant-context', () => ({
  useTenant: () => ({ tenantId: 'tenant-1' }),
}));

describe('GlobalLevelCreditConfig Integration', () => {
  const mockConfigurations = [
    {
      id: 1,
      program_id: null,
      level: 'L1' as const,
      semester_1_credits: 30,
      semester_2_credits: 30,
      total_credits: 60,
      created_at: '2026-01-10',
      updated_at: '2026-01-10',
    },
  ];

  beforeEach(() => {
    (levelCreditService.getGlobalConfigurations as jest.Mock).mockResolvedValue(
      mockConfigurations
    );
    (levelCreditService.updateGlobalConfiguration as jest.Mock).mockResolvedValue(
      mockConfigurations[0]
    );
  });

  it('complete flow: load, edit, save', async () => {
    render(<GlobalLevelCreditConfig />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Licence 1')).toBeInTheDocument();
    });

    // Click edit button
    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find(btn => btn.querySelector('.ri-edit-line'));
    fireEvent.click(editButton!);

    // Wait for dialog
    await waitFor(() => {
      expect(screen.getByLabelText('Crédits Semestre 1')).toBeInTheDocument();
    });

    // Change values
    const s1Input = screen.getByLabelText('Crédits Semestre 1');
    fireEvent.change(s1Input, { target: { value: '32' } });

    const s2Input = screen.getByLabelText('Crédits Semestre 2');
    fireEvent.change(s2Input, { target: { value: '28' } });

    // Save
    const saveButton = screen.getByText('Enregistrer');
    fireEvent.click(saveButton);

    // Verify service was called
    await waitFor(() => {
      expect(levelCreditService.updateGlobalConfiguration).toHaveBeenCalledWith(
        {
          level: 'L1',
          semester_1_credits: 32,
          semester_2_credits: 28,
        },
        'tenant-1'
      );
    });
  });
});
```

---

## 📊 Couverture de Tests

### Objectifs de Couverture
- **Services:** 80%+
- **Hooks:** 80%+
- **Composants:** 70%+
- **Types:** 100% (TypeScript)

### Commandes
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test LevelCreditConfigDialog.test.tsx

# Run in watch mode
npm test -- --watch
```

---

## ✅ Checklist de Tests

### Tests Unitaires
- [ ] levelCreditService - getGlobalConfigurations
- [ ] levelCreditService - updateGlobalConfiguration
- [ ] levelCreditService - getProgramConfigurations
- [ ] levelCreditService - updateProgramConfiguration
- [ ] levelCreditService - validateProgramCredits
- [ ] useGlobalLevelCredits - fetch on mount
- [ ] useGlobalLevelCredits - update configuration
- [ ] useGlobalLevelCredits - error handling
- [ ] useProgramLevelCredits - fetch on mount
- [ ] useProgramCreditValidation - validate

### Tests de Composants
- [ ] LevelCreditConfigDialog - render with defaults
- [ ] LevelCreditConfigDialog - render with existing config
- [ ] LevelCreditConfigDialog - validation warnings
- [ ] LevelCreditConfigDialog - save functionality
- [ ] LevelCreditConfigTable - render all levels
- [ ] LevelCreditConfigTable - show configured values
- [ ] LevelCreditConfigTable - show default values
- [ ] LevelCreditConfigTable - status badges
- [ ] CreditValidationReport - loading state
- [ ] CreditValidationReport - error state
- [ ] CreditValidationReport - validation report
- [ ] CreditValidationReport - gap information

### Tests d'Intégration
- [ ] GlobalLevelCreditConfig - complete flow
- [ ] ProgramLevelCreditConfig - complete flow
- [ ] Multi-tenancy isolation

---

**Ces tests couvrent les cas d'usage principaux et garantissent la qualité du code!** ✅
