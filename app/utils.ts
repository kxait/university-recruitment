import { useMatches } from "@remix-run/react";
import { Course, RecruitmentStatus } from "enum/enum";
import { useMemo } from "react";

const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );
  return route?.data;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

export function getLocalizedRecruitmentStatus(status: RecruitmentStatus): {
  status: string;
  classSuffix: string;
} {
  switch (status) {
    case RecruitmentStatus.ACCEPTED: {
      return { status: "Przyjęty", classSuffix: "-success" };
    }
    case RecruitmentStatus.CONFIRMED: {
      return { status: "W trakcie", classSuffix: "-warning" };
    }
    case RecruitmentStatus.ERROR: {
      return { status: "Błąd!", classSuffix: "-secondary" };
    }
    case RecruitmentStatus.NEW: {
      return { status: "Niepotwierdzone", classSuffix: "-info" };
    }
    case RecruitmentStatus.REJECTED: {
      return { status: "Odrzucony", classSuffix: "-error" };
    }
    default: {
      return { status: "Błąd programu!", classSuffix: "-error" };
    }
  }
}

export function getLocalizedCourseName(course: Course) {
  return {
    [Course.COMPUTER_SCIENCE]: "Informatyka",
    [Course.ENGINEERING]: "Inżynieria",
    [Course.MATHEMATICS]: "Matematyka",
  }[course];
}
