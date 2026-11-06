import type { Lang } from "./i18n";

/*
| Words for the five search landing pages, in all three languages.
| General guidance only: no prices, no promises, no invented place names
| (areas shown on each page come from the live listings).
*/

export type LandingText = {
  nav: string; // short footer / link label
  h1: string;
  metaTitle: string;
  metaDesc: string;
  intro: string;
  faq: { q: string; a: string }[];
};

export type LandingCommon = {
  breadcrumbSearches: string;
  matching: string; // {n}
  areasTitle: string;
  faqTitle: string;
  toolsTitle: string;
  moreTitle: string;
  popularTitle: string;
  emptyTitle: string;
  emptyBody: string;
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
  waMessage: string; // {page}
  toolLoan: string;
  toolCosts: string;
  toolLegal: string;
  toolRental: string;
};

const common: Record<Lang, LandingCommon> = {
  en: {
    breadcrumbSearches: "Property searches",
    matching: "{n} matching listing(s)",
    areasTitle: "Areas with listings right now",
    faqTitle: "Good to know",
    toolsTitle: "Plan your purchase",
    moreTitle: "Other searches",
    popularTitle: "Popular searches",
    emptyTitle: "No matching listings at the moment",
    emptyBody: "New properties are added often, and some are shared privately before they are listed. Tell Max what you are looking for and you will be told as soon as something suitable comes up.",
    ctaTitle: "Looking for something specific?",
    ctaBody: "Tell Max your budget, preferred area and purpose. You will get a direct reply on WhatsApp.",
    ctaButton: "Chat with Max on WhatsApp",
    waMessage: "Hi Max, I am looking at: {page}. Can you help me?",
    toolLoan: "Housing loan calculator",
    toolCosts: "Total purchase cost calculator",
    toolLegal: "Legal fees and stamp duty calculator",
    toolRental: "Rental yield calculator",
  },
  ms: {
    breadcrumbSearches: "Carian hartanah",
    matching: "{n} senarai sepadan",
    areasTitle: "Kawasan yang ada senarai sekarang",
    faqTitle: "Perlu tahu",
    toolsTitle: "Rancang pembelian anda",
    moreTitle: "Carian lain",
    popularTitle: "Carian popular",
    emptyTitle: "Tiada senarai yang sepadan buat masa ini",
    emptyBody: "Hartanah baharu kerap ditambah, dan ada yang dikongsi secara persendirian sebelum disenaraikan. Beritahu Max apa yang anda cari dan anda akan dimaklumkan sebaik sahaja ada yang sesuai.",
    ctaTitle: "Mencari sesuatu yang khusus?",
    ctaBody: "Beritahu Max bajet, kawasan pilihan dan tujuan anda. Anda akan mendapat jawapan terus di WhatsApp.",
    ctaButton: "Berbual dengan Max di WhatsApp",
    waMessage: "Hai Max, saya sedang mencari: {page}. Boleh bantu saya?",
    toolLoan: "Kalkulator pinjaman perumahan",
    toolCosts: "Kalkulator jumlah kos pembelian",
    toolLegal: "Kalkulator yuran guaman dan duti setem",
    toolRental: "Kalkulator hasil sewa",
  },
  zh: {
    breadcrumbSearches: "房产搜索",
    matching: "{n} 个符合的房源",
    areasTitle: "目前有房源的区域",
    faqTitle: "须知",
    toolsTitle: "规划您的购房",
    moreTitle: "其他搜索",
    popularTitle: "热门搜索",
    emptyTitle: "目前没有符合的房源",
    emptyBody: "新房源经常更新，有些房源会先私下分享才公开。告诉 Max 您的需求，一有合适的房源就会通知您。",
    ctaTitle: "在找特定的房产？",
    ctaBody: "告诉 Max 您的预算、心仪区域和用途，您将在 WhatsApp 上直接得到回复。",
    ctaButton: "在 WhatsApp 上联系 Max",
    waMessage: "你好 Max，我正在寻找：{page}。可以帮我吗？",
    toolLoan: "房贷计算器",
    toolCosts: "购房总成本计算器",
    toolLegal: "律师费及印花税计算器",
    toolRental: "租金回报率计算器",
  },
};

export const landingCommon = (lang: Lang) => common[lang];

