import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/*
|--------------------------------------------------------------------------
| APP-WIDE AUTH GATE
|--------------------------------------------------------------------------
|
| Runs before every page and API request (except the ones excluded in
| `config.matcher` below - static files, images, favicon).
|
| - /login and /api/auth stay open, everything else requires a
|   logged-in (non-anonymous) Supabase user.
| - Page requests without a session are redirected to /login.
| - API requests without a session get a 401 JSON response instead
|   of a redirect, since the frontend fetch() calls expect JSON.
|
*/

const PUBLIC_PATHS = ["/login"];

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user, _rejectedBy, _tokenError } =
    await updateSession(request);

  const path = request.nextUrl.pathname;
  const isPublicPath = PUBLIC_PATHS.some((p) => path.startsWith(p));

  if (user || isPublicPath) {
    return supabaseResponse;
  }

  // Not logged in and hitting a protected route.
  if (path.startsWith("/api/")) {
    return NextResponse.json(
      {
        error: "Unauthorized. Please log in.",
        // TEMPORARY DEBUG FIELDS - remove once worker auth is confirmed working.
        _rejectedBy: _rejectedBy || "proxy.ts",
        _tokenError: _tokenError || null,
      },
      { status: 401 }
    );
  }

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};