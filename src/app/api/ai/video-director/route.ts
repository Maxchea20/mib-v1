import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/*
|--------------------------------------------------------------------------
| VIDEO STYLE DEFINITIONS
|--------------------------------------------------------------------------
*/

const STYLE_INSTRUCTIONS: Record<
  string,
  string
> = {
  ai_director: `
Choose the most suitable professional real-estate
cinematography style for this property.

Prioritize property truth, visual quality and
natural camera movement.
`,

  professional_real_estate: `
Create a polished professional real-estate presentation.

Use clean compositions, controlled camera movement,
natural pacing and strong architectural presentation.

The result should feel like a professional property
marketing video.
`,

  quick_property_reveal: `
Create a fast and attention-grabbing property reveal.

Use stronger visual progression, quicker camera actions,
clear reveals and energetic pacing.

Still preserve realism and property accuracy.
`,

  cinematic_property_tour: `
Create an immersive cinematic property tour.

Use elegant camera movement, deliberate reveals,
depth, parallax and smooth transitions between
photographs.

The result should feel like a professionally filmed
property tour.
`,

  luxury_showcase: `
Create a premium luxury-property presentation.

Use elegant, restrained and sophisticated camera
movement.

Emphasize architecture, space, symmetry, materials,
views and visual hierarchy.

Avoid exaggerated movement.
`,

  dynamic_action_tour: `
Create a more energetic property tour.

Use controlled tracking, reveals, push-ins, pull-backs,
lateral movement and stronger camera choreography.

Movement must remain physically believable.
`,

  pov_walkthrough: `
Create an immersive human-height POV walkthrough feeling.

Camera movement should feel like a real person or
professional gimbal operator moving through the property.

Use forward movement, subtle turns and natural spatial
progression when supported by the photographs.
`,

  social_reel: `
Create an attention-first short-form property reel.

Start with the strongest visual.

Use visually interesting movement, reveals and varied
camera actions.

Keep the pacing engaging while maintaining property
accuracy and realism.
`,
};

/*
|--------------------------------------------------------------------------
| MASTER DIRECTOR PROMPT
|--------------------------------------------------------------------------
*/

