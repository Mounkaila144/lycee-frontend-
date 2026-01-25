'use client';

import { useState, useEffect, useCallback } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid2';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';

import { useTenant } from '@/shared/lib/tenant-context';
import { academicCalendarService } from '@/modules/StructureAcademique/admin/services/academicCalendarService';
import { moduleService } from '@/modules/StructureAcademique/admin/services/moduleService';
import { studentService } from '../services/studentService';
import { exemptionService } from '../services/exemptionService';

import type { AcademicYear } from '@/modules/StructureAcademique/types/academicCalendar.types';
import type { Module as AcademicModule } from '@/modules/StructureAcademique/types/module.types';
import type { Student } from '../../types/student.types';
import type { ExemptionFormData, ExemptionType, ExemptionReasonCategory } from '../../types/exemption.types';
import { EXEMPTION_TYPE_LABELS, REASON_CATEGORY_LABELS } from '../../types/exemption.types';

interface ExemptionFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * ExemptionFormDialog Component
 * Dialog for creating a new exemption request
 */
export const ExemptionFormDialog = ({ open, onClose, onSuccess }: ExemptionFormDialogProps) => {
  const { tenantId } = useTenant();

  // Form state
  const [formData, setFormData] = useState<ExemptionFormData>({
    student_id: 0,
    module_id: 0,
    academic_year_id: 0,
    exemption_type: 'Full',
    reason_category: 'VAE',
    reason_details: '',
  });

  // Documents state
  const [documents, setDocuments] = useState<File[]>([]);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reference data
  const [students, setStudents] = useState<Student[]>([]);
  const [modules, setModules] = useState<AcademicModule[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedModule, setSelectedModule] = useState<AcademicModule | null>(null);

  // Load reference data
  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      try {
        setLoadingData(true);

        const [yearsData, modulesData] = await Promise.all([
          academicCalendarService.getAcademicYears(tenantId || undefined),
          moduleService.getModules({ per_page: 200 }, tenantId || undefined),
        ]);

        setAcademicYears(yearsData);
        setModules(modulesData.data);

        // Set default academic year to current one
        const currentYear = yearsData.find((y: AcademicYear) => y.is_current);

        if (currentYear) {
          setFormData(prev => ({ ...prev, academic_year_id: currentYear.id }));
        }
      } catch (err) {
        console.error('Failed to load reference data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [open, tenantId]);

  // Search students
  useEffect(() => {
    if (!studentSearch || studentSearch.length < 2) {
      setStudents([]);

      return;
    }

    const searchStudents = async () => {
      try {
        const response = await studentService.autocomplete(studentSearch, tenantId || undefined);
        setStudents(response);
      } catch (err) {
        console.error('Failed to search students:', err);
      }
    };

    const timeoutId = setTimeout(searchStudents, 300);

    return () => clearTimeout(timeoutId);
  }, [studentSearch, tenantId]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        student_id: 0,
        module_id: 0,
        academic_year_id: 0,
        exemption_type: 'Full',
        reason_category: 'VAE',
        reason_details: '',
      });
      setDocuments([]);
      setError(null);
      setSelectedStudent(null);
      setSelectedModule(null);
      setStudentSearch('');
    }
  }, [open]);

  // Handle field changes
  const handleChange = useCallback((field: keyof ExemptionFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Handle student selection
  const handleStudentSelect = useCallback((student: Student | null) => {
    setSelectedStudent(student);
    setFormData(prev => ({ ...prev, student_id: student?.id || 0 }));
  }, []);

  // Handle module selection
  const handleModuleSelect = useCallback((module: AcademicModule | null) => {
    setSelectedModule(module);
    setFormData(prev => ({ ...prev, module_id: module?.id || 0 }));
  }, []);

  // Handle file selection
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files) {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter(file => {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError(`Le fichier ${file.name} dépasse 5MB`);

          return false;
        }

        // Check file type
        if (file.type !== 'application/pdf') {
          setError(`Le fichier ${file.name} n'est pas un PDF`);

          return false;
        }

        return true;
      });

      // Check total size (max 10MB)
      const totalSize = [...documents, ...validFiles].reduce((acc, f) => acc + f.size, 0);

      if (totalSize > 10 * 1024 * 1024) {
        setError('La taille totale des documents ne doit pas dépasser 10MB');

        return;
      }

      setDocuments(prev => [...prev, ...validFiles]);
    }
  }, [documents]);

  // Remove document
  const handleRemoveDocument = useCallback((index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.student_id) {
      setError('Veuillez sélectionner un étudiant');

      return;
    }

    if (!formData.module_id) {
      setError('Veuillez sélectionner un module');

      return;
    }

    if (!formData.academic_year_id) {
      setError("Veuillez sélectionner l'année académique");

      return;
    }

    if (!formData.reason_details || formData.reason_details.length < 100) {
      setError('Le motif détaillé doit contenir au moins 100 caractères');

      return;
    }

    try {
      setLoading(true);
      setError(null);

      await exemptionService.create(formData, documents.length > 0 ? documents : undefined, tenantId || undefined);

      onSuccess();
      onClose();
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Erreur lors de la création';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <i className="ri-file-list-3-line" />
          <Typography variant="h6">Nouvelle demande de dispense</Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {loadingData ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ pt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Student Selection */}
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Etudiant
            </Typography>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12 }}>
                <Autocomplete
                  options={students}
                  getOptionLabel={(option) => option.label || `${option.matricule} - ${option.full_name || `${option.firstname} ${option.lastname}`}`}
                  value={selectedStudent}
                  onChange={(_, value) => handleStudentSelect(value)}
                  onInputChange={(_, value) => setStudentSearch(value)}
                  filterOptions={(x) => x}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Rechercher un étudiant"
                      placeholder="Tapez le matricule ou le nom..."
                      required
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {option.full_name || `${option.firstname} ${option.lastname}`}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {option.matricule}
                        </Typography>
                      </Box>
                    </li>
                  )}
                  noOptionsText="Aucun étudiant trouvé"
                  loading={students.length === 0 && studentSearch.length >= 2}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Module and Academic Year */}
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Module concerné
            </Typography>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  options={modules}
                  getOptionLabel={(option) => `${option.code} - ${option.name}`}
                  value={selectedModule}
                  onChange={(_, value) => handleModuleSelect(value)}
                  renderInput={(params) => (
                    <TextField {...params} label="Module" required />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {option.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {option.code} - {option.ects} ECTS
                        </Typography>
                      </Box>
                    </li>
                  )}
                  noOptionsText="Aucun module trouvé"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Année académique</InputLabel>
                  <Select
                    value={formData.academic_year_id || ''}
                    label="Année académique"
                    onChange={e => handleChange('academic_year_id', e.target.value as number)}
                  >
                    {academicYears.map(year => (
                      <MenuItem key={year.id} value={year.id}>
                        {year.name} {year.is_current && '(En cours)'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Exemption Type and Reason */}
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Type et motif de la dispense
            </Typography>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Type de dispense</InputLabel>
                  <Select
                    value={formData.exemption_type}
                    label="Type de dispense"
                    onChange={e => handleChange('exemption_type', e.target.value)}
                  >
                    {(Object.keys(EXEMPTION_TYPE_LABELS) as ExemptionType[]).map(type => (
                      <MenuItem key={type} value={type}>
                        {EXEMPTION_TYPE_LABELS[type]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Catégorie de motif</InputLabel>
                  <Select
                    value={formData.reason_category}
                    label="Catégorie de motif"
                    onChange={e => handleChange('reason_category', e.target.value)}
                  >
                    {(Object.keys(REASON_CATEGORY_LABELS) as ExemptionReasonCategory[]).map(cat => (
                      <MenuItem key={cat} value={cat}>
                        {REASON_CATEGORY_LABELS[cat]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Motif détaillé"
                  value={formData.reason_details}
                  onChange={e => handleChange('reason_details', e.target.value)}
                  placeholder="Décrivez en détail les raisons de cette demande de dispense (minimum 100 caractères)"
                  required
                  helperText={`${formData.reason_details.length}/100 caractères minimum`}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Documents */}
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Documents justificatifs (PDF, max 5MB/fichier, 10MB total)
            </Typography>
            <Box sx={{ mb: 2 }}>
              <input
                accept="application/pdf"
                style={{ display: 'none' }}
                id="exemption-documents"
                type="file"
                multiple
                onChange={handleFileChange}
              />
              <label htmlFor="exemption-documents">
                <Button variant="outlined" component="span" startIcon={<i className="ri-upload-line" />}>
                  Ajouter des documents
                </Button>
              </label>
            </Box>
            {documents.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {documents.map((doc, index) => (
                  <Chip
                    key={index}
                    label={doc.name}
                    onDelete={() => handleRemoveDocument(index)}
                    icon={<i className="ri-file-pdf-line" />}
                  />
                ))}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading || loadingData}>
          {loading ? <CircularProgress size={24} /> : 'Créer la demande'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
