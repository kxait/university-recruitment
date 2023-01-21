import { Form, useActionData, useTransition } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { Course } from "enum/enum";
import React from "react";
import type {
  CourseRegistrationForRegistration,
  ExamResultForRegistration,
} from "~/models/user.server";
import { createExamRegistration } from "~/models/user.server";
import { createUserSession, requireNoUser } from "~/session.server";
import { getLocalizedCourseName } from "~/utils";

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

  const errors: { [key: string]: string } = {};

  const name = validate<string>(
    formData,
    "name",
    (data) => data.length !== 0,
    "złe imie i nazwisko"
  );

  const email = validate<string>(
    formData,
    "email",
    (data) => data.length !== 0,
    "zły email"
  );
  //if (email.error) return { fieldError: email.fieldError };

  const password = validate<string>(
    formData,
    "password",
    (data) => data.length !== 0,
    "złe hasło"
  );
  //if (password.error) return { fieldError: password.fieldError };

  const address = validate<string>(
    formData,
    "address",
    (data) => data.length !== 0,
    "zły adres"
  );
  //if (address.error) return { fieldError: address.fieldError };

  const finishedSchool = validate<string>(
    formData,
    "finishedSchool",
    (data) => data.length !== 0,
    "zła wartość"
  );
  //if (finishedSchool.error) return { fieldError: finishedSchool.fieldError };

  const pesel = validate<string>(
    formData,
    "pesel",
    (pesel) => pesel.length !== 0,
    "zły pesel"
  );
  //if (pesel.error) return { fieldError: pesel.fieldError };

  let fieldErrors: { [key: string]: string } = [
    name,
    email,
    password,
    address,
    finishedSchool,
    pesel,
  ]
    .flatMap((x) => x)
    .reduce((cur, me) => (cur = { ...cur, ...me.fieldError }), {});

  const examResults = JSON.parse(
    formData.get("examResults") as string
  ) as ExamResultForRegistration[];
  const courseRegistrations = JSON.parse(
    formData.get("courseRegistrations") as string
  ) as CourseRegistrationForRegistration[];

  if (examResults == null || examResults.length === 0)
    fieldErrors = { ...fieldErrors, examResults: "złe dane o egzaminach" };

  if (courseRegistrations == null || courseRegistrations.length === 0)
    fieldErrors = {
      ...fieldErrors,
      courseRegistrations: "złe dane o kierunkach",
    };

  if (Object.keys(fieldErrors).length !== 0)
    return { fieldError: fieldErrors, value: null };

  const createdUser = await createExamRegistration(
    email.value,
    password.value,
    address.value,
    finishedSchool.value,
    pesel.value,
    examResults,
    courseRegistrations
  );

  if (createdUser?.error) {
    return { fieldError: { general: createdUser?.error }, value: null };
  }

  throw await createUserSession({
    request,
    userId: createdUser?.data?.id as number,
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
  >([]);

  const [courseRegistrations, setCourseRegistrations] = React.useState<
    CourseRegistrationForRegistration[]
  >([]);

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

  const courses = Object.keys(Course);

  return (
    <div>
      <div className="text-4xl">Zarejestruj się na studia</div>
      <div className="text-2xl text-error">
        {actionData?.fieldError["general"]}
      </div>
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
        <div className="text-error">
          {actionData?.fieldError["examResults"]}
        </div>
        <div className="flex items-center">
          <div
            className="btn-success btn-sm btn-circle btn mr-2"
            onClick={() => {
              setExamResults([
                ...examResults,
                { result: 0, subjectName: "Wybierz przedmiot" },
              ]);
            }}
          >
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
        <div>
          {examResults.map((examResult, index) => {
            return (
              <div key={index} className="flex items-center">
                <div
                  className="btn-error btn-xs btn-circle btn mr-2 ml-1"
                  onClick={() => {
                    setExamResults([
                      ...examResults.filter((x) => x !== examResult),
                    ]);
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
                    setExamResults([...examResults]);
                  }}
                  value={examResult.subjectName}
                >
                  <option disabled>Wybierz przedmiot</option>
                  {possibleExams.map((exam) => (
                    <option key={exam}>{exam}</option>
                  ))}
                </select>
                <input
                  onChange={(e) => {
                    const newValue = e.target.value;
                    examResults[index] = {
                      ...examResults[index],
                      result: Number(newValue),
                    };
                    setExamResults([...examResults]);
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
        <div className="divider" />
        <div className="text-error">
          {actionData?.fieldError["courseRegistrations"]}
        </div>
        <div className="flex items-center">
          <div
            className="btn-success btn-sm btn-circle btn mr-2"
            onClick={() => {
              setCourseRegistrations([
                ...courseRegistrations,
                { course: "Wybierz kierunek" },
              ]);
            }}
          >
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
          <div className="my-2 text-2xl">Wybierz kierunki</div>
        </div>
        <div>
          {courseRegistrations.map((course, index) => {
            return (
              <div key={index} className="flex items-center">
                <div
                  className="btn-error btn-xs btn-circle btn mr-2 ml-1"
                  onClick={() => {
                    setCourseRegistrations([
                      ...courseRegistrations.filter((x) => x !== course),
                    ]);
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
                    courseRegistrations[index] = {
                      ...courseRegistrations[index],
                      course: newValue,
                    };
                    setCourseRegistrations([...courseRegistrations]);
                  }}
                  value={course.course}
                >
                  <option disabled>Wybierz kierunek</option>
                  {courses.map((course) => (
                    <option key={course} value={course}>
                      {getLocalizedCourseName(course as Course)}
                    </option>
                  ))}
                </select>
                <input
                  type="hidden"
                  value={JSON.stringify(examResults)}
                  name="examResults"
                />
                <input
                  type="hidden"
                  value={JSON.stringify(courseRegistrations)}
                  name="courseRegistrations"
                />
              </div>
            );
          })}
        </div>
        <button type="submit" className="btn-primary btn-lg btn m-6">
          wyślij
        </button>
      </Form>
    </div>
  );
}
