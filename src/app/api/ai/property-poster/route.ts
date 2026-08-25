import OpenAI, { toFile } from "openai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireUser } from "@/lib/apiAuth";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
| CREATIVE DIRECTOR PROMPT
|--------------------------------------------------------------------------
*/

const CREATIVE_DIRECTOR_PROMPT = `
CREATIVE DIRECTOR MODE — CREATE THE PROPERTY POSTER

You are an elite real estate creative director, graphic designer,
art director and property marketing strategist.

Create ONE finished vertical real estate advertising poster using:

1. The supplied REAL PROPERTY DATABASE.
2. The supplied REAL PROPERTY PHOTOGRAPHS.
3. The supplied REAL AGENT INFORMATION.

You are responsible for the entire visual design.

DO NOT follow a predefined flyer layout.

DO NOT create a generic real estate flyer.

DO NOT automatically use:
- two-column property flyers
- generic white information boxes
- generic blue-and-gold templates
- Canva-style layouts
- repetitive real estate templates

STUDY THE PROPERTY.
STUDY THE PHOTOGRAPHS.
UNDERSTAND THE PROPERTY.
THEN DESIGN THE POSTER YOURSELF.

==================================================
CREATIVE FREEDOM
==================================================

You decide:

- layout
- composition
- typography
- font hierarchy
- colour palette
- image hierarchy
- image cropping
- image sizing
- photo arrangement
- negative space
- graphic elements
- visual emphasis
- information hierarchy
- artistic direction

Let THIS property determine the design.

The final result should look like professional paid
real-estate advertising created by a serious creative agency.

==================================================
PHOTOGRAPHY
==================================================

THE SUPPLIED PHOTOGRAPHS ARE THE ACTUAL PROPERTY.

Use them as the primary visual assets.

You may:

- crop
- resize
- overlap
- frame
- arrange
- adjust brightness
- adjust contrast
- correct perspective
- improve readability

You MUST NOT:

- invent rooms
- invent windows
- invent doors
- invent furniture
- invent gardens
- invent pools
- invent extensions
- invent architectural features
- replace the property with another property
- fundamentally alter the property's appearance

The property must remain recognisable and truthful.

==================================================
PROPERTY INFORMATION
==================================================

The supplied listing data is the ONLY factual source.

Use only supplied facts.

Never invent:

- prices
- measurements
- bedrooms
- bathrooms
- tenure
- facilities
- distances
- travel times
- ROI
- investment claims
- renovation claims
- accessibility claims

If information is missing, omit it.

==================================================
COPYWRITING
==================================================

You may create compelling:

- headlines
- supporting headlines
- selling statements
- taglines
- calls-to-action

Every factual claim must be supported by the supplied database.

Keep copy concise.

Do not fill the poster with unnecessary text.

==================================================
INFORMATION HIERARCHY
==================================================

The viewer should understand quickly:

WHAT IS IT?

WHERE IS IT?

HOW MUCH?

WHY IS IT SPECIAL?

WHO DO I CONTACT?

The selling price must be highly visible.

The location must be clear.

The strongest selling point must receive strong visual emphasis.

Secondary information must never overpower the property photographs.

==================================================
BRANDING & CONTACT FOOTER
==================================================

MIB PROPERTIES branding must be clearly visible.

Create a professional branded footer or lower section
that contains the agent/contact information.

Use the supplied agent information accurately.

IMPORTANT:

The contact information must be displayed exactly as supplied.

Do NOT invent:
- logo 
- brand
- agent name
- phone number
- email
- website
- registration number

Preferred footer hierarchy:

MAXCHEA
PROPERTY

Your Property, Our Priority.

YOUR TRUSTED PROPERTY PARTNER

MAX CHEA

☎ [016-5210993]

🌐 [Facebook.com/maxzchea]

The MAXCHEA PROPERTY branding should feel premium,
clean and corporate.

The footer should NOT overpower the property photography.

Use strong typography and good spacing.

NO logo/branding should be positioned naturally
according to the overall poster composition.

Do NOT create a generic contact-information box.

Integrate the branding into the overall design.

If a QR code is supplied or available, it may be incorporated
into the footer.

If QR information is unavailable, do NOT invent a QR code.

==================================================
SOCIAL MEDIA
==================================================

Create a vertical premium property advertisement.

Optimise it for:

Facebook
Instagram
WhatsApp
mobile viewing

Use strong visual hierarchy.

Avoid tiny text.

Avoid unnecessary decoration.

Use negative space intelligently.

==================================================
DESIGN QUALITY
==================================================

The finished poster must look:

- sophisticated
- intentional
- premium
- modern
- memorable
- commercially effective
- professionally art-directed

It must NOT look like an AI-generated database flyer.

Every design decision should serve:

ATTRACT → INFORM → CREATE DESIRE → BUILD TRUST → GENERATE ENQUIRY

==================================================
FINAL TEST
==================================================

Before completing the image ask:

1. Does the property look desirable?
2. Is the strongest feature obvious?
3. Is the price easy to find?
4. Is the location obvious?
5. Are the actual photographs used effectively?
6. Is the typography professional?
7. Is there enough negative space?
8. Is the design visually distinctive?
9. Does the design suit THIS property?
10. Does it look like professional paid advertising?

If not, redesign it.

==================================================
FINAL INSTRUCTION
==================================================

MAKE ALL DESIGN DECISIONS YOURSELF.

Do not ask questions.

Do not return JSON.

Do not return coordinates.

Do not return a layout specification.

Do not describe the design.

RETURN ONE FINISHED POSTER IMAGE.
`;

