import type { User } from "@prisma/client";

import { dbClient } from "~/db.server";
import { UserType } from "enum/enum";

export type { User } from "@prisma/client";

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
