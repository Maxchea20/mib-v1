import OpenAI, { toFile } from "openai";
import RunwayML from "@runwayml/sdk";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { requireUser } from "@/lib/apiAuth";

/*
|--------------------------------------------------------------------------
| OPENAI
|--------------------------------------------------------------------------
*/

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
| VIDEO SETTINGS
|--------------------------------------------------------------------------
*/

const VIDEO_WIDTH = 720;
const VIDEO_HEIGHT = 1280;

/*
|--------------------------------------------------------------------------
| SORA 2 MASTER PROMPT
|--------------------------------------------------------------------------
|
| Sora acts as the cinematographer.
|
| MIB controls:
| - property truth
| - realism
| - duration
| - format
| - no text
| - no voiceover
|
| Sora controls:
| - camera movement
| - visual composition
| - cinematic treatment
| - pacing
| - depth
|
*/

const SORA_PROPERTY_VIDEO_PROMPT = `
# MIB PROPERTY VIDEO — SORA 2
# ADAPTIVE CINEMATOGRAPHER MODE

You are an expert professional real-estate
cinematographer and visual director.

You are given ONE REAL PROPERTY PHOTOGRAPH.

The photograph shows an actual property.

Your job is to transform this exact photograph
into ONE short, realistic, premium cinematic
real-estate video shot.

You have creative freedom to decide HOW this
specific property should be filmed.

Do not use a fixed camera movement for every property.

Study the supplied photograph first.

Understand:

- the property architecture
- camera position
- composition
- foreground
- background
- available depth
- landscaping
- structures
- perspective
- visual balance
- strongest architectural features
- natural opportunities for camera movement

Then make your own professional cinematography
decision.

============================================================
CREATIVE DIRECTOR / CINEMATOGRAPHER MODE
============================================================

You decide the most appropriate camera movement
for THIS photograph.

Possible approaches may include:

- slow cinematic push-in
- subtle pull-back
- lateral dolly
- gentle tracking movement
- controlled parallax
- subtle perspective shift
- cinematic reframing
- gentle camera drift
- another realistic professional camera movement

These are examples, NOT requirements.

Do not automatically choose the same movement
for every property.

Choose the movement that makes THIS particular
property look most naturally impressive while
remaining truthful to the photograph.

Ask yourself:

"If I were a professional real-estate videographer
physically standing at the camera position shown
in this photograph, how would I film this exact
property for four seconds?"

Then make that decision yourself.

The movement should be clearly visible enough that
the result unmistakably feels like real video
footage rather than an animated still image.

However:

REALISM IS MORE IMPORTANT THAN DRAMA.

============================================================
PROPERTY PRESERVATION — ABSOLUTE PRIORITY
============================================================

The supplied photograph is the visual source of truth.

The actual property must remain recognisable,
accurate and visually faithful to the source image.

Preserve:

- building structure
- roof shape
- roof tiles
- windows
- doors
- gates
- fencing
- walls
- columns
- driveway
- landscaping
- trees
- vegetation
- surrounding environment
- visible furniture
- visible vehicles
- architectural proportions
- colours
- materials
- textures
- existing property features

Do NOT redesign the property.

Do NOT renovate the property.

Do NOT improve the property.

Do NOT make the property look newer,
larger or more luxurious than it actually is.

Do NOT change the architectural identity.

============================================================
NO INVENTION
============================================================

Do NOT invent anything that is not supported
by the supplied photograph.

Never add:

- rooms
- floors
- windows
- doors
- balconies
- extensions
- pools
- gardens
- furniture
- vehicles
- people
- pets
- decorative objects
- buildings
- architectural features
- signage

Do NOT remove existing architectural features.

Do NOT reconstruct unseen parts of the property.

Do NOT reveal what might exist behind the building,
behind a wall, behind a gate or outside the visible
camera view.

If an area is not visible in the photograph,
leave it unknown.

============================================================
CAMERA MOVEMENT
============================================================

The camera movement is your creative decision.

Choose ONE coherent professional movement.

The movement must be:

- smooth
- controlled
- physically believable
- cinematic
- clearly visible
- appropriate to the photograph

Avoid movement that would require impossible
physical camera positioning.

The camera must behave like a real professional
camera operated by a real videographer.

Do NOT:

- fly around the property
- orbit unrealistically
- spin around the building
- create impossible drone movement
- pass through walls
- pass through gates
- pass through fences
- pass through trees
- pass through objects
- reveal unseen areas
- create impossible perspective

Do not force dramatic movement simply to make
the shot exciting.

If the photograph has limited space for movement,
choose a simpler but still visibly cinematic movement.

============================================================
ARCHITECTURAL STABILITY
============================================================

The CAMERA moves.

The PROPERTY does not.

Keep permanent structures stable.

Do NOT allow:

- walls to warp
- roofs to bend
- windows to change shape
- doors to morph
- gates to stretch
- fences to deform
- columns to move
- buildings to breathe
- architectural edges to melt
- furniture to morph
- materials to change

Do NOT generate artificial 3D architecture.

Do NOT reconstruct the property as a 3D model.

Subtle photographic depth is acceptable.

Structural distortion is NOT acceptable.

============================================================
DEPTH / PARALLAX
============================================================

Use natural depth and subtle parallax only
where the photograph supports it.

Possible depth layers include:

- foreground
- vegetation
- gate
- fence
- driveway
- property
- background

Use your own judgement.

The depth should feel like real camera perspective.

Do NOT exaggerate parallax.

Do NOT create a miniature effect.

Do NOT make the image look like a 3D render.

============================================================
NATURAL ENVIRONMENT
============================================================

Where supported by the photograph, introduce
subtle natural environmental movement.

Examples:

- gentle leaves
- slight vegetation movement
- subtle tree movement
- light wind
- natural atmospheric movement

Keep environmental movement restrained.

Permanent structures remain stable.

Do NOT create:

- storms
- heavy wind
- dramatic weather
- lightning
- rain
- artificial weather changes

Unless clearly supported by the source photograph.

============================================================
LIGHTING
============================================================

Preserve the original lighting character.

Maintain:

- natural exposure
- realistic shadows
- realistic highlights
- natural colours
- realistic reflections

Do NOT artificially transform the time of day.

Do NOT create a dramatic sunset.

Do NOT create artificial golden hour.

Do NOT use extreme HDR.

Do NOT oversaturate.

Do NOT add excessive bloom.

Do NOT make the property unnaturally bright.

============================================================
CINEMATIC QUALITY
============================================================

The final shot should resemble footage captured
by a professional real-estate videographer.

Aim for:

- smooth stabilized movement
- realistic perspective
- natural depth
- professional exposure
- natural colour
- controlled contrast
- realistic shadows
- premium presentation

Avoid:

- AI-looking motion
- surreal movement
- excessive sharpening
- excessive blur
- artificial glow
- fake HDR
- excessive colour grading
- fantasy effects
- artificial 3D rendering

============================================================
AUDIO
============================================================

Generate subtle natural environmental audio
appropriate to the visible scene.

Possible sounds:

- gentle outdoor ambience
- subtle birds
- light wind
- natural neighbourhood ambience

Keep audio understated.

Do NOT generate:

- explosions
- impacts
- loud cinematic effects
- dramatic whooshes
- trailer-style sound effects

============================================================
MUSIC
============================================================

If appropriate, use extremely subtle premium
background music.

Preferred feeling:

- elegant
- sophisticated
- warm
- modern
- premium

Music must remain secondary to the property.

Do not create dramatic trailer music.

============================================================
VOICEOVER
============================================================

DO NOT generate voiceover.

DO NOT generate dialogue.

DO NOT generate narration.

MIB will generate property-specific voiceover
separately using the real property database.

============================================================
NO TEXT / BRANDING
============================================================

Do NOT generate:

- property titles
- price
- captions
- subtitles
- logos
- agent information
- phone numbers
- email addresses
- watermarks
- artificial signage
- promotional graphics

The generated video must contain only the
cinematic property scene.

MIB will add text and branding separately.

============================================================
DATABASE INFORMATION
============================================================

Property information is handled separately by MIB.

Do NOT display or speak any database information.

Do NOT invent or alter:

- price
- measurements
- bedrooms
- bathrooms
- tenure
- location
- property type
- facilities
- renovation information
- selling points

============================================================
SHOT STRUCTURE
============================================================

Create ONE continuous shot.

No:

- cuts
- scene changes
- transitions
- montage
- sudden angle changes
- major visual transformations

The shot should develop naturally from the
original photograph.

============================================================
OPENING
============================================================

Begin from a composition closely matching
the supplied photograph.

The first moment should feel like the real
camera has just started recording.

============================================================
MOVEMENT
============================================================

Allow the camera movement to develop naturally
throughout the shot.

The movement must be noticeable enough to
clearly communicate that this is video.

Do not make the movement so subtle that the
result looks like a static photograph with
a digital zoom.

Choose the movement based on the actual
photograph.

============================================================
ENDING
============================================================

Finish naturally.

Maintain the property clearly within frame.

Do not suddenly cut.

Do not suddenly zoom.

Do not suddenly rotate.

Do not create a dramatic transformation.

End with a visually clean professional
real-estate composition.

============================================================
DURATION
============================================================

Exactly 4 seconds.

One continuous cinematic shot.

============================================================
OUTPUT
============================================================

Vertical 9:16.

720 x 1280.

Suitable for:

- Facebook Reels
- Instagram Reels
- TikTok
- WhatsApp

============================================================
FINAL CREATIVE TEST
============================================================

Before generating the shot, evaluate the
photograph carefully.

Ask:

"What is the most visually effective and
physically realistic way a professional
real-estate cinematographer would film
THIS exact property from THIS exact
camera position for four seconds?"

Make that decision yourself.

Do not follow a fixed template.

Do not repeat the same movement automatically.

Let the photograph determine the shot.

Creative freedom is encouraged.

Property accuracy is non-negotiable.

REALISM > DRAMA.

PROPERTY TRUTH > CREATIVE EFFECT.

============================================================
FINAL INSTRUCTION
============================================================

YOU ARE THE CINEMATOGRAPHER.

STUDY THE PHOTOGRAPH.

CHOOSE THE CAMERA MOVEMENT YOURSELF.

MAKE THE MOVEMENT CLEARLY VISIBLE.

PRESERVE THE PROPERTY.

DO NOT REBUILD THE PROPERTY.

DO NOT INVENT ARCHITECTURE.

DO NOT REVEAL UNSEEN AREAS.

DO NOT DISTORT THE BUILDING.

DO NOT GENERATE TEXT.

DO NOT GENERATE BRANDING.

DO NOT GENERATE VOICEOVER.

CREATE ONE PREMIUM, REALISTIC,
PROFESSIONAL 4-SECOND PROPERTY VIDEO.

The final result should feel like:

A REAL PROPERTY
+
A REAL CAMERA
+
A PROFESSIONAL CINEMATOGRAPHER

NOT AN AI-REBUILT PROPERTY.
`;

