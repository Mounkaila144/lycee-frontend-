'use client'

import { useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import { useEvaluationTemplates } from '../hooks/useEvaluationConfig'

interface TemplateSelectorProps {
  onSelect: (templateId: number) => Promise<void>
}

const TemplateSelector = ({ onSelect }: TemplateSelectorProps) => {
  const { templates, loading, error } = useEvaluationTemplates(true)
  const [applying, setApplying] = useState<number | null>(null)

  const handleSelect = async (templateId: number) => {
    try {
      setApplying(templateId)
      await onSelect(templateId)
    } catch (err) {
      console.error('Error applying template:', err)
    } finally {
      setApplying(null)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )
  }

  if (templates.length === 0) {
    return (
      <Alert severity="info">Aucun template disponible</Alert>
    )
  }

  return (
    <Grid container spacing={2}>
      {templates.map(template => (
        <Grid item xs={12} sm={6} md={4} key={template.id}>
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              '&:hover': { boxShadow: 2 }
            }}
          >
            <CardContent sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="h6" component="div" gutterBottom>
                  {template.name}
                </Typography>
                <Chip
                  label={`${template.evaluations_count || 0} éval.`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {template.description}
              </Typography>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Composition:
                </Typography>
                {template.config_json.evaluations.map((evaluation, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 0.5
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">{evaluation.name}</Typography>
                      <Chip label={evaluation.type} size="small" />
                    </Box>
                    <Typography variant="body2" fontWeight="medium">
                      {evaluation.coefficient}%
                    </Typography>
                  </Box>
                ))}
              </Box>

              {template.total_coefficient && (
                <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color={template.total_coefficient === 100 ? 'success.main' : 'warning.main'}
                  >
                    Total: {template.total_coefficient}%
                  </Typography>
                </Box>
              )}
            </CardContent>

            <CardActions>
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleSelect(template.id)}
                disabled={applying !== null}
                startIcon={applying === template.id ? <CircularProgress size={16} /> : <i className="ri-check-line" />}
              >
                {applying === template.id ? 'Application...' : 'Appliquer'}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default TemplateSelector
