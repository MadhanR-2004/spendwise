import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const publicPaths = ["/", "/auth/signin", "/auth/signup", "/auth/forgot-password"];

export default auth((req) => {
  const { pathname, search } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const isPublic = publicPaths.includes(pathname);
  if (isPublic) {
    return NextResponse.next();
  }

  if (!req.auth) {
    const url = new URL("/auth/signin", req.url);
    if (pathname !== "/") {
      url.searchParams.set("callbackUrl", `${pathname}${search}`);
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api)(.*)"],
};
