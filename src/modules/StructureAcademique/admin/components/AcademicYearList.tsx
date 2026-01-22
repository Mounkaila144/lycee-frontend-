'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useState } from 'react'
import { useAcademicYears } from '../hooks/useAcademicYears'
import AcademicYearListTable from './AcademicYearListTable'
import AcademicYearFormDialog from './AcademicYearFormDialog'

const AcademicYearList = () => {
  const { academicYears, loading, error, createAcademicYear, updateAcademicYear, deleteAcademicYear, activateAcademicYear } =
    useAcademicYears()

  const [formOpen, setFormOpen] = useState(false)

  const handleCreate = async (data: any) => {
    await createAcademicYear(data)
  }

  const handleUpdate = async (id: number, data: any) => {
    await updateAcademicYear(id, data)
  }

  const handleDelete = async (id: number) => {
    await deleteAcademicYear(id)
  }

  const handleActivate = async (id: number) => {
    await activateAcademicYear(id)
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1">
            Calendrier Académique
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Gestion des années académiques et semestres
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<i className="ri-add-line" />}
          onClick={() => setFormOpen(true)}
          disabled={loading}
        >
          Nouvelle année
        </Button>
      </Box>

      <AcademicYearListTable
        academicYears={academicYears}
        loading={loading}
        error={error}
        onCreateYear={handleCreate}
        onUpdateYear={handleUpdate}
        onDeleteYear={handleDelete}
        onActivateYear={handleActivate}
      />

      <AcademicYearFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        academicYear={null}
      />
    </Box>
  )
}

export default AcademicYearList
