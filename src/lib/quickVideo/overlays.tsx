import { ImageResponse } from "next/og";
import { FONT_JAKARTA600, FONT_JAKARTA800, FONT_PLAYFAIR700, LOGO_PNG } from "./assets.generated";
import { HEIGHT, WIDTH, type EndCopy, type OpeningCopy } from "./plan";

/*
| The words drawn on top of the photos, as transparent PNGs. They use the same
| fonts and logo as the website, so every video looks like Max Property.
| (Satori draws these: only flexbox and plain CSS.)
*/

const GOLD = "#D4AF37";
const CREAM = "#F4EFE4";

const toBuffer = (b64: string) => {
  const buf = Buffer.from(b64, "base64");
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
};

const FONTS = [
  { name: "PF", data: toBuffer(FONT_PLAYFAIR700), weight: 700 as const, style: "normal" as const },
  { name: "PJ", data: toBuffer(FONT_JAKARTA600), weight: 600 as const, style: "normal" as const },
  { name: "PJ", data: toBuffer(FONT_JAKARTA800), weight: 800 as const, style: "normal" as const },
];

async function png(element: React.ReactElement): Promise<Buffer> {
  const res = new ImageResponse(element, { width: WIDTH, height: HEIGHT, fonts: FONTS });
  return Buffer.from(await res.arrayBuffer());
}

function Header({ tag }: { tag?: string }) {
  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: WIDTH, height: 260, display: "flex", backgroundImage: "linear-gradient(180deg, rgba(6,6,7,0.55), rgba(6,6,7,0))" }}>
      <div style={{ position: "absolute", top: 44, left: 44, display: "flex", alignItems: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_PNG} height={44} width={64} alt="" />
        <div style={{ display: "flex", marginLeft: 12, fontFamily: "PF", fontWeight: 700, fontSize: 30, color: CREAM }}>Max Property</div>
      </div>
      {tag ? (
        <div style={{ position: "absolute", top: 50, right: 44, display: "flex", border: `2px solid ${GOLD}`, color: GOLD, backgroundColor: "rgba(10,10,11,0.6)", fontFamily: "PJ", fontWeight: 800, fontSize: 22, letterSpacing: 3, padding: "10px 22px", borderRadius: 99 }}>
          {tag}
        </div>
      ) : null}
    </div>
  );
}

function Shade() {
  return (
    <div style={{ position: "absolute", left: 0, bottom: 0, width: WIDTH, height: 520, display: "flex", backgroundImage: "linear-gradient(0deg, rgba(6,6,7,0.88), rgba(6,6,7,0.55) 55%, rgba(6,6,7,0))" }} />
  );
}

export function openingOverlay(copy: OpeningCopy) {
  return png(
    <div style={{ width: WIDTH, height: HEIGHT, display: "flex", position: "relative" }}>
      <Header tag={copy.tag} />
      <Shade />
      <div style={{ position: "absolute", left: 48, width: WIDTH - 96, bottom: 120, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", width: 72, height: 4, backgroundColor: GOLD, borderRadius: 2, marginBottom: 22 }} />
        <div style={{ display: "flex", fontFamily: "PF", fontWeight: 700, fontSize: copy.title.length > 26 ? 58 : 70, lineHeight: 1.08, color: CREAM }}>{copy.title}</div>
        {copy.sub ? <div style={{ display: "flex", marginTop: 18, fontFamily: "PJ", fontWeight: 600, fontSize: 30, color: "#E9D9A6" }}>{copy.sub}</div> : null}
      </div>
    </div>
  );
}

export function roomOverlay(label: string) {
  return png(
    <div style={{ width: WIDTH, height: HEIGHT, display: "flex", position: "relative" }}>
      <Header />
      {label ? (
        <>
          <Shade />
          <div style={{ position: "absolute", left: 48, width: WIDTH - 96, bottom: 120, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", width: 72, height: 4, backgroundColor: GOLD, borderRadius: 2, marginBottom: 22 }} />
            <div style={{ display: "flex", fontFamily: "PF", fontWeight: 700, fontSize: 56, lineHeight: 1.1, color: CREAM }}>{label}</div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function endCard(copy: EndCopy) {
  return png(
    <div style={{ width: WIDTH, height: HEIGHT, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, backgroundColor: "#0A0A0B", backgroundImage: "radial-gradient(circle at 50% 30%, #1d1a10, #0A0A0B 62%)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_PNG} height={120} width={174} alt="" />
      <div style={{ display: "flex", marginTop: 22, fontFamily: "PF", fontWeight: 700, fontSize: 64, color: GOLD }}>Max Property</div>
      <div style={{ display: "flex", marginTop: 18, fontFamily: "PJ", fontWeight: 600, fontSize: 34, color: "#D8D2C4", textAlign: "center" }}>{copy.heading}</div>
      <div style={{ display: "flex", marginTop: 32, backgroundColor: "#1FA855", color: "#07140C", fontFamily: "PJ", fontWeight: 800, fontSize: 36, padding: "22px 40px", borderRadius: 20 }}>{copy.whatsapp}</div>
      {copy.ren ? <div style={{ display: "flex", marginTop: 28, fontFamily: "PJ", fontWeight: 600, fontSize: 26, color: "#A7A092", textAlign: "center" }}>{copy.ren}</div> : null}
      <div style={{ display: "flex", marginTop: 14, fontFamily: "PJ", fontWeight: 800, fontSize: 34, color: GOLD }}>{copy.site}</div>
    </div>
  );
}
