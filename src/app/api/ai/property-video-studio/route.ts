import { NextResponse } from "next/server";

import {
  createClient,
} from "@supabase/supabase-js";

import sharp from "sharp";

import RunwayML from "@runwayml/sdk";

/*
|--------------------------------------------------------------------------
| RUNWAY
|--------------------------------------------------------------------------
*/

const runway =
  new RunwayML({
    apiKey:
      process.env.RUNWAYML_API_SECRET,
  });

/*
|--------------------------------------------------------------------------
| SUPABASE
|--------------------------------------------------------------------------
*/

const supabaseAdmin =
  createClient(
    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,
    process.env
      .SUPABASE_SERVICE_ROLE_KEY!
  );

/*
|--------------------------------------------------------------------------
| VIDEO SETTINGS
|--------------------------------------------------------------------------
|
| Keep these values aligned with the Runway model
| and account settings we already tested.
|
*/

const VIDEO_WIDTH =
  720;

const VIDEO_HEIGHT =
  1280;

const VIDEO_MODEL =
  "gen4_turbo";

const VIDEO_RATIO =
  "720:1280";

const VIDEO_DURATION =
  5;

/*
|--------------------------------------------------------------------------
| RUNWAY MASTER PROMPT
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| Runway promptText has a character limit.
|
| Keep the permanent instructions concise.
| The AI Director's actionScript contains the
| shot-specific cinematography.
|
|--------------------------------------------------------------------------
*/

const MASTER_PROMPT = `
Professional real-estate cinematography.

The supplied photograph is the exact property and is
the absolute visual source of truth.

Preserve the property exactly as shown.

Keep architecture, structure, proportions, windows,
doors, furniture, appliances, materials, vehicles
and all visible objects unchanged.

Do not add, remove, redesign, renovate or beautify
the property.

Do not invent rooms, architecture, furniture,
windows, doors, balconies, pools, gardens, people,
vehicles or scenery.

Do not reveal areas that are not visible.

Create ONE continuous realistic camera shot.

The PROPERTY remains stable.
The CAMERA physically moves.

Movement must be clearly visible throughout the shot.

Use realistic perspective, depth and natural parallax.

Do not create a static photograph with digital zoom.

No cuts.
No scene changes.
No teleporting.
No impossible camera movement.
No text.
No captions.
No subtitles.
No logos.
No watermarks.
`;

