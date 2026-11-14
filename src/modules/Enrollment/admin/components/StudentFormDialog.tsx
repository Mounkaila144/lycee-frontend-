'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/shared/i18n/use-translation';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Autocomplete from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useStudentsContext } from './StudentList';
import { studentService } from '../services/studentService';
import type { Student, StudentFormData, Sex } from '../../types/student.types';
import type { Programme } from '@/modules/StructureAcademique/types/programme.types';
import { classeService } from '@/modules/StructureAcademique/admin/services/classeService';
import type { Classe } from '@/modules/StructureAcademique/types/classe.types';
import { extractErrorMessage } from '@/modules/Grades/lycee/services/lyceeGradesService';
import { studentManagementService } from '../services/studentManagementService';
import type { PortalAccountCredentials } from '../../types/studentManagement.types';
import { PortalCredentialsDialog } from './PortalCredentialsDialog';

interface StudentFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  student?: Student | null;
  isEditMode?: boolean;
}

const getSexOptions = (t: (key: string) => string): { value: Sex; label: string }[] => [
  { value: 'M', label: t('Male') },
  { value: 'F', label: t('Female') },
  { value: 'O', label: t('Other') },
];

export const StudentFormDialog = ({
  open,
  onClose,
  onSuccess,
  student,
  isEditMode = false,
}: StudentFormDialogProps) => {
  const { t } = useTranslation('Enrollment');
  const { createStudent, updateStudent, loading, programmes, loadingProgrammes } =
    useStudentsContext();
  const [error, setError] = useState<string | null>(null);
  const [selectedProgramme, setSelectedProgramme] = useState<Programme | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Options de création : inscription en classe + compte de connexion
  const [classes, setClasses] = useState<Classe[]>([]);
  const [enrollClasseId, setEnrollClasseId] = useState<number | ''>('');
  const [createAccount, setCreateAccount] = useState(false);
  const [credentials, setCredentials] = useState<PortalAccountCredentials | null>(null);
  const [credentialsTitle, setCredentialsTitle] = useState('');

  useEffect(() => {
    if (!open || isEditMode) return;

    setEnrollClasseId('');
    setCreateAccount(false);
    classeService
      .getClasses({ per_page: 200 })
      .then(setClasses)
      .catch(() => setClasses([]));
  }, [open, isEditMode]);

  /**
   * Après création : inscription en classe et/ou compte de connexion (facultatifs).
   * Un échec ici n'annule pas la création : l'action reste possible depuis la fiche élève.
   */
  const runPostCreateOptions = async (created: Student): Promise<PortalAccountCredentials | null> => {
    const failures: string[] = [];
    let accountCredentials: PortalAccountCredentials | null = null;

    if (enrollClasseId !== '') {
      try {
        await studentManagementService.enrollInClass(created.id, enrollClasseId);
      } catch (err) {
        failures.push(`inscription en classe : ${await extractErrorMessage(err, 'échec')}`);
      }
    }

    if (createAccount) {
      try {
        accountCredentials = await studentManagementService.createStudentAccount(created.id);
      } catch (err) {
        failures.push(`compte de connexion : ${await extractErrorMessage(err, 'échec')}`);
      }
    }

    if (failures.length > 0) {
      window.alert(`Élève créé, mais ${failures.join(' ; ')}. Vous pouvez réessayer depuis la fiche de l'élève.`);
    }

    return accountCredentials;
  };

  const [formData, setFormData] = useState<StudentFormData>({
    firstname: '',
    lastname: '',
    birthdate: '',
    birthplace: '',
    sex: 'M',
    phone: '',
    address: '',
    city: '',
    quarter: '',
    nationality: 'Nigérienne',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    programme_id: 0,
  });

  // Initialize form data when student changes
  useEffect(() => {
    if (student && isEditMode) {
      setFormData({
        firstname: student.firstname,
        lastname: student.lastname,
        birthdate: student.birthdate,
        birthplace: student.birthplace,
        sex: student.sex,
        phone: student.phone || '',
        address: student.address || '',
        city: student.city || '',
        quarter: student.quarter || '',
        nationality: student.nationality,
        emergency_contact_name: student.emergency_contact_name || '',
        emergency_contact_phone: student.emergency_contact_phone || '',
        programme_id: 0, // Not used in edit mode
      });

      // Don't set selected programme in edit mode (not editable)
      setSelectedProgramme(null);
    } else {
      // Reset form for add mode
      setFormData({
        firstname: '',
        lastname: '',
        birthdate: '',
        birthplace: '',
        sex: 'M',
        phone: '',
        address: '',
        city: '',
        quarter: '',
        nationality: 'Nigérienne',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        programme_id: 0,
      });
      setSelectedProgramme(null);
      setDuplicateWarning(null);
    }
    setError(null);
  }, [student, isEditMode, programmes]);

  const handleChange = (field: keyof StudentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleProgrammeChange = (programme: Programme | null) => {
    setSelectedProgramme(programme);
    if (programme) {
      setFormData(prev => ({ ...prev, programme_id: programme.id }));
    }
  };

  const validateForm = (): boolean => {
    // Required fields validation
    if (!formData.firstname.trim()) {
      setError(t('First name is required'));

      return false;
    }
    if (!formData.lastname.trim()) {
      setError(t('Last name is required'));

      return false;
    }
    if (!formData.birthdate) {
      setError(t('Birth date is required'));

      return false;
    }
    if (!formData.birthplace.trim()) {
      setError(t('Birthplace is required'));

      return false;
    }
    // Phone format validation (international format)
    const phoneRegex = /^\+\d{10,15}$/;

    if (formData.phone && !phoneRegex.test(formData.phone)) {
      setError(t('Phone must be in international format (+227...)'));

      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      let created: Student | null = null;

      if (isEditMode && student) {
        await updateStudent(student.id, formData);
      } else if (duplicateWarning) {
        // Second click after the duplicate warning: the user confirmed the creation
        created = await createStudent({ ...formData, force: true });
      } else {
        // Check for duplicates before creating
        const duplicateResult = await studentService.checkDuplicates({
          firstname: formData.firstname,
          lastname: formData.lastname,
          birthdate: formData.birthdate,
        });

        if (duplicateResult.has_duplicates && duplicateResult.potential_duplicates.length > 0) {
          setDuplicateWarning(
            t('Warning: {{count}} similar student(s) found. Do you want to continue?', { count: duplicateResult.potential_duplicates.length })
          );

          return;
        }

        created = await createStudent(formData);
      }

      if (created) {
        const accountCredentials = await runPostCreateOptions(created);

        if (accountCredentials) {
          // Le formulaire se ferme quand l'utilisateur a noté le mot de passe
          setCredentialsTitle(`Compte de connexion de l'élève ${created.firstname} ${created.lastname}`);
          setCredentials(accountCredentials);

          return;
        }
      }

      onSuccess();
      handleClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || t('An error occurred');

      setError(errorMessage);
      console.error('Error saving student:', err);
    }
  };

  const handleClose = () => {
    setFormData({
      firstname: '',
      lastname: '',
      birthdate: '',
      birthplace: '',
      sex: 'M',
      phone: '',
      address: '',
      city: '',
      quarter: '',
      nationality: 'Nigérienne',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      programme_id: 0,
    });
    setSelectedProgramme(null);
    setError(null);
    setDuplicateWarning(null);
    onClose();
  };

  const sexOptions = getSexOptions(t);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditMode ? t('Edit student') : t('Add student')}
        {isEditMode && student && (
          <Typography variant="caption" display="block" color="text.secondary">
            {t('Matricule')}: {student.matricule}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {duplicateWarning && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {duplicateWarning}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Personal Information Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {t('Personal Information')}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label={t('First name(s)')}
                value={formData.firstname}
                onChange={e => handleChange('firstname', e.target.value)}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label={t('Last name')}
                value={formData.lastname}
                onChange={e => handleChange('lastname', e.target.value)}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="date"
                label={t('Birth date')}
                value={formData.birthdate}
                onChange={e => handleChange('birthdate', e.target.value)}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label={t('Birthplace')}
                value={formData.birthplace}
                onChange={e => handleChange('birthplace', e.target.value)}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                select
                label={t('Sex')}
                value={formData.sex}
                onChange={e => handleChange('sex', e.target.value)}
                disabled={loading}
              >
                {sexOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label={t('Nationality')}
                value={formData.nationality}
                onChange={e => handleChange('nationality', e.target.value)}
                disabled={loading}
              />
            </Grid>

            {/* Contact Information Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                {t('Contact Information')}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('Phone')}
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                disabled={loading}
                helperText={t('International format: +227...')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('City')}
                value={formData.city}
                onChange={e => handleChange('city', e.target.value)}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('Quarter')}
                value={formData.quarter}
                onChange={e => handleChange('quarter', e.target.value)}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('Address')}
                value={formData.address}
                onChange={e => handleChange('address', e.target.value)}
                disabled={loading}
                multiline
                rows={2}
              />
            </Grid>

            {/* Emergency Contact Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                {t('Emergency Contact')}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('Contact name')}
                value={formData.emergency_contact_name}
                onChange={e => handleChange('emergency_contact_name', e.target.value)}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('Contact phone')}
                value={formData.emergency_contact_phone}
                onChange={e => handleChange('emergency_contact_phone', e.target.value)}
                disabled={loading}
                helperText={t('International format: +227...')}
              />
            </Grid>

            {/* Options de création */}
            {!isEditMode && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                    Après la création (facultatif)
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Inscrire dans la classe"
                    value={enrollClasseId}
                    onChange={e => setEnrollClasseId(e.target.value === '' ? '' : Number(e.target.value))}
                    disabled={loading}
                    helperText="Classes de l'année scolaire active."
                  >
                    <MenuItem value="">Ne pas inscrire maintenant</MenuItem>
                    {classes.map(classe => {
                      const count = classe.students_count ?? 0;
                      const full = Boolean(classe.max_capacity) && count >= classe.max_capacity;

                      return (
                        <MenuItem key={classe.id} value={classe.id} disabled={full}>
                          {classe.name} ({count}/{classe.max_capacity || '∞'}){full ? ' — complète' : ''}
                        </MenuItem>
                      );
                    })}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox checked={createAccount} onChange={e => setCreateAccount(e.target.checked)} disabled={loading} />
                    }
                    label="Créer le compte de connexion de l'élève"
                  />
                  <Typography variant="caption" display="block" color="text.secondary">
                    Le mot de passe généré sera affiché une seule fois.
                  </Typography>
                </Grid>
              </>
            )}

            {/* Info - matricule auto-generated */}
            {!isEditMode && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 2 }}>
                  {t('Le matricule sera généré automatiquement lors de la création.')}
                </Alert>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {t('Cancel')}
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : isEditMode ? t('Edit') : t('Create')}
        </Button>
      </DialogActions>

      <PortalCredentialsDialog
        credentials={credentials}
        title={credentialsTitle}
        onClose={() => {
          setCredentials(null);
          onSuccess();
          handleClose();
        }}
      />
    </Dialog>
  );
};
