'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Skeleton from '@mui/material/Skeleton';
import LinearProgress from '@mui/material/LinearProgress';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';
import Avatar from '@mui/material/Avatar';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from '@/libs/Recharts';

import { SemesterSelector } from './SemesterSelector';
import { useRanking } from '../hooks/useRanking';

import type { RankedStudent, MentionDistribution } from '../../types/ranking.types';

const MENTION_COLORS: Record<string, string> = {
  'Très Bien': '#ffd700',
  'Bien': '#c0c0c0',
  'Assez Bien': '#cd7f32',
  'Passable': '#2196f3',
  'Ajourné': '#9e9e9e',
};

const MEDAL_EMOJIS = ['🥇', '🥈', '🥉'];

const getMentionChipColor = (mention: string): 'warning' | 'default' | 'info' | 'success' | 'error' => {
  switch (mention) {
    case 'Très Bien': return 'warning';
    case 'Bien': return 'default';
    case 'Assez Bien': return 'info';
    case 'Passable': return 'success';
    case 'Ajourné': return 'error';
    default: return 'default';
  }
};

export const RankingDashboard: React.FC = () => {
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const {
    ranking,
    mentionDistribution,
    loading,
    calculating,
    generatingPalmares,
    exporting,
    calculateRanking,
    generatePalmares,
    exportExcel,
  } = useRanking(selectedSemesterId);

  const filteredRanking = ranking.filter(student =>
    !searchQuery ||
    student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.matricule.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedRanking = filteredRanking.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const top3 = ranking.slice(0, 3);

  const mentionChartData = mentionDistribution.map(m => ({
    name: m.mention,
    value: m.count,
    percentage: m.percentage,
  }));

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/admin" underline="hover" color="inherit">Admin</Link>
        <Link href="/admin/grades" underline="hover" color="inherit">Notes</Link>
        <Typography color="text.primary">Classement de la Promotion</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Classement de la Promotion
        </Typography>
        <ButtonGroup size="small">
          <Button
            variant="outlined"
            onClick={calculateRanking}
            disabled={!selectedSemesterId || calculating}
          >
            {calculating ? 'Calcul...' : 'Calculer Classement'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => generatePalmares(10)}
            disabled={!selectedSemesterId || generatingPalmares || ranking.length === 0}
          >
            {generatingPalmares ? 'Génération...' : 'Palmarès PDF'}
          </Button>
          <Button
            variant="outlined"
            onClick={exportExcel}
            disabled={!selectedSemesterId || exporting || ranking.length === 0}
          >
            {exporting ? 'Export...' : 'Export Excel'}
          </Button>
        </ButtonGroup>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <SemesterSelector
                selectedSemesterId={selectedSemesterId}
                onSemesterChange={(id) => {
                  setSelectedSemesterId(id);
                  setPage(0);
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Rechercher un étudiant..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">🔍</InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {!selectedSemesterId && !loading && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary">
              Sélectionnez un semestre pour afficher le classement
            </Typography>
          </CardContent>
        </Card>
      )}

      {selectedSemesterId && !loading && (
        <>
          {/* Top 3 Podium */}
          {top3.length > 0 && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {top3.map((student, index) => (
                <Grid item xs={12} md={4} key={student.student_id}>
                  <Card
                    sx={{
                      background: index === 0
                        ? 'linear-gradient(135deg, #ffd700 0%, #ffecb3 100%)'
                        : index === 1
                          ? 'linear-gradient(135deg, #c0c0c0 0%, #e0e0e0 100%)'
                          : 'linear-gradient(135deg, #cd7f32 0%, #ffe0b2 100%)',
                      textAlign: 'center',
                    }}
                  >
                    <CardContent>
                      <Typography variant="h2" sx={{ mb: 1 }}>
                        {MEDAL_EMOJIS[index]}
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {student.full_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {student.matricule}
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                        {student.average}/20
                      </Typography>
                      <Chip
                        label={student.mention}
                        size="small"
                        sx={{ mt: 1 }}
                        color={getMentionChipColor(student.mention)}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Grid container spacing={3}>
            {/* Mention Distribution Chart */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Répartition des Mentions
                  </Typography>
                  {mentionChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={mentionChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percentage }) => `${name}: ${percentage}%`}
                        >
                          {mentionChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={MENTION_COLORS[entry.name] || '#9e9e9e'}
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
                      <Typography color="text.secondary">Aucune donnée</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Mention Statistics */}
            <Grid item xs={12} md={8}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Statistiques des Mentions
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Mention</TableCell>
                        <TableCell align="center">Nombre</TableCell>
                        <TableCell align="center">Pourcentage</TableCell>
                        <TableCell>Barre</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mentionDistribution.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <Typography color="text.secondary" sx={{ py: 2 }}>
                              Aucune donnée disponible
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        mentionDistribution.map((m) => (
                          <TableRow key={m.mention}>
                            <TableCell>
                              <Chip
                                label={m.mention}
                                size="small"
                                color={getMentionChipColor(m.mention)}
                              />
                            </TableCell>
                            <TableCell align="center">{m.count}</TableCell>
                            <TableCell align="center">{m.percentage}%</TableCell>
                            <TableCell sx={{ width: '40%' }}>
                              <LinearProgress
                                variant="determinate"
                                value={m.percentage}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: MENTION_COLORS[m.mention] || '#9e9e9e',
                                  },
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>

            {/* Ranking Table */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Classement Complet ({filteredRanking.length} étudiants)
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell align="center" sx={{ width: 80 }}>Rang</TableCell>
                          <TableCell>Nom Complet</TableCell>
                          <TableCell>Matricule</TableCell>
                          <TableCell align="center">Moyenne</TableCell>
                          <TableCell align="center">ECTS</TableCell>
                          <TableCell align="center">Mention</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {loading ? (
                          Array.from({ length: 10 }).map((_, i) => (
                            <TableRow key={i}>
                              {Array.from({ length: 6 }).map((_, j) => (
                                <TableCell key={j}><Skeleton /></TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : paginatedRanking.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              <Typography color="text.secondary" sx={{ py: 3 }}>
                                {searchQuery ? 'Aucun résultat trouvé' : 'Aucun classement disponible'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedRanking.map((student: RankedStudent) => (
                            <TableRow
                              key={student.student_id}
                              hover
                              sx={{
                                backgroundColor: student.rank <= 3
                                  ? `${MENTION_COLORS[student.mention] || '#fff'}10`
                                  : undefined,
                              }}
                            >
                              <TableCell align="center">
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                  {student.rank <= 3 && (
                                    <Typography variant="body1">
                                      {MEDAL_EMOJIS[student.rank - 1]}
                                    </Typography>
                                  )}
                                  <Typography fontWeight={student.rank <= 3 ? 'bold' : 'normal'}>
                                    {student.rank}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography fontWeight={student.rank <= 3 ? 'bold' : 'normal'}>
                                  {student.full_name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {student.matricule}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography fontWeight="bold">
                                  {student.average}/20
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                {student.acquired_credits}/{student.total_credits}
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={student.mention}
                                  size="small"
                                  color={getMentionChipColor(student.mention)}
                                />
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {filteredRanking.length > rowsPerPage && (
                    <TablePagination
                      component="div"
                      count={filteredRanking.length}
                      page={page}
                      onPageChange={(_, newPage) => setPage(newPage)}
                      rowsPerPage={rowsPerPage}
                      onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                      }}
                      rowsPerPageOptions={[25, 50, 100]}
                      labelRowsPerPage="Par page:"
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};
