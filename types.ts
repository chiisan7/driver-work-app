// =======================================================
// このファイルがプロジェクト唯一の型定義の正となります
// =======================================================

export type DayCategory = 'WEEKDAY' | 'SATURDAY' | 'HOLIDAY';

export interface User {
  id: number;
  name: string;
  employeeCode: string;
}

export interface Route {
  id: number;
  name:string;
}

// Vehicle（車両）の概念は完全に削除します

export interface ShiftWithDetails {
  // --- 必須プロパティ ---
  id: number;
  workDate: string;
  dayCategory: DayCategory;
  shiftNumber: string;
  note: string | null;

  // --- 時刻関連 ---
  startTime1: string | null;
  endTime1: string | null;
  startTime2: string | null;
  endTime2: string | null;
  
  // --- 関連ID ---
  userId: number | null;
  routeId: number | null;
  
  // --- 関連オブジェクト ---
  route: Route | null;
}