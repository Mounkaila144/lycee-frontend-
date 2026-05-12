'use client';

import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';

import { messagingService } from '@/modules/Messaging/services/messagingService';
import type { Message } from '@/modules/Messaging/types/messaging.types';
import { SendMessageDialog } from '@/modules/Messaging/admin/components/SendMessageDialog';

export default function TeacherMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    messagingService.inbox().then(setMessages).catch(() => {});
  }, [refreshKey]);

  return (
    <Card>
      <CardHeader
        title='Messagerie'
        subheader='Story Professeur — Messages avec parents'
        action={
          <Button variant='contained' onClick={() => setDialogOpen(true)}>
            Nouveau message
          </Button>
        }
      />
      <CardContent>
        {messages.length === 0 && <Alert severity='info'>Aucun message.</Alert>}
        <List>
          {messages.map((m) => (
            <ListItem key={m.id} divider>
              <ListItemText
                primary={m.subject}
                secondary={`${m.body.slice(0, 120)}${m.body.length > 120 ? '…' : ''}`}
              />
              <Chip
                label={m.read_at ? 'Lu' : 'Non lu'}
                size='small'
                color={m.read_at ? 'default' : 'primary'}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>

      <SendMessageDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSent={() => setRefreshKey((k) => k + 1)}
      />
    </Card>
  );
}
