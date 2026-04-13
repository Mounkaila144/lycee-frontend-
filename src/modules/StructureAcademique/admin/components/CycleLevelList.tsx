'use client'

import { useState } from 'react'

import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
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

import { useCycles } from '../hooks/useCycles'
import { getCycleBadgeColor, getLevelBadgeColor } from '../../types/cycle.types'

export const CycleLevelList = () => {
  const { cycles, loading, error, updateCycle } = useCycles()
  const [expandedCycle, setExpandedCycle] = useState<number | null>(null)
  const [toggling, setToggling] = useState<number | null>(null)

  const handleToggleCycle = async (cycleId: number, isActive: boolean) => {
    try {
      setToggling(cycleId)
      await updateCycle(cycleId, { is_active: !isActive })
    } catch (err) {
      console.error('Error toggling cycle:', err)
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
        Cycles et Niveaux
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Les cycles et niveaux sont pré-configurés. Vous pouvez activer/désactiver un cycle.
      </Typography>

      {cycles.map(cycle => (
        <Card key={cycle.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box display='flex' alignItems='center' justifyContent='space-between'>
              <Box display='flex' alignItems='center' gap={2}>
                <Chip label={cycle.code} color={getCycleBadgeColor(cycle.code)} size='small' />
                <Typography variant='h6'>{cycle.name}</Typography>
                {cycle.description && (
                  <Typography variant='body2' color='text.secondary'>
                    — {cycle.description}
                  </Typography>
                )}
              </Box>
              <Box display='flex' alignItems='center' gap={1}>
                <Switch
                  checked={cycle.is_active}
                  onChange={() => handleToggleCycle(cycle.id, cycle.is_active)}
                  disabled={toggling === cycle.id}
                  size='small'
                />
                <IconButton
                  size='small'
                  onClick={() => setExpandedCycle(expandedCycle === cycle.id ? null : cycle.id)}
                >
                  <i className={expandedCycle === cycle.id ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} />
                </IconButton>
              </Box>
            </Box>

            <Collapse in={expandedCycle === cycle.id}>
              <TableContainer sx={{ mt: 2 }}>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Code</TableCell>
                      <TableCell>Nom</TableCell>
                      <TableCell>Ordre</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cycle.levels?.map(level => (
                      <TableRow key={level.id}>
                        <TableCell>
                          <Chip label={level.code} color={getLevelBadgeColor(level.code)} size='small' variant='outlined' />
                        </TableCell>
                        <TableCell>{level.name}</TableCell>
                        <TableCell>{level.order_index}</TableCell>
                      </TableRow>
                    ))}
                    {(!cycle.levels || cycle.levels.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={3} align='center'>
                          <Typography variant='body2' color='text.secondary'>
                            Aucun niveau
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Collapse>
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}
