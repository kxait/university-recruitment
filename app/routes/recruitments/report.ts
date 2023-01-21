import { Headers, Response } from "@remix-run/node";
import { LoaderFunction } from "react-router";
import { getDataForReport } from "~/models/userRecruitment.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const data = JSON.stringify(await getDataForReport(), null, 2);

  const body = Buffer.from(data);

  const headers = new Headers({
    "Content-Type": "text/plain",
    "Content-Disposition": `attachment; filename="raport.json"`,
  });
  return new Response(body, { status: 200, headers });
};
