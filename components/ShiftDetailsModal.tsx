import React from 'react';
import { ShiftWithDetails } from '../types.js';
import { CalendarIcon, ClockIcon, RouteIcon, BusIcon, NoteIcon } from './icons.js';

interface ShiftDetailsModalProps {
  shift: ShiftWithDetails | null;
  onClose: () => void;
  selectedDate: Date;
}

const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode; isNote?: boolean }> = ({ icon, label, value, isNote = false }) => (
    <div className="flex items-start space-x-4 py-3">
        <div className="flex-shrink-0 w-6 h-6 text-gray-500">{icon}</div>
        <div className="flex-1">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            {isNote ? (
                 <p className="text-base text-gray-800 whitespace-pre-wrap">{value}</p>
            ) : (
                 <p className="text-lg font-semibold text-gray-900">{value}</p>
            )}
        </div>
    </div>
);


const ShiftDetailsModal: React.FC<ShiftDetailsModalProps> = ({ shift, onClose, selectedDate }) => {
  if (!shift) return null;

  const formattedDate = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(selectedDate);
  
  // ★ 時刻をフォーマットするヘルパー関数を追加
  const formatTime = (time: string | null) => {
    if (!time) return '';
    return new Date(time).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
        onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto transform transition-all duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
            <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">シフト詳細</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition text-3xl leading-none">&times;</button>
            </div>
            
            <div className="space-y-2 divide-y divide-gray-200">
                <DetailRow icon={<CalendarIcon className="w-6 h-6" />} label="日付" value={formattedDate} />

                {/* ★★★ 休日判定を shift.note === '休み' に変更 ★★★ */}
                {shift.note === '休み' ? (
                    <div className="pt-4">
                        <p className="text-center text-xl font-bold text-blue-600 py-8">本日程はお休みです</p>
                    </div>
                ) : (
                    <>
                        {/* ★★★ プロパティ名を新しいスキーマに合わせる ★★★ */}
                        <DetailRow icon={<ClockIcon className="w-6 h-6" />} label="勤務時間" value={`${formatTime(shift.startTime1)} - ${formatTime(shift.endTime1)}`} />
                        <DetailRow icon={<RouteIcon className="w-6 h-6" />} label="路線 / 乗番" value={`${shift.route?.name || '未割り当て'} / ${shift.shiftNumber}`} />
                        <DetailRow 
                          icon={<NoteIcon className="w-6 h-6" />} 
                          label="備考" 
                          value={shift.note || '特記事項なし'} // noteは休日判定に使ったので、それ以外の情報が入る
                          isNote={true} 
                        />
                    </>
                )}
            </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl text-right">
             <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition"
            >
                閉じる
            </button>
        </div>
      </div>
       {/* アニメーション用のスタイルは削除しました（Tailwind CSSで代替可能） */}
    </div>
  );
};

export default ShiftDetailsModal;