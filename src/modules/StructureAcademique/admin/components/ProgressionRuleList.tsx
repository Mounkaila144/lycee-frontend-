'use client';

import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { useProgressionRules } from '../hooks/useProgression';
import { useProgrammes } from '../hooks/useProgrammes';
import ProgressionRuleListTable from './ProgressionRuleListTable';

const ProgressionRuleList: React.FC = () => {
  const { rules, loading, createRule, updateRule, deleteRule, refresh } = useProgressionRules();
  const { programmes, loading: programmesLoading } = useProgrammes();

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              Règles de Progression Pédagogique
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Définissez les règles de passage entre niveaux selon les normes LMD
            </Typography>
          </Box>

          <ProgressionRuleListTable
            rules={rules}
            loading={loading || programmesLoading}
            programmes={programmes}
            onCreateRule={createRule}
            onUpdateRule={updateRule}
            onDeleteRule={deleteRule}
            onRefresh={refresh}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProgressionRuleList;
