# UsersGuard Module - Usage Examples

**Date**: 2026-01-13

Ce document fournit des exemples pratiques d'utilisation des nouveaux hooks, services et composants du module UsersGuard.

---

## 📚 Table des Matières

1. [Students Endpoint](#students-endpoint)
2. [Financial Roles](#financial-roles)
3. [Permissions & Roles Management](#permissions--roles-management)

---

## Students Endpoint

### Exemple 1: Liste Simple d'Étudiants

```typescript
'use client';

import { useStudents } from '@/modules/UsersGuard';
import { CircularProgress, Alert, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

const StudentListPage = () => {
  const { students, loading, error } = useStudents();

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Matricule</TableCell>
          <TableCell>Nom Complet</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Statut</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.id}>
            <TableCell>{student.matricule}</TableCell>
            <TableCell>{student.full_name}</TableCell>
            <TableCell>{student.email}</TableCell>
            <TableCell>{student.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default StudentListPage;
```

### Exemple 2: Liste avec Recherche et Filtres

```typescript
'use client';

import { useState } from 'react';
import { useStudents } from '@/modules/UsersGuard';
import { Box, TextField, Select, MenuItem, FormControl, InputLabel, Pagination } from '@mui/material';

const StudentListWithFilters = () => {
  const {
    students,
    loading,
    pagination,
    setSearch,
    setProgram,
    setLevel,
    setStatus,
    setPage
  } = useStudents();

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSearch(e.target.value);
  };

  return (
    <Box>
      {/* Barre de recherche */}
      <TextField
        fullWidth
        placeholder="Rechercher un étudiant..."
        value={searchQuery}
        onChange={handleSearchChange}
        sx={{ mb: 2 }}
      />

      {/* Filtres */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Programme</InputLabel>
          <Select onChange={(e) => setProgram(Number(e.target.value))}>
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value={1}>Licence Informatique</MenuItem>
            <MenuItem value={2}>Master Data Science</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Statut</InputLabel>
          <Select onChange={(e) => setStatus(e.target.value as any)}>
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="Actif">Actif</MenuItem>
            <MenuItem value="Suspendu">Suspendu</MenuItem>
            <MenuItem value="Diplômé">Diplômé</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Liste des étudiants */}
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {/* Votre table ici */}
          <Pagination
            count={pagination.last_page}
            page={pagination.current_page}
            onChange={(_, page) => setPage(page)}
          />
        </>
      )}
    </Box>
  );
};

export default StudentListWithFilters;
```

### Exemple 3: Autocomplete Étudiant

```typescript
'use client';

import { useState, useEffect } from 'react';
import { studentService } from '@/modules/UsersGuard';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { useTenant } from '@/shared/lib/tenant-context';
import type { Student } from '@/modules/UsersGuard';

const StudentAutocomplete = ({ onSelect }: { onSelect: (student: Student | null) => void }) => {
  const { tenantId } = useTenant();
  const [options, setOptions] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (inputValue.length < 2) {
      setOptions([]);
      return;
    }

    const searchStudents = async () => {
      setLoading(true);
      try {
        const results = await studentService.searchStudents(inputValue, tenantId || undefined);
        setOptions(results);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchStudents, 300);
    return () => clearTimeout(timeoutId);
  }, [inputValue, tenantId]);

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.full_name}
      loading={loading}
      onInputChange={(_, value) => setInputValue(value)}
      onChange={(_, value) => onSelect(value)}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Rechercher un étudiant"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default StudentAutocomplete;
```

---

## Financial Roles

### Exemple 1: Liste du Personnel Financier

```typescript
'use client';

import { useCashiers, useAccountants, useAccountingClerks } from '@/modules/UsersGuard';
import { Box, Typography, Chip, CircularProgress, Grid, Paper } from '@mui/material';

const FinancialStaffPage = () => {
  const { cashiers, loading: loadingCashiers } = useCashiers();
  const { accountants, loading: loadingAccountants } = useAccountants();
  const { accountingClerks, loading: loadingClerks } = useAccountingClerks();

  const loading = loadingCashiers || loadingAccountants || loadingClerks;

  if (loading) return <CircularProgress />;

  return (
    <Grid container spacing={3}>
      {/* Caissiers */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Caissiers ({cashiers.length})
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {cashiers.map((cashier) => (
              <Chip
                key={cashier.id}
                label={cashier.full_name}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Paper>
      </Grid>

      {/* Comptables */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Comptables ({accountants.length})
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {accountants.map((accountant) => (
              <Chip
                key={accountant.id}
                label={accountant.full_name}
                color="secondary"
                variant="outlined"
              />
            ))}
          </Box>
        </Paper>
      </Grid>

      {/* Agents Comptables */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Agents Comptables ({accountingClerks.length})
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {accountingClerks.map((clerk) => (
              <Chip
                key={clerk.id}
                label={clerk.full_name}
                color="success"
                variant="outlined"
              />
            ))}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default FinancialStaffPage;
```

### Exemple 2: Sélecteur de Caissier

```typescript
'use client';

import { useCashiers } from '@/modules/UsersGuard';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import type { Cashier } from '@/modules/UsersGuard';

const CashierSelector = ({ onSelect }: { onSelect: (cashier: Cashier | null) => void }) => {
  const { cashiers, loading } = useCashiers();

  return (
    <FormControl fullWidth disabled={loading}>
      <InputLabel>Sélectionner un caissier</InputLabel>
      <Select onChange={(e) => {
        const selected = cashiers.find(c => c.id === Number(e.target.value));
        onSelect(selected || null);
      }}>
        <MenuItem value="">Aucun</MenuItem>
        {cashiers.map((cashier) => (
          <MenuItem key={cashier.id} value={cashier.id}>
            {cashier.full_name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CashierSelector;
```

---

## Permissions & Roles Management

### Exemple 1: Fiche Utilisateur avec Gestion Permissions/Rôles

```typescript
'use client';

import { useState, useEffect } from 'react';
import { userService, UserPermissionsSection, UserRolesSection } from '@/modules/UsersGuard';
import { Box, Typography, CircularProgress, Grid, Paper } from '@mui/material';
import { useTenant } from '@/shared/lib/tenant-context';
import type { User } from '@/modules/UsersGuard';

const UserProfilePage = ({ userId }: { userId: number }) => {
  const { tenantId } = useTenant();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await userService.getUserById(userId, tenantId || undefined);
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId, tenantId]);

  if (loading) return <CircularProgress />;
  if (!user) return <Typography>Utilisateur non trouvé</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {user.full_name}
      </Typography>

      <Grid container spacing={3}>
        {/* Informations de base */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Informations</Typography>
            <Typography>Email: {user.email}</Typography>
            <Typography>Username: {user.username}</Typography>
            <Typography>Statut: {user.is_active ? 'Actif' : 'Inactif'}</Typography>
          </Paper>
        </Grid>

        {/* Rôles */}
        <Grid item xs={12} md={6}>
          <UserRolesSection
            user={user}
            onUserUpdate={setUser}
          />
        </Grid>

        {/* Permissions */}
        <Grid item xs={12}>
          <UserPermissionsSection
            user={user}
            onUserUpdate={setUser}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserProfilePage;
```

### Exemple 2: Gestion Permissions en Mode Lecture Seule

```typescript
'use client';

import { UserPermissionsSection, UserRolesSection } from '@/modules/UsersGuard';
import { Box } from '@mui/material';
import type { User } from '@/modules/UsersGuard';

const UserProfileReadOnly = ({ user }: { user: User }) => {
  return (
    <Box>
      {/* Affichage en lecture seule (pas de bouton "Gérer") */}
      <UserRolesSection
        user={user}
        readOnly={true}
      />

      <UserPermissionsSection
        user={user}
        readOnly={true}
      />
    </Box>
  );
};

export default UserProfileReadOnly;
```

### Exemple 3: Gestion Manuelle des Permissions

```typescript
'use client';

import { useState } from 'react';
import { useUserPermissionsMutations } from '@/modules/UsersGuard';
import { Button, CircularProgress, Alert } from '@mui/material';

const ManualPermissionManager = ({ userId }: { userId: number }) => {
  const { addPermissions, removePermissions, loading, error } = useUserPermissionsMutations(userId);
  const [success, setSuccess] = useState(false);

  const handleAddPermission = async () => {
    try {
      await addPermissions(['view dashboard', 'view students']);
      setSuccess(true);
    } catch (err) {
      console.error('Failed to add permissions:', err);
    }
  };

  const handleRemovePermission = async () => {
    try {
      await removePermissions(['view dashboard']);
      setSuccess(true);
    } catch (err) {
      console.error('Failed to remove permissions:', err);
    }
  };

  return (
    <div>
      {error && <Alert severity="error">{error.message}</Alert>}
      {success && <Alert severity="success">Permissions mises à jour!</Alert>}

      <Button
        onClick={handleAddPermission}
        disabled={loading}
        variant="contained"
      >
        {loading ? <CircularProgress size={20} /> : 'Ajouter Permissions'}
      </Button>

      <Button
        onClick={handleRemovePermission}
        disabled={loading}
        variant="outlined"
      >
        {loading ? <CircularProgress size={20} /> : 'Retirer Permissions'}
      </Button>
    </div>
  );
};

export default ManualPermissionManager;
```

---

## 🎯 Bonnes Pratiques

### 1. Gestion des Erreurs

```typescript
const { students, loading, error } = useStudents();

if (error) {
  // Afficher un message d'erreur convivial
  return (
    <Alert severity="error">
      Impossible de charger les étudiants. Veuillez réessayer.
    </Alert>
  );
}
```

### 2. États de Chargement

```typescript
if (loading) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress />
    </Box>
  );
}
```

### 3. Gestion du Tenant

```typescript
// Le tenantId est automatiquement géré par useTenant()
const { tenantId } = useTenant();

// Passez-le aux services si nécessaire
const students = await studentService.getStudents(tenantId || undefined);
```

### 4. Optimisation des Recherches

```typescript
// Debounce pour éviter trop d'appels API
const [searchQuery, setSearchQuery] = useState('');

useEffect(() => {
  const timeoutId = setTimeout(() => {
    setSearch(searchQuery);
  }, 300); // Attendre 300ms après la dernière frappe

  return () => clearTimeout(timeoutId);
}, [searchQuery]);
```

---

## 📞 Support

Pour plus d'informations:
- Consultez `FRONTEND_IMPLEMENTATION_COMPLETE.md`
- Consultez `IMPLEMENTATION_STATUS.md`
- Contactez: James (dev agent)

---

**Date**: 2026-01-13
**Module**: UsersGuard
**Status**: Ready for Use (once backend is implemented)
