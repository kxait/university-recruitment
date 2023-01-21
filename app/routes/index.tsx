import { useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { UserType } from "enum/enum";
import { Link } from "react-router-dom";
import { getUser } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const user = await getUser(request);
  console.log(user);

  const isLoggedIn = user !== null;
  const isRecruit = isLoggedIn && user?.userType === UserType.USER;
  const isAdmin = isLoggedIn && user?.userType === UserType.ADMIN;

  return json({ isLoggedIn, isRecruit, isAdmin });
}

export default function Index() {
  const { isLoggedIn, isRecruit, isAdmin } = useLoaderData<typeof loader>();

  return (
    <div>
      <div className="hero h-full">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Uniwersytet Pitulicki</h1>
            <p className="py-6 text-left">
              - Skąd jesteś?
              <br /> - Z Pitulic.
              <br /> - Skąd?
              <br /> - Tam, gdzie jeden dom i siedem ulic!
            </p>
            {!isLoggedIn && (
              <>
                <Link to="/register" className="btn-info btn-lg btn">
                  zarejestruj się do rekrutacji!
                </Link>
                <br></br>
                <Link to="/login" className="btn-ghost btn-sm btn mt-4">
                  zaloguj się
                </Link>
              </>
            )}
            {isRecruit && (
              <Link to="/my-recruitment" className="btn-primary btn-lg btn">
                Moje rekrutacje
              </Link>
            )}
            {isAdmin && (
              <Link to="/recruitments" className="btn-primary btn-lg btn">
                Lista rekrutacji
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
