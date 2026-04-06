export interface Producer {
  id: string;
  name: string;
  avatar: string;
  city: string;
  rating: number;
  totalProducts: number;
  isVerified: boolean;
  memberSince: string;
}

export type PriceType = "kg" | "ton" | "negotiable" | "quote";

export const priceTypeLabels: Record<string, string> = {
  kg: "₺ / kg",
  ton: "₺ / ton",
  negotiable: "Fiyat Görüşülür",
  quote: "Teklif İstenmeli",
};

export interface Product {
  id: string;
  title: string;
  category: string;
  categorySlug: string;
  image: string;
  description: string;
  price: number | null;
  priceType: PriceType;
  minOrder: string;
  harvestDate: string;
  stock: string;
  city: string;
  district: string;
  producer: Producer;
  isOrganic: boolean;
  isVerified: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  count?: number;
}

// Data is now fetched from Supabase using useProducts and useCategories hooks
// The empty arrays are here just to satisfy any stray imports, but you should not depend on them.
export const categories: Category[] = [];
export const products: Product[] = [];

export const cities = [
  "Tüm Türkiye",
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir",
  "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır",
  "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay",
  "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli",
  "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu",
  "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa",
  "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak",
  "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];
