import { NextResponse } from "next/server";

import {
  createClient,
} from "@supabase/supabase-js";

const supabaseAdmin =
  createClient(
    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,
    process.env
      .SUPABASE_SERVICE_ROLE_KEY!
  );

/*
|--------------------------------------------------------------------------
| POST CREATE VIDEO PROJECT
|--------------------------------------------------------------------------
|
| Creates one parent project for the current AI video generation.
|
| The frontend creates the project first.
| Individual Runway shots are then attached to this project.
|
*/

export async function POST(
  request: Request
) {
  try {

    const body =
      await request
        .json()
        .catch(
          () => null
        );

    const propertyId =
      body?.propertyId;

    const clipCount =
      body?.clipCount;

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
      !propertyId
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "propertyId is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !clipCount ||
      Number(clipCount) < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "clipCount must be at least 1.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | VERIFY PROPERTY
    |--------------------------------------------------------------------------
    */

    const {
      data: property,
      error:
        propertyError,
    } =
      await supabaseAdmin
        .from(
          "properties"
        )
        .select(
          "id"
        )
        .eq(
          "id",
          Number(
            propertyId
          )
        )
        .maybeSingle();

    if (
      propertyError
    ) {
      console.error(
        "AI VIDEO PROJECT PROPERTY LOAD ERROR:",
        propertyError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            propertyError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (!property) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Property not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE PROJECT
    |--------------------------------------------------------------------------
    */

    const {
      data: project,
      error:
        projectError,
    } =
      await supabaseAdmin
        .from(
          "ai_video_projects"
        )
        .insert({
          property_id:
            Number(
              propertyId
            ),

          status:
            "generating",

          clip_count:
            Number(
              clipCount
            ),

          final_video_url:
            null,

          completed_at:
            null,

          error_message:
            null,
        })
        .select(
          `
            id,
            property_id,
            status,
            clip_count,
            final_video_url,
            created_at,
            completed_at,
            error_message
          `
        )
        .single();

    if (
      projectError
    ) {
      console.error(
        "AI VIDEO PROJECT CREATE ERROR:",
        projectError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            projectError.message,
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "AI VIDEO PROJECT CREATED:",
      {
        projectId:
          project.id,

        propertyId:
          project.property_id,

        clipCount:
          project.clip_count,
      }
    );

    /*
    |--------------------------------------------------------------------------
    | RETURN PROJECT
    |--------------------------------------------------------------------------
    */

    return NextResponse.json({
      success: true,

      project,
    });

  } catch (
    error: any
  ) {

    console.error(
      "AI VIDEO PROJECT CREATE API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to create AI video project.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| GET FINAL VIDEO HISTORY
|--------------------------------------------------------------------------
|
| Returns ONLY completed assembled property videos.
|
| Individual Runway shots are stored elsewhere and are never returned
| as final-video history.
|
*/

export async function GET(
  request: Request
) {
  try {
    const {
      searchParams,
    } = new URL(
      request.url
    );

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

    const numericPropertyId =
      Number(propertyId);

    if (
      !Number.isFinite(
        numericPropertyId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid property_id.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | LOAD ALL VIDEO PROJECTS
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    | Do not filter by status here.
    |
    | A previous failed rebuild may have changed a project from "completed"
    | to "failed" even though its final MP4 still exists in Supabase Storage.
    |
    */

    const {
      data: projects,
      error,
    } =
      await supabaseAdmin
        .from(
          "ai_video_projects"
        )
        .select(
          `
            id,
            property_id,
            status,
            clip_count,
            final_video_url,
            created_at,
            completed_at,
            error_message
          `
        )
        .eq(
          "property_id",
          numericPropertyId
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        )
        .limit(20);

    if (error) {
      console.error(
        "AI VIDEO PROJECT HISTORY LOAD ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            error.message,
        },
        {
          status: 500,
        }
      );
    }

    const allProjects =
      projects || [];

    /*
    |--------------------------------------------------------------------------
    | RECOVER FINAL VIDEOS
    |--------------------------------------------------------------------------
    |
    | For every project:
    |
    | 1. If final_video_url already exists, keep it.
    | 2. Otherwise check Supabase Storage for:
    |
    |    property-{propertyId}/projects/{projectId}/final-video.mp4
    |
    | 3. If the MP4 exists, restore the DB record to completed.
    |
    | This does NOT touch Runway shots.
    |
    */

    for (
      const project of allProjects
    ) {

      const storageFolder =
        `property-${project.property_id}/projects/${project.id}`;

      /*
      |--------------------------------------------------------------------------
      | EXISTING DATABASE URL
      |--------------------------------------------------------------------------
      */

      if (
        project.final_video_url
      ) {

        /*
        | If a previous rebuild incorrectly marked the project failed,
        | restore completed status because the final video still exists.
        */

        /*
        |--------------------------------------------------------------------------
        | FRESH RESPONSE URL
        |--------------------------------------------------------------------------
        |
        | Keep the canonical storage URL in the database, but return a
        | cache-busted URL to the browser.
        |
        */
        project.final_video_url =
          `${project.final_video_url}${
            project.final_video_url.includes("?")
              ? "&"
              : "?"
          }v=${encodeURIComponent(
            project.completed_at ||
              project.created_at ||
              new Date().toISOString()
          )}`;

        if (
          project.status !==
          "completed"
        ) {

          const completedAt =
            project.completed_at ||
            new Date().toISOString();

          const {
            error:
              restoreError,
          } =
            await supabaseAdmin
              .from(
                "ai_video_projects"
              )
              .update({
                status:
                  "completed",

                completed_at:
                  completedAt,

                error_message:
                  null,
              })
              .eq(
                "id",
                project.id
              );

          if (
            restoreError
          ) {

            console.error(
              "AI VIDEO PROJECT STATUS RESTORE ERROR:",
              {
                projectId:
                  project.id,
                error:
                  restoreError,
              }
            );

          } else {

            project.status =
              "completed";

            project.completed_at =
              completedAt;

            project.error_message =
              null;

            console.log(
              "AI VIDEO PROJECT STATUS RESTORED:",
              {
                projectId:
                  project.id,
              }
            );
          }
        }

        continue;
      }

      /*
      |--------------------------------------------------------------------------
      | NO DATABASE URL — CHECK STORAGE
      |--------------------------------------------------------------------------
      */

      const {
        data:
          storageFiles,
        error:
          storageListError,
      } =
        await supabaseAdmin
          .storage
          .from(
            "ai-videos"
          )
          .list(
            storageFolder,
            {
              limit: 100,
            }
          );

      if (
        storageListError
      ) {

        console.warn(
          "AI VIDEO STORAGE RECOVERY CHECK FAILED:",
          {
            projectId:
              project.id,
            storageFolder,
            error:
              storageListError.message,
          }
        );

        continue;
      }

      const finalFile =
        (
          storageFiles ||
          []
        ).find(
          (
            file
          ) =>
            file.name ===
            "final-video.mp4"
        );

      if (!finalFile) {
        continue;
      }

      /*
      |--------------------------------------------------------------------------
      | FINAL MP4 FOUND
      |--------------------------------------------------------------------------
      */

      const finalStoragePath =
        `${storageFolder}/final-video.mp4`;

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
            finalStoragePath
          );

      const completedAt =
        project.completed_at ||
        new Date().toISOString();

      const finalVideoUrl =
        `${publicUrlData.publicUrl}${
          publicUrlData.publicUrl.includes("?")
            ? "&"
            : "?"
        }v=${encodeURIComponent(
          completedAt
        )}`;

      /*
      |--------------------------------------------------------------------------
      | RESTORE DATABASE
      |--------------------------------------------------------------------------
      */

      const {
        error:
          recoveryError,
      } =
        await supabaseAdmin
          .from(
            "ai_video_projects"
          )
          .update({
            status:
              "completed",

            final_video_url:
              finalVideoUrl,

            completed_at:
              completedAt,

            error_message:
              null,
          })
          .eq(
            "id",
            project.id
          );

      if (
        recoveryError
      ) {

        console.error(
          "AI VIDEO PROJECT RECOVERY UPDATE ERROR:",
          {
            projectId:
              project.id,
            error:
              recoveryError,
          }
        );

        continue;
      }

      /*
      |--------------------------------------------------------------------------
      | UPDATE RESPONSE OBJECT
      |--------------------------------------------------------------------------
      */

      project.status =
        "completed";

      project.final_video_url =
        finalVideoUrl;

      project.completed_at =
        completedAt;

      project.error_message =
        null;

      console.log(
        "AI VIDEO PROJECT RECOVERED:",
        {
          projectId:
            project.id,
          propertyId:
            project.property_id,
          finalStoragePath,
          finalVideoUrl,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | RETURN ONLY VALID FINAL VIDEOS
    |--------------------------------------------------------------------------
    */

    const finalProjects =
      allProjects.filter(
        (
          project
        ) =>
          project.status ===
            "completed" &&
          Boolean(
            project.final_video_url
          )
      );

    return NextResponse.json({
      success: true,

      /*
      |--------------------------------------------------------------------------
      | BACKWARD COMPATIBILITY
      |--------------------------------------------------------------------------
      */

      project:
        finalProjects[0] ||
        null,

      /*
      |--------------------------------------------------------------------------
      | FINAL VIDEO HISTORY
      |--------------------------------------------------------------------------
      */

      projects:
        finalProjects,
    });

  } catch (
    error: any
  ) {

    console.error(
      "AI VIDEO PROJECT HISTORY API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to load final video history.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: Request
) {
  try {

    const body =
      await request
        .json()
        .catch(
          () => null
        );

    const projectId =
      body?.projectId;

    const propertyId =
      body?.propertyId;

    if (
      !projectId ||
      !propertyId
    ) {

      return NextResponse.json(
        {
          success: false,
          error:
            "projectId and propertyId are required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | LOAD PROJECT
    |--------------------------------------------------------------------------
    */

    const {
      data: project,
      error:
        projectError,
    } =
      await supabaseAdmin
        .from(
          "ai_video_projects"
        )
        .select(
          `
            id,
            property_id,
            status,
            final_video_url
          `
        )
        .eq(
          "id",
          projectId
        )
        .eq(
          "property_id",
          Number(
            propertyId
          )
        )
        .maybeSingle();

    if (
      projectError
    ) {

      console.error(
        "AI VIDEO PROJECT DELETE LOAD ERROR:",
        projectError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            projectError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (!project) {

      return NextResponse.json(
        {
          success: false,
          error:
            "Final video project not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE FINAL MP4
    |--------------------------------------------------------------------------
    */

    const storagePath =
      `property-${project.property_id}/projects/${project.id}/final-video.mp4`;

    const {
      error:
        storageError,
    } =
      await supabaseAdmin
        .storage
        .from(
          "ai-videos"
        )
        .remove([
          storagePath,
        ]);

    if (
      storageError
    ) {

      console.error(
        "AI FINAL VIDEO STORAGE DELETE ERROR:",
        storageError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            storageError.message,
        },
        {
          status: 500,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE DATABASE PROJECT
    |--------------------------------------------------------------------------
    */

    const {
      error:
        deleteError,
    } =
      await supabaseAdmin
        .from(
          "ai_video_projects"
        )
        .delete()
        .eq(
          "id",
          project.id
        )
        .eq(
          "property_id",
          Number(
            propertyId
          )
        );

    if (
      deleteError
    ) {

      console.error(
        "AI VIDEO PROJECT DELETE ERROR:",
        deleteError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            deleteError.message,
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "AI FINAL VIDEO DELETED:",
      {
        projectId:
          project.id,

        propertyId:
          project.property_id,

        storagePath,
      }
    );

    return NextResponse.json({
      success: true,

      deletedProjectId:
        project.id,
    });

  } catch (
    error: any
  ) {

    console.error(
      "AI VIDEO PROJECT DELETE API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to delete final video.",
      },
      {
        status: 500,
      }
    );
  }
}