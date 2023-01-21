import { Form, useLoaderData } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import type { Course } from "enum/enum";
import { RecruitmentStatus, UserType } from "enum/enum";
import { getAllDataAboutUser } from "~/models/user.server";
import {
  getUserRecruitmentScores,
  setUserRecruitmentStatusForCourse,
} from "~/models/userRecruitment.server";
import { requireUserWithType } from "~/session.server";
import { getLocalizedCourseName, getLocalizedRecruitmentStatus } from "~/utils";

export async function action({ params, request }: ActionArgs) {
  await requireUserWithType(request, UserType.ADMIN);

  const formData = await request.formData();
  const status = formData.get("status") as RecruitmentStatus;
  const course = formData.get("course") as Course;

  const userId = Number(params["userId"]);

  return json(await setUserRecruitmentStatusForCourse(userId, course, status));
}

export async function loader({ params, request }: LoaderArgs) {
  await requireUserWithType(request, UserType.ADMIN);

  const recruit = await getAllDataAboutUser(Number(params.userId));

  const recruitmentScores = await getUserRecruitmentScores(recruit!.id);

  return json({ user: recruit, scores: recruitmentScores });
}

export default function MyRecruitment() {
  const { user, scores } = useLoaderData<typeof loader>();

  return (
    <div>
      <div className="my-4 text-4xl">{user?.email}</div>
      <table className="table w-full">
        <thead>
          <tr>
            <th>PESEL</th>
            <th>Adres</th>
            <th>Ukończona szkoła</th>
            <th>Status płatności</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{user?.userRecruitment?.pesel}</td>
            <td>{user?.userRecruitment?.address}</td>
            <td>{user?.userRecruitment?.finishedSchool}</td>
            <td>{user?.userRecruitment?.paid ? "Opłacona" : "Nieopłacona!"}</td>
          </tr>
        </tbody>
      </table>

      <table className="table-compact table w-full">
        <thead>
          <tr>
            <th>Lp.</th>
            <th>Kierunek</th>
            <th>Punkty</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {user?.userCourseRegistrations.map((course, index) => {
            const status = getLocalizedRecruitmentStatus(
              course.recruitmentStatus as RecruitmentStatus
            );
            return (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  <div className="badge">
                    {getLocalizedCourseName(course.course as Course)}
                  </div>
                </td>
                <td>{Number(scores[course.course]).toFixed(2)}/100</td>
                <td>
                  <div className="flex">
                    <Form method="post">
                      <input
                        type="hidden"
                        name="userId"
                        value={user?.id}
                      ></input>
                      <input
                        type="hidden"
                        name="course"
                        value={course.course}
                      ></input>
                      <div className="dropdown">
                        <label
                          tabIndex={0}
                          className={`btn${status.classSuffix} btn m-1`}
                        >
                          {status.status}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-6 w-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                            />
                          </svg>
                        </label>
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu rounded-box bg-base-200 p-1 shadow-lg"
                        >
                          {Object.values(RecruitmentStatus).map((status) => {
                            const localized = getLocalizedRecruitmentStatus(
                              status as RecruitmentStatus
                            );
                            return (
                              <div key={status} className="m-auto">
                                <button
                                  className={`btn${localized.classSuffix} btn m-2`}
                                  type="submit"
                                  name="status"
                                  value={status}
                                >
                                  {localized.status}
                                </button>
                              </div>
                            );
                          })}
                        </ul>
                      </div>
                    </Form>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="divider divider-vertical"></div>
      <table className="table w-full">
        <thead>
          <tr>
            <th>Lp.</th>
            <th>Nazwa przedmiotu</th>
            <th>Wynik</th>
          </tr>
        </thead>
        <tbody>
          {user?.userExamResults.map((exam, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>
                <div className="badge">{exam.subjectName}</div>
              </td>
              <td>{Number(exam.result).toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <span className="badge-secondary badge-info badge-success badge-warning badge-error btn-secondary btn-info btn-success btn-warning btn-error hidden" />
    </div>
  );
}
