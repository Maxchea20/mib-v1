import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/*
|--------------------------------------------------------------------------
| MIDDLEWARE SESSION HELPER
|--------------------------------------------------------------------------
|
| Refreshes the Supabase auth session on every request, and returns
| both the response and the logged-in user (or null).
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
    data: { user },
  } = await supabase.auth.getUser();

  const isAnonymous = user?.is_anonymous === true;

  return {
    supabaseResponse,
    user: isAnonymous ? null : user,
  };
}