const MASTER_DIRECTOR_PROMPT = `
You are MIB AI DIRECTOR.

You are a professional real-estate cinematographer,
commercial property videographer and visual storyteller.

Your job is NOT to simply describe the photographs.

Your job is to DIRECT an entire property video.

The user has supplied multiple photographs of the SAME
real property.

Study ALL photographs together.

Treat the photographs as the visual source of truth.

Do not invent anything that is not visible.

Do not redesign the property.

Do not renovate the property.

Do not add architecture.

Do not add rooms.

Do not add windows.

Do not add doors.

Do not add balconies.

Do not add pools.

Do not add gardens.

Do not add furniture.

Do not add people.

Do not add vehicles.

Do not reveal unseen areas.

Do not change the structure.

Do not change the proportions.

Do not make the property more luxurious than it really is.

============================================================
IMPORTANT DIRECTOR PRINCIPLE
============================================================

You are directing a CAMERA.

The property stays real.

The CAMERA moves.

Every shot must contain a deliberate camera action.

Do not simply say:

"show the property."

Instead write a practical action script such as:

"Camera begins in the original wide framing and
slowly pushes forward toward the entrance while
maintaining the property's geometry."

or:

"Camera performs a controlled left-to-right lateral
dolly, revealing the full facade while keeping the
building stable in frame."

or:

"Camera gently pulls backward from the interior,
gradually revealing the full living space."

or:

"Camera moves forward at human walking height,
creating a natural POV walkthrough feeling."

============================================================
CAMERA ACTION SCRIPT
============================================================

Each shot MUST have an actionScript.

The actionScript should describe:

1. Where the camera starts.
2. How the camera moves.
3. Direction of movement.
4. Speed / intensity.
5. What the movement reveals.
6. What should remain stable.
7. How the shot should finish.

Use real cinematography language.

Examples:

Slow Push In
Slow Pull Back
Controlled Dolly Left
Controlled Dolly Right
Lateral Reveal
Forward Walkthrough
POV Walk
Subtle Tracking
Arc Reveal
Parallax Reveal
Symmetry Push
Entrance Reveal
Interior Pull Back
Window Reveal
Depth Reveal
Establishing Push
Hero Reveal

Do not blindly use the same movement repeatedly.

Create visual variety.

============================================================
SHOT SELECTION
============================================================

You are allowed to choose which photographs should
become video shots.

You do NOT have to use every photograph.

However, normally use the strongest and most useful
photographs.

Avoid redundant photographs that show almost exactly
the same view.

Prefer a coherent visual sequence.

A typical property sequence may be:

1. Exterior establishing shot
2. Main facade / entrance
3. Living area
4. Dining / kitchen
5. Bedroom
6. Master bedroom
7. Bathroom
8. Outdoor / balcony / garden
9. Strong final hero shot

But this is only an example.

Adapt the sequence to the actual photographs.

============================================================
VISUAL STORY
============================================================

The video should feel like one coherent property film.

Think about:

OPENING
→ establish the property

INTRODUCTION
→ reveal important spaces

PROGRESSION
→ move deeper into the property

HIGHLIGHTS
→ showcase the strongest features

ENDING
→ finish with a memorable hero shot

Do not force this structure if the photographs do not
support it.

============================================================
STYLE
============================================================

Apply the selected style strongly.

However:

REALISM > DRAMA

PROPERTY TRUTH > CREATIVE EFFECT

CAMERA QUALITY > RANDOM MOVEMENT

Do not create impossible camera paths.

Do not make the camera pass through walls,
doors, furniture, gates or buildings.

Do not create artificial 3D architecture.

Do not make photographs morph into completely different
scenes.

============================================================
OUTPUT
============================================================

Return ONLY valid JSON.

No markdown.

No explanation outside JSON.

The JSON must follow this exact structure:

{
  "style": "",
  "styleName": "",
  "overallDirection": "",
  "pacing": "",
  "shotCount": 0,
  "recommendations": [
    {
      "photoIndex": 0,
      "shotOrder": 1,
      "shotType": "",
      "actionScript": "",
      "reason": ""
    }
  ]
}

============================================================
FIELD RULES
============================================================

style:
Use the supplied style identifier.

styleName:
Human-readable name.

overallDirection:
Describe the cinematographic identity of the entire video.

pacing:
Examples:
"Slow and elegant"
"Natural cinematic"
"Moderately energetic"
"Fast social-reel pacing"

shotCount:
Number of photographs selected for the final video.

recommendations:
One object for every selected shot.

photoIndex:
Must correspond exactly to one supplied photograph index.

shotOrder:
Start at 1.

shotType:
Short professional shot name.

actionScript:
This is the MOST IMPORTANT FIELD.

It must be a concrete camera-direction script
that can be passed directly to a video-generation model.

reason:
Explain why this photograph and movement were chosen.

============================================================
DO NOT
============================================================

Do not output cameraMovement.

Do not output direction.

Do not output zoom.

Do not output strength.

Those old controls are intentionally removed.

The new system uses ONE complete actionScript instead.

============================================================
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

    const listing =
      body?.listing || {};

    const videoStyle =
      body?.videoStyle ||
      "ai_director";

    const photos =
      Array.isArray(body?.photos)
        ? body.photos
        : [];

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
      photos.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "At least one property photograph is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | STYLE
    |--------------------------------------------------------------------------
    */

    const styleInstruction =
      STYLE_INSTRUCTIONS[
        videoStyle
      ] ||
      STYLE_INSTRUCTIONS.ai_director;

    /*
    |--------------------------------------------------------------------------
    | BUILD PHOTO INPUT
    |--------------------------------------------------------------------------
    */

    const photoContent =
      photos.map(
        (
          photo: {
            index: number;
            image_url: string;
          }
        ) => ({
          type:
            "input_image" as const,

          image_url:
            photo.image_url,

          detail:
            "high" as const,
        })
      );

    /*
    |--------------------------------------------------------------------------
    | DIRECTOR USER PROMPT
    |--------------------------------------------------------------------------
    */

    const userPrompt = `
PROPERTY INFORMATION

Property ID:
${listing.id ?? "unknown"}

Property title:
${listing.title ?? "unknown"}

Category:
${listing.category ?? "unknown"}

Property type:
${listing.property_type ?? "unknown"}

SELECTED VIDEO STYLE:
${videoStyle}

STYLE DIRECTION:
${styleInstruction}

PHOTOGRAPHS:

The following images are the actual photographs of
this property.

Photo indexes are supplied in the order below.

${photos
  .map(
    (
      photo: {
        index: number;
        image_url: string;
      }
    ) =>
      `PHOTO INDEX ${photo.index}`
  )
  .join("\n")}

Now study all photographs together.

Create ONE coherent professional video plan.

Do not generate video.

Do not generate prompts for unrelated scenes.

