import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

/*
|--------------------------------------------------------------------------
| API ROUTE AUTH GUARD
|--------------------------------------------------------------------------
|
| Call this at the top of any API route that uses the Supabase service
| role key. Middleware already blocks logged-out requests, but this is
| a second, explicit check directly in the routes that touch the admin
| key - defense in depth, in case middleware config ever changes.
|
| Usage:
|
|   const auth = await requireUser();
|   if (!auth.user) return auth.response;
|
| AUTH SOURCES:
| 1. Cookie-based session (normal browser requests).
| 2. Bearer token (the MIB Desktop worker, which has no browser cookies
|    but authenticates with a real Supabase access token obtained via
|    MIB_WORKER_ACCESS_TOKEN / MIB_WORKER_REFRESH_TOKEN).
|
*/

export async function requireUser() {
  /*
  |--------------------------------------------------------------------------
  | 1. COOKIE SESSION (BROWSER)
  |--------------------------------------------------------------------------
  */

  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!error && user && !user.is_anonymous) {
    return { user, response: null };
  }

  /*
  |--------------------------------------------------------------------------
  | 2. BEARER TOKEN (WORKER / NON-BROWSER CALLERS)
  |--------------------------------------------------------------------------
  */

  const headerList = await headers();
  const authHeader =
    headerList.get("authorization") || headerList.get("Authorization");

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
      return { user: tokenUser, response: null };
    }
  }

  return {
    user: null,
    response: NextResponse.json(
      {
        error: "Unauthorized. Please log in.",
        // TEMPORARY DEBUG FIELD - remove once worker auth is confirmed working.
        _rejectedBy: "apiAuth.ts",
      },
      { status: 401 }
    ),
  };
}