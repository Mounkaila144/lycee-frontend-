export interface MessageParticipant {
  id: number;
  username: string | null;
  full_name: string;
}

export interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  thread_id: number | null;
  student_context_id: number | null;
  subject: string;
  body: string;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  direction: 'sent' | 'received';
  sender: MessageParticipant | null;
  recipient: MessageParticipant | null;
}

export interface InboxResponse {
  data: Message[];
  meta: { unread_count: number };
}

export interface MessageInput {
  recipient_id: number;
  subject: string;
  body: string;
  thread_id?: number;
  student_context_id?: number;
}

export interface MessageRecipient {
  id: number;
  username: string;
  full_name: string;
  email: string | null;
  role: string | null;
}
