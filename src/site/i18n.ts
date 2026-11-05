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
export const LANG_COOKIE = "mp_lang";

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

export function parseLang(value: string | undefined | null): Lang {
  return (LANGS as readonly string[]).includes(value ?? "")
    ? (value as Lang)
    : "en";
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
  footerReg: "Registration",
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
  footerReg: "Pendaftaran",
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
  footerReg: "注册号",
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

/** Browser only: remember the visitor's language for a year. */
export function rememberLang(lang: Lang): void {
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
}

/** "1 property" / "3 properties" (BM and Chinese have no plural). */
export function countText(lang: Lang, n: number): string {
  if (lang === "en" && n === 1) return "1 property";
  return fill(t(lang).countProps, { n });
}
