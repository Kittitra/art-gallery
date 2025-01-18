import { authConfig } from "@/auth.config";
import NextAuth from "next-auth";
import { apiAuthPrefix, apiRoute, artworkRoute, authRoute, DEFAULT_LOGIN_REDIRECT, LoggedInRoute, profileRoute, publicRoute } from "@/routes";
import { NextResponse } from "next/server";

// Use only one of the two middleware options below
// 1. Use middleware directly
// export const { auth: middleware } = NextAuth(authConfig);

// 2. Wrapped middleware option
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isApiRoute = nextUrl.pathname.startsWith(apiRoute);
  const isArtworkRoute = nextUrl.pathname.startsWith(artworkRoute);
  const isProfileRoute = nextUrl.pathname.startsWith(profileRoute);
  const isPublicRoute = publicRoute.includes(nextUrl.pathname);
  const isAuthRoute = authRoute.includes(nextUrl.pathname);
  const isLoggedRoute = LoggedInRoute.includes(nextUrl.pathname);

  // Allow API auth route to continue without any restriction
  if (isApiAuthRoute || isApiRoute) {
    return NextResponse.next();
  }


  // Redirect to a default page if logged in and on an auth route
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  // Redirect to login page if not logged in and not on a public route
  if (!isLoggedIn && !isPublicRoute && !isArtworkRoute && !isProfileRoute) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }



  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
