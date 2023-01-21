import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import * as _enum from "enum/enum";
import { getAllEveryRecruit } from "~/models/user.server";
import { requireUserWithType } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  await requireUserWithType(request, _enum.UserType.ADMIN);

  const allUserData = await getAllEveryRecruit();

  return json({ users: allUserData });
}

export default function MyRecruitment() {
  const { users } = useLoaderData<typeof loader>();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="my-4 text-4xl">Wszystkie osoby rekrutujące się</div>
        <Link to="report" target="_blank" className="btn-info btn">
          pobierz raport
        </Link>
      </div>

      <table className="table w-full">
        <thead>
          <tr>
            <th>PESEL</th>
            <th>Adres</th>
            <th>Ukończona szkoła</th>
            <th>Status płatności</th>
            <th>Kierunki</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user?.userRecruitment?.pesel}</td>
              <td>{user?.userRecruitment?.address}</td>
              <td>{user?.userRecruitment?.finishedSchool}</td>
              <td>
                {user?.userRecruitment?.paid ? "Opłacona" : "Nieopłacona!"}
              </td>
              <td>{user.userCourseRegistrations.length}</td>
              <td>
                <Link to={`/recruitments/${user.id}`} className="btn">
                  Szczegóły
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
