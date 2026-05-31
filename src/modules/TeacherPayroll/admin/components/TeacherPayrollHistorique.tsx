'use client';

import React, { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import { createApiClient } from '@/shared/lib/api-client';

const api = () => createApiClient();

function toArray<T>(resp: unknown): T[] {
  if (Array.isArray(resp)) return resp as T[];
  const r = resp as { data?: unknown };
  if (r && Array.isArray(r.data)) return r.data as T[];
  const nested = (r?.data as { data?: unknown })?.data;
  if (Array.isArray(nested)) return nested as T[];
  return [];
}

interface Action {
  id: number; action: string; entite: string | null; entite_id: number | null;
  user_id: number | null; date_action: string | null;
}

export const TeacherPayrollHistorique: React.FC = () => {
  const { data: resp, isLoading } = useQuery({
    queryKey: ['tp-historique'],
    queryFn: async () => (await api().get('/admin/teacher-payroll/historique', { params: { per_page: 100 } })).data,
  });
  const actions = useMemo(() => toArray<Action>(resp), [resp]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Historique des actions de paie</Typography>
      <Card>
        <CardContent>
          {isLoading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}
          {!isLoading && actions.length === 0 && <Alert severity="info">Aucune action enregistrée pour le moment.</Alert>}
          {!isLoading && actions.length > 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead><TableRow>
                  <TableCell>Date</TableCell><TableCell>Action</TableCell><TableCell>Entité</TableCell><TableCell>Réf.</TableCell><TableCell>Utilisateur</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {actions.map(a => (
                    <TableRow key={a.id} hover>
                      <TableCell>{a.date_action ? new Date(a.date_action).toLocaleString('fr-FR') : '—'}</TableCell>
                      <TableCell><Chip size="small" label={a.action} variant="outlined" /></TableCell>
                      <TableCell>{a.entite ?? '—'}</TableCell>
                      <TableCell>{a.entite_id ?? '—'}</TableCell>
                      <TableCell>#{a.user_id ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TeacherPayrollHistorique;
