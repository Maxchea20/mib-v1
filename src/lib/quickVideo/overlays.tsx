import { ImageResponse } from "next/og";
import { FONT_JAKARTA600, FONT_JAKARTA800, FONT_PLAYFAIR700, LOGO_PNG } from "./assets.generated";
import { WIDTH, type EndCopy, type FactsCopy, type OpeningCopy, type VideoLang } from "./plan";

/*
| The words drawn on the video, as transparent pictures, in the same fonts and colours as the
| website. EVERYTHING is drawn in ONE pass onto a tall sheet and then cut into slices: loading
| the fonts (the Chinese one is large) is the slow part, so it must happen only once per video.
|
|   header   brand at the top of every photo scene
|   opening  FOR SALE tag, title, price and place
|   label    one small band per room label
|   facts    the "at a glance" card
|   end      closing card: WhatsApp, REN, website
*/

const GOLD = "#D4AF37";
const CREAM = "#F4EFE4";
const SOFT = "#E9D9A6";
const MUTED = "#A7A092";

export const HEADER_H = 100;
export const OPENING_H = 330;
export const LABEL_H = 170;
export const FACTS_H = 1200;
export const END_H = 1200;

export type Slice = { top: number; height: number };
export type SheetSpec = {
  lang: VideoLang;
  opening: OpeningCopy;
  /** One entry per label band (empty labels get no band). */
  labels: string[];
  facts: FactsCopy | null;
  end: EndCopy;
};
export type SheetLayout = { header: Slice; opening: Slice; labels: Slice[]; facts: Slice | null; end: Slice };

type Font = { name: string; data: ArrayBuffer; weight: 400 | 600 | 700 | 800; style: "normal" };

const toBuffer = (b64: string) => {
  const buf = Buffer.from(b64, "base64");
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
};

let baseFonts: Font[] | null = null;
let zhFonts: Font[] | null = null;

async function fontsFor(lang: VideoLang): Promise<Font[]> {
  baseFonts ??= [
    { name: "PF", data: toBuffer(FONT_PLAYFAIR700), weight: 700, style: "normal" },
    { name: "PJ", data: toBuffer(FONT_JAKARTA600), weight: 600, style: "normal" },
    { name: "PJ", data: toBuffer(FONT_JAKARTA800), weight: 800, style: "normal" },
  ];
  if (lang !== "zh") return baseFonts;
  if (!zhFonts) {
    // Only loaded when a video is made in Chinese.
    const { FONT_ZH, FONT_ZH_LATIN } = await import("./assets.zh.generated");
    zhFonts = [
      { name: "ZH", data: toBuffer(FONT_ZH), weight: 700, style: "normal" },
      { name: "ZH", data: toBuffer(FONT_ZH_LATIN), weight: 700, style: "normal" },
    ];
  }
  return [...baseFonts, ...zhFonts];
}

