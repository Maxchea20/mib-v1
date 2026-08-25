import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireUser } from "@/lib/apiAuth";

/*
|--------------------------------------------------------------------------
| SUPABASE SERVER CLIENT
|--------------------------------------------------------------------------
|
| Service role is required because this API needs to delete
| files from Supabase Storage.
|
*/

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/*
|--------------------------------------------------------------------------
| GET — LOAD AI DESIGNS
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

    const {
      data,
      error,
    } =
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
      "AI DESIGNS GET ERROR:",
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

/*
|--------------------------------------------------------------------------
| DELETE — DELETE AI DESIGN + STORAGE FILE
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

    const designId =
      body?.id;

    if (!designId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Design ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | FIND DESIGN RECORD
    |--------------------------------------------------------------------------
    */

    const {
      data: design,
      error: findError,
    } =
      await supabase
        .from("ai_designs")
        .select(
          "id, image_url"
        )
        .eq(
          "id",
          designId
        )
        .single();

    if (
      findError ||
      !design
    ) {
      console.error(
        "AI DESIGN FIND ERROR:",
        findError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            findError?.message ||
            "AI design not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | EXTRACT STORAGE PATH
    |--------------------------------------------------------------------------
    */

    const storageMarker =
      "/storage/v1/object/public/ai-designs/";

    const markerIndex =
      design.image_url.indexOf(
        storageMarker
      );

    if (
      markerIndex === -1
    ) {
      console.error(
        "AI DESIGN STORAGE PATH ERROR:",
        design.image_url
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Could not determine the Supabase Storage file path.",
        },
        {
          status: 500,
        }
      );
    }

    const storagePath =
      decodeURIComponent(
        design.image_url.substring(
          markerIndex +
            storageMarker.length
        )
      );

    console.log(
      "AI DESIGN: deleting storage file:",
      storagePath
    );

    /*
    |--------------------------------------------------------------------------
    | DELETE STORAGE FILE
    |--------------------------------------------------------------------------
    */

    const {
      error: storageError,
    } =
      await supabase
        .storage
        .from(
          "ai-designs"
        )
        .remove([
          storagePath,
        ]);

    if (
      storageError
    ) {
      console.error(
        "AI DESIGN STORAGE DELETE ERROR:",
        storageError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            `Storage deletion failed: ${storageError.message}`,
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "AI DESIGN: storage file deleted:",
      storagePath
    );

    /*
    |--------------------------------------------------------------------------
    | DELETE DATABASE RECORD
    |--------------------------------------------------------------------------
    */

    const {
      error: deleteError,
    } =
      await supabase
        .from("ai_designs")
        .delete()
        .eq(
          "id",
          designId
        );

    if (
      deleteError
    ) {
      console.error(
        "AI DESIGN DATABASE DELETE ERROR:",
        deleteError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            deleteError.message,
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "AI DESIGN: database record deleted:",
      designId
    );

    /*
    |--------------------------------------------------------------------------
    | SUCCESS
    |--------------------------------------------------------------------------
    */

    return NextResponse.json({
      success: true,
      message:
        "AI design and storage file deleted successfully.",
    });

  } catch (error: any) {
    console.error(
      "AI DESIGN DELETE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to delete AI design.",
      },
      {
        status: 500,
      }
    );
  }
}