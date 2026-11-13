'use client';

import { useCallback, useEffect, useState } from 'react';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

import { messagingService } from '../../services/messagingService';
import type { Message, MessageRecipient } from '../../types/messaging.types';
import { SendMessageDialog } from './SendMessageDialog';

interface Props {
  subheader?: string;
}

const formatDate = (value: string) => new Date(value).toLocaleString('fr-FR');

const counterpartLabel = (message: Message) =>
  message.direction === 'sent'
    ? `À : ${message.recipient?.full_name ?? '—'}`
    : `De : ${message.sender?.full_name ?? '—'}`;

export function MessagesInbox({ subheader }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<{ recipient: MessageRecipient; subject: string } | undefined>(undefined);
  const [opened, setOpened] = useState<Message | null>(null);

  const loadInbox = useCallback(() => {
    setLoading(true);
    messagingService
      .inbox()
      .then((response) => {
        setMessages(response.data);
        setUnreadCount(response.meta?.unread_count ?? 0);
        setError(null);
      })
      .catch(() => setError('Impossible de charger les messages.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  const openMessage = async (message: Message) => {
    setOpened(message);

    try {
      const fresh = await messagingService.show(message.id);

      setOpened(fresh);

      if (message.direction === 'received' && !message.read_at) {
        setMessages((list) => list.map((m) => (m.id === fresh.id ? fresh : m)));
        setUnreadCount((count) => Math.max(0, count - 1));
      }
    } catch {
      // Le message déjà affiché depuis la liste reste visible.
    }
  };

  const reply = (message: Message) => {
    setOpened(null);

    if (message.sender) {
      setReplyTo({
        recipient: {
          id: message.sender.id,
          username: message.sender.username ?? '',
          full_name: message.sender.full_name,
          email: null,
          role: null,
        },
        subject: message.subject.startsWith('Re:') ? message.subject : `Re: ${message.subject}`,
      });
    }

    setComposeOpen(true);
  };

  return (
    <Card>
      <CardHeader
        title={
          <Stack direction='row' spacing={1} alignItems='center'>
            <span>Messagerie</span>
            {unreadCount > 0 && <Chip label={`${unreadCount} non lu(s)`} size='small' color='primary' />}
          </Stack>
        }
        subheader={subheader}
        action={
          <Button
            variant='contained'
            onClick={() => {
              setReplyTo(undefined);
              setComposeOpen(true);
            }}
          >
            Nouveau message
          </Button>
        }
      />
      <CardContent>
        {error && <Alert severity='error'>{error}</Alert>}
        {loading && <CircularProgress size={24} />}
        {!loading && !error && messages.length === 0 && <Alert severity='info'>Aucun message.</Alert>}
        <List>
          {messages.map((m) => {
            const isUnread = m.direction === 'received' && !m.read_at;

            return (
              <ListItemButton key={m.id} divider onClick={() => openMessage(m)}>
                <ListItemText
                  primary={m.subject}
                  primaryTypographyProps={{ fontWeight: isUnread ? 700 : 400 }}
                  secondary={`${counterpartLabel(m)} · ${formatDate(m.created_at)} — ${m.body.slice(0, 120)}${
                    m.body.length > 120 ? '…' : ''
                  }`}
                />
                {m.direction === 'sent' ? (
                  <Chip label='Envoyé' size='small' variant='outlined' />
                ) : (
                  <Chip label={isUnread ? 'Non lu' : 'Lu'} size='small' color={isUnread ? 'primary' : 'default'} />
                )}
              </ListItemButton>
            );
          })}
        </List>
      </CardContent>

      <Dialog open={opened !== null} onClose={() => setOpened(null)} maxWidth='sm' fullWidth>
        {opened && (
          <>
            <DialogTitle>{opened.subject}</DialogTitle>
            <DialogContent>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                {counterpartLabel(opened)} · {formatDate(opened.created_at)}
              </Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>{opened.body}</Typography>
            </DialogContent>
            <DialogActions>
              {opened.direction === 'received' && opened.sender && (
                <Button onClick={() => reply(opened)}>Répondre</Button>
              )}
              <Button onClick={() => setOpened(null)}>Fermer</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <SendMessageDialog
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSent={loadInbox}
        defaultRecipient={replyTo?.recipient}
        defaultSubject={replyTo?.subject}
      />
    </Card>
  );
}
