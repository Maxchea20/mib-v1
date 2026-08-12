import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: Request
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const propertyId =
      searchParams.get("property_id");

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

    const { data, error } =
      await supabase
        .from("ai_designs")
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

    if (error) {
      console.error(
        "AI DESIGNS QUERY ERROR:",
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

    return NextResponse.json({
      success: true,
      designs: data || [],
    });

  } catch (error: any) {
    console.error(
      "AI DESIGNS API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to load AI designs.",
      },
      {
        status: 500,
      }
    );
  }
}