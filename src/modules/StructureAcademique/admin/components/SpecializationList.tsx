'use client'

import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { useSpecializations } from '../hooks/useSpecializations'
import { useProgrammes } from '../hooks/useProgrammes'
import SpecializationListTable from './SpecializationListTable'
import SpecializationFormDialog from './SpecializationFormDialog'
import SpecializationDeleteDialog from './SpecializationDeleteDialog'
import SpecializationCandidatesDialog from './SpecializationCandidatesDialog'
import { SpecializationModulesDialog } from './SpecializationModulesDialog'
import type { Specialization, SpecializationFormInput } from '../../types/specialization.types'

const SpecializationList = () => {
  const { specializations, loading, error, createSpecialization, updateSpecialization, deleteSpecialization } =
    useSpecializations()
  const { programmes, loading: programmesLoading } = useProgrammes()

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [candidatesOpen, setCandidatesOpen] = useState(false)
  const [modulesOpen, setModulesOpen] = useState(false)
  const [selectedSpecialization, setSelectedSpecialization] = useState<Specialization | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleCreate = () => {
    setSelectedSpecialization(null)
    setFormOpen(true)
  }

  const handleEdit = (specialization: Specialization) => {
    setSelectedSpecialization(specialization)
    setFormOpen(true)
  }

  const handleDelete = (specialization: Specialization) => {
    setSelectedSpecialization(specialization)
    setDeleteOpen(true)
  }

  const handleViewCandidates = (specialization: Specialization) => {
    setSelectedSpecialization(specialization)
    setCandidatesOpen(true)
  }

  const handleManageModules = (specialization: Specialization) => {
    setSelectedSpecialization(specialization)
    setModulesOpen(true)
  }

  const handleFormSubmit = async (data: SpecializationFormInput) => {
    if (selectedSpecialization) {
      await updateSpecialization(selectedSpecialization.id, data)
    } else {
      await createSpecialization(data)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedSpecialization) return

    try {
      setIsDeleting(true)
      await deleteSpecialization(selectedSpecialization.id)
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading || programmesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Specializations</Typography>
            <Button variant="contained" startIcon={<i className="ri-add-line" />} onClick={handleCreate}>
              Create Specialization
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <SpecializationListTable
            specializations={specializations}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewCandidates={handleViewCandidates}
            onManageModules={handleManageModules}
          />
        </CardContent>
      </Card>

      <SpecializationFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        specialization={selectedSpecialization}
        programmes={programmes}
      />

      <SpecializationDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        specialization={selectedSpecialization}
        isDeleting={isDeleting}
      />

      <SpecializationCandidatesDialog
        open={candidatesOpen}
        onClose={() => setCandidatesOpen(false)}
        specialization={selectedSpecialization}
      />

      {selectedSpecialization && (
        <SpecializationModulesDialog
          open={modulesOpen}
          onClose={() => setModulesOpen(false)}
          specialization={selectedSpecialization}
        />
      )}
    </Box>
  )
}

export default SpecializationList
