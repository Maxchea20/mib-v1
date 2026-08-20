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
AI LIVING ENVIRONMENT INTELLIGENCE
============================================================

This is a core requirement of MIB.

You are not only directing the camera.

You are also directing how the visible environment can feel
naturally ALIVE during the shot.

For EACH selected photograph, inspect the actual image and
identify only visible elements that could realistically move.

Examples when visibly present:
- television screen content
- ceiling / wall / pedestal fans
- curtains or blinds
- visible plants or leaves
- trees and vegetation outside
- distant vehicles on visible roads
- people already visible in the scene
- cleaning robots already visible
- water or other visibly moving elements
- subtle lighting or illumination changes when physically plausible
- reflections that naturally respond to movement
- clouds or other clearly visible environmental motion

CRITICAL TRUTH RULES:

1. Never invent an object just to create motion.
2. Never add furniture, appliances, people, cars, plants or architecture
   that are not visible in the source photograph.
3. Never change the property's design, materials, proportions or layout.
4. Keep all static property objects locked to their real positions.
5. Motion must be subtle, physically believable and consistent with
   the camera movement.
6. Do not make every object move.
7. Prioritize 1-4 believable living elements rather than many effects.
8. Distant environmental motion should remain subtle.
9. TV screens may show natural screen activity only when a TV is visible.
10. Fans may rotate only when a fan is actually visible.
11. Curtains may move gently only when curtains/blinds are visible.
12. Vehicles may move only when a road/vehicle area is actually visible.
13. A cleaning robot may move only when one is actually visible.
14. Do not animate framed photos, paintings, furniture, walls,
    cabinets or other inherently static objects.

The goal is:

PHOTO → LIVING ENVIRONMENT

The result should feel like a real property was filmed for several
seconds, not like a still photograph receiving a generic zoom.

============================================================
LIVING ENVIRONMENT PLAN
============================================================

For every selected shot, return:

livingEnvironmentPlan:
{
  "overallLifeDirection": "",
  "elements": [
    {
      "element": "",
      "location": "",
      "motion": "",
      "intensity": "",
      "reason": ""
    }
  ]
}

overallLifeDirection:
One short sentence describing the natural environmental activity
that should make the photograph feel alive.

elements:
Only include elements that are actually visible in the supplied
photograph.

element:
Specific visible object or environmental feature.

location:
Where it appears in the photograph.

motion:
Concrete natural motion instruction.

intensity:
SUBTLE, NATURAL or NOTICEABLE.

reason:
Why the motion is appropriate and believable.

If there are no suitable moving elements, return an empty elements
array and explain that the scene should remain naturally still.

The camera movement remains the primary cinematic action.
Environmental movement supports it; it must never destroy property truth.

============================================================
CINEMATIC EDITING INTELLIGENCE
============================================================

You are also the EDITOR of the complete property reel.

Do not treat the shots as unrelated clips. Design a simple
editorial plan for the whole sequence.

Choose a role for each shot:
HOOK, INTRO, REVEAL, BUILD, DETAIL_BEAT, HERO.

Choose energy:
LOW, MEDIUM, HIGH, VERY_HIGH, LOW_TO_HIGH.

Choose cut style:
HARD_CUT, MOTIVATED_CUT, RHYTHM_CUT, SOFT_CUT, FINAL_HOLD.

Recommend a practical duration from 2 to 6 seconds.

Social Reel / Quick Property Reveal:
strong opening hook, shorter detail beats, clearer energy changes.

Professional / Luxury:
more breathing room and restrained rhythm.

POV:
natural progression and motivated cuts.

Cinematic Tour:
deliberate pacing and visual continuity.

This is an EDIT PLAN only. Do not regenerate or alter Runway footage.

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
  "editingPlan": {
    "overallEditDirection": "",
    "rhythm": "",
    "totalTargetDuration": 0,
    "shots": [
      {
        "shotOrder": 1,
        "role": "",
        "recommendedDuration": 4,
        "energy": "",
        "cutStyle": "",
        "editorReason": ""
      }
    ]
  },
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
EDITING PLAN FIELD RULES
============================================================

editingPlan:
The editorial plan for the complete sequence.

overallEditDirection:
One concise sentence describing how the sequence should feel
when edited together.

rhythm:
Describe the overall cutting rhythm.

totalTargetDuration:
Recommended total duration in seconds.

editingPlan.shots:
One object for every selected shot, matching shotOrder.

role:
HOOK, INTRO, REVEAL, BUILD, DETAIL_BEAT or HERO.

recommendedDuration:
Recommended duration in seconds. Use a practical value between
2 and 6 seconds.

energy:
LOW, MEDIUM, HIGH, VERY_HIGH or LOW_TO_HIGH.

cutStyle:
HARD_CUT, MOTIVATED_CUT, RHYTHM_CUT, SOFT_CUT or FINAL_HOLD.

editorReason:
Explain why this shot should occupy this role and rhythm
position in the sequence.

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
LIVING ENVIRONMENT FIELD RULES
============================================================

livingEnvironmentPlan:
Required for every selected shot.

overallLifeDirection:
Short description of the natural environmental life in the shot.

elements:
Only visible elements that can realistically move.

element:
Name the visible element.

location:
Describe its visible position in the frame.

motion:
Concrete, physically believable motion.

intensity:
SUBTLE, NATURAL or NOTICEABLE.

reason:
Why this motion is appropriate.

============================================================
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

For every selected photograph, inspect the actual image for
visible environmental elements that could naturally move.

