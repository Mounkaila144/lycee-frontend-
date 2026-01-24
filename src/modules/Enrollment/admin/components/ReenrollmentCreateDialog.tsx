'use client';

import { useState, useCallback, useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

import { useTenant } from '@/shared/lib/tenant-context';
import { createApiClient } from '@/shared/lib/api-client';

import { useReenrollmentCampaigns } from '../hooks/useReenrollmentCampaigns';
import { useEligibilityCheck } from '../hooks/useReenrollments';

import type { ReenrollmentCampaign, ReenrollmentFormData, EligibilityCheck } from '../../types/reenrollment.types';

// Type for autocomplete response (different from full Student type)
interface StudentAutocomplete {
  id: number;
  matricule: string;
  full_name: string;
  email: string;
  status: string;
  label: string;
}

interface ReenrollmentCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const steps = ['Sélectionner campagne', 'Sélectionner étudiant', 'Vérifier éligibilité', 'Confirmer'];

export const ReenrollmentCreateDialog = ({ open, onClose, onSuccess }: ReenrollmentCreateDialogProps) => {
  const { tenantId } = useTenant();
  const { campaigns, loading: loadingCampaigns } = useReenrollmentCampaigns({ status: 'Active', per_page: 100 });
  const { eligibility, loading: checkingEligibility, checkEligibility, clearEligibility } = useEligibilityCheck();

  // Stepper state
  const [activeStep, setActiveStep] = useState(0);

  // Form state
  const [selectedCampaign, setSelectedCampaign] = useState<ReenrollmentCampaign | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentAutocomplete | null>(null);
  const [isRedoing, setIsRedoing] = useState(false);
  const [hasAcceptedRules, setHasAcceptedRules] = useState(false);

  // Student search state
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentOptions, setStudentOptions] = useState<StudentAutocomplete[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setActiveStep(0);
      setSelectedCampaign(null);
      setSelectedStudent(null);
      setIsRedoing(false);
      setHasAcceptedRules(false);
      setStudentSearchQuery('');
      setStudentOptions([]);
      setError(null);
      clearEligibility();
    }
  }, [open, clearEligibility]);

  // Search students
  const searchStudents = useCallback(
    async (query: string) => {
      if (!query || query.length < 2) {
        setStudentOptions([]);

        return;
      }

      try {
        setLoadingStudents(true);
        const client = createApiClient(tenantId ?? undefined);
        const response = await client.get<{ data: StudentAutocomplete[] }>('/admin/enrollment/students/search/autocomplete', {
          params: { q: query, limit: 10 },
        });
        setStudentOptions(response.data.data || []);
      } catch (err) {
        console.error('Error searching students:', err);
        setStudentOptions([]);
      } finally {
        setLoadingStudents(false);
      }
    },
    [tenantId]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (studentSearchQuery) {
        searchStudents(studentSearchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [studentSearchQuery, searchStudents]);

  // Check eligibility when student and campaign are selected
  const handleCheckEligibility = useCallback(async () => {
    if (!selectedStudent || !selectedCampaign) return;

    try {
      await checkEligibility({
        student_id: selectedStudent.id,
        campaign_id: selectedCampaign.id,
      });
      setActiveStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la vérification');
    }
  }, [selectedStudent, selectedCampaign, checkEligibility]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!selectedStudent || !selectedCampaign) return;

    try {
      setSubmitting(true);
      setError(null);

      const client = createApiClient(tenantId ?? undefined);
      const formData: ReenrollmentFormData = {
        campaign_id: selectedCampaign.id,
        student_id: selectedStudent.id,
        is_redoing: isRedoing,
        has_accepted_rules: hasAcceptedRules,
      };

      await client.post('/admin/enrollment/reenrollments', formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  }, [selectedStudent, selectedCampaign, isRedoing, hasAcceptedRules, tenantId, onSuccess, onClose]);

  // Navigation handlers
  const handleNext = () => {
    if (activeStep === 2) {
      handleCheckEligibility();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return selectedCampaign !== null;
      case 1:
        return selectedStudent !== null;
      case 2:
        return true;
      case 3:
        return hasAcceptedRules;
      default:
        return false;
    }
  };

  // Render eligibility status
  const renderEligibilityCheck = (label: string, passed: boolean) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
      <Typography variant="body2">{label}</Typography>
      <Chip label={passed ? 'OK' : 'Non'} color={passed ? 'success' : 'error'} size="small" />
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Nouvelle Réinscription</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Step 1: Select Campaign */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Sélectionnez une campagne de réinscription active
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Campagne</InputLabel>
                <Select
                  value={selectedCampaign?.id || ''}
                  label="Campagne"
                  onChange={e => {
                    const campaign = campaigns.find(c => c.id === e.target.value);
                    setSelectedCampaign(campaign || null);
                  }}
                  disabled={loadingCampaigns}
                >
                  {campaigns
                    .filter(c => c.status === 'Active')
                    .map(campaign => (
                      <MenuItem key={campaign.id} value={campaign.id}>
                        <Box>
                          <Typography>{campaign.name}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {campaign.from_academic_year?.name} → {campaign.to_academic_year?.name}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              {campaigns.filter(c => c.status === 'Active').length === 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Aucune campagne active. Veuillez d&apos;abord activer une campagne.
                </Alert>
              )}
            </Box>
          )}

          {/* Step 2: Select Student */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Recherchez et sélectionnez un étudiant
              </Typography>
              <Autocomplete
                options={studentOptions}
                getOptionLabel={option => `${option.matricule} - ${option.full_name}`}
                loading={loadingStudents}
                value={selectedStudent}
                onChange={(_, newValue) => setSelectedStudent(newValue)}
                onInputChange={(_, newInputValue) => setStudentSearchQuery(newInputValue)}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="Rechercher un étudiant"
                    placeholder="Matricule, nom ou prénom..."
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingStudents ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    <Box>
                      <Typography variant="body2">
                        {option.full_name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {option.matricule} • {option.email}
                      </Typography>
                    </Box>
                  </li>
                )}
                noOptionsText="Tapez au moins 2 caractères pour rechercher"
              />
              {selectedStudent && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="subtitle2">Étudiant sélectionné:</Typography>
                  <Typography>
                    {selectedStudent.full_name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {selectedStudent.matricule} • {selectedStudent.email}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Step 3: Check Eligibility */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Vérification de l&apos;éligibilité de l&apos;étudiant
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, mb: 2 }}>
                <Typography variant="subtitle2">Récapitulatif:</Typography>
                <Typography variant="body2">
                  <strong>Campagne:</strong> {selectedCampaign?.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Étudiant:</strong> {selectedStudent?.full_name} (
                  {selectedStudent?.matricule})
                </Typography>
              </Box>
              <Alert severity="info">
                Cliquez sur &quot;Suivant&quot; pour vérifier l&apos;éligibilité de l&apos;étudiant.
              </Alert>
            </Box>
          )}

          {/* Step 4: Confirm */}
          {activeStep === 3 && (
            <Box>
              {checkingEligibility ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : eligibility ? (
                <>
                  <Alert severity={eligibility.is_eligible ? 'success' : 'warning'} sx={{ mb: 2 }}>
                    {eligibility.is_eligible
                      ? "L'étudiant est éligible pour cette campagne"
                      : "L'étudiant n'est pas éligible - vous pouvez quand même créer la demande"}
                  </Alert>

                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Résultats des vérifications:
                  </Typography>
                  <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, mb: 2 }}>
                    {renderEligibilityCheck('Statut actif', eligibility.is_active)}
                    {renderEligibilityCheck('Inscription précédente', eligibility.has_previous_enrollment)}
                    {renderEligibilityCheck(
                      `ECTS minimum (${eligibility.validated_ects}/${eligibility.required_ects})`,
                      eligibility.has_min_ects
                    )}
                    {renderEligibilityCheck('Apurement financier', eligibility.financial_clearance)}
                    {renderEligibilityCheck('Pas d\'exclusion disciplinaire', eligibility.no_disciplinary_exclusion)}
                    {renderEligibilityCheck('Programme éligible', eligibility.program_eligible)}
                    {renderEligibilityCheck('Niveau éligible', eligibility.level_eligible)}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <FormControlLabel
                    control={<Checkbox checked={isRedoing} onChange={e => setIsRedoing(e.target.checked)} />}
                    label="Redoublement (l'étudiant reste au même niveau)"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox checked={hasAcceptedRules} onChange={e => setHasAcceptedRules(e.target.checked)} />
                    }
                    label="L'étudiant accepte le règlement intérieur"
                  />
                </>
              ) : (
                <Alert severity="error">Erreur lors de la vérification de l&apos;éligibilité</Alert>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Annuler
        </Button>
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={submitting}>
            Retour
          </Button>
        )}
        {activeStep < 3 ? (
          <Button variant="contained" onClick={handleNext} disabled={!canProceed() || checkingEligibility}>
            {activeStep === 2 ? 'Vérifier' : 'Suivant'}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!canProceed() || submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            Créer la réinscription
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
