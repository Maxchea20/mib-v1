import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import ffmpegStatic from "ffmpeg-static";

import {
  spawn,
} from "child_process";

import {
  promises as fs,
} from "fs";

import path from "path";
import os from "os";

const supabaseAdmin =
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function runFFmpeg(
  args: string[]
): Promise<void> {
  return new Promise(
    (
      resolve,
      reject
    ) => {
      const ffmpegPath =
  process.platform === "win32"
    ? path.join(
        process.cwd(),
        "node_modules",
        "ffmpeg-static",
        "ffmpeg.exe"
      )
    : path.join(
        process.cwd(),
        "node_modules",
        "ffmpeg-static",
        "ffmpeg"
      );

if (!ffmpegPath) {
        reject(
          new Error(
            "FFmpeg executable was not found."
          )
        );

        return;
      }

      console.log(
        "VIDEO ASSEMBLER: starting FFmpeg..."
      );

      console.log(
        "FFMPEG EXECUTABLE:",
        ffmpegPath
      );

      console.log(
        "FFMPEG ARGS:",
        args
      );

      const childProcess =
        spawn(
          ffmpegPath,
          args,
          {
            windowsHide:
              true,
          }
        );

      let stderr = "";

      childProcess.stderr?.on(
        "data",
        (data) => {
          const text =
            data.toString();

          stderr += text;

          console.log(
            "FFMPEG:",
            text.trim()
          );
        }
      );

      childProcess.on(
        "error",
        (error) => {
          reject(error);
        }
      );

      childProcess.on(
        "close",
        (code, signal) => {
          if (code === 0) {
            resolve();
            return;
          }

          reject(
            new Error(
              `FFmpeg exited with code ${code}${
                signal
                  ? ` (signal ${signal})`
                  : ""
              }.\n${
                stderr ||
                "No FFmpeg stderr output was captured."
              }`
            )
          );
        }
      );
    }
  );
}

/*
|--------------------------------------------------------------------------
| PHASE 2 — AI EDITORIAL ENGINE
|--------------------------------------------------------------------------
|
| One pass across the COMPLETE 5-shot sequence:
|
| 1. Extract a representative frame from every finished Runway shot.
| 2. OpenAI analyzes the whole sequence + property data.
| 3. AI decides, per shot:
|      - text
|      - placement
|      - size
|      - style
|      - animation
|      - timing
|      - emphasis
|      - whether text should be shown at all
|      - pacing / BPM
| 4. FFmpeg renders the individual editorial shots.
| 5. A licensed music track is selected from the MIB music library.
| 6. Shot timing is snapped to the selected track BPM.
| 7. All shots + music become ONE final MP4.
|
| No Runway calls are made here.
|
*/

type AIOverlayPlan = {
  shotOrder: number;
  duration: number;
  show: boolean;
  headline: string;
  subline: string;
  x: number;
  y: number;
  anchor: "left" | "center" | "right";
  size: number;
  color: "white" | "black" | "gold";
  box: boolean;
  animation:
    | "fade"
    | "slide_up"
    | "slide_left"
    | "slide_right"
    | "pop"
    | "none";
  start: number;
  end: number;
  emphasis: "low" | "medium" | "high";
};

type AIEditorialPlan = {
  bpm: number;
  musicMood:
    | "luxury"
    | "modern"
    | "energetic"
    | "warm";
  shots: AIOverlayPlan[];
};

function clampNumber(
  value: any,
  min: number,
  max: number,
  fallback: number
): number {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, n));
}

function cleanText(value: any): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeDrawText(value: string): string {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/'/g, "\\'")
    .replace(/,/g, "\\,")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]");
}

function getDrawTextFont(): string {
  if (process.platform === "win32") {
    return "C\\:/Windows/Fonts/arialbd.ttf";
  }

  return "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";
}

function safeEnum<T extends string>(
  value: any,
  allowed: readonly T[],
  fallback: T
): T {
  const normalized =
    String(value || "").toLowerCase() as T;

  return allowed.includes(normalized)
    ? normalized
    : fallback;
}

function stripJsonFences(
  text: string
): string {
  return String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function getPropertyValue(
  property: any,
  keys: string[]
): string {
  for (const key of keys) {
    const value =
      property?.[key];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return String(value).trim();
    }
  }

  return "";
}

function buildEditorialPropertySummary(
  property: any
): string {
  const title =
    getPropertyValue(property, [
      "title",
      "property_title",
      "listing_title",
      "name",
    ]);

  const location =
    getPropertyValue(property, [
      "location",
      "area",
      "town",
      "city",
      "address",
    ]);

  const type =
    getPropertyValue(property, [
      "property_type",
      "residential_type",
      "commercial_type",
      "industrial_property_type",
      "land_type",
    ]);

  const price =
    getPropertyValue(property, [
      "price",
      "selling_price",
      "sale_price",
      "asking_price",
    ]);

  const bedrooms =
    getPropertyValue(property, [
      "bedrooms",
      "bedroom",
      "rooms",
    ]);

  const bathrooms =
    getPropertyValue(property, [
      "bathrooms",
      "bathroom",
      "baths",
    ]);

  const builtUp =
    getPropertyValue(property, [
      "built_up",
      "builtup",
      "built_up_size",
      "built_up_sqft",
      "builtup_size",
    ]);

  const landSize =
    getPropertyValue(property, [
      "land_size",
      "land_area",
      "land_size_sqft",
      "land_area_sqft",
    ]);

  return JSON.stringify({
    title,
    location,
    type,
    price,
    bedrooms,
    bathrooms,
    builtUp,
    landSize,
  });
}

