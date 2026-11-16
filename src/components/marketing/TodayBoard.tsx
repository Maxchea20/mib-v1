"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { buildCaption, buildPlatformCaption, placeOf, priceText, typeLabel, withLink, type ShareListing } from "@/lib/shareKit";
import {
  IDEAS, PLATFORMS, PLATFORM_LABEL, WEEK_PLAN, agoText, nextIdea, oldestFirst, postsThisWeek, rankListings, startOfMyDay, todaySlot,
  type Idea, type PlanListing, type SharePlatform, type ShareEntry,
} from "@/lib/todayPlan";
import type { Lang } from "@/site/i18n";

/*
| TODAY. Suggests one listing (or one idea) to share, with a caption for each app.
| You post by hand and tick "Posted"; the tick is saved so the next suggestion rotates.
| Nothing is posted automatically.
*/

export type TodayListing = PlanListing & { cover: string | null };
type Entry = ShareEntry & { id?: number };
type LangChoice = "auto" | Lang;

const DEFAULT_LANG: Record<SharePlatform, Lang> = { instagram: "en", tiktok: "en", threads: "en", xiaohongshu: "zh", douyin: "zh", facebook: "en" };
const LANGS: { id: LangChoice; label: string }[] = [
  { id: "auto", label: "Auto" },
  { id: "en", label: "English" },
  { id: "ms", label: "BM" },
  { id: "zh", label: "中文" },
];

const btn = "min-h-11 px-4 rounded-lg border border-stone-300 bg-white text-sm font-semibold text-stone-900 disabled:opacity-40";
const btnPri = "min-h-11 px-4 rounded-lg bg-[var(--copper)] text-sm font-semibold text-white disabled:opacity-40";
const chip = "inline-flex items-center rounded-full bg-[#f3e8da] px-3 py-1 text-xs font-semibold text-[#7a3a18]";
const card = "bg-white border border-stone-200 rounded-2xl p-4 sm:p-6";
const cap = "text-xs font-bold uppercase tracking-wider text-stone-600 mb-2";

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

function captionFor(l: ShareListing, platform: SharePlatform, lang: Lang): string {
  if (platform === "instagram") return buildPlatformCaption(l, lang, "instagram").full;
  if (platform === "xiaohongshu") return buildPlatformCaption(l, lang, "xiaohongshu").full;
  if (platform === "facebook") return withLink(buildCaption(l, lang), l.id, lang, "facebook");
  return buildPlatformCaption(l, lang, "tiktok").full; // tiktok, threads, douyin: short
}

