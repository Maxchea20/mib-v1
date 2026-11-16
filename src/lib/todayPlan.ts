import { isLiveOnWebsite, type ShareListing } from "./shareKit";

/*
|--------------------------------------------------------------------------
| TODAY PLAN (pure functions, unit-tested)
|--------------------------------------------------------------------------
|
| Decides what to share today, with fixed rules and no AI:
|   - which listing (old and never-shared ones first, new ones get a boost,
|     buyer matches help, anything shared in the last 3 days waits)
|   - which platforms that listing has NOT been shared on yet
|   - which tip idea to use on a day without a listing
|
| Everything uses the share history, so the rotation fixes itself.
|
*/

export const PLATFORMS = ["instagram", "tiktok", "threads", "xiaohongshu", "douyin", "facebook"] as const;
export type SharePlatform = (typeof PLATFORMS)[number];

export const PLATFORM_LABEL: Record<SharePlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  threads: "Threads",
  xiaohongshu: "Red Book",
  douyin: "Douyin",
  facebook: "Facebook",
};

/** One line of the share history. */
export type ShareEntry = { property_id: number | null; idea_key: string | null; platform: string; shared_at: string };

export type PlanListing = ShareListing & {
  id: number;
  created_at?: string | null;
  photoCount: number;
  /** How many buyers in MIB match this listing (match score 60 or more). */
  matches: number;
};

export type Reason = { kind: "never" | "stale" | "new" | "buyers" | "cooldown"; text: string };

export type Ranked<T extends PlanListing = PlanListing> = {
  listing: T;
  score: number;
  reasons: Reason[];
  /** Whole days since it was last shared, or null if it never was. */
  daysSince: number | null;
  /** Times shared (all platforms). */
  timesShared: number;
  /** Platforms it has been shared on, and the ones it has not. */
  doneOn: SharePlatform[];
  todo: SharePlatform[];
  /** Shared in the last COOLDOWN_DAYS days: not suggested yet. */
  cooling: boolean;
};

export const DAY_MS = 86_400_000;
export const COOLDOWN_DAYS = 3;
export const NEW_DAYS = 7;
export const MIN_PHOTOS = 3;

/** Malaysia time is UTC+8 all year. */
export const MY_OFFSET_MS = 8 * 3_600_000;

/** Midnight (Malaysia time) that starts the day containing `now`, as a UTC timestamp. */
export function startOfMyDay(now: number): number {
  const local = now + MY_OFFSET_MS;
  return local - (((local % DAY_MS) + DAY_MS) % DAY_MS) - MY_OFFSET_MS;
}

/** Monday 00:00 (Malaysia time) of the week containing `now`. */
export function startOfMyWeek(now: number): number {
  const day = startOfMyDay(now);
  const dow = new Date(day + MY_OFFSET_MS).getUTCDay(); // 0 = Sunday
  return day - ((dow + 6) % 7) * DAY_MS;
}

export function isEligible(l: PlanListing): boolean {
  return isLiveOnWebsite(l) && l.status === "Available" && l.photoCount >= MIN_PHOTOS;
}

/** Score every eligible listing; best first. Listings in their cool-down go to the end. */
export function rankListings<T extends PlanListing>(listings: T[], history: ShareEntry[], now: number): Ranked<T>[] {
  const byListing = new Map<number, ShareEntry[]>();
  for (const h of history) {
    if (h.property_id == null) continue;
    const arr = byListing.get(h.property_id) ?? [];
    arr.push(h);
    byListing.set(h.property_id, arr);
  }

  const ranked: Ranked<T>[] = listings.filter(isEligible).map((listing) => {
    const rows = byListing.get(listing.id) ?? [];
    const last = rows.reduce((m, r) => Math.max(m, Date.parse(r.shared_at) || 0), 0);
    const daysSince = rows.length === 0 ? null : Math.max(0, Math.floor((now - last) / DAY_MS));
    const doneOn = PLATFORMS.filter((p) => rows.some((r) => r.platform === p));
    const todo = PLATFORMS.filter((p) => !doneOn.includes(p));
    const cooling = daysSince !== null && daysSince < COOLDOWN_DAYS;

    const reasons: Reason[] = [];
    let score = 0;

    if (daysSince === null) {
      score += 80;
      reasons.push({ kind: "never", text: "Never shared" });
    } else {
      score += Math.min(daysSince, 90) * 0.8;
      if (daysSince >= 7) reasons.push({ kind: "stale", text: `Not shared in ${daysSince} days` });
    }

    const created = Date.parse(listing.created_at ?? "");
    if (Number.isFinite(created) && now - created <= NEW_DAYS * DAY_MS && now >= created) {
      score += 35;
      reasons.push({ kind: "new", text: "New this week" });
    }

    if (listing.matches > 0) {
      score += Math.min(listing.matches, 5) * 4;
      reasons.push({ kind: "buyers", text: `Matches ${listing.matches} buyer${listing.matches === 1 ? "" : "s"}` });
    }

    if (cooling) {
      score -= 1000;
      reasons.push({ kind: "cooldown", text: daysSince === 0 ? "Shared today" : `Shared ${daysSince} day${daysSince === 1 ? "" : "s"} ago` });
    }

    return { listing, score, reasons, daysSince, timesShared: rows.length, doneOn, todo, cooling };
  });

  // best score first; ties: the one shared least recently, then the lower id (stable)
  return ranked.sort((a, b) => b.score - a.score || (b.daysSince ?? 1e9) - (a.daysSince ?? 1e9) || a.listing.id - b.listing.id);
}

