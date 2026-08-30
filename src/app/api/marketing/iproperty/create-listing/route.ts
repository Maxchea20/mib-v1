import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    /*
    |--------------------------------------------------------------------------
    | INPUT
    |--------------------------------------------------------------------------
    */

    const listingId =
      body?.listingId !== undefined &&
      body?.listingId !== null
        ? Number(body.listingId)
        : null;

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
      listingId === null ||
      !Number.isFinite(listingId)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Listing ID is required.",
        },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ONLINE DESKTOP WORKER
    |--------------------------------------------------------------------------
    */

    const {
      data: worker,
      error: workerError,
    } = await supabase
      .from("desktop_workers")
      .select(
        "id, worker_name, status, last_seen"
      )
      .eq(
        "status",
        "online"
      )
      .order(
        "last_seen",
        {
          ascending: false,
        }
      )
      .limit(1)
      .maybeSingle();

    if (workerError) {
      console.error(
        "Desktop worker lookup error:",
        workerError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Failed to find an online MIB Desktop worker.",
        },
        { status: 500 }
      );
    }

    if (!worker) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No MIB Desktop worker is currently online.",
        },
        { status: 503 }
      );
    }

    console.log(
      "MIB Desktop worker selected:",
      worker.id
    );

    /*
    |--------------------------------------------------------------------------
    | CREATE IPROPERTY JOB
    |--------------------------------------------------------------------------
    */

    const job = {
      worker_id:
        worker.id,

      job_type:
        "iproperty_create_listing",

      payload: {
        listing_id:
          listingId,
      },

      status:
        "queued",
    };

    const {
      data: createdJob,
      error: jobError,
    } = await supabase
      .from("desktop_jobs")
      .insert(job)
      .select(
        "id, worker_id, job_type, payload, status, created_at"
      )
      .single();

    if (jobError) {
      console.error(
        "iProperty desktop job creation error:",
        jobError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Failed to create iProperty posting job.",
          details:
            jobError.message,
        },
        { status: 500 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | SUCCESS
    |--------------------------------------------------------------------------
    */

    console.log(
      "✅ iProperty job created:",
      createdJob.id
    );

    console.log(
      "Listing ID:",
      listingId
    );

    return NextResponse.json({
      success: true,

      jobId:
        createdJob.id,

      workerId:
        worker.id,

      workerName:
        worker.worker_name,

      listingId,

      status:
        "queued",

      message:
        "iProperty listing job queued successfully.",
    });
  } catch (error) {
    console.error(
      "iProperty job API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unexpected error while creating iProperty posting job.",
      },
      { status: 500 }
    );
  }
}