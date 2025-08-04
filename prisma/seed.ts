import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ShiftData {
  dayType: string;
  routeName: string;
  shiftNumber: string;
  startTime1: string;
  endTime1: string;
  startTime2: string | null;
  endTime2: string | null;
}

/**
 * 24時台の時刻表記に対応し、有効なDateオブジェクトを生成するヘルパー関数
 * @param baseDate 基準日 (例: 1970-01-01)
 * @param timeString 時刻文字列 (例: "24:16")
 * @returns 有効なDateオブジェクト、またはnull
 */
function createDateWithNextDaySupport(baseDate: Date, timeString: string | null): Date | null {
  if (!timeString) {
    return null;
  }

  const baseDateString = baseDate.toISOString().split('T')[0]; // '1970-01-01'

  // 24時台の時刻を翌日の0時台に変換
  if (timeString.startsWith('24:')) {
    const correctedTimeString = timeString.replace('24:', '00:');
    const date = new Date(`${baseDateString}T${correctedTimeString}:00`);
    date.setDate(date.getDate() + 1); // 日付を1日進める
    return date;
  }

  return new Date(`${baseDateString}T${timeString}:00`);
}


async function main() {
  console.log(`--- Seeding process started. ---`);

  // --- 1. 路線マスターの登録 ---
  console.log('Step 1: Seeding routes...');
  const routeNames = [ '枝光', '黒崎', '霧丘', '上重田', '猪倉', '井堀', '折尾', '鞘ヶ谷', '中原', '黒原', 'フリー', '管理代務' ];
  for (const name of routeNames) {
    await prisma.route.upsert({
      where: { name: name },
      update: {},
      create: { name: name, description: `${name}の路線マスターデータ` },
    });
  }
  console.log(`Route seeding finished. ${routeNames.length} routes ensured.`);

  // --- 2. シフトテンプレートの登録 ---
  console.log('Step 2: Seeding shift templates...');
  const jsonPath = path.join(__dirname, '..', 'data', 'shifts.json');
  console.log(`Reading shift data from: ${jsonPath}`);
  
  if (!fs.existsSync(jsonPath)) {
    console.error('ERROR: shifts.json file not found!');
    return;
  }
  const shiftsData: ShiftData[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`Successfully read ${shiftsData.length} shift records.`);

  const templateDate = new Date('1970-01-01');
  let createdCount = 0;

  for (const shift of shiftsData) {
    const route = await prisma.route.findUnique({ where: { name: shift.routeName } });
    if (!route) {
      console.warn(`WARNING: Route named "${shift.routeName}" not found. Skipping.`);
      continue;
    }

    // ★★★ 24時対応のヘルパー関数を使ってデータを登録 ★★★
    await prisma.shift.create({
      data: {
        workDate: templateDate,
        startTime1: createDateWithNextDaySupport(templateDate, shift.startTime1)!,
        endTime1:   createDateWithNextDaySupport(templateDate, shift.endTime1)!,
        startTime2: createDateWithNextDaySupport(templateDate, shift.startTime2),
        endTime2:   createDateWithNextDaySupport(templateDate, shift.endTime2),
        route: { connect: { id: route.id } },
        note: `乗番: ${shift.shiftNumber}, 曜日: ${shift.dayType}`,
        isHoliday: shift.dayType !== '平日',
      },
    });
    createdCount++;
  }

  console.log(`Shift template seeding finished. Created ${createdCount} new shift records.`);
  console.log('--- Seeding process completed successfully! ---');
}

main()
  .catch((e) => {
    console.error('FATAL ERROR: An error occurred during the seeding process.');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Database connection closed.');
  });