async function analyzeSequenceWithOpenAI(
  property: any,
  frames: {
    shotOrder: number;
    imageBase64: string;
  }[],
  durations: number[]
): Promise<AIEditorialPlan> {
  const apiKey =
    process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is required for the AI Editorial Engine."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | STRUCTURED OUTPUT
  |--------------------------------------------------------------------------
  |
  | Do NOT ask the model to "return JSON" and then JSON.parse free-form text.
  | Responses API Structured Outputs guarantees the shape instead.
  |
  */

  const editorialSchema = {
    type: "object",
    additionalProperties: false,
    required: [
      "bpm",
      "musicMood",
      "shots",
    ],
    properties: {
      bpm: {
        type: "number",
        minimum: 104,
        maximum: 124,
      },
      musicMood: {
        type: "string",
        enum: [
          "luxury",
          "modern",
          "energetic",
          "warm",
        ],
      },
      shots: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "shotOrder",
            "duration",
            "show",
            "headline",
            "subline",
            "x",
            "y",
            "anchor",
            "size",
            "color",
            "box",
            "animation",
            "start",
            "end",
            "emphasis",
          ],
          properties: {
            shotOrder: {
              type: "integer",
            },
            duration: {
              type: "number",
            },
            show: {
              type: "boolean",
            },
            headline: {
              type: "string",
            },
            subline: {
              type: "string",
            },
            x: {
              type: "number",
            },
            y: {
              type: "number",
            },
            anchor: {
              type: "string",
              enum: [
                "left",
                "center",
                "right",
              ],
            },
            size: {
              type: "number",
            },
            color: {
              type: "string",
              enum: [
                "white",
                "black",
                "gold",
              ],
            },
            box: {
              type: "boolean",
            },
            animation: {
              type: "string",
              enum: [
                "fade",
                "slide_up",
                "slide_left",
                "slide_right",
                "pop",
                "none",
              ],
            },
            start: {
              type: "number",
            },
            end: {
              type: "number",
            },
            emphasis: {
              type: "string",
              enum: [
                "low",
                "medium",
                "high",
              ],
            },
          },
        },
      },
    },
  };

  const content: any[] = [
    {
      type: "input_text",
      text: `
You are the senior editor of a premium Malaysian real-estate TikTok/Reels studio.

Analyze the COMPLETE sequence of ${frames.length} property-video shots as ONE coherent social video.

PROPERTY DATA:
${buildEditorialPropertySummary(property)}

SHOT DURATIONS AVAILABLE:
${JSON.stringify(durations)}

Create a genuinely creative short-form property edit.

For EACH shot decide:
- whether text is useful
- exact short headline
- optional short subline
- best screen position based on the actual composition
- alignment
- size
- white / black / gold text
- whether a background box is necessary
- entrance animation
- entry and exit timing
- emphasis

Rules:
1. NEVER cover the main architectural subject.
2. Prefer clean negative space.
3. Different shots SHOULD use different layouts when visually appropriate.
4. Avoid giant black caption boxes.
5. Keep text short and premium.
6. NEVER invent property facts.
7. Normally reserve price for the final HERO shot.
8. Do not repeat the same headline unnecessarily.
9. If a shot is visually busy, use less text or no text.
10. Final HERO shot gets the strongest property/price treatment.
11. Text must look like a professionally edited TikTok/Reel, not a listing card.
12. Portrait canvas is 720x1280.
13. x and y are normalized positions.
14. Keep x and y between 0.10 and 0.90.
15. Headline is normally 1-4 words.
16. Choose a modern, rhythmic soundtrack mood.
17. BPM must be between 104 and 124.
18. Prefer modern/energetic for normal residential property videos.
19. Use luxury only when the visual presentation genuinely supports it.
20. Timing should be compatible with beat-based editing.
21. Each shot duration must remain within its available duration.
22. A shot may intentionally have no text if that produces the better edit.
23. Do NOT explain your choices. Return only the structured result.
`,
    },
  ];

  for (const frame of frames) {
    content.push({
      type: "input_image",
      image_url:
        `data:image/jpeg;base64,${frame.imageBase64}`,
      detail: "low",
    });
  }

  const model =
    process.env.OPENAI_VIDEO_EDITOR_MODEL ||
    "gpt-5.6-luna";

  console.log(
    "OPENAI EDITORIAL ENGINE: requesting structured plan",
    {
      model,
      frameCount:
        frames.length,
    }
  );

  const response =
    await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Authorization:
            `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          input: [
            {
              role: "user",
              content,
            },
          ],

          /*
          |--------------------------------------------------------------------------
          | Responses API STRUCTURED OUTPUTS
          |--------------------------------------------------------------------------
          |
          | OpenAI guarantees the response against this JSON schema.
          |
          */

          text: {
            format: {
              type: "json_schema",
              name:
                "property_editorial_plan",
              strict: true,
              schema:
                editorialSchema,
            },
          },

          max_output_tokens: 3000,

          /*
          | Keep the editor focused on the actual composition task.
          */
          store: false,
        }),
      }
    );

  const responseRequestId =
    response.headers.get(
      "x-request-id"
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `OpenAI Editorial Engine failed: HTTP ${response.status} ${
        errorText || "No error body"
      }${
        responseRequestId
          ? ` (request ${responseRequestId})`
          : ""
      }`
    );
  }

  const data =
    await response.json();

  console.log(
    "OPENAI EDITORIAL ENGINE RESPONSE:",
    {
      requestId:
        responseRequestId,
      status:
        data?.status,
      outputItems:
        Array.isArray(
          data?.output
        )
          ? data.output.length
          : 0,
      hasOutputText:
        Boolean(
          data?.output_text
        ),
    }
  );

  /*
  |--------------------------------------------------------------------------
  | EXTRACT STRUCTURED OUTPUT ROBUSTLY
  |--------------------------------------------------------------------------
  */

  let rawText =
    typeof data?.output_text ===
    "string"
      ? data.output_text
      : "";

  if (!rawText) {
    const output =
      Array.isArray(
        data?.output
      )
        ? data.output
        : [];

    rawText =
      output
        .flatMap(
          (item: any) =>
            Array.isArray(
              item?.content
            )
              ? item.content
              : []
        )
        .map(
          (item: any) =>
            item?.text ||
            item?.refusal ||
            ""
        )
        .filter(Boolean)
        .join("");
  }

  /*
  |--------------------------------------------------------------------------
  | REFUSAL / EMPTY RESPONSE DIAGNOSTICS
  |--------------------------------------------------------------------------
  */

  if (!rawText) {
    const refusal =
      data?.output
        ?.flatMap(
          (item: any) =>
            Array.isArray(
              item?.content
            )
              ? item.content
              : []
        )
        .find(
          (item: any) =>
            item?.type ===
            "refusal"
        )
        ?.refusal;

    if (refusal) {
      throw new Error(
        `OpenAI Editorial Engine refused the request: ${refusal}`
      );
    }

    if (
      data?.status ===
      "incomplete"
    ) {
      throw new Error(
        `OpenAI Editorial Engine returned an incomplete response: ${
          data?.incomplete_details
            ?.reason ||
          "unknown reason"
        }`
      );
    }

    if (
      data?.status ===
      "failed"
    ) {
      throw new Error(
        `OpenAI Editorial Engine failed: ${
          data?.error?.message ||
          "Unknown OpenAI response failure."
        }`
      );
    }

    throw new Error(
      `OpenAI Editorial Engine returned no JSON. Response status: ${
        data?.status ||
        "unknown"
      }${
        responseRequestId
          ? `, request: ${responseRequestId}`
          : ""
      }`
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PARSE
  |--------------------------------------------------------------------------
  */

  let parsed: any;

  try {
    parsed =
      JSON.parse(
        stripJsonFences(
          rawText
        )
      );
  } catch {
    throw new Error(
      `OpenAI Editorial Engine returned invalid structured output: ${rawText.slice(
        0,
        4000
      )}`
    );
  }

  const rawShots =
    Array.isArray(
      parsed?.shots
    )
      ? parsed.shots
      : [];

  const defaultBpm =
    clampNumber(
      parsed?.bpm,
      104,
      124,
      112
    );

  const mood =
    safeEnum(
      parsed?.musicMood,
      [
        "luxury",
        "modern",
        "energetic",
        "warm",
      ] as const,
      "modern"
    );

  const normalizedShots =
    frames.map(
      (
        frame,
        index
      ) => {
        const raw =
          rawShots.find(
            (item: any) =>
              Number(
                item?.shotOrder
              ) ===
              frame.shotOrder
          ) ||
          rawShots[index] ||
          {};

        const duration =
          durations[index] ||
          4;

        const safeDuration =
          Math.max(
            2.5,
            Math.min(
              duration,
              4
            )
          );

        const start =
          clampNumber(
            raw?.start,
            0,
            Math.max(
              0.1,
              safeDuration - 0.2
            ),
            0.45
          );

        const end =
          clampNumber(
            raw?.end,
            start + 0.2,
            safeDuration,
            Math.max(
              start + 0.2,
              safeDuration - 0.45
            )
          );

        const chosenDuration =
          clampNumber(
            raw?.duration,
            2.5,
            safeDuration,
            safeDuration
          );

        return {
          shotOrder:
            frame.shotOrder,

          duration:
            chosenDuration,

          show:
            raw?.show !== false,

          headline:
            cleanText(
              raw?.headline ||
                ""
            ).slice(0, 42),

          subline:
            cleanText(
              raw?.subline ||
                ""
            ).slice(0, 70),

          x:
            clampNumber(
              raw?.x,
              0.10,
              0.90,
              0.5
            ),

          y:
            clampNumber(
              raw?.y,
              0.10,
              0.90,
              0.72
            ),

          anchor:
            safeEnum(
              raw?.anchor,
              [
                "left",
                "center",
                "right",
              ] as const,
              "left"
            ),

          size:
            clampNumber(
              raw?.size,
              28,
              68,
              42
            ),

          color:
            safeEnum(
              raw?.color,
              [
                "white",
                "black",
                "gold",
              ] as const,
              "white"
            ),

          box:
            Boolean(
              raw?.box
            ),

          animation:
            safeEnum(
              raw?.animation,
              [
                "fade",
                "slide_up",
                "slide_left",
                "slide_right",
                "pop",
                "none",
              ] as const,
              "fade"
            ),

          start,
          end,

          emphasis:
            safeEnum(
              raw?.emphasis,
              [
                "low",
                "medium",
                "high",
              ] as const,
              "medium"
            ),
        };
      }
    );

  return {
    bpm:
      defaultBpm,

    musicMood:
      mood,

    shots:
      normalizedShots,
  };
}

function getOverlayFontSize(
  plan: AIOverlayPlan
): number {
  const base =
    clampNumber(
      plan.size,
      28,
      68,
      42
    );

  if (
    plan.emphasis ===
    "high"
  ) {
    return Math.round(
      base * 1.12
    );
  }

  if (
    plan.emphasis ===
    "low"
  ) {
    return Math.round(
      base * 0.86
    );
  }

  return Math.round(base);
}

function getOverlayColor(
  color: AIOverlayPlan["color"]
): string {
  if (color === "black") {
    return "black";
  }

  if (color === "gold") {
    return "0xF2C46D";
  }

  return "white";
}

function snapDurationToBeat(
  duration: number,
  bpm: number,
  maxDuration: number
): number {
  const beat =
    60 /
    clampNumber(
      bpm,
      100,
      125,
      112
    );

  const halfBeat =
    beat / 2;

  const safeMax =
    Math.max(
      2.5,
      maxDuration
    );

  const raw =
    clampNumber(
      duration,
      2.5,
      safeMax,
      safeMax
    );

  const snapped =
    Math.round(
      raw /
        halfBeat
    ) *
    halfBeat;

  return Math.min(
    safeMax,
    Math.max(
      2.5,
      Number(
        snapped.toFixed(
          3
        )
      )
    )
  );
}

function escapeFFmpegExpression(
  expression: string
) {
  // FFmpeg filtergraph uses commas as separators.
  // Escape commas that belong to if()/expression arguments.
  return expression.replace(/,/g, "\\,");
}

function buildAIOverlayFilter(
  plan: AIOverlayPlan,
  duration: number,
  bpm: number
): string {
  if (
    !plan.show ||
    !plan.headline
  ) {
    return "";
  }

  const safeDuration =
    Math.max(
      0.5,
      duration
    );

  const start =
    clampNumber(
      plan.start,
      0,
      safeDuration - 0.1,
      0.5
    );

  const end =
    clampNumber(
      plan.end,
      start + 0.1,
      safeDuration,
      Math.max(
        start + 0.2,
        safeDuration - 0.4
      )
    );

  /*
  | Snap entrance to the nearest musical beat.
  */
  const beat =
    60 /
    clampNumber(
      bpm,
      100,
      125,
      112
    );

  const snappedStart =
    Math.min(
      start,
      Math.max(
        0,
        Math.round(
          start / beat
        ) * beat
      )
    );

  const animationLength =
    Math.min(
      0.28,
      beat * 0.55
    );

  const fontFile =
    getDrawTextFont();

  const fontSize =
    getOverlayFontSize(
      plan
    );

  const color =
    getOverlayColor(
      plan.color
    );

  const safeX =
    clampNumber(
      plan.x,
      0.10,
      0.90,
      0.5
    );

  const safeY =
    clampNumber(
      plan.y,
      0.10,
      0.90,
      0.72
    );

  const anchor =
    plan.anchor;

  let xExpression =
    anchor === "center"
      ? `(w-text_w)*${safeX.toFixed(3)}`
      : anchor === "right"
      ? `w-text_w-w*${(1 - safeX).toFixed(3)}`
      : `w*${safeX.toFixed(3)}`;

  let yExpression =
    `h*${safeY.toFixed(3)}`;

  let alphaExpression =
    "1";

  if (
    plan.animation ===
    "fade"
  ) {
    alphaExpression =
      `if(lt(t,${snappedStart.toFixed(3)}),0,if(lt(t,${(
        snappedStart +
        animationLength
      ).toFixed(
        3
      )}),(t-${snappedStart.toFixed(
        3
      )})/${animationLength.toFixed(
        3
      )},if(lt(t,${end.toFixed(
        3
      )}),1,if(lt(t,${(
        end +
        animationLength
      ).toFixed(
        3
      )}),1-(t-${end.toFixed(
        3
      )})/${animationLength.toFixed(
        3
      )},0))))`;
  } else {
    alphaExpression =
      `if(lt(t,${snappedStart.toFixed(
        3
      )}),0,if(lt(t,${end.toFixed(
        3
      )}),1,0))`;
  }

  if (
    plan.animation ===
    "slide_up"
  ) {
    yExpression =
      `(h*${safeY.toFixed(
        3
      )})+if(lt(t,${snappedStart.toFixed(
        3
      )}),40,if(lt(t,${(
        snappedStart +
        animationLength
      ).toFixed(
        3
      )}),40*(1-(t-${snappedStart.toFixed(
        3
      )})/${animationLength.toFixed(
        3
      )}),0))`;
  }

  if (
    plan.animation ===
    "slide_left"
  ) {
    xExpression =
      `(${xExpression})+if(lt(t,${snappedStart.toFixed(
        3
      )}),-120,if(lt(t,${(
        snappedStart +
        animationLength
      ).toFixed(
        3
      )}),-120*(1-(t-${snappedStart.toFixed(
        3
      )})/${animationLength.toFixed(
        3
      )}),0))`;
  }

  if (
    plan.animation ===
    "slide_right"
  ) {
    xExpression =
      `(${xExpression})+if(lt(t,${snappedStart.toFixed(
        3
      )}),120,if(lt(t,${(
        snappedStart +
        animationLength
      ).toFixed(
        3
      )}),120*(1-(t-${snappedStart.toFixed(
        3
      )})/${animationLength.toFixed(
        3
      )}),0))`;
  }

  const headline =
    escapeDrawText(
      plan.headline
    );

  const subline =
    escapeDrawText(
      plan.subline
    );

  const filters: string[] =
    [];

  const box =
    plan.box
      ? `:box=1:boxcolor=black@0.42:boxborderw=14`
      : `:shadowcolor=black@0.65:shadowx=2:shadowy=2`;

  const safeXExpression =
    escapeFFmpegExpression(
      xExpression
    );

  const safeYExpression =
    escapeFFmpegExpression(
      yExpression
    );

  const safeAlphaExpression =
    escapeFFmpegExpression(
      alphaExpression
    );

  filters.push(
    `drawtext=fontfile='${fontFile}':text='${headline}':fontcolor=${color}:fontsize=${fontSize}${box}:x=${safeXExpression}:y=${safeYExpression}:alpha='${safeAlphaExpression}'`
  );

  if (subline) {
    const sublineY =
      `(${yExpression})+${Math.round(
        fontSize *
          1.18
      )}`;

    filters.push(
      `drawtext=fontfile='${fontFile}':text='${subline}':fontcolor=${color}:fontsize=${Math.max(
        22,
        Math.round(
          fontSize *
            0.58
        )
      )}:shadowcolor=black@0.55:shadowx=2:shadowy=2:x=${safeXExpression}:y=${escapeFFmpegExpression(
        sublineY
      )}:alpha='${safeAlphaExpression}'`
    );
  }

  return filters.join(",");
}

type MusicTrack = {
  name: string;
  bpm: number;
  mood: AIEditorialPlan["musicMood"];
  extension: string;
};

function parseMusicTrackMetadata(
  fileName: string
): MusicTrack | null {
  const base =
    path.basename(fileName);

  const extensionMatch =
    base.match(/\.(mp3|m4a|wav|aac|ogg)$/i);

  if (!extensionMatch) {
    return null;
  }

  const moodMatch =
    base.match(/(^|[-_ .])(luxury|modern|energetic|warm)([-_ .]|$)/i);

  const bpmMatch =
    base.match(/(?:^|[-_ .])((?:1[0-4][0-9])|(?:9[0-9])|(?:[1-9][0-9]))(?:bpm)?(?:[-_ .]|$)/i);

  if (!moodMatch || !bpmMatch) {
    return null;
  }

  const bpm =
    Number(bpmMatch[1]);

  if (
    !Number.isFinite(bpm) ||
    bpm < 90 ||
    bpm > 149
  ) {
    return null;
  }

  const mood =
    safeEnum(
      moodMatch[2],
      [
        "luxury",
        "modern",
        "energetic",
        "warm",
      ] as const,
      "modern"
    );

  return {
    name: fileName,
    bpm,
    mood,
    extension:
      extensionMatch[1].toLowerCase(),
  };
}

async function selectLicensedMusicTrack(
  targetMood: AIEditorialPlan["musicMood"],
  targetBpm: number,
  tempDirectory: string
): Promise<{
  filePath: string;
  track: MusicTrack;
}> {
  const bucket =
    process.env.MIB_MUSIC_BUCKET ||
    "ai-music";

  console.log(
    "AI MUSIC: searching licensed music library:",
    {
      bucket,
      targetMood,
      targetBpm,
    }
  );

  /*
  |--------------------------------------------------------------------------
  | 1. USE A REAL LICENSED TRACK IF ONE EXISTS
  |--------------------------------------------------------------------------
  |
  | This remains the preferred path. The filenames tell MIB the mood/BPM:
  |
  | modern-120-track.mp3
  | energetic-124-track.mp3
  | luxury-110-track.mp3
  | warm-112-track.mp3
  |
  */

  try {
    const {
      data: files,
      error: listError,
    } =
      await supabaseAdmin
        .storage
        .from(bucket)
        .list("", {
          limit: 200,
          sortBy: {
            column: "name",
            order: "asc",
          },
        });

    if (
      !listError
    ) {
      const candidates =
        (files || [])
          .filter(
            (file) =>
              file?.name &&
              !file.name.endsWith("/")
          )
          .map(
            (file) =>
              parseMusicTrackMetadata(
                file.name
              )
          )
          .filter(
            (
              track
            ): track is MusicTrack =>
              Boolean(track)
          );

      if (
        candidates.length > 0
      ) {
        const scored =
          candidates
            .map(
              (track) => {
                const moodPenalty =
                  track.mood ===
                  targetMood
                    ? 0
                    : 30;

                const bpmPenalty =
                  Math.abs(
                    track.bpm -
                      targetBpm
                  );

                return {
                  track,
                  score:
                    moodPenalty +
                    bpmPenalty,
                };
              }
            )
            .sort(
              (a, b) =>
                a.score -
                b.score
            );

        const selected =
          scored[0]?.track;

        if (selected) {
          const {
            data:
              signedUrlData,
            error:
              signedUrlError,
          } =
            await supabaseAdmin
              .storage
              .from(bucket)
              .createSignedUrl(
                selected.name,
                60 * 60
              );

          if (
            !signedUrlError &&
            signedUrlData?.signedUrl
          ) {
            const response =
              await fetch(
                signedUrlData.signedUrl
              );

            if (
              response.ok
            ) {
              const musicFile =
                path.join(
                  tempDirectory,
                  `licensed-music.${selected.extension}`
                );

              const musicBuffer =
                Buffer.from(
                  await response.arrayBuffer()
                );

              await fs.writeFile(
                musicFile,
                musicBuffer
              );

              console.log(
                "AI MUSIC: REAL LICENSED TRACK SELECTED:",
                {
                  track:
                    selected.name,
                  mood:
                    selected.mood,
                  bpm:
                    selected.bpm,
                  bytes:
                    musicBuffer.length,
                }
              );

              return {
                filePath:
                  musicFile,
                track:
                  selected,
              };
            }
          }

          console.warn(
            "AI MUSIC: licensed track could not be downloaded; using built-in soundtrack."
          );
        }
      }
    } else {
      console.warn(
        "AI MUSIC: music bucket unavailable; using built-in soundtrack:",
        listError.message
      );
    }
  } catch (
    libraryError
  ) {
    console.warn(
      "AI MUSIC: licensed library check failed; using built-in soundtrack:",
      libraryError
    );
  }

  /*
  |--------------------------------------------------------------------------
  | 2. AUTOMATIC BUILT-IN ORIGINAL SHORT-FORM SOUNDTRACK
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  | This is generated automatically on the user's machine.
  |
  | It is NOT a downloaded TikTok song and does not require the user to
  | populate a Supabase bucket.
  |
  | It is intentionally rhythmic and commercial rather than an ambient pad:
  |
  | - kick
  | - clap/snare
  | - hi-hat
  | - bass pulse
  | - chord stabs
  | - melodic hook
  | - pumping/tremolo movement
  |
  */

  const safeBpm =
    Math.max(
      104,
      Math.min(
        124,
        Number.isFinite(
          Number(targetBpm)
        )
          ? Number(targetBpm)
          : 116
      )
    );

  const output =
    path.join(
      tempDirectory,
      "mib-original-soundtrack.wav"
    );

  const duration =
    30;

  /*
  | Mood changes the harmonic palette and rhythmic density.
  */
  const moodSettings: Record<
    AIEditorialPlan["musicMood"],
    {
      bassHz: number;
      chord1: number;
      chord2: number;
      chord3: number;
      lead1: number;
      lead2: number;
      hatVolume: number;
      master: number;
    }
  > = {
    luxury: {
      bassHz: 55,
      chord1: 220,
      chord2: 277.18,
      chord3: 329.63,
      lead1: 440,
      lead2: 554.37,
      hatVolume: 0.08,
      master: 0.78,
    },

    modern: {
      bassHz: 58.27,
      chord1: 233.08,
      chord2: 293.66,
      chord3: 349.23,
      lead1: 466.16,
      lead2: 587.33,
      hatVolume: 0.11,
      master: 0.84,
    },

    energetic: {
      bassHz: 61.74,
      chord1: 246.94,
      chord2: 311.13,
      chord3: 369.99,
      lead1: 493.88,
      lead2: 622.25,
      hatVolume: 0.14,
      master: 0.90,
    },

    warm: {
      bassHz: 52,
      chord1: 196,
      chord2: 246.94,
      chord3: 293.66,
      lead1: 392,
      lead2: 493.88,
      hatVolume: 0.09,
      master: 0.80,
    },
  };

  const settings =
    moodSettings[
      targetMood
    ] ||
    moodSettings.modern;

  /*
  | FFmpeg's lavfi sources create the musical layers.
  |
  | apulsator provides a rhythmic pumping movement. The kick/clap/hat layers
  | use fixed sine/noise sources and the full mix is locked to the selected
  | BPM. This is deliberately more like a short-form commercial bed than
  | the previous dull continuous tone.
  */

  const beatHz =
    safeBpm / 60;

  const filterComplex = [
    `sine=frequency=70:duration=${duration}:sample_rate=44100[kickBase]`,
    `sine=frequency=${settings.bassHz}:duration=${duration}:sample_rate=44100[bassBase]`,
    `sine=frequency=${settings.chord1}:duration=${duration}:sample_rate=44100[ch1]`,
    `sine=frequency=${settings.chord2}:duration=${duration}:sample_rate=44100[ch2]`,
    `sine=frequency=${settings.chord3}:duration=${duration}:sample_rate=44100[ch3]`,
    `sine=frequency=${settings.lead1}:duration=${duration}:sample_rate=44100[lead1]`,
    `sine=frequency=${settings.lead2}:duration=${duration}:sample_rate=44100[lead2]`,
    `anoisesrc=color=white:duration=${duration}:sample_rate=44100[noise]`,

    `[kickBase]volume=0.58,apulsator=mode=sine:amount=0.88:hz=${beatHz}[kick]`,

    `[bassBase]volume=0.72,apulsator=mode=sine:amount=0.58:hz=${beatHz}[bass]`,

    `[ch1]volume=0.16,apulsator=mode=sine:amount=0.72:hz=${beatHz / 2}[ch1m]`,
    `[ch2]volume=0.13,apulsator=mode=sine:amount=0.72:hz=${beatHz / 2}[ch2m]`,
    `[ch3]volume=0.10,apulsator=mode=sine:amount=0.72:hz=${beatHz / 2}[ch3m]`,

    `[lead1]volume=0.10,apulsator=mode=sine:amount=0.65:hz=${beatHz / 4}[lead1m]`,
    `[lead2]volume=0.07,apulsator=mode=sine:amount=0.65:hz=${beatHz / 4}[lead2m]`,

    `[noise]highpass=f=6000,lowpass=f=11000,volume=${settings.hatVolume},apulsator=mode=sine:amount=0.9:hz=${beatHz * 2}[hat]`,

    `sine=frequency=1850:duration=${duration}:sample_rate=44100[clapTone]`,
    `[clapTone]volume=0.10,apulsator=mode=sine:amount=0.95:hz=${beatHz}[clap]`,

    `[kick][bass][ch1m][ch2m][ch3m][lead1m][lead2m][hat][clap]amix=inputs=9:duration=longest:dropout_transition=0,volume=${settings.master},alimiter=limit=0.92,afade=t=in:st=0:d=0.35,afade=t=out:st=27:d=3[aout]`,
  ].join(";");

  await runFFmpeg([
    "-y",
    "-filter_complex",
    filterComplex,
    "-map",
    "[aout]",
    "-t",
    String(duration),
    "-ar",
    "44100",
    "-ac",
    "2",
    "-c:a",
    "pcm_s16le",
    output,
  ]);

  console.log(
    "AI MUSIC: AUTOMATIC ORIGINAL SHORT-FORM SOUNDTRACK GENERATED:",
    {
      mood:
        targetMood,
      bpm:
        safeBpm,
      duration,
      file:
        output,
    }
  );

  return {
    filePath:
      output,
    track: {
      name:
        `MIB Original ${targetMood} ${safeBpm}BPM`,
      bpm:
        safeBpm,
      mood:
        targetMood,
      extension:
        "wav",
    },
  };
}


/*
|--------------------------------------------------------------------------
| POST — ASSEMBLE FINAL VIDEO
|--------------------------------------------------------------------------
*/

export async function POST(
  request: Request
) {
  let tempDirectory:
    string | null = null;

  let requestBody:
    any = null;

  try {

    requestBody =
      await request.json();

    const projectId =
      requestBody?.projectId;

    const editingPlan =
  requestBody?.editingPlan;

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

    console.log(
      "=================================================="
    );

    console.log(
      "VIDEO ASSEMBLER: START"
    );

    console.log(
      "Project ID:",
      projectId
    );

    /*
    |--------------------------------------------------------------------------
    | LOAD PROJECT
    |--------------------------------------------------------------------------
    */

    const {
      data: project,
      error: projectError,
    } =
      await supabaseAdmin
        .from(
          "ai_video_projects"
        )
        .select("*")
        .eq(
          "id",
          projectId
        )
        .single();

    if (
      projectError
    ) {
      throw new Error(
        `Failed to load video project: ${projectError.message}`
      );
    }

    if (!project) {
      throw new Error(
        "Video project was not found."
      );
    }

    console.log(
      "VIDEO ASSEMBLER: project loaded",
      project.id
    );

    /*
    |--------------------------------------------------------------------------
    | LOAD PROPERTY DATA FOR TEXT OVERLAY
    |--------------------------------------------------------------------------
    */

    const {
      data: property,
      error: propertyError,
    } =
      await supabaseAdmin
        .from(
          "properties"
        )
        .select("*")
        .eq(
          "id",
          Number(
            project.property_id
          )
        )
        .maybeSingle();

    if (propertyError) {
      throw new Error(
        `Failed to load property data: ${propertyError.message}`
      );
    }

    console.log(
      "VIDEO ASSEMBLER: property text data loaded:",
      Boolean(property)
    );

    /*
    |--------------------------------------------------------------------------
    | LOAD SHOTS
    |--------------------------------------------------------------------------
    */

    const {
      data: shots,
      error: shotsError,
    } =
      await supabaseAdmin
        .from(
          "ai_videos"
        )
        .select("*")
        .eq(
          "project_id",
          projectId
        )
        .eq(
          "video_type",
          "shot"
        )
        .order(
          "shot_order",
          {
            ascending: true,
          }
        );

    if (
      shotsError
    ) {
      throw new Error(
        `Failed to load project shots: ${shotsError.message}`
      );
    }

    if (
      !shots ||
      shots.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No video shots found for this project.",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "VIDEO ASSEMBLER: shots found:",
      shots.length
    );

    /*
    |--------------------------------------------------------------------------
    | NORMALIZE EDITING PLAN
    |--------------------------------------------------------------------------
    */

    const rawEditingShots =
      Array.isArray(
        editingPlan?.shots
      )
        ? editingPlan.shots
        : [];

    const editShots =
      shots.map(
        (
          shot,
          index
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
                  shot.shot_order
                )
            ) ||
            rawEditingShots[index] ||
            {};

          const rawDuration =
            Number(
              planned?.recommendedDuration
            );

          const duration =
            Number.isFinite(
              rawDuration
            )
              ? Math.min(
                  4,
                  Math.max(
                    0.5,
                    rawDuration
                  )
                )
              : 4;

          return {
            shot,
            duration,
            role:
              String(
                planned?.role ||
                  (
                    index === 0
                      ? "HOOK"
                      : index ===
                          shots.length - 1
                      ? "HERO"
                      : "REVEAL"
                  )
              ),
            energy:
              String(
                planned?.energy ||
                  "MEDIUM"
              ),
            cutStyle:
              String(
                planned?.cutStyle ||
                  (
                    index ===
                    shots.length - 1
                      ? "FINAL_HOLD"
                      : "HARD_CUT"
                  )
              ),
          };
        }
      );

    console.log(
      "VIDEO ASSEMBLER: EDIT PLAN:",
      editShots.map(
        (
          item
        ) => ({
          shotOrder:
            item.shot.shot_order,
          duration:
            item.duration,
          role:
            item.role,
          energy:
            item.energy,
          cutStyle:
            item.cutStyle,
        })
      )
    );

    /*
    |--------------------------------------------------------------------------
    | VERIFY ALL SHOTS ARE COMPLETE
    |--------------------------------------------------------------------------
    */

    const incompleteShots =
      shots.filter(
        (shot) =>
          shot.status !==
            "completed" ||
          !shot.video_url
      );

    if (
      incompleteShots.length >
      0
    ) {

      console.log(
        "VIDEO ASSEMBLER: project is not ready."
      );

      console.log(
        "Incomplete shots:",
        incompleteShots.length
      );

      return NextResponse.json(
        {
          success: false,

          ready: false,

          status:
            "waiting",

          message:
            "Not all video shots are completed.",

          completed:
            shots.length -
            incompleteShots.length,

          total:
            shots.length,

          incompleteShotIds:
            incompleteShots.map(
              (shot) =>
                shot.id
            ),
        },
        {
          status: 409,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE PROJECT — ASSEMBLING
    |--------------------------------------------------------------------------
    |
    | The existing final video is intentionally NOT deleted or nulled here.
    | If this rebuild fails, the catch block restores/keeps the project
    | as completed because final_video_url still exists.
    |
    */

    await supabaseAdmin
      .from(
        "ai_video_projects"
      )
      .update({
        status:
          "assembling",

        clip_count:
          shots.length,

        error_message:
          null,
      })
      .eq(
        "id",
        projectId
      );

    console.log(
      "VIDEO ASSEMBLER: all shots completed."
    );

    console.log(
      "VIDEO ASSEMBLER: assembling",
      shots.length,
      "shots."
    );

    /*
    |--------------------------------------------------------------------------
    | TEMP DIRECTORY
    |--------------------------------------------------------------------------
    */

    tempDirectory =
      await fs.mkdtemp(
        path.join(
          os.tmpdir(),
          "mib-video-"
        )
      );

    console.log(
      "VIDEO ASSEMBLER: temp directory:",
      tempDirectory
    );

    /*
    |--------------------------------------------------------------------------
    | DOWNLOAD SHOTS + AI EDITORIAL ANALYSIS
    |--------------------------------------------------------------------------
    */

    const sourceFiles:
      string[] = [];


    /*
    |--------------------------------------------------------------------------
    | DOWNLOAD ALL SOURCE SHOTS
    |--------------------------------------------------------------------------
    */

    for (
      let index = 0;
      index < editShots.length;
      index++
    ) {
      const shot =
        editShots[index].shot;

      const sourceFile =
        path.join(
          tempDirectory,
          `source-${String(
            index + 1
          ).padStart(3, "0")}.mp4`
        );

      console.log(
        `VIDEO ASSEMBLER: downloading source shot ${index + 1}/${editShots.length}`
      );

      const response =
        await fetch(
          shot.video_url
        );

      if (!response.ok) {
        throw new Error(
          `Failed to download shot ${index + 1}: HTTP ${response.status}`
        );
      }

      const arrayBuffer =
        await response.arrayBuffer();

      const buffer =
        Buffer.from(arrayBuffer);

      await fs.writeFile(
        sourceFile,
        buffer
      );

      sourceFiles.push(
        sourceFile
      );

      console.log(
        `VIDEO ASSEMBLER: source shot ${index + 1} downloaded: ${buffer.length} bytes`
      );
    }

    /*
    |--------------------------------------------------------------------------
    | EXTRACT REPRESENTATIVE FRAMES
    |--------------------------------------------------------------------------
    */

    const editorialFrames: {
      shotOrder: number;
      imageBase64: string;
    }[] = [];

    for (
      let index = 0;
      index < sourceFiles.length;
      index++
    ) {
      const frameFile =
        path.join(
          tempDirectory,
          `editor-frame-${String(
            index + 1
          ).padStart(3, "0")}.jpg`
        );

      await runFFmpeg([
        "-y",
        "-ss",
        "1.5",
        "-i",
        sourceFiles[index],
        "-frames:v",
        "1",
        "-vf",
        "scale=360:-2",
        "-q:v",
        "4",
        frameFile,
      ]);

      const frameBuffer =
        await fs.readFile(
          frameFile
        );

      editorialFrames.push({
        shotOrder:
          editShots[index].shot
            .shot_order,
        imageBase64:
          frameBuffer.toString(
            "base64"
          ),
      });

      console.log(
        "AI EDITOR: frame extracted:",
        {
          shotOrder:
            editShots[index].shot
              .shot_order,
          bytes:
            frameBuffer.length,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | ONE AI EDITORIAL PASS FOR THE WHOLE VIDEO
    |--------------------------------------------------------------------------
    */

    const aiEditorialPlan =
      await analyzeSequenceWithOpenAI(
        property || {},
        editorialFrames,
        editShots.map(
          (item) =>
            item.duration
        )
      );

    console.log(
      "AI EDITORIAL PLAN:",
      JSON.stringify(
        aiEditorialPlan,
        null,
        2
      )
    );

    /*
    |--------------------------------------------------------------------------
    | SELECT / GENERATE MUSIC BEFORE RENDERING
    |--------------------------------------------------------------------------
    |
    | The selected/generated track BPM becomes the authoritative edit tempo.
    | This prevents the AI from choosing one BPM while the actual soundtrack
    | uses another.
    |
    */

    const musicSelection =
      await selectLicensedMusicTrack(
        aiEditorialPlan.musicMood,
        aiEditorialPlan.bpm,
        tempDirectory
      );

    aiEditorialPlan.bpm =
      musicSelection.track.bpm;

    console.log(
      "AI MUSIC: EDIT TEMPO LOCKED:",
      {
        track:
          musicSelection.track.name,
        mood:
          musicSelection.track.mood,
        bpm:
          musicSelection.track.bpm,
      }
    );

    /*
    |--------------------------------------------------------------------------
    | RENDER EACH SHOT USING THE AI PLAN
    |--------------------------------------------------------------------------
    */

    const localFiles:
      string[] = [];

    for (
      let index = 0;
      index < editShots.length;
      index++
    ) {
      const item =
        editShots[index];

      const shot =
        item.shot;

      const sourceFile =
        sourceFiles[index];

      const trimmedFile =
        path.join(
          tempDirectory,
          `shot-${String(
            index + 1
          ).padStart(
            3,
            "0"
          )}.mp4`
        );

      const overlayPlan =
        aiEditorialPlan.shots.find(
          (candidate) =>
            candidate.shotOrder ===
            Number(
              shot.shot_order
            )
        ) ||
        aiEditorialPlan.shots[index];

      const duration =
        snapDurationToBeat(
          clampNumber(
            overlayPlan?.duration,
            2.5,
            item.duration,
            item.duration
          ),
          aiEditorialPlan.bpm,
          item.duration
        );

      const overlayFilter =
        overlayPlan
          ? buildAIOverlayFilter(
              overlayPlan,
              duration,
              aiEditorialPlan.bpm
            )
          : "";

      console.log(
        "AI EDITOR: rendering shot:",
        {
          shotOrder:
            shot.shot_order,
          duration,
          overlay:
            overlayPlan,
          filter:
            overlayFilter ||
            "NONE",
        }
      );

      const shotArgs =
        [
          "-y",

          "-i",
          sourceFile,

          "-t",
          String(
            duration
          ),

          "-an",
        ];

      if (
        overlayFilter
      ) {
        shotArgs.push(
          "-vf",
          overlayFilter
        );
      }

      shotArgs.push(
        "-c:v",
        "libx264",

        "-preset",
        "veryfast",

        "-crf",
        "20",

        "-pix_fmt",
        "yuv420p",

        "-movflags",
        "+faststart",

        trimmedFile
      );

      await runFFmpeg(
        shotArgs
      );

      localFiles.push(
        trimmedFile
      );

      console.log(
        `VIDEO ASSEMBLER: shot ${index + 1} editorial render complete: ${duration}s`
      );
    }

    /*
    |--------------------------------------------------------------------------
    | FINAL MUSIC TRACK
    |--------------------------------------------------------------------------
    |
    | A licensed library track is preferred. If none exists, MIB automatically
    | generates an original rhythmic soundtrack locally.
    |
    */

    const totalDuration =
      aiEditorialPlan.shots.reduce(
        (
          total,
          shot,
          index
        ) =>
          total +
          snapDurationToBeat(
            shot.duration,
            aiEditorialPlan.bpm,
            editShots[index]
              ?.duration ||
              4
          ),
        0
      );

    const musicFile =
      musicSelection.filePath;

    console.log(
      "AI MUSIC: soundtrack ready:",
      {
        track:
          musicSelection.track.name,
        bpm:
          musicSelection.track.bpm,
        mood:
          musicSelection.track.mood,
        duration:
          totalDuration,
      }
    );

    /*
    |--------------------------------------------------------------------------
    | CREATE CONCAT FILE
    |--------------------------------------------------------------------------
    |
    | The files are already trimmed according to the AI Editing Plan.
    */

    const concatFile =
      path.join(
        tempDirectory,
        "concat.txt"
      );

    const concatContents =
      localFiles
        .map(
          (file) =>
            `file '${file.replace(
              /\\/g,
              "/"
            )}'`
        )
        .join(
          "\n"
        );

    await fs.writeFile(
      concatFile,
      concatContents,
      "utf8"
    );

    /*
    |--------------------------------------------------------------------------
    | FINAL VIDEO + MUSIC
    |--------------------------------------------------------------------------
    */

    const silentVideoFile =
      path.join(
        tempDirectory,
        "assembled-silent.mp4"
      );

    const finalFile =
      path.join(
        tempDirectory,
        "final-video.mp4"
      );

    /*
    |--------------------------------------------------------------------------
    | CONCATENATE VIDEO
    |--------------------------------------------------------------------------
    */

    console.log(
      "VIDEO ASSEMBLER: concatenating editorial shots..."
    );

    await runFFmpeg([
      "-y",

      "-f",
      "concat",

      "-safe",
      "0",

      "-i",
      concatFile,

      "-an",

      "-c:v",
      "libx264",

      "-preset",
      "veryfast",

      "-crf",
      "20",

      "-pix_fmt",
      "yuv420p",

      "-movflags",
      "+faststart",

      silentVideoFile,
    ]);

    /*
    |--------------------------------------------------------------------------
    | MUX ORIGINAL GENERATED MUSIC
    |--------------------------------------------------------------------------
    */

    console.log(
      "VIDEO ASSEMBLER: syncing original music to final video..."
    );

    await runFFmpeg([
      "-y",

      "-i",
      silentVideoFile,

      "-i",
      musicFile,

      "-map",
      "0:v:0",

      "-map",
      "1:a:0",

      "-shortest",

      "-c:v",
      "copy",

      "-c:a",
      "aac",

      "-b:a",
      "160k",

      "-af",
      `volume=0.36,afade=t=in:st=0:d=0.25:curve=tri,afade=t=out:st=${Math.max(0.1, totalDuration - 0.55).toFixed(3)}:d=0.55:curve=tri`,

      "-movflags",
      "+faststart",

      finalFile,
    ]);

    /*
    |--------------------------------------------------------------------------
    | CHECK OUTPUT
    |--------------------------------------------------------------------------
    */

    const finalStats =
      await fs.stat(
        finalFile
      );

    console.log(
      "VIDEO ASSEMBLER: final video created:",
      finalStats.size,
      "bytes"
    );

    if (
      finalStats.size ===
      0
    ) {
      throw new Error(
        "FFmpeg created an empty final video."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | READ FINAL FILE
    |--------------------------------------------------------------------------
    */

    const finalBuffer =
      await fs.readFile(
        finalFile
      );

    /*
    |--------------------------------------------------------------------------
    | SUPABASE STORAGE
    |--------------------------------------------------------------------------
    */

    const storagePath =
      `property-${project.property_id}/projects/${projectId}/final-video.mp4`;

    console.log(
      "VIDEO ASSEMBLER: uploading final video:"
    );

    console.log(
      storagePath
    );

    const {
      error:
        uploadError,
    } =
      await supabaseAdmin
        .storage
        .from(
          "ai-videos"
        )
        .upload(
          storagePath,
          finalBuffer,
          {
            contentType:
              "video/mp4",

            cacheControl:
              "0",

            upsert:
              true,
          }
        );

    if (
      uploadError
    ) {
      throw new Error(
        `Failed to upload final video: ${uploadError.message}`
      );
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
          storagePath
        );

    const canonicalFinalVideoUrl =
      publicUrlData?.publicUrl;

    if (
      !canonicalFinalVideoUrl
    ) {
      throw new Error(
        "Final video uploaded but no public URL was generated."
      );
    }

    const finalVideoUrl =
      `${canonicalFinalVideoUrl}${
        canonicalFinalVideoUrl.includes("?")
          ? "&"
          : "?"
      }v=${Date.now()}`;

    console.log(
      "VIDEO ASSEMBLER: FINAL VIDEO URL:",
      finalVideoUrl
    );

    /*
    |--------------------------------------------------------------------------
    | UPDATE PROJECT
    |--------------------------------------------------------------------------
    */

    const {
      data:
        updatedProject,
      error:
        updateError,
    } =
      await supabaseAdmin
        .from(
          "ai_video_projects"
        )
        .update({
          status:
            "completed",

          clip_count:
            shots.length,

          final_video_url:
            finalVideoUrl,

          completed_at:
            new Date().toISOString(),

          error_message:
            null,
        })
        .eq(
          "id",
          projectId
        )
        .select()
        .single();

    if (
      updateError
    ) {
      throw new Error(
        `Failed to update video project: ${updateError.message}`
      );
    }

    /*
    |--------------------------------------------------------------------------
    | SUCCESS
    |--------------------------------------------------------------------------
    */

    console.log(
      "VIDEO ASSEMBLER: PROJECT COMPLETED"
    );

    console.log(
      "Project:",
      projectId
    );

    console.log(
      "Clips:",
      shots.length
    );

    console.log(
      "Final:",
      finalVideoUrl
    );

    console.log(
      "=================================================="
    );

    return NextResponse.json({

      success:
        true,

      ready:
        true,

      projectId,

      propertyId:
        project.property_id,

      clipCount:
        shots.length,

      finalVideoUrl,

      project:
        updatedProject,

    });

  } catch (
    error: any
  ) {

    console.error(
      "VIDEO ASSEMBLER ERROR:",
      error
    );

    /*
    |--------------------------------------------------------------------------
    | SAFE FAILURE HANDLING
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    |
    | A rebuild must NEVER make an already-successful final video disappear.
    |
    | If this project already has final_video_url, preserve:
    |   status = completed
    |   final_video_url = existing URL
    |
    | Only a project that has NEVER produced a final video may become failed.
    |
    */

    try {

      const bodyError =
        error?.message ||
        "Video assembly failed.";

      const projectId =
        requestBody?.projectId;

      if (
        projectId
      ) {

        const {
          data:
            existingProject,
          error:
            existingProjectError,
        } =
          await supabaseAdmin
            .from(
              "ai_video_projects"
            )
            .select(
              `
                id,
                status,
                final_video_url
              `
            )
            .eq(
              "id",
              projectId
            )
            .maybeSingle();

        if (
          existingProjectError
        ) {

          console.error(
            "VIDEO ASSEMBLER: failed to load project during error recovery:",
            existingProjectError
          );

        } else if (
          existingProject?.final_video_url
        ) {

          console.warn(
            "VIDEO ASSEMBLER: rebuild failed, PRESERVING existing final video:",
            {
              projectId,
              finalVideoUrl:
                existingProject.final_video_url,
            }
          );

          await supabaseAdmin
            .from(
              "ai_video_projects"
            )
            .update({
              status:
                "completed",

              error_message:
                null,
            })
            .eq(
              "id",
              projectId
            );

        } else {

          await supabaseAdmin
            .from(
              "ai_video_projects"
            )
            .update({
              status:
                "failed",

              error_message:
                bodyError,
            })
            .eq(
              "id",
              projectId
            );
        }
      }

    } catch (
      updateError
    ) {

      console.error(
        "VIDEO ASSEMBLER: failed to update project error state:",
        updateError
      );
    }

    return NextResponse.json(
      {
        success:
          false,

        ready:
          false,

        error:
          error?.message ||
          "Video assembly failed.",
      },
      {
        status: 500,
      }
    );

  } finally {

    /*
    |--------------------------------------------------------------------------
    | CLEAN TEMP FILES
    |--------------------------------------------------------------------------
    */

    if (
      tempDirectory
    ) {

      try {

        await fs.rm(
          tempDirectory,
          {
            recursive:
              true,

            force:
              true,
          }
        );

        console.log(
          "VIDEO ASSEMBLER: temp files cleaned."
        );

      } catch (
        cleanupError
      ) {

        console.error(
          "VIDEO ASSEMBLER CLEANUP ERROR:",
          cleanupError
        );
      }
    }
  }
}