import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      title,
      category,
      purpose,
      price,
      area,
      state,
      land_size,
      built_up,
      bedrooms,
      bathrooms,
      residential_type,
      residential_storey,
      commercial_type,
      industrial_property_type,
      industrial_zoning,
      industrial_ceiling_height,
      industrial_power_supply,
      land_type,
      tenure,
      facing,
      highlights,
      description,
    } = body;

    const response = await openai.responses.create({
      model: "gpt-5-mini",

      instructions: `
You are a professional Malaysian real estate listing copywriter.

Write a professional property listing description based ONLY on the information provided.

Rules:

- Do NOT invent property features.
- Do NOT invent facilities, nearby places, distances, renovation details, views, or amenities.
- Do NOT make unsupported claims.
- Do NOT use phrases such as "best investment", "guaranteed return", "prime location", "high ROI", or "must buy" unless the supplied information explicitly supports them.
- Do NOT change or invent the price.
- Do NOT change property specifications.
- Use natural Malaysian real estate terminology.
- Keep the description professional, clear and easy to read.
- Focus on actual property characteristics and practical selling points.
- Mention location naturally.
- Mention important property specifications where relevant.
- Use the supplied highlights as supporting information.
- Do not repeat the same information unnecessarily.
- Do not use emojis.
- Do not include a title.
- Return ONLY the description text.
      `,

      input: JSON.stringify({
        title,
        category,
        purpose,
        price,
        area,
        state,
        land_size,
        built_up,
        bedrooms,
        bathrooms,
        residential_type,
        residential_storey,
        commercial_type,
        industrial_property_type,
        industrial_zoning,
        industrial_ceiling_height,
        industrial_power_supply,
        land_type,
        tenure,
        facing,
        highlights,
        existing_description: description,
      }),
    });

    return NextResponse.json({
      success: true,
      description: response.output_text,
    });

  } catch (error) {

    console.error(
      "AI Description Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to generate property description.",
      },
      {
        status: 500,
      }
    );
  }
}