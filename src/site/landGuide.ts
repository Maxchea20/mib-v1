import type { Lang } from "./i18n";

/*
| A short, general guide shown on the two land search pages (land for sale in
| Perak, industrial land in Perak), in all three languages. General information
| only: no prices, no promises, no place names that are not in the listings, and
| every guide ends by sending the reader to a lawyer and the local authority.
*/

export type GuideSection = { h: string; p: string };
export type LandGuide = { title: string; sections: GuideSection[]; note: string };

const LAND: Record<Lang, LandGuide> = {
  en: {
    title: "A short guide to buying land in Ipoh and Perak",
    sections: [
      { h: "Know the land category", p: "Every title carries a category of use, such as agriculture, building (residential or commercial) or industry. That category decides what the land is meant for. Agricultural land, for example, is not automatically allowed to have houses or a factory on it." },
      { h: "Freehold or leasehold", p: "Freehold land is held with no end date. Leasehold land is held for a fixed number of years, such as 99 years, and what happens when it ends depends on the lease terms. Some leasehold titles need the State Authority's consent before they can be transferred." },
      { h: "Check road access and utilities", p: "Ask whether the land has proper legal road access, not only a track, and whether water and electricity can be connected. If the land map shows a road reserve beside or through the land, ask who owns it and whether you can use it." },
      { h: "Changing how the land is used", p: "If you want to use the land differently from its category, such as farming land for a factory, you need approval from the authorities. It takes time and may involve fees, so ask before you buy, not after." },
      { h: "Budget for more than the price", p: "Plan for legal fees, stamp duty and any loan costs. The legal fees and stamp duty calculator and the total purchase cost calculator below give you an estimate." },
      { h: "Visit and verify", p: "Visit the land, check the boundaries against the title and a licensed surveyor's plan, and ask a lawyer to search the title before you pay a deposit." },
    ],
    note: "This is general information, not legal advice. Confirm every point with your lawyer and the local authority.",
  },
  ms: {
    title: "Panduan ringkas membeli tanah di Ipoh dan Perak",
    sections: [
      { h: "Kenali kategori tanah", p: "Setiap hak milik mempunyai kategori kegunaan, seperti pertanian, bangunan (kediaman atau komersial) atau perindustrian. Kategori itu menentukan tujuan tanah tersebut. Tanah pertanian, misalnya, tidak secara automatik dibenarkan dibina rumah atau kilang." },
      { h: "Pegangan bebas atau pajakan", p: "Tanah pegangan bebas dipegang tanpa tarikh tamat. Tanah pajakan dipegang untuk tempoh tertentu, seperti 99 tahun, dan apa yang berlaku selepas tamat bergantung pada syarat pajakan. Sesetengah hak milik pajakan memerlukan kebenaran Pihak Berkuasa Negeri sebelum boleh dipindah milik." },
      { h: "Semak akses jalan dan utiliti", p: "Tanya sama ada tanah itu mempunyai akses jalan yang sah, bukan sekadar lorong, dan sama ada bekalan air dan elektrik boleh disambungkan. Jika peta tanah menunjukkan rizab jalan bersebelahan atau melalui tanah itu, tanya siapa pemiliknya dan sama ada anda boleh menggunakannya." },
      { h: "Menukar kegunaan tanah", p: "Jika anda mahu menggunakan tanah berbeza daripada kategorinya, seperti tanah pertanian untuk kilang, anda memerlukan kelulusan pihak berkuasa. Ia mengambil masa dan mungkin melibatkan bayaran, jadi tanya sebelum membeli, bukan selepas." },
      { h: "Sediakan bajet melebihi harga", p: "Rancang untuk yuran guaman, duti setem dan kos pinjaman. Kalkulator yuran guaman dan duti setem serta kalkulator jumlah kos pembelian di bawah memberi anggaran." },
      { h: "Lawat dan sahkan", p: "Lawat tanah itu, semak sempadan berdasarkan hak milik dan pelan juruukur berlesen, dan minta peguam membuat carian hak milik sebelum anda membayar deposit." },
    ],
    note: "Ini maklumat umum, bukan nasihat guaman. Sahkan setiap perkara dengan peguam anda dan pihak berkuasa tempatan.",
  },
  zh: {
    title: "怡保及霹雳购买土地简明指南",
    sections: [
      { h: "了解土地类别", p: "每张地契都注明用途类别，例如农业、建筑（住宅或商业）或工业。这个类别决定土地的用途。比如农业用地，并不自动允许兴建住宅或工厂。" },
      { h: "永久地契还是租赁地契", p: "永久地契没有期限。租赁地契有固定年限，例如 99 年，到期后如何处理要看租约条款。部分租赁地契在过户前需要州政府批准。" },
      { h: "检查道路出入和公用设施", p: "请问清楚土地是否有合法的道路出入，而不只是一条小路，以及水电是否可以接通。如果土地图上显示有道路保留地，请问清楚归谁所有，您是否可以使用。" },
      { h: "更改土地用途", p: "如果您想把土地用于与其类别不同的用途，例如把农地用来建工厂，需要得到有关当局的批准。这需要时间，也可能涉及费用，所以要在购买之前问清楚，而不是之后。" },
      { h: "预算不止是售价", p: "请预留律师费、印花税和贷款相关费用。下方的律师费及印花税计算器和购房总成本计算器可以提供估算。" },
      { h: "实地查看并核实", p: "亲自到土地看一看，对照地契和执照测量师的图则核对边界，并在付订金之前请律师查册。" },
    ],
    note: "以上为一般资料，不构成法律意见。请向您的律师和地方政府核实每一项。",
  },
};

