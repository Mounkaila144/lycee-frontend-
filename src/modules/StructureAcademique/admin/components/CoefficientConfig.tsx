'use client'

import { useState } from 'react'

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'

import { useCycles } from '../hooks/useCycles'
import { useSeries } from '../hooks/useSeries'
import { useCoefficients } from '../hooks/useCoefficients'
import { isLyceeLevel } from '../../types/cycle.types'
import type { Level } from '../../types/cycle.types'

export const CoefficientConfig = () => {
  const { levels } = useCycles()
  const { series } = useSeries()
  const { coefficients, totals, loading, error, fetchCoefficients } = useCoefficients()

  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null)
  const [selectedSeriesId, setSelectedSeriesId] = useState<number | undefined>(undefined)

  const handleLevelChange = (levelId: number) => {
    const level = levels.find(l => l.id === levelId) || null

    setSelectedLevel(level)
    setSelectedSeriesId(undefined)

    if (level && !isLyceeLevel(level.code)) {
      fetchCoefficients(level.id)
    }
  }

  const handleSeriesChange = (seriesId: number) => {
    setSelectedSeriesId(seriesId)

    if (selectedLevel) {
      fetchCoefficients(selectedLevel.id, seriesId)
    }
  }

  const needsSeries = selectedLevel && isLyceeLevel(selectedLevel.code)

  return (
    <Box>
      <Typography variant='h5' gutterBottom>
        Configuration des Coefficients
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Définissez le coefficient et les heures par matière pour chaque niveau et série.
      </Typography>

      {/* Sélecteurs */}
      <Box display='flex' gap={2} mb={3}>
        <FormControl size='small' sx={{ minWidth: 200 }}>
          <InputLabel>Niveau</InputLabel>
          <Select
            label='Niveau'
            value={selectedLevel?.id || ''}
            onChange={e => handleLevelChange(Number(e.target.value))}
          >
            {levels.map(level => (
              <MenuItem key={level.id} value={level.id}>
                {level.name} ({level.code})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {needsSeries && (
          <FormControl size='small' sx={{ minWidth: 200 }}>
            <InputLabel>Série</InputLabel>
            <Select
              label='Série'
              value={selectedSeriesId || ''}
              onChange={e => handleSeriesChange(Number(e.target.value))}
            >
              {series
                .filter(s => s.is_active)
                .map(s => (
                  <MenuItem key={s.id} value={s.id}>
                    Série {s.code} — {s.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!selectedLevel && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color='text.secondary'>Sélectionnez un niveau pour voir les coefficients.</Typography>
        </Paper>
      )}

      {selectedLevel && needsSeries && !selectedSeriesId && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color='text.secondary'>Sélectionnez une série pour voir les coefficients.</Typography>
        </Paper>
      )}

      {loading && (
        <Box display='flex' justifyContent='center' p={4}>
          <CircularProgress />
        </Box>
      )}

      {!loading && coefficients.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Matière</TableCell>
                <TableCell>Code</TableCell>
                <TableCell align='center'>Coefficient</TableCell>
                <TableCell align='center'>Heures/semaine</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coefficients.map(coeff => (
                <TableRow key={coeff.id}>
                  <TableCell>{coeff.subject?.name}</TableCell>
                  <TableCell>
                    <Chip label={coeff.subject?.code} size='small' variant='outlined' />
                  </TableCell>
                  <TableCell align='center'>
                    <Typography fontWeight={600}>{coeff.coefficient}</Typography>
                  </TableCell>
                  <TableCell align='center'>{coeff.hours_per_week || '—'}</TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <TableCell colSpan={2}>
                  <Typography fontWeight={700}>Total</Typography>
                </TableCell>
                <TableCell align='center'>
                  <Typography fontWeight={700}>{totals.total_coefficient}</Typography>
                </TableCell>
                <TableCell align='center'>
                  <Typography fontWeight={700}>{totals.total_hours}</Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!loading && selectedLevel && coefficients.length === 0 && (!needsSeries || selectedSeriesId) && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color='text.secondary'>Aucun coefficient configuré pour ce niveau/série.</Typography>
          <Button variant='outlined' sx={{ mt: 2 }}>
            Configurer les coefficients
          </Button>
        </Paper>
      )}
    </Box>
  )
}