/** Listings oldest-shared first (never-shared first). For the "old listings" view. */
export function oldestFirst<T extends PlanListing>(ranked: Ranked<T>[]): Ranked<T>[] {
  return [...ranked].sort((a, b) => (b.daysSince ?? 1e9) - (a.daysSince ?? 1e9) || a.listing.id - b.listing.id);
}

/* ---------------------------------------------------------------- week plan */

export type DayKind = "listing" | "idea" | "rest";
export const WEEK_PLAN: { day: string; kind: DayKind; label: string }[] = [
  { day: "Mon", kind: "listing", label: "Listing video" },
  { day: "Tue", kind: "idea", label: "Tip or idea" },
  { day: "Wed", kind: "listing", label: "Listing video" },
  { day: "Thu", kind: "listing", label: "New or old listing" },
  { day: "Fri", kind: "listing", label: "Listing video" },
  { day: "Sat", kind: "idea", label: "Area or idea" },
  { day: "Sun", kind: "rest", label: "Rest (or catch up)" },
];

/** Today's slot in the week plan (Malaysia time). */
export function todaySlot(now: number): { index: number; slot: (typeof WEEK_PLAN)[number] } {
  const dow = new Date(startOfMyDay(now) + MY_OFFSET_MS).getUTCDay();
  const index = (dow + 6) % 7;
  return { index, slot: WEEK_PLAN[index] };
}

/* -------------------------------------------------------------------- ideas */

export type Idea = {
  key: string;
  title: string;
  /** Short note on how to film or present it. */
  how: string;
  caption: { en: string; ms: string; zh: string };
  /** A page on the public site that backs the idea up. */
  link?: string;
};

