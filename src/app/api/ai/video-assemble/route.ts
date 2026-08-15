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

      process.stderr.on(
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
        (code) => {
          if (
            code === 0
          ) {
            resolve();
          } else {
            reject(
              new Error(
                `FFmpeg exited with code ${code}.\n${stderr}`
              )
            );
          }
        }
      );
    }
  );
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

  try {

    const body =
      await request.json();

    const projectId =
      body?.projectId;

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
    | DOWNLOAD SHOTS
    |--------------------------------------------------------------------------
    */

    const localFiles:
      string[] = [];

    for (
      let index = 0;
      index <
        shots.length;
      index++
    ) {

      const shot =
        shots[index];

      const fileName =
        `shot-${String(
          index + 1
        ).padStart(
          3,
          "0"
        )}.mp4`;

      const localPath =
        path.join(
          tempDirectory,
          fileName
        );

      console.log(
        `VIDEO ASSEMBLER: downloading shot ${index + 1}/${shots.length}`
      );

      console.log(
        "Video URL:",
        shot.video_url
      );

      const response =
        await fetch(
          shot.video_url
        );

      if (
        !response.ok
      ) {
        throw new Error(
          `Failed to download shot ${index + 1}: HTTP ${response.status}`
        );
      }

      const arrayBuffer =
        await response.arrayBuffer();

      const buffer =
        Buffer.from(
          arrayBuffer
        );

      await fs.writeFile(
        localPath,
        buffer
      );

      localFiles.push(
        localPath
      );

      console.log(
        `VIDEO ASSEMBLER: shot ${index + 1} downloaded: ${buffer.length} bytes`
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE CONCAT FILE
    |--------------------------------------------------------------------------
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
    | FINAL OUTPUT
    |--------------------------------------------------------------------------
    */

    const finalFile =
      path.join(
        tempDirectory,
        "final-video.mp4"
      );

    /*
    |--------------------------------------------------------------------------
    | FFMPEG ASSEMBLY
    |--------------------------------------------------------------------------
    |
    | Re-encode instead of using -c copy.
    |
    | This is slightly slower but much safer when
    | combining separately generated Sora clips.
    |
    */

    console.log(
      "VIDEO ASSEMBLER: running FFmpeg..."
    );

    await runFFmpeg([
      "-y",

      "-f",
      "concat",

      "-safe",
      "0",

      "-i",
      concatFile,

      "-c:v",
      "libx264",

      "-preset",
      "veryfast",

      "-crf",
      "20",

      "-c:a",
      "aac",

      "-b:a",
      "128k",

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
              "31536000",

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

    const finalVideoUrl =
      publicUrlData?.publicUrl;

    if (
      !finalVideoUrl
    ) {
      throw new Error(
        "Final video uploaded but no public URL was generated."
      );
    }

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
    | MARK PROJECT FAILED
    |--------------------------------------------------------------------------
    */

    try {

      const bodyError =
        error?.message ||
        "Video assembly failed.";

      const body =
        await request.clone()
          .json()
          .catch(
            () => null
          );

      const projectId =
        body?.projectId;

      if (
        projectId
      ) {

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