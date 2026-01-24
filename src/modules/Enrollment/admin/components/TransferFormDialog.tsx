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
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';

import { useTenant } from '@/shared/lib/tenant-context';
import { programmeService } from '@/modules/StructureAcademique/admin/services/programmeService';
import { academicCalendarService } from '@/modules/StructureAcademique/admin/services/academicCalendarService';
import { transferService } from '../services/transferService';

import type { Programme } from '@/modules/StructureAcademique/types/programme.types';
import type { AcademicYear } from '@/modules/StructureAcademique/types/academicCalendar.types';
import type { TransferFormData } from '../../types/transfer.types';

interface TransferFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LEVELS = ['L1', 'L2', 'L3', 'M1', 'M2', 'D1', 'D2', 'D3'];

/**
 * TransferFormDialog Component
 * Dialog for creating a new transfer request
 */
export const TransferFormDialog = ({ open, onClose, onSuccess }: TransferFormDialogProps) => {
  const { tenantId } = useTenant();

  // Form state
  const [formData, setFormData] = useState<TransferFormData>({
    firstname: '',
    lastname: '',
    birthdate: '',
    email: '',
    phone: '',
    mobile: '',
    origin_institution: '',
    origin_program: '',
    origin_level: '',
    target_program_id: 0,
    target_level: '',
    academic_year_id: 0,
    transfer_reason: '',
    total_ects_claimed: 0,
  });

  // Documents state
  const [documents, setDocuments] = useState<File[]>([]);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reference data
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Load reference data
  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      try {
        setLoadingData(true);

        const [programmesResponse, yearsData] = await Promise.all([
          programmeService.getProgrammes(tenantId || undefined, { per_page: 100 }),
          academicCalendarService.getAcademicYears(tenantId || undefined),
        ]);

        setProgrammes(programmesResponse.data);
        setAcademicYears(yearsData);

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

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        firstname: '',
        lastname: '',
        birthdate: '',
        email: '',
        phone: '',
        mobile: '',
        origin_institution: '',
        origin_program: '',
        origin_level: '',
        target_program_id: 0,
        target_level: '',
        academic_year_id: 0,
        transfer_reason: '',
        total_ects_claimed: 0,
      });
      setDocuments([]);
      setError(null);
    }
  }, [open]);

  // Handle field changes
  const handleChange = useCallback((field: keyof TransferFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

      setDocuments(prev => [...prev, ...validFiles]);
    }
  }, []);

  // Remove document
  const handleRemoveDocument = useCallback((index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.firstname || !formData.lastname || !formData.email || !formData.mobile) {
      setError("Veuillez remplir les informations de l'étudiant (nom, prénom, email, mobile)");

      return;
    }

    if (!formData.origin_institution || !formData.origin_program) {
      setError("Veuillez remplir les informations d'origine");

      return;
    }

    if (!formData.target_program_id || !formData.target_level || !formData.academic_year_id) {
      setError('Veuillez sélectionner le programme et le niveau cible');

      return;
    }

    if (!formData.transfer_reason || formData.transfer_reason.length < 50) {
      setError('Le motif du transfert doit contenir au moins 50 caractères');

      return;
    }

    try {
      setLoading(true);
      setError(null);

      await transferService.create(formData, documents.length > 0 ? documents : undefined, tenantId || undefined);

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
          <i className="ri-exchange-line" />
          <Typography variant="h6">Nouvelle demande de transfert</Typography>
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

            {/* Personal Information */}
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Informations personnelles
            </Typography>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Prénom"
                  value={formData.firstname}
                  onChange={e => handleChange('firstname', e.target.value)}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Nom"
                  value={formData.lastname}
                  onChange={e => handleChange('lastname', e.target.value)}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Date de naissance"
                  type="date"
                  value={formData.birthdate}
                  onChange={e => handleChange('birthdate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={e => handleChange('email', e.target.value)}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Téléphone fixe"
                  value={formData.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Téléphone mobile"
                  value={formData.mobile}
                  onChange={e => handleChange('mobile', e.target.value)}
                  required
                  placeholder="+227..."
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Origin Information */}
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Établissement d'origine
            </Typography>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Établissement d'origine"
                  value={formData.origin_institution}
                  onChange={e => handleChange('origin_institution', e.target.value)}
                  placeholder="Ex: Université de Paris"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Programme d'origine"
                  value={formData.origin_program}
                  onChange={e => handleChange('origin_program', e.target.value)}
                  placeholder="Ex: Licence Informatique"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Niveau d'origine</InputLabel>
                  <Select
                    value={formData.origin_level}
                    label="Niveau d'origine"
                    onChange={e => handleChange('origin_level', e.target.value)}
                  >
                    {LEVELS.map(level => (
                      <MenuItem key={level} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="ECTS réclamés"
                  type="number"
                  value={formData.total_ects_claimed || ''}
                  onChange={e => handleChange('total_ects_claimed', parseInt(e.target.value) || 0)}
                  inputProps={{ min: 0, max: 300 }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Target Information */}
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Programme cible
            </Typography>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Programme cible</InputLabel>
                  <Select
                    value={formData.target_program_id || ''}
                    label="Programme cible"
                    onChange={e => handleChange('target_program_id', e.target.value as number)}
                  >
                    {programmes.map(programme => (
                      <MenuItem key={programme.id} value={programme.id}>
                        {programme.libelle}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Niveau cible</InputLabel>
                  <Select
                    value={formData.target_level}
                    label="Niveau cible"
                    onChange={e => handleChange('target_level', e.target.value)}
                  >
                    {LEVELS.map(level => (
                      <MenuItem key={level} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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

            {/* Transfer Reason */}
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Motif du transfert
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Motif du transfert"
              value={formData.transfer_reason}
              onChange={e => handleChange('transfer_reason', e.target.value)}
              placeholder="Expliquez les raisons de cette demande de transfert (minimum 50 caractères)"
              required
              helperText={`${formData.transfer_reason.length}/50 caractères minimum`}
              sx={{ mb: 3 }}
            />

            <Divider sx={{ my: 3 }} />

            {/* Documents */}
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Documents justificatifs (PDF, max 5MB)
            </Typography>
            <Box sx={{ mb: 2 }}>
              <input
                accept="application/pdf"
                style={{ display: 'none' }}
                id="transfer-documents"
                type="file"
                multiple
                onChange={handleFileChange}
              />
              <label htmlFor="transfer-documents">
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