/*
|--------------------------------------------------------------------------
| DOWNLOAD PROPERTY IMAGE
|--------------------------------------------------------------------------
*/

async function downloadImage(
  imageUrl: string
): Promise<Buffer | null> {
  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      console.error(
        "Failed to download property image:",
        imageUrl,
        response.status
      );

      return null;
    }

    const arrayBuffer =
      await response.arrayBuffer();

    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error(
      "Image download error:",
      imageUrl,
      error
    );

    return null;
  }
}

/*
|--------------------------------------------------------------------------
| POST
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

    const listing =
      body?.listing;

    if (
      !listing ||
      typeof listing !== "object"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Listing data is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | PROPERTY DATA
    |--------------------------------------------------------------------------
    */

    const {
      property_photos,
      ...propertyData
    } = listing;

    /*
    |--------------------------------------------------------------------------
    | PROPERTY ID
    |--------------------------------------------------------------------------
    */

    const propertyId =
      listing?.id;

    if (
      propertyId === null ||
      propertyId === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Listing ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | PROPERTY PHOTOS
    |--------------------------------------------------------------------------
    */

    const photos =
      Array.isArray(
        property_photos
      )
        ? property_photos
            .filter(
              (photo: any) =>
                typeof photo?.image_url ===
                  "string" &&
                photo.image_url.trim() !==
                  ""
            )
            .map(
              (
                photo: any,
                index: number
              ) => ({
                index,
                photo_type:
                  photo?.photo_type ||
                  "",
                image_url:
                  photo.image_url,
              })
            )
        : [];

    if (
      photos.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This listing has no usable property photos.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | LIMIT PHOTOS
    |--------------------------------------------------------------------------
    */

    const photosToUse =
      photos.slice(0, 16);

    /*
    |--------------------------------------------------------------------------
    | DOWNLOAD REAL PROPERTY PHOTOS
    |--------------------------------------------------------------------------
    */

    console.log(
      "AI POSTER: downloading property photos..."
    );

    const downloadedPhotos =
      await Promise.all(
        photosToUse.map(
          async (
            photo: any
          ) => {
            const buffer =
              await downloadImage(
                photo.image_url
              );

            return {
              ...photo,
              buffer,
            };
          }
        )
      );

    /*
    |--------------------------------------------------------------------------
    | USE MAXIMUM 9 PHOTOS
    |--------------------------------------------------------------------------
    */

    const usablePhotos =
      downloadedPhotos
        .filter(
          (
            photo: any
          ) =>
            Buffer.isBuffer(
              photo.buffer
            )
        )
        .slice(0, 9);

    console.log(
      "AI POSTER PHOTO DIAGNOSTIC:",
      {
        photosFound:
          photos.length,

        photosAttempted:
          photosToUse.length,

        photosDownloaded:
          usablePhotos.length,

        photosFailed:
          photosToUse.length -
          usablePhotos.length,
      }
    );

    if (
      usablePhotos.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to download any property photos.",
        },
        {
          status: 500,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CONVERT TO REAL IMAGE FILES
    |--------------------------------------------------------------------------
    */

    const imageFiles =
      await Promise.all(
        usablePhotos.map(
          async (
            photo: any,
            index: number
          ) => {
            return toFile(
              photo.buffer,
              `property-photo-${index}.jpg`,
              {
                type: "image/jpeg",
              }
            );
          }
        )
      );

    console.log(
      "AI POSTER: prepared",
      imageFiles.length,
      "image files"
    );

    /*
    |--------------------------------------------------------------------------
    | PROPERTY INFORMATION
    |--------------------------------------------------------------------------
    */

    const propertyInformation =
      JSON.stringify(
        propertyData,
        null,
        2
      );

    /*
    |--------------------------------------------------------------------------
    | PHOTO REFERENCES
    |--------------------------------------------------------------------------
    */

    const photoInformation =
      usablePhotos
        .map(
          (
            photo: any
          ) =>
            `PHOTO ${photo.index}: ${
              photo.photo_type ||
              "Property photograph"
            }`
        )
        .join("\n");

    /*
    |--------------------------------------------------------------------------
    | FINAL PROMPT
    |--------------------------------------------------------------------------
    */

    const prompt = `
${CREATIVE_DIRECTOR_PROMPT}

==================================================
REAL PROPERTY DATABASE
==================================================

${propertyInformation}

==================================================
AVAILABLE PROPERTY PHOTOGRAPHS
==================================================

${photoInformation}

These uploaded images are the REAL property photographs.

Study ALL supplied photographs.

Choose yourself:

- hero photograph
- supporting photographs
- image hierarchy
- image cropping
- image sizing
- photo composition
- typography
- colour palette
- layout
- information hierarchy

Do NOT use every photograph automatically.

Use the strongest photographs that make the property
look commercially attractive while remaining truthful.

==================================================
OUTPUT
==================================================

Create ONE finished vertical real estate advertisement.

Do NOT return JSON.

Do NOT return a wireframe.

Do NOT return coordinates.

Do NOT return design instructions.

Do NOT describe the design.

Generate the FINAL POSTER IMAGE.
`;

    /*
    |--------------------------------------------------------------------------
    | OPENAI IMAGE GENERATION
    |--------------------------------------------------------------------------
    */

    console.log(
      "AI POSTER: sending",
      imageFiles.length,
      "real property photos to GPT Image..."
    );

    const response =
      await openai.images.edit({
        model: "gpt-image-2",

        image:
          imageFiles,

        prompt,

        size:
          "1280x960",

        quality:
          "medium",

        background:
          "opaque",

        output_format:
          "png",
      });

    /*
    |--------------------------------------------------------------------------
    | GET GENERATED IMAGE
    |--------------------------------------------------------------------------
    */

    const imageBase64 =
      response.data?.[0]?.b64_json;

    if (!imageBase64) {
      console.error(
        "AI returned no image:",
        JSON.stringify(
          response,
          null,
          2
        )
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "AI completed but did not return a poster image.",
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "AI POSTER: image generated successfully."
    );

    /*
    |--------------------------------------------------------------------------
    | CONVERT GENERATED IMAGE
    |--------------------------------------------------------------------------
    */

    const imageBuffer =
      Buffer.from(
        imageBase64,
        "base64"
      );

    /*
    |--------------------------------------------------------------------------
    | STORAGE FILE PATH
    |--------------------------------------------------------------------------
    */

    const fileName =
      `property-${propertyId}/ai-poster-${Date.now()}.png`;

    console.log(
      "AI POSTER: uploading to Supabase Storage:",
      fileName
    );

    /*
    |--------------------------------------------------------------------------
    | UPLOAD TO AI-DESIGNS BUCKET
    |--------------------------------------------------------------------------
    */

    const {
      error: uploadError,
    } =
      await supabaseAdmin.storage
        .from("ai-designs")
        .upload(
          fileName,
          imageBuffer,
          {
            contentType:
              "image/png",

            cacheControl:
              "31536000",

            upsert:
              false,
          }
        );

    if (uploadError) {
      console.error(
        "AI POSTER STORAGE UPLOAD ERROR:",
        uploadError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            `Failed to save AI poster to Supabase Storage: ${uploadError.message}`,
        },
        {
          status: 500,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | GET PUBLIC URL
    |--------------------------------------------------------------------------
    */

    const {
      data: publicUrlData,
    } =
      supabaseAdmin.storage
        .from("ai-designs")
        .getPublicUrl(
          fileName
        );

    const imageUrl =
      publicUrlData?.publicUrl;

    if (!imageUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            "AI poster was uploaded but no public URL was generated.",
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "AI POSTER STORAGE URL:",
      imageUrl
    );

    /*
    |--------------------------------------------------------------------------
    | SAVE DESIGN RECORD
    |--------------------------------------------------------------------------
    */

    const {
      data: design,
      error: databaseError,
    } =
      await supabaseAdmin
        .from("ai_designs")
        .insert({
          property_id:
            propertyId,

          design_type:
            "property_poster",

          image_url:
            imageUrl,
        })
        .select()
        .single();

    if (databaseError) {
      console.error(
        "AI POSTER DATABASE ERROR:",
        databaseError
      );

      /*
       * Remove orphaned image if
       * database insertion fails.
       */

      await supabaseAdmin.storage
        .from("ai-designs")
        .remove([
          fileName,
        ]);

      return NextResponse.json(
        {
          success: false,
          error:
            `Poster uploaded but database record failed: ${databaseError.message}`,
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "AI POSTER SAVED:",
      design
    );

    /*
    |--------------------------------------------------------------------------
    | RETURN NORMAL URL
    |--------------------------------------------------------------------------
    */

    return NextResponse.json({
      success: true,

      image:
        imageUrl,

      design,
    });

  } catch (error: any) {
    console.error(
      "AI PROPERTY POSTER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error?.message ||
          "Failed to generate AI property poster.",
      },
      {
        status: 500,
      }
    );
  }
}