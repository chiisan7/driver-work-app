import React, { useState, useCallback } from 'react';
import { User, ShiftWithDetails } from '../types';
import Header from './Header';
import Calendar from './Calendar';
import ShiftDetailsModal from './ShiftDetailsModal';
import { ClockIcon, RouteIcon, BusIcon, NoteIcon } from './icons';
import { useShifts } from '../hooks/useShifts';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: string | React.ReactNode}> = ({ icon, label, value }) => (
    <div className="flex items-center space-x-3 text-sm">
        <div className="flex-shrink-0 w-5 h-5 text-gray-500">{icon}</div>
        <span className="font-medium text-gray-600 w-20">{label}</span>
        <span className="text-gray-800 font-semibold">{value}</span>
    </div>
);

const TodayShiftCard: React.FC<{ shift: ShiftWithDetails | null, isLoading: boolean, onClick: () => void }> = React.memo(({ shift, isLoading, onClick }) => {
    const today = new Date();
    const formattedDate = new Intl.DateTimeFormat('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' }).format(today);

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 cursor-pointer hover:shadow-xl transition-shadow" onClick={onClick}>
            <h2 className="text-lg font-bold text-gray-800 mb-4">
                本日のシフト ({formattedDate})
            </h2>
            {isLoading ? (
                <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
            ) : shift && !shift.is_holiday ? (
                <div className="space-y-4">
                    <DetailItem icon={<ClockIcon />} label="勤務時間" value={`${shift.start_time} - ${shift.end_time}`} />
                    <DetailItem icon={<RouteIcon />} label="担当路線" value={shift.route?.name || 'N/A'} />
                    <DetailItem icon={<BusIcon />} label="車両番号" value={shift.vehicle?.vehicle_number || 'N/A'} />
                    <DetailItem 
                        icon={<NoteIcon />} 
                        label="備考" 
                        value={<span className="text-xs whitespace-pre-wrap">{shift.note || '特記事項なし'}</span>} 
                    />
                </div>
            ) : (
                <div className="flex items-center justify-center h-24 bg-blue-50 rounded-lg">
                    <p className="text-lg font-semibold text-blue-700">本日は休日です</p>
                </div>
            )}
        </div>
    );
});

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const {
    currentDate,
    setCurrentDate,
    shifts,
    todayShift,
    isTodayShiftLoading,
  } = useShifts(user);

  const [selectedShift, setSelectedShift] = useState<ShiftWithDetails | null>(null);
  const [selectedDateForModal, setSelectedDateForModal] = useState<Date | null>(null);

  const handleDateClick = useCallback((date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const shiftForDay = shifts.find(s => s.work_date === dateString);
    if (shiftForDay) {
        setSelectedShift(shiftForDay);
        setSelectedDateForModal(date);
    } else {
        const tempHolidayShift: ShiftWithDetails = {
            id: 0, user_id: user.id, work_date: dateString, is_holiday: true,
            start_time: null, end_time: null, route_id: null, vehicle_id: null, note: null,
            route: null, vehicle: null
        };
        setSelectedShift(tempHolidayShift);
        setSelectedDateForModal(date);
    }
  }, [shifts, user.id]);

  const handleTodayCardClick = useCallback(() => {
    if(todayShift) {
        setSelectedShift(todayShift);
        setSelectedDateForModal(new Date());
    }
  }, [todayShift]);

  const handleCloseModal = useCallback(() => {
    setSelectedShift(null);
    setSelectedDateForModal(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header user={user} onLogout={onLogout} />
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <TodayShiftCard 
            shift={todayShift} 
            isLoading={isTodayShiftLoading} 
            onClick={handleTodayCardClick}
        />
        <Calendar
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          shifts={shifts}
          onDateClick={handleDateClick}
        />
      </main>
      {selectedShift && selectedDateForModal && (
         <ShiftDetailsModal shift={selectedShift} onClose={handleCloseModal} selectedDate={selectedDateForModal} />
      )}
    </div>
  );
};

export default Dashboard;