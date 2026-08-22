import { NextResponse } from "next/server";

const GRAPH_VERSION = "v26.0";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const message = body?.message;

    const imageUrls = Array.isArray(
      body?.imageUrls
    )
      ? body.imageUrls.filter(
          (url: unknown): url is string =>
            typeof url === "string" &&
            url.trim() !== ""
        )
      : [];

    if (
      !message ||
      typeof message !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Facebook post message is required.",
        },
        { status: 400 }
      );
    }

    const pageId =
      process.env.FACEBOOK_PAGE_ID;

    const pageAccessToken =
      process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

    if (
      !pageId ||
      !pageAccessToken
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Facebook Page credentials are not configured.",
        },
        { status: 500 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | TEXT ONLY POST
    |--------------------------------------------------------------------------
    */

    if (imageUrls.length === 0) {
      const graphUrl =
        `https://graph.facebook.com/${GRAPH_VERSION}/${pageId}/feed`;

      const formData =
        new URLSearchParams();

      formData.append(
        "message",
        message
      );

      formData.append(
        "access_token",
        pageAccessToken
      );

      const response =
        await fetch(graphUrl, {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },

          body:
            formData.toString(),

          cache: "no-store",
        });

      const result =
        await response.json();

      if (
        !response.ok ||
        result.error
      ) {
        console.error(
          "Facebook text post error:",
          result
        );

        return NextResponse.json(
          {
            success: false,
            error:
              result?.error?.message ||
              "Facebook text post failed.",
            details:
              result?.error || null,
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        postId:
          result.id || null,
        type: "text",
        photoCount: 0,
        message:
          "Facebook text post published successfully.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | UPLOAD PHOTOS AS UNPUBLISHED
    |--------------------------------------------------------------------------
    */

    const uploadedPhotoIds: string[] =
      [];

    for (
      const imageUrl of imageUrls
    ) {
      const photoUrl =
        `https://graph.facebook.com/${GRAPH_VERSION}/${pageId}/photos`;

      const photoForm =
        new URLSearchParams();

      photoForm.append(
        "url",
        imageUrl
      );

      photoForm.append(
        "published",
        "false"
      );

      photoForm.append(
        "access_token",
        pageAccessToken
      );

      console.log(
        "Facebook: uploading unpublished photo..."
      );

      const photoResponse =
        await fetch(photoUrl, {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },

          body:
            photoForm.toString(),

          cache: "no-store",
        });

      const photoResult =
        await photoResponse.json();

      if (
        !photoResponse.ok ||
        photoResult.error ||
        !photoResult.id
      ) {
        console.error(
          "Facebook photo upload error:",
          photoResult
        );

        return NextResponse.json(
          {
            success: false,
            error:
              photoResult?.error?.message ||
              "Failed to upload property photo to Facebook.",
            details:
              photoResult?.error || null,
          },
          { status: 400 }
        );
      }

      uploadedPhotoIds.push(
        photoResult.id
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE ATTACHED_MEDIA ARRAY
    |--------------------------------------------------------------------------
    |
    | Meta expects attached_media to be
    | ONE array parameter.
    |
    */

    const attachedMedia =
      uploadedPhotoIds.map(
        (photoId) => ({
          media_fbid: photoId,
        })
      );

    console.log(
      "Facebook attached_media:",
      attachedMedia
    );

    /*
    |--------------------------------------------------------------------------
    | CREATE ONE FACEBOOK FEED POST
    |--------------------------------------------------------------------------
    */

    const feedUrl =
      `https://graph.facebook.com/${GRAPH_VERSION}/${pageId}/feed`;

    const feedForm =
      new URLSearchParams();

    feedForm.append(
      "message",
      message
    );

    feedForm.append(
      "attached_media",
      JSON.stringify(
        attachedMedia
      )
    );

    feedForm.append(
      "access_token",
      pageAccessToken
    );

    console.log(
      "Facebook: creating post with",
      uploadedPhotoIds.length,
      "photos."
    );

    const feedResponse =
      await fetch(feedUrl, {
        method: "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },

        body:
          feedForm.toString(),

        cache: "no-store",
      });

    const feedResult =
      await feedResponse.json();

    if (
      !feedResponse.ok ||
      feedResult.error
    ) {
      console.error(
        "Facebook multi-photo post error:",
        feedResult
      );

      return NextResponse.json(
        {
          success: false,
          error:
            feedResult?.error?.message ||
            "Failed to create Facebook multi-photo post.",
          details:
            feedResult?.error || null,
          uploadedPhotoIds,
        },
        { status: 400 }
      );
    }

    console.log(
      "Facebook multi-photo post published:",
      feedResult
    );

    return NextResponse.json({
      success: true,

      postId:
        feedResult.id || null,

      type: "multi-photo",

      photoCount:
        uploadedPhotoIds.length,

      photoIds:
        uploadedPhotoIds,

      message:
        "Facebook multi-photo post published successfully.",
    });

  } catch (error) {
    console.error(
      "Facebook publishing error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unexpected error while publishing to Facebook.",
      },
      { status: 500 }
    );
  }
}