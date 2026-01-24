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
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';

import { useTenant } from '@/shared/lib/tenant-context';
import { createApiClient } from '@/shared/lib/api-client';

import type { ReenrollmentCampaign, ReenrollmentCampaignFormData } from '../../types/reenrollment.types';

interface ReenrollmentCampaignFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ReenrollmentCampaignFormData) => Promise<void>;
  campaign: ReenrollmentCampaign | null;
}

interface AcademicYear {
  id: number;
  name: string;
  is_current: boolean;
}

interface Programme {
  id: number;
  name: string;
  code: string;
}

const LEVELS = ['L1', 'L2', 'L3', 'M1', 'M2'];
const DOCUMENT_TYPES = [
  { value: 'photo', label: 'Photo d\'identité' },
  { value: 'attestation', label: 'Attestation de réussite' },
  { value: 'certificat_scolarite', label: 'Certificat de scolarité' },
  { value: 'quittance', label: 'Quittance de paiement' },
];

/**
 * ReenrollmentCampaignFormDialog Component
 * Dialog for creating and editing reenrollment campaigns
 */
export const ReenrollmentCampaignFormDialog = ({
  open,
  onClose,
  onSave,
  campaign,
}: ReenrollmentCampaignFormDialogProps) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);

  // Form state
  const [formData, setFormData] = useState<ReenrollmentCampaignFormData>({
    name: '',
    from_academic_year_id: 0,
    to_academic_year_id: 0,
    start_date: '',
    end_date: '',
    eligible_programs: [],
    eligible_levels: [],
    required_documents: [],
    fees_config: {},
    min_ects_required: 24,
    check_financial_clearance: false,
    description: '',
  });

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch academic years and programmes
  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      setLoading(true);

      try {
        const client = createApiClient(tenantId);

        // Fetch academic years
        const yearsResponse = await client.get<{ data: AcademicYear[] }>('/admin/academic-years');
        setAcademicYears(yearsResponse.data.data || []);

        // Fetch programmes
        const progsResponse = await client.get<{ data: Programme[] }>('/admin/programmes');
        setProgrammes(progsResponse.data.data || []);
      } catch (err) {
        console.error('Error fetching form data:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, tenantId]);

  // Initialize form data when campaign changes
  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name,
        from_academic_year_id: campaign.from_academic_year_id,
        to_academic_year_id: campaign.to_academic_year_id,
        start_date: campaign.start_date?.split('T')[0] || '',
        end_date: campaign.end_date?.split('T')[0] || '',
        eligible_programs: campaign.eligible_programs || [],
        eligible_levels: campaign.eligible_levels || [],
        required_documents: campaign.required_documents || [],
        fees_config: campaign.fees_config || {},
        min_ects_required: campaign.min_ects_required,
        check_financial_clearance: campaign.check_financial_clearance,
        description: campaign.description || '',
      });
    } else {
      setFormData({
        name: '',
        from_academic_year_id: 0,
        to_academic_year_id: 0,
        start_date: '',
        end_date: '',
        eligible_programs: [],
        eligible_levels: [],
        required_documents: [],
        fees_config: {},
        min_ects_required: 24,
        check_financial_clearance: false,
        description: '',
      });
    }

    setErrors({});
    setError(null);
  }, [campaign, open]);

  const handleChange = useCallback((field: keyof ReenrollmentCampaignFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est obligatoire';
    }

    if (!formData.from_academic_year_id) {
      newErrors.from_academic_year_id = 'L\'année source est obligatoire';
    }

    if (!formData.to_academic_year_id) {
      newErrors.to_academic_year_id = 'L\'année cible est obligatoire';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'La date de début est obligatoire';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'La date de fin est obligatoire';
    }

    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = 'La date de fin doit être après la date de début';
    }

    if (formData.min_ects_required < 0 || formData.min_ects_required > 60) {
      newErrors.min_ects_required = 'Le minimum ECTS doit être entre 0 et 60';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    setSubmitting(true);
    setError(null);

    try {
      await onSave(formData);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  }, [formData, validate, onSave]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{campaign ? 'Modifier la Campagne' : 'Nouvelle Campagne de Réinscription'}</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mt: 0 }}>
            {error && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}

            {/* Basic Info */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Nom de la campagne"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                placeholder="Ex: Réinscription 2025-2026"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth error={!!errors.from_academic_year_id}>
                <InputLabel>Année académique source</InputLabel>
                <Select
                  value={formData.from_academic_year_id || ''}
                  label="Année académique source"
                  onChange={e => handleChange('from_academic_year_id', Number(e.target.value))}
                >
                  {academicYears.map(year => (
                    <MenuItem key={year.id} value={year.id}>
                      {year.name} {year.is_current && '(En cours)'}
                    </MenuItem>
                  ))}
                </Select>
                {errors.from_academic_year_id && (
                  <Box component="span" sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                    {errors.from_academic_year_id}
                  </Box>
                )}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth error={!!errors.to_academic_year_id}>
                <InputLabel>Année académique cible</InputLabel>
                <Select
                  value={formData.to_academic_year_id || ''}
                  label="Année académique cible"
                  onChange={e => handleChange('to_academic_year_id', Number(e.target.value))}
                >
                  {academicYears.map(year => (
                    <MenuItem key={year.id} value={year.id}>
                      {year.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.to_academic_year_id && (
                  <Box component="span" sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                    {errors.to_academic_year_id}
                  </Box>
                )}
              </FormControl>
            </Grid>

            {/* Dates */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Date de début"
                value={formData.start_date}
                onChange={e => handleChange('start_date', e.target.value)}
                error={!!errors.start_date}
                helperText={errors.start_date}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Date de fin"
                value={formData.end_date}
                onChange={e => handleChange('end_date', e.target.value)}
                error={!!errors.end_date}
                helperText={errors.end_date}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Eligibility Criteria */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Programmes éligibles</InputLabel>
                <Select
                  multiple
                  value={formData.eligible_programs || []}
                  onChange={e => handleChange('eligible_programs', e.target.value)}
                  input={<OutlinedInput label="Programmes éligibles" />}
                  renderValue={selected =>
                    (selected as number[]).map(id => programmes.find(p => p.id === id)?.name).join(', ')
                  }
                >
                  {programmes.map(prog => (
                    <MenuItem key={prog.id} value={prog.id}>
                      {prog.code} - {prog.name}
                    </MenuItem>
                  ))}
                </Select>
                <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.75rem', mt: 0.5 }}>
                  Laisser vide pour tous les programmes
                </Box>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Niveaux éligibles</InputLabel>
                <Select
                  multiple
                  value={formData.eligible_levels || []}
                  onChange={e => handleChange('eligible_levels', e.target.value)}
                  input={<OutlinedInput label="Niveaux éligibles" />}
                  renderValue={selected => (selected as string[]).join(', ')}
                >
                  {LEVELS.map(level => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
                <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.75rem', mt: 0.5 }}>
                  Laisser vide pour tous les niveaux
                </Box>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="ECTS minimum requis"
                value={formData.min_ects_required}
                onChange={e => handleChange('min_ects_required', Number(e.target.value))}
                error={!!errors.min_ects_required}
                helperText={errors.min_ects_required || 'Nombre de crédits ECTS validés minimum'}
                InputProps={{
                  inputProps: { min: 0, max: 60 },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.check_financial_clearance}
                    onChange={e => handleChange('check_financial_clearance', e.target.checked)}
                  />
                }
                label="Vérifier l'apurement financier"
              />
            </Grid>

            {/* Documents */}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Documents requis</InputLabel>
                <Select
                  multiple
                  value={formData.required_documents || []}
                  onChange={e => handleChange('required_documents', e.target.value)}
                  input={<OutlinedInput label="Documents requis" />}
                  renderValue={selected => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map(value => (
                        <Chip
                          key={value}
                          label={DOCUMENT_TYPES.find(d => d.value === value)?.label || value}
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                >
                  {DOCUMENT_TYPES.map(doc => (
                    <MenuItem key={doc.value} value={doc.value}>
                      {doc.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Description */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description || ''}
                onChange={e => handleChange('description', e.target.value)}
                placeholder="Description optionnelle de la campagne..."
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || submitting}
          startIcon={submitting ? <CircularProgress size={16} /> : null}
        >
          {campaign ? 'Modifier' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
