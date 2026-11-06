import type { Metadata } from "next";
import LegalFeesCalculator from "@/components/site/calculators/LegalFeesCalculator";
import CalcPage, { calcMetadata } from "@/components/site/calculators/CalcPage";
import { requireLang } from "@/site/context";
import { ct } from "@/site/costText";

type Props = { params: Promise<{ lang: string }> };
const PATH = "/calculators/legal-fees";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = requireLang((await params).lang);
  const c = ct(lang);
  return calcMetadata(lang, PATH, c.llTitle, c.llIntro);
}

export default async function Page({ params }: Props) {
  const lang = requireLang((await params).lang);
  const c = ct(lang);
  return (
    <CalcPage
      lang={lang}
      path={PATH}
      title={c.llTitle}
      intro={c.llIntro}
      assumptionsTitle={c.llAssumeTitle}
      assumptions={[c.llAssume1, c.llAssume2, c.llAssume3, c.llAssume4, c.llAssume5, c.llAssume6, c.llAssume7]}
    >
      <LegalFeesCalculator lang={lang} />
    </CalcPage>
  );
}
