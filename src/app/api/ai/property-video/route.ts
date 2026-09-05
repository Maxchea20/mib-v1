import RunwayML from "@runwayml/sdk";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireUser } from "@/lib/apiAuth";

/*
|--------------------------------------------------------------------------
| RUNWAY
|--------------------------------------------------------------------------
*/

const runway = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET,
});

/*
|--------------------------------------------------------------------------
| SUPABASE SERVER CLIENT
|--------------------------------------------------------------------------
*/

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/*
|--------------------------------------------------------------------------
| NOTE
|--------------------------------------------------------------------------
|
| The Sora-2 video creation POST handler that used to live here has been
| removed. Video generation now goes through the multi-shot Director +
| Runway pipeline (see /api/ai/video-director, /api/ai/property-video-studio,
| /api/ai/video-project, /api/ai/video-assemble), wired into AIVideoTab.tsx.
|
| GET and DELETE remain here because AIVideoTab.tsx still calls this route
| to load and delete individual ai_videos records (loadVideos / deleteVideo).
|
*/

/*
|--------------------------------------------------------------------------
| GET — CHECK RUNWAY STATUS / DOWNLOAD / SAVE VIDEO
|--------------------------------------------------------------------------
*/

export async function GET(
  request: Request
) {
  const auth = await requireUser();
  if (!auth.user) return auth.response;

  try {
    const { searchParams } =
      new URL(request.url);

    const propertyId =
      searchParams.get(
        "property_id"
      );

    if (!propertyId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "property_id is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | LOAD VIDEO RECORDS
    |--------------------------------------------------------------------------
    */

    const {
      data: records,
      error: findError,
    } =
      await supabaseAdmin
        .from("ai_videos")
        .select("*")
        .eq(
          "property_id",
          propertyId
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

    if (findError) {
      console.error(
        "AI VIDEO DATABASE LOAD ERROR:",
        findError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            findError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (
      !records ||
      records.length === 0
    ) {
      return NextResponse.json({
        success: true,
        videos: [],
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CHECK RUNWAY TASKS
    |--------------------------------------------------------------------------
    */

    const updatedVideos: any[] =
      [];

    for (
      const record of records
    ) {
      /*
      |--------------------------------------------------------------------------
      | ALREADY COMPLETE
      |--------------------------------------------------------------------------
      */

      if (
        record.video_url &&
        record.status ===
          "completed"
      ) {
        updatedVideos.push(
          record
        );

        continue;
      }

      try {
        console.log(
          "=================================================="
        );

        console.log(
          "AI VIDEO: checking Runway task:",
          record.video_id
        );

        /*
        |--------------------------------------------------------------------------
        | RETRIEVE RUNWAY TASK
        |--------------------------------------------------------------------------
        */

        const runwayTask =
          await runway.tasks.retrieve(
            record.video_id
          );

        const runwayStatus =
          runwayTask.status;

        console.log(
          "AI VIDEO RUNWAY STATUS:",
          record.video_id,
          runwayStatus
        );

        /*
        |--------------------------------------------------------------------------
        | FAILED
        |--------------------------------------------------------------------------
        */

        if (
          runwayStatus ===
          "FAILED"
        ) {
          const failureCode =
            (runwayTask as any)
              ?.failureCode;

          const failureMessage =
            (runwayTask as any)
              ?.failure ||
            failureCode ||
            "Runway video generation failed.";

          console.error(
            "AI VIDEO RUNWAY FAILED:",
            record.video_id,
            failureMessage
          );

          await supabaseAdmin
            .from("ai_videos")
            .update({
              status:
                "failed",

              progress:
                0,

              error_message:
                String(
                  failureMessage
                ),
            })
            .eq(
              "id",
              record.id
            );

          updatedVideos.push({
            ...record,

            status:
              "failed",

            progress:
              0,

            error_message:
              String(
                failureMessage
              ),
          });

          continue;
        }

        /*
        |--------------------------------------------------------------------------
        | CANCELED
        |--------------------------------------------------------------------------
        */

        if (
          runwayStatus ===
          "CANCELLED"
        ) {
          const errorMessage =
            "Runway video generation was canceled.";

          console.error(
            "AI VIDEO RUNWAY CANCELED:",
            record.video_id
          );

          await supabaseAdmin
            .from("ai_videos")
            .update({
              status:
                "failed",

              progress:
                0,

              error_message:
                errorMessage,
            })
            .eq(
              "id",
              record.id
            );

          updatedVideos.push({
            ...record,

            status:
              "failed",

            progress:
              0,

            error_message:
              errorMessage,
          });

          continue;
        }

        /*
        |--------------------------------------------------------------------------
        | COMPLETED
        |--------------------------------------------------------------------------
        */

        if (
          runwayStatus ===
          "SUCCEEDED"
        ) {
          console.log(
            "AI VIDEO: Runway completed:",
            record.video_id
          );

          const outputUrl =
            (runwayTask as any)
              ?.output?.[0];

          if (!outputUrl) {
            throw new Error(
              "Runway task completed but no output video URL was returned."
            );
          }

          console.log(
            "AI VIDEO: Runway output URL received."
          );

          /*
          |--------------------------------------------------------------------------
          | DOWNLOAD MP4 FROM RUNWAY
          |--------------------------------------------------------------------------
          */

          console.log(
            "AI VIDEO: downloading MP4 from Runway..."
          );

          const videoResponse =
            await fetch(
              outputUrl
            );

          if (
            !videoResponse.ok
          ) {
            throw new Error(
              `Failed to download Runway video (${videoResponse.status}).`
            );
          }

          const videoArrayBuffer =
            await videoResponse.arrayBuffer();

          const videoBuffer =
            Buffer.from(
              videoArrayBuffer
            );

          console.log(
            "AI VIDEO: MP4 downloaded:",
            videoBuffer.length,
            "bytes"
          );

          /*
          |--------------------------------------------------------------------------
          | SUPABASE STORAGE
          |--------------------------------------------------------------------------
          */

          const fileName =
            `property-${propertyId}/ai-video-${record.video_id}.mp4`;

          console.log(
            "AI VIDEO: uploading to Supabase:",
            fileName
          );

          const {
            error: uploadError,
          } =
            await supabaseAdmin
              .storage
              .from(
                "ai-videos"
              )
              .upload(
                fileName,
                videoBuffer,
                {
                  contentType:
                    "video/mp4",

                  cacheControl:
                    "31536000",

                  upsert:
                    true,
                }
              );

          if (
            uploadError
          ) {
            console.error(
              "AI VIDEO STORAGE ERROR:",
              uploadError
            );

            await supabaseAdmin
              .from(
                "ai_videos"
              )
              .update({
                status:
                  "completed",

                progress:
                  100,

                error_message:
                  `Video generated but upload failed: ${uploadError.message}`,
              })
              .eq(
                "id",
                record.id
              );

            updatedVideos.push({
              ...record,

              status:
                "completed",

              progress:
                100,

              error_message:
                `Video generated but upload failed: ${uploadError.message}`,
            });

            continue;
          }

          /*
          |--------------------------------------------------------------------------
          | PUBLIC URL
          |--------------------------------------------------------------------------
          */

          const {
            data:
              publicUrlData,
          } =
            supabaseAdmin
              .storage
              .from(
                "ai-videos"
              )
              .getPublicUrl(
                fileName
              );

          const videoUrl =
            publicUrlData
              ?.publicUrl;

          if (!videoUrl) {
            throw new Error(
              "Video uploaded but no public URL was generated."
            );
          }

          console.log(
            "AI VIDEO PUBLIC URL:",
            videoUrl
          );

          /*
          |--------------------------------------------------------------------------
          | UPDATE DATABASE
          |--------------------------------------------------------------------------
          */

          const {
            data:
              updatedRecord,
            error:
              updateError,
          } =
            await supabaseAdmin
              .from(
                "ai_videos"
              )
              .update({
                status:
                  "completed",

                progress:
                  100,

                video_url:
                  videoUrl,

                completed_at:
                  new Date()
                    .toISOString(),

                error_message:
                  null,
              })
              .eq(
                "id",
                record.id
              )
              .select()
              .single();

          if (
            updateError
          ) {
            throw new Error(
              updateError.message
            );
          }

          console.log(
            "AI VIDEO: RUNWAY VIDEO SAVED SUCCESSFULLY"
          );

          updatedVideos.push(
            updatedRecord
          );

          continue;
        }

        /*
        |--------------------------------------------------------------------------
        | STILL PROCESSING
        |--------------------------------------------------------------------------
        |
        | Runway uses:
        |
        | PENDING
        | RUNNING
        |
        | We map both into MIB's existing
        | processing state.
        |
        */

        let mappedStatus =
          "processing";

        if (
          runwayStatus ===
          "PENDING"
        ) {
          mappedStatus =
            "queued";
        }

        if (
          runwayStatus ===
          "RUNNING"
        ) {
          mappedStatus =
            "processing";
        }

        await supabaseAdmin
          .from("ai_videos")
          .update({
            status:
              mappedStatus,

            progress:
              0,
          })
          .eq(
            "id",
            record.id
          );

        updatedVideos.push({
          ...record,

          status:
            mappedStatus,

          progress:
            0,
        });

      } catch (
        runwayError: any
      ) {
        console.error(
          "AI VIDEO RUNWAY CHECK ERROR:",
          runwayError
        );

        updatedVideos.push({
          ...record,

          error_message:
            runwayError
              ?.message ||
            "Failed to check Runway video.",
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | RETURN
    |--------------------------------------------------------------------------
    */

    return NextResponse.json({
      success: true,

      videos:
        updatedVideos,
    });

  } catch (
    error: any
  ) {
    console.error(
      "AI PROPERTY VIDEO GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error?.message ||
          "Failed to load AI property videos.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| DELETE — DELETE VIDEO FROM SUPABASE + DATABASE
|--------------------------------------------------------------------------
*/

export async function DELETE(
  request: Request
) {
  const auth = await requireUser();
  if (!auth.user) return auth.response;

  try {
    const body =
      await request.json();

    const videoRecordId =
      body?.id;

    if (!videoRecordId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Video record id is required.",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "=================================================="
    );

    console.log(
      "AI VIDEO DELETE: START"
    );

    console.log(
      "Database ID:",
      videoRecordId
    );

    /*
    |--------------------------------------------------------------------------
    | FIND VIDEO RECORD
    |--------------------------------------------------------------------------
    */

    const {
      data: videoRecord,
      error: findError,
    } =
      await supabaseAdmin
        .from("ai_videos")
        .select("*")
        .eq(
          "id",
          videoRecordId
        )
        .single();

    if (findError) {
      console.error(
        "AI VIDEO DELETE: DATABASE LOOKUP ERROR:",
        findError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            findError.message,
        },
        {
          status: 404,
        }
      );
    }

    if (!videoRecord) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Video record not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE SUPABASE STORAGE FILE
    |--------------------------------------------------------------------------
    */

    if (
      videoRecord.video_url
    ) {
      console.log(
        "AI VIDEO DELETE: video URL found."
      );

      /*
       * Our storage path format is:
       *
       * property-{propertyId}/ai-video-{videoId}.mp4
       */

      const storagePath =
        `property-${videoRecord.property_id}/ai-video-${videoRecord.video_id}.mp4`;

      console.log(
        "AI VIDEO DELETE: removing storage file:",
        storagePath
      );

      const {
        error:
          storageError,
      } =
        await supabaseAdmin
          .storage
          .from("ai-videos")
          .remove([
            storagePath,
          ]);

      if (
        storageError
      ) {
        console.error(
          "AI VIDEO DELETE: STORAGE ERROR:",
          storageError
        );

        return NextResponse.json(
          {
            success: false,

            error:
              `Could not delete video from Supabase Storage: ${storageError.message}`,
          },
          {
            status: 500,
          }
        );
      }

      console.log(
        "AI VIDEO DELETE: storage file deleted."
      );

    } else {
      console.log(
        "AI VIDEO DELETE: no storage file to delete."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE DATABASE RECORD
    |--------------------------------------------------------------------------
    */

    console.log(
      "AI VIDEO DELETE: deleting database record..."
    );

    const {
      error:
        deleteError,
    } =
      await supabaseAdmin
        .from("ai_videos")
        .delete()
        .eq(
          "id",
          videoRecordId
        );

    if (
      deleteError
    ) {
      console.error(
        "AI VIDEO DELETE: DATABASE DELETE ERROR:",
        deleteError
      );

      return NextResponse.json(
        {
          success: false,

          error:
            `Video file was removed from storage, but database deletion failed: ${deleteError.message}`,
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "AI VIDEO DELETE: DATABASE RECORD DELETED."
    );

    console.log(
      "AI VIDEO DELETE: COMPLETE"
    );

    console.log(
      "=================================================="
    );

    return NextResponse.json({
      success: true,

      deletedId:
        videoRecordId,

      message:
        "AI video deleted successfully.",
    });

  } catch (error: any) {
    console.error(
      "AI PROPERTY VIDEO DELETE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error?.message ||
          "Failed to delete AI video.",
      },
      {
        status: 500,
      }
    );
  }
}