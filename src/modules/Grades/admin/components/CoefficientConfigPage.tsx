'use client';

import React, { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';

import { SemesterSelector } from './SemesterSelector';
import { ModuleSelector, type ModuleOption } from './ModuleSelector';
import { ModuleCoefficientConfig } from './ModuleCoefficientConfig';

/**
 * CoefficientConfigPage Component
 * Main page for coefficient configuration with semester and module selection
 */
export const CoefficientConfigPage: React.FC = () => {
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [selectedModuleData, setSelectedModuleData] = useState<ModuleOption | null>(null);

  const handleModuleChange = useCallback((moduleId: number | null, moduleData: ModuleOption | null) => {
    setSelectedModuleId(moduleId);
    setSelectedModuleData(moduleData);
  }, []);

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link href="/admin" underline="hover" color="inherit">
            Administration
          </Link>
          <Link href="/admin/grades" underline="hover" color="inherit">
            Notes & Évaluations
          </Link>
          <Typography color="text.primary">Configuration des coefficients</Typography>
        </Breadcrumbs>

        <Typography variant="h4" gutterBottom>
          Configuration des coefficients
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gérez les coefficients des évaluations et les crédits ECTS pour chaque module.
        </Typography>
      </Box>

      {/* Selectors */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            <i className="ri-filter-line" style={{ marginRight: 8 }} />
            Sélection
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <SemesterSelector
                selectedSemesterId={selectedSemesterId}
                onSemesterChange={setSelectedSemesterId}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ModuleSelector
                selectedModuleId={selectedModuleId}
                semesterId={selectedSemesterId}
                onModuleChange={handleModuleChange}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Module configuration */}
      <ModuleCoefficientConfig
        moduleId={selectedModuleId}
        semesterId={selectedSemesterId}
        moduleData={selectedModuleData}
      />
    </Box>
  );
};
