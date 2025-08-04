import { User, Shift, Route, Vehicle, ShiftWithDetails } from '../types';

// --- Mock Database ---

const MOCK_USERS: User[] = [
  { id: 1, employee_code: '12345', name: '鈴木 一郎' },
  { id: 2, employee_code: '67890', name: '佐藤 花子' },
];

const MOCK_ROUTES: Route[] = [
  { id: 1, name: '霧丘3B', description: '8番' },
  { id: 2, name: '黒原23T', description: '27番' },
  { id: 3, name: '折尾23(BRT)', description: '1番' },
  { id: 4, name: '黒崎5', description: '22番' },
];

const MOCK_VEHICLES: Vehicle[] = [
  { id: 1, vehicle_number: '1227', model: 'いすゞ・エルガ' },
  { id: 2, vehicle_number: '9222', model: '日産ディーゼル' },
  { id: 3, vehicle_number: '0203', model: 'ベンツ・シターロ' },
  { id: 4, vehicle_number: '9353', model: '日産ディーゼル' },
];

const MOCK_SHIFTS: Shift[] = [];

// --- Helper function to shuffle an array (Fisher-Yates) ---
const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


// Procedurally generate shifts for one user for 3 months (current, prev, next)
const generateShifts = () => {
  if (MOCK_SHIFTS.length > 0) return;
  const user = MOCK_USERS[0];
  const today = new Date();
  
  for (let m = -1; m <= 1; m++) {
      const date = new Date(today.getFullYear(), today.getMonth() + m, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // --- Generate 8 random holidays for the month ---
      const allDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      const shuffledDays = shuffleArray(allDays);
      const holidayDays = new Set(shuffledDays.slice(0, 8));
      // ---

      for (let day = 1; day <= daysInMonth; day++) {
        const workDate = new Date(year, month, day);
        const shiftId = (month + 1) * 100 + day;
        const isHoliday = holidayDays.has(day); // Check if the current day is a random holiday

        if (isHoliday) {
          MOCK_SHIFTS.push({
            id: shiftId,
            user_id: user.id,
            work_date: workDate.toISOString().split('T')[0],
            is_holiday: true,
            start_time: null,
            end_time: null,
            route_id: null,
            vehicle_id: null,
            note: null,
          });
        } else {
          const route = MOCK_ROUTES[day % MOCK_ROUTES.length];
          const vehicle = MOCK_VEHICLES[day % MOCK_VEHICLES.length];
          const startHour = 7 + (day % 3);
          const endHour = startHour + 9;
          MOCK_SHIFTS.push({
            id: shiftId,
            user_id: user.id,
            work_date: workDate.toISOString().split('T')[0],
            is_holiday: false,
            start_time: `${String(startHour).padStart(2, '0')}:00`,
            end_time: `${String(endHour).padStart(2, '0')}:00`,
            route_id: route.id,
            vehicle_id: vehicle.id,
            note: `昼休憩: 12:00-13:00 (本社食堂)\n夕方休憩: 15:30-15:45 (終点待機場)`,
          });
        }
      }
  }
};

generateShifts();

// --- Mock API Functions ---

const SIMULATED_DELAY = 500;

export const api = {
  login: (employeeCode: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = MOCK_USERS.find(u => u.employee_code === employeeCode);
        if (user && password === 'password') { // Simplified password check
          resolve(user);
        } else {
          reject(new Error('社員コードまたはパスワードが正しくありません。'));
        }
      }, SIMULATED_DELAY);
    });
  },

  getShiftsForMonth: (userId: number, year: number, month: number): Promise<ShiftWithDetails[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userShifts = MOCK_SHIFTS.filter(shift => {
          const shiftDate = new Date(shift.work_date);
          return shift.user_id === userId &&
                 shiftDate.getFullYear() === year &&
                 shiftDate.getMonth() === month;
        });

        const shiftsWithDetails: ShiftWithDetails[] = userShifts.map(shift => ({
          ...shift,
          route: MOCK_ROUTES.find(r => r.id === shift.route_id) || null,
          vehicle: MOCK_VEHICLES.find(v => v.id === shift.vehicle_id) || null,
        }));
        
        resolve(shiftsWithDetails);
      }, SIMULATED_DELAY);
    });
  },

  getShiftForDate: (userId: number, date: Date): Promise<ShiftWithDetails | null> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const dateString = date.toISOString().split('T')[0];
            const shift = MOCK_SHIFTS.find(s => s.user_id === userId && s.work_date === dateString);

            if (shift) {
                const shiftWithDetails: ShiftWithDetails = {
                    ...shift,
                    route: MOCK_ROUTES.find(r => r.id === shift.route_id) || null,
                    vehicle: MOCK_VEHICLES.find(v => v.id === shift.vehicle_id) || null,
                };
                resolve(shiftWithDetails);
            } else {
                resolve(null);
            }
        }, SIMULATED_DELAY / 2); // Faster response for single item
    });
  },
};