import { useState, useEffect, useCallback } from 'react';
import { User, ShiftWithDetails } from '../types';
import { api } from '../services/api';

export const useShifts = (user: User) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shifts, setShifts] = useState<ShiftWithDetails[]>([]);
  const [isCalendarLoading, setCalendarLoading] = useState(true);
  const [todayShift, setTodayShift] = useState<ShiftWithDetails | null>(null);
  const [isTodayShiftLoading, setTodayShiftLoading] = useState(true);

  const fetchCalendarShifts = useCallback(() => {
    setCalendarLoading(true);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    api.getShiftsForMonth(user.id, year, month)
      .then(setShifts)
      .catch(console.error)
      .finally(() => setCalendarLoading(false));
  }, [user.id, currentDate]);

  useEffect(() => {
    setTodayShiftLoading(true);
    api.getShiftForDate(user.id, new Date())
      .then(shift => {
        if (shift) {
          setTodayShift(shift);
        } else {
          setTodayShift({
            id: 0, user_id: user.id, work_date: new Date().toISOString().split('T')[0], is_holiday: true,
            start_time: null, end_time: null, route_id: null, vehicle_id: null, note: null,
            route: null, vehicle: null
          });
        }
      })
      .catch(console.error)
      .finally(() => setTodayShiftLoading(false));
  }, [user.id]);

  useEffect(() => {
    fetchCalendarShifts();
  }, [fetchCalendarShifts]);

  return {
    currentDate,
    setCurrentDate,
    shifts,
    isCalendarLoading,
    todayShift,
    isTodayShiftLoading,
  };
};
