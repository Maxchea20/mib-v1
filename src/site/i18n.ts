/*
|--------------------------------------------------------------------------
| PUBLIC SITE TRANSLATIONS
|--------------------------------------------------------------------------
|
| English is the default. Visitors can switch to Bahasa Malaysia (ms) or
| Simplified Chinese (zh); the choice is remembered in the mp_lang cookie.
| Only the website's own text is translated. Listing descriptions are shown
| in the language they were written in.
|
*/

export const LANGS = ["en", "ms", "zh"] as const;
export type Lang = (typeof LANGS)[number];

export const LANG_LABELS: Record<Lang, string> = {
  en: "EN",
  ms: "BM",
  zh: "中文",
};

export const HTML_LANG: Record<Lang, string> = {
  en: "en",
  ms: "ms",
  zh: "zh-CN",
};

export function isLang(value: string | undefined | null): value is Lang {
  return (LANGS as readonly string[]).includes(value ?? "");
}

/** Where each language lives: English at the root, the others under a prefix. */
const LANG_PREFIX: Record<Lang, string> = { en: "", ms: "/ms", zh: "/zh" };

/** "/residential" in a language -> "/residential", "/ms/residential", "/zh/residential". */
export function pathFor(lang: Lang, path: string): string {
  const clean = path === "/" ? "" : path;
  return `${LANG_PREFIX[lang]}${clean}` || "/";
}

/** The language prefix of a browser path, and what is left after it. */
export function splitLangPath(pathname: string): { lang: Lang; path: string } {
  for (const l of ["ms", "zh"] as const) {
    if (pathname === `/${l}` || pathname.startsWith(`/${l}/`)) {
      return { lang: l, path: pathname.slice(l.length + 1) || "/" };
    }
  }
  return { lang: "en", path: pathname || "/" };
}

type Dict = {
  navListings: string;
  navSale: string;
  navRent: string;
  navLand: string;
  navResidential: string;
  navCommercial: string;
  navIndustrial: string;
  whatsappUs: string;
  heroKicker: string;
  heroTitle: string;
  heroSub: string;
  filterLooking: string;
  filterBuy: string;
  filterRent: string;
  filterAny: string;
  filterType: string;
  filterAnyType: string;
  filterSearch: string;
  latest: string;
  resultsCount: string; // {n}
  empty: string;
  emptyHint: string;
  clearFilters: string;
  forSale: string;
  forRent: string;
  perMonth: string;
  booked: string;
  bed: string;
  bath: string;
  residential: string;
  commercial: string;
  industrial: string;
  land: string;
  howTitle: string;
  how1Title: string;
  how1Text: string;
  how2Title: string;
  how2Text: string;
  how3Title: string;
  how3Text: string;
  breadcrumbAll: string;
  askingPrice: string;
  enquire: string;
  messageOpens: string;
  waMessage: string; // {title} {price} {url}
  share: string;
  copyLink: string;
  copied: string;
  details: string;
  about: string;
  highlights: string;
  location: string;
  locationNote: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  builtUp: string;
  landSize: string;
  tenure: string;
  titleType: string;
  furnishing: string;
  parking: string;
  facing: string;
  landType: string;
  photos: string;
  photoOf: string; // {i} {n}
  prevPhoto: string;
  nextPhoto: string;
  footerAbout: string;
  footerContact: string;
  footerReg: string;
  notFoundTitle: string;
  notFoundText: string;
  backToListings: string;
  language: string;
  browseByCategory: string;
  viewAllN: string; // {n}
  categoryPage: string; // {category}
  allTypes: string;
  allPurposes: string;
  groupBy: string;
  countProps: string; // {n}
  calcNav: string;
  calcHubTitle: string;
  calcHubIntro: string;
  calcOpen: string;
  hlTitle: string;
  hlIntro: string;
  hlCardText: string;
  hlPrice: string;
  hlMargin: string;
  hlMarginHint: string;
  hlTenure: string;
  hlTenureHint: string;
  hlRate: string;
  hlRateHint: string;
  hlYears: string;
  hlReset: string;
  hlResults: string;
  hlMonthly: string;
  hlLoanAmount: string;
  hlDownPayment: string;
  hlTotalInterest: string;
  hlTotalRepayment: string;
  hlBreakdown: string;
  hlPrincipal: string;
  hlInterest: string;
  hlMonthsLabel: string;
  hlInvalid: string;
  hlErrPrice: string;
  hlErrPriceHigh: string;
  hlErrMargin: string;
  hlErrTenure: string;
  hlErrRate: string;
  hlAssumeTitle: string;
  hlAssume1: string;
  hlAssume2: string;
  hlAssume3: string;
  hlAssume4: string;
  hlAssume5: string;
  hlDisclaimer: string;
  hlWhatsapp: string;
  hlWhatsappMsg: string;
  dsrTitle: string;
  dsrIntro: string;
  dsrCardText: string;
  dsrSecProperty: string;
  dsrSecIncome: string;
  dsrSecCommit: string;
  dsrPriceHint: string;
  dsrIncome: string;
  dsrIncomeHint: string;
  dsrCommitNote: string;
  dsrCar: string;
  dsrPersonal: string;
  dsrHousing: string;
  dsrPtptn: string;
  dsrCard: string;
  dsrExpenses: string;
  dsrZeroChip: string;
  dsrPlaceholderAmount: string;
  dsrErrRequired: string;
  dsrErrInvalid: string;
  dsrErrNegative: string;
  dsrErrZero: string;
  dsrErrTooHigh: string;
  dsrProgress: string;
  dsrPending: string;
  dsrResult: string;
  dsrNetIncome: string;
  dsrExisting: string;
  dsrNewInstalment: string;
  dsrTotalCommit: string;
  dsrDsr: string;
  dsrGreen: string;
  dsrRed: string;
  dsrGreenTag: string;
  dsrRedTag: string;
  dsrLimitLine: string;
  dsrLoanLine: string;
  dsrWhatsapp: string;
  dsrWhatsappMsg: string;
  dsrDisclaimer: string;
  dsrAssume1: string;
  dsrAssume2: string;
  dsrAssume3: string;
  dsrAssume4: string;
  dsrMobileWait: string;
  rpTitle: string;
  rpIntro: string;
  rpCardText: string;
  rpSecCategory: string;
  rpCategoryHint: string;
  rpPart1: string;
  rpPart1Desc: string;
  rpPart2: string;
  rpPart2Desc: string;
  rpPart3: string;
  rpPart3Desc: string;
  rpSellerKind: string;
  rpIndividual: string;
  rpOtherBody: string;
  rpSellerKindHint: string;
  rpSecProperty: string;
  rpAcqPrice: string;
  rpDispPrice: string;
  rpAcqDate: string;
  rpDispDate: string;
  rpDateHint: string;
  rpSecCosts: string;
  rpCostsNote: string;
  rpCostAcqLegal: string;
  rpCostDispLegal: string;
  rpCostStamp: string;
  rpCostReno: string;
  rpCostOther: string;
  rpOptional: string;
  rpSecExemption: string;
  rpPrivate: string;
  rpPrivateWarn: string;
  rpPrivateNA: string;
  rpErrCategory: string;
  rpErrSellerKind: string;
  rpErrRequired: string;
  rpErrInvalid: string;
  rpErrNegative: string;
  rpErrZero: string;
  rpErrTooHigh: string;
  rpErrDateInvalid: string;
  rpErrDateEarly: string;
  rpErrDateOrder: string;
  rpPending: string;
  rpResult: string;
  rpResCategory: string;
  rpResHolding: string;
  rpResRate: string;
  rpResAcq: string;
  rpResDisp: string;
  rpResCosts: string;
  rpResAdjusted: string;
  rpResExemption: string;
  rpResChargeable: string;
  rpResTax: string;
  rpBandWithin3: string;
  rpBandYear4: string;
  rpBandYear5: string;
  rpBandYear6: string;
  rpPeriod: string;
  rpRatesTitle: string;
  rpExIndividual: string;
  rpExPrivate: string;
  rpExNone: string;
  rpNoGain: string;
  rpLossNote: string;
  rpAssumeTitle: string;
  rpAssume1: string;
  rpAssume2: string;
  rpAssume3: string;
  rpAssume4: string;
  rpAssume5: string;
  rpAssume6: string;
  rpDisclaimer: string;
  rpRetention: string;
  rpWhatsapp: string;
  rpWhatsappMsg: string;
};

