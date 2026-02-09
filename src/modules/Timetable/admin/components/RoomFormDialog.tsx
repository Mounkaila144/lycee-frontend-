'use client';

import React, { useState, useEffect } from 'react';

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
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import type { Room, RoomType } from '../../types';
import { ROOM_TYPES, EQUIPMENT_OPTIONS } from '../../types';

interface RoomFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Room>) => void;
  editRoom?: Room;
}

export const RoomFormDialog: React.FC<RoomFormDialogProps> = ({ open, onClose, onSave, editRoom }) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<RoomType>('Salle TD');
  const [capacity, setCapacity] = useState<number>(30);
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [equipment, setEquipment] = useState<string[]>([]);

  useEffect(() => {
    if (editRoom) {
      setCode(editRoom.code);
      setName(editRoom.name);
      setType(editRoom.type);
      setCapacity(editRoom.capacity);
      setBuilding(editRoom.building || '');
      setFloor(editRoom.floor || '');
      setEquipment(editRoom.equipment || []);
    } else {
      setCode('');
      setName('');
      setType('Salle TD');
      setCapacity(30);
      setBuilding('');
      setFloor('');
      setEquipment([]);
    }
  }, [editRoom, open]);

  const toggleEquipment = (eq: string) => {
    setEquipment((prev) => prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq]);
  };

  const handleSave = () => {
    onSave({ code, name, type, capacity, building: building || undefined, floor: floor || undefined, equipment });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editRoom ? 'Modifier salle' : 'Nouvelle salle'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={4}>
            <TextField fullWidth size="small" label="Code" value={code} onChange={(e) => setCode(e.target.value)} required />
          </Grid>
          <Grid item xs={8}>
            <TextField fullWidth size="small" label="Nom" value={name} onChange={(e) => setName(e.target.value)} required />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select value={type} label="Type" onChange={(e) => setType(e.target.value as RoomType)}>
                {ROOM_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Capacité" type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} inputProps={{ min: 1, max: 500 }} required />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Bâtiment" value={building} onChange={(e) => setBuilding(e.target.value)} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Étage" value={floor} onChange={(e) => setFloor(e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>Équipements</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
              {EQUIPMENT_OPTIONS.map((eq) => (
                <FormControlLabel
                  key={eq}
                  control={<Checkbox size="small" checked={equipment.includes(eq)} onChange={() => toggleEquipment(eq)} />}
                  label={<Typography variant="body2">{eq}</Typography>}
                  sx={{ width: '48%' }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" onClick={handleSave} disabled={!code || !name}>Enregistrer</Button>
      </DialogActions>
    </Dialog>
  );
};
