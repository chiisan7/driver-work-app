/*
  Warnings:

  - You are about to drop the column `created_at` on the `shifts` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `shifts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."shifts" DROP CONSTRAINT "shifts_route_id_fkey";

-- AlterTable
ALTER TABLE "public"."shifts" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ALTER COLUMN "route_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "initial_rota_date" DATE,
ADD COLUMN     "initial_rota_position" INTEGER,
ADD COLUMN     "rota_id" INTEGER;

-- CreateTable
CREATE TABLE "public"."rotas" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "rotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shift_templates" (
    "id" SERIAL NOT NULL,
    "rota_id" INTEGER NOT NULL,
    "day_category" "public"."DayCategory" NOT NULL,
    "rota_position" INTEGER NOT NULL,
    "shiftName" TEXT NOT NULL,
    "startTime" TIME,
    "endTime" TIME,
    "is_day_off" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "shift_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rotas_name_key" ON "public"."rotas"("name");

-- CreateIndex
CREATE UNIQUE INDEX "shift_templates_rota_id_day_category_rota_position_key" ON "public"."shift_templates"("rota_id", "day_category", "rota_position");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_rota_id_fkey" FOREIGN KEY ("rota_id") REFERENCES "public"."rotas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shifts" ADD CONSTRAINT "shifts_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shift_templates" ADD CONSTRAINT "shift_templates_rota_id_fkey" FOREIGN KEY ("rota_id") REFERENCES "public"."rotas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
