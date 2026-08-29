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

    const groupUrls = Array.isArray(
      body?.groupUrls
    )
      ? Array.from(
          new Set(
            body.groupUrls.filter(
              (url: unknown): url is string =>
                typeof url === "string" &&
                url.trim() !== ""
            ).map(
              (url: string) =>
                url.trim()
            )
          )
        )
      : [];

    const message =
      typeof body?.message === "string"
        ? body.message.trim()
        : "";

    const imageUrls = Array.isArray(
      body?.imageUrls
    )
      ? body.imageUrls.filter(
          (url: unknown): url is string =>
            typeof url === "string" &&
            url.trim() !== ""
        )
      : [];

    const scheduledAt =
      typeof body?.scheduledAt === "string" &&
      body.scheduledAt.trim() !== ""
        ? body.scheduledAt.trim()
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

    if (
      groupUrls.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please select at least one Facebook Group.",
        },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Facebook Group post message is required.",
        },
        { status: 400 }
      );
    }

    if (
      imageUrls.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "At least one image is required.",
        },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE SCHEDULE
    |--------------------------------------------------------------------------
    */

    let scheduledTimestamp:
      string | null = null;

    if (scheduledAt) {
      const parsed =
        new Date(scheduledAt);

      if (
        Number.isNaN(
          parsed.getTime()
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid scheduled date/time.",
          },
          { status: 400 }
        );
      }

      scheduledTimestamp =
        parsed.toISOString();

      if (
        parsed.getTime() <=
        Date.now()
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Scheduled time must be in the future.",
          },
          { status: 400 }
        );
      }
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
    | CREATE ONE JOB PER FACEBOOK GROUP
    |--------------------------------------------------------------------------
    */

    const jobs = groupUrls.map(
      (groupUrl) => ({
        worker_id:
          worker.id,

        job_type:
          "facebook_group_post",

        payload: {
          listing_id:
            listingId,

          group_url:
            groupUrl,

          message,

          image_urls:
            imageUrls,
        },

        status:
          "queued",

        scheduled_at:
          scheduledTimestamp,
      })
    );

    const {
      data: createdJobs,
      error: jobsError,
    } = await supabase
      .from("desktop_jobs")
      .insert(jobs)
      .select(
        "id, worker_id, job_type, payload, status, scheduled_at, created_at"
      );

    if (jobsError) {
      console.error(
        "Desktop jobs creation error:",
        jobsError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Failed to create Facebook Group posting jobs.",
          details:
            jobsError.message,
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
      `Created ${createdJobs?.length ?? 0} Facebook Group jobs.`
    );

    return NextResponse.json({
      success: true,

      jobCount:
        createdJobs?.length ?? 0,

      workerId:
        worker.id,

      workerName:
        worker.worker_name,

      status:
        "queued",

      scheduledAt:
        scheduledTimestamp,

      listingId,

      groupCount:
        groupUrls.length,

      message:
        scheduledTimestamp
          ? "Facebook Group posting jobs scheduled successfully."
          : "Facebook Group posting jobs queued successfully.",
    });
  } catch (error) {
    console.error(
      "Facebook Group job API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unexpected error while creating Facebook Group posting jobs.",
      },
      { status: 500 }
    );
  }
}