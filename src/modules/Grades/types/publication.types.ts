/**
 * Publication Types
 * Types for results publication management
 */

export type PublicationType = 'semester' | 'module' | 'final';
export type PublicationScope = 'all' | 'validated' | 'failed';
export type PublicationStatus = 'draft' | 'published' | 'revoked';

/**
 * Publication record
 */
export interface PublicationRecord {
  id: number;
  semester_id: number;
  type: PublicationType;
  scope: PublicationScope;
  status: PublicationStatus;
  status_label?: string;
  published_at: string | null;
  published_by: number | null;
  published_by_name?: string;
  revoked_at: string | null;
  revoked_by: number | null;
  notify_students: boolean;
  students_count: number;
  notification_count: number;
  success_rate: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  semester?: {
    id: number;
    name: string;
  };
}

/**
 * Can publish response - prerequisites check
 */
export interface CanPublishResponse {
  can_publish: boolean;
  reasons: string[];
  total_results: number;
  final_results: number;
  unpublished_count: number;
}

/**
 * Publish request
 */
export interface PublishRequest {
  type: PublicationType;
  scope: PublicationScope;
  notify_students: boolean;
  notes?: string;
}

/**
 * Publication filters
 */
export interface PublicationFilters {
  type?: PublicationType;
  status?: PublicationStatus;
  semester_id?: number;
}

/**
 * Publication status summary for a semester
 */
export interface PublicationStatusSummary {
  semester_id: number;
  total_results: number;
  final_results: number;
  published_results: number;
  unpublished_results: number;
  provisional_results: number;
  is_fully_published: boolean;
  publication_percentage: number;
}

/**
 * Publication history entry
 */
export interface PublicationHistoryEntry {
  id: number;
  action: 'published' | 'revoked';
  type: PublicationType;
  scope: PublicationScope;
  students_count: number;
  performed_at: string;
  performed_by: string;
  notes: string | null;
}
