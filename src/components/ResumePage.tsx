"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LAST_PAGE_KEY, STARTED_KEY, parseSaved, resumeTarget, worthSaving } from "@/lib/resume";

/*
| Remembers the page you are on, and takes you back to it when the app starts again from the start
| page (for example after the phone closed the page while you used another app). See lib/resume.ts.
| It never blocks the page: if storage is not available it does nothing.
*/

export default function ResumePage() {
  const pathname = usePathname();
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    try {
      if (!started.current) {
        started.current = true;
        const already = sessionStorage.getItem(STARTED_KEY) === "1";
        sessionStorage.setItem(STARTED_KEY, "1");
        const target = resumeTarget({ pathname, saved: parseSaved(localStorage.getItem(LAST_PAGE_KEY)), now: Date.now(), alreadyStarted: already });
        if (target) {
          router.replace(target);
          return;
        }
      }
      const here = `${pathname}${window.location.search}`;
      if (worthSaving(here)) localStorage.setItem(LAST_PAGE_KEY, JSON.stringify({ path: here, at: Date.now() }));
    } catch {
      /* private mode or blocked storage: nothing to remember */
    }
  }, [pathname, router]);

  // When you leave the page (switch to another app), stamp the time, so "recent" counts from when you left.
  useEffect(() => {
    const stamp = () => {
      if (document.visibilityState !== "hidden") return;
      try {
        const here = `${window.location.pathname}${window.location.search}`;
        if (worthSaving(here)) localStorage.setItem(LAST_PAGE_KEY, JSON.stringify({ path: here, at: Date.now() }));
      } catch {
        /* nothing to do */
      }
    };
    document.addEventListener("visibilitychange", stamp);
    window.addEventListener("pagehide", stamp);
    return () => {
      document.removeEventListener("visibilitychange", stamp);
      window.removeEventListener("pagehide", stamp);
    };
  }, []);

  return null;
}
