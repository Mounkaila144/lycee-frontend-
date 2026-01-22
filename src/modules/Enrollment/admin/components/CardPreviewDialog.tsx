'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';

import type { StudentCard, CardStatus, CardPrintStatus } from '../../types/studentCard.types';

interface CardPreviewDialogProps {
  open: boolean;
  card: StudentCard;
  onClose: () => void;
  onDownload: () => void;
  translations: Record<string, any>;
}

export const CardPreviewDialog = ({
  open,
  card,
  onClose,
  onDownload,
  translations,
}: CardPreviewDialogProps) => {
  const t = translations;

  const getStatusColor = (status: CardStatus): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Expired':
        return 'warning';
      case 'Suspended':
        return 'error';
      case 'Revoked':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPrintStatusColor = (status: CardPrintStatus): 'info' | 'success' | 'default' => {
    switch (status) {
      case 'Pending':
        return 'info';
      case 'Printed':
        return 'success';
      case 'Delivered':
        return 'success';
      default:
        return 'default';
    }
  };

  const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value}
      </Typography>
    </Stack>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <i className="ri-id-card-line" style={{ fontSize: 24 }} />
          <span>{t.studentCards?.cardPreview || 'Aperçu de la carte'}</span>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Card Preview - Left Side */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                p: 3,
                borderRadius: 2,
                minHeight: 300,
              }}
            >
              <CardContent>
                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {t.studentCards?.studentCard || 'CARTE ÉTUDIANT'}
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {card.academic_year?.name}
                    </Typography>
                  </Box>
                  <Avatar
                    src={card.student?.photo}
                    alt={`${card.student?.firstname} ${card.student?.lastname}`}
                    sx={{ width: 72, height: 72, border: '2px solid white' }}
                  >
                    {card.student?.firstname?.[0]}
                    {card.student?.lastname?.[0]}
                  </Avatar>
                </Stack>

                {/* Student Info */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h5" fontWeight={600}>
                    {card.student?.firstname} {card.student?.lastname}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {card.student?.matricule}
                  </Typography>
                </Box>

                {/* Program & Level */}
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {t.studentCards?.program || 'Formation'}
                    </Typography>
                    <Typography variant="body2">{card.program?.name || card.program?.code}</Typography>
                  </Box>
                  {card.level && (
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {t.studentCards?.level || 'Niveau'}
                      </Typography>
                      <Typography variant="body2">{card.level}</Typography>
                    </Box>
                  )}
                </Stack>

                {/* Card Number */}
                <Box
                  sx={{
                    mt: 'auto',
                    pt: 2,
                    borderTop: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {t.studentCards?.cardNumber || 'N° Carte'}
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace" fontWeight={600}>
                    {card.card_number}
                  </Typography>
                </Box>

                {/* Validity */}
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {t.studentCards?.issuedAt || 'Émise le'}
                    </Typography>
                    <Typography variant="body2">
                      {new Date(card.issued_at).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {t.studentCards?.validUntil || 'Valide jusqu\'à'}
                    </Typography>
                    <Typography variant="body2">
                      {new Date(card.valid_until).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* QR Code Section */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                {t.studentCards?.qrCodeData || 'Données QR Code'}
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  wordBreak: 'break-all',
                  maxHeight: 100,
                  overflow: 'auto',
                }}
              >
                {card.qr_code_data}
              </Box>
            </Box>
          </Grid>

          {/* Card Details - Right Side */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {t.studentCards?.cardDetails || 'Détails de la carte'}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <InfoRow
              label={t.studentCards?.status || 'Statut'}
              value={
                <Chip
                  label={t.studentCards?.statuses?.[card.status] || card.status}
                  color={getStatusColor(card.status)}
                  size="small"
                />
              }
            />

            <InfoRow
              label={t.studentCards?.printStatus || 'Impression'}
              value={
                <Chip
                  label={t.studentCards?.printStatuses?.[card.print_status] || card.print_status}
                  color={getPrintStatusColor(card.print_status)}
                  size="small"
                  variant="outlined"
                />
              }
            />

            <Divider sx={{ my: 2 }} />

            <InfoRow
              label={t.studentCards?.isDuplicate || 'Duplicata'}
              value={
                card.is_duplicate ? (
                  <Chip label={t.common?.yes || 'Oui'} color="warning" size="small" variant="outlined" />
                ) : (
                  <Chip label={t.common?.no || 'Non'} size="small" variant="outlined" />
                )
              }
            />

            {card.is_duplicate && card.original_card && (
              <InfoRow
                label={t.studentCards?.originalCard || 'Carte originale'}
                value={card.original_card.card_number}
              />
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
              {t.studentCards?.timestamps || 'Horodatages'}
            </Typography>

            <InfoRow
              label={t.studentCards?.createdAt || 'Créée le'}
              value={new Date(card.created_at).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            />

            {card.printed_at && (
              <InfoRow
                label={t.studentCards?.printedAt || 'Imprimée le'}
                value={new Date(card.printed_at).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              />
            )}

            {card.delivered_at && (
              <InfoRow
                label={t.studentCards?.deliveredAt || 'Livrée le'}
                value={new Date(card.delivered_at).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              />
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{t.common?.close || 'Fermer'}</Button>
        <Button variant="contained" onClick={onDownload} startIcon={<i className="ri-download-2-line" />}>
          {t.studentCards?.downloadPdf || 'Télécharger PDF'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CardPreviewDialog;
