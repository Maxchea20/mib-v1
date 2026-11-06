import type { Metadata } from "next";
import RentalYieldCalculator from "@/components/site/calculators/RentalYieldCalculator";
import CalcPage, { calcMetadata } from "@/components/site/calculators/CalcPage";
import { requireLang } from "@/site/context";
import { ct } from "@/site/costText";

type Props = { params: Promise<{ lang: string }> };
const PATH = "/calculators/rental-yield";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = requireLang((await params).lang);
  const c = ct(lang);
  return calcMetadata(lang, PATH, c.ryTitle, c.ryIntro);
}

export default async function Page({ params }: Props) {
  const lang = requireLang((await params).lang);
  const c = ct(lang);
  return (
    <CalcPage
      lang={lang}
      path={PATH}
      title={c.ryTitle}
      intro={c.ryIntro}
      assumptionsTitle={c.ryAssumeTitle}
      assumptions={[c.ryAssume1, c.ryAssume2, c.ryAssume3, c.ryAssume4, c.ryAssume5, c.ryAssume6]}
    >
      <RentalYieldCalculator lang={lang} />
    </CalcPage>
  );
}
