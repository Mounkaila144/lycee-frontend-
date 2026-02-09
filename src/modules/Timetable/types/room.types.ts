// room.types.ts

export type RoomType =
  | 'Amphithéâtre'
  | 'Salle TD'
  | 'Salle TP'
  | 'Laboratoire Informatique'
  | 'Laboratoire Sciences';

export interface Room {
  id: number;
  code: string;
  name: string;
  type: RoomType;
  capacity: number;
  building?: string;
  floor?: string;
  equipment: string[];
  is_available: boolean;
  unavailable_reason?: string;
  unavailable_from?: string;
  unavailable_to?: string;
  occupation_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateRoomRequest {
  code: string;
  name: string;
  type: RoomType;
  capacity: number;
  building?: string;
  floor?: string;
  equipment?: string[];
}

export interface UpdateRoomRequest extends Partial<CreateRoomRequest> {
  id: number;
}

export interface RoomFilters {
  type?: RoomType;
  capacity_min?: number;
  building?: string;
  is_available?: boolean;
  search?: string;
}

export interface BlockRoomRequest {
  reason: string;
  from: string;
  to: string;
}

export interface RoomOccupationDay {
  slots_count: number;
  hours_occupied: number;
  slots: Array<{
    time: string;
    module: string;
    teacher: string;
    group: string;
  }>;
}

export type RoomOccupationReport = Record<string, RoomOccupationDay>;

export interface RoomSuggestion {
  id: number;
  name: string;
  capacity: number;
  type: RoomType;
  capacity_match: boolean;
  capacity_warning: boolean;
}

export const ROOM_TYPES: RoomType[] = [
  'Amphithéâtre',
  'Salle TD',
  'Salle TP',
  'Laboratoire Informatique',
  'Laboratoire Sciences',
];

export const EQUIPMENT_OPTIONS = [
  'Projecteur',
  'Tableau interactif',
  'Climatisation',
  'Ordinateurs',
  'Microphone',
  'Caméra',
];
