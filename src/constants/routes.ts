import type {Route} from "next";

const ROUTES = {
  HOME: "/" as Route,
  SIGN_IN: "/sign-in" as Route,
  SIGN_UP: "/sign-up" as Route,
  AUTH_ERROR: "/auth-error" as Route,

  FORBIDDEN: "/forbidden" as Route,

  PROFILE: (id: string) => `/profile/${id}` as Route,
};

export default ROUTES;
