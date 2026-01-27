'use client'

import { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Button,
  Card,
  CardContent
} from '@mui/material'
import EvaluationTemplateList from '@/modules/StructureAcademique/admin/components/EvaluationTemplateList'
import EvaluationTemplateDialog from '@/modules/StructureAcademique/admin/components/EvaluationTemplateDialog'
import type { EvaluationTemplate } from '@/modules/StructureAcademique/types/evaluationConfig.types'

export default function EvaluationTemplatesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EvaluationTemplate | null>(null)

  const handleCreate = () => {
    setEditingTemplate(null)
    setDialogOpen(true)
  }

  const handleEdit = (template: EvaluationTemplate) => {
    setEditingTemplate(template)
    setDialogOpen(true)
  }

  const handleClose = () => {
    setDialogOpen(false)
    setEditingTemplate(null)
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Breadcrumbs
        separator={<i className='ri-arrow-right-s-line' />}
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link underline="hover" color="inherit" href="/admin/structure">
          Structure Académique
        </Link>
        <Typography color="text.primary">Templates d'Évaluation</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Templates d'Évaluation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gérez les templates prédéfinis pour configurer rapidement les évaluations des modules
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<i className='ri-add-line' />}
          onClick={handleCreate}
        >
          Créer un template
        </Button>
      </Box>

      <Card>
        <CardContent>
          <EvaluationTemplateList onEdit={handleEdit} />
        </CardContent>
      </Card>

      <EvaluationTemplateDialog
        open={dialogOpen}
        onClose={handleClose}
        template={editingTemplate}
      />
    </Container>
  )
}