Create ONE coherent professional video plan.

The livingEnvironmentPlan must be based on what is visibly present
in each photograph, never on assumptions.

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

                editingPlan: {
                  type:
                    "object",

                  additionalProperties:
                    false,

                  properties: {
                    overallEditDirection: {
                      type:
                        "string",
                    },

                    rhythm: {
                      type:
                        "string",
                    },

                    totalTargetDuration: {
                      type:
                        "number",
                    },

                    shots: {
                      type:
                        "array",

                      items: {
                        type:
                          "object",

                        additionalProperties:
                          false,

                        properties: {
                          shotOrder: {
                            type:
                              "integer",
                          },

                          role: {
                            type:
                              "string",
                          },

                          recommendedDuration: {
                            type:
                              "number",
                          },

                          energy: {
                            type:
                              "string",
                          },

                          cutStyle: {
                            type:
                              "string",
                          },

                          editorReason: {
                            type:
                              "string",
                          },
                        },

                        required: [
                          "shotOrder",
                          "role",
                          "recommendedDuration",
                          "energy",
                          "cutStyle",
                          "editorReason",
                        ],
                      },
                    },
                  },

                  required: [
                    "overallEditDirection",
                    "rhythm",
                    "totalTargetDuration",
                    "shots",
                  ],
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

                      cameraAction: {
                        type:
                          "string",
                      },

                      visualAnalysis: {
                        type:
                          "string",
                      },

                      livingEnvironmentPlan: {
                        type:
                          "object",

                        additionalProperties:
                          false,

                        properties: {
                          overallLifeDirection: {
                            type:
                              "string",
                          },

                          elements: {
                            type:
                              "array",

                            items: {
                              type:
                                "object",

                              additionalProperties:
                                false,

                              properties: {
                                element: {
                                  type:
                                    "string",
                                },

                                location: {
                                  type:
                                    "string",
                                },

                                motion: {
                                  type:
                                    "string",
                                },

                                intensity: {
                                  type:
                                    "string",
                                },

                                reason: {
                                  type:
                                    "string",
                                },
                              },

                              required: [
                                "element",
                                "location",
                                "motion",
                                "intensity",
                                "reason",
                              ],
                            },
                          },
                        },

                        required: [
                          "overallLifeDirection",
                          "elements",
                        ],
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
                      "cameraAction",
                      "visualAnalysis",
                      "livingEnvironmentPlan",
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
                "editingPlan",
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

          cameraAction:
            String(
              shot.cameraAction ||
                "SLOW_PUSH"
            ),

          visualAnalysis:
            String(
              shot.visualAnalysis ||
                "Selected from the visible composition and available depth."
            ),

          livingEnvironmentPlan: {
            overallLifeDirection:
              String(
                shot.livingEnvironmentPlan
                  ?.overallLifeDirection ||
                  "Keep the environment naturally alive with only subtle motion from elements that are visibly present."
              ),

            elements:
              Array.isArray(
                shot.livingEnvironmentPlan
                  ?.elements
              )
                ? shot.livingEnvironmentPlan.elements.map(
                    (element: any) => ({
                      element:
                        String(
                          element?.element ||
                            ""
                        ),

                      location:
                        String(
                          element?.location ||
                            ""
                        ),

                      motion:
                        String(
                          element?.motion ||
                            ""
                        ),

                      intensity:
                        String(
                          element?.intensity ||
                            "SUBTLE"
                        ),

                      reason:
                        String(
                          element?.reason ||
                            ""
                        ),
                    })
                  )
                : [],
          },

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

    const rawEditingPlan =
      plan.editingPlan || {};

    const rawEditingShots =
      Array.isArray(
        rawEditingPlan.shots
      )
        ? rawEditingPlan.shots
        : [];

    plan.editingPlan = {
      overallEditDirection:
        String(
          rawEditingPlan.overallEditDirection ||
            "Create a coherent property sequence with purposeful energy changes and a strong final hero."
        ),

      rhythm:
        String(
          rawEditingPlan.rhythm ||
            plan.pacing ||
            "Natural cinematic"
        ),

      totalTargetDuration:
        Number(
          rawEditingPlan.totalTargetDuration ||
            plan.recommendations.length * 4
        ),

      shots:
        plan.recommendations.map(
          (
            shot: any,
            index: number
          ) => {
            const planned =
              rawEditingShots.find(
                (
                  item: any
                ) =>
                  Number(
                    item?.shotOrder
                  ) ===
                  Number(
                    shot.shotOrder
                  )
              ) ||
              rawEditingShots[index] ||
              {};

            return {
              shotOrder:
                Number(
                  shot.shotOrder
                ),

              role:
                String(
                  planned.role ||
                    (
                      index === 0
                        ? "HOOK"
                        : index ===
                            plan.recommendations.length - 1
                        ? "HERO"
                        : "REVEAL"
                    )
                ),

              recommendedDuration:
                Number(
                  planned.recommendedDuration ||
                    4
                ),

              energy:
                String(
                  planned.energy ||
                    "MEDIUM"
                ),

              cutStyle:
                String(
                  planned.cutStyle ||
                    (
                      index ===
                      plan.recommendations.length - 1
                        ? "FINAL_HOLD"
                        : "MOTIVATED_CUT"
                    )
                ),

              editorReason:
                String(
                  planned.editorReason ||
                    "Selected to maintain a coherent visual progression."
                ),
            };
          }
        ),
    };

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