export async function renderSheet(spec: SheetSpec): Promise<{ png: Buffer; layout: SheetLayout }> {
  const zh = spec.lang === "zh";
  // Heading and body fonts: Playfair + Jakarta for English / Malay, Noto Sans SC for Chinese.
  const head = zh ? "ZH" : "PF";
  const body = zh ? "ZH" : "PJ";
  const w700 = 700 as const;
  const w600 = zh ? 700 : (600 as const);
  const w800 = zh ? 700 : (800 as const);
  const caps = zh ? "none" : ("uppercase" as const);

  const layout: SheetLayout = { header: { top: 0, height: HEADER_H }, opening: { top: 0, height: OPENING_H }, labels: [], facts: null, end: { top: 0, height: END_H } };
  let y = 0;
  layout.header.top = y; y += HEADER_H;
  layout.opening.top = y; y += OPENING_H;
  spec.labels.forEach(() => { layout.labels.push({ top: y, height: LABEL_H }); y += LABEL_H; });
  if (spec.facts) { layout.facts = { top: y, height: FACTS_H }; y += FACTS_H; }
  layout.end.top = y; y += END_H;
  const total = y;

  const o = spec.opening;
  const titleSize = Array.from(o.title).length > 24 ? 60 : 72;

  const element = (
    <div style={{ width: WIDTH, height: total, display: "flex", flexDirection: "column" }}>
      {/* header */}
      <div style={{ width: WIDTH, height: HEADER_H, display: "flex", alignItems: "center", paddingLeft: 60 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_PNG} width={96} height={66} alt="" />
        <div style={{ display: "flex", marginLeft: 18, fontFamily: "PF", fontWeight: 700, fontSize: 42, color: CREAM }}>Max Property</div>
      </div>

      {/* opening */}
      <div style={{ width: WIDTH, height: OPENING_H, display: "flex", flexDirection: "column", paddingLeft: 60, paddingRight: 60 }}>
        <div style={{ display: "flex" }}>
          <div style={{ display: "flex", border: `3px solid ${GOLD}`, color: GOLD, backgroundColor: "rgba(10,10,11,0.65)", fontFamily: body, fontWeight: w800, fontSize: 28, letterSpacing: zh ? 4 : 5, padding: "8px 26px", borderRadius: 99 }}>{o.tag}</div>
        </div>
        <div style={{ display: "flex", marginTop: 20, fontFamily: head, fontWeight: w700, fontSize: titleSize, lineHeight: 1.12, color: CREAM }}>{o.title}</div>
        {o.sub ? <div style={{ display: "flex", marginTop: 14, fontFamily: body, fontWeight: w600, fontSize: 34, color: SOFT }}>{o.sub}</div> : null}
      </div>

      {/* room labels */}
      {spec.labels.map((label, i) => (
        <div key={i} style={{ width: WIDTH, height: LABEL_H, display: "flex", flexDirection: "column", paddingLeft: 60, paddingRight: 60 }}>
          <div style={{ display: "flex", width: 84, height: 6, backgroundColor: GOLD, borderRadius: 3, marginBottom: 20, marginTop: 20 }} />
          <div style={{ display: "flex", fontFamily: head, fontWeight: w700, fontSize: Array.from(label).length > 16 ? 50 : 64, lineHeight: 1.12, color: CREAM }}>{label}</div>
        </div>
      ))}

      {/* facts card */}
      {spec.facts ? (
        <div style={{ width: WIDTH, height: FACTS_H, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", width: 940, padding: 56, borderRadius: 36, backgroundColor: "rgba(10,10,11,0.74)", border: "2px solid rgba(212,175,55,0.55)" }}>
            <div style={{ display: "flex", width: 84, height: 6, backgroundColor: GOLD, borderRadius: 3, marginBottom: 22 }} />
            <div style={{ display: "flex", fontFamily: body, fontWeight: w800, fontSize: 34, letterSpacing: zh ? 6 : 7, textTransform: caps, color: GOLD, marginBottom: 12 }}>{spec.facts.heading}</div>
            {spec.facts.rows.map((r, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", paddingTop: 24, paddingBottom: 22, borderTop: i === 0 ? "0px solid transparent" : "1px solid rgba(244,239,228,0.18)" }}>
                <div style={{ display: "flex", fontFamily: body, fontWeight: w600, fontSize: 28, letterSpacing: zh ? 3 : 4, textTransform: caps, color: MUTED }}>{r.label}</div>
                <div style={{ display: "flex", marginTop: 6, fontFamily: r.big ? head : body, fontWeight: r.big ? w700 : w600, fontSize: r.big ? 84 : Array.from(r.value).length > 22 ? 42 : 54, lineHeight: 1.12, color: r.big ? GOLD : CREAM }}>{r.value}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* end card */}
      <div style={{ width: WIDTH, height: END_H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingLeft: 60, paddingRight: 60 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_PNG} width={218} height={150} alt="" />
        <div style={{ display: "flex", marginTop: 28, fontFamily: "PF", fontWeight: 700, fontSize: 84, color: GOLD }}>Max Property</div>
        <div style={{ display: "flex", marginTop: 26, fontFamily: body, fontWeight: w600, fontSize: 46, color: "#D8D2C4", textAlign: "center" }}>{spec.end.heading}</div>
        <div style={{ display: "flex", marginTop: 46, backgroundColor: "#1FA855", color: "#07140C", fontFamily: "PJ", fontWeight: 800, fontSize: 46, padding: "26px 54px", borderRadius: 28 }}>{spec.end.whatsapp}</div>
        {spec.end.ren ? <div style={{ display: "flex", marginTop: 40, fontFamily: body, fontWeight: w600, fontSize: 30, color: MUTED, textAlign: "center" }}>{spec.end.ren}</div> : null}
        <div style={{ display: "flex", marginTop: 20, fontFamily: "PJ", fontWeight: 800, fontSize: 44, color: GOLD }}>{spec.end.site}</div>
      </div>
    </div>
  );

  const res = new ImageResponse(element, { width: WIDTH, height: total, fonts: await fontsFor(spec.lang) });
  return { png: Buffer.from(await res.arrayBuffer()), layout };
}
