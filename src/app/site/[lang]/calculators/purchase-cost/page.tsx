import type { Metadata } from "next";
import PurchaseCostCalculator from "@/components/site/calculators/PurchaseCostCalculator";
import CalcPage, { calcMetadata } from "@/components/site/calculators/CalcPage";
import { requireLang } from "@/site/context";
import { ct } from "@/site/costText";

type Props = { params: Promise<{ lang: string }> };
const PATH = "/calculators/purchase-cost";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = requireLang((await params).lang);
  const c = ct(lang);
  return calcMetadata(lang, PATH, c.pcTitle, c.pcIntro);
}

export default async function Page({ params }: Props) {
  const lang = requireLang((await params).lang);
  const c = ct(lang);
  return (
    <CalcPage
      lang={lang}
      path={PATH}
      title={c.pcTitle}
      intro={c.pcIntro}
      assumptionsTitle={c.pcAssumeTitle}
      assumptions={[c.pcAssume1, c.pcAssume2, c.pcAssume3, c.pcAssume4, c.pcAssume5]}
    >
      <PurchaseCostCalculator lang={lang} />
    </CalcPage>
  );
}