const INDUSTRIAL: Record<Lang, LandGuide> = {
  en: {
    title: "A short guide to buying industrial land in Perak",
    sections: [
      { h: "Check the land category and conditions", p: "Industrial land is usually held under an industry category, and the conditions on the title can limit the kind of industry, for example light or heavy. Check that your planned use fits before you go further." },
      { h: "Power, water and access", p: "Factories need a strong electricity supply, water, and road access that lorries can use. Ask about the supply available, whether a substation is on site, the water supply, and the width and condition of the access road." },
      { h: "Zoning and approvals", p: "Confirm the zoning with the local authority, and the approvals needed to build and to operate. For existing buildings, ask to see the Certificate of Completion and Compliance (CCC) and the fire (Bomba) certificate." },
      { h: "If there is already a building", p: "Look at the ceiling height, the floor loading, the condition of the roof, and any overhead cranes with their inspection certificates. Check that the building matches what you need." },
      { h: "Leasehold industrial land", p: "Many industrial lots are leasehold. Check how many years are left and whether the State Authority's consent is needed to transfer." },
      { h: "Budget for more than the price", p: "Plan for legal fees, stamp duty and any loan costs. Banks often lend a smaller share of the price for industrial property than for houses, so confirm with your bank. The calculators below give an estimate." },
    ],
    note: "This is general information, not legal advice. Confirm every point with your lawyer and the local authority.",
  },
  ms: {
    title: "Panduan ringkas membeli tanah perindustrian di Perak",
    sections: [
      { h: "Semak kategori dan syarat tanah", p: "Tanah perindustrian biasanya dipegang di bawah kategori perindustrian, dan syarat pada hak milik boleh mengehadkan jenis industri, contohnya ringan atau berat. Pastikan kegunaan yang anda rancang sesuai sebelum meneruskan." },
      { h: "Elektrik, air dan akses", p: "Kilang memerlukan bekalan elektrik yang kuat, air, dan akses jalan yang boleh digunakan lori. Tanya tentang bekalan yang ada, sama ada pencawang berada di tapak, bekalan air, dan lebar serta keadaan jalan masuk." },
      { h: "Pengezonan dan kelulusan", p: "Sahkan pengezonan dengan pihak berkuasa tempatan, dan kelulusan yang diperlukan untuk membina dan beroperasi. Untuk bangunan sedia ada, minta lihat Perakuan Siap dan Pematuhan (CCC) dan sijil bomba." },
      { h: "Jika sudah ada bangunan", p: "Lihat ketinggian siling, beban lantai, keadaan bumbung, dan sebarang kren atas dengan sijil pemeriksaannya. Pastikan bangunan itu sepadan dengan keperluan anda." },
      { h: "Tanah perindustrian pajakan", p: "Banyak lot perindustrian adalah pajakan. Semak berapa tahun berbaki dan sama ada kebenaran Pihak Berkuasa Negeri diperlukan untuk pindah milik." },
      { h: "Sediakan bajet melebihi harga", p: "Rancang untuk yuran guaman, duti setem dan kos pinjaman. Bank selalunya meminjamkan peratusan harga yang lebih kecil untuk hartanah perindustrian berbanding rumah, jadi sahkan dengan bank anda. Kalkulator di bawah memberi anggaran." },
    ],
    note: "Ini maklumat umum, bukan nasihat guaman. Sahkan setiap perkara dengan peguam anda dan pihak berkuasa tempatan.",
  },
  zh: {
    title: "霹雳购买工业用地简明指南",
    sections: [
      { h: "检查土地类别和条件", p: "工业用地通常属于工业类别，地契上的条件可能限制工业的种类，例如轻工业或重工业。请先确认您计划的用途是否符合。" },
      { h: "电力、水和出入", p: "工厂需要足够的电力供应、水源，以及货车可以使用的道路。请询问可用的电力供应、变电站是否在现场、水源供应，以及进出道路的宽度和状况。" },
      { h: "分区和批准", p: "请向地方政府确认土地分区，以及兴建和营运所需的批准。对于已有的建筑物，可要求查看完工与合规证书（CCC）和消防（Bomba）证书。" },
      { h: "如果已有建筑物", p: "请查看天花板高度、地板承重、屋顶状况，以及任何天车及其检验证书。确认建筑物符合您的需要。" },
      { h: "租赁的工业用地", p: "许多工业地段是租赁地契。请查看剩余年限，以及过户是否需要州政府批准。" },
      { h: "预算不止是售价", p: "请预留律师费、印花税和贷款相关费用。银行对工业房产的贷款成数通常比住宅低，请先向银行确认。下方的计算器可以提供估算。" },
    ],
    note: "以上为一般资料，不构成法律意见。请向您的律师和地方政府核实每一项。",
  },
};

const GUIDES: Record<string, Record<Lang, LandGuide>> = {
  "land-for-sale-perak": LAND,
  "industrial-land-perak": INDUSTRIAL,
};

/** The guide for a landing page, or null for pages that have none. */
export const landGuide = (slug: string, lang: Lang): LandGuide | null => GUIDES[slug]?.[lang] ?? null;
