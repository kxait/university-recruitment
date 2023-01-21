import type { User } from "@prisma/client";
import { Form, Link } from "@remix-run/react";
import { UserType } from "enum/enum";

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  const isStudent = user?.userType === UserType.USER;
  const isAdmin = user?.userType === UserType.ADMIN;

  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <Link to="/" className="btn-ghost btn text-xl normal-case">
          Uniwersystet Pitulicki
        </Link>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1">
            {isStudent && (
              <li>
                <Link to="my-recruitment">Moja rekrutacja</Link>
              </li>
            )}
            {isAdmin && (
              <li>
                <Link to="recruitments">Lista rekrutacji</Link>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="flex-none">
        {user === null ? (
          <Link to="/login" className="btn-primary btn">
            Zaloguj
          </Link>
        ) : (
          <>
            <div className="badge m-1 mr-4 p-4">{user.email}</div>
            <Form action="/logout" method="post">
              <button type="submit" className="btn">
                wyloguj
              </button>
            </Form>
          </>
        )}
      </div>
    </div>
  );
}