export default function TodayBoard({
  listings,
  history: initialHistory,
  historyReady,
  serverNow,
}: {
  listings: TodayListing[];
  history: Entry[];
  historyReady: boolean;
  serverNow: number;
}) {
  const now = serverNow;

  const [history, setHistory] = useState<Entry[]>(initialHistory);
  // The pick is chosen once when the page opens, so ticking Posted does not make it jump to another listing.
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    const first = rankListings(listings, initialHistory, serverNow);
    return (first.find((r) => !r.cooling) ?? first[0])?.listing.id ?? null;
  });
  const [ideaKey, setIdeaKey] = useState<string | null>(null);
  const [langChoice, setLangChoice] = useState<LangChoice>("auto");
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [busyKey, setBusyKey] = useState("");

  const ranked = useMemo(() => rankListings(listings, history, now), [listings, history, now]);
  const candidates = ranked.filter((r) => !r.cooling);
  const pool = candidates.length > 0 ? candidates : ranked;
  const current = ranked.find((r) => r.listing.id === selectedId) ?? pool[0] ?? null;
  const old = useMemo(() => oldestFirst(ranked).slice(0, 8), [ranked]);

  const { index: todayIndex, slot } = todaySlot(now);
  const suggested = useMemo(() => nextIdea(history, now), [history, now]);
  const idea: Idea = IDEAS.find((i) => i.key === ideaKey) ?? suggested.idea;
  const weekPosts = postsThisWeek(history, now);
  const dayStart = startOfMyDay(now);

  const title = (l: ShareListing) => l.title?.trim() || `Listing ${l.id}`;
  const lookup = new Map(listings.map((l) => [l.id, l]));

  const isPosted = (target: { id?: number; ideaKey?: string }, platform: SharePlatform) =>
    history.some((h) => (target.id !== undefined ? h.property_id === target.id : h.idea_key === target.ideaKey) && h.platform === platform && Date.parse(h.shared_at) >= dayStart);

  async function toggle(target: { id?: number; ideaKey?: string }, platform: SharePlatform, lang: Lang) {
    if (!historyReady) return;
    const key = `${target.id ?? target.ideaKey}-${platform}`;
    setBusyKey(key);
    setNotice("");
    const todays = history.filter(
      (h) => (target.id !== undefined ? h.property_id === target.id : h.idea_key === target.ideaKey) && h.platform === platform && Date.parse(h.shared_at) >= dayStart
    );
    if (todays.length > 0) {
      const ids = todays.map((h) => h.id).filter((x): x is number => typeof x === "number");
      const { error } = await supabase.from("share_log").delete().in("id", ids);
      if (error) setNotice("Could not remove that tick. Try again.");
      else setHistory((cur) => cur.filter((h) => !todays.includes(h)));
    } else {
      const row = { property_id: target.id ?? null, idea_key: target.ideaKey ?? null, platform, lang };
      const { data, error } = await supabase.from("share_log").insert(row).select("id, property_id, idea_key, platform, shared_at").single();
      if (error || !data) setNotice("Could not save that tick. Try again.");
      else setHistory((cur) => [data as Entry, ...cur]);
    }
    setBusyKey("");
  }

  async function copy(id: string, text: string) {
    setNotice((await copyText(text)) ? "Caption copied." : "Could not copy. Select the text and copy it yourself.");
    void id;
  }

  function another() {
    if (!current || pool.length < 2) return;
    const i = pool.findIndex((r) => r.listing.id === current.listing.id);
    setSelectedId(pool[(i + 1) % pool.length].listing.id);
  }

  function anotherIdea() {
    const i = IDEAS.findIndex((x) => x.key === idea.key);
    setIdeaKey(IDEAS[(i + 1) % IDEAS.length].key);
  }

  const lang = (p: SharePlatform): Lang => (langChoice === "auto" ? DEFAULT_LANG[p] : langChoice);
  const recent = history.slice(0, 8);

  const todayWord = new Intl.DateTimeFormat("en-MY", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kuala_Lumpur" }).format(now);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-stone-900">{todayWord}</p>
          <p className="text-sm text-stone-600">
            Today&apos;s slot: <b>{slot.label}</b>. Nothing posts by itself: you share, then tick Posted.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-xl border border-stone-200 bg-white px-4 py-2">
            <div className="text-2xl font-bold text-stone-900">{weekPosts}</div>
            <div className="text-xs text-stone-600">ticks this week</div>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white px-4 py-2">
            <div className="text-2xl font-bold text-stone-900">{ranked.filter((r) => r.daysSince === null).length}</div>
            <div className="text-xs text-stone-600">listings never shared</div>
          </div>
        </div>
      </div>

      {!historyReady && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Share history is not switched on yet, so ticks cannot be saved and every listing looks &quot;never shared&quot;. Run
          <code className="mx-1 rounded bg-white px-1">supabase/audit/07_share_log.sql</code> once in the Supabase SQL editor, then refresh.
        </div>
      )}
      {notice && (
        <div role="status" className="rounded-xl border border-stone-300 bg-white p-3 text-sm text-stone-800">
          {notice}
        </div>
      )}

      <div className="flex flex-wrap items-start gap-5">
        <div className="flex min-w-0 flex-[999_1_620px] flex-col gap-5">
          {/* TODAY'S LISTING */}
          <section className={card}>
            <p className={cap}>Listing to share</p>
            {!current ? (
              <p className="text-sm text-stone-700">
                No listing is ready. A listing needs status Available, &quot;Show on public website&quot; switched on, and at least 3 photos.
              </p>
            ) : (
              <div className="flex flex-wrap gap-5">
                <div className="w-40 shrink-0">
                  {current.listing.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={current.listing.cover} alt="" className="aspect-[3/4] w-40 rounded-xl object-cover bg-stone-200" />
                  ) : (
                    <div className="aspect-[3/4] w-40 rounded-xl bg-stone-200" />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 basis-64 flex-col gap-3">
                  <div>
                    <h2 className="text-xl font-bold leading-tight text-stone-900">{title(current.listing)}</h2>
                    <p className="mt-1 text-sm text-stone-700">
                      {[typeLabel(current.listing, "en"), placeOf(current.listing), current.listing.purpose, priceText(current.listing, "en")].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {current.reasons.length === 0 && <span className={chip}>In rotation</span>}
                    {current.reasons.map((r) => (
                      <span key={r.text} className={chip}>{r.text}</span>
                    ))}
                  </div>
                  <p className="text-sm text-stone-700">
                    Shared {current.timesShared} time{current.timesShared === 1 ? "" : "s"}, last {agoText(current.daysSince)}.
                    {current.todo.length > 0 && current.doneOn.length > 0 && (
                      <> Not yet on: <b>{current.todo.map((p) => PLATFORM_LABEL[p]).join(", ")}</b>.</>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/listings/${current.listing.id}?tab=share`} className={`${btnPri} inline-flex items-center`}>Open video and share</Link>
                    <Link href={`/listings/${current.listing.id}?tab=video`} className={`${btn} inline-flex items-center`}>Make a video</Link>
                    <button type="button" className={btn} onClick={another} disabled={pool.length < 2}>Pick another listing</button>
                  </div>
                  <p className="text-xs text-stone-600">The video and poster are made in the listing&apos;s Video and Design tabs. This page only suggests and remembers.</p>
                </div>
              </div>
            )}
          </section>

          {/* CAPTIONS PER APP */}
          {current && (
            <section className={card}>
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-stone-900">Post it on</h2>
                <div className="flex gap-2" role="group" aria-label="Caption language">
                  {LANGS.map((l) => (
                    <button key={l.id} type="button" onClick={() => setLangChoice(l.id)} aria-pressed={langChoice === l.id}
                      className={`min-h-10 rounded-lg border px-3 text-sm font-semibold ${langChoice === l.id ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 bg-white text-stone-900"}`}>
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mb-3 text-sm text-stone-600">Auto uses Chinese for Red Book and Douyin, English for the rest. Edit the caption before you copy it if you like.</p>
              <div className="flex flex-col">
                {PLATFORMS.map((p) => {
                  const l = lang(p);
                  const key = `${current.listing.id}-${p}-${l}`;
                  const text = edited[key] ?? captionFor(current.listing, p, l);
                  const posted = isPosted({ id: current.listing.id }, p);
                  const done = current.doneOn.includes(p);
                  return (
                    <div key={p} className="border-t border-stone-200 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="min-w-0 flex-1 basis-40">
                          <div className="text-base font-bold text-stone-900">{PLATFORM_LABEL[p]}</div>
                          <div className="text-xs text-stone-600">{done ? "Shared here before" : "Not shared here yet"}</div>
                        </div>
                        <button type="button" className={btn} onClick={() => copy(key, text)}>Copy caption</button>
                        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-stone-900">
                          <input type="checkbox" className="h-5 w-5 accent-[var(--copper)]" checked={posted} disabled={!historyReady || busyKey === `${current.listing.id}-${p}`}
                            onChange={() => toggle({ id: current.listing.id }, p, l)} />
                          Posted
                        </label>
                      </div>
                      <details className="mt-1">
                        <summary className="cursor-pointer text-xs font-semibold text-[var(--copper)]">Show and edit caption</summary>
                        <textarea value={text} onChange={(e) => setEdited((cur) => ({ ...cur, [key]: e.target.value }))} rows={7}
                          className="mt-2 w-full rounded-lg border border-stone-300 p-3 text-sm text-stone-900" aria-label={`${PLATFORM_LABEL[p]} caption`} />
                      </details>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* IDEA */}
          <section className={card}>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className={`${cap} mb-0`}>{slot.kind === "listing" ? "Or post an idea instead" : "Idea for today"}</p>
              <button type="button" className={btn} onClick={anotherIdea}>Another idea</button>
            </div>
            <h2 className="text-lg font-bold text-stone-900">{idea.title}</h2>
            <p className="mt-1 text-sm text-stone-700">{idea.how}</p>
            {idea.link && (
              <p className="mt-1 text-sm text-stone-700">
                Link to show: <b>maxproperty.my{idea.link}</b>
              </p>
            )}
            <p className="mt-1 text-xs text-stone-600">
              Last used: {agoText(history.filter((h) => h.idea_key === idea.key).reduce<number | null>((m, h) => {
                const d = Math.floor((now - Date.parse(h.shared_at)) / 86_400_000);
                return m === null ? d : Math.min(m, d);
              }, null))}
              . Read the caption before you post: it is a general point, not legal or financial advice.
            </p>
            <div className="mt-3 flex flex-col">
              {(["en", "ms", "zh"] as Lang[]).map((l) => {
                const key = `idea-${idea.key}-${l}`;
                const text = edited[key] ?? idea.caption[l];
                return (
                  <details key={l} className="border-t border-stone-200 py-2" open={l === "en"}>
                    <summary className="cursor-pointer text-sm font-semibold text-stone-900">{l === "en" ? "English" : l === "ms" ? "Bahasa Melayu" : "中文"} caption</summary>
                    <textarea value={text} onChange={(e) => setEdited((cur) => ({ ...cur, [key]: e.target.value }))} rows={9}
                      className="mt-2 w-full rounded-lg border border-stone-300 p-3 text-sm text-stone-900" aria-label={`Idea caption ${l}`} />
                    <button type="button" className={`${btn} mt-2`} onClick={() => copy(key, text)}>Copy {l === "en" ? "English" : l === "ms" ? "BM" : "中文"} caption</button>
                  </details>
                );
              })}
            </div>
            <div className="mt-3">
              <p className={cap}>Posted on</p>
              <div className="flex flex-wrap gap-x-5">
                {PLATFORMS.map((p) => (
                  <label key={p} className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-stone-900">
                    <input type="checkbox" className="h-5 w-5 accent-[var(--copper)]" checked={isPosted({ ideaKey: idea.key }, p)}
                      disabled={!historyReady || busyKey === `${idea.key}-${p}`} onChange={() => toggle({ ideaKey: idea.key }, p, lang(p))} />
                    {PLATFORM_LABEL[p]}
                  </label>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-5">
          <section className={card}>
            <h2 className="mb-1 text-lg font-bold text-stone-900">This week&apos;s plan</h2>
            <div className="mt-2 flex flex-col">
              {WEEK_PLAN.map((d, i) => (
                <div key={d.day} className={`flex justify-between gap-3 border-t border-stone-200 py-2 text-sm ${i === todayIndex ? "font-bold text-stone-900" : "text-stone-700"}`}>
                  <span>{d.day}{i === todayIndex ? " (today)" : ""}</span>
                  <span>{d.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className={card}>
            <h2 className="text-lg font-bold text-stone-900">Old listings, longest unshared first</h2>
            <p className="mb-2 text-sm text-stone-600">Tap one to make it today&apos;s listing.</p>
            {old.length === 0 && <p className="text-sm text-stone-700">No listing is ready yet.</p>}
            <div className="flex flex-col">
              {old.map((r) => (
                <button key={r.listing.id} type="button" onClick={() => setSelectedId(r.listing.id)}
                  className={`border-t border-stone-200 py-2 text-left ${current?.listing.id === r.listing.id ? "bg-[#fffaf3]" : ""}`}>
                  <div className="text-sm font-semibold text-stone-900">{title(r.listing)}</div>
                  <div className="text-xs text-stone-600">
                    {r.daysSince === null ? "Never shared" : `Last shared ${agoText(r.daysSince)}`} · {r.timesShared}x
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className={card}>
            <h2 className="mb-2 text-lg font-bold text-stone-900">Recent shares</h2>
            {recent.length === 0 && <p className="text-sm text-stone-700">Nothing ticked yet. Tick Posted after you share.</p>}
            <div className="flex flex-col">
              {recent.map((h, i) => {
                const l = h.property_id != null ? lookup.get(h.property_id) : null;
                const what = l ? title(l) : h.idea_key ? IDEAS.find((x) => x.key === h.idea_key)?.title ?? "Idea" : `Listing ${h.property_id}`;
                const days = Math.max(0, Math.floor((now - Date.parse(h.shared_at)) / 86_400_000));
                return (
                  <div key={h.id ?? i} className="border-t border-stone-200 py-2">
                    <div className="text-sm font-semibold text-stone-900">{what}</div>
                    <div className="text-xs text-stone-600">{PLATFORM_LABEL[h.platform as SharePlatform] ?? h.platform} · {agoText(days)}</div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
