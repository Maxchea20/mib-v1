import { NextResponse } from "next/server";
import { requireUser } from "@/lib/apiAuth";
import { createClient } from "@/lib/supabase/server";
import { INTAKE_JOB_TYPE, INTAKE_WORKER_READY, canSend, type IntakeRow } from "@/lib/listingIntake";

/*
| Sends saved intake links to the MIB Desktop worker: ONE job per link, so the worker does them one
| at a time. The links must already be in the listing_intake table (saved or failed). The jobs only
| carry the row's id, link and agent name; the worker makes a DRAFT listing, never a public one.
*/

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bad = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

export async function POST(request: Request) {
  const auth = await requireUser();
  if (!auth.user) return auth.response;

  if (!INTAKE_WORKER_READY) return bad("Sending is switched off: the worker on your PC cannot read these links yet.", 409);

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    /* no body means "all saved links" */
  }
  const ids = Array.isArray(body.ids) ? body.ids.map(Number).filter((n) => Number.isSafeInteger(n) && n > 0).slice(0, 100) : null;

  const supabase = await createClient();
  let query = supabase.from("listing_intake").select("id, source_url, cobroke_agent, status").in("status", ["saved", "failed"]).order("created_at", { ascending: true }).limit(100);
  if (ids) query = query.in("id", ids);
  const { data, error } = await query;
  if (error) return bad("Could not read the saved links.", 500);
  const rows = ((data ?? []) as Pick<IntakeRow, "id" | "source_url" | "cobroke_agent" | "status">[]).filter((r) => canSend(r.status));
  if (rows.length === 0) return bad("There is nothing to send.");

  const { data: worker } = await supabase
    .from("desktop_workers")
    .select("id, status, last_seen")
    .eq("status", "online")
    .order("last_seen", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!worker) return bad("No MIB Desktop worker is currently online.", 503);

  const { data: jobs, error: jobError } = await supabase
    .from("desktop_jobs")
    .insert(
      rows.map((r) => ({
        worker_id: worker.id,
        job_type: INTAKE_JOB_TYPE,
        payload: { intake_id: r.id, url: r.source_url, cobroke_agent: r.cobroke_agent },
        status: "queued",
      }))
    )
    .select("id, payload");
  if (jobError || !jobs) return bad("Could not create the worker jobs.", 500);

  const now = new Date().toISOString();
  for (const job of jobs) {
    const intakeId = Number((job.payload as { intake_id?: number } | null)?.intake_id);
    await supabase.from("listing_intake").update({ status: "queued", error: null, job_id: String(job.id), sent_at: now, finished_at: null }).eq("id", intakeId);
  }
  return NextResponse.json({ ok: true, sent: jobs.length });
}
