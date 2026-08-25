import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
*/

export async function requireUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || user.is_anonymous) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      ),
    };
  }

  return { user, response: null };
}
