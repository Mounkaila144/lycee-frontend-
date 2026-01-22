'use client'

import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Chip from '@mui/material/Chip'
import type { ValidationResult } from '../../types/evaluationConfig.types'

interface ConfigValidatorProps {
  result: ValidationResult
  totalCoefficient: number
}

const ConfigValidator = ({ result, totalCoefficient }: ConfigValidatorProps) => {
  const hasIssues = result.errors.length > 0 || result.warnings.length > 0

  if (!hasIssues && result.valid) {
    return (
      <Alert severity="success" icon={<i className="ri-checkbox-circle-line" />}>
        <AlertTitle>Configuration valide</AlertTitle>
        La configuration est prête à être publiée. Total des coefficients: {totalCoefficient}%
      </Alert>
    )
  }

  return (
    <Box>
      {/* Errors */}
      {result.errors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }} icon={<i className="ri-error-warning-line" />}>
          <AlertTitle>
            Erreurs ({result.errors.length})
            <Chip label="Bloquant" color="error" size="small" sx={{ ml: 1 }} />
          </AlertTitle>
          <List dense disablePadding>
            {result.errors.map((error, index) => (
              <ListItem key={index} disablePadding>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <i className="ri-close-circle-line" style={{ color: 'inherit' }} />
                </ListItemIcon>
                <ListItemText primary={error} />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <Alert severity="warning" icon={<i className="ri-alert-line" />}>
          <AlertTitle>
            Avertissements ({result.warnings.length})
            <Chip label="Non bloquant" color="warning" size="small" sx={{ ml: 1 }} />
          </AlertTitle>
          <List dense disablePadding>
            {result.warnings.map((warning, index) => (
              <ListItem key={index} disablePadding>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <i className="ri-information-line" style={{ color: 'inherit' }} />
                </ListItemIcon>
                <ListItemText primary={warning} />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}
    </Box>
  )
}

export default ConfigValidator
