'use client'

import { useState } from 'react'

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
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

import { useSubjects } from '../hooks/useSubjects'
import { getCategoryBadgeColor, getCategoryLabel, SUBJECT_CATEGORIES } from '../../types/subject.types'
import type { SubjectCategory } from '../../types/subject.types'
import { SubjectFormDialog } from './SubjectFormDialog'
import { SubjectDeleteDialog } from './SubjectDeleteDialog'
import type { Subject } from '../../types/subject.types'

export const SubjectList = () => {
  const { subjects, loading, error, params, createSubject, updateSubject, deleteSubject, updateParams } = useSubjects()

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [toggling, setToggling] = useState<number | null>(null)

  const handleCreate = () => {
    setSelectedSubject(null)
    setFormOpen(true)
  }

  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject)
    setFormOpen(true)
  }

  const handleDelete = (subject: Subject) => {
    setSelectedSubject(subject)
    setDeleteOpen(true)
  }

  const handleToggle = async (subject: Subject) => {
    try {
      setToggling(subject.id)
      await updateSubject(subject.id, { is_active: !subject.is_active })
    } catch (err) {
      console.error('Error toggling subject:', err)
    } finally {
      setToggling(null)
    }
  }

  const handleFormSubmit = async (data: any) => {
    if (selectedSubject) {
      await updateSubject(selectedSubject.id, data)
    } else {
      await createSubject(data)
    }

    setFormOpen(false)
  }

  const handleDeleteConfirm = async () => {
    if (selectedSubject) {
      await deleteSubject(selectedSubject.id)
    }

    setDeleteOpen(false)
    setSelectedSubject(null)
  }

  return (
    <Box>
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
        <Box>
          <Typography variant='h5'>Gestion des Matières</Typography>
          <Typography variant='body2' color='text.secondary'>
            Catalogue des matières d'enseignement
          </Typography>
        </Box>
        <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={handleCreate}>
          Nouvelle matière
        </Button>
      </Box>

      {/* Filtres */}
      <Box display='flex' gap={2} mb={3}>
        <TextField
          size='small'
          placeholder='Rechercher par code ou nom...'
          value={params.search || ''}
          onChange={e => updateParams({ search: e.target.value || undefined })}
          sx={{ minWidth: 250 }}
        />
        <FormControl size='small' sx={{ minWidth: 180 }}>
          <InputLabel>Catégorie</InputLabel>
          <Select
            label='Catégorie'
            value={params.category || ''}
            onChange={e => updateParams({ category: (e.target.value as SubjectCategory) || undefined })}
          >
            <MenuItem value=''>Toutes</MenuItem>
            {SUBJECT_CATEGORIES.map(cat => (
              <MenuItem key={cat.value} value={cat.value}>
                {cat.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display='flex' justifyContent='center' p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Nom abrégé</TableCell>
                <TableCell>Catégorie</TableCell>
                <TableCell align='center'>Statut</TableCell>
                <TableCell align='center'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subjects.map(subject => (
                <TableRow key={subject.id}>
                  <TableCell>
                    <Typography variant='body2' fontWeight={600}>
                      {subject.code}
                    </Typography>
                  </TableCell>
                  <TableCell>{subject.name}</TableCell>
                  <TableCell>{subject.short_name}</TableCell>
                  <TableCell>
                    <Chip
                      label={getCategoryLabel(subject.category)}
                      color={getCategoryBadgeColor(subject.category)}
                      size='small'
                    />
                  </TableCell>
                  <TableCell align='center'>
                    <Switch
                      checked={subject.is_active}
                      onChange={() => handleToggle(subject)}
                      disabled={toggling === subject.id}
                      size='small'
                    />
                  </TableCell>
                  <TableCell align='center'>
                    <Tooltip title='Modifier'>
                      <IconButton size='small' onClick={() => handleEdit(subject)}>
                        <i className='ri-pencil-line' />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title='Supprimer'>
                      <IconButton size='small' color='error' onClick={() => handleDelete(subject)}>
                        <i className='ri-delete-bin-line' />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {subjects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align='center'>
                    <Typography variant='body2' color='text.secondary' py={3}>
                      Aucune matière trouvée
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <SubjectFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        subject={selectedSubject}
      />

      <SubjectDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        subject={selectedSubject}
      />
    </Box>
  )
}
