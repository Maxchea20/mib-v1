import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/*
|--------------------------------------------------------------------------
| SERVER-SIDE SUPABASE CLIENT
|--------------------------------------------------------------------------
|
| Used inside Server Components and API routes to read the logged-in
| user's session from cookies. This does NOT change how the existing
| client-side `src/lib/supabase.ts` client works - that one is untouched
| and still used everywhere else in the app.
|
*/

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component that can't set cookies.
            // Safe to ignore - middleware handles refreshing the session.
          }
        },
      },
    }
  );
}
