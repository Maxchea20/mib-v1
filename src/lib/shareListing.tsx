import { pdf, type DocumentProps } from "@react-pdf/renderer";
import type React from "react";
import ListingBrochure from "@/components/pdf/ListingBrochure";

export function listingDisplayName(listing: any) {
  return listing?.headline || listing?.title || "Property";
}

export function listingCoverUrl(listing: any) {
  const coverPhotoMap: Record<string, string> = {
    Residential: "Front House",
    Commercial: "Shop Front",
    Industrial: "Factory Front",
    Land: "Front View",
  };
  const coverType = coverPhotoMap[listing?.category] ?? "Front House";
  return (
    listing?.property_photos?.find((photo: any) => photo.photo_type === coverType)
      ?.image_url || listing?.property_photos?.[0]?.image_url
  );
}

export function formatPrice(listing: any) {
  if (listing?.price === null || listing?.price === undefined) return "Price on request";
  return `RM ${Number(listing.price).toLocaleString()}`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function buildShareCardBlob(listing: any): Promise<Blob> {
  const width = 1080;
  const height = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available on this device.");

  ctx.fillStyle = "#f3eee6";
  ctx.fillRect(0, 0, width, height);

  const cover = listingCoverUrl(listing);
  if (cover) {
    try {
      const image = await loadImage(cover);
      const targetH = 820;
      const scale = Math.max(width / image.width, targetH / image.height);
      const dw = image.width * scale;
      const dh = image.height * scale;
      ctx.drawImage(image, (width - dw) / 2, 0, dw, dh);
    } catch {
      ctx.fillStyle = "#d6c7b0";
      ctx.fillRect(0, 0, width, 820);
    }
  } else {
    ctx.fillStyle = "#d6c7b0";
    ctx.fillRect(0, 0, width, 820);
  }

  ctx.fillStyle = "#fffaf3";
  ctx.fillRect(0, 780, width, 570);

  ctx.fillStyle = "#9a4b24";
  ctx.font = "28px sans-serif";
  ctx.fillText("MIB  ·  MAX CHEA", 72, 860);

  ctx.fillStyle = "#1c1917";
  ctx.font = "bold 54px Georgia";
  const title = listingDisplayName(listing);
  wrapText(ctx, title, 72, 940, width - 144, 62);

  ctx.fillStyle = "#2f5d3a";
  ctx.font = "bold 48px sans-serif";
  ctx.fillText(formatPrice(listing), 72, 1140);

  const place = [listing.area || listing.city, listing.state]
    .filter(Boolean)
    .join(", ");
  ctx.fillStyle = "#57534e";
  ctx.font = "32px sans-serif";
  ctx.fillText(place || "Perak", 72, 1200);

  const specs = [
    listing.bedroom && `${listing.bedroom} Bed`,
    listing.bathroom && `${listing.bathroom} Bath`,
    listing.built_up && `${listing.built_up} sf`,
  ]
    .filter(Boolean)
    .join("   ·   ");
  ctx.fillText(specs, 72, 1258);

  return await new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not create photo."))),
      "image/jpeg",
      0.92
    );
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = String(text).split(" ");
  let line = "";
  let row = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y + row * lineHeight);
      line = word;
      row += 1;
      if (row === 2) break;
    } else {
      line = test;
    }
  }
  if (row < 3) ctx.fillText(line, x, y + row * lineHeight);
}

export async function buildBrochureBlob(listing: any): Promise<Blob> {
  const pdfListing = {
    ...listing,
    listing_agent:
      listing.listing_agent === "Cobroke Agent" ? "MAX CHEA" : listing.listing_agent,
    cobroke_agent_name: undefined,
  };

  const planResponse = await fetch("/api/ai/pdf-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listing: pdfListing }),
  });
  const planData = await planResponse.json();
  if (!planResponse.ok || !planData.success) {
    throw new Error(planData.error || "Failed to generate PDF plan.");
  }

  const pdfDocument = (
    <ListingBrochure listing={pdfListing} aiPlan={planData.plan} />
  ) as React.ReactElement<DocumentProps>;

  return pdf(pdfDocument).toBlob();
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function shareFiles(files: File[], title: string, text: string) {
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
    share?: (data: ShareData) => Promise<void>;
  };
  if (nav.share && (!nav.canShare || nav.canShare({ files }))) {
    await nav.share({ files, title, text });
    return true;
  }
  return false;
}