/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
*/

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    /*
    |--------------------------------------------------------------------------
    | INPUTS
    |--------------------------------------------------------------------------
    */

    const propertyId =
      body?.propertyId;

    const projectId =
      body?.projectId;

    const imageUrl =
      body?.imageUrl;

    const photoIndex =
      body?.photoIndex;

    const shotOrder =
      body?.shotOrder;

    const videoStyle =
      body?.videoStyle ||
      "professional_real_estate";

    const director =
      body?.director || {};

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
      propertyId ===
        null ||
      propertyId ===
        undefined
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
      !projectId ||
      typeof projectId !==
        "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "projectId is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !imageUrl ||
      typeof imageUrl !==
        "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "imageUrl is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | DIRECTOR ACTION SCRIPT
    |--------------------------------------------------------------------------
    |
    | This is now the important part.
    |
    | The AI Director has already decided:
    |
    | - what the shot should do
    | - how the camera should move
    | - where it should start
    | - where it should end
    | - what should remain stable
    |
    | DO NOT reduce this into old fields such as:
    |
    | cameraMovement
    | direction
    | zoom
    | strength
    |
    |--------------------------------------------------------------------------
    */

    const actionScript =
      typeof director.actionScript ===
      "string"
        ? director.actionScript.trim()
        : "";

    const shotType =
      typeof director.shotType ===
      "string"
        ? director.shotType.trim()
        : "Property Cinematic Shot";

    const reason =
      typeof director.reason ===
      "string"
        ? director.reason.trim()
        : "";

    /*
    |--------------------------------------------------------------------------
    | DIRECTOR VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
      !actionScript
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "AI Director actionScript is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | DIRECTOR → RUNWAY PROMPT
    |--------------------------------------------------------------------------
    */

    const directorInstruction = `
MIB AI DIRECTOR — SHOT EXECUTION

Video style:
${videoStyle}

Photo index:
${photoIndex ?? "unknown"}

Shot order:
${shotOrder ?? "unknown"}

Shot type:
${shotType}

DIRECTOR ACTION SCRIPT:
${actionScript}

DIRECTOR REASON:
${reason || "Use the most suitable realistic treatment for the photograph."}

EXECUTION RULE:

Follow the Director Action Script as the primary
camera direction for this shot.

The camera must physically perform the described
movement.

Make the movement clearly visible and continuous.

Do not replace the Director's movement with a
static shot.

Do not reduce the movement to a digital zoom.

Preserve the original photograph's composition,
architecture and visible objects.

If a tiny adjustment is necessary to keep the
movement physically realistic for the actual
photograph, make the smallest possible adjustment
while preserving the Director's intended movement.

Finish the shot according to the Director's
specified ending composition.
`;

    /*
    |--------------------------------------------------------------------------
    | FINAL PROMPT
    |--------------------------------------------------------------------------
    */

    const prompt =
      MASTER_PROMPT +
      "\n\n" +
      directorInstruction;

    /*
    |--------------------------------------------------------------------------
    | RUNWAY PROMPT LENGTH
    |--------------------------------------------------------------------------
    |
    | The current Runway setup has a promptText limit.
    |
    | IMPORTANT:
    |
    | We do NOT want to blindly cut the Director's
    | actionScript in the middle.
    |
    | Therefore:
    |
    | 1. Build the full prompt.
    | 2. If it exceeds the limit, preserve the
    |    Action Script first.
    |
    |--------------------------------------------------------------------------
    */

    const MAX_PROMPT_LENGTH =
      1000;

    let finalPrompt =
      prompt;

    if (
      prompt.length >
      MAX_PROMPT_LENGTH
    ) {
      console.warn(
        "AI VIDEO STUDIO: Runway prompt exceeds 1000 characters."
      );

      /*
      |--------------------------------------------------------------------------
      | COMPACT FALLBACK
      |--------------------------------------------------------------------------
      |
      | Keep the essential preservation rules +
      | the complete Director action where possible.
      |
      */

      const compactMaster = `
Real-estate camera shot.

The supplied photograph is the exact property
and absolute visual source of truth.

Preserve architecture, structure, proportions,
windows, doors, furniture, materials and all
visible objects exactly.

Do not add, remove, redesign or invent anything.

The PROPERTY remains stable.
The CAMERA physically moves.

Movement must be clearly visible.
Use realistic perspective and natural parallax.
No digital zoom.
No cuts.
No scene changes.
No teleporting.
No impossible movement.
`;

      const compactDirector = `
DIRECTOR ACTION:
${actionScript}

Execute this camera movement clearly and continuously.
Preserve the property and finish on the Director's
specified ending composition.
`;

      const combined =
        compactMaster +
        "\n" +
        compactDirector;

      /*
      |--------------------------------------------------------------------------
      | If still too long, preserve the action script
      |--------------------------------------------------------------------------
      */

      if (
        combined.length >
        MAX_PROMPT_LENGTH
      ) {
        const actionPrefix =
          `
DIRECTOR ACTION:
`;

        const endingInstruction =
          `
Execute this camera movement clearly and continuously.
Preserve the exact property.
`;

        const availableActionLength =
          Math.max(
            200,
            MAX_PROMPT_LENGTH -
              actionPrefix.length -
              endingInstruction.length -
              180
          );

        const trimmedAction =
          actionScript.slice(
            0,
            availableActionLength
          );

        finalPrompt =
          `
Real-estate cinematography.
The supplied photograph is the exact property and
absolute visual source of truth.
Preserve architecture, structure, proportions,
windows, doors, furniture, materials and visible
objects exactly.
Do not add, remove, redesign or invent anything.
The PROPERTY remains stable.
The CAMERA physically moves.
No digital zoom. No cuts. No scene changes.
No teleporting. No impossible movement.

${actionPrefix}
${trimmedAction}

${endingInstruction}
`;
      } else {
        finalPrompt =
          combined;
      }
    }

    /*
    |--------------------------------------------------------------------------
    | FINAL LENGTH SAFETY
    |--------------------------------------------------------------------------
    */

    if (
      finalPrompt.length >
      MAX_PROMPT_LENGTH
    ) {
      finalPrompt =
        finalPrompt.slice(
          0,
          MAX_PROMPT_LENGTH
        );
    }

    /*
    |--------------------------------------------------------------------------
    | LOG
    |--------------------------------------------------------------------------
    */

    console.log(
      "=================================================="
    );

    console.log(
      "AI VIDEO STUDIO: RUNWAY START"
    );

    console.log(
      "Provider: Runway"
    );

    console.log(
      "Model:",
      VIDEO_MODEL
    );

    console.log(
      "Property ID:",
      propertyId
    );

    console.log(
      "Project ID:",
      projectId
    );

    console.log(
      "Photo Index:",
      photoIndex
    );

    console.log(
      "Shot Order:",
      shotOrder
    );

    console.log(
      "Video Style:",
      videoStyle
    );

    console.log(
      "Shot Type:",
      shotType
    );

    console.log(
      "Director Action Script:",
      actionScript
    );

    console.log(
      "Runway Prompt Length:",
      finalPrompt.length
    );

    console.log(
      "Runway Prompt:"
    );

    console.log(
      finalPrompt
    );

    console.log(
      "=================================================="
    );

    /*
    |--------------------------------------------------------------------------
    | DOWNLOAD PROPERTY IMAGE
    |--------------------------------------------------------------------------
    */

    console.log(
      "AI VIDEO STUDIO: downloading image..."
    );

    const imageResponse =
      await fetch(
        imageUrl
      );

    if (
      !imageResponse.ok
    ) {
      throw new Error(
        `Failed to download property image (${imageResponse.status}).`
      );
    }

    const originalBuffer =
      Buffer.from(
        await imageResponse.arrayBuffer()
      );

    console.log(
      "AI VIDEO STUDIO: original image downloaded:",
      originalBuffer.length,
      "bytes"
    );

    /*
    |--------------------------------------------------------------------------
    | RESIZE IMAGE
    |--------------------------------------------------------------------------
    */

    console.log(
      "AI VIDEO STUDIO: resizing image..."
    );

    const imageBuffer =
      await sharp(
        originalBuffer
      )
        .resize(
          VIDEO_WIDTH,
          VIDEO_HEIGHT,
          {
            fit:
              "cover",

            position:
              "centre",
          }
        )
        .jpeg({
          quality:
            90,
        })
        .toBuffer();

    console.log(
      "AI VIDEO STUDIO: image resized:",
      imageBuffer.length,
      "bytes"
    );

    /*
    |--------------------------------------------------------------------------
    | DATA URI
    |--------------------------------------------------------------------------
    */

    const imageDataUri =
      `data:image/jpeg;base64,${imageBuffer.toString(
        "base64"
      )}`;

    /*
    |--------------------------------------------------------------------------
    | CREATE RUNWAY JOB
    |--------------------------------------------------------------------------
    */

    console.log(
      "AI VIDEO STUDIO: sending request to Runway..."
    );

    const task =
      await runway
        .imageToVideo
        .create({
          model:
            VIDEO_MODEL,

          promptImage:
            imageDataUri,

          promptText:
            finalPrompt,

          ratio:
            VIDEO_RATIO,

          duration:
            VIDEO_DURATION,
        });

    console.log(
      "AI VIDEO STUDIO: RUNWAY JOB CREATED"
    );

    console.log(
      "Runway Task ID:",
      task.id
    );

    /*
    |--------------------------------------------------------------------------
    | SAVE SHOT
    |--------------------------------------------------------------------------
    */

    const {
      data:
        videoRecord,
      error:
        databaseError,
    } =
      await supabaseAdmin
        .from(
          "ai_videos"
        )
        .insert({
          property_id:
            propertyId,

          project_id:
            projectId,

          video_id:
            task.id,

          photo_index:
            photoIndex ??
            null,

          shot_order:
            shotOrder ??
            null,

          video_type:
            "shot",

          status:
            "queued",

          progress:
            0,
        })
        .select()
        .single();

    /*
    |--------------------------------------------------------------------------
    | DATABASE ERROR
    |--------------------------------------------------------------------------
    */

    if (
      databaseError
    ) {
      console.error(
        "AI VIDEO STUDIO DATABASE ERROR:",
        databaseError
      );

      return NextResponse.json(
        {
          success: false,

          error:
            databaseError.message,

          videoId:
            task.id,

          projectId,
        },
        {
          status: 500,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | SUCCESS
    |--------------------------------------------------------------------------
    */

    console.log(
      "AI VIDEO STUDIO: RUNWAY SHOT SAVED SUCCESSFULLY"
    );

    console.log({
      databaseId:
        videoRecord.id,

      projectId,

      propertyId,

      photoIndex,

      shotOrder,

      runwayTaskId:
        task.id,
    });

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return NextResponse.json({
      success:
        true,

      videoId:
        task.id,

      databaseId:
        videoRecord.id,

      projectId,

      propertyId,

      photoIndex,

      shotOrder,

      status:
        "queued",

      progress:
        0,
    });
  } catch (
    error: any
  ) {
    console.error(
      "=================================================="
    );

    console.error(
      "AI PROPERTY VIDEO STUDIO RUNWAY ERROR:"
    );

    console.error(
      error
    );

    console.error(
      "=================================================="
    );

    return NextResponse.json(
      {
        success:
          false,

        error:
          error?.message ||
          "Failed to create Runway AI video shot.",
      },
      {
        status: 500,
      }
    );
  }
}