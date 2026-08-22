import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const groupUrl =
      typeof body?.groupUrl === "string"
        ? body.groupUrl.trim()
        : "";

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

    if (!groupUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Facebook Group URL is required.",
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
      .eq("status", "online")
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
    | CREATE DESKTOP JOB
    |--------------------------------------------------------------------------
    */

    const payload = {
      group_url: groupUrl,
      message,
      image_urls: imageUrls,
    };

    const {
      data: job,
      error: jobError,
    } = await supabase
      .from("desktop_jobs")
      .insert({
        worker_id: worker.id,
        job_type:
          "facebook_group_post",
        payload,
        status: "queued",
      })
      .select(
        "id, worker_id, job_type, payload, status, created_at"
      )
      .single();

    if (jobError) {
      console.error(
        "Desktop job creation error:",
        jobError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Failed to create Facebook Group posting job.",
          details: jobError.message,
        },
        { status: 500 }
      );
    }

    console.log(
      "Facebook Group desktop job created:",
      job.id
    );

    return NextResponse.json({
      success: true,
      jobId: job.id,
      workerId: worker.id,
      workerName:
        worker.worker_name,
      status: job.status,
      groupUrl,
      imageCount:
        imageUrls.length,
      message:
        "Facebook Group posting job queued successfully.",
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
          "Unexpected error while creating Facebook Group posting job.",
      },
      { status: 500 }
    );
  }
}