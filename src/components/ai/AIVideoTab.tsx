"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Props = {
  listing: any;
};

type Photo = {
  index: number;
  photo_type?: string | null;
  image_url: string;
};

type VideoStyle =
  | "ai_director"
  | "professional_real_estate"
  | "quick_property_reveal"
  | "cinematic_property_tour"
  | "luxury_showcase"
  | "dynamic_action_tour"
  | "pov_walkthrough"
  | "social_reel";

type DirectorShot = {
  photoIndex: number;
  shotOrder: number;
  shotType: string;
  cameraAction?: string;
  visualAnalysis?: string;
  actionScript: string;
  reason: string;
};

type EditingPlanShot = {
  shotOrder: number;
  role: string;
  recommendedDuration: number;
  energy: string;
  cutStyle: string;
  editorReason: string;
};

type EditingPlan = {
  overallEditDirection: string;
  rhythm: string;
  totalTargetDuration: number;
  shots: EditingPlanShot[];
};

type VideoPlan = {
  style: VideoStyle;
  styleName: string;
  overallDirection: string;
  pacing: string;
  editingPlan?: EditingPlan;
  shotCount: number;
  recommendations: DirectorShot[];
};

type VideoRecord = {
  id: string;
  property_id: number;
  project_id?: string | null;
  video_id: string;
  photo_index?: number | null;
  shot_order?: number | null;
  video_type?: string | null;
  status: string;
  progress: number;
  video_url?: string | null;
  created_at: string;
  completed_at?: string | null;
  error_message?: string | null;
};

type VideoProject = {
  id: string;
  property_id: number;
  status: string;
  clip_count: number;
  final_video_url?: string | null;
  created_at: string;
  completed_at?: string | null;
  error_message?: string | null;
};

/*
|--------------------------------------------------------------------------
| FINAL VIDEO CACHE BUSTER
|--------------------------------------------------------------------------
|
| Supabase Storage reuses the same final-video.mp4 URL.
| Add the project's completion timestamp so every newly assembled MP4
| gets a fresh browser/CDN URL without changing the storage path.
|
*/
function getFreshFinalVideoUrl(
  url?: string | null,
  completedAt?: string | null
) {
  if (!url) {
    return null;
  }

  const separator =
    url.includes("?") ? "&" : "?";

  const cacheKey =
    completedAt
      ? encodeURIComponent(completedAt)
      : Date.now().toString();

  return `${url}${separator}v=${cacheKey}`;
}

/*
|--------------------------------------------------------------------------
| VIDEO STYLES
|--------------------------------------------------------------------------
*/

const VIDEO_STYLES: {
  value: VideoStyle;
  label: string;
  description: string;
}[] = [
  {
    value: "ai_director",
    label: "✨ AI Director",
    description:
      "Let MIB choose the most suitable professional style for this property.",
  },
  {
    value: "professional_real_estate",
    label: "🏠 Professional Real Estate",
    description:
      "Clean, realistic and polished property presentation.",
  },
  {
    value: "quick_property_reveal",
    label: "⚡ Quick Property Reveal",
    description:
      "Fast, punchy and attention-grabbing property video.",
  },
  {
    value: "cinematic_property_tour",
    label: "🎬 Cinematic Property Tour",
    description:
      "Smooth, immersive and story-driven property walkthrough.",
  },
  {
    value: "luxury_showcase",
    label: "💎 Luxury Showcase",
    description:
      "Elegant, controlled and premium architectural presentation.",
  },
  {
    value: "dynamic_action_tour",
    label: "🔥 Dynamic Action Tour",
    description:
      "Energetic camera choreography while preserving realism.",
  },
  {
    value: "pov_walkthrough",
    label: "👁️ POV Property Walkthrough",
    description:
      "Human-height immersive walkthrough feeling.",
  },
  {
    value: "social_reel",
    label: "📱 Social Reel",
    description:
      "Attention-first pacing designed for short-form social content.",
  },
];

/*
|--------------------------------------------------------------------------
| PHOTO NORMALISATION
|--------------------------------------------------------------------------
*/

