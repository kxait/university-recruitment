import { useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { Course, RecruitmentStatus, UserType } from "enum/enum";
import { getAllDataAboutUser } from "~/models/user.server";
import { getUserRecruitmentScores } from "~/models/userRecruitment.server";
import { requireUserWithType } from "~/session.server";
import { getLocalizedCourseName, getLocalizedRecruitmentStatus } from "~/utils";

export async function loader({ request }: LoaderArgs) {
  const user = await requireUserWithType(request, UserType.USER);

  const allUserData = await getAllDataAboutUser(user.id);

  const recruitmentScores = await getUserRecruitmentScores(user.id);

  return json({ user: allUserData, scores: recruitmentScores });
}

export default function MyRecruitment() {
  const { user, scores } = useLoaderData<typeof loader>();

  return (
    <div>
      <div className="my-4 text-4xl">Moja rekrutacja</div>
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
                  <div className={`badge${status.classSuffix} badge badge-lg`}>
                    {status.status}
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
