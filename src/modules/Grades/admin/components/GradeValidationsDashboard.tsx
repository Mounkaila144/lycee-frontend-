'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
} from '@mui/material';
// Icons removed - using emoji alternatives
import { useRouter } from 'next/navigation';
import { useGradeValidations, useValidationStatistics } from '../hooks';
import type { GradeValidation, GradeValidationStatus } from '../../types';

interface GradeValidationsDashboardProps {
  tenantId?: string;
  academicYearId?: number;
  semesterId?: number;
}

export const GradeValidationsDashboard: React.FC<GradeValidationsDashboardProps> = ({
  tenantId,
  academicYearId,
  semesterId,
}) => {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [statusFilter, setStatusFilter] = useState<GradeValidationStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  // Build filters
  const filters = {
    status: statusFilter !== 'all' ? statusFilter : undefined,
    academic_year_id: academicYearId,
    semester_id: semesterId,
    search: search || undefined,
  };

  // Hooks
  const { data: validationsData, isLoading, refetch } = useGradeValidations(
    filters,
    page + 1,
    rowsPerPage,
    tenantId
  );

  const { data: statistics } = useValidationStatistics(
    {
      academic_year_id: academicYearId,
      semester_id: semesterId,
    },
    tenantId
  );

  const getStatusColor = (status: GradeValidationStatus) => {
    switch (status) {
      case 'Pending':
      case 'Submitted':
        return 'warning';
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      case 'Published':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: GradeValidationStatus) => {
    switch (status) {
      case 'Pending':
      case 'Submitted':
        return 'En attente';
      case 'Approved':
        return 'Validé';
      case 'Rejected':
        return 'Rejeté';
      case 'Published':
        return 'Publié';
      default:
        return status;
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      {/* Statistics Cards */}
      {statistics && (
        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2} mb={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                En attente
              </Typography>
              <Typography variant="h4">{statistics.pending_validations}</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Validés
              </Typography>
              <Typography variant="h4">{statistics.approved_validations}</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Rejetés
              </Typography>
              <Typography variant="h4">{statistics.rejected_validations}</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Publiés
              </Typography>
              <Typography variant="h4">{statistics.published_validations}</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Taux de rejet
              </Typography>
              <Typography variant="h4">{statistics.rejection_rate.toFixed(1)}%</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Avec anomalies
              </Typography>
              <Typography variant="h4">{statistics.modules_with_anomalies}</Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Filters */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              label="Rechercher"
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            <TextField
              select
              label="Statut"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as GradeValidationStatus | 'all')}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="Pending">En attente</MenuItem>
              <MenuItem value="Approved">Validé</MenuItem>
              <MenuItem value="Rejected">Rejeté</MenuItem>
              <MenuItem value="Published">Publié</MenuItem>
            </TextField>
            <Tooltip title="Actualiser">
              <IconButton onClick={() => refetch()}>
                <span>🔄</span>
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent>
          {isLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : validationsData && validationsData.data.length > 0 ? (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Module</TableCell>
                      <TableCell>Évaluation</TableCell>
                      <TableCell>Enseignant</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell align="center">Moyenne</TableCell>
                      <TableCell align="center">Taux réussite</TableCell>
                      <TableCell align="center">Anomalies</TableCell>
                      <TableCell>Date soumission</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {validationsData.data.map((validation) => (
                      <TableRow key={validation.id} hover>
                        <TableCell>{validation.module?.name || '-'}</TableCell>
                        <TableCell>{validation.evaluation?.name || 'Toutes'}</TableCell>
                        <TableCell>
                          {validation.submitted_by_user
                            ? `${validation.submitted_by_user.firstname} ${validation.submitted_by_user.lastname}`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(validation.status)}
                            color={getStatusColor(validation.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {validation.statistics?.average?.toFixed(2) || '-'}
                        </TableCell>
                        <TableCell align="center">
                          {validation.statistics?.pass_rate
                            ? `${validation.statistics.pass_rate.toFixed(1)}%`
                            : '-'}
                        </TableCell>
                        <TableCell align="center">
                          {validation.anomalies && validation.anomalies.length > 0 ? (
                            <Chip label={validation.anomalies.length} color="error" size="small" />
                          ) : (
                            <Chip label="0" color="success" size="small" />
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(validation.submitted_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" gap={0.5} justifyContent="center">
                            <Tooltip title="Voir détails">
                              <IconButton
                                size="small"
                                onClick={() => router.push(`/admin/grades/validations/${validation.id}`)}
                              >
                                <span>👁️</span>
                              </IconButton>
                            </Tooltip>
                            {validation.status === 'Pending' && (
                              <>
                                <Tooltip title="Valider">
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() =>
                                      router.push(`/admin/grades/validations/${validation.id}?action=validate`)
                                    }
                                  >
                                    <span>✅</span>
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Rejeter">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() =>
                                      router.push(`/admin/grades/validations/${validation.id}?action=reject`)
                                    }
                                  >
                                    <span>❌</span>
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            {validation.status === 'Approved' && (
                              <Tooltip title="Publier">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() =>
                                    router.push(`/admin/grades/validations/${validation.id}?action=publish`)
                                  }
                                >
                                  <span>📤</span>
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={validationsData.total}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 15, 25, 50]}
                labelRowsPerPage="Lignes par page:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
              />
            </>
          ) : (
            <Alert severity="info">Aucune validation trouvée</Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