/*
| General, safe points only. No legal, tax or financial advice: each caption points
| people to confirm the details with a lawyer, the bank or the official source.
*/
export const IDEAS: Idea[] = [
  {
    key: "freehold-leasehold",
    title: "Freehold vs leasehold in one minute",
    how: "Talk to the camera, or three text slides. One sentence each.",
    caption: {
      en: "Freehold vs leasehold 🏡\n\nFreehold: you own the land with no expiry date.\nLeasehold: the land is held for a fixed number of years, and what happens after depends on the lease terms.\n\nAlways check the title and conditions with your lawyer before buying.\n\nQuestions? Message Max on WhatsApp.",
      ms: "Pegangan bebas vs pajakan 🏡\n\nPegangan bebas: tanah milik anda tanpa tarikh tamat.\nPajakan: tanah dipegang untuk tempoh tertentu, dan selepas itu bergantung pada syarat pajakan.\n\nSemak hak milik dan syarat dengan peguam anda sebelum membeli.\n\nAda soalan? Mesej Max di WhatsApp.",
      zh: "永久地契 vs 租赁地契 🏡\n\n永久地契：土地归你所有，没有期限。\n租赁地契：土地只拥有固定年限，到期后要看租约条款。\n\n购买前请和你的律师确认地契及条款。\n\n有问题？WhatsApp 联系 Max。",
    },
  },
  {
    key: "light-industrial-logistics",
    title: "Light industrial vs logistics: what is the difference?",
    how: "Two photos side by side (a factory and a warehouse) with text.",
    caption: {
      en: "Looking for a factory or warehouse? 🏭\n\nLight industrial is for making, assembling or packing goods. Logistics is for storing and moving goods.\n\nThe approved use of the building matters, so check it before you rent or buy.\n\nTell Max what you need and I will shortlist for you.",
      ms: "Cari kilang atau gudang? 🏭\n\nPerindustrian ringan untuk membuat, memasang atau membungkus barang. Logistik untuk menyimpan dan mengangkut barang.\n\nKegunaan yang diluluskan bagi bangunan itu penting, jadi semak sebelum menyewa atau membeli.\n\nBeritahu Max keperluan anda dan saya senaraikan pilihan.",
      zh: "在找厂房或仓库？🏭\n\n轻工业用于生产、组装或包装货物；物流用于仓储和运输货物。\n\n建筑物核准的用途很重要，租或买之前请先确认。\n\n告诉 Max 你的需求，我帮你筛选。",
    },
  },
  {
    key: "factory-checklist",
    title: "5 things to check before renting a factory",
    how: "Text slides over factory photos, one point per slide.",
    caption: {
      en: "5 things to check before renting a factory ✅\n\n1. Approved use of the building\n2. Power supply (TNB capacity)\n3. Floor loading and ceiling height\n4. Truck access and loading bay\n5. Lease term and renewal terms\n\nNeed help? Message Max on WhatsApp.",
      ms: "5 perkara untuk disemak sebelum menyewa kilang ✅\n\n1. Kegunaan bangunan yang diluluskan\n2. Bekalan elektrik (kapasiti TNB)\n3. Beban lantai dan ketinggian siling\n4. Akses lori dan ruang memunggah\n5. Tempoh sewa dan syarat pembaharuan\n\nPerlukan bantuan? Mesej Max di WhatsApp.",
      zh: "租厂房前要检查的 5 件事 ✅\n\n1. 建筑物核准用途\n2. 电力供应（TNB 容量）\n3. 地板承重和天花板高度\n4. 货车进出和装卸区\n5. 租期和续租条款\n\n需要协助？WhatsApp 联系 Max。",
    },
  },
  {
    key: "buying-costs",
    title: "Costs buyers often forget",
    how: "Text slides, then show the calculator page on maxproperty.my.",
    caption: {
      en: "Buying a property? Budget for more than the price 💡\n\nLegal fees, stamp duty and other costs add up. Use the free calculator on maxproperty.my to estimate the total, and confirm the final figures with your lawyer.\n\nMessage Max if you want help.",
      ms: "Nak beli hartanah? Sediakan bajet lebih daripada harga 💡\n\nYuran guaman, duti setem dan kos lain boleh bertambah. Guna kalkulator percuma di maxproperty.my untuk anggaran jumlah, dan sahkan angka akhir dengan peguam.\n\nMesej Max jika perlukan bantuan.",
      zh: "要买房？预算不只是房价 💡\n\n律师费、印花税和其他费用加起来不少。用 maxproperty.my 的免费计算器估算总额，最终数字请和律师确认。\n\n需要协助请联系 Max。",
    },
    link: "/calculators/purchase-cost",
  },
  {
    key: "loan-dsr",
    title: "Can you get the loan? Check your DSR",
    how: "Talk to the camera or text slides. Show the DSR calculator.",
    caption: {
      en: "Before you view houses, check your DSR 🔢\n\nBanks look at how much of your income already goes to debt payments. Try the free DSR calculator on maxproperty.my for a quick idea. The bank makes the final decision.\n\nMessage Max if you have questions.",
      ms: "Sebelum melawat rumah, semak DSR anda 🔢\n\nBank melihat berapa banyak pendapatan anda sudah digunakan untuk bayaran hutang. Cuba kalkulator DSR percuma di maxproperty.my untuk gambaran awal. Bank membuat keputusan akhir.\n\nAda soalan? Mesej Max.",
      zh: "看房之前，先检查你的 DSR 🔢\n\n银行会看你收入中已有多少用来还债。可用 maxproperty.my 的免费 DSR 计算器快速了解，最终由银行决定。\n\n有问题请联系 Max。",
    },
    link: "/calculators/dsr",
  },
  {
    key: "rental-yield",
    title: "Is this a good rental investment? Rental yield",
    how: "Text slides with an example, then the calculator page.",
    caption: {
      en: "Buying to rent out? Check the rental yield 📈\n\nYield compares the yearly rent with the price. Use the free calculator on maxproperty.my and check the numbers with your own costs.\n\nMessage Max to discuss options.",
      ms: "Beli untuk disewakan? Semak hasil sewa 📈\n\nHasil sewa membandingkan sewa tahunan dengan harga. Guna kalkulator percuma di maxproperty.my dan semak dengan kos anda sendiri.\n\nMesej Max untuk bincang pilihan.",
      zh: "买来出租？先看租金回报率 📈\n\n回报率是把年租金和房价相比。可用 maxproperty.my 的免费计算器，并加入你自己的成本再核对。\n\n想了解选择请联系 Max。",
    },
    link: "/calculators/rental-yield",
  },
  {
    key: "area-spotlight",
    title: "Area spotlight: living in an Ipoh neighbourhood",
    how: "Film 3 to 5 short clips around the area: food, school, road, park. Say the name of the area.",
    caption: {
      en: "Living in [AREA NAME], Ipoh 📍\n\n[Food you like nearby]\n[Schools or shops nearby]\n[How easy to reach the highway or town]\n\nLooking for a home or business space here? Message Max on WhatsApp.",
      ms: "Tinggal di [NAMA KAWASAN], Ipoh 📍\n\n[Makanan kegemaran berdekatan]\n[Sekolah atau kedai berdekatan]\n[Mudah ke lebuh raya atau bandar]\n\nCari rumah atau ruang perniagaan di sini? Mesej Max di WhatsApp.",
      zh: "住在怡保 [区域名称] 📍\n\n[附近好吃的]\n[附近学校或商店]\n[到高速公路或市区方便吗]\n\n想在这里找住宅或商业空间？WhatsApp 联系 Max。",
    },
  },
  {
    key: "client-question",
    title: "Client question of the week",
    how: "Pick a real question you were asked (no names). Answer it in 30 seconds to the camera.",
    caption: {
      en: "Question I get asked a lot: [QUESTION] 🤔\n\nShort answer: [YOUR ANSWER]\n\nHave your own question? Message Max on WhatsApp.",
      ms: "Soalan yang sering ditanya: [SOALAN] 🤔\n\nJawapan ringkas: [JAWAPAN ANDA]\n\nAda soalan sendiri? Mesej Max di WhatsApp.",
      zh: "常被问到的问题：[问题] 🤔\n\n简单回答：[你的答案]\n\n有自己的问题？WhatsApp 联系 Max。",
    },
  },
  {
    key: "behind-the-scenes",
    title: "A day viewing properties (behind the scenes)",
    how: "Short clips of a viewing day. Show hands, keys and views, never a client's face or name.",
    caption: {
      en: "A day in the life of a property agent in Ipoh 🔑\n\nViewings, paperwork and a lot of driving. Looking for something specific? Tell Max and I will keep an eye out for you.",
      ms: "Sehari sebagai ejen hartanah di Ipoh 🔑\n\nLawatan, dokumen dan banyak memandu. Cari sesuatu yang khusus? Beritahu Max dan saya akan tolong carikan.",
      zh: "怡保地产经纪的一天 🔑\n\n看房、办文件，还有很多时间在路上。想找特定类型？告诉 Max，我帮你留意。",
    },
  },
  {
    key: "sold-rented",
    title: "Sold or rented: a thank-you post",
    how: "Only with the client's OK. Show the keys or the house, no names, no private details.",
    caption: {
      en: "Another one done ✅ [Sold / Rented] in [AREA].\n\nThank you to the client for trusting me. Want to list your property or find your next one? Message Max on WhatsApp.",
      ms: "Satu lagi selesai ✅ [Terjual / Disewa] di [KAWASAN].\n\nTerima kasih kepada pelanggan kerana percaya kepada saya. Nak senaraikan hartanah anda atau cari yang seterusnya? Mesej Max di WhatsApp.",
      zh: "又完成一个 ✅ [已售出 / 已出租]，位于 [区域]。\n\n感谢客户的信任。想放盘或找下一个物业？WhatsApp 联系 Max。",
    },
  },
];

