'use client';

import { useState, useEffect } from 'react';

// MUI Imports
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

// Service Imports
import { studentService } from '../services/studentService';
import { administrativeEnrollmentService } from '../services/administrativeEnrollmentService';
import { programmeService } from '@/modules/StructureAcademique/admin/services/programmeService';
import { createApiClient } from '@/shared/lib/api-client';
import { useTenant } from '@/shared/lib/tenant-context';

// Type Imports
import type { AdministrativeEnrollment, AcademicLevel, CreateAdministrativeEnrollmentRequest, UpdateAdministrativeEnrollmentRequest } from '../../types/administrativeEnrollment.types';
import type { Student } from '../../types/student.types';
import type { Programme } from '@/modules/StructureAcademique/types/programme.types';

interface Semester {
  id: number;
  name: string;
  code?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  enrollment?: AdministrativeEnrollment | null;
  isEditMode?: boolean;
}

export const AdministrativeEnrollmentFormDialog = ({ open, onClose, onSuccess, enrollment, isEditMode = false }: Props) => {
  const { tenantId } = useTenant();

  // Form states
  const [studentId, setStudentId] = useState<number | null>(null);
  const [programmeId, setProgrammeId] = useState<number | null>(null);
  const [semesterId, setSemesterId] = useState<number | null>(null);
  const [level, setLevel] = useState<AcademicLevel>('L1');
  const [notes, setNotes] = useState('');
  const [autoEnrollObligatory, setAutoEnrollObligatory] = useState(true);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Options states
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentInputValue, setStudentInputValue] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loadingProgrammes, setLoadingProgrammes] = useState(false);

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loadingSemesters, setLoadingSemesters] = useState(false);

  // Load programmes on mount
  useEffect(() => {
    const loadProgrammes = async () => {
      try {
        setLoadingProgrammes(true);
        const response = await programmeService.getProgrammes(tenantId || undefined, { per_page: 100 });
        setProgrammes(response.data);
      } catch (err) {
        console.error('Failed to load programmes:', err);
      } finally {
        setLoadingProgrammes(false);
      }
    };

    if (open) {
      loadProgrammes();
    }
  }, [open, tenantId]);

  // Load semesters on mount
  useEffect(() => {
    const loadSemesters = async () => {
      try {
        setLoadingSemesters(true);
        const client = createApiClient(tenantId || undefined);
        const response = await client.get<{ data: Semester[] }>('/admin/semesters?per_page=100');
        setSemesters(response.data.data);
      } catch (err) {
        console.error('Failed to load semesters:', err);
      } finally {
        setLoadingSemesters(false);
      }
    };

    if (open) {
      loadSemesters();
    }
  }, [open, tenantId]);

  // Search students
  useEffect(() => {
    const searchStudents = async () => {
      if (!studentInputValue || studentInputValue.length < 2) {
        setStudents([]);
        return;
      }

      try {
        setLoadingStudents(true);
        const response = await studentService.autocomplete(studentInputValue, tenantId || undefined);
        setStudents(response);
      } catch (err) {
        console.error('Failed to search students:', err);
      } finally {
        setLoadingStudents(false);
      }
    };

    const debounce = setTimeout(searchStudents, 300);
    return () => clearTimeout(debounce);
  }, [studentInputValue, tenantId]);

  // Initialize form when editing
  useEffect(() => {
    if (open && isEditMode && enrollment) {
      setStudentId(enrollment.student_id);
      setProgrammeId(enrollment.programme_id);
      setSemesterId(enrollment.semester_id);
      setLevel(enrollment.level);
      setNotes(enrollment.notes || '');

      if (enrollment.student) {
        const student = enrollment.student;
        setSelectedStudent({
          id: student.id,
          matricule: student.matricule,
          firstname: student.firstname,
          lastname: student.lastname,
          full_name: student.full_name || `${student.firstname} ${student.lastname}`,
          label: student.label || `${student.matricule} - ${student.firstname} ${student.lastname}`,
        } as Student);
      }
    } else if (open && !isEditMode) {
      // Reset form for new enrollment
      setStudentId(null);
      setProgrammeId(null);
      setSemesterId(null);
      setLevel('L1');
      setNotes('');
      setAutoEnrollObligatory(true);
      setSelectedStudent(null);
      setStudentInputValue('');
    }
  }, [open, isEditMode, enrollment]);

  const handleSubmit = async () => {
    setError(null);

    if (!isEditMode) {
      if (!studentId || !programmeId || !semesterId) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }

      const data: CreateAdministrativeEnrollmentRequest = {
        student_id: studentId,
        programme_id: programmeId,
        semester_id: semesterId,
        level,
        auto_enroll_obligatory: autoEnrollObligatory,
        notes: notes || undefined,
      };

      try {
        setLoading(true);
        await administrativeEnrollmentService.create(data, tenantId || undefined);
        onSuccess();
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Erreur lors de la création');
      } finally {
        setLoading(false);
      }
    } else {
      if (!enrollment) return;

      const data: UpdateAdministrativeEnrollmentRequest = {
        level,
        notes: notes || undefined,
      };

      try {
        setLoading(true);
        await administrativeEnrollmentService.update(enrollment.id, data, tenantId || undefined);
        onSuccess();
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Erreur lors de la mise à jour');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditMode ? 'Modifier l\'inscription' : 'Nouvelle inscription administrative'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Student selection - only for new enrollment */}
          {!isEditMode && (
            <Grid size={{ xs: 12 }}>
              <Autocomplete
                options={students}
                value={selectedStudent}
                onChange={(_, newValue) => {
                  setSelectedStudent(newValue);
                  setStudentId(newValue?.id || null);
                }}
                inputValue={studentInputValue}
                onInputChange={(_, newValue) => setStudentInputValue(newValue)}
                getOptionLabel={(option) => option.label || `${option.matricule} - ${option.full_name}`}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                loading={loadingStudents}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Etudiant *"
                    placeholder="Rechercher par matricule ou nom..."
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
                noOptionsText={studentInputValue.length < 2 ? 'Tapez au moins 2 caractères' : 'Aucun étudiant trouvé'}
              />
            </Grid>
          )}

          {/* Programme */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth disabled={isEditMode}>
              <InputLabel>Programme *</InputLabel>
              <Select
                value={programmeId || ''}
                label="Programme *"
                onChange={(e) => setProgrammeId(e.target.value as number)}
              >
                {loadingProgrammes ? (
                  <MenuItem disabled>Chargement...</MenuItem>
                ) : (
                  programmes.map((prog) => (
                    <MenuItem key={prog.id} value={prog.id}>
                      {prog.libelle} ({prog.code})
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>

          {/* Semester */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth disabled={isEditMode}>
              <InputLabel>Semestre *</InputLabel>
              <Select
                value={semesterId || ''}
                label="Semestre *"
                onChange={(e) => setSemesterId(e.target.value as number)}
              >
                {loadingSemesters ? (
                  <MenuItem disabled>Chargement...</MenuItem>
                ) : (
                  semesters.map((sem) => (
                    <MenuItem key={sem.id} value={sem.id}>
                      {sem.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>

          {/* Level */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Niveau *</InputLabel>
              <Select value={level} label="Niveau *" onChange={(e) => setLevel(e.target.value as AcademicLevel)}>
                <MenuItem value="L1">Licence 1</MenuItem>
                <MenuItem value="L2">Licence 2</MenuItem>
                <MenuItem value="L3">Licence 3</MenuItem>
                <MenuItem value="M1">Master 1</MenuItem>
                <MenuItem value="M2">Master 2</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Auto-enroll obligatory modules - only for new enrollment */}
          {!isEditMode && (
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={autoEnrollObligatory}
                    onChange={(e) => setAutoEnrollObligatory(e.target.checked)}
                  />
                }
                label="Inscrire automatiquement aux modules obligatoires"
              />
            </Grid>
          )}

          {/* Notes */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes ou commentaires..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : isEditMode ? 'Mettre à jour' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
