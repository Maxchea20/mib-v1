import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";
import { requireUser } from "@/lib/apiAuth";

/*
|--------------------------------------------------------------------------
| GOOGLE BUSINESS PROFILE POST
|--------------------------------------------------------------------------
|
| Builds the post (photo, title, short description, price and a WhatsApp
| button) and queues a "google_business_post" job for the MIB Desktop
| worker, which publishes it in the signed-in Google Business Profile.
|
| Google post buttons cannot be "WhatsApp" - the button is "Learn more"
| pointing at a wa.me link, which opens WhatsApp chat.
|
*/

const MAX_SUMMARY = 300;

function formatPrice(listing: any): string | null {
  const price = Number(listing.price);
  if (!Number.isFinite(price) || price <= 0) return null;

  const amount = `RM ${price.toLocaleString("en-MY")}`;
  const isRent = /rent/i.test(String(listing.purpose ?? ""));
  return isRent ? `${amount} / month` : amount;
}

function shorten(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

function pickPhoto(photos: any[]): string | null {
  const valid = (photos ?? []).filter(
    (p) => typeof p.image_url === "string" && p.image_url.trim() !== ""
  );
  if (valid.length === 0) return null;

  const type = (p: any) => String(p.photo_type ?? "").toLowerCase();
  const front = valid.find((p) => type(p).includes("front"));
  const main = valid.find((p) => type(p) === "main" || type(p) === "main photo");
  const sorted = [...valid].sort(
    (a, b) => Number(a.sort_order ?? 999) - Number(b.sort_order ?? 999)
  );

  return (front ?? main ?? sorted[0]).image_url;
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (!auth.user) return auth.response;

  try {
    const body = await request.json();

    const listingId = Number(body?.listingId);
    if (!Number.isFinite(listingId)) {
      return NextResponse.json(
        { success: false, error: "Listing ID is required." },
        { status: 400 }
      );
    }

    const whatsapp = String(
      body?.whatsappNumber || process.env.WHATSAPP_NUMBER || ""
    ).replace(/\D/g, "");

    if (whatsapp.length < 9) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Enter your WhatsApp number with country code, e.g. 60123456789.",
        },
        { status: 400 }
      );
    }

    const { data: listing, error: listingError } = await supabase
      .from("properties")
      .select(
        "*, property_photos (photo_type, image_url, sort_order, created_at)"
      )
      .eq("id", listingId)
      .single();

    if (listingError || !listing) {
      return NextResponse.json(
        { success: false, error: "Listing not found." },
        { status: 404 }
      );
    }

    const title = String(listing.headline || listing.title || "").trim();
    if (!title) {
      return NextResponse.json(
        { success: false, error: "Listing has no title." },
        { status: 400 }
      );
    }

    const priceText = formatPrice(listing);
    const photoUrl = pickPhoto(listing.property_photos);

    const location = [listing.area, listing.city]
      .filter(Boolean)
      .join(", ");

    const summary = shorten(
      [
        title,
        location && `📍 ${location}`,
        priceText && `💰 ${priceText}`,
        listing.description && String(listing.description),
        "WhatsApp me for details & viewing.",
      ]
        .filter(Boolean)
        .join("\n"),
      MAX_SUMMARY
    );

    const message = encodeURIComponent(
      `Hi, I'm interested in: ${title}${priceText ? ` (${priceText})` : ""}`
    );

    const payload = {
      listing_id: listingId,
      title,
      summary,
      price_text: priceText,
      photo_url: photoUrl,
      button_label: "Learn more",
      button_url: `https://wa.me/${whatsapp}?text=${message}`,
      dry_run: body?.dryRun === true,
    };

    const { data: worker, error: workerError } = await supabase
      .from("desktop_workers")
      .select("id, worker_name")
      .eq("status", "online")
      .order("last_seen", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (workerError) {
      console.error("Desktop worker lookup error:", workerError);
      return NextResponse.json(
        { success: false, error: "Failed to find an online MIB Desktop worker." },
        { status: 500 }
      );
    }

    if (!worker) {
      return NextResponse.json(
        { success: false, error: "No MIB Desktop worker is currently online." },
        { status: 503 }
      );
    }

    const { data: job, error: jobError } = await supabase
      .from("desktop_jobs")
      .insert({
        worker_id: worker.id,
        job_type: "google_business_post",
        payload,
        status: "queued",
      })
      .select("id")
      .single();

    if (jobError || !job) {
      console.error("Google Business job creation error:", jobError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create Google Business posting job.",
          details: jobError?.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      jobId: job.id,
      workerName: worker.worker_name,
      preview: payload,
    });
  } catch (error) {
    console.error("Google Business job API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Unexpected error while creating Google Business posting job.",
      },
      { status: 500 }
    );
  }
}