function normalisePhoto(
  photo: any,
  index: number
): Photo | null {
  if (
    typeof photo?.image_url !== "string" ||
    photo.image_url.trim() === ""
  ) {
    return null;
  }

  return {
    index,
    photo_type:
      photo?.photo_type ||
      "Property Photo",
    image_url:
      photo.image_url,
  };
}

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function AIVideoTab({
  listing,
}: Props) {
  /*
  |--------------------------------------------------------------------------
  | PHOTOS
  |--------------------------------------------------------------------------
  */

  const photos = useMemo(() => {
    const rawPhotos =
      Array.isArray(
        listing?.property_photos
      )
        ? listing.property_photos
        : [];

    return rawPhotos
      .map(normalisePhoto)
      .filter(
        (
          photo: Photo | null
        ): photo is Photo =>
          photo !== null
      );
  }, [
    listing?.property_photos,
  ]);

  /*
  |--------------------------------------------------------------------------
  | STYLE / PLAN
  |--------------------------------------------------------------------------
  */

  const [
    videoStyle,
    setVideoStyle,
  ] = useState<VideoStyle>(
    "ai_director"
  );

  const [
    videoPlan,
    setVideoPlan,
  ] = useState<VideoPlan | null>(
    null
  );

  // Only one Director Plan shot is expanded at a time.
  const [
    expandedShotOrder,
    setExpandedShotOrder,
  ] = useState<number | null>(null);

  /*
  |--------------------------------------------------------------------------
  | GENERATION STATE
  |--------------------------------------------------------------------------
  */

  const [
    analysing,
    setAnalysing,
  ] = useState(false);

  const [
    generating,
    setGenerating,
  ] = useState(false);

  const [
    generationProgress,
    setGenerationProgress,
  ] = useState({
    current: 0,
    total: 0,
  });

  /*
  |--------------------------------------------------------------------------
  | DATABASE STATE
  |--------------------------------------------------------------------------
  */

  const [
    videos,
    setVideos,
  ] = useState<VideoRecord[]>([]);

  const [
    videoProject,
    setVideoProject,
  ] = useState<VideoProject | null>(
    null
  );

  // Completed assembled videos only.
  const [
    videoProjects,
    setVideoProjects,
  ] = useState<VideoProject[]>([]);

  const [
    deletingProjectId,
    setDeletingProjectId,
  ] = useState<string | null>(null);

  const [
    reassemblingProjectId,
    setReassemblingProjectId,
  ] = useState<string | null>(null);

  const [
    loadingVideoProject,
    setLoadingVideoProject,
  ] = useState(true);

  const [
    loadingVideos,
    setLoadingVideos,
  ] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | ACTIVE PROJECT
  |--------------------------------------------------------------------------
  |
  | THIS IS IMPORTANT.
  |
  | Only this project can be assembled by the
  | current Generate action.
  |
  */

  const [
    activeProjectId,
    setActiveProjectId,
  ] = useState<string | null>(
    null
  );

  const activeProjectRef =
    useRef<string | null>(
      null
    );

  /*
  |--------------------------------------------------------------------------
  | POLLING / ASSEMBLY LOCKS
  |--------------------------------------------------------------------------
  */

  const pollingRef =
    useRef(false);

  const assemblingProjectRef =
    useRef<string | null>(
      null
    );

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const [
    deletingVideoId,
    setDeletingVideoId,
  ] = useState<string | null>(
    null
  );

  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  const [
    error,
    setError,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | SYNC ACTIVE PROJECT REF
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    activeProjectRef.current =
      activeProjectId;
  }, [
    activeProjectId,
  ]);

  /*
  |--------------------------------------------------------------------------
  | RESET WHEN LISTING CHANGES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setVideoStyle(
      "ai_director"
    );

    setVideoPlan(null);
    setExpandedShotOrder(null);

    setActiveProjectId(
      null
    );

    activeProjectRef.current =
      null;

    assemblingProjectRef.current =
      null;

    setVideos([]);

    setVideoProject(null);
    setVideoProjects([]);
    setDeletingProjectId(null);
    setReassemblingProjectId(null);

    setError("");
  }, [
    listing?.id,
  ]);

  /*
  |--------------------------------------------------------------------------
  | LOAD VIDEOS
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  |
  | This function ONLY loads data.
  |
  | It NEVER automatically assembles every project.
  |
  */

  async function loadVideos(
    projectId?: string | null
  ) {
    if (!listing?.id) {
      return null;
    }

    try {
      const response =
        await fetch(
          `/api/ai/property-video?property_id=${listing.id}`,
          {
            cache:
              "no-store",
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Failed to load AI videos."
        );
      }

      const loadedVideos:
        VideoRecord[] =
        data.videos || [];

      /*
      |--------------------------------------------------------------------------
      | IF A PROJECT ID WAS PROVIDED,
      | ONLY KEEP THAT PROJECT FOR
      | GENERATION LOGIC.
      |--------------------------------------------------------------------------
      */

      if (projectId) {
        const projectVideos =
          loadedVideos.filter(
            (
              video
            ) =>
              video.project_id ===
              projectId
          );

        setVideos(
          projectVideos
        );

        return projectVideos;
      }

      /*
      |--------------------------------------------------------------------------
      | NORMAL PAGE LOAD
      |--------------------------------------------------------------------------
      |
      | Show videos from the latest/current
      | project only if possible.
      |
      */

      const currentId =
        activeProjectRef.current;

      if (currentId) {
        setVideos(
          loadedVideos.filter(
            (
              video
            ) =>
              video.project_id ===
              currentId
          )
        );
      } else {
        setVideos(
          loadedVideos
        );
      }

      return loadedVideos;
    } catch (
      error: any
    ) {
      console.error(
        "AI VIDEO LOAD ERROR:",
        error
      );

      setError(
        error?.message ||
          "Failed to load AI videos."
      );

      return null;
    } finally {
      setLoadingVideos(
        false
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | LOAD FINAL PROJECT
  |--------------------------------------------------------------------------
  */

  async function loadVideoProject(
    requestedProjectId?: string | null
  ) {
    if (!listing?.id) {
      return null;
    }

    try {
      const response =
        await fetch(
          `/api/ai/video-project?property_id=${listing.id}`,
          {
            cache:
              "no-store",
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Failed to load final video projects."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | FINAL VIDEO HISTORY
      |--------------------------------------------------------------------------
      |
      | Only completed projects with a final assembled video are shown.
      | Individual Runway shots are NEVER used here.
      |
      */

      const projects:
        VideoProject[] =
        (
          Array.isArray(
            data.projects
          )
            ? data.projects
            : data.project?.final_video_url
            ? [data.project]
            : []
        )
          .filter(
            (
              project: VideoProject
            ) =>
              project.status ===
                "completed" &&
              Boolean(
                project.final_video_url
              )
          )
          .map(
            (
              project: VideoProject
            ) => ({
              ...project,
              final_video_url:
                getFreshFinalVideoUrl(
                  project.final_video_url,
                  project.completed_at
                ),
            })
          );

      setVideoProjects(
        projects
      );

      /*
      |--------------------------------------------------------------------------
      | ACTIVE / LATEST PROJECT
      |--------------------------------------------------------------------------
      */

      const activeId =
        requestedProjectId ||
        activeProjectRef.current;

      const requestedProject =
        activeId
          ? projects.find(
              (
                project
              ) =>
                project.id ===
                activeId
            )
          : null;

      const latestProject =
        projects.length > 0
          ? projects[0]
          : null;

      const project =
        requestedProject ||
        latestProject;

      /*
      |--------------------------------------------------------------------------
      | IMPORTANT PROJECT GUARD
      |--------------------------------------------------------------------------
      |
      | If a new project is currently generating, do not replace the active
      | project with an older completed project.
      |
      */

      if (
        activeId &&
        !requestedProject &&
        project &&
        project.id !==
          activeId
      ) {
        console.log(
          "AI VIDEO STUDIO: keeping active project:",
          activeId,
          "latest completed:",
          project.id
        );

        return project;
      }

      setVideoProject(
        project
      );

      return project;
    } catch (
      error: any
    ) {
      console.error(
        "AI FINAL VIDEO HISTORY LOAD ERROR:",
        error
      );

      return null;
    } finally {
      setLoadingVideoProject(
        false
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE FINAL ASSEMBLED VIDEO
  |--------------------------------------------------------------------------
  */

  async function deleteFinalVideo(
    projectId: string
  ) {
    const confirmed =
      window.confirm(
        "Delete this final assembled video?\n\nThe completed video will be removed from MIB storage and from the video history."
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingProjectId(
        projectId
      );

      const response =
        await fetch(
          "/api/ai/video-project",
          {
            method:
              "DELETE",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              projectId,
              propertyId:
                listing?.id,
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Failed to delete final video."
        );
      }

      const remaining =
        videoProjects.filter(
          (project) =>
            project.id !==
            projectId
        );

      setVideoProjects(
        remaining
      );

      if (
        videoProject?.id ===
        projectId
      ) {
        setVideoProject(
          remaining[0] ||
            null
        );
      }
    } catch (
      error: any
    ) {
      console.error(
        "AI FINAL VIDEO DELETE ERROR:",
        error
      );

      setError(
        error?.message ||
          "Failed to delete final video."
      );
    } finally {
      setDeletingProjectId(
        null
      );
    }
  }


  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  |
  | This is ONLY for displaying existing data.
  |
  | It DOES NOT assemble anything.
  |
  */

  useEffect(() => {
    if (!listing?.id) {
      return;
    }

    setLoadingVideos(
      true
    );

    setLoadingVideoProject(
      true
    );

    void loadVideos();

    void loadVideoProject();
  }, [
    listing?.id,
  ]);

  /*
  |--------------------------------------------------------------------------
  | CREATE VIDEO PLAN
  |--------------------------------------------------------------------------
  */

  async function createVideoPlan() {
    if (
      analysing ||
      photos.length === 0
    ) {
      return;
    }

    try {
      setAnalysing(
        true
      );

      setError("");

      setVideoPlan(
        null
      );

      console.log(
        "AI VIDEO STUDIO: creating AI Director plan..."
      );

      const response =
        await fetch(
          "/api/ai/video-director",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              listing: {
                id:
                  listing.id,

                title:
                  listing.title,

                category:
                  listing.category,

                property_type:
                  listing.residential_type ||
                  listing.commercial_type ||
                  listing.industrial_property_type ||
                  listing.land_type ||
                  "",
              },

              videoStyle,

              photos:
                photos.map(
                  (
                    photo: Photo
                  ) => ({
                    index:
                      photo.index,

                    image_url:
                      photo.image_url,
                  })
                ),
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "AI Director failed to create video plan."
        );
      }

      const rawPlan =
        data.plan;

      if (!rawPlan) {
        throw new Error(
          "AI Director returned no video plan."
        );
      }

      const recommendations =
        Array.isArray(
          rawPlan.recommendations
        )
          ? rawPlan.recommendations
          : [];

      if (
        recommendations.length ===
        0
      ) {
        throw new Error(
          "AI Director returned no shot recommendations."
        );
      }

      const plan:
        VideoPlan = {
        style:
          rawPlan.style ||
          videoStyle,

        styleName:
          rawPlan.styleName ||
          "AI Director",

        overallDirection:
          rawPlan.overallDirection ||
          "Professional real-estate cinematography.",

        pacing:
          rawPlan.pacing ||
          "Natural cinematic",

        shotCount:
          recommendations.length,

        recommendations:
          recommendations.map(
            (
              shot: any,
              index: number
            ) => ({
              photoIndex:
                Number(
                  shot.photoIndex
                ),

              shotOrder:
                Number(
                  shot.shotOrder ||
                    index + 1
                ),

              shotType:
                String(
                  shot.shotType ||
                    "Property Cinematic Shot"
                ),

              cameraAction:
                String(
                  shot.cameraAction ||
                    "SLOW_PUSH"
                ),

              visualAnalysis:
                String(
                  shot.visualAnalysis ||
                    ""
                ),

              actionScript:
                String(
                  shot.actionScript ||
                    ""
                ),

              reason:
                String(
                  shot.reason ||
                    ""
                ),
            })
          ),
      };

      /*
      |--------------------------------------------------------------------------
      | VALIDATE ACTION SCRIPTS
      |--------------------------------------------------------------------------
      */

      const rawEditingPlan =
        rawPlan.editingPlan;

      const rawEditingShots =
        Array.isArray(
          rawEditingPlan?.shots
        )
          ? rawEditingPlan.shots
          : [];

      plan.editingPlan = {
        overallEditDirection:
          String(
            rawEditingPlan?.overallEditDirection ||
              "Create a coherent property sequence with purposeful energy changes and a strong final hero."
          ),

        rhythm:
          String(
            rawEditingPlan?.rhythm ||
              plan.pacing ||
              "Natural cinematic"
          ),

        totalTargetDuration:
          Number(
            rawEditingPlan?.totalTargetDuration ||
              plan.recommendations.length * 4
          ),

        shots:
          plan.recommendations.map(
            (
              shot: DirectorShot,
              index: number
            ) => {
              const planned =
                rawEditingShots.find(
                  (
                    item: any
                  ) =>
                    Number(
                      item?.shotOrder
                    ) ===
                    Number(
                      shot.shotOrder
                    )
                ) ||
                rawEditingShots[index] ||
                {};

              return {
                shotOrder:
                  Number(
                    shot.shotOrder
                  ),

                role:
                  String(
                    planned.role ||
                      (
                        index === 0
                          ? "HOOK"
                          : index ===
                              plan.recommendations.length - 1
                          ? "HERO"
                          : "REVEAL"
                      )
                  ),

                recommendedDuration:
                  Number(
                    planned.recommendedDuration ||
                      4
                  ),

                energy:
                  String(
                    planned.energy ||
                      "MEDIUM"
                  ),

                cutStyle:
                  String(
                    planned.cutStyle ||
                      (
                        index ===
                        plan.recommendations.length - 1
                          ? "FINAL_HOLD"
                          : "MOTIVATED_CUT"
                      )
                  ),

                editorReason:
                  String(
                    planned.editorReason ||
                      "Selected to maintain a coherent visual progression."
                  ),
              };
            }
          ),
      };

      const invalidShot =
        plan.recommendations.find(
          (
            shot
          ) =>
            !shot.actionScript.trim()
        );

      if (invalidShot) {
        throw new Error(
          `AI Director returned an empty Action Script for Shot ${invalidShot.shotOrder}.`
        );
      }

      setVideoPlan(
        plan
      );
      setExpandedShotOrder(null);

      console.log(
        "AI VIDEO STUDIO: VIDEO PLAN CREATED:",
        plan
      );
    } catch (
      error: any
    ) {
      console.error(
        "AI VIDEO PLAN ERROR:",
        error
      );

      setError(
        error?.message ||
          "AI Director failed to create the video plan."
      );
    } finally {
      setAnalysing(
        false
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | WAIT FOR SHOT COMPLETION
  |--------------------------------------------------------------------------
  |
  | This is the important Runway concurrency fix.
  |
  | We create ONE Runway task.
  | Then wait for that task to finish.
  | Only then create the next task.
  |
  */

  async function waitForShotCompletion(
    projectId: string,
    shotOrder: number
  ) {
    const maxAttempts =
      180;

    for (
      let attempt = 0;
      attempt <
      maxAttempts;
      attempt++
    ) {
      /*
      |--------------------------------------------------------------------------
      | LOAD CURRENT PROJECT VIDEOS
      |--------------------------------------------------------------------------
      */

      const projectVideos =
        await loadVideos(
          projectId
        );

      if (!projectVideos) {
        await new Promise(
          (
            resolve
          ) =>
            setTimeout(
              resolve,
              5000
            )
        );

        continue;
      }

      const shot =
        projectVideos.find(
          (
            video
          ) =>
            Number(
              video.shot_order
            ) ===
            Number(
              shotOrder
            )
        );

      if (shot) {
        console.log(
          "AI VIDEO STUDIO: shot status:",
          shotOrder,
          shot.status,
          shot.progress
        );

        /*
        |--------------------------------------------------------------------------
        | FAILED / CANCELLED
        |--------------------------------------------------------------------------
        */

        if (
          shot.status ===
            "failed" ||
          shot.status ===
            "cancelled" ||
          shot.status ===
            "canceled"
        ) {
          throw new Error(
            shot.error_message ||
              `Shot ${shotOrder} failed.`
          );
        }

        /*
        |--------------------------------------------------------------------------
        | COMPLETED
        |--------------------------------------------------------------------------
        */

        if (
          shot.status ===
            "completed" &&
          !!shot.video_url
        ) {
          console.log(
            "AI VIDEO STUDIO: shot completed:",
            shotOrder
          );

          return shot;
        }
      }

      /*
      |--------------------------------------------------------------------------
      | WAIT 5 SECONDS
      |--------------------------------------------------------------------------
      */

      await new Promise(
        (
          resolve
        ) =>
          setTimeout(
            resolve,
            5000
          )
      );
    }

    throw new Error(
      `Shot ${shotOrder} timed out while waiting for Runway.`
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ASSEMBLE PROJECT
  |--------------------------------------------------------------------------
  |
  | ONLY the active project can reach this function.
  |
  */

  async function assembleProject(
    projectId: string,
    editingPlanOverride?: EditingPlan
  ) {
    /*
    |--------------------------------------------------------------------------
    | GUARD
    |--------------------------------------------------------------------------
    */

    if (
      assemblingProjectRef.current ===
      projectId
    ) {
      console.log(
        "AI VIDEO STUDIO: assembly already running:",
        projectId
      );

      return;
    }

    assemblingProjectRef.current =
      projectId;

    try {
      console.log(
        "=================================================="
      );

      console.log(
        "AI VIDEO STUDIO: AUTO ASSEMBLY START"
      );

      console.log(
        "Project:",
        projectId
      );

      console.log(
        "=================================================="
      );

      const response =
        await fetch(
          "/api/ai/video-assemble",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              projectId,

              editingPlan:
                editingPlanOverride ||
                videoPlan?.editingPlan ||
                null,
            }),
          }
        );

      const data =
        await response.json();

      /*
      |--------------------------------------------------------------------------
      | 409 IS NOT A FAILURE
      |--------------------------------------------------------------------------
      */

      if (
        !response.ok &&
        response.status !==
          409
      ) {
        throw new Error(
          data.error ||
            "Video assembly failed."
        );
      }

      if (
        data.success
      ) {
        console.log(
          "AI VIDEO STUDIO: FINAL VIDEO ASSEMBLED:",
          data.finalVideoUrl
        );

        /*
        |--------------------------------------------------------------------------
        | UPDATE FINAL VIDEO IMMEDIATELY
        |--------------------------------------------------------------------------
        */

        if (
          data.finalVideoUrl
        ) {
          setVideoProject(
            (
              current
            ) => ({
              ...(current || {
                id:
                  projectId,

                property_id:
                  Number(
                    listing.id
                  ),

                status:
                  "completed",

                clip_count:
                  videoPlan
                    ?.shotCount ||
                  0,

                created_at:
                  new Date().toISOString(),
              }),

              id:
                projectId,

              status:
                "completed",

              final_video_url:
                getFreshFinalVideoUrl(
                  data.finalVideoUrl,
                  new Date().toISOString()
                ),

              completed_at:
                new Date().toISOString(),
            })
          );
        }
      } else {
        console.log(
          "AI VIDEO STUDIO: assembly response:",
          data.message ||
            data.error
        );
      }

      /*
      |--------------------------------------------------------------------------
      | REFRESH PROJECT
      |--------------------------------------------------------------------------
      */

      await loadVideoProject(
        projectId
      );
    } catch (
      error: any
    ) {
      console.error(
        "AI VIDEO STUDIO AUTO-ASSEMBLY ERROR:",
        error
      );

      setError(
        error?.message ||
          "Video assembly failed."
      );
    } finally {
      assemblingProjectRef.current =
        null;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | WAIT FOR ALL PROJECT SHOTS
  |--------------------------------------------------------------------------
  |
  | This is the internal refresh/polling system.
  |
  */

  async function waitForProjectAndAssemble(
    projectId: string
  ) {
    if (
      !projectId
    ) {
      return;
    }

    if (
      pollingRef.current
    ) {
      console.log(
        "AI VIDEO STUDIO: project polling already running."
      );

      return;
    }

    pollingRef.current =
      true;

    try {
      const totalShots =
        videoPlan
          ?.recommendations
          .length ||
        0;

      const maxAttempts =
        240;

      for (
        let attempt = 0;
        attempt <
        maxAttempts;
        attempt++
      ) {
        /*
        |--------------------------------------------------------------------------
        | LOAD CURRENT PROJECT SHOTS
        |--------------------------------------------------------------------------
        */

        const projectVideos =
          await loadVideos(
            projectId
          );

        /*
        |--------------------------------------------------------------------------
        | LOAD PROJECT STATUS
        |--------------------------------------------------------------------------
        */

        const project =
          await loadVideoProject(
            projectId
          );

        /*
        |--------------------------------------------------------------------------
        | IF FINAL VIDEO ALREADY EXISTS
        |--------------------------------------------------------------------------
        */

        if (
          project &&
          project.id ===
            projectId &&
          project.final_video_url
        ) {
          console.log(
            "AI VIDEO STUDIO: final video already exists."
          );

          setVideoProject(
            project
          );

          break;
        }

        /*
        |--------------------------------------------------------------------------
        | COUNT COMPLETED SHOTS
        |--------------------------------------------------------------------------
        */

        const completedCount =
          projectVideos
            ? projectVideos.filter(
                (
                  video
                ) =>
                  video.status ===
                    "completed" &&
                  !!video.video_url
              ).length
            : 0;

        const failedShot =
          projectVideos?.find(
            (
              video
            ) =>
              video.status ===
                "failed" ||
              video.status ===
                "cancelled" ||
              video.status ===
                "canceled"
          );

        if (
          failedShot
        ) {
          throw new Error(
            failedShot.error_message ||
              `Shot ${
                failedShot.shot_order ??
                "unknown"
              } failed.`
          );
        }

        console.log(
          "AI VIDEO STUDIO: project progress:",
          `${completedCount}/${totalShots || projectVideos?.length || "?"}`
        );

        /*
        |--------------------------------------------------------------------------
        | UPDATE PROGRESS
        |--------------------------------------------------------------------------
        */

        setGenerationProgress(
          (
            current
          ) => ({
            current:
              Math.max(
                current.current,
                completedCount
              ),

            total:
              totalShots ||
              current.total,
          })
        );

        /*
        |--------------------------------------------------------------------------
        | ALL SHOTS COMPLETED
        |--------------------------------------------------------------------------
        */

        const expectedCount =
          totalShots ||
          projectVideos?.length ||
          0;

        if (
          expectedCount >
            0 &&
          projectVideos &&
          projectVideos.length >=
            expectedCount &&
          completedCount >=
            expectedCount
        ) {
          console.log(
            "AI VIDEO STUDIO: ALL SHOTS COMPLETED"
          );

          await assembleProject(
            projectId,
            videoPlan?.editingPlan
          );

          /*
          |--------------------------------------------------------------------------
          | FINAL REFRESH
          |--------------------------------------------------------------------------
          */

          await loadVideos(
            projectId
          );

          await loadVideoProject(
            projectId
          );

          break;
        }

        /*
        |--------------------------------------------------------------------------
        | INTERNAL REFRESH
        |--------------------------------------------------------------------------
        */

        await new Promise(
          (
            resolve
          ) =>
            setTimeout(
              resolve,
              5000
            )
        );
      }
    } catch (
      error: any
    ) {
      console.error(
        "AI VIDEO STUDIO PROJECT POLLING ERROR:",
        error
      );

      setError(
        error?.message ||
          "Video generation monitoring failed."
      );
    } finally {
      pollingRef.current =
        false;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | GENERATE VIDEO
  |--------------------------------------------------------------------------
  */

  async function generateVideo() {
    if (
      generating ||
      !videoPlan ||
      videoPlan.recommendations
        .length === 0
    ) {
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | PREVENT DOUBLE CLICK
    |--------------------------------------------------------------------------
    */

    if (
      activeProjectRef.current
    ) {
      const confirmed =
        window.confirm(
          "A video generation project is already running.\n\nDo you want to start another project?"
        );

      if (!confirmed) {
        return;
      }
    }

    try {
      setGenerating(
        true
      );

      setError("");

      setVideoProject(
        null
      );

      setVideos([]);

      setGenerationProgress({
        current: 0,
        total:
          videoPlan
            .recommendations
            .length,
      });

      /*
      |--------------------------------------------------------------------------
      | CREATE PROJECT
      |--------------------------------------------------------------------------
      */

      console.log(
        "AI VIDEO STUDIO: creating video project..."
      );

      const projectResponse =
        await fetch(
          "/api/ai/video-project",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              propertyId:
                listing.id,

              clipCount:
                videoPlan
                  .recommendations
                  .length,
            }),
          }
        );

      const projectData =
        await projectResponse.json();

      if (
        !projectResponse.ok ||
        !projectData.success
      ) {
        throw new Error(
          projectData.error ||
            "Failed to create AI video project."
        );
      }

      const projectId =
        projectData.project.id;

      /*
      |--------------------------------------------------------------------------
      | STORE ACTIVE PROJECT
      |--------------------------------------------------------------------------
      */

      setActiveProjectId(
        projectId
      );

      activeProjectRef.current =
        projectId;

      console.log(
        "=================================================="
      );

      console.log(
        "AI VIDEO STUDIO: ACTIVE PROJECT:"
      );

      console.log(
        projectId
      );

      console.log(
        "=================================================="
      );

      /*
      |--------------------------------------------------------------------------
      | GENERATE SHOTS
      |--------------------------------------------------------------------------
      |
      | IMPORTANT:
      |
      | ONE RUNWAY JOB AT A TIME.
      |
      | We submit Shot 1.
      | Wait for completion.
      | Then submit Shot 2.
      |
      | This respects the 1-concurrency limit.
      |
      */

      const shots =
        videoPlan
          .recommendations;

      for (
        let i = 0;
        i < shots.length;
        i++
      ) {
        const shot =
          shots[i];

        const photo =
          photos.find(
            (
              item: Photo
            ) =>
              item.index ===
              shot.photoIndex
          );

        if (!photo) {
          throw new Error(
            `Photo ${shot.photoIndex} could not be found.`
          );
        }

        console.log(
          "=================================================="
        );

        console.log(
          "AI VIDEO STUDIO: GENERATING SHOT"
        );

        console.log(
          `Shot ${i + 1}/${shots.length}`
        );

        console.log(
          "Project:",
          projectId
        );

        console.log(
          "Photo:",
          shot.photoIndex
        );

        console.log(
          "Type:",
          shot.shotType
        );

        console.log(
          "Action:",
          shot.actionScript
        );

        console.log(
          "=================================================="
        );

        /*
        |--------------------------------------------------------------------------
        | SEND ONE SHOT TO RUNWAY
        |--------------------------------------------------------------------------
        */

        const response =
          await fetch(
            "/api/ai/property-video-studio",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                propertyId:
                  listing.id,

                projectId,

                imageUrl:
                  photo.image_url,

                photoIndex:
                  shot.photoIndex,

                shotOrder:
                  shot.shotOrder,

                videoStyle,

                director:
                  shot,
              }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.error ||
              `Failed to create Shot ${i + 1}.`
          );
        }

        /*
        |--------------------------------------------------------------------------
        | WAIT FOR THIS SHOT
        |--------------------------------------------------------------------------
        */

        await waitForShotCompletion(
          projectId,
          shot.shotOrder
        );

        /*
        |--------------------------------------------------------------------------
        | UPDATE PROGRESS
        |--------------------------------------------------------------------------
        */

        setGenerationProgress({
          current:
            i + 1,

          total:
            shots.length,
        });
      }

      /*
      |--------------------------------------------------------------------------
      | ALL SHOTS HAVE FINISHED
      |--------------------------------------------------------------------------
      */

      console.log(
        "=================================================="
      );

      console.log(
        "AI VIDEO STUDIO: ALL RUNWAY SHOTS COMPLETE"
      );

      console.log(
        "Project:",
        projectId
      );

      console.log(
        "=================================================="
      );

      /*
      |--------------------------------------------------------------------------
      | AUTO ASSEMBLE
      |--------------------------------------------------------------------------
      */

      await assembleProject(
        projectId,
        videoPlan?.editingPlan
      );

      /*
      |--------------------------------------------------------------------------
      | FINAL INTERNAL REFRESH
      |--------------------------------------------------------------------------
      */

      await loadVideos(
        projectId
      );

      await loadVideoProject(
        projectId
      );
    } catch (
      error: any
    ) {
      console.error(
        "AI VIDEO STUDIO GENERATION ERROR:",
        error
      );

      setError(
        error?.message ||
          "Failed to generate the property video."
      );
    } finally {
      setGenerating(
        false
      );

      setGenerationProgress({
        current: 0,
        total: 0,
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | RE-ASSEMBLE EXISTING PROJECT
  |--------------------------------------------------------------------------
  |
  | Rebuilds the final MP4 from the already-generated Runway shots.
  | This NEVER calls Runway and therefore does not consume Runway credits.
  |
  */

  async function reassembleExistingProject(
    project: VideoProject
  ) {
    if (
      !project?.id ||
      reassemblingProjectId
    ) {
      return;
    }

    try {
      setReassemblingProjectId(
        project.id
      );

      setError("");

      console.log(
        "AI VIDEO STUDIO: RE-ASSEMBLING EXISTING PROJECT:",
        project.id
      );

      const response =
        await fetch(
          "/api/ai/video-assemble",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              projectId:
                project.id,

              editingPlan:
                videoPlan?.editingPlan ||
                null,
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok &&
        response.status !==
          409
      ) {
        throw new Error(
          data.error ||
            "Failed to re-assemble the existing video."
        );
      }

      if (
        data.success &&
        data.finalVideoUrl
      ) {
        setVideoProject(
          (
            current
          ) =>
            current?.id ===
            project.id
              ? {
                  ...current,
                  status:
                    "completed",
                  final_video_url:
                    data.finalVideoUrl,
                  completed_at:
                    new Date().toISOString(),
                }
              : current
        );
      }

      await loadVideoProject(
        project.id
      );

      console.log(
        "AI VIDEO STUDIO: EXISTING PROJECT RE-ASSEMBLED:",
        project.id
      );
    } catch (
      error: any
    ) {
      console.error(
        "AI VIDEO STUDIO RE-ASSEMBLY ERROR:",
        error
      );

      setError(
        error?.message ||
          "Failed to re-assemble the existing video."
      );
    } finally {
      setReassemblingProjectId(
        null
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE VIDEO
  |--------------------------------------------------------------------------
  */

  async function deleteVideo(
    video: VideoRecord
  ) {
    const confirmed =
      window.confirm(
        "Delete this AI video?\n\nThis will permanently delete the video from Supabase Storage and remove its database record.\n\nThis cannot be undone."
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingVideoId(
        video.id
      );

      setError("");

      const response =
        await fetch(
          "/api/ai/property-video",
          {
            method: "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              id:
                video.id,
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Failed to delete AI video."
        );
      }

      setVideos(
        (
          current
        ) =>
          current.filter(
            (
              item
            ) =>
              item.id !==
              video.id
          )
      );
    } catch (
      error: any
    ) {
      console.error(
        "AI VIDEO DELETE ERROR:",
        error
      );

      setError(
        error?.message ||
          "Failed to delete AI video."
      );
    } finally {
      setDeletingVideoId(
        null
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | ACTIVE STYLE
  |--------------------------------------------------------------------------
  */

  const selectedStyle =
    VIDEO_STYLES.find(
      (
        style
      ) =>
        style.value ===
        videoStyle
    );

  /*
  |--------------------------------------------------------------------------
  | CURRENT PROJECT SHOT COUNT
  |--------------------------------------------------------------------------
  */

  const completedShots =
    videos.filter(
      (
        video
      ) =>
        video.status ===
          "completed" &&
        !!video.video_url
    ).length;

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-6">

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="bg-white border rounded-xl shadow-sm p-6">

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">

          <div>

            <h2 className="text-2xl font-bold text-black">
              🎬 AI Video Studio
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Let AI Director plan the entire
              property film, then let Runway execute
              the camera direction.
            </p>

          </div>

          <div className="flex flex-col sm:flex-row gap-3">

            {/* STYLE */}

            <div>

              <label className="block text-xs font-semibold text-gray-500 mb-2">
                Video Style
              </label>

              <select
                value={
                  videoStyle
                }
                onChange={(
                  event
                ) => {

                  setVideoStyle(
                    event.target
                      .value as VideoStyle
                  );

                  setVideoPlan(
                    null
                  );

                  setError("");

                }}
                disabled={
                  analysing ||
                  generating
                }
                className="border rounded-lg px-4 py-3 text-sm bg-white min-w-[290px]"
              >

                {VIDEO_STYLES.map(
                  (
                    style
                  ) => (

                    <option
                      key={
                        style.value
                      }
                      value={
                        style.value
                      }
                    >
                      {style.label}
                    </option>

                  )
                )}

              </select>

            </div>

            {/* CREATE PLAN */}

            <button
              type="button"
              onClick={
                createVideoPlan
              }
              disabled={
                analysing ||
                generating ||
                photos.length ===
                  0
              }
              className="self-end px-5 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold"
            >

              {analysing
                ? "✨ Creating Plan..."
                : "✨ Create Video Plan"}

            </button>

          </div>

        </div>

        {/* STYLE DESCRIPTION */}

        {selectedStyle ? (

          <div className="mt-4 bg-gray-50 border rounded-lg p-4">

            <p className="text-sm font-semibold text-black">
              {
                selectedStyle.label
              }
            </p>

            <p className="text-sm text-gray-500 mt-1">
              {
                selectedStyle.description
              }
            </p>

          </div>

        ) : null}

        {/* INFO */}

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">

          <div className="bg-gray-50 border rounded-lg p-4">

            <p className="text-xs text-gray-500">
              Property Photos
            </p>

            <p className="text-xl font-bold text-black mt-1">
              {
                photos.length
              }
            </p>

          </div>

          <div className="bg-gray-50 border rounded-lg p-4">

            <p className="text-xs text-gray-500">
              Director Plan
            </p>

            <p className="text-xl font-bold text-black mt-1">

              {videoPlan
                ? videoPlan.shotCount
                : "—"}

            </p>

          </div>

          <div className="bg-gray-50 border rounded-lg p-4">

            <p className="text-xs text-gray-500">
              Current Project
            </p>

            <p className="text-sm font-semibold text-black mt-2">

              {activeProjectId
                ? `${completedShots}/${videoPlan?.shotCount || "?"} shots completed`
                : videoProject?.status ||
                  "Ready"}

            </p>

          </div>

        </div>

        {/* ERROR */}

        {error ? (

          <div className="mt-4 p-4 rounded-lg border border-red-300 bg-red-50 text-red-700 text-sm">

            {error}

          </div>

        ) : null}

      </div>

      {/* ====================================================== */}
      {/* READY */}
      {/* ====================================================== */}

      {!videoPlan &&
      photos.length > 0 ? (

        <div className="bg-white border rounded-xl shadow-sm p-10 text-center">

          <div className="text-5xl mb-4">
            🎬
          </div>

          <h3 className="font-bold text-xl text-black">
            Ready to direct this property
          </h3>

          <p className="text-sm text-gray-500 mt-2 max-w-xl mx-auto">
            Choose a video style and let MIB AI
            Director analyse the complete photo set,
            choose the strongest shots and write the
            camera Action Scripts.
          </p>

        </div>

      ) : null}

      {/* ====================================================== */}
      {/* VIDEO PLAN */}
      {/* ====================================================== */}

      {videoPlan ? (

        <div className="bg-white border rounded-xl shadow-sm p-6">

          {/* PLAN HEADER */}

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

            <div>

              <div className="flex items-center gap-2">

                <span className="text-xl">
                  ✨
                </span>

                <h3 className="text-xl font-bold text-black">
                  AI Director Video Plan
                </h3>

              </div>

              <p className="text-sm text-gray-500 mt-1">
                {
                  videoPlan.styleName
                }
              </p>

            </div>

            <button
              type="button"
              onClick={
                generateVideo
              }
              disabled={
                generating ||
                videoPlan
                  .recommendations
                  .length ===
                  0
              }
              className="px-6 py-3 rounded-lg bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold"
            >

              {generating
                ? `🎬 Generating ${generationProgress.current}/${generationProgress.total}...`
                : `🎬 Generate ${videoPlan.shotCount}-Shot Video`}

            </button>

          </div>

          {/* OVERALL DIRECTION */}

          <div className="mt-5 bg-purple-50 border border-purple-200 rounded-xl p-5">

            <p className="text-xs uppercase tracking-wide font-semibold text-purple-600">
              Overall Direction
            </p>

            <p className="text-sm text-purple-900 mt-2">
              {
                videoPlan.overallDirection
              }
            </p>

            <p className="text-xs text-purple-700 mt-3">
              Pacing:{" "}
              {
                videoPlan.pacing
              }
            </p>

          </div>

          {videoPlan.editingPlan ? (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wide font-semibold text-amber-700">
                    🎬 AI Editing Plan
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {videoPlan.editingPlan.overallEditDirection}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">
                    Target
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {videoPlan.editingPlan.totalTargetDuration.toFixed(1)}s
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-600 mt-2">
                Rhythm: {videoPlan.editingPlan.rhythm}
              </p>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {videoPlan.editingPlan.shots.map(
                  (editShot) => (
                    <div
                      key={editShot.shotOrder}
                      className="rounded-lg bg-white border border-amber-100 px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-gray-900">
                          Shot {editShot.shotOrder}
                        </span>

                        <span className="text-[10px] uppercase tracking-wide text-amber-700 font-semibold">
                          {editShot.role}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                        <span>{editShot.recommendedDuration}s</span>
                        <span>•</span>
                        <span>{editShot.energy}</span>
                        <span>•</span>
                        <span>{editShot.cutStyle}</span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ) : null}

          {/* SHOTS */}

          <div className="mt-6">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <p className="text-sm font-bold text-black">
                  Director Shots
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Tap a shot to view its Action Script.
                </p>
              </div>

              <span className="text-xs font-semibold bg-gray-100 text-gray-600 rounded-full px-3 py-1">
                {videoPlan.shotCount} shots
              </span>
            </div>

            <div className="space-y-2">
              {videoPlan.recommendations
                .slice()
                .sort(
                  (a, b) =>
                    a.shotOrder - b.shotOrder
                )
                .map(
                  (shot) => {
                    const photo =
                      photos.find(
                        (item: Photo) =>
                          item.index ===
                          shot.photoIndex
                      );

                    const expanded =
                      expandedShotOrder ===
                      shot.shotOrder;

                    return (
                      <div
                        key={`${shot.shotOrder}-${shot.photoIndex}`}
                        className={`border rounded-xl overflow-hidden transition ${
                          expanded
                            ? "border-purple-300 shadow-sm"
                            : "border-gray-200"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedShotOrder(
                              expanded
                                ? null
                                : shot.shotOrder
                            )
                          }
                          className="w-full text-left p-3 hover:bg-gray-50 transition"
                          aria-expanded={expanded}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-20 h-14 sm:w-24 sm:h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                              {photo ? (
                                <img
                                  src={photo.image_url}
                                  alt={`Shot ${shot.shotOrder}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                                  No photo
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] uppercase tracking-wide font-semibold text-gray-400">
                                  Shot {shot.shotOrder}
                                </span>

                                <span className="text-[10px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                                  4 sec
                                </span>
                              </div>

                              <h4 className="font-bold text-sm sm:text-base text-black mt-1 truncate">
                                {shot.shotType}
                              </h4>

                              <p className="text-xs text-gray-500 mt-1 truncate">
                                Photo {shot.photoIndex + 1}
                              </p>
                            </div>

                            <div
                              className={`shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 transition-transform ${
                                expanded
                                  ? "rotate-180"
                                  : ""
                              }`}
                              aria-hidden="true"
                            >
                              ↓
                            </div>
                          </div>
                        </button>

                        {expanded ? (
                          <div className="px-3 pb-3">
                            <div className="ml-0 sm:ml-[108px] bg-gray-50 border rounded-lg p-4">
                              <p className="text-[11px] uppercase tracking-wide font-semibold text-purple-600">
                                Action Script
                              </p>

                              <p className="text-sm text-gray-800 mt-2 leading-relaxed">
                                {shot.actionScript}
                              </p>

                              {shot.reason ? (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-400">
                                    Director Reason
                                  </p>

                                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    {shot.reason}
                                  </p>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  }
                )}
            </div>
          </div>

        </div>

      ) : null}

      {/* ====================================================== */}
      {/* GENERATION MONITOR */}
      {/* ====================================================== */}

      {generating &&
      activeProjectId ? (

        <div className="bg-white border rounded-xl shadow-sm p-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

            <div>

              <p className="font-semibold text-black">
                🎬 Generating Property Video
              </p>

              <p className="text-sm text-gray-500 mt-1">
                MIB is handling Runway jobs one at a
                time and automatically checking progress.
              </p>

            </div>

            <div className="text-right">

              <p className="text-lg font-bold text-purple-600">
                {
                  completedShots
                }{" "}
                /{" "}
                {
                  videoPlan?.shotCount ||
                  generationProgress.total
                }
              </p>

              <p className="text-xs text-gray-500">
                shots completed
              </p>

            </div>

          </div>

          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">

            <div
              className="h-full bg-purple-600 transition-all duration-700"
              style={{
                width:
                  (
                    videoPlan?.shotCount ||
                    generationProgress.total
                  ) > 0
                    ? `${
                        (completedShots /
                          (
                            videoPlan?.shotCount ||
                            generationProgress.total
                          )) *
                        100
                      }%`
                    : "0%",
              }}
            />

          </div>

          <div className="mt-4 text-xs text-gray-400 font-mono break-all">
            Project:{" "}
            {
              activeProjectId
            }
          </div>

        </div>

      ) : null}

      {/* ====================================================== */}
      {/* FINAL VIDEO HISTORY */}
      {/* ====================================================== */}

      <div className="bg-white border rounded-xl shadow-sm p-5">

        <div className="flex items-center justify-between gap-3 mb-5">

          <div>
            <h3 className="text-xl font-bold text-black">
              🎬 Final Property Video
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Completed assembled videos for this property.
            </p>
          </div>

          {videoProjects.length > 0 ? (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">
              {videoProjects.length}{" "}
              {videoProjects.length === 1
                ? "video"
                : "videos"}
            </span>
          ) : null}

        </div>

        {loadingVideoProject ? (

          <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl">
            <div className="text-3xl mb-2">
              🎬
            </div>

            <p className="font-semibold">
              Loading final videos...
            </p>
          </div>

        ) : videoProjects.length > 0 ? (

          <div>

            {/* ================================================== */}
            {/* FINAL VIDEO GALLERY */}
            {/* ================================================== */}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">

              {videoProjects.map(
                (
                  project,
                  index
                ) => (

                  <div
                    key={
                      project.id
                    }
                    className="relative"
                  >

                    {/* LATEST BADGE */}

                    {index === 0 ? (
                      <div className="absolute z-10 top-2 left-2 bg-yellow-300 text-black text-xs font-bold px-2 py-1 rounded shadow-sm">
                        Latest
                      </div>
                    ) : null}

                    {/* VIDEO CARD */}

                    <div className="bg-black rounded-lg overflow-hidden border border-gray-200 shadow-sm">

                      <video
                        src={
                          project.final_video_url ||
                          undefined
                        }
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full aspect-[9/16] object-contain"
                      />

                    </div>

                    {/* CARD ACTIONS */}

                    <div className="flex gap-2 mt-2">

                      <a
                        href={
                          project.final_video_url ||
                          "#"
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center px-2 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-black"
                      >
                        Download
                      </a>

                      <button
                        type="button"
                        onClick={() =>
                          reassembleExistingProject(
                            project
                          )
                        }
                        disabled={
                          reassemblingProjectId ===
                          project.id
                        }
                        className="flex-1 px-2 py-1.5 rounded border border-purple-300 bg-white hover:bg-purple-50 text-purple-700 text-xs font-semibold disabled:opacity-50"
                      >
                        {reassemblingProjectId ===
                        project.id
                          ? "Rebuilding..."
                          : "Rebuild"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteFinalVideo(
                            project.id
                          )
                        }
                        disabled={
                          deletingProjectId ===
                          project.id
                        }
                        className="flex-1 px-2 py-1.5 rounded border border-red-300 bg-white hover:bg-red-50 text-red-600 text-xs font-semibold disabled:opacity-50"
                      >
                        {deletingProjectId ===
                        project.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>

                    </div>

                    {/* DATE / SHOT COUNT */}

                    <div className="mt-2">

                      <p className="text-[11px] text-gray-500 truncate">
                        {new Date(
                          project.created_at
                        ).toLocaleString(
                          undefined,
                          {
                            dateStyle:
                              "medium",
                            timeStyle:
                              "short",
                          }
                        )}
                      </p>

                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {
                          project.clip_count
                        }{" "}
                        cinematic shots
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

            {/* CURRENT VIDEO INFO */}

            {videoProject ? (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-5 pt-4 border-t">

                <div>
                  <p className="font-semibold text-black">
                    🎥 AI Property Video
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {
                      videoProject.clip_count
                    }{" "}
                    cinematic shots assembled into one final video.
                  </p>
                </div>

                <a
                  href={
                    videoProject.final_video_url ||
                    "#"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium text-center"
                >
                  ⬇ Download Latest Video
                </a>

              </div>
            ) : null}

          </div>

        ) : (

          <div className="p-8 text-center bg-gray-50 rounded-xl">

            <div className="text-3xl mb-2">
              🎬
            </div>

            <p className="font-semibold text-black">
              No final video yet
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Create a Director plan and generate the video. MIB will automatically assemble and save the completed version here.
            </p>

          </div>

        )}

      </div>

      
    </div>
  );
}