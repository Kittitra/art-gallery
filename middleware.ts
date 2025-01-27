import { authConfig } from "@/auth.config";
import NextAuth from "next-auth";
import { 
  apiAuthPrefix, 
  apiRoute, 
  artworkRoute, 
  authRoute, 
  DEFAULT_LOGIN_REDIRECT, 
  profileRoute, 
  publicRoute 
} from "@/routes";
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req): any => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isApiRoute = nextUrl.pathname.startsWith(apiRoute);
  const isArtworkRoute = nextUrl.pathname.startsWith(artworkRoute);
  const isProfileRoute = nextUrl.pathname.startsWith(profileRoute);
  const isPublicRoute = publicRoute.includes(nextUrl.pathname);
  const isAuthRoute = authRoute.includes(nextUrl.pathname);

  if (isApiAuthRoute || isApiRoute) {
    return null;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return null; // อนุญาตให้เข้าถึง /auth/login และ /auth/register
  }

  if (!isLoggedIn && !isPublicRoute && !isArtworkRoute && !isProfileRoute) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  return null;
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
