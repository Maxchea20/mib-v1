import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import type { User } from "@supabase/supabase-js";

/*
|--------------------------------------------------------------------------
| API ROUTE AUTH GUARD
|--------------------------------------------------------------------------
|
| Call this at the top of any API route that uses the Supabase service
| role key. Middleware/proxy.ts already blocks logged-out requests, but
| this is a second, explicit check directly in the routes that touch the
| admin key - defense in depth, in case the proxy config ever changes.
|
| Usage:
|
|   const auth = await requireUser();
|   if (!auth.user) return auth.response;
|
| The return type is a discriminated union (response is only ever a real
| NextResponse when user is null) so that pattern type-checks cleanly -
| TypeScript can prove `auth.response` is never null in that branch,
| instead of widening it to `NextResponse | null`.
|
| WORKER TRUST:
| The MIB Desktop worker calls these routes as a trusted background
| service (see proxy.ts for why it can't use a real Supabase user
| session). It sends the same shared secret header proxy.ts checks;
| this route-level guard honors it too so the two stay consistent.
|
*/

const WORKER_USER = {
  id: "mib-desktop-worker",
  email: "worker@mib.internal",
  is_anonymous: false,
} as unknown as User;

type RequireUserResult =
  | { user: User; response: null }
  | { user: null; response: NextResponse };

function isTrustedWorkerRequest(
  headerList: Awaited<ReturnType<typeof headers>>
): boolean {
  const workerSecret = headerList.get("x-mib-worker-secret");
  const expectedSecret = process.env.MIB_WORKER_SECRET;

  return Boolean(
    expectedSecret && workerSecret && workerSecret === expectedSecret
  );
}

export async function requireUser(): Promise<RequireUserResult> {
  const headerList = await headers();

  if (isTrustedWorkerRequest(headerList)) {
    return { user: WORKER_USER, response: null };
  }

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