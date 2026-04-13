'use client'

import { useState } from 'react'

import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'

import { useSeries } from '../hooks/useSeries'
import { getSeriesBadgeColor } from '../../types/series.types'

export const SeriesList = () => {
  const { series, loading, error, updateSeries } = useSeries()
  const [toggling, setToggling] = useState<number | null>(null)

  const handleToggle = async (id: number, isActive: boolean) => {
    try {
      setToggling(id)
      await updateSeries(id, { is_active: !isActive })
    } catch (err) {
      console.error('Error toggling series:', err)
    } finally {
      setToggling(null)
    }
  }

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' p={4}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={4}>
        <Typography color='error'>{error}</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant='h5' gutterBottom>
        Séries
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Les séries (A, C, D) sont pré-configurées. Applicable aux niveaux 1ère et Terminale.
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align='center'>Statut</TableCell>
              <TableCell align='center'>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {series.map(s => (
              <TableRow key={s.id}>
                <TableCell>
                  <Chip label={s.code} color={getSeriesBadgeColor(s.code)} size='small' />
                </TableCell>
                <TableCell>{s.name}</TableCell>
                <TableCell>
                  <Typography variant='body2' color='text.secondary'>
                    {s.description || '—'}
                  </Typography>
                </TableCell>
                <TableCell align='center'>
                  <Chip
                    label={s.is_active ? 'Active' : 'Inactive'}
                    color={s.is_active ? 'success' : 'default'}
                    size='small'
                    variant='outlined'
                  />
                </TableCell>
                <TableCell align='center'>
                  <IconButton size='small' onClick={() => handleToggle(s.id, s.is_active)} disabled={toggling === s.id}>
                    <i className={s.is_active ? 'ri-eye-off-line' : 'ri-eye-line'} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
