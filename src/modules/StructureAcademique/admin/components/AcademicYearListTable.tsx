'use client'

import { useState } from 'react'
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import type { AcademicYear } from '../../types/academicCalendar.types'
import { getAcademicYearStatusColor } from '../../types/academicCalendar.types'
import AcademicYearFormDialog from './AcademicYearFormDialog'
import AcademicYearDeleteDialog from './AcademicYearDeleteDialog'
import SemesterManagementDialog from './SemesterManagementDialog'

interface AcademicYearListTableProps {
  academicYears: AcademicYear[]
  loading: boolean
  error: string | null
  onCreateYear: (data: any) => Promise<void>
  onUpdateYear: (id: number, data: any) => Promise<void>
  onDeleteYear: (id: number) => Promise<void>
  onActivateYear: (id: number) => Promise<void>
}

const AcademicYearListTable = ({
  academicYears,
  loading,
  error,
  onCreateYear,
  onUpdateYear,
  onDeleteYear,
  onActivateYear
}: AcademicYearListTableProps) => {
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [semesterOpen, setSemesterOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null)
  const [activating, setActivating] = useState<number | null>(null)

  const handleEdit = (year: AcademicYear) => {
    setSelectedYear(year)
    setFormOpen(true)
  }

  const handleDelete = (year: AcademicYear) => {
    setSelectedYear(year)
    setDeleteOpen(true)
  }

  const handleManageSemesters = (year: AcademicYear) => {
    setSelectedYear(year)
    setSemesterOpen(true)
  }

  const handleActivate = async (year: AcademicYear) => {
    try {
      setActivating(year.id)
      await onActivateYear(year.id)
    } catch (err) {
      console.error('Failed to activate year:', err)
    } finally {
      setActivating(null)
    }
  }

  const handleFormSubmit = async (data: any) => {
    if (selectedYear) {
      await onUpdateYear(selectedYear.id, data)
    } else {
      await onCreateYear(data)
    }
  }

  const handleDeleteConfirm = async () => {
    if (selectedYear) {
      await onDeleteYear(selectedYear.id)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  if (academicYears.length === 0) {
    return (
      <Card>
        <Box p={4} textAlign="center">
          <Typography variant="h6" color="text.secondary">
            Aucune année académique
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Créez votre première année académique pour commencer
          </Typography>
        </Box>
      </Card>
    )
  }

  return (
    <>
      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Année</TableCell>
              <TableCell>Date de début</TableCell>
              <TableCell>Date de fin</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Semestres</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {academicYears.map(year => (
              <TableRow key={year.id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" fontWeight={year.is_active ? 600 : 400}>
                      {year.name}
                    </Typography>
                    {year.is_active && (
                      <Chip label="Active" color="success" size="small" sx={{ height: 20 }} />
                    )}
                  </Box>
                </TableCell>
                <TableCell>{formatDate(year.start_date)}</TableCell>
                <TableCell>{formatDate(year.end_date)}</TableCell>
                <TableCell>
                  <Chip label={year.status} color={getAcademicYearStatusColor(year.status)} size="small" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {year.semesters?.length || 0} semestre(s)
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box display="flex" justifyContent="flex-end" gap={0.5}>
                    <Tooltip title="Gérer les semestres">
                      <IconButton size="small" onClick={() => handleManageSemesters(year)}>
                        <i className="ri-calendar-2-line" />
                      </IconButton>
                    </Tooltip>
                    {!year.is_active && (
                      <Tooltip title="Activer cette année">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleActivate(year)}
                          disabled={activating === year.id}
                        >
                          {activating === year.id ? (
                            <CircularProgress size={16} />
                          ) : (
                            <i className="ri-checkbox-circle-line" />
                          )}
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Modifier">
                      <IconButton size="small" onClick={() => handleEdit(year)}>
                        <i className="ri-edit-line" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton size="small" color="error" onClick={() => handleDelete(year)}>
                        <i className="ri-delete-bin-line" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <AcademicYearFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setSelectedYear(null)
        }}
        onSubmit={handleFormSubmit}
        academicYear={selectedYear}
      />

      <AcademicYearDeleteDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false)
          setSelectedYear(null)
        }}
        onConfirm={handleDeleteConfirm}
        academicYear={selectedYear}
      />

      {selectedYear && (
        <SemesterManagementDialog
          open={semesterOpen}
          onClose={() => {
            setSemesterOpen(false)
            setSelectedYear(null)
          }}
          academicYear={selectedYear}
        />
      )}
    </>
  )
}

export default AcademicYearListTable
