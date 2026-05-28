import { NextResponse } from "next/server";

const AUTH_TOKEN_KEY = "authToken";
const LANG_COOKIE_KEY = "preferredLanguage";

function isAuthenticated(request) {
  return Boolean(request.cookies.get(AUTH_TOKEN_KEY)?.value);
}

function hasLanguageSelected(request) {
  return Boolean(request.cookies.get(LANG_COOKIE_KEY)?.value);
}

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // ── Auth routes: /login, /signup, /otp ──
  // If user hasn't chosen a language yet, send them to choose-language first
  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/otp"
  ) {
    if (!hasLanguageSelected(request)) {
      return NextResponse.redirect(new URL("/choose-language", request.url));
    }
    // Already authenticated → skip login, go to dashboard
    if (isAuthenticated(request)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // ── Public/Static routes ──
  // Always allow these pages — no authentication needed
  if (
    pathname === "/choose-language" ||
    pathname === "/about-us" ||
    pathname === "/privacy-policy" ||
    pathname === "/terms-and-conditions"
  ) {
    return NextResponse.next();
  }

  // ── Protected dashboard routes ──
  // 1. Must have language selected
  if (!hasLanguageSelected(request)) {
    return NextResponse.redirect(new URL("/choose-language", request.url));
  }
  // 2. Must be authenticated
  if (!isAuthenticated(request)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/otp",
    "/choose-language",
    "/change-language",
    "/kyc-details",
    "/payout-history/:path*",
    "/review-ratings",
    "/blogs/:path*",
    "/offers/:path*",
    "/sessions/:path*",
    "/session-details",
    "/about-us",
    "/privacy-policy",
    "/terms-and-conditions",
    "/help-support",
    "/notifications",
    "/settings",
  ],
};