const en: Dict = {
  navListings: "All listings",
  navSale: "For sale",
  navRent: "For rent",
  navLand: "Land",
  navResidential: "Residential",
  navCommercial: "Commercial",
  navIndustrial: "Industrial",
  whatsappUs: "WhatsApp us",
  heroKicker: "Ipoh, Perak and across Malaysia",
  heroTitle: "Find your next property, then chat with Max directly.",
  heroSub:
    "Every listing has its own page with photos, details and a WhatsApp button. No sign-up, no forms.",
  filterLooking: "Looking to",
  filterBuy: "Buy",
  filterRent: "Rent",
  filterAny: "Buy or rent",
  filterType: "Property type",
  filterAnyType: "Any type",
  filterSearch: "Search",
  latest: "Latest listings",
  resultsCount: "{n} properties",
  empty: "No properties match your search.",
  emptyHint: "Try a different type, or clear the filters.",
  clearFilters: "Clear filters",
  forSale: "For sale",
  forRent: "For rent",
  perMonth: "/ month",
  booked: "Booked",
  bed: "bed",
  bath: "bath",
  residential: "Residential",
  commercial: "Commercial",
  industrial: "Industrial",
  land: "Land",
  howTitle: "How it works",
  how1Title: "Browse",
  how1Text: "Search by type and price. Each property has its own page.",
  how2Title: "Chat on WhatsApp",
  how2Text:
    "Tap the button. The message already names the property you are viewing.",
  how3Title: "Arrange a viewing",
  how3Text: "Max replies personally and arranges the viewing and next steps.",
  breadcrumbAll: "All listings",
  askingPrice: "Asking price",
  enquire: "Enquire on WhatsApp",
  messageOpens: "Message that opens:",
  waMessage: 'Hi Max, I am interested in "{title}" ({price}). {url} Is it still available?',
  share: "Share",
  copyLink: "Copy link",
  copied: "Link copied",
  details: "Property details",
  about: "About this property",
  highlights: "Highlights",
  location: "Location",
  locationNote:
    "Showing the general area only. The exact address is shared when you enquire.",
  propertyType: "Property type",
  bedrooms: "Bedrooms",
  bathrooms: "Bathrooms",
  builtUp: "Built-up",
  landSize: "Land size",
  tenure: "Tenure",
  titleType: "Title type",
  furnishing: "Furnishing",
  parking: "Parking",
  facing: "Facing",
  landType: "Land type",
  photos: "Photos",
  photoOf: "Photo {i} of {n}",
  prevPhoto: "Previous photo",
  nextPhoto: "Next photo",
  footerAbout:
    "Property marketing based in Ipoh, Perak. Listings available nationwide.",
  footerContact: "Contact",
  footerReg: "REN",
  notFoundTitle: "We could not find that page",
  notFoundText:
    "The property may have been sold or taken down, or the link is not correct.",
  backToListings: "Back to all listings",
  language: "Language",
  browseByCategory: "Browse by category",
  viewAllN: "View all {n}",
  categoryPage: "{category} properties",
  allTypes: "All types",
  allPurposes: "Buy or rent",
  groupBy: "Type",
  countProps: "{n} properties",
  calcNav: "Calculators",
  calcHubTitle: "Property calculators",
  calcHubIntro: "Free tools to help you plan your purchase. No sign-up needed.",
  calcOpen: "Open calculator",
  hlTitle: "Housing loan calculator",
  hlIntro: "Estimate your monthly instalment, down payment and total interest. The results update as you type.",
  hlCardText: "Estimate your monthly instalment, down payment and total interest.",
  hlPrice: "Property price (RM)",
  hlMargin: "Loan margin (%)",
  hlMarginHint: "The share of the price that the bank finances.",
  hlTenure: "Loan tenure (years)",
  hlTenureHint: "A longer tenure lowers the instalment but increases the total interest.",
  hlRate: "Interest rate (% per year)",
  hlRateHint: "Enter your bank's rate. 4.5% is only an example.",
  hlYears: "years",
  hlReset: "Reset to example values",
  hlResults: "Your estimate",
  hlMonthly: "Estimated monthly instalment",
  hlLoanAmount: "Loan amount",
  hlDownPayment: "Down payment",
  hlTotalInterest: "Total interest",
  hlTotalRepayment: "Total repayment",
  hlBreakdown: "Where your money goes",
  hlPrincipal: "Loan amount",
  hlInterest: "Interest",
  hlMonthsLabel: "{n} monthly payments",
  hlInvalid: "Please correct the highlighted fields to see your estimate.",
  hlErrPrice: "Enter a property price above RM 0.",
  hlErrPriceHigh: "This price is too high for the calculator.",
  hlErrMargin: "Enter a loan margin between 1% and 100%.",
  hlErrTenure: "Enter a tenure between 1 and 40 years.",
  hlErrRate: "Enter an interest rate between 0% and 25%.",
  hlAssumeTitle: "How this is calculated",
  hlAssume1: "Reducing-balance method: interest is charged every month on the loan still outstanding, not on the original amount.",
  hlAssume2: "Monthly instalment = L × r ÷ (1 − (1 + r)^−n), where L is the loan amount, r is the yearly rate ÷ 12, and n is the number of months.",
  hlAssume3: "The interest rate is assumed to stay the same for the whole tenure. Real bank rates can change over time.",
  hlAssume4: "Legal fees, stamp duty, insurance and other charges are not included.",
  hlAssume5: "The instalment is rounded to the nearest sen. Total repayment is the instalment multiplied by the number of months.",
  hlDisclaimer: "This calculator gives an estimate only. Actual amounts depend on your bank's terms and are subject to bank approval.",
  hlWhatsapp: "Ask Max about this loan",
  hlWhatsappMsg: "Hi Max, I tried the housing loan calculator: property price {price}, margin {margin}%, {years} years at {rate}% a year, about {monthly} a month. Can you advise me?",
  dsrTitle: "DSR calculator",
  dsrIntro: "Check your Debt Service Ratio (DSR) for a new property loan. Fill in every field and the result updates as you type.",
  dsrCardText: "Check whether your income can support a new property loan.",
  dsrSecProperty: "1. Property purchase",
  dsrSecIncome: "2. Monthly net income",
  dsrSecCommit: "3. Existing monthly commitments",
  dsrPriceHint: "Required. The purchase price of the property.",
  dsrIncome: "Net monthly income (RM)",
  dsrIncomeHint: "Required. Your income after EPF, SOCSO and income tax deductions.",
  dsrCommitNote: "Every field is required. If you have none, enter 0 or tap RM 0.",
  dsrCar: "Car loan (RM per month)",
  dsrPersonal: "Personal loan (RM per month)",
  dsrHousing: "Current housing loan (RM per month)",
  dsrPtptn: "PTPTN (RM per month)",
  dsrCard: "Credit card commitment (RM per month)",
  dsrExpenses: "Monthly expenses (RM per month)",
  dsrZeroChip: "RM 0",
  dsrPlaceholderAmount: "Enter amount",
  dsrErrRequired: "This field is required.",
  dsrErrInvalid: "Enter a valid number.",
  dsrErrNegative: "This cannot be negative.",
  dsrErrZero: "This cannot be zero.",
  dsrErrTooHigh: "This amount is too high.",
  dsrProgress: "{n} fields still need an answer",
  dsrPending: "Complete every required field to see your DSR.",
  dsrResult: "Your DSR result",
  dsrNetIncome: "Net monthly income",
  dsrExisting: "Existing monthly commitments",
  dsrNewInstalment: "Estimated new property instalment",
  dsrTotalCommit: "Total monthly commitments",
  dsrDsr: "Your DSR",
  dsrGreen: "Below 75%: within the indicative limit",
  dsrRed: "75% or above: over the indicative limit",
  dsrGreenTag: "GREEN",
  dsrRedTag: "RED",
  dsrLimitLine: "75% of your net income is {amount} a month.",
  dsrLoanLine: "New loan {loan} over {years} years at {rate}% a year.",
  dsrWhatsapp: "Discuss my DSR with Max",
  dsrWhatsappMsg: "Hi Max, I checked my DSR: net income {income}, existing commitments {existing}, new instalment {instalment}, total {total}, DSR {dsr}%. Can you advise me?",
  dsrDisclaimer: "This is an indicative affordability calculation. Actual bank DSR assessment varies according to the bank's policies, treatment of income, expenses and credit commitments.",
  dsrAssume1: "DSR = (existing monthly commitments + new property instalment) ÷ net monthly income × 100.",
  dsrAssume2: "The new instalment uses the reducing-balance formula on the loan amount (price × margin), at the rate and tenure you enter.",
  dsrAssume3: "This calculator uses 75% as its guide. Banks set their own limits and may treat income, expenses and commitments differently.",
  dsrAssume4: "The DSR is shown to two decimals, and the colour follows the figure you see: 75.00% and above is red.",
  dsrMobileWait: "Complete all fields",
  rpTitle: "RPGT calculator",
  rpIntro: "Estimate the Real Property Gains Tax (RPGT) on selling a property in Malaysia. Fill in the details and the result updates as you type.",
  rpCardText: "Estimate the Real Property Gains Tax when you sell a property.",
  rpSecCategory: "1. Who is selling?",
  rpCategoryHint: "Choose the category that matches the seller. This decides the RPGT rates.",
  rpPart1: "Part I",
  rpPart1Desc: "Malaysian citizens, permanent residents and other Part I disposers.",
  rpPart2: "Part II",
  rpPart2Desc: "Malaysian-incorporated companies, trustees and registered bodies.",
  rpPart3: "Part III",
  rpPart3Desc: "Non-citizens, non-permanent residents and foreign-incorporated companies.",
  rpSellerKind: "The seller is",
  rpIndividual: "An individual",
  rpOtherBody: "A company, trustee or other body",
  rpSellerKindHint: "Only individuals qualify for the RM10,000 / 10% exemption.",
  rpSecProperty: "2. Property details",
  rpAcqPrice: "Acquisition price (RM)",
  rpDispPrice: "Disposal price (RM)",
  rpAcqDate: "Acquisition date (SPA date)",
  rpDispDate: "Disposal date (SPA date)",
  rpDateHint: "Use the date of the sale and purchase agreement.",
  rpSecCosts: "3. Allowable costs",
  rpCostsNote: "Only enter costs that qualify under the RPGT Act and that you can prove. Not every property expense can be deducted. Leave a field blank if there is none.",
  rpCostAcqLegal: "Acquisition legal fees (RM)",
  rpCostDispLegal: "Disposal legal fees (RM)",
  rpCostStamp: "Acquisition stamp duty (RM)",
  rpCostReno: "Qualifying renovation or enhancement expenditure (RM)",
  rpCostOther: "Other allowable incidental expenses (RM)",
  rpOptional: "Optional",
  rpSecExemption: "4. Exemption",
  rpPrivate: "I want to claim the once-in-a-lifetime private residence exemption",
  rpPrivateWarn: "This election depends on eligibility and is generally irrevocable. Check with a tax adviser or LHDN before relying on it.",
  rpPrivateNA: "Only for Malaysian citizens and permanent residents who are individuals (Part I).",
  rpErrCategory: "Please choose a seller category.",
  rpErrSellerKind: "Please say whether the seller is an individual or a company or other body.",
  rpErrRequired: "This field is required.",
  rpErrInvalid: "Enter a valid number.",
  rpErrNegative: "This cannot be negative.",
  rpErrZero: "This must be more than zero.",
  rpErrTooHigh: "This amount is too high.",
  rpErrDateInvalid: "Enter a valid date.",
  rpErrDateEarly: "Dates before 1 January 1970 are not supported.",
  rpErrDateOrder: "The disposal date cannot be before the acquisition date.",
  rpPending: "Complete the required fields to see your estimate.",
  rpResult: "Your RPGT estimate",
  rpResCategory: "Seller category",
  rpResHolding: "Holding period",
  rpResRate: "Applicable RPGT rate",
  rpResAcq: "Acquisition price",
  rpResDisp: "Disposal price",
  rpResCosts: "Total allowable expenses",
  rpResAdjusted: "Adjusted gain",
  rpResExemption: "Applicable exemption",
  rpResChargeable: "Chargeable gain",
  rpResTax: "Estimated RPGT payable",
  rpBandWithin3: "Within 3 years",
  rpBandYear4: "4th year",
  rpBandYear5: "5th year",
  rpBandYear6: "6th year onwards",
  rpPeriod: "Disposal period",
  rpRatesTitle: "RPGT rates (Schedule 5)",
  rpExIndividual: "Individual exemption: the higher of RM10,000 or 10% of the gain",
  rpExPrivate: "Private residence exemption (once in a lifetime)",
  rpExNone: "None (not available to companies and other bodies)",
  rpNoGain: "No chargeable gain, so no RPGT is payable.",
  rpLossNote: "This disposal shows no gain, so no RPGT is payable.",
  rpAssumeTitle: "How this is calculated",
  rpAssume1: "Adjusted gain = disposal price − acquisition price − allowable expenses.",
  rpAssume2: "The holding period is counted from the acquisition SPA date to the disposal SPA date using anniversaries, not by subtracting calendar years. A disposal on an anniversary stays in the earlier period.",
  rpAssume3: "Individuals get an exemption of the higher of RM10,000 or 10% of the gain, never more than the gain. Companies, trustees and other bodies do not.",
  rpAssume4: "Chargeable gain = adjusted gain − exemption. RPGT = chargeable gain × the rate for your category and holding period.",
  rpAssume5: "If there is no positive chargeable gain, RPGT is RM 0.",
  rpAssume6: "The private residence exemption is optional, only for Part I individuals, and only applies if you tick it.",
  rpDisclaimer: "This is an indicative estimate based on the Real Property Gains Tax Act 1976 and Schedule 5. Actual RPGT depends on LHDN's assessment, your eligibility for exemptions and the documents you submit. It is not tax advice.",
  rpRetention: "The retention sum a purchaser may have to withhold under section 21B is a separate matter. It is not calculated here and is not the same as the RPGT payable.",
  rpWhatsapp: "Discuss my RPGT with Max",
  rpWhatsappMsg: "Hi Max, I tried the RPGT calculator: {category}, acquired {acq} for {acqPrice}, disposing {disp} for {dispPrice}. Estimated RPGT {tax}. Can you advise me?",
};

