import { PrismaClient } from "@prisma/client";
import { Course, RecruitmentStatus, UserType } from "enum/enum";

const prisma = new PrismaClient();

async function seed() {
  await prisma.user.deleteMany({});
  await prisma.administrator.deleteMany({});
  await prisma.userExamResult.deleteMany({});
  await prisma.userRecruitment.deleteMany({});
  await prisma.userCourseRegistration.deleteMany({});

  const user = await prisma.user.create({
    data: {
      email: "rekrutant",
      password: "rekrutant",
      userType: UserType.USER,
    },
  });
  await prisma.userRecruitment.create({
    data: {
      userId: user.id,
      address: "rekrutant adres",
      finishedSchool: "rekrutant szkola",
      name: "rekrutant ladny",
      paid: true,
      pesel: "rekrutant pesel",
    },
  });
  await prisma.userExamResult.create({
    data: {
      userId: user.id,
      subjectName: "matematyka",
      result: 31.3,
    },
  });
  await prisma.userExamResult.create({
    data: {
      userId: user.id,
      subjectName: "polski",
      result: 66.66,
    },
  });
  await prisma.userExamResult.create({
    data: {
      userId: user.id,
      subjectName: "informatyka",
      result: 99.99,
    },
  });
  await prisma.userCourseRegistration.create({
    data: {
      userId: user.id,
      course: Course.COMPUTER_SCIENCE,
      recruitmentStatus: RecruitmentStatus.CONFIRMED,
    },
  });
  await prisma.userCourseRegistration.create({
    data: {
      userId: user.id,
      course: Course.MATHEMATICS,
      recruitmentStatus: RecruitmentStatus.CONFIRMED,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "rekrutant2",
      password: "rekrutant2",
      userType: UserType.USER,
    },
  });
  await prisma.userRecruitment.create({
    data: {
      userId: user2.id,
      address: "rekrutant2 adres",
      finishedSchool: "rekrutant2 szkola",
      name: "rekrutant2 brzydki",
      paid: true,
      pesel: "rekrutant2 pesel",
    },
  });
  await prisma.userExamResult.create({
    data: {
      userId: user2.id,
      subjectName: "matematyka",
      result: 100,
    },
  });
  await prisma.userExamResult.create({
    data: {
      userId: user2.id,
      subjectName: "polski",
      result: 100,
    },
  });
  await prisma.userExamResult.create({
    data: {
      userId: user2.id,
      subjectName: "informatyka",
      result: 100,
    },
  });
  await prisma.userExamResult.create({
    data: {
      userId: user2.id,
      subjectName: "historia sztuki",
      result: 100,
    },
  });
  await prisma.userCourseRegistration.create({
    data: {
      userId: user2.id,
      course: Course.COMPUTER_SCIENCE,
      recruitmentStatus: RecruitmentStatus.CONFIRMED,
    },
  });
  await prisma.userCourseRegistration.create({
    data: {
      userId: user2.id,
      course: Course.ENGINEERING,
      recruitmentStatus: RecruitmentStatus.CONFIRMED,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin",
      password: "admin",
      userType: UserType.ADMIN,
    },
  });
  prisma.administrator.create({
    data: {
      name: "administrator",
      userId: admin.id,
    },
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
