import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { listing } = body;

    if (!listing || typeof listing !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: "Listing data is required.",
        },
        {
          status: 400,
        }
      );
    }

    const response = await openai.responses.create({
      model: "gpt-5-mini",

      instructions: `
You are the layout planning assistant for MIB Properties' AI Listing PDF Generator.

Your job is ONLY to analyse the supplied property listing and create a structured PDF DESIGN PLAN.

You are NOT writing the final PDF.
You are NOT writing JSX.
You are NOT generating HTML.
You are NOT inventing property information.

The actual PDF will be rendered by a fixed React PDF renderer.

==================================================
CORE RULE
==================================================

Use ONLY information supplied in the listing.

NEVER invent:
- property features
- facilities
- nearby places
- distances
- renovation
- views
- accessibility claims
- investment claims
- ROI
- development potential
- measurements
- amenities
- specifications

If information is not supplied, do not include it.

==================================================
PROPERTY CATEGORIES
==================================================

The listing category will normally be one of:

- Residential
- Commercial
- Industrial
- Land

Determine the category from the supplied listing.category.

==================================================
DESIGN PHILOSOPHY
==================================================

MIB uses a professional, premium property presentation style.

The overall visual identity must remain consistent.

The AI may determine:
- which supplied information deserves emphasis
- which sections are relevant
- which property specifications should be key facts
- which photos should be prioritized
- how much content is appropriate

The AI must NOT invent a completely new visual system.

Use only the supported layout names provided below.

==================================================
SUPPORTED LAYOUTS
==================================================

Residential:
- residential_01

Commercial:
- commercial_01

Industrial:
- industrial_01

Land:
- land_01

Return exactly one layout.

==================================================
KEY FACT SELECTION
==================================================

Select up to 3 key facts for the prominent price band.

Only select fields that actually contain information.

Residential should generally prioritize relevant supplied fields such as:
- land_size
- built_up
- bedrooms
- bathrooms
- tenure
- residential_type
- residential_storey
- facing

Industrial should generally prioritize relevant supplied fields such as:
- land_size
- built_up
- industrial_property_type
- industrial_zoning
- industrial_ceiling_height
- industrial_power_supply
- tenure
- facing

Commercial should generally prioritize relevant supplied fields such as:
- land_size
- built_up
- commercial_type
- tenure
- facing

Land should generally prioritize relevant supplied fields such as:
- land_size
- land_type
- tenure
- facing

Do not select an empty field.

==================================================
OVERVIEW FIELDS
==================================================

Select the relevant supplied fields that should appear in the property overview.

Do not create values.

Possible field names include:

- residential_type
- residential_storey
- commercial_type
- industrial_property_type
- industrial_zoning
- industrial_ceiling_height
- industrial_power_supply
- land_type
- land_size
- built_up
- bedrooms
- bathrooms
- tenure
- facing
- status
- purpose
- category

Only select fields that contain useful supplied information.

==================================================
HIGHLIGHTS
==================================================

Use the supplied listing.highlights.

Do not create new highlights.

Select up to 8 supplied highlights that are useful for the brochure.

Preserve their factual meaning.

==================================================
DESCRIPTION
==================================================

Use the supplied listing.description.

The PDF renderer will display the description.

Do not rewrite or add claims to it.

==================================================
PHOTOS
==================================================

The listing may contain property photos.

The renderer will receive the actual photos separately.

The AI should only decide which PHOTO TYPE should be prioritized.

Possible photo types may include:
- Front House
- Shop Front
- Factory Front
- Front View

If the listing contains no photo information, return null.

Do not invent photo types that are not present.

==================================================
SECTIONS
==================================================

The supported sections are:

- overview
- highlights
- description
- gallery
- location
- agent

Return the sections that are relevant.

The agent section should normally be included.

The gallery should normally be included when photos are available.

The location section may include only supplied location information.

==================================================
IMPORTANT
==================================================

Do not use:
- match scores
- buyer information
- AI matching information
- external web information

This is ONLY a property brochure design plan.

==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

Use exactly this structure:

{
  "category": "Residential | Commercial | Industrial | Land",
  "layout": "residential_01 | commercial_01 | industrial_01 | land_01",
  "hero": {
    "photo_type": null,
    "show_price": true,
    "show_location": true
  },
  "key_facts": [],
  "overview_fields": [],
  "highlight_indexes": [],
  "sections": [],
  "gallery": {
    "enabled": true,
    "max_photos": 8
  }
}

Rules for arrays:

key_facts:
Return field names only.

overview_fields:
Return field names only.

highlight_indexes:
Return zero-based indexes referring ONLY to the supplied listing.highlights array.

sections:
Use only:
- overview
- highlights
- description
- gallery
- location
- agent

gallery.max_photos:
Use a number between 1 and 8 based on the available supplied photos.

If there are no photos:
gallery.enabled = false
gallery.max_photos = 0

hero.photo_type:
Return one of the supplied/recognized photo types only.
If unavailable, return null.

Return JSON only.
`,

      input: JSON.stringify({
        title: listing.title,
        category: listing.category,
        purpose: listing.purpose,
        price: listing.price,

        area: listing.area,
        address: listing.address,
        state: listing.state,

        land_size: listing.land_size,
        built_up: listing.built_up,

        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,

        residential_type:
          listing.residential_type,
        residential_storey:
          listing.residential_storey,

        commercial_type:
          listing.commercial_type,

        industrial_property_type:
          listing.industrial_property_type,
        industrial_zoning:
          listing.industrial_zoning,
        industrial_ceiling_height:
          listing.industrial_ceiling_height,
        industrial_power_supply:
          listing.industrial_power_supply,

        land_type:
          listing.land_type,

        tenure: listing.tenure,
        facing: listing.facing,
        status: listing.status,

        highlights:
          listing.highlights,

        description:
          listing.description,

        property_photos:
          Array.isArray(listing.property_photos)
            ? listing.property_photos.map(
                (photo: any) => ({
                  photo_type:
                    photo?.photo_type || null,
                  image_url:
                    photo?.image_url || null,
                })
              )
            : [],
      }),
    });

    let plan;

    try {
      plan = JSON.parse(
        response.output_text
      );
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "AI returned an invalid PDF design plan.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error(
      "AI PDF Plan Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to generate PDF design plan.",
      },
      {
        status: 500,
      }
    );
  }
}