const ms: Dict = {
  navListings: "Semua senarai",
  navSale: "Untuk dijual",
  navRent: "Untuk disewa",
  navLand: "Tanah",
  navResidential: "Kediaman",
  navCommercial: "Komersial",
  navIndustrial: "Perindustrian",
  whatsappUs: "WhatsApp kami",
  heroKicker: "Ipoh, Perak dan seluruh Malaysia",
  heroTitle: "Cari hartanah anda, kemudian berbual terus dengan Max.",
  heroSub:
    "Setiap senarai ada halaman sendiri dengan gambar, butiran dan butang WhatsApp. Tiada pendaftaran, tiada borang.",
  filterLooking: "Saya ingin",
  filterBuy: "Beli",
  filterRent: "Sewa",
  filterAny: "Beli atau sewa",
  filterType: "Jenis hartanah",
  filterAnyType: "Semua jenis",
  filterSearch: "Cari",
  latest: "Senarai terkini",
  resultsCount: "{n} hartanah",
  empty: "Tiada hartanah yang sepadan dengan carian anda.",
  emptyHint: "Cuba jenis lain, atau kosongkan penapis.",
  clearFilters: "Kosongkan penapis",
  forSale: "Untuk dijual",
  forRent: "Untuk disewa",
  perMonth: "/ bulan",
  booked: "Telah ditempah",
  bed: "bilik tidur",
  bath: "bilik air",
  residential: "Kediaman",
  commercial: "Komersial",
  industrial: "Perindustrian",
  land: "Tanah",
  howTitle: "Cara ia berfungsi",
  how1Title: "Layari",
  how1Text: "Cari mengikut jenis dan harga. Setiap hartanah ada halaman sendiri.",
  how2Title: "Berbual di WhatsApp",
  how2Text:
    "Tekan butang. Mesej sudah menyebut hartanah yang anda lihat.",
  how3Title: "Atur lawatan",
  how3Text: "Max membalas sendiri dan mengatur lawatan serta langkah seterusnya.",
  breadcrumbAll: "Semua senarai",
  askingPrice: "Harga diminta",
  enquire: "Tanya di WhatsApp",
  messageOpens: "Mesej yang akan dibuka:",
  waMessage:
    'Hai Max, saya berminat dengan "{title}" ({price}). {url} Adakah ia masih ada?',
  share: "Kongsi",
  copyLink: "Salin pautan",
  copied: "Pautan disalin",
  details: "Butiran hartanah",
  about: "Tentang hartanah ini",
  highlights: "Ciri utama",
  location: "Lokasi",
  locationNote:
    "Hanya kawasan umum ditunjukkan. Alamat tepat dikongsi apabila anda bertanya.",
  propertyType: "Jenis hartanah",
  bedrooms: "Bilik tidur",
  bathrooms: "Bilik air",
  builtUp: "Keluasan binaan",
  landSize: "Keluasan tanah",
  tenure: "Pegangan",
  titleType: "Jenis hak milik",
  furnishing: "Perabot",
  parking: "Tempat letak kereta",
  facing: "Hala",
  landType: "Jenis tanah",
  photos: "Gambar",
  photoOf: "Gambar {i} daripada {n}",
  prevPhoto: "Gambar sebelumnya",
  nextPhoto: "Gambar seterusnya",
  footerAbout:
    "Pemasaran hartanah berpusat di Ipoh, Perak. Senarai tersedia di seluruh negara.",
  footerContact: "Hubungi",
  footerReg: "REN",
  notFoundTitle: "Halaman tidak ditemui",
  notFoundText:
    "Hartanah mungkin telah dijual atau ditarik balik, atau pautan tidak betul.",
  backToListings: "Kembali ke semua senarai",
  language: "Bahasa",
  browseByCategory: "Layari mengikut kategori",
  viewAllN: "Lihat semua {n}",
  categoryPage: "Hartanah {category}",
  allTypes: "Semua jenis",
  allPurposes: "Beli atau sewa",
  groupBy: "Jenis",
  countProps: "{n} hartanah",
  calcNav: "Kalkulator",
  calcHubTitle: "Kalkulator hartanah",
  calcHubIntro: "Alat percuma untuk membantu anda merancang pembelian. Tiada pendaftaran diperlukan.",
  calcOpen: "Buka kalkulator",
  hlTitle: "Kalkulator pinjaman perumahan",
  hlIntro: "Anggarkan ansuran bulanan, bayaran pendahuluan dan jumlah faedah anda. Keputusan dikemas kini semasa anda menaip.",
  hlCardText: "Anggarkan ansuran bulanan, bayaran pendahuluan dan jumlah faedah.",
  hlPrice: "Harga hartanah (RM)",
  hlMargin: "Margin pembiayaan (%)",
  hlMarginHint: "Peratusan harga yang dibiayai oleh bank.",
  hlTenure: "Tempoh pinjaman (tahun)",
  hlTenureHint: "Tempoh lebih panjang menurunkan ansuran tetapi menambah jumlah faedah.",
  hlRate: "Kadar faedah (% setahun)",
  hlRateHint: "Masukkan kadar bank anda. 4.5% hanyalah contoh.",
  hlYears: "tahun",
  hlReset: "Set semula kepada nilai contoh",
  hlResults: "Anggaran anda",
  hlMonthly: "Anggaran ansuran bulanan",
  hlLoanAmount: "Jumlah pinjaman",
  hlDownPayment: "Bayaran pendahuluan",
  hlTotalInterest: "Jumlah faedah",
  hlTotalRepayment: "Jumlah bayaran balik",
  hlBreakdown: "Ke mana wang anda pergi",
  hlPrincipal: "Jumlah pinjaman",
  hlInterest: "Faedah",
  hlMonthsLabel: "{n} bayaran bulanan",
  hlInvalid: "Sila betulkan ruangan yang ditandakan untuk melihat anggaran anda.",
  hlErrPrice: "Masukkan harga hartanah melebihi RM 0.",
  hlErrPriceHigh: "Harga ini terlalu tinggi untuk kalkulator.",
  hlErrMargin: "Masukkan margin pembiayaan antara 1% dan 100%.",
  hlErrTenure: "Masukkan tempoh antara 1 dan 40 tahun.",
  hlErrRate: "Masukkan kadar faedah antara 0% dan 25%.",
  hlAssumeTitle: "Cara pengiraan",
  hlAssume1: "Kaedah baki berkurangan: faedah dikenakan setiap bulan ke atas baki pinjaman, bukan ke atas jumlah asal.",
  hlAssume2: "Ansuran bulanan = L × r ÷ (1 − (1 + r)^−n), dengan L ialah jumlah pinjaman, r ialah kadar setahun ÷ 12, dan n ialah bilangan bulan.",
  hlAssume3: "Kadar faedah dianggap sama sepanjang tempoh. Kadar bank sebenar boleh berubah dari semasa ke semasa.",
  hlAssume4: "Yuran guaman, duti setem, insurans dan caj lain tidak termasuk.",
  hlAssume5: "Ansuran dibundarkan kepada sen terdekat. Jumlah bayaran balik ialah ansuran darab bilangan bulan.",
  hlDisclaimer: "Kalkulator ini hanya memberi anggaran. Jumlah sebenar bergantung pada terma bank anda dan tertakluk kepada kelulusan bank.",
  hlWhatsapp: "Tanya Max tentang pinjaman ini",
  hlWhatsappMsg: "Hai Max, saya cuba kalkulator pinjaman perumahan: harga hartanah {price}, margin {margin}%, {years} tahun pada {rate}% setahun, kira-kira {monthly} sebulan. Boleh anda nasihatkan saya?",
  dsrTitle: "Kalkulator DSR",
  dsrIntro: "Semak Nisbah Khidmat Hutang (DSR) anda untuk pinjaman hartanah baharu. Isi setiap ruangan dan keputusan dikemas kini semasa anda menaip.",
  dsrCardText: "Semak sama ada pendapatan anda mampu menampung pinjaman hartanah baharu.",
  dsrSecProperty: "1. Pembelian hartanah",
  dsrSecIncome: "2. Pendapatan bersih bulanan",
  dsrSecCommit: "3. Komitmen bulanan sedia ada",
  dsrPriceHint: "Wajib. Harga pembelian hartanah.",
  dsrIncome: "Pendapatan bersih bulanan (RM)",
  dsrIncomeHint: "Wajib. Pendapatan anda selepas potongan KWSP, PERKESO dan cukai pendapatan.",
  dsrCommitNote: "Setiap ruangan wajib diisi. Jika tiada, masukkan 0 atau tekan RM 0.",
  dsrCar: "Pinjaman kereta (RM sebulan)",
  dsrPersonal: "Pinjaman peribadi (RM sebulan)",
  dsrHousing: "Pinjaman perumahan semasa (RM sebulan)",
  dsrPtptn: "PTPTN (RM sebulan)",
  dsrCard: "Komitmen kad kredit (RM sebulan)",
  dsrExpenses: "Perbelanjaan bulanan (RM sebulan)",
  dsrZeroChip: "RM 0",
  dsrPlaceholderAmount: "Masukkan jumlah",
  dsrErrRequired: "Ruangan ini wajib diisi.",
  dsrErrInvalid: "Masukkan nombor yang sah.",
  dsrErrNegative: "Nilai ini tidak boleh negatif.",
  dsrErrZero: "Nilai ini tidak boleh sifar.",
  dsrErrTooHigh: "Jumlah ini terlalu tinggi.",
  dsrProgress: "{n} ruangan masih perlu diisi",
  dsrPending: "Lengkapkan semua ruangan wajib untuk melihat DSR anda.",
  dsrResult: "Keputusan DSR anda",
  dsrNetIncome: "Pendapatan bersih bulanan",
  dsrExisting: "Komitmen bulanan sedia ada",
  dsrNewInstalment: "Anggaran ansuran hartanah baharu",
  dsrTotalCommit: "Jumlah komitmen bulanan",
  dsrDsr: "DSR anda",
  dsrGreen: "Di bawah 75%: dalam had petunjuk",
  dsrRed: "75% atau lebih: melebihi had petunjuk",
  dsrGreenTag: "HIJAU",
  dsrRedTag: "MERAH",
  dsrLimitLine: "75% daripada pendapatan bersih anda ialah {amount} sebulan.",
  dsrLoanLine: "Pinjaman baharu {loan} selama {years} tahun pada {rate}% setahun.",
  dsrWhatsapp: "Bincang DSR saya dengan Max",
  dsrWhatsappMsg: "Hai Max, saya telah menyemak DSR saya: pendapatan bersih {income}, komitmen sedia ada {existing}, ansuran baharu {instalment}, jumlah {total}, DSR {dsr}%. Boleh anda nasihatkan saya?",
  dsrDisclaimer: "Ini ialah pengiraan kemampuan yang bersifat petunjuk. Penilaian DSR sebenar oleh bank berbeza mengikut dasar bank, layanan terhadap pendapatan, perbelanjaan dan komitmen kredit.",
  dsrAssume1: "DSR = (komitmen bulanan sedia ada + ansuran hartanah baharu) ÷ pendapatan bersih bulanan × 100.",
  dsrAssume2: "Ansuran baharu menggunakan formula baki berkurangan ke atas jumlah pinjaman (harga × margin), pada kadar dan tempoh yang anda masukkan.",
  dsrAssume3: "Kalkulator ini menggunakan 75% sebagai panduan. Bank menetapkan had sendiri dan mungkin melayan pendapatan, perbelanjaan dan komitmen secara berbeza.",
  dsrAssume4: "DSR ditunjukkan dua tempat perpuluhan, dan warna mengikut angka yang anda lihat: 75.00% dan ke atas ialah merah.",
  dsrMobileWait: "Lengkapkan semua ruangan",
  rpTitle: "Kalkulator CKHT",
  rpIntro: "Anggarkan Cukai Keuntungan Harta Tanah (CKHT) apabila menjual hartanah di Malaysia. Isi butiran dan keputusan dikemas kini semasa anda menaip.",
  rpCardText: "Anggarkan Cukai Keuntungan Harta Tanah apabila anda menjual hartanah.",
  rpSecCategory: "1. Siapa penjual?",
  rpCategoryHint: "Pilih kategori yang sepadan dengan penjual. Ini menentukan kadar CKHT.",
  rpPart1: "Bahagian I",
  rpPart1Desc: "Warganegara Malaysia, penduduk tetap dan pelupus Bahagian I yang lain.",
  rpPart2: "Bahagian II",
  rpPart2Desc: "Syarikat diperbadankan di Malaysia, pemegang amanah dan badan berdaftar.",
  rpPart3: "Bahagian III",
  rpPart3Desc: "Bukan warganegara, bukan penduduk tetap dan syarikat diperbadankan di luar negara.",
  rpSellerKind: "Penjual ialah",
  rpIndividual: "Individu",
  rpOtherBody: "Syarikat, pemegang amanah atau badan lain",
  rpSellerKindHint: "Hanya individu layak mendapat pengecualian RM10,000 / 10%.",
  rpSecProperty: "2. Butiran hartanah",
  rpAcqPrice: "Harga perolehan (RM)",
  rpDispPrice: "Harga pelupusan (RM)",
  rpAcqDate: "Tarikh perolehan (tarikh PJB)",
  rpDispDate: "Tarikh pelupusan (tarikh PJB)",
  rpDateHint: "Gunakan tarikh perjanjian jual beli.",
  rpSecCosts: "3. Kos yang dibenarkan",
  rpCostsNote: "Masukkan hanya kos yang layak di bawah Akta CKHT dan yang boleh anda buktikan. Tidak semua perbelanjaan hartanah boleh ditolak. Biarkan kosong jika tiada.",
  rpCostAcqLegal: "Yuran guaman perolehan (RM)",
  rpCostDispLegal: "Yuran guaman pelupusan (RM)",
  rpCostStamp: "Duti setem perolehan (RM)",
  rpCostReno: "Perbelanjaan pengubahsuaian atau peningkatan yang layak (RM)",
  rpCostOther: "Perbelanjaan sampingan lain yang dibenarkan (RM)",
  rpOptional: "Pilihan",
  rpSecExemption: "4. Pengecualian",
  rpPrivate: "Saya mahu menuntut pengecualian kediaman persendirian sekali seumur hidup",
  rpPrivateWarn: "Pilihan ini bergantung pada kelayakan dan biasanya tidak boleh ditarik balik. Semak dengan penasihat cukai atau LHDN sebelum bergantung padanya.",
  rpPrivateNA: "Hanya untuk warganegara Malaysia dan penduduk tetap yang merupakan individu (Bahagian I).",
  rpErrCategory: "Sila pilih kategori penjual.",
  rpErrSellerKind: "Sila nyatakan sama ada penjual ialah individu atau syarikat atau badan lain.",
  rpErrRequired: "Ruangan ini wajib diisi.",
  rpErrInvalid: "Masukkan nombor yang sah.",
  rpErrNegative: "Nilai ini tidak boleh negatif.",
  rpErrZero: "Nilai ini mesti lebih daripada sifar.",
  rpErrTooHigh: "Jumlah ini terlalu tinggi.",
  rpErrDateInvalid: "Masukkan tarikh yang sah.",
  rpErrDateEarly: "Tarikh sebelum 1 Januari 1970 tidak disokong.",
  rpErrDateOrder: "Tarikh pelupusan tidak boleh sebelum tarikh perolehan.",
  rpPending: "Lengkapkan ruangan wajib untuk melihat anggaran anda.",
  rpResult: "Anggaran CKHT anda",
  rpResCategory: "Kategori penjual",
  rpResHolding: "Tempoh pegangan",
  rpResRate: "Kadar CKHT yang terpakai",
  rpResAcq: "Harga perolehan",
  rpResDisp: "Harga pelupusan",
  rpResCosts: "Jumlah perbelanjaan dibenarkan",
  rpResAdjusted: "Keuntungan terlaras",
  rpResExemption: "Pengecualian yang terpakai",
  rpResChargeable: "Keuntungan boleh dikenakan cukai",
  rpResTax: "Anggaran CKHT yang perlu dibayar",
  rpBandWithin3: "Dalam tempoh 3 tahun",
  rpBandYear4: "Tahun ke-4",
  rpBandYear5: "Tahun ke-5",
  rpBandYear6: "Tahun ke-6 dan seterusnya",
  rpPeriod: "Tempoh pelupusan",
  rpRatesTitle: "Kadar CKHT (Jadual 5)",
  rpExIndividual: "Pengecualian individu: yang lebih tinggi antara RM10,000 atau 10% daripada keuntungan",
  rpExPrivate: "Pengecualian kediaman persendirian (sekali seumur hidup)",
  rpExNone: "Tiada (tidak tersedia untuk syarikat dan badan lain)",
  rpNoGain: "Tiada keuntungan boleh dikenakan cukai, jadi tiada CKHT perlu dibayar.",
  rpLossNote: "Pelupusan ini tidak menunjukkan keuntungan, jadi tiada CKHT perlu dibayar.",
  rpAssumeTitle: "Cara pengiraan",
  rpAssume1: "Keuntungan terlaras = harga pelupusan − harga perolehan − perbelanjaan dibenarkan.",
  rpAssume2: "Tempoh pegangan dikira dari tarikh PJB perolehan hingga tarikh PJB pelupusan menggunakan ulang tahun, bukan dengan menolak tahun kalendar. Pelupusan pada tarikh ulang tahun kekal dalam tempoh yang lebih awal.",
  rpAssume3: "Individu mendapat pengecualian yang lebih tinggi antara RM10,000 atau 10% daripada keuntungan, tidak melebihi keuntungan. Syarikat, pemegang amanah dan badan lain tidak mendapatnya.",
  rpAssume4: "Keuntungan boleh dikenakan cukai = keuntungan terlaras − pengecualian. CKHT = keuntungan boleh dikenakan cukai × kadar bagi kategori dan tempoh pegangan anda.",
  rpAssume5: "Jika tiada keuntungan boleh dikenakan cukai yang positif, CKHT ialah RM 0.",
  rpAssume6: "Pengecualian kediaman persendirian adalah pilihan, hanya untuk individu Bahagian I, dan hanya terpakai jika anda menandanya.",
  rpDisclaimer: "Ini ialah anggaran petunjuk berdasarkan Akta Cukai Keuntungan Harta Tanah 1976 dan Jadual 5. CKHT sebenar bergantung pada penilaian LHDN, kelayakan anda untuk pengecualian dan dokumen yang anda kemukakan. Ini bukan nasihat cukai.",
  rpRetention: "Jumlah penahanan yang mungkin perlu ditahan oleh pembeli di bawah seksyen 21B adalah perkara berasingan. Ia tidak dikira di sini dan tidak sama dengan CKHT yang perlu dibayar.",
  rpWhatsapp: "Bincang CKHT saya dengan Max",
  rpWhatsappMsg: "Hai Max, saya cuba kalkulator CKHT: {category}, diperoleh {acq} pada harga {acqPrice}, dilupuskan {disp} pada harga {dispPrice}. Anggaran CKHT {tax}. Boleh anda nasihatkan saya?",
};

