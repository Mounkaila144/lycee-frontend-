'use client';

import { useState, useEffect } from 'react';
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
import { useStudentsContext } from './StudentList';
import { studentService } from '../services/studentService';
import type { Student, StudentFormData, Sex } from '../../types/student.types';
import type { Programme } from '@/modules/StructureAcademique/types/programme.types';

interface StudentFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  student?: Student | null;
  isEditMode?: boolean;
}

const sexOptions: { value: Sex; label: string }[] = [
  { value: 'M', label: 'Masculin' },
  { value: 'F', label: 'Féminin' },
  { value: 'O', label: 'Autre' },
];

export const StudentFormDialog = ({
  open,
  onClose,
  onSuccess,
  student,
  isEditMode = false,
}: StudentFormDialogProps) => {
  const { createStudent, updateStudent, loading, programmes, loadingProgrammes } =
    useStudentsContext();
  const [error, setError] = useState<string | null>(null);
  const [selectedProgramme, setSelectedProgramme] = useState<Programme | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const [formData, setFormData] = useState<StudentFormData>({
    firstname: '',
    lastname: '',
    birthdate: '',
    birthplace: '',
    sex: 'M',
    email: '',
    phone: '',
    mobile: '',
    address: '',
    city: '',
    country: 'Niger',
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
        email: student.email,
        phone: student.phone || '',
        mobile: student.mobile,
        address: student.address || '',
        city: student.city || '',
        country: student.country,
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
        email: '',
        phone: '',
        mobile: '',
        address: '',
        city: '',
        country: 'Niger',
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
      setError('Le prénom est obligatoire');

      return false;
    }
    if (!formData.lastname.trim()) {
      setError('Le nom est obligatoire');

      return false;
    }
    if (!formData.birthdate) {
      setError('La date de naissance est obligatoire');

      return false;
    }
    if (!formData.birthplace.trim()) {
      setError('Le lieu de naissance est obligatoire');

      return false;
    }
    if (!formData.email.trim()) {
      setError("L'email est obligatoire");

      return false;
    }
    if (!formData.mobile.trim()) {
      setError('Le téléphone mobile est obligatoire');

      return false;
    }
    
    // Programme is only required for creation (to generate matricule)
    if (!isEditMode && !formData.programme_id) {
      setError('Le programme est obligatoire pour générer le matricule');

      return false;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      setError("Format d'email invalide");

      return false;
    }

    // Phone format validation (international format)
    const phoneRegex = /^\+\d{10,15}$/;

    if (formData.mobile && !phoneRegex.test(formData.mobile)) {
      setError('Le mobile doit être au format international (+227...)');

      return false;
    }

    if (formData.phone && !phoneRegex.test(formData.phone)) {
      setError('Le téléphone doit être au format international (+227...)');

      return false;
    }

    // Age validation (15-60 years)
    const birthDate = new Date(formData.birthdate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      // Adjust age if birthday hasn't occurred this year
    }

    if (age < 15 || age > 60) {
      setError("L'étudiant doit avoir entre 15 et 60 ans");

      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setError(null);
    setDuplicateWarning(null);

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditMode && student) {
        await updateStudent(student.id, formData);
      } else {
        // Check for duplicates before creating
        const duplicateResult = await studentService.checkDuplicates({
          firstname: formData.firstname,
          lastname: formData.lastname,
          birthdate: formData.birthdate,
        });

        if (duplicateResult.has_duplicates && duplicateResult.potential_duplicates.length > 0) {
          setDuplicateWarning(
            `Attention: ${duplicateResult.potential_duplicates.length} étudiant(s) similaire(s) trouvé(s). Voulez-vous continuer ?`
          );

          return;
        }

        await createStudent(formData);
      }

      onSuccess();
      handleClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Une erreur est survenue';

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
      email: '',
      phone: '',
      mobile: '',
      address: '',
      city: '',
      country: 'Niger',
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditMode ? 'Modifier un étudiant' : 'Ajouter un étudiant'}
        {isEditMode && student && (
          <Typography variant="caption" display="block" color="text.secondary">
            Matricule: {student.matricule}
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
                Informations Personnelles
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Prénom(s)"
                value={formData.firstname}
                onChange={e => handleChange('firstname', e.target.value)}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Nom"
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
                label="Date de naissance"
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
                label="Lieu de naissance"
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
                label="Sexe"
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
                label="Nationalité"
                value={formData.nationality}
                onChange={e => handleChange('nationality', e.target.value)}
                disabled={loading}
              />
            </Grid>

            {/* Contact Information Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                Coordonnées
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="email"
                label="Email"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                disabled={loading}
                helperText="Format: email@example.com"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Téléphone Mobile"
                value={formData.mobile}
                onChange={e => handleChange('mobile', e.target.value)}
                disabled={loading}
                helperText="Format international: +227..."
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Téléphone Fixe"
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                disabled={loading}
                helperText="Format international: +227..."
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ville"
                value={formData.city}
                onChange={e => handleChange('city', e.target.value)}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresse"
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
                Contact d'Urgence
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom du contact"
                value={formData.emergency_contact_name}
                onChange={e => handleChange('emergency_contact_name', e.target.value)}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Téléphone du contact"
                value={formData.emergency_contact_phone}
                onChange={e => handleChange('emergency_contact_phone', e.target.value)}
                disabled={loading}
                helperText="Format international: +227..."
              />
            </Grid>

            {/* Academic Information Section - Only for creation */}
            {!isEditMode && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                    Informations Académiques
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Le programme sert uniquement à générer le matricule (ex: 2026-INF-001).
                    L'inscription pédagogique sera effectuée séparément.
                  </Alert>
                </Grid>

                <Grid item xs={12}>
                  <Autocomplete
                    options={programmes}
                    getOptionLabel={option => `${option.code} - ${option.libelle}`}
                    value={selectedProgramme}
                    onChange={(_, newValue) => handleProgrammeChange(newValue)}
                    disabled={loading || loadingProgrammes}
                    loading={loadingProgrammes}
                    renderInput={params => (
                      <TextField
                        {...params}
                        required
                        label="Programme (pour génération matricule)"
                        helperText="Utilisé pour générer le matricule au format ANNÉE-CODE-NUMÉRO"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingProgrammes ? <CircularProgress size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : isEditMode ? 'Modifier' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
