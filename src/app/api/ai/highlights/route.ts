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
      description,
    } = body;

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      instructions: `
You are a professional Malaysian real estate marketing assistant.

Generate useful and truthful property selling highlights.

Rules:
- Do NOT invent information.
- Only use information supplied in the property data.
- Do NOT exaggerate.
- Do NOT make unsupported claims such as "best location", "high ROI", "guaranteed investment", etc.
- Keep each highlight short and useful.
- Generate 5 to 8 highlights.
- Focus on actual property advantages.
- Use Malaysian real estate terminology.
- Return ONLY a JSON array of strings.
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
        description,
      }),
    });

    const text = response.output_text;

    return NextResponse.json({
      success: true,
      highlights: text,
    });
  } catch (error) {
    console.error("AI Highlights Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate property highlights.",
      },
      {
        status: 500,
      }
    );
  }
}