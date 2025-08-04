
export interface User {
  id: number;
  employee_code: string;
  name: string;
}

export interface Route {
  id: number;
  name: string;
  description: string;
}

export interface Vehicle {
  id: number;
  vehicle_number: string;
  model: string;
}

export interface Shift {
  id: number;
  user_id: number;
  work_date: string; // YYYY-MM-DD
  start_time: string | null; // HH:mm
  end_time: string | null; // HH:mm
  route_id: number | null;
  vehicle_id: number | null;
  note: string | null;
  is_holiday: boolean;
}

export interface ShiftWithDetails extends Shift {
  route: Route | null;
  vehicle: Vehicle | null;
}
