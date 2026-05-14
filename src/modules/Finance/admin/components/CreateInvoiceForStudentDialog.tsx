'use client';

import { useEffect, useMemo, useState } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

import { useTenant } from '@/shared/lib/tenant-context';
import { useAcademicYears } from '@/modules/StructureAcademique/admin/hooks/useAcademicYears';
import { useFeeTypes, useCreateInvoice } from '@/modules/Finance/admin/hooks/useInvoices';

interface MinimalStudent {
  id: number;
  firstname?: string;
  lastname?: string;
  matricule?: string;
}

interface Props {
  student: MinimalStudent | null;
  open: boolean;
  onClose: () => void;
  onCreated?: (message: string) => void;
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);

const today = () => new Date().toISOString().slice(0, 10);
const plus30 = () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

export const CreateInvoiceForStudentDialog: React.FC<Props> = ({ student, open, onClose, onCreated }) => {
  const { tenantId } = useTenant();
  const { academicYears } = useAcademicYears();
  const activeYear = useMemo(() => academicYears.find(y => y.is_active), [academicYears]);

  const { data: feeTypesData } = useFeeTypes(tenantId || undefined);
  const feeTypes = feeTypesData?.data || [];

  const createMutation = useCreateInvoice(tenantId || undefined);

  const [feeTypeId, setFeeTypeId] = useState<number | ''>('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFeeTypeId('');
      setAmount('');
      setDueDate(plus30());
      setNotes('');
      setError(null);
    }
  }, [open]);

  const handleFeeTypeChange = (id: number) => {
    const ft: any = feeTypes.find((f: any) => f.id === id);

    setFeeTypeId(id);
    if (ft) {
      const value = Number(ft.default_amount ?? ft.amount ?? 0);

      setAmount(String(value));
    }
  };

  const handleSubmit = async () => {
    setError(null);

    if (!student) return;

    if (!activeYear) {
      setError("Aucune année académique active n'est définie.");

      return;
    }

    if (!feeTypeId) {
      setError('Sélectionnez un type de frais.');

      return;
    }

    const amountNum = Number(amount);

    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setError('Le montant doit être un nombre positif.');

      return;
    }

    if (!dueDate) {
      setError("La date d'échéance est obligatoire.");

      return;
    }

    const ft: any = feeTypes.find((f: any) => f.id === feeTypeId);

    try {
      await createMutation.mutateAsync({
        student_id: student.id,
        academic_year_id: activeYear.id,
        due_date: dueDate,
        notes: notes || undefined,
        items: [
          {
            fee_type_id: feeTypeId as number,
            quantity: 1,
            unit_price: amountNum,
            description: ft ? `${ft.code} — ${ft.name}` : 'Frais',
          } as any,
        ],
      });
      onCreated?.(`Facture créée pour ${student.firstname ?? ''} ${student.lastname ?? ''}.`);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erreur lors de la création de la facture.');
    }
  };

  if (!student) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nouvelle facture — {student.firstname} {student.lastname}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          {activeYear ? (
            <Alert severity="info">
              Année académique : <strong>{activeYear.name}</strong> · Étudiant : <strong>{student.matricule}</strong>
            </Alert>
          ) : (
            <Alert severity="warning">
              Aucune année académique active. Activez-en une dans Structure / Calendrier académique.
            </Alert>
          )}

          <FormControl fullWidth required>
            <InputLabel>Type de frais</InputLabel>
            <Select
              label="Type de frais"
              value={feeTypeId}
              onChange={e => handleFeeTypeChange(Number(e.target.value))}
            >
              {feeTypes.length === 0 ? (
                <MenuItem disabled value="">
                  Aucun type de frais configuré
                </MenuItem>
              ) : (
                feeTypes
                  .filter((ft: any) => ft.is_active !== false)
                  .map((ft: any) => {
                    const v = Number(ft.default_amount ?? ft.amount ?? 0);

                    return (
                      <MenuItem key={ft.id} value={ft.id}>
                        {ft.code} - {ft.name} ({formatCurrency(v)})
                      </MenuItem>
                    );
                  })
              )}
            </Select>
          </FormControl>

          <TextField
            label="Montant (XOF)"
            type="number"
            fullWidth
            required
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />

          <TextField
            label="Date d'échéance"
            type="date"
            fullWidth
            required
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="Notes"
            fullWidth
            multiline
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Notes optionnelles"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={createMutation.isPending}>Annuler</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={createMutation.isPending || !activeYear}
        >
          {createMutation.isPending ? 'Création…' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
