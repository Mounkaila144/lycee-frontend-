'use client'

import { useState } from 'react'

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'

import { useCycles } from '../hooks/useCycles'
import { useSeries } from '../hooks/useSeries'
import { useCoefficients } from '../hooks/useCoefficients'
import { isLyceeLevel } from '../../types/cycle.types'
import type { Level } from '../../types/cycle.types'
import type { SubjectClassCoefficient } from '../../types/coefficient.types'

export const CoefficientConfig = () => {
  const { levels } = useCycles()
  const { series } = useSeries()
  const { coefficients, totals, loading, error, fetchCoefficients, updateCoefficient } = useCoefficients()

  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null)
  const [selectedSeriesId, setSelectedSeriesId] = useState<number | undefined>(undefined)

  const [editing, setEditing] = useState<SubjectClassCoefficient | null>(null)
  const [editCoefficient, setEditCoefficient] = useState<string>('')
  const [editHours, setEditHours] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

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

  const handleOpenEdit = (coeff: SubjectClassCoefficient) => {
    setEditing(coeff)
    setEditCoefficient(String(coeff.coefficient))
    setEditHours(coeff.hours_per_week !== null && coeff.hours_per_week !== undefined ? String(coeff.hours_per_week) : '')
    setEditError(null)
  }

  const handleCloseEdit = () => {
    if (saving) return
    setEditing(null)
    setEditError(null)
  }

  const handleSaveEdit = async () => {
    if (!editing || !selectedLevel) return

    const coefficientValue = Number(editCoefficient)

    if (!Number.isFinite(coefficientValue) || coefficientValue <= 0) {
      setEditError('Le coefficient doit être un nombre supérieur à zéro.')

      return
    }

    const hoursValue =
      editHours.trim() === '' ? null : Number(editHours)

    if (hoursValue !== null && (!Number.isFinite(hoursValue) || hoursValue < 0)) {
      setEditError('Les heures par semaine doivent être un nombre positif ou vide.')

      return
    }

    try {
      setSaving(true)
      setEditError(null)
      await updateCoefficient(
        editing.id,
        { coefficient: coefficientValue, hours_per_week: hoursValue },
        selectedLevel.id,
        selectedSeriesId
      )
      setEditing(null)
    } catch (err) {
      console.error('Error updating coefficient:', err)
      setEditError("Erreur lors de l'enregistrement du coefficient.")
    } finally {
      setSaving(false)
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
                <TableCell align='center'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coefficients.map(coeff => (
                <TableRow key={coeff.id} hover>
                  <TableCell>{coeff.subject?.name}</TableCell>
                  <TableCell>
                    <Chip label={coeff.subject?.code} size='small' variant='outlined' />
                  </TableCell>
                  <TableCell align='center'>
                    <Typography fontWeight={600}>{coeff.coefficient}</Typography>
                  </TableCell>
                  <TableCell align='center'>{coeff.hours_per_week || '—'}</TableCell>
                  <TableCell align='center'>
                    <Tooltip title='Modifier'>
                      <IconButton size='small' color='primary' onClick={() => handleOpenEdit(coeff)}>
                        <i className='ri-edit-line' />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
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
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!loading && selectedLevel && coefficients.length === 0 && (!needsSeries || selectedSeriesId) && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color='text.secondary'>Aucun coefficient configuré pour ce niveau/série.</Typography>
        </Paper>
      )}

      <Dialog open={editing !== null} onClose={handleCloseEdit} maxWidth='xs' fullWidth>
        <DialogTitle>Modifier le coefficient</DialogTitle>
        <DialogContent>
          {editing && (
            <Stack spacing={2} mt={1}>
              <Typography variant='body2' color='text.secondary'>
                {editing.subject?.name} ({editing.subject?.code})
              </Typography>
              {editError && <Alert severity='error'>{editError}</Alert>}
              <TextField
                label='Coefficient'
                type='number'
                inputProps={{ min: 0.5, step: 0.5 }}
                value={editCoefficient}
                onChange={e => setEditCoefficient(e.target.value)}
                fullWidth
                required
              />
              <TextField
                label='Heures par semaine'
                type='number'
                inputProps={{ min: 0, step: 0.5 }}
                value={editHours}
                onChange={e => setEditHours(e.target.value)}
                helperText='Laisser vide si non applicable'
                fullWidth
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} disabled={saving}>
            Annuler
          </Button>
          <Button onClick={handleSaveEdit} variant='contained' disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
