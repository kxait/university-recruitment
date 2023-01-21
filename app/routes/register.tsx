import { Form, useActionData, useTransition } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import React from "react";
import { finished } from "stream";
import type {
  CourseRegistrationForRegistration,
  ExamResultForRegistration,
} from "~/models/user.server";
import { createExamRegistration } from "~/models/user.server";
import { createUserSession, requireNoUser } from "~/session.server";

function validate<T>(
  formData: FormData,
  fieldName: string,
  validator: (value: T) => boolean,
  errorReason: string
) {
  const value = formData.get(fieldName);
  if (value == null)
    return {
      error: true,
      fieldError: { [fieldName]: "no data" },
      value: null as T,
    };

  const typedValue = value as T;
  if (typedValue == null)
    return {
      error: true,
      fieldError: { [fieldName]: "invalid data format" },
      value: null as T,
    };

  if (!validator(typedValue))
    return {
      error: true,
      fieldError: { [fieldName]: errorReason },
      value: null as T,
    };

  return {
    error: false,
    fieldError: {} as { [key: string]: string },
    value: typedValue,
  };
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();

  const email = validate<string>(formData, "email", () => true, "");
  if (email.error) return { fieldError: email.fieldError };

  const password = validate<string>(formData, "password", () => true, "");
  if (password.error) return { fieldError: password.fieldError };

  const address = validate<string>(formData, "address", () => true, "");
  if (address.error) return { fieldError: address.fieldError };

  const finishedSchool = validate<string>(
    formData,
    "finishedSchool",
    () => true,
    ""
  );
  if (finishedSchool.error) return { fieldError: finishedSchool.fieldError };

  const pesel = validate<string>(formData, "pesel", () => true, "");
  if (pesel.error) return { fieldError: pesel.fieldError };

  const examResults = JSON.parse(
    formData.get("examResults") as string
  ) as ExamResultForRegistration[];
  const courseRegistrations = JSON.parse(
    formData.get("courseRegistrations") as string
  ) as CourseRegistrationForRegistration[];

  if (examResults == null) return { fieldError: { examResults: "bad data" } };

  if (courseRegistrations == null)
    return { fieldError: { courseRegistrations: "bad data" } };

  const createdUser = await createExamRegistration(
    email.value,
    password.value,
    address.value,
    finishedSchool.value,
    pesel.value,
    examResults,
    courseRegistrations
  );

  throw await createUserSession({
    request,
    userId: createdUser?.id as number,
    remember: true,
    redirectTo: "/my-recruitment",
  });
}

export async function loader({ request }: LoaderArgs) {
  await requireNoUser(request);

  return json({});
}

function FormField({
  label,
  name,
  error,
  submitting,
  type,
}: {
  label: string;
  name: string;
  error: string | undefined;
  submitting: boolean;
  type?: string;
}) {
  const [errorCleared, setErrorCleared] = React.useState(false);

  React.useEffect(() => setErrorCleared(false), [error, submitting]);

  return (
    <>
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <input
        name={name}
        type={type ?? "text"}
        onInput={() => setErrorCleared(true)}
        placeholder={label}
        className={`input-bordered input w-full max-w-xs ${
          error !== undefined && !errorCleared ? "input-error" : ""
        }`}
      />
      {error !== undefined && !errorCleared && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </>
  );
}

export default function Register() {
  const transition = useTransition();
  const submitting = React.useMemo(
    () => transition.state === "submitting",
    [transition]
  );

  const actionData = useActionData<typeof action>();

  let [examResults, setExamResults] = React.useState<
    ExamResultForRegistration[]
  >([{ result: 69.9, subjectName: "matematyka" }]);

  const [courseRegistrations, setCourseRegistrations] = React.useState<{
    [key: string]: CourseRegistrationForRegistration;
  }>({});

  const possibleExams = React.useMemo(
    () => [
      "informatyka",
      "historia sztuki",
      "matematyka",
      "polski",
      "angielski",
    ],
    []
  );

  const sus = React.useMemo(() => {
    return (
      <div>
        {examResults.map((examResult, index) => {
          return (
            <div key={index} className="flex items-center">
              <div
                className="btn-error btn-xs btn-circle btn mr-2 ml-1"
                onClick={() => {
                  setExamResults(examResults.splice(index, 1));
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <select
                className="select-bordered select w-full max-w-xs"
                onChange={(e) => {
                  const newValue = e.target.value;
                  examResults[index] = {
                    ...examResults[index],
                    subjectName: newValue,
                  };
                  setExamResults(examResults);
                }}
                value={examResult.subjectName}
              >
                <option disabled>Wybierz kierunek</option>
                {possibleExams.map((exam) => (
                  <option key={exam}>{exam}</option>
                ))}
              </select>
              <input
                onChange={(e) => {
                  const newValue = e.target.value;
                  console.log(newValue);
                  examResults[index] = {
                    ...examResults[index],
                    result: Number(newValue),
                  };
                  setExamResults(examResults);
                  return true;
                }}
                value={examResults[index].result.toString()}
                type="number"
                className="input-bordered input ml-2 w-20"
              ></input>
              %
            </div>
          );
        })}
      </div>
    );
  }, [examResults, possibleExams]);

  return (
    <div>
      <div className="text-4xl">Zarejestruj się na studia</div>
      <Form method="post">
        <FormField
          name="name"
          label="Imie i nazwisko"
          error={actionData?.fieldError["name"]}
          submitting={submitting}
        />
        <FormField
          name="email"
          label="Adres e-mail"
          error={actionData?.fieldError["email"]}
          submitting={submitting}
        />
        <FormField
          name="password"
          label="Hasło"
          error={actionData?.fieldError["password"]}
          type="password"
          submitting={submitting}
        />
        <FormField
          name="address"
          label="Adres zamieszkania"
          error={actionData?.fieldError["address"]}
          submitting={submitting}
        />
        <FormField
          name="pesel"
          label="PESEL"
          error={actionData?.fieldError["pesel"]}
          submitting={submitting}
        />
        <FormField
          name="finishedSchool"
          label="Ukończona szkoła"
          error={actionData?.fieldError["finishedSchool"]}
          submitting={submitting}
        />
        <div className="divider" />
        <div className="flex items-center">
          <div className="btn-success btn-sm btn-circle btn mr-2">
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
                d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="my-2 text-2xl">Wyniki z matury</div>
        </div>
        <div>{sus}</div>
        <div className="divider" />
        <div className="my-2 text-2xl">Kierunki</div>
        <div></div>
      </Form>
    </div>
  );
}
