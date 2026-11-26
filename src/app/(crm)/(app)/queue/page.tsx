export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import QueueBoard, { type GroupRow, type ListingTitle } from "@/components/queue/QueueBoard";
import { listingIdOf, type JobRow, type WorkerRow } from "@/lib/workerQueue";

/*
| MIB > Worker queue. What Woody and Becky have been asked to do: waiting, running, finished
| and failed jobs, and whether each is online. Reads with the signed-in owner's own access.
*/

/** Kept outside the page so the page itself stays pure. */
const nowMs = () => Date.now();

const JOB_COLUMNS = "id, worker_id, job_type, status, payload, created_at, scheduled_at, completed_at, error";

export default async function QueuePage() {
  const supabase = await createClient();

  const [{ data: workers, error: workersError }, { data: jobs, error: jobsError }, { data: groups }] = await Promise.all([
    supabase.from("desktop_workers").select("id, worker_name, status, last_seen").order("last_seen", { ascending: false }).limit(5),
    supabase.from("desktop_jobs").select(JOB_COLUMNS).order("created_at", { ascending: false }).limit(100),
    supabase.from("facebook_groups").select("group_url, name"),
  ]);

  const jobRows = (jobs ?? []) as JobRow[];
  const ids = [...new Set(jobRows.map((j) => listingIdOf(j.payload)).filter((n): n is number => n !== null))];
  const { data: listings } = ids.length > 0 ? await supabase.from("properties").select("id, title").in("id", ids) : { data: [] };

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold">Worker queue</h1>
      <p className="mt-2 text-slate-600">
        What your two workers on your PC have been asked to do. Woody posts to iProperty, Facebook groups and Google Business; Becky reads listing
        intake links. Each does one job at a time, and this page refreshes by itself. You can cancel a waiting job or delete a finished one.
      </p>
      <QueueBoard
        initialWorkers={(workers ?? []) as WorkerRow[]}
        initialJobs={jobRows}
        initialTitles={(listings ?? []) as ListingTitle[]}
        groups={(groups ?? []) as GroupRow[]}
        serverNow={nowMs()}
        loadError={Boolean(workersError || jobsError)}
      />
    </div>
  );
}
