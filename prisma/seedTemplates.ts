import { PrismaClient, DayCategory } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('--- Start seeding shift templates ---');

  // 1. "輪番表1" を作成 (存在すれば何もしない)
  const rota1 = await prisma.rota.upsert({
    where: { name: '輪番表1' },
    update: {},
    create: { name: '輪番表1' },
  });
  console.log(`Ensured Rota "${rota1.name}" exists.`);

  // 2. JSONからテンプレートデータを読み込み
  const jsonPath = path.join(__dirname, '..', 'data', 'rota1-templates.json');
  const templatesData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  // 3. テンプレートをDBに登録 (存在すれば更新、なければ作成)
  for (const t of templatesData) {
    await prisma.shiftTemplate.upsert({
      where: {
        rotaId_dayCategory_rotaPosition: {
          rotaId: rota1.id,
          dayCategory: t.dayCategory as DayCategory,
          rotaPosition: t.rotaPosition,
        }
      },
      update: {
        shiftName: t.shiftName,
        startTime: t.startTime ? new Date(`1970-01-01T${t.startTime}:00`) : null,
        endTime: t.endTime ? new Date(`1970-01-01T${t.endTime}:00`) : null,
        isDayOff: t.isDayOff,
      },
      create: {
        rotaId: rota1.id,
        dayCategory: t.dayCategory,
        rotaPosition: t.rotaPosition,
        shiftName: t.shiftName,
        startTime: t.startTime ? new Date(`1970-01-01T${t.startTime}:00`) : null,
        endTime: t.endTime ? new Date(`1970-01-01T${t.endTime}:00`) : null,
        isDayOff: t.isDayOff,
      },
    });
  }
  console.log(`Seeded ${templatesData.length} templates for "${rota1.name}".`);
  console.log('--- Seeding shift templates finished ---');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });