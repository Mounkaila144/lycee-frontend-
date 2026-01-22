'use client';

import { useState, useEffect, useCallback } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';

import { useTenant } from '@/shared/lib/tenant-context';
import { studentCardService } from '../services/studentCardService';
import { studentService } from '../services/studentService';

import type { BatchGenerateCardsResult } from '../../types/studentCard.types';

interface StudentCardGenerateDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  translations: Record<string, any>;
}

interface AcademicYear {
  id: number;
  name: string;
  is_active: boolean;
}

interface StudentOption {
  id: number;
  matricule: string;
  firstname: string;
  lastname: string;
  has_card?: boolean;
}

export const StudentCardGenerateDialog = ({
  open,
  onClose,
  onSuccess,
  translations,
}: StudentCardGenerateDialogProps) => {
  const t = translations;
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | ''>('');
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<StudentOption[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [batchResult, setBatchResult] = useState<BatchGenerateCardsResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectAll, setSelectAll] = useState(false);

  // Fetch academic years
  useEffect(() => {
    const fetchYears = async () => {
      try {
        setLoading(true);

        // Use the academicCalendarService from StructureAcademique module
        const { academicCalendarService } = await import(
          '@/modules/StructureAcademique/admin/services/academicCalendarService'
        );

        // getAcademicYears returns an array directly
        const years = await academicCalendarService.getAcademicYears(tenantId);

        setAcademicYears(years || []);

        // Find the active year (is_active = true)
        const activeYear = years?.find((y: AcademicYear) => y.is_active);

        if (activeYear) setSelectedYear(activeYear.id);
      } catch (err) {
        console.error('Error fetching academic years:', err);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchYears();
    }
  }, [open, tenantId]);

  // Search students
  const searchStudents = useCallback(
    async (query: string) => {
      if (!query || query.length < 2) {
        setStudents([]);

        return;
      }

      try {
        setLoadingStudents(true);
        const response = await studentService.getStudents(tenantId, {
          search: query,
          per_page: 20,
        });

        setStudents(
          response.data.map(s => ({
            id: s.id,
            matricule: s.matricule,
            firstname: s.firstname,
            lastname: s.lastname,
          }))
        );
      } catch (err) {
        console.error('Error searching students:', err);
      } finally {
        setLoadingStudents(false);
      }
    },
    [tenantId]
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchStudents(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchStudents]);

  const handleGenerate = async () => {
    if (!selectedYear) {
      setError(t.studentCards?.selectYearRequired || 'Veuillez sélectionner une année académique');

      return;
    }

    if (selectedStudents.length === 0) {
      setError(t.studentCards?.selectStudentsRequired || 'Veuillez sélectionner au moins un étudiant');

      return;
    }

    setGenerating(true);
    setError(null);
    setBatchResult(null);

    try {
      if (mode === 'single' && selectedStudents.length === 1) {
        await studentCardService.generate(
          {
            student_id: selectedStudents[0].id,
            academic_year_id: selectedYear as number,
          },
          tenantId
        );
        onSuccess();
      } else {
        const result = await studentCardService.batchGenerate(
          {
            student_ids: selectedStudents.map(s => s.id),
            academic_year_id: selectedYear as number,
          },
          tenantId
        );

        setBatchResult(result);

        if (result.failed === 0) {
          onSuccess();
        }
      }
    } catch (err: any) {
      setError(err.message || t.studentCards?.generateError || 'Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  const handleClose = () => {
    setMode('single');
    setSelectedStudents([]);
    setSearchQuery('');
    setStudents([]);
    setBatchResult(null);
    setError(null);
    setSelectAll(false);
    onClose();
  };

  const handleSelectAllChange = async (checked: boolean) => {
    setSelectAll(checked);

    if (checked && selectedYear) {
      try {
        setLoadingStudents(true);

        // Fetch all eligible students
        const response = await studentService.getStudents(tenantId, {
          per_page: 1000,
          status: 'Active',
        });

        setSelectedStudents(
          response.data.map(s => ({
            id: s.id,
            matricule: s.matricule,
            firstname: s.firstname,
            lastname: s.lastname,
          }))
        );
      } catch (err) {
        console.error('Error fetching all students:', err);
      } finally {
        setLoadingStudents(false);
      }
    } else {
      setSelectedStudents([]);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <i className="ri-id-card-line" style={{ fontSize: 24 }} />
          <span>{t.studentCards?.generateCards || 'Générer des cartes étudiants'}</span>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : batchResult ? (
          <Box>
            <Alert severity={batchResult.failed === 0 ? 'success' : 'warning'} sx={{ mb: 2 }}>
              {batchResult.success} {t.studentCards?.cardsGenerated || 'carte(s) générée(s)'}
              {batchResult.failed > 0 && (
                <>
                  , {batchResult.failed} {t.studentCards?.cardsFailed || 'échec(s)'}
                </>
              )}
            </Alert>

            {batchResult.errors.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  {t.studentCards?.errors || 'Erreurs'}:
                </Typography>
                <List dense>
                  {batchResult.errors.map((err, index) => (
                    <ListItem key={index}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <i className="ri-error-warning-line" style={{ color: 'error.main' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={err.student_name}
                        secondary={err.error}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        ) : (
          <Stack spacing={3}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Mode Selection */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t.studentCards?.generationMode || 'Mode de génération'}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant={mode === 'single' ? 'contained' : 'outlined'}
                  onClick={() => setMode('single')}
                  startIcon={<i className="ri-user-line" />}
                >
                  {t.studentCards?.singleStudent || 'Étudiant unique'}
                </Button>
                <Button
                  variant={mode === 'batch' ? 'contained' : 'outlined'}
                  onClick={() => setMode('batch')}
                  startIcon={<i className="ri-group-line" />}
                >
                  {t.studentCards?.batchMode || 'Lot d\'étudiants'}
                </Button>
              </Stack>
            </Box>

            {/* Academic Year Selection */}
            <FormControl fullWidth>
              <InputLabel>{t.studentCards?.academicYear || 'Année académique'}</InputLabel>
              <Select
                value={selectedYear}
                label={t.studentCards?.academicYear || 'Année académique'}
                onChange={e => setSelectedYear(e.target.value as number)}
              >
                {academicYears.map(year => (
                  <MenuItem key={year.id} value={year.id}>
                    {year.name} {year.is_active && `(${t.common?.current || 'En cours'})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Student Selection */}
            {mode === 'batch' && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectAll}
                    onChange={e => handleSelectAllChange(e.target.checked)}
                  />
                }
                label={t.studentCards?.selectAllEligible || 'Sélectionner tous les étudiants éligibles'}
              />
            )}

            {!selectAll && (
              <Autocomplete
                multiple={mode === 'batch'}
                options={students}
                loading={loadingStudents}
                value={mode === 'batch' ? selectedStudents : (selectedStudents[0] || null)}
                onChange={(_, newValue) => {
                  if (Array.isArray(newValue)) {
                    setSelectedStudents(newValue);
                  } else if (newValue) {
                    setSelectedStudents([newValue]);
                  } else {
                    setSelectedStudents([]);
                  }
                }}
                onInputChange={(_, value) => setSearchQuery(value)}
                getOptionLabel={option => `${option.matricule} - ${option.firstname} ${option.lastname}`}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={params => (
                  <TextField
                    {...params}
                    label={t.studentCards?.searchStudents || 'Rechercher des étudiants'}
                    placeholder={t.studentCards?.searchPlaceholder || 'Tapez le matricule ou le nom...'}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingStudents && <CircularProgress color="inherit" size={20} />}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={`${option.matricule} - ${option.firstname} ${option.lastname}`}
                      size="small"
                    />
                  ))
                }
                noOptionsText={t.studentCards?.noStudentsFound || 'Aucun étudiant trouvé'}
              />
            )}

            {selectedStudents.length > 0 && (
              <Alert severity="info">
                {selectedStudents.length} {t.studentCards?.studentsSelected || 'étudiant(s) sélectionné(s)'}
              </Alert>
            )}

            {generating && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t.studentCards?.generatingCards || 'Génération en cours...'}
                </Typography>
                <LinearProgress />
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={generating}>
          {batchResult ? t.common?.close || 'Fermer' : t.common?.cancel || 'Annuler'}
        </Button>
        {!batchResult && (
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={generating || selectedStudents.length === 0 || !selectedYear}
            startIcon={generating ? <CircularProgress size={16} /> : <i className="ri-id-card-line" />}
          >
            {t.studentCards?.generate || 'Générer'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default StudentCardGenerateDialog;