/** The idea that has not been used for the longest time (never used first). */
export function nextIdea(history: ShareEntry[], now: number): { idea: Idea; daysSince: number | null } {
  const last = new Map<string, number>();
  for (const h of history) {
    if (!h.idea_key) continue;
    last.set(h.idea_key, Math.max(last.get(h.idea_key) ?? 0, Date.parse(h.shared_at) || 0));
  }
  const scored = IDEAS.map((idea, i) => {
    const t = last.get(idea.key);
    return { idea, i, daysSince: t === undefined ? null : Math.floor((now - t) / DAY_MS) };
  });
  scored.sort((a, b) => (b.daysSince ?? 1e9) - (a.daysSince ?? 1e9) || a.i - b.i);
  return { idea: scored[0].idea, daysSince: scored[0].daysSince };
}

/** How many posts were ticked this week (Monday to Sunday, Malaysia time). */
export function postsThisWeek(history: ShareEntry[], now: number): number {
  const from = startOfMyWeek(now);
  return history.filter((h) => (Date.parse(h.shared_at) || 0) >= from).length;
}

/** "Never", "today", "3 days ago". */
export function agoText(daysSince: number | null): string {
  if (daysSince === null) return "never";
  if (daysSince === 0) return "today";
  if (daysSince === 1) return "yesterday";
  return `${daysSince} days ago`;
}
