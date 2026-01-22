'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

import { useStudentCards, useCardStatistics } from '../hooks/useStudentCards';

import StudentCardListTable from './StudentCardListTable';
import StudentCardGenerateDialog from './StudentCardGenerateDialog';
import StudentCardStatusDialog from './StudentCardStatusDialog';
import StudentCardPrintStatusDialog from './StudentCardPrintStatusDialog';
import CardPreviewDialog from './CardPreviewDialog';
import QRScannerDialog from './QRScannerDialog';

import type { StudentCard, CardStatus, CardPrintStatus } from '../../types/studentCard.types';

interface StudentCardDashboardProps {
  translations: Record<string, any>;
}

export const StudentCardDashboard = ({ translations }: StudentCardDashboardProps) => {
  const t = translations;

  const {
    cards,
    loading,
    pagination,
    setPage,
    setPageSize,
    setSearch,
    updateParams,
    generateDuplicate,
    updateCardStatus,
    updatePrintStatus,
    downloadCard,
    downloadBatchPrint,
    deleteCard,
    refresh,
  } = useStudentCards();

  const { statistics, loading: statsLoading, refresh: refreshStats } = useCardStatistics();

  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [printStatusDialogOpen, setPrintStatusDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [scannerDialogOpen, setScannerDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<StudentCard | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleStatusFilterChange = useCallback(
    (status: CardStatus | '') => {
      updateParams({ status: status || undefined, page: 1 });
    },
    [updateParams]
  );

  const handlePrintStatusFilterChange = useCallback(
    (printStatus: CardPrintStatus | '') => {
      updateParams({ print_status: printStatus || undefined, page: 1 });
    },
    [updateParams]
  );

  const handleViewCard = useCallback((card: StudentCard) => {
    setSelectedCard(card);
    setPreviewDialogOpen(true);
  }, []);

  const handleDownloadCard = useCallback(
    async (card: StudentCard) => {
      try {
        await downloadCard(card.id, card.card_number);
        setSnackbar({
          open: true,
          message: t.studentCards?.downloadSuccess || 'Carte téléchargée avec succès',
          severity: 'success',
        });
      } catch {
        setSnackbar({
          open: true,
          message: t.studentCards?.downloadError || 'Erreur lors du téléchargement',
          severity: 'error',
        });
      }
    },
    [downloadCard, t]
  );

  const handleUpdateStatus = useCallback((card: StudentCard) => {
    setSelectedCard(card);
    setStatusDialogOpen(true);
  }, []);

  const handleUpdatePrintStatus = useCallback((card: StudentCard) => {
    setSelectedCard(card);
    setPrintStatusDialogOpen(true);
  }, []);

  const handleGenerateDuplicate = useCallback(
    async (card: StudentCard) => {
      const reason = window.prompt(t.studentCards?.duplicateReason || 'Raison du duplicata:');

      if (reason === null) return;

      try {
        await generateDuplicate(card.id, reason);
        setSnackbar({
          open: true,
          message: t.studentCards?.duplicateSuccess || 'Duplicata généré avec succès',
          severity: 'success',
        });
        refreshStats();
      } catch {
        setSnackbar({
          open: true,
          message: t.studentCards?.duplicateError || 'Erreur lors de la génération du duplicata',
          severity: 'error',
        });
      }
    },
    [generateDuplicate, refreshStats, t]
  );

  const handleBatchDownload = useCallback(
    async (cardIds: number[]) => {
      try {
        await downloadBatchPrint(cardIds, 'sheet_8');
        setSnackbar({
          open: true,
          message: t.studentCards?.batchDownloadSuccess || 'PDF d\'impression généré avec succès',
          severity: 'success',
        });
      } catch {
        setSnackbar({
          open: true,
          message: t.studentCards?.batchDownloadError || 'Erreur lors de la génération du PDF',
          severity: 'error',
        });
      }
    },
    [downloadBatchPrint, t]
  );

  const handleDeleteCard = useCallback(
    async (card: StudentCard) => {
      const confirmed = window.confirm(
        t.studentCards?.deleteConfirm ||
        `Êtes-vous sûr de vouloir supprimer la carte ${card.card_number} ?`
      );

      if (!confirmed) return;

      try {
        await deleteCard(card.id);
        setSnackbar({
          open: true,
          message: t.studentCards?.deleteSuccess || 'Carte supprimée avec succès',
          severity: 'success',
        });
        refreshStats();
      } catch {
        setSnackbar({
          open: true,
          message: t.studentCards?.deleteError || 'Erreur lors de la suppression',
          severity: 'error',
        });
      }
    },
    [deleteCard, refreshStats, t]
  );

  const handleStatusUpdate = useCallback(
    async (cardId: number, status: CardStatus, reason?: string) => {
      try {
        await updateCardStatus(cardId, { status, reason });
        setStatusDialogOpen(false);
        setSelectedCard(null);
        setSnackbar({
          open: true,
          message: t.studentCards?.statusUpdateSuccess || 'Statut mis à jour avec succès',
          severity: 'success',
        });
        refreshStats();
      } catch {
        setSnackbar({
          open: true,
          message: t.studentCards?.statusUpdateError || 'Erreur lors de la mise à jour du statut',
          severity: 'error',
        });
      }
    },
    [updateCardStatus, refreshStats, t]
  );

  const handlePrintStatusUpdate = useCallback(
    async (cardId: number, printStatus: CardPrintStatus) => {
      try {
        await updatePrintStatus(cardId, { print_status: printStatus });
        setPrintStatusDialogOpen(false);
        setSelectedCard(null);
        setSnackbar({
          open: true,
          message: t.studentCards?.printStatusUpdateSuccess || 'Statut d\'impression mis à jour',
          severity: 'success',
        });
        refreshStats();
      } catch {
        setSnackbar({
          open: true,
          message: t.studentCards?.printStatusUpdateError || 'Erreur lors de la mise à jour',
          severity: 'error',
        });
      }
    },
    [updatePrintStatus, refreshStats, t]
  );

  const handleGenerateComplete = useCallback(() => {
    setGenerateDialogOpen(false);
    refresh();
    refreshStats();
    setSnackbar({
      open: true,
      message: t.studentCards?.generateSuccess || 'Carte(s) générée(s) avec succès',
      severity: 'success',
    });
  }, [refresh, refreshStats, t]);

  const StatCard = ({
    title,
    value,
    color,
    icon,
  }: {
    title: string;
    value: number;
    color: string;
    icon: string;
  }) => (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={600}>
              {statsLoading ? <CircularProgress size={24} /> : value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${color}.lighter`,
              color: `${color}.main`,
            }}
          >
            <i className={icon} style={{ fontSize: 24 }} />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t.studentCards?.totalCards || 'Total cartes'}
            value={statistics?.total || 0}
            color="primary"
            icon="ri-id-card-line"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t.studentCards?.activeCards || 'Cartes actives'}
            value={statistics?.by_status?.active || 0}
            color="success"
            icon="ri-check-line"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t.studentCards?.pendingPrint || 'En attente d\'impression'}
            value={statistics?.by_print_status?.pending || 0}
            color="warning"
            icon="ri-printer-line"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t.studentCards?.issuedThisMonth || 'Émises ce mois'}
            value={statistics?.issued_this_month || 0}
            color="info"
            icon="ri-calendar-line"
          />
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<i className="ri-add-line" />}
              onClick={() => setGenerateDialogOpen(true)}
            >
              {t.studentCards?.generateCards || 'Générer des cartes'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<i className="ri-qr-scan-2-line" />}
              onClick={() => setScannerDialogOpen(true)}
            >
              {t.studentCards?.verifyCard || 'Vérifier une carte'}
            </Button>
            <Button variant="outlined" startIcon={<i className="ri-refresh-line" />} onClick={refresh}>
              {t.common?.refresh || 'Actualiser'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Cards Table */}
      <StudentCardListTable
        cards={cards}
        loading={loading}
        pagination={pagination}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onSearchChange={setSearch}
        onStatusFilterChange={handleStatusFilterChange}
        onPrintStatusFilterChange={handlePrintStatusFilterChange}
        onViewCard={handleViewCard}
        onDownloadCard={handleDownloadCard}
        onUpdateStatus={handleUpdateStatus}
        onUpdatePrintStatus={handleUpdatePrintStatus}
        onGenerateDuplicate={handleGenerateDuplicate}
        onDeleteCard={handleDeleteCard}
        onBatchDownload={handleBatchDownload}
        translations={t}
      />

      {/* Dialogs */}
      <StudentCardGenerateDialog
        open={generateDialogOpen}
        onClose={() => setGenerateDialogOpen(false)}
        onSuccess={handleGenerateComplete}
        translations={t}
      />

      {selectedCard && (
        <>
          <StudentCardStatusDialog
            open={statusDialogOpen}
            card={selectedCard}
            onClose={() => {
              setStatusDialogOpen(false);
              setSelectedCard(null);
            }}
            onSubmit={handleStatusUpdate}
            translations={t}
          />

          <StudentCardPrintStatusDialog
            open={printStatusDialogOpen}
            card={selectedCard}
            onClose={() => {
              setPrintStatusDialogOpen(false);
              setSelectedCard(null);
            }}
            onSubmit={handlePrintStatusUpdate}
            translations={t}
          />

          <CardPreviewDialog
            open={previewDialogOpen}
            card={selectedCard}
            onClose={() => {
              setPreviewDialogOpen(false);
              setSelectedCard(null);
            }}
            onDownload={() => handleDownloadCard(selectedCard)}
            translations={t}
          />
        </>
      )}

      <QRScannerDialog
        open={scannerDialogOpen}
        onClose={() => setScannerDialogOpen(false)}
        translations={t}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentCardDashboard;
