import {Route} from "next";

import {auth} from "@/auth";
import ROUTES from "@/constants/routes";

const middleware = auth(req => {
  const {nextUrl} = req;
  const isLoggedIn = Boolean(req.auth);

  const isAuthRoute = [
    ROUTES.SIGN_IN,
    ROUTES.SIGN_UP,
    ROUTES.AUTH_ERROR,
  ].includes(nextUrl.pathname as Route);

  if (isLoggedIn && isAuthRoute) {
    const url = new URL(ROUTES.HOME, nextUrl.origin);
    return Response.redirect(url);
  }
});

export {middleware};
