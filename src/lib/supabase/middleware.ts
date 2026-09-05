import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

/*
|--------------------------------------------------------------------------
| MIDDLEWARE SESSION HELPER
|--------------------------------------------------------------------------
|
| Refreshes the Supabase auth session on every request, and returns
| both the response and the logged-in user (or null).
|
| AUTH SOURCES:
| 1. Cookie-based session (normal browser requests).
| 2. Bearer token (the MIB Desktop worker, which has no browser cookies
|    but authenticates with a real Supabase access token). Without this,
|    every worker request to /api/ai/* gets rejected here before the
|    route handler - and its own apiAuth.ts Bearer support - ever runs.
|
*/

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: do not remove this call. It refreshes the session
  // and keeps the user logged in across requests.
  const {
    data: { user: cookieUser },
  } = await supabase.auth.getUser();

  if (cookieUser && !cookieUser.is_anonymous) {
    return {
      supabaseResponse,
      user: cookieUser,
    };
  }

  // No valid cookie session - check for a Bearer token (worker requests).
  const authHeader =
    request.headers.get("authorization") ||
    request.headers.get("Authorization");

  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  if (bearerToken) {
    const tokenClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const {
      data: { user: tokenUser },
      error: tokenError,
    } = await tokenClient.auth.getUser(bearerToken);

    if (!tokenError && tokenUser && !tokenUser.is_anonymous) {
      return {
        supabaseResponse,
        user: tokenUser,
      };
    }
  }

  return {
    supabaseResponse,
    user: null,
  };
}