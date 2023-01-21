-- CreateTable
CREATE TABLE "UserCourseRegistration" (
    "userId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "course" TEXT NOT NULL,
    CONSTRAINT "UserCourseRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserExamResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "subjectName" TEXT NOT NULL,
    "result" REAL NOT NULL,
    CONSTRAINT "UserExamResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserExamResult" ("id", "result", "subjectName", "userId") SELECT "id", "result", "subjectName", "userId" FROM "UserExamResult";
DROP TABLE "UserExamResult";
ALTER TABLE "new_UserExamResult" RENAME TO "UserExamResult";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
