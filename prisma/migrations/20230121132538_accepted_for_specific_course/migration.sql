/*
  Warnings:

  - You are about to drop the column `recruitmentStatus` on the `UserRecruitment` table. All the data in the column will be lost.
  - Added the required column `recruitmentStatus` to the `UserCourseRegistration` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserRecruitment" (
    "userId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "finishedSchool" TEXT NOT NULL,
    "pesel" TEXT NOT NULL,
    "paid" BOOLEAN NOT NULL,
    CONSTRAINT "UserRecruitment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserRecruitment" ("address", "finishedSchool", "name", "paid", "pesel", "userId") SELECT "address", "finishedSchool", "name", "paid", "pesel", "userId" FROM "UserRecruitment";
DROP TABLE "UserRecruitment";
ALTER TABLE "new_UserRecruitment" RENAME TO "UserRecruitment";
CREATE TABLE "new_UserCourseRegistration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "course" TEXT NOT NULL,
    "recruitmentStatus" TEXT NOT NULL,
    CONSTRAINT "UserCourseRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserCourseRegistration" ("course", "id", "userId") SELECT "course", "id", "userId" FROM "UserCourseRegistration";
DROP TABLE "UserCourseRegistration";
ALTER TABLE "new_UserCourseRegistration" RENAME TO "UserCourseRegistration";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
