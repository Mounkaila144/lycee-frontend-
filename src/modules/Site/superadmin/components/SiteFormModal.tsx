'use client';

import { useState, useEffect } from 'react';

// MUI Imports
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid2';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Chip from '@mui/material/Chip';

import { Site, CreateSiteData, UpdateSiteData } from '../../types/site.types';

interface SiteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSiteData | UpdateSiteData) => Promise<void>;
  site?: Site | null;
  mode: 'create' | 'edit';
}

export default function SiteFormModal({ isOpen, onClose, onSubmit, site, mode }: SiteFormModalProps) {
  const [formData, setFormData] = useState<any>({
    id: '',
    company_name: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    is_active: true,
    domains: [{ domain: '' }],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && site) {
      setFormData({
        company_name: site.company_name || '',
        company_email: site.company_email || '',
        company_phone: site.company_phone || '',
        company_address: site.company_address || '',
        is_active: site.is_active,
        domains: site.domains.map(d => ({ domain: d.domain })),
      });
    } else if (mode === 'create') {
      setFormData({
        id: '',
        company_name: '',
        company_email: '',
        company_phone: '',
        company_address: '',
        is_active: true,
        domains: [{ domain: '' }],
      });
    }
  }, [mode, site, isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDomainChange = (index: number, value: string) => {
    setFormData((prev: any) => {
      const newDomains = [...prev.domains];
      newDomains[index] = { domain: value };
      return { ...prev, domains: newDomains };
    });
  };

  const addDomain = () => {
    setFormData((prev: any) => ({
      ...prev,
      domains: [...prev.domains, { domain: '' }],
    }));
  };

  const removeDomain = (index: number) => {
    if (formData.domains.length > 1) {
      setFormData((prev: any) => ({
        ...prev,
        domains: prev.domains.filter((_: any, i: number) => i !== index),
      }));
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const submitData: any = { ...formData };

      // Filtrer les domaines vides
      submitData.domains = submitData.domains.filter((d: any) => d.domain.trim() !== '');

      if (submitData.domains.length === 0) {
        setError('Au moins un domaine est requis');
        setIsSubmitting(false);
        return;
      }

      // Nettoyer les champs vides
      if (!submitData.company_email) delete submitData.company_email;
      if (!submitData.company_phone) delete submitData.company_phone;
      if (!submitData.company_address) delete submitData.company_address;

      await onSubmit(submitData);
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const isFormValid = () => {
    if (mode === 'create') {
      return (
        formData.id.trim() !== '' &&
        formData.company_name.trim() !== '' &&
        formData.domains.some((d: any) => d.domain.trim() !== '')
      );
    }
    return (
      formData.company_name.trim() !== '' &&
      formData.domains.some((d: any) => d.domain.trim() !== '')
    );
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle className="flex items-center justify-between">
        <div>
          <Typography variant="h5">
            {mode === 'create' ? 'Créer un nouveau tenant' : 'Modifier le tenant'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {mode === 'create'
              ? 'Remplissez les informations pour créer un nouveau tenant'
              : 'Modifiez les informations du tenant'}
          </Typography>
        </div>
        <IconButton onClick={handleClose} size="small">
          <i className="ri-close-line" />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <div className="space-y-4 pt-2">
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Basic Information */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<i className="ri-arrow-down-s-line" />}>
              <Typography variant="h6">Informations générales</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                {/* ID (uniquement en création) */}
                {mode === 'create' && (
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      required
                      label="Identifiant du tenant"
                      value={formData.id}
                      onChange={(e) => handleChange('id', e.target.value)}
                      helperText="Identifiant unique (lettres, chiffres, tirets et underscores uniquement)"
                      inputProps={{
                        pattern: '[a-zA-Z0-9_-]+',
                      }}
                    />
                  </Grid>
                )}

                {/* Nom de la société */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    required
                    label="Nom de la société"
                    value={formData.company_name}
                    onChange={(e) => handleChange('company_name', e.target.value)}
                    helperText="Champ requis"
                  />
                </Grid>

                {/* Email */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="email"
                    label="Email de la société"
                    value={formData.company_email}
                    onChange={(e) => handleChange('company_email', e.target.value)}
                  />
                </Grid>

                {/* Téléphone */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Téléphone"
                    value={formData.company_phone}
                    onChange={(e) => handleChange('company_phone', e.target.value)}
                  />
                </Grid>

                {/* Adresse */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Adresse"
                    value={formData.company_address}
                    onChange={(e) => handleChange('company_address', e.target.value)}
                  />
                </Grid>

                {/* Statut */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Statut</InputLabel>
                    <Select
                      value={formData.is_active ? 'true' : 'false'}
                      label="Statut"
                      onChange={(e) => handleChange('is_active', e.target.value === 'true')}
                    >
                      <MenuItem value="true">Actif</MenuItem>
                      <MenuItem value="false">Inactif</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Domaines */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<i className="ri-arrow-down-s-line" />}>
              <Typography variant="h6">
                Domaines ({formData.domains.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div className="space-y-3">
                <Typography variant="body2" color="text.secondary">
                  Le premier domaine sera automatiquement défini comme domaine principal
                </Typography>

                {formData.domains.map((domain: any, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <TextField
                      fullWidth
                      required
                      label={index === 0 ? 'Domaine principal' : `Domaine ${index + 1}`}
                      value={domain.domain}
                      onChange={(e) => handleDomainChange(index, e.target.value)}
                      placeholder={index === 0 ? 'company.localhost' : 'www.company.localhost'}
                      InputProps={{
                        startAdornment: index === 0 && (
                          <Chip
                            label="Principal"
                            size="small"
                            color="primary"
                            className="mr-2"
                          />
                        ),
                      }}
                    />
                    {formData.domains.length > 1 && (
                      <IconButton
                        onClick={() => removeDomain(index)}
                        color="error"
                        size="small"
                        title="Supprimer ce domaine"
                      >
                        <i className="ri-delete-bin-line" />
                      </IconButton>
                    )}
                  </div>
                ))}

                <Button
                  variant="outlined"
                  startIcon={<i className="ri-add-line" />}
                  onClick={addDomain}
                  fullWidth
                >
                  Ajouter un domaine
                </Button>
              </div>
            </AccordionDetails>
          </Accordion>
        </div>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={handleClose} variant="outlined" color="secondary" disabled={isSubmitting}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isSubmitting || !isFormValid()}
          startIcon={
            isSubmitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <i className={mode === 'create' ? 'ri-add-line' : 'ri-save-line'} />
            )
          }
        >
          {isSubmitting ? 'Enregistrement...' : mode === 'create' ? 'Créer' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
