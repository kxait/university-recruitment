import type { User } from "@prisma/client";

import { dbClient } from "~/db.server";
import { RecruitmentStatus, UserType } from "enum/enum";

export type { User } from "@prisma/client";

export interface ExamResultForRegistration {
  subjectName: string;
  result: number;
}

export interface CourseRegistrationForRegistration {
  course: string;
}

export async function getUserById(id: User["id"]) {
  return dbClient.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return dbClient.user.findUnique({ where: { email } });
}

export async function createUser(
  email: User["email"],
  password: string,
  role: UserType
) {
  //const hashedPassword = await bcrypt.hash(password, 10);

  return dbClient.user.create({
    data: {
      email,
      password: password,
      userType: role,
    },
  });
}

export async function createExamRegistration(
  email: string,
  password: string,
  address: string,
  finishedSchool: string,
  pesel: string,
  examResults: ExamResultForRegistration[],
  courseRegistrations: CourseRegistrationForRegistration[]
) {
  const emailExists = await dbClient.user.findUnique({
    where: { email },
  });

  if (emailExists != null) {
    return { error: "użytkownik o takim e-mail już istnieje!", data: null };
  }

  const user = await dbClient.user.create({
    data: {
      email,
      password,
      userType: UserType.USER,
    },
  });
  await dbClient.userRecruitment.create({
    data: {
      userId: user.id,
      address,
      finishedSchool,
      name: email,
      paid: false,
      pesel,
    },
  });
  await Promise.all(
    courseRegistrations.map(async (element) => {
      await dbClient.userCourseRegistration.create({
        data: {
          course: element.course,
          recruitmentStatus: RecruitmentStatus.NEW as string,
          userId: user.id,
        },
      });
    })
  );
  await Promise.all(
    examResults.map(async (element) => {
      await dbClient.userExamResult.create({
        data: {
          subjectName: element.subjectName,
          result: element.result,
          userId: user.id,
        },
      });
    })
  );

  return {
    error: null,
    data: await dbClient.user.findUnique({
      where: { id: user.id },
      include: {
        userCourseRegistrations: true,
        userExamResults: true,
        userRecruitment: true,
      },
    }),
  };
}

export async function deleteUserByEmail(email: User["email"]) {
  return dbClient.user.delete({ where: { email } });
}

export async function verifyLogin(
  email: User["email"],
  password: User["password"]
) {
  const userWithPassword = await dbClient.user.findUnique({
    where: { email },
  });

  if (!userWithPassword) {
    return null;
  }

  const isValid = password === userWithPassword.password; //await bcrypt.compare(password, userWithPassword.passwordHash);

  if (!isValid) {
    return null;
  }

  const { /*passwordHash*/ password: _password, ...userWithoutPassword } =
    userWithPassword;

  return userWithoutPassword;
}

export function getAllDataAboutUser(userId: number) {
  return dbClient.user.findUnique({
    where: { id: userId },
    include: {
      userRecruitment: true,
      userExamResults: true,
      userCourseRegistrations: true,
      administrator: true,
    },
  });
}

export function getAllEveryRecruit() {
  return dbClient.user.findMany({
    where: { userType: UserType.USER as string },
    include: {
      userRecruitment: true,
      userCourseRegistrations: true,
      userExamResults: true,
    },
  });
}
