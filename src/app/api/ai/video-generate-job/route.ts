import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";

/*
|--------------------------------------------------------------------------
| POST - QUEUE A VIDEO GENERATION JOB ON THE MIB DESKTOP WORKER
|--------------------------------------------------------------------------
|
| Mirrors /api/marketing/iproperty/create-listing: find the currently
| online desktop worker, insert one desktop_jobs row, return its id so
| the frontend can poll it.
|
*/

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const propertyId =
      body?.propertyId !== undefined && body?.propertyId !== null
        ? Number(body.propertyId)
        : null;

    const videoStyle =
      typeof body?.videoStyle === "string" && body.videoStyle.trim()
        ? body.videoStyle.trim()
        : "ai_director";

    if (propertyId === null || !Number.isFinite(propertyId)) {
      return NextResponse.json(
        { success: false, error: "propertyId is required." },
        { status: 400 }
      );
    }

    /*
    |------------------------------------------------------------------
    | FIND ONLINE DESKTOP WORKER
    |------------------------------------------------------------------
    */

    const { data: worker, error: workerError } = await supabase
      .from("desktop_workers")
      .select("id, worker_name, status, last_seen")
      .eq("status", "online")
      .order("last_seen", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (workerError) {
      console.error("Desktop worker lookup error:", workerError);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to find an online MIB Desktop worker.",
        },
        { status: 500 }
      );
    }

    if (!worker) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No MIB Desktop worker is currently online. Start MIB Desktop on your PC first.",
        },
        { status: 503 }
      );
    }

    /*
    |------------------------------------------------------------------
    | CREATE VIDEO GENERATION JOB
    |------------------------------------------------------------------
    */

    const job = {
      worker_id: worker.id,
      job_type: "generate_property_video",
      payload: {
        property_id: propertyId,
        video_style: videoStyle,
      },
      status: "queued",
    };

    const { data: createdJob, error: jobError } = await supabase
      .from("desktop_jobs")
      .insert(job)
      .select("id, worker_id, job_type, payload, status, created_at")
      .single();

    if (jobError) {
      console.error("Video generation job creation error:", jobError);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to queue video generation job.",
          details: jobError.message,
        },
        { status: 500 }
      );
    }

    console.log("✅ Video generation job created:", createdJob.id);

    return NextResponse.json({
      success: true,
      job: createdJob,
    });
  } catch (error) {
    console.error("Video generation job API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unexpected error while creating video generation job.",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| GET - CHECK A VIDEO GENERATION JOB'S STATUS
|--------------------------------------------------------------------------
|
| The worker writes project_id into this job's payload as soon as it
| creates the ai_video_projects row, so the frontend can start watching
| the real project (via the existing /api/ai/video-project and
| /api/ai/property-video routes) as soon as it's available.
|
*/

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("id");

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "id is required." },
        { status: 400 }
      );
    }

    const { data: job, error } = await supabase
      .from("desktop_jobs")
      .select("id, job_type, payload, status, error, created_at, completed_at")
      .eq("id", jobId)
      .single();

    if (error) {
      console.error("Video generation job lookup error:", error);

      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error("Video generation job status API error:", error);

    return NextResponse.json(
      { success: false, error: "Unexpected error while checking job status." },
      { status: 500 }
    );
  }
}