const zh: Dict = {
  navListings: "全部房源",
  navSale: "出售",
  navRent: "出租",
  navLand: "土地",
  navResidential: "住宅",
  navCommercial: "商业",
  navIndustrial: "工业",
  whatsappUs: "WhatsApp 联系",
  heroKicker: "怡保、霹雳及全马各地",
  heroTitle: "找到您的下一处房产，然后直接和 Max 聊聊。",
  heroSub:
    "每个房源都有独立页面，附照片、详情和 WhatsApp 按钮。无需注册，无需填表。",
  filterLooking: "我想",
  filterBuy: "购买",
  filterRent: "租赁",
  filterAny: "购买或租赁",
  filterType: "房产类型",
  filterAnyType: "全部类型",
  filterSearch: "搜索",
  latest: "最新房源",
  resultsCount: "共 {n} 个房产",
  empty: "没有符合条件的房产。",
  emptyHint: "请换一种类型，或清除筛选条件。",
  clearFilters: "清除筛选",
  forSale: "出售",
  forRent: "出租",
  perMonth: "/ 月",
  booked: "已预订",
  bed: "卧室",
  bath: "浴室",
  residential: "住宅",
  commercial: "商业",
  industrial: "工业",
  land: "土地",
  howTitle: "如何运作",
  how1Title: "浏览",
  how1Text: "按类型和价格搜索，每个房产都有独立页面。",
  how2Title: "WhatsApp 联系",
  how2Text: "点击按钮，消息已写明您正在查看的房产。",
  how3Title: "安排看房",
  how3Text: "Max 会亲自回复，并安排看房及后续事宜。",
  breadcrumbAll: "全部房源",
  askingPrice: "要价",
  enquire: "通过 WhatsApp 咨询",
  messageOpens: "将打开的消息：",
  waMessage: "你好 Max，我对“{title}”（{price}）有兴趣。{url} 请问还在吗？",
  share: "分享",
  copyLink: "复制链接",
  copied: "链接已复制",
  details: "房产详情",
  about: "关于此房产",
  highlights: "亮点",
  location: "位置",
  locationNote: "仅显示大致区域，确切地址将在您咨询时提供。",
  propertyType: "房产类型",
  bedrooms: "卧室",
  bathrooms: "浴室",
  builtUp: "建筑面积",
  landSize: "土地面积",
  tenure: "地契年限",
  titleType: "地契类型",
  furnishing: "家具",
  parking: "车位",
  facing: "朝向",
  landType: "土地类型",
  photos: "照片",
  photoOf: "第 {i} 张，共 {n} 张",
  prevPhoto: "上一张",
  nextPhoto: "下一张",
  footerAbout: "总部设于霹雳怡保的房产营销，房源遍及全马。",
  footerContact: "联系方式",
  footerReg: "REN",
  notFoundTitle: "找不到该页面",
  notFoundText: "该房产可能已售出或下架，或链接有误。",
  backToListings: "返回全部房源",
  language: "语言",
  browseByCategory: "按类别浏览",
  viewAllN: "查看全部 {n} 个",
  categoryPage: "{category}房产",
  allTypes: "全部类型",
  allPurposes: "购买或租赁",
  groupBy: "类型",
  countProps: "共 {n} 个房产",
  calcNav: "计算器",
  calcHubTitle: "房产计算器",
  calcHubIntro: "免费工具，帮助您规划购房。无需注册。",
  calcOpen: "打开计算器",
  hlTitle: "房屋贷款计算器",
  hlIntro: "估算您的每月还款额、首期付款和总利息。输入时结果即时更新。",
  hlCardText: "估算每月还款额、首期付款和总利息。",
  hlPrice: "房产价格（RM）",
  hlMargin: "贷款成数（%）",
  hlMarginHint: "银行提供贷款占房价的比例。",
  hlTenure: "贷款年限（年）",
  hlTenureHint: "年限越长，每月还款越低，但总利息越高。",
  hlRate: "年利率（%）",
  hlRateHint: "请输入您银行的利率。4.5% 仅为示例。",
  hlYears: "年",
  hlReset: "恢复示例数值",
  hlResults: "您的估算结果",
  hlMonthly: "预计每月还款额",
  hlLoanAmount: "贷款金额",
  hlDownPayment: "首期付款",
  hlTotalInterest: "总利息",
  hlTotalRepayment: "总还款额",
  hlBreakdown: "您的钱用在哪里",
  hlPrincipal: "贷款本金",
  hlInterest: "利息",
  hlMonthsLabel: "共 {n} 期月供",
  hlInvalid: "请更正标出的栏位，以查看您的估算结果。",
  hlErrPrice: "请输入大于 RM 0 的房产价格。",
  hlErrPriceHigh: "此价格超出计算器范围。",
  hlErrMargin: "请输入 1% 至 100% 之间的贷款成数。",
  hlErrTenure: "请输入 1 至 40 年之间的贷款年限。",
  hlErrRate: "请输入 0% 至 25% 之间的年利率。",
  hlAssumeTitle: "计算方法",
  hlAssume1: "递减余额法：利息按尚未还清的贷款余额逐月计算，而不是按原始贷款额计算。",
  hlAssume2: "每月还款额 = L × r ÷ (1 − (1 + r)^−n)，其中 L 为贷款金额，r 为年利率 ÷ 12，n 为总月数。",
  hlAssume3: "假设整个贷款期间利率不变。银行实际利率可能随时间变动。",
  hlAssume4: "不包括律师费、印花税、保险及其他费用。",
  hlAssume5: "每月还款额四舍五入至最接近的仙。总还款额 = 每月还款额 × 月数。",
  hlDisclaimer: "本计算器仅提供估算。实际金额取决于银行的条款，并须经银行批准。",
  hlWhatsapp: "向 Max 咨询此贷款",
  hlWhatsappMsg: "你好 Max，我试用了房屋贷款计算器：房产价格 {price}，贷款成数 {margin}%，{years} 年，年利率 {rate}%，每月约 {monthly}。可以给我一些建议吗？",
  dsrTitle: "DSR 计算器",
  dsrIntro: "查看您申请新房贷时的债务偿还比率（DSR）。请填写每一栏，结果会在输入时即时更新。",
  dsrCardText: "查看您的收入能否支持新的房贷。",
  dsrSecProperty: "1. 购房资料",
  dsrSecIncome: "2. 每月净收入",
  dsrSecCommit: "3. 现有每月负担",
  dsrPriceHint: "必填。房产的购买价格。",
  dsrIncome: "每月净收入（RM）",
  dsrIncomeHint: "必填。扣除 EPF、SOCSO 和所得税后的收入。",
  dsrCommitNote: "每一栏都必须填写。如果没有，请输入 0 或点击 RM 0。",
  dsrCar: "汽车贷款（每月 RM）",
  dsrPersonal: "个人贷款（每月 RM）",
  dsrHousing: "现有房屋贷款（每月 RM）",
  dsrPtptn: "PTPTN（每月 RM）",
  dsrCard: "信用卡月供（每月 RM）",
  dsrExpenses: "每月开销（每月 RM）",
  dsrZeroChip: "RM 0",
  dsrPlaceholderAmount: "输入金额",
  dsrErrRequired: "此栏必填。",
  dsrErrInvalid: "请输入有效数字。",
  dsrErrNegative: "不能为负数。",
  dsrErrZero: "不能为零。",
  dsrErrTooHigh: "金额过高。",
  dsrProgress: "还有 {n} 栏需要填写",
  dsrPending: "请填写所有必填栏，以查看您的 DSR。",
  dsrResult: "您的 DSR 结果",
  dsrNetIncome: "每月净收入",
  dsrExisting: "现有每月负担",
  dsrNewInstalment: "预计新房产月供",
  dsrTotalCommit: "每月总负担",
  dsrDsr: "您的 DSR",
  dsrGreen: "低于 75%：在参考限额内",
  dsrRed: "75% 或以上：超出参考限额",
  dsrGreenTag: "绿色",
  dsrRedTag: "红色",
  dsrLimitLine: "您净收入的 75% 为每月 {amount}。",
  dsrLoanLine: "新贷款 {loan}，{years} 年，年利率 {rate}%。",
  dsrWhatsapp: "与 Max 讨论我的 DSR",
  dsrWhatsappMsg: "你好 Max，我查看了我的 DSR：每月净收入 {income}，现有负担 {existing}，新月供 {instalment}，总额 {total}，DSR {dsr}%。可以给我一些建议吗？",
  dsrDisclaimer: "这只是参考性的负担能力计算。银行实际的 DSR 评估会因银行政策，以及对收入、开销和信贷负担的处理方式而有所不同。",
  dsrAssume1: "DSR =（现有每月负担 + 新房产月供）÷ 每月净收入 × 100。",
  dsrAssume2: "新月供按递减余额法，以贷款金额（价格 × 贷款成数）及您输入的利率和年限计算。",
  dsrAssume3: "本计算器以 75% 作为参考。各银行有自己的限额，对收入、开销和负担的处理也可能不同。",
  dsrAssume4: "DSR 显示至两位小数，颜色依据您看到的数字：75.00% 及以上为红色。",
  dsrMobileWait: "请填写所有栏位",
  rpTitle: "RPGT 计算器",
  rpIntro: "估算在马来西亚出售房产时需缴交的不动产盈利税（RPGT）。填写资料后，结果会在输入时即时更新。",
  rpCardText: "估算出售房产时需缴交的不动产盈利税。",
  rpSecCategory: "1. 卖家是谁？",
  rpCategoryHint: "请选择与卖家相符的类别，这将决定适用的 RPGT 税率。",
  rpPart1: "第一部分",
  rpPart1Desc: "马来西亚公民、永久居民及其他第一部分处置人。",
  rpPart2: "第二部分",
  rpPart2Desc: "在马来西亚注册成立的公司、受托人及注册团体。",
  rpPart3: "第三部分",
  rpPart3Desc: "非公民、非永久居民及外国注册公司。",
  rpSellerKind: "卖家是",
  rpIndividual: "个人",
  rpOtherBody: "公司、受托人或其他团体",
  rpSellerKindHint: "只有个人才能享有 RM10,000 / 10% 的豁免。",
  rpSecProperty: "2. 房产资料",
  rpAcqPrice: "购入价格（RM）",
  rpDispPrice: "出售价格（RM）",
  rpAcqDate: "购入日期（买卖合约日期）",
  rpDispDate: "出售日期（买卖合约日期）",
  rpDateHint: "请使用买卖合约（SPA）上的日期。",
  rpSecCosts: "3. 可扣除费用",
  rpCostsNote: "请只填写符合 RPGT 法令规定且有凭证的费用。并非所有房产开销都可扣除。没有的栏位请留空。",
  rpCostAcqLegal: "购入律师费（RM）",
  rpCostDispLegal: "出售律师费（RM）",
  rpCostStamp: "购入印花税（RM）",
  rpCostReno: "符合资格的装修或提升开销（RM）",
  rpCostOther: "其他可扣除的附带开销（RM）",
  rpOptional: "选填",
  rpSecExemption: "4. 豁免",
  rpPrivate: "我想申请一生一次的自住房产豁免",
  rpPrivateWarn: "此选择取决于是否符合资格，且一般不可撤销。在依赖之前，请向税务顾问或 LHDN 查证。",
  rpPrivateNA: "仅适用于属于个人的马来西亚公民和永久居民（第一部分）。",
  rpErrCategory: "请选择卖家类别。",
  rpErrSellerKind: "请说明卖家是个人，还是公司或其他团体。",
  rpErrRequired: "此栏必填。",
  rpErrInvalid: "请输入有效数字。",
  rpErrNegative: "不能为负数。",
  rpErrZero: "必须大于零。",
  rpErrTooHigh: "金额过高。",
  rpErrDateInvalid: "请输入有效日期。",
  rpErrDateEarly: "不支持 1970 年 1 月 1 日之前的日期。",
  rpErrDateOrder: "出售日期不能早于购入日期。",
  rpPending: "请填写必填栏位以查看估算结果。",
  rpResult: "您的 RPGT 估算",
  rpResCategory: "卖家类别",
  rpResHolding: "持有期",
  rpResRate: "适用的 RPGT 税率",
  rpResAcq: "购入价格",
  rpResDisp: "出售价格",
  rpResCosts: "可扣除费用总额",
  rpResAdjusted: "调整后盈利",
  rpResExemption: "适用豁免",
  rpResChargeable: "应课税盈利",
  rpResTax: "预计应缴 RPGT",
  rpBandWithin3: "3 年内",
  rpBandYear4: "第 4 年",
  rpBandYear5: "第 5 年",
  rpBandYear6: "第 6 年起",
  rpPeriod: "出售时期",
  rpRatesTitle: "RPGT 税率（附表 5）",
  rpExIndividual: "个人豁免：RM10,000 或盈利的 10%，取较高者",
  rpExPrivate: "自住房产豁免（一生一次）",
  rpExNone: "无（公司及其他团体不适用）",
  rpNoGain: "没有应课税盈利，因此无须缴交 RPGT。",
  rpLossNote: "此次出售没有盈利，因此无须缴交 RPGT。",
  rpAssumeTitle: "计算方法",
  rpAssume1: "调整后盈利 = 出售价格 − 购入价格 − 可扣除费用。",
  rpAssume2: "持有期是按购入买卖合约日期至出售买卖合约日期的周年来计算，而不是把日历年份相减。恰好在周年日出售，仍属较早的时期。",
  rpAssume3: "个人可获豁免，金额为 RM10,000 或盈利的 10%（取较高者），但不超过盈利。公司、受托人及其他团体不适用。",
  rpAssume4: "应课税盈利 = 调整后盈利 − 豁免。RPGT = 应课税盈利 × 您的类别与持有期所对应的税率。",
  rpAssume5: "如果没有正数的应课税盈利，RPGT 为 RM 0。",
  rpAssume6: "自住房产豁免为选填，仅适用于第一部分的个人，并且只有在您勾选后才会应用。",
  rpDisclaimer: "这是根据 1976 年不动产盈利税法令及附表 5 所作的参考估算。实际 RPGT 取决于 LHDN 的评估、您是否符合豁免资格以及您提交的文件。此内容不构成税务意见。",
  rpRetention: "买方依据第 21B 条可能需要扣留的保留金是另一回事。此处不作计算，也不等于应缴的 RPGT。",
  rpWhatsapp: "与 Max 讨论我的 RPGT",
  rpWhatsappMsg: "你好 Max，我试用了 RPGT 计算器：{category}，{acq} 以 {acqPrice} 购入，{disp} 以 {dispPrice} 出售，预计 RPGT {tax}。可以给我一些建议吗？",
};

