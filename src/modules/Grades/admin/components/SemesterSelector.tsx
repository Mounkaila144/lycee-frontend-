'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { useTranslation } from '@/shared/i18n/use-translation';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { createApiClient } from '@/shared/lib/api-client';
import { useTenant } from '@/shared/lib/tenant-context';

/**
 * Semester option from API
 */
interface SemesterOption {
  id: number;
  name: string;
  code: string;
  academic_year: {
    id: number;
    name: string;
  };
}

/**
 * Props for SemesterSelector
 */
interface SemesterSelectorProps {
  selectedSemesterId: number | null;
  onSemesterChange: (semesterId: number | null) => void;
}

/**
 * SemesterSelector Component
 * Dropdown for selecting a semester
 */
export const SemesterSelector: React.FC<SemesterSelectorProps> = ({
  selectedSemesterId,
  onSemesterChange,
}) => {
  const { t } = useTranslation('Grades');
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  const [semesters, setSemesters] = useState<SemesterOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch available semesters
   */
  const fetchSemesters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const client = createApiClient(tenantId);
      const response = await client.get<{ data: SemesterOption[] }>('/admin/semesters');

      setSemesters(response.data.data);
    } catch (err) {
      console.error('Error fetching semesters:', err);
      setError(t('semesterSelector.loadError'));
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchSemesters();
  }, [fetchSemesters]);

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <FormControl fullWidth>
      <InputLabel id="semester-selector-label">{t('semesterSelector.selectSemester')}</InputLabel>
      <Select
        labelId="semester-selector-label"
        value={selectedSemesterId ?? ''}
        onChange={(e) => onSemesterChange(e.target.value ? Number(e.target.value) : null)}
        label={t('semesterSelector.selectSemester')}
        disabled={loading}
        endAdornment={loading ? <CircularProgress size={20} sx={{ mr: 2 }} /> : null}
      >
        <MenuItem value="">
          <em>{t('semesterSelector.noSemesterSelected')}</em>
        </MenuItem>
        {semesters.map((semester) => (
          <MenuItem key={semester.id} value={semester.id}>
            {semester.name} ({semester.academic_year.name})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