Generate only the director plan JSON requested
by the system instructions.
`;

    /*
    |--------------------------------------------------------------------------
    | OPENAI RESPONSE
    |--------------------------------------------------------------------------
    */

    console.log(
      "AI VIDEO DIRECTOR: analysing",
      photos.length,
      "photos"
    );

    console.log(
      "AI VIDEO DIRECTOR: style:",
      videoStyle
    );

    const response =
      await openai.responses.create({
        model:
          "gpt-5",

        input: [
          {
            role:
              "user",

            content: [
              {
                type:
                  "input_text",

                text:
                  MASTER_DIRECTOR_PROMPT +
                  "\n\n" +
                  userPrompt,
              },

              ...photoContent,
            ],
          },
        ],

        text: {
          format: {
            type:
              "json_schema",

            name:
              "property_video_director_plan",

            strict:
              true,

            schema: {
              type:
                "object",

              additionalProperties:
                false,

              properties: {
                style: {
                  type:
                    "string",
                },

                styleName: {
                  type:
                    "string",
                },

                overallDirection: {
                  type:
                    "string",
                },

                pacing: {
                  type:
                    "string",
                },

                shotCount: {
                  type:
                    "integer",
                },

                recommendations: {
                  type:
                    "array",

                  items: {
                    type:
                      "object",

                    additionalProperties:
                      false,

                    properties: {
                      photoIndex: {
                        type:
                          "integer",
                      },

                      shotOrder: {
                        type:
                          "integer",
                      },

                      shotType: {
                        type:
                          "string",
                      },

                      actionScript: {
                        type:
                          "string",
                      },

                      reason: {
                        type:
                          "string",
                      },
                    },

                    required: [
                      "photoIndex",
                      "shotOrder",
                      "shotType",
                      "actionScript",
                      "reason",
                    ],
                  },
                },
              },

              required: [
                "style",
                "styleName",
                "overallDirection",
                "pacing",
                "shotCount",
                "recommendations",
              ],
            },
          },
        },
      });

    /*
    |--------------------------------------------------------------------------
    | PARSE RESULT
    |--------------------------------------------------------------------------
    */

    const outputText =
      response.output_text;

    if (
      !outputText ||
      outputText.trim() === ""
    ) {
      throw new Error(
        "AI Director returned an empty response."
      );
    }

    let plan: any;

    try {
      plan =
        JSON.parse(
          outputText
        );
    } catch (
      parseError
    ) {
      console.error(
        "AI VIDEO DIRECTOR JSON PARSE ERROR:",
        parseError
      );

      console.error(
        "AI VIDEO DIRECTOR RAW OUTPUT:",
        outputText
      );

      throw new Error(
        "AI Director returned invalid JSON."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | SERVER-SIDE VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
      !Array.isArray(
        plan.recommendations
      ) ||
      plan.recommendations.length ===
        0
    ) {
      throw new Error(
        "AI Director returned no shot recommendations."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE PHOTO INDEXES
    |--------------------------------------------------------------------------
    */

    const validPhotoIndexes =
      new Set(
        photos.map(
          (
            photo: {
              index: number;
            }
          ) =>
            Number(
              photo.index
            )
        )
      );

    plan.recommendations =
      plan.recommendations.filter(
        (
          shot: any
        ) =>
          validPhotoIndexes.has(
            Number(
              shot.photoIndex
            )
          )
      );

    if (
      plan.recommendations.length ===
      0
    ) {
      throw new Error(
        "AI Director did not select any valid property photographs."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | NORMALISE SHOT ORDER
    |--------------------------------------------------------------------------
    */

    plan.recommendations =
      plan.recommendations.map(
        (
          shot: any,
          index: number
        ) => ({
          photoIndex:
            Number(
              shot.photoIndex
            ),

          shotOrder:
            index + 1,

          shotType:
            String(
              shot.shotType ||
                "Property Cinematic Shot"
            ),

          actionScript:
            String(
              shot.actionScript ||
                "Use a smooth professional camera movement that preserves the original property photograph."
            ),

          reason:
            String(
              shot.reason ||
                "Selected by the AI Director based on the visual composition."
            ),
        })
      );

    plan.shotCount =
      plan.recommendations.length;

    /*
    |--------------------------------------------------------------------------
    | LOG
    |--------------------------------------------------------------------------
    */

    console.log(
      "AI VIDEO DIRECTOR: PLAN CREATED"
    );

    console.log(
      JSON.stringify(
        plan,
        null,
        2
      )
    );

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return NextResponse.json({
      success: true,

      plan,
    });
  } catch (
    error: any
  ) {
    console.error(
      "AI VIDEO DIRECTOR ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error?.message ||
          "AI Director failed to create the video plan.",
      },
      {
        status: 500,
      }
    );
  }
}