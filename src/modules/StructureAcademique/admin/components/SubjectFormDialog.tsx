'use client'

import { useEffect, useState } from 'react'

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material'

import type { Subject, SubjectFormData, SubjectCategory } from '../../types/subject.types'
import { SUBJECT_CATEGORIES } from '../../types/subject.types'

interface SubjectFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: SubjectFormData) => Promise<void>
  subject?: Subject | null
}

export const SubjectFormDialog = ({ open, onClose, onSubmit, subject }: SubjectFormDialogProps) => {
  const [formData, setFormData] = useState<SubjectFormData>({
    code: '',
    name: '',
    short_name: '',
    category: 'sciences',
    description: ''
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      if (subject) {
        setFormData({
          code: subject.code,
          name: subject.name,
          short_name: subject.short_name,
          category: subject.category,
          description: subject.description || ''
        })
      } else {
        setFormData({ code: '', name: '', short_name: '', category: 'sciences', description: '' })
      }

      setError(null)
    }
  }, [open, subject])

  const handleSubmit = async () => {
    if (!formData.code || !formData.name || !formData.short_name || !formData.category) {
      setError('Veuillez remplir tous les champs obligatoires.')

      return
    }

    try {
      setSubmitting(true)
      setError(null)
      await onSubmit(formData)
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Erreur lors de la sauvegarde.'

      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>{subject ? 'Modifier la matière' : 'Nouvelle matière'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity='error' sx={{ mb: 2, mt: 1 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label='Code matière'
          value={formData.code}
          onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
          placeholder='Ex: MATH, FRAN, PHYS'
          disabled={!!subject}
          sx={{ mt: 2, mb: 2 }}
          required
        />

        <TextField
          fullWidth
          label='Nom complet'
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          placeholder='Ex: Mathématiques'
          sx={{ mb: 2 }}
          required
        />

        <TextField
          fullWidth
          label='Nom abrégé'
          value={formData.short_name}
          onChange={e => setFormData({ ...formData, short_name: e.target.value })}
          placeholder='Ex: Maths'
          sx={{ mb: 2 }}
          required
        />

        <FormControl fullWidth sx={{ mb: 2 }} required>
          <InputLabel>Catégorie</InputLabel>
          <Select
            label='Catégorie'
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value as SubjectCategory })}
          >
            {SUBJECT_CATEGORIES.map(cat => (
              <MenuItem key={cat.value} value={cat.value}>
                {cat.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label='Description'
          value={formData.description || ''}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          multiline
          rows={3}
          placeholder='Description optionnelle'
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Annuler
        </Button>
        <Button variant='contained' onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Enregistrement...' : subject ? 'Modifier' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
