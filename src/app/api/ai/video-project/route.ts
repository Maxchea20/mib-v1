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
| GET FINAL VIDEO HISTORY
|--------------------------------------------------------------------------
|
| Returns ONLY completed assembled property videos.
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
          Number(
            propertyId
          )
        )
        .eq(
          "status",
          "completed"
        )
        .not(
          "final_video_url",
          "is",
          null
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

    const finalProjects =
      projects || [];

    return NextResponse.json({
      success: true,

      /*
      |--------------------------------------------------------------------------
      | BACKWARD COMPATIBILITY
      |--------------------------------------------------------------------------
      |
      | Existing frontend logic can still use data.project as the latest
      | completed project.
      |
      */

      project:
        finalProjects[0] ||
        null,

      /*
      |--------------------------------------------------------------------------
      | NEW FINAL VIDEO HISTORY
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

/*
|--------------------------------------------------------------------------
| DELETE FINAL ASSEMBLED VIDEO
|--------------------------------------------------------------------------
|
| Deletes:
| 1. The final MP4 from Supabase Storage
| 2. The corresponding ai_video_projects row
|
| Individual Runway shot records are NOT deleted here.
| This keeps this action strictly about final assembled videos.
|
*/

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
    |
    | The assembler stores final videos using this deterministic path:
    |
    | property-{propertyId}/projects/{projectId}/final-video.mp4
    |
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
