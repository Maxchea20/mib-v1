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
|   logged-in (non-anonymous) Supabase user OR the MIB Desktop worker
|   secret header.
| - Page requests without a session are redirected to /login.
| - API requests without a session get a 401 JSON response instead
|   of a redirect, since the frontend fetch() calls expect JSON.
|
| WORKER TRUST:
| MIB Desktop's Tauri webview has no real login flow - it only ever
| produces an anonymous Supabase session, which correctly can't act as
| a real user. Rather than build a full login screen for a background
| process, the worker instead sends a shared secret header. This is
| standard practice for trusted machine-to-machine calls: the worker is
| a background service acting on behalf of the app's single owner, not
| a separate "user" that needs its own session.
|
*/

const PUBLIC_PATHS = ["/login"];

function isTrustedWorkerRequest(request: NextRequest): boolean {
  const workerSecret = request.headers.get("x-mib-worker-secret");
  const expectedSecret = process.env.MIB_WORKER_SECRET;

  return Boolean(
    expectedSecret && workerSecret && workerSecret === expectedSecret
  );
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = PUBLIC_PATHS.some((p) => path.startsWith(p));

  if (isPublicPath) {
    return NextResponse.next({ request });
  }

  if (isTrustedWorkerRequest(request)) {
    return NextResponse.next({ request });
  }

  const { supabaseResponse, user } = await updateSession(request);

  if (user) {
    return supabaseResponse;
  }

  // Not logged in and hitting a protected route.
  if (path.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in." },
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