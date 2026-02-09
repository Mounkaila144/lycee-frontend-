'use client';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import type { CompensationRules } from '../../types/compensation.types';

interface CompensationRulesFormProps {
  rules: CompensationRules | null;
  loading: boolean;
  onSave: (rules: Partial<CompensationRules>) => Promise<boolean>;
}

export const CompensationRulesForm: React.FC<CompensationRulesFormProps> = ({
  rules,
  loading,
  onSave,
}) => {
  const [form, setForm] = useState<Partial<CompensationRules>>({
    enabled: false,
    min_semester_average: 10,
    min_compensable_grade: 7,
    max_compensated_modules: 2,
    allow_professional: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (rules) {
      setForm({
        enabled: rules.enabled,
        min_semester_average: rules.min_semester_average,
        min_compensable_grade: rules.min_compensable_grade,
        max_compensated_modules: rules.max_compensated_modules,
        allow_professional: rules.allow_professional,
      });
    }
  }, [rules]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <FormControlLabel
        control={
          <Switch
            checked={form.enabled || false}
            onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
          />
        }
        label={
          <Typography fontWeight={500}>
            Activer la compensation
          </Typography>
        }
        sx={{ mb: 3 }}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Moyenne semestrielle minimum"
            type="number"
            fullWidth
            size="small"
            value={form.min_semester_average ?? 10}
            onChange={(e) => setForm({ ...form, min_semester_average: parseFloat(e.target.value) })}
            inputProps={{ min: 0, max: 20, step: 0.5 }}
            helperText="Moyenne semestrielle requise pour bénéficier de la compensation"
            disabled={!form.enabled}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Note minimum compensable"
            type="number"
            fullWidth
            size="small"
            value={form.min_compensable_grade ?? 7}
            onChange={(e) => setForm({ ...form, min_compensable_grade: parseFloat(e.target.value) })}
            inputProps={{ min: 0, max: 20, step: 0.5 }}
            helperText="Note minimum d'un module pour être compensable"
            disabled={!form.enabled}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Max modules compensés"
            type="number"
            fullWidth
            size="small"
            value={form.max_compensated_modules ?? 2}
            onChange={(e) => setForm({ ...form, max_compensated_modules: parseInt(e.target.value) })}
            inputProps={{ min: 1, max: 10 }}
            helperText="Nombre maximum de modules pouvant être compensés"
            disabled={!form.enabled}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={form.allow_professional || false}
                onChange={(e) => setForm({ ...form, allow_professional: e.target.checked })}
                disabled={!form.enabled}
              />
            }
            label="Autoriser modules professionnels"
            sx={{ mt: 1 }}
          />
        </Grid>
      </Grid>

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} /> : <i className="ri-save-line" />}
        >
          {saving ? 'Enregistrement...' : 'Enregistrer les règles'}
        </Button>
      </Box>
    </Box>
  );
};
