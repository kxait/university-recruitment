/*
  Warnings:

  - The primary key for the `UserCourseRegistration` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `UserCourseRegistration` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserCourseRegistration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "course" TEXT NOT NULL,
    CONSTRAINT "UserCourseRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserCourseRegistration" ("course", "userId") SELECT "course", "userId" FROM "UserCourseRegistration";
DROP TABLE "UserCourseRegistration";
ALTER TABLE "new_UserCourseRegistration" RENAME TO "UserCourseRegistration";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