export const DICTS: Record<Lang, Dict> = { en, ms, zh };

export function t(lang: Lang): Dict {
  return DICTS[lang];
}

export function fill(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(values[k] ?? ""));
}

/** "1 property" / "3 properties" (BM and Chinese have no plural). */
export function countText(lang: Lang, n: number): string {
  if (lang === "en" && n === 1) return "1 property";
  return fill(t(lang).countProps, { n });
}

/** Link prefix for a language: "" (English), "/ms" or "/zh". */
export function basePath(lang: Lang): string {
  return pathFor(lang, "/") === "/" ? "" : pathFor(lang, "/");
}

/** "1 field still needs an answer" / "3 fields still need an answer" (BM and Chinese have no plural). */
export function fieldsLeftText(lang: Lang, n: number): string {
  if (lang === "en" && n === 1) return "1 field still needs an answer";
  return fill(t(lang).dsrProgress, { n });
}

/** "4 years, 2 months, 5 days" (English pluralises; BM and Chinese have no plural). */
export function holdingText(lang: Lang, years: number, months: number, days: number): string {
  if (lang === "ms") return `${years} tahun, ${months} bulan, ${days} hari`;
  if (lang === "zh") return `${years} 年 ${months} 个月 ${days} 天`;
  const unit = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  return `${unit(years, "year", "years")}, ${unit(months, "month", "months")}, ${unit(days, "day", "days")}`;
}
