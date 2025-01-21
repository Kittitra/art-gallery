import { authConfig } from "@/auth.config";
import NextAuth from "next-auth";
import { apiAuthPrefix, apiRoute, artworkRoute, authRoute, DEFAULT_LOGIN_REDIRECT, profileRoute, publicRoute } from "@/routes";


const { auth } = NextAuth(authConfig);

export default auth((req) : any => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isApiRoute = nextUrl.pathname.startsWith(apiRoute);
  const isArtworkRoute = nextUrl.pathname.startsWith(artworkRoute);
  const isProfileRoute = nextUrl.pathname.startsWith(profileRoute);
  const isPublicRoute = publicRoute.includes(nextUrl.pathname);
  const isAuthRoute = authRoute.includes(nextUrl.pathname);

  // Allow API auth route to continue without any restriction
  if (isApiAuthRoute || isApiRoute) {
    return null;
  }


  // Redirect to a default page if logged in and on an auth route
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return null;
  }

  // Redirect to login page if not logged in and not on a public route
  if (!isLoggedIn && !isPublicRoute && !isArtworkRoute && !isProfileRoute) {
    return Response.redirect(new URL("/auth/login", nextUrl));
  }

  return null;
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
