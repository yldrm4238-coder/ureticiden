export interface Producer {
  id: string;
  name: string;
  avatar: string;
  city: string;
  rating: number;
  totalProducts: number;
  isVerified: boolean;
  memberSince: string;
  phone?: string;
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
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin", "Aydın",
  "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa",
  "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce",
  "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane",
  "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul", "İzmir",
  "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kilis", "Kırıkkale", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya",
  "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye",
  "Rize", "Sakarya", "Samsun", "Şanlıurfa", "Siirt", "Sinop", "Şırnak", "Sivas",
  "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"
];