/*
|--------------------------------------------------------------------------
| POST — CREATE SORA VIDEO JOB
|--------------------------------------------------------------------------
*/

export async function POST(
  request: Request
) {
  const auth = await requireUser();
  if (!auth.user) return auth.response;

  try {
    const body =
      await request.json();

    const imageUrl =
      body?.imageUrl;

    const propertyId =
      body?.propertyId;

    if (
      !imageUrl ||
      typeof imageUrl !== "string"
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

    if (
      propertyId === null ||
      propertyId === undefined ||
      propertyId === ""
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

    console.log(
      "=================================================="
    );

    console.log(
      "AI VIDEO: START"
    );

    console.log(
      "Property ID:",
      propertyId
    );

    console.log(
      "Image URL:",
      imageUrl
    );

    /*
    |--------------------------------------------------------------------------
    | DOWNLOAD PROPERTY IMAGE
    |--------------------------------------------------------------------------
    */

    console.log(
      "AI VIDEO: downloading property image..."
    );

    const imageResponse =
      await fetch(imageUrl);

    if (!imageResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            `Failed to download property image (${imageResponse.status}).`,
        },
        {
          status: 500,
        }
      );
    }

    const originalBuffer =
      Buffer.from(
        await imageResponse.arrayBuffer()
      );

    console.log(
      "AI VIDEO: original image downloaded:",
      originalBuffer.length,
      "bytes"
    );

    /*
    |--------------------------------------------------------------------------
    | RESIZE IMAGE FOR SORA
    |--------------------------------------------------------------------------
    */

    console.log(
      `AI VIDEO: resizing image to ${VIDEO_WIDTH}x${VIDEO_HEIGHT}...`
    );

    const imageBuffer =
      await sharp(
        originalBuffer
      )
        .resize(
          VIDEO_WIDTH,
          VIDEO_HEIGHT,
          {
            fit: "cover",
            position: "centre",
          }
        )
        .jpeg({
          quality: 90,
        })
        .toBuffer();

    console.log(
      "AI VIDEO: image resized successfully:",
      imageBuffer.length,
      "bytes"
    );

    /*
    |--------------------------------------------------------------------------
    | PREPARE IMAGE FILE
    |--------------------------------------------------------------------------
    */

    const imageFile =
      await toFile(
        imageBuffer,
        "property-photo.jpg",
        {
          type:
            "image/jpeg",
        }
      );

    console.log(
      "AI VIDEO: image prepared for Sora."
    );

    /*
    |--------------------------------------------------------------------------
    | CREATE SORA JOB
    |--------------------------------------------------------------------------
    */

    console.log(
      "AI VIDEO: sending request to Sora 2..."
    );

    const video =
      await openai.videos.create({
        model:
          "sora-2",

        prompt:
          SORA_PROPERTY_VIDEO_PROMPT,

        input_reference:
          imageFile,

        size:
          "720x1280",

        seconds:
          "4",
      });

    console.log(
      "AI VIDEO: SORA JOB CREATED"
    );

    console.log(
      "Video ID:",
      video.id
    );

    console.log(
      "Status:",
      video.status
    );

    console.log(
      "Progress:",
      video.progress ?? 0
    );

    /*
    |--------------------------------------------------------------------------
    | SAVE JOB
    |--------------------------------------------------------------------------
    */

    console.log(
      "AI VIDEO: saving job to ai_videos..."
    );

    const {
      data: videoRecord,
      error: databaseError,
    } =
      await supabaseAdmin
        .from("ai_videos")
        .insert({
          property_id:
            propertyId,

          video_id:
            video.id,

          status:
            video.status ||
            "queued",

          progress:
            video.progress ??
            0,
        })
        .select()
        .single();

    if (databaseError) {
      console.error(
        "AI VIDEO DATABASE ERROR:",
        databaseError
      );

      return NextResponse.json(
        {
          success: false,

          error:
            `Sora job was created but MIB could not save it: ${databaseError.message}`,

          videoId:
            video.id,
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "AI VIDEO DATABASE RECORD CREATED:",
      videoRecord
    );

    console.log(
      "AI VIDEO: JOB SAVED SUCCESSFULLY"
    );

    console.log(
      "=================================================="
    );

    return NextResponse.json({
      success: true,

      videoId:
        video.id,

      databaseId:
        videoRecord.id,

      propertyId:
        propertyId,

      status:
        video.status ||
        "queued",

      progress:
        video.progress ??
        0,
    });

  } catch (error: any) {
    console.error(
      "AI PROPERTY VIDEO POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error?.message ||
          "Failed to create AI property video.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| GET — CHECK SORA STATUS / DOWNLOAD / SAVE VIDEO
|--------------------------------------------------------------------------
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