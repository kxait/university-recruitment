import { UserExamResult } from ".prisma/client";
import { Request } from "@remix-run/node";
import { RecruitmentStatus, UserType } from "enum/enum";
import { Course } from "enum/enum";
import { dbClient } from "~/db.server";
import { requireUserWithType } from "~/session.server";

export function setUserRecruitmentStatusForCourse(
  userId: number,
  course: Course,
  status: RecruitmentStatus
) {
  return dbClient.userCourseRegistration.updateMany({
    where: { userId, course },
    data: { recruitmentStatus: status as string },
  });
}

function getCourseExamAllocations(course: Course): string[] {
  return {
    [Course.COMPUTER_SCIENCE]: ["informatyka", "matematyka"],
    [Course.ENGINEERING]: ["matematyka"],
    [Course.MATHEMATICS]: ["matematyka"],
  }[course];
}

function getUserExamResultsForSubject(
  results: UserExamResult[],
  subject: string
) {
  return results.find((result) => result.subjectName === subject)?.result ?? 0;
}

export async function getUserRecruitmentScores(
  userId: number
) /*: Promise<{ [key: Course]: double }>*/ {
  const examResults = await dbClient.userExamResult.findMany({
    where: { userId },
  });

  const registrations = await dbClient.userCourseRegistration.findMany({
    where: { userId },
  });

  const sus = registrations
    .map((x) => ({
      course: x.course,
      exams: getCourseExamAllocations(x.course as Course),
    }))
    .map((x) => ({
      course: x.course,
      examPoints: x.exams.map((exam) => ({
        exam,
        result: getUserExamResultsForSubject(examResults, exam),
      })),
    }))
    .map((x) => ({
      course: x.course,
      score: (() => {
        const scores = x.examPoints.map((y) => y.result);
        return scores.reduce((sum, cur) => sum + cur, 0) / scores.length;
      })(),
    }))
    .map((x) => [x.course, x.score]);

  return Object.fromEntries(sus) as { [key: string]: number };
}

export async function getDataForReport() {
  const data = await dbClient.user.findMany({
    include: {
      userCourseRegistrations: true,
      userExamResults: true,
      userRecruitment: true,
    },
  });

  const getScoreForUserAndExam = async (userId: number, course: Course) => {
    const scores = await getUserRecruitmentScores(userId);
    return scores[course as string];
  };

  const formatted = await Promise.all(
    data.map(async (user) => ({
      ...user,
      userCourseRegistrations: await Promise.all(
        user.userCourseRegistrations.map(async (course) => ({
          ...course,
          score: await getScoreForUserAndExam(user.id, course.course as Course),
        }))
      ),
    }))
  );

  return formatted;
}