const TEXT: Record<string, Record<Lang, LandingText>> = {
  "houses-for-sale-ipoh": {
    en: {
      nav: "Houses for sale in Ipoh",
      h1: "Houses for sale in Ipoh",
      metaTitle: "Houses for sale in Ipoh, Perak",
      metaDesc: "Browse houses for sale in Ipoh, Perak: terrace, semi-detached, bungalow and more. Chat directly with Max, a registered estate negotiator (REN 31953).",
      intro: "Browse houses for sale in Ipoh, Perak, from terrace and semi-detached homes to bungalows. Every listing comes with photos, the asking price and the general area, and you can ask Max about any of them directly on WhatsApp.",
      faq: [
        { q: "How much do I need to pay upfront when buying a house?", a: "Besides the down payment, expect legal fees, stamp duty and a few other costs. The total purchase cost calculator below adds these up for you." },
        { q: "How much can the bank lend me?", a: "It depends on your income, commitments and the bank. Use the DSR and housing loan calculators for an early idea, then confirm with your bank." },
        { q: "Can I view a house before deciding?", a: "Yes. Message Max on WhatsApp about the listing you like and a viewing can be arranged." },
      ],
    },
    ms: {
      nav: "Rumah dijual di Ipoh",
      h1: "Rumah dijual di Ipoh",
      metaTitle: "Rumah dijual di Ipoh, Perak",
      metaDesc: "Lihat rumah dijual di Ipoh, Perak: teres, berkembar, banglo dan banyak lagi. Berbual terus dengan Max, ejen harta tanah berdaftar (REN 31953).",
      intro: "Lihat rumah dijual di Ipoh, Perak, daripada rumah teres dan berkembar hingga banglo. Setiap senarai disertakan gambar, harga dan kawasan umum, dan anda boleh bertanya Max terus di WhatsApp.",
      faq: [
        { q: "Berapa yang perlu dibayar di awal semasa membeli rumah?", a: "Selain bayaran pendahuluan, jangkakan yuran guaman, duti setem dan beberapa kos lain. Kalkulator jumlah kos pembelian di bawah mengira semuanya untuk anda." },
        { q: "Berapa yang boleh dipinjamkan bank?", a: "Ia bergantung pada pendapatan, komitmen dan bank anda. Gunakan kalkulator DSR dan pinjaman perumahan untuk gambaran awal, kemudian sahkan dengan bank anda." },
        { q: "Bolehkah saya melihat rumah sebelum membuat keputusan?", a: "Boleh. Mesej Max di WhatsApp tentang senarai yang anda suka dan lawatan boleh diatur." },
      ],
    },
    zh: {
      nav: "怡保住宅出售",
      h1: "怡保住宅出售",
      metaTitle: "怡保住宅出售（霹雳）",
      metaDesc: "浏览霹雳怡保的住宅出售：排屋、半独立式住宅、独立式洋房等。直接联系注册房地产经纪 Max (REN 31953)。",
      intro: "浏览霹雳怡保的住宅出售，从排屋、半独立式住宅到独立式洋房。每个房源都附有照片、售价和大致区域，您可以直接通过 WhatsApp 向 Max 查询。",
      faq: [
        { q: "购买住宅时需要先付多少钱？", a: "除了首期，还需预留律师费、印花税和其他费用。下方的购房总成本计算器会帮您加总。" },
        { q: "银行最多能借我多少？", a: "取决于您的收入、负债和银行。可先用 DSR 和房贷计算器了解大概，再向银行确认。" },
        { q: "决定前可以先看房吗？", a: "可以。通过 WhatsApp 告诉 Max 您喜欢的房源，即可安排看房。" },
      ],
    },
  },
  "factories-for-sale-ipoh": {
    en: {
      nav: "Factories for sale in Ipoh",
      h1: "Factories for sale in Ipoh",
      metaTitle: "Factories for sale in Ipoh, Perak",
      metaDesc: "Factories and warehouses for sale in Ipoh, Perak. See the details and chat directly with Max, a registered estate negotiator (REN 31953).",
      intro: "Factories and warehouses for sale in Ipoh, Perak, including detached, semi-detached, terrace and cluster factories. Each listing shows the asking price, the area and the key details, and Max can answer questions about size, tenure and suitability for your business on WhatsApp.",
      faq: [
        { q: "What should I check before buying a factory?", a: "Check the land title and tenure, the permitted use of the land, the building's size and condition, and the power supply. Ask Max for the details of the listing you like." },
        { q: "Is financing different for industrial property?", a: "Banks often lend a smaller share of the price for industrial property than for a home, and terms vary. Confirm with your bank, then use the calculators below to plan." },
        { q: "Are factories also available for rent?", a: "Some owners rent out. Message Max with your size and area needs and you will be told what is available." },
      ],
    },
    ms: {
      nav: "Kilang dijual di Ipoh",
      h1: "Kilang dijual di Ipoh",
      metaTitle: "Kilang dijual di Ipoh, Perak",
      metaDesc: "Kilang dan gudang dijual di Ipoh, Perak. Lihat butiran dan berbual terus dengan Max, ejen harta tanah berdaftar (REN 31953).",
      intro: "Kilang dan gudang dijual di Ipoh, Perak, termasuk kilang sesebuah, berkembar, teres dan kluster. Setiap senarai menunjukkan harga, kawasan dan butiran penting, dan Max boleh menjawab soalan tentang saiz, pegangan dan kesesuaian untuk perniagaan anda di WhatsApp.",
      faq: [
        { q: "Apa yang perlu disemak sebelum membeli kilang?", a: "Semak hak milik dan pegangan tanah, kegunaan tanah yang dibenarkan, saiz dan keadaan bangunan, serta bekalan elektrik. Tanya Max untuk butiran senarai yang anda suka." },
        { q: "Adakah pembiayaan berbeza untuk hartanah perindustrian?", a: "Bank selalunya meminjamkan peratusan harga yang lebih kecil untuk hartanah perindustrian berbanding rumah, dan terma berbeza. Sahkan dengan bank anda, kemudian gunakan kalkulator di bawah untuk merancang." },
        { q: "Adakah kilang juga tersedia untuk disewa?", a: "Sesetengah pemilik menyewakan. Mesej Max dengan keperluan saiz dan kawasan anda dan anda akan dimaklumkan apa yang ada." },
      ],
    },
    zh: {
      nav: "怡保工厂出售",
      h1: "怡保工厂出售",
      metaTitle: "怡保工厂出售（霹雳）",
      metaDesc: "霹雳怡保的工厂及仓库出售。查看详情并直接联系注册房地产经纪 Max (REN 31953)。",
      intro: "霹雳怡保的工厂及仓库出售，包括独立式、半独立式、排屋式和组合式工厂。每个房源都列明售价、区域和主要资料，关于面积、地契年限以及是否适合您的业务，都可以通过 WhatsApp 向 Max 查询。",
      faq: [
        { q: "购买工厂前应该检查什么？", a: "请检查地契和年限、土地许可用途、建筑面积和状况，以及电力供应。可向 Max 询问您喜欢的房源详情。" },
        { q: "工业房产的融资不同吗？", a: "银行对工业房产的贷款成数通常比住宅低，条件也各不相同。请先向银行确认，再用下方的计算器规划。" },
        { q: "也有工厂出租吗？", a: "部分业主愿意出租。把您需要的面积和区域告诉 Max，就会通知您目前有什么。" },
      ],
    },
  },
  "industrial-land-perak": {
    en: {
      nav: "Industrial land in Perak",
      h1: "Industrial land in Perak",
      metaTitle: "Industrial land for sale in Perak",
      metaDesc: "Industrial land for sale in Perak. See sizes, areas and prices, and chat directly with Max, a registered estate negotiator (REN 31953).",
      intro: "Industrial land for sale in Perak. Each listing shows the land size, the area and the asking price. Ask Max about tenure, access and what the land can be used for.",
      faq: [
        { q: "What should I check before buying industrial land?", a: "Check the title, tenure and the approved land use, road access, utilities and any conditions on the land. A lawyer can confirm the title before you commit." },
        { q: "Can I build a factory on it?", a: "It depends on the zoning and approvals for that specific land. Ask Max about the listing and confirm with the local authority before buying." },
        { q: "How are the costs worked out?", a: "Legal fees and stamp duty depend on the price and loan. The calculators below give an estimate." },
      ],
    },
    ms: {
      nav: "Tanah perindustrian di Perak",
      h1: "Tanah perindustrian di Perak",
      metaTitle: "Tanah perindustrian dijual di Perak",
      metaDesc: "Tanah perindustrian dijual di Perak. Lihat saiz, kawasan dan harga, dan berbual terus dengan Max, ejen harta tanah berdaftar (REN 31953).",
      intro: "Tanah perindustrian dijual di Perak. Setiap senarai menunjukkan saiz tanah, kawasan dan harga. Tanya Max tentang pegangan, akses dan kegunaan tanah.",
      faq: [
        { q: "Apa yang perlu disemak sebelum membeli tanah perindustrian?", a: "Semak hak milik, pegangan dan kegunaan tanah yang diluluskan, akses jalan, utiliti dan sebarang syarat pada tanah. Peguam boleh mengesahkan hak milik sebelum anda berkomitmen." },
        { q: "Bolehkah saya membina kilang di atasnya?", a: "Ia bergantung pada pewilayahan dan kelulusan bagi tanah tertentu itu. Tanya Max tentang senarai tersebut dan sahkan dengan pihak berkuasa tempatan sebelum membeli." },
        { q: "Bagaimana kos dikira?", a: "Yuran guaman dan duti setem bergantung pada harga dan pinjaman. Kalkulator di bawah memberi anggaran." },
      ],
    },
    zh: {
      nav: "霹雳工业用地",
      h1: "霹雳工业用地",
      metaTitle: "霹雳工业用地出售",
      metaDesc: "霹雳工业用地出售。查看面积、区域和价格，并直接联系注册房地产经纪 Max (REN 31953)。",
      intro: "霹雳工业用地出售。每个房源都列明土地面积、区域和售价。关于地契年限、出入道路和土地用途，可向 Max 查询。",
      faq: [
        { q: "购买工业用地前应该检查什么？", a: "请检查地契、年限和获准的土地用途、道路出入、公用设施以及土地上的任何条件。您可以在做决定前请律师确认地契。" },
        { q: "可以在上面建工厂吗？", a: "取决于该地段的分区和批准。请向 Max 询问该房源，并在购买前向地方政府确认。" },
        { q: "费用如何计算？", a: "律师费和印花税取决于价格和贷款额。下方的计算器可提供估算。" },
      ],
    },
  },
  "commercial-property-ipoh": {
    en: {
      nav: "Commercial property in Ipoh",
      h1: "Commercial property in Ipoh",
      metaTitle: "Commercial property in Ipoh, Perak",
      metaDesc: "Shop lots, offices and other commercial property for sale and rent in Ipoh, Perak. Chat directly with Max, a registered estate negotiator (REN 31953).",
      intro: "Commercial property in Ipoh, Perak, for sale and for rent, including shop lots and offices. Each listing shows the price, area and key details, and Max can help you compare options for your business or investment.",
      faq: [
        { q: "Is it better to buy or rent a commercial space?", a: "Buying ties up capital but builds an asset; renting is more flexible. If you are buying to let out, the rental yield calculator below shows the return." },
        { q: "What costs come with buying commercial property?", a: "Legal fees, stamp duty and other costs apply, and loan terms differ from home loans. The calculators below give an estimate." },
        { q: "Can I see more than what is listed?", a: "Some properties are shared privately. Tell Max what you need and you will be told when something suitable comes up." },
      ],
    },
    ms: {
      nav: "Hartanah komersial di Ipoh",
      h1: "Hartanah komersial di Ipoh",
      metaTitle: "Hartanah komersial di Ipoh, Perak",
      metaDesc: "Kedai, pejabat dan hartanah komersial lain untuk dijual dan disewa di Ipoh, Perak. Berbual terus dengan Max, ejen harta tanah berdaftar (REN 31953).",
      intro: "Hartanah komersial di Ipoh, Perak, untuk dijual dan disewa, termasuk kedai dan pejabat. Setiap senarai menunjukkan harga, kawasan dan butiran penting, dan Max boleh membantu anda membandingkan pilihan untuk perniagaan atau pelaburan.",
      faq: [
        { q: "Lebih baik beli atau sewa ruang komersial?", a: "Membeli mengikat modal tetapi membina aset; menyewa lebih fleksibel. Jika membeli untuk disewakan, kalkulator hasil sewa di bawah menunjukkan pulangan." },
        { q: "Apakah kos membeli hartanah komersial?", a: "Yuran guaman, duti setem dan kos lain dikenakan, dan terma pinjaman berbeza daripada pinjaman rumah. Kalkulator di bawah memberi anggaran." },
        { q: "Bolehkah saya melihat lebih daripada yang disenaraikan?", a: "Sesetengah hartanah dikongsi secara persendirian. Beritahu Max keperluan anda dan anda akan dimaklumkan apabila ada yang sesuai." },
      ],
    },
    zh: {
      nav: "怡保商业房产",
      h1: "怡保商业房产",
      metaTitle: "怡保商业房产（霹雳）",
      metaDesc: "霹雳怡保的店屋、办公室及其他商业房产买卖与出租。直接联系注册房地产经纪 Max (REN 31953)。",
      intro: "霹雳怡保的商业房产买卖与出租，包括店屋和办公室。每个房源都列明价格、区域和主要资料，Max 可协助您比较适合业务或投资的选择。",
      faq: [
        { q: "购买还是租用商业空间比较好？", a: "购买会占用资金但能累积资产；租用则更灵活。如果买来出租，下方的租金回报率计算器可显示回报。" },
        { q: "购买商业房产有哪些费用？", a: "需要律师费、印花税和其他费用，贷款条件也与房贷不同。下方的计算器可提供估算。" },
        { q: "能看到列表以外的房源吗？", a: "部分房产会私下分享。告诉 Max 您的需求，有合适的房源就会通知您。" },
      ],
    },
  },
  "land-for-sale-perak": {
    en: {
      nav: "Land for sale in Perak",
      h1: "Land for sale in Perak",
      metaTitle: "Land for sale in Perak",
      metaDesc: "Land for sale in Perak: residential, commercial, industrial and agricultural. Chat directly with Max, a registered estate negotiator (REN 31953).",
      intro: "Land for sale in Perak, including residential, commercial, industrial and agricultural land. Each listing shows the size, area and asking price. Ask Max about the title, tenure and what the land can be used for.",
      faq: [
        { q: "What should I check before buying land?", a: "Check the title and tenure, the category of land use, road access, utilities and any conditions or restrictions. A lawyer can confirm the title before you commit." },
        { q: "Can I build on any land?", a: "No. What you can build depends on the land's category and approvals. Always confirm with the local authority before buying." },
        { q: "How much are the legal fees and stamp duty?", a: "They depend on the price and any loan. The legal fees and stamp duty calculator below gives an estimate." },
      ],
    },
    ms: {
      nav: "Tanah dijual di Perak",
      h1: "Tanah dijual di Perak",
      metaTitle: "Tanah dijual di Perak",
      metaDesc: "Tanah dijual di Perak: kediaman, komersial, perindustrian dan pertanian. Berbual terus dengan Max, ejen harta tanah berdaftar (REN 31953).",
      intro: "Tanah dijual di Perak, termasuk tanah kediaman, komersial, perindustrian dan pertanian. Setiap senarai menunjukkan saiz, kawasan dan harga. Tanya Max tentang hak milik, pegangan dan kegunaan tanah.",
      faq: [
        { q: "Apa yang perlu disemak sebelum membeli tanah?", a: "Semak hak milik dan pegangan, kategori kegunaan tanah, akses jalan, utiliti dan sebarang syarat atau sekatan. Peguam boleh mengesahkan hak milik sebelum anda berkomitmen." },
        { q: "Bolehkah saya membina di atas sebarang tanah?", a: "Tidak. Apa yang boleh dibina bergantung pada kategori dan kelulusan tanah. Sentiasa sahkan dengan pihak berkuasa tempatan sebelum membeli." },
        { q: "Berapakah yuran guaman dan duti setem?", a: "Ia bergantung pada harga dan sebarang pinjaman. Kalkulator yuran guaman dan duti setem di bawah memberi anggaran." },
      ],
    },
    zh: {
      nav: "霹雳土地出售",
      h1: "霹雳土地出售",
      metaTitle: "霹雳土地出售",
      metaDesc: "霹雳土地出售：住宅、商业、工业和农业用地。直接联系注册房地产经纪 Max (REN 31953)。",
      intro: "霹雳土地出售，包括住宅、商业、工业和农业用地。每个房源都列明面积、区域和售价。关于地契、年限和土地用途，可向 Max 查询。",
      faq: [
        { q: "购买土地前应该检查什么？", a: "请检查地契和年限、土地用途类别、道路出入、公用设施以及任何条件或限制。您可以在做决定前请律师确认地契。" },
        { q: "任何土地都可以建房吗？", a: "不可以。能建什么取决于土地类别和批准。购买前务必向地方政府确认。" },
        { q: "律师费和印花税是多少？", a: "取决于价格和是否贷款。下方的律师费及印花税计算器可提供估算。" },
      ],
    },
  },
};

export const landingText = (slug: string, lang: Lang): LandingText => TEXT[slug][lang];
