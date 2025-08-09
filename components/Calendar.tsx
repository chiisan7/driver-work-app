import React, { useMemo } from 'react';
import { ShiftWithDetails } from '../types.js';
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon } from './icons.js';

interface CalendarProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  shifts: ShiftWithDetails[];
  onDateClick: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ currentDate, setCurrentDate, shifts, onDateClick }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const shiftsByDate = useMemo(() => {
    const map: { [key: string]: ShiftWithDetails } = {};
    shifts.forEach(shift => {
      map[shift.work_date] = shift;
    });
    return map;
  }, [shifts]);

  const handleExportCSV = () => {
    const headers = ['日付', '曜日', 'ステータス', '勤務時間', '担当路線', '車両番号', '備考'];

    const escapeCSV = (str: string | null | undefined): string => {
        if (str === null || str === undefined) return '';
        const needsQuotes = str.includes(',') || str.includes('"') || str.includes('\n');
        // Excel can be picky about newlines, so we wrap in quotes and double up existing quotes.
        const escapedStr = str.replace(/"/g, '""');
        return needsQuotes ? `"${escapedStr}"` : escapedStr;
    };

    const rows = [];
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = date.toISOString().split('T')[0];
        const shift = shiftsByDate[dateString];
        
        const rowData = [
            `${year}/${String(month + 1).padStart(2, '0')}/${String(day).padStart(2, '0')}`,
            weekDays[date.getDay()],
        ];

        if (shift?.is_holiday) {
            rowData.push('休日', '', '', '', '');
        } else if (shift) {
            rowData.push(
                '勤務',
                `${shift.start_time || ''} - ${shift.end_time || ''}`,
                escapeCSV(shift.route?.name),
                escapeCSV(shift.note)
            );
        } else {
            rowData.push('未設定', '', '', '', '');
        }
        rows.push(rowData.join(','));
    }

    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // Add BOM for UTF-8 Excel compatibility
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `shift_${year}_${String(month + 1).padStart(2, '0')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderDays = () => {
    const days = [];
    // empty cells for days before the start of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="border-r border-b border-gray-200"></div>);
    }

    // cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const shift = shiftsByDate[dateString];

      let dayClass = 'text-center p-1 cursor-pointer border-r border-b border-gray-200 transition-colors duration-200';

      if (date.getDay() === 0) dayClass += ' text-red-600'; // Sunday
      if (date.getDay() >= 1 && date.getDay() <= 5) dayClass += ' text-black';// 月曜日から金曜日までの処理
      if (date.getDay() === 6) dayClass += ' text-blue-600'; // Saturday
      
      let content;
      if (shift) {
        if (shift.is_holiday) {
          dayClass += ' bg-gray-100 hover:bg-gray-200';
          content = <span className="text-base font-bold text-blue-500">休</span>;
        } else {
          dayClass += ' bg-green-50 hover:bg-green-100';
          content = (
            <p className="text-[11px] leading-tight font-semibold text-green-900 break-words">
              {shift.route?.name || '担当なし'}
            </p>
          );
        }
      } else {
        dayClass += ' hover:bg-gray-100';
      }

      days.push(
        <div key={day} className={`${dayClass} min-h-[7rem] flex flex-col`} onClick={() => onDateClick(date)}>
          <span className="text-sm">{day}</span>
          <div className="flex-grow flex items-center justify-center mt-1">{content}</div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
            <h2 className="text-xl font-bold text-gray-800">
                {`${year}年 ${month + 1}月`}
            </h2>
            <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-200 transition ml-4">
            <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
            </button>
            <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-200 transition">
            <ChevronRightIcon className="w-6 h-6 text-gray-600" />
            </button>
        </div>
        <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 text-sm px-3 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all"
            aria-label="CSV形式でダウンロード"
        >
            <DownloadIcon className="w-5 h-5" />
            <span>CSV出力</span>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-px bg-gray-200 border-t border-l border-gray-200">
        {weekDays.map((day, index) => (
          <div key={day} className={`text-center py-2 text-sm font-semibold text-gray-600 bg-gray-50
            ${index === 0 ? 'text-red-600' : ''}
            ${index === 6 ? 'text-blue-600' : ''}
          `}>
            {day}
          </div>
        ))}
        {renderDays()}
      </div>
    </div>
  );
};

export default Calendar;