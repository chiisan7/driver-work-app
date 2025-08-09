import { useState, useEffect, useCallback } from 'react';
import { User, ShiftWithDetails } from '../types.js'; // 型をインポート
import { api } from '../services/api.js'; // apiサービスをインポート

export function useShifts(user: User) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shifts, setShifts] = useState<ShiftWithDetails[]>([]);
  const [todayShift, setTodayShift] = useState<ShiftWithDetails | null>(null);
  const [isTodayShiftLoading, setTodayShiftLoading] = useState(true);

  // カレンダー用の月間シフトを取得するロジック
  const fetchCalendarShifts = useCallback(() => {
    if (!user) return;
    const year = currentDate.getFullYear();
    // ★ api.tsに合わせて、月は1-12で渡す（または0-11に合わせる）
    const month = currentDate.getMonth() + 1; 

    api.getShiftsForMonth(user.id, year, month)
      .then(setShifts)
      .catch(console.error);
  }, [user, currentDate]);

  // 今日のシフトを取得するロジック
  const fetchTodayShift = useCallback(() => {
    if (!user) return;
    setTodayShiftLoading(true);
    
    api.getShiftForDate(user.id, new Date())
      .then(shift => {
        if (shift) {
          setTodayShift(shift);
        } else {
          setTodayShift({
            id: 0,
            userId: user.id,
            workDate: new Date().toISOString(),
            dayCategory: 'HOLIDAY',
            shiftNumber: '公休',
            note: '休み', // 休日判定に使う
            
            // 必須だが値がないものはnullにする
            startTime1: null,
            endTime1: null,
            startTime2: null,
            endTime2: null,
            routeId: null,
            route: null,
          });
        }
      })
      .catch(console.error)
      .finally(() => setTodayShiftLoading(false));
  }, [user]);

  // currentDateが変更されたら、カレンダーのシフトを再取得
  useEffect(() => {
    fetchCalendarShifts();
  }, [fetchCalendarShifts]);

  // コンポーネントのマウント時に、今日のシフトを一度だけ取得
  useEffect(() => {
    fetchTodayShift();
  }, [fetchTodayShift]);

  return {
    currentDate,
    setCurrentDate,
    shifts,
    todayShift,
    isTodayShiftLoading,
  };
}