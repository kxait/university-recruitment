/*
  Warnings:

  - Added the required column `id` to the `UserExamResult` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserExamResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "subjectName" TEXT NOT NULL,
    "result" REAL NOT NULL,
    CONSTRAINT "UserExamResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserRecruitment" ("userId") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserExamResult" ("result", "subjectName", "userId") SELECT "result", "subjectName", "userId" FROM "UserExamResult";
DROP TABLE "UserExamResult";
ALTER TABLE "new_UserExamResult" RENAME TO "UserExamResult";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
