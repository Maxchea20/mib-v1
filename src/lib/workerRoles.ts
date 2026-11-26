/*
|--------------------------------------------------------------------------
| NAMED WORKERS (pure, unit-tested)
|--------------------------------------------------------------------------
|
| Each MIB Desktop worker has a name and only its own kind of jobs:
|
|   Woody   the posting worker: Facebook groups, iProperty, Google Business, property videos
|   Becky   the intake worker: reads Facebook links from co-broke agents into draft listings
|
| A job is only ever sent to the worker that handles its type. A worker with any other name
| (an older copy of the worker called "MIB Desktop", say) is treated like Woody.
|
| This file is mirrored in the worker (mib-desktop/worker/identity.mjs). Keep both in step.
|
*/

export const POSTING_WORKER = "Woody";
export const INTAKE_WORKER = "Becky";
export const INTAKE_JOB_TYPE = "listing_intake";

/** The worker that must handle this kind of job. */
export const workerNameFor = (jobType: string): string => (jobType === INTAKE_JOB_TYPE ? INTAKE_WORKER : POSTING_WORKER);

/** Can the worker with this name run this kind of job? */
export function workerCanRun(workerName: string | null | undefined, jobType: string): boolean {
  const intake = jobType === INTAKE_JOB_TYPE;
  return (workerName ?? "").trim().toLowerCase() === INTAKE_WORKER.toLowerCase() ? intake : !intake;
}
