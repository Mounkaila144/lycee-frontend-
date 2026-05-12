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
}

export interface MessageInput {
  recipient_id: number;
  subject: string;
  body: string;
  thread_id?: number;
  student_context_id?: number;
}
