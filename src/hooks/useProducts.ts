import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/lib/data";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("products")
        .select(`
          *,
          profiles(*),
          categories(name)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
        return [];
      }

      if (!data) return [];

      // Transform data to match existing frontend types
      return data.map((item: any) => {
        return {
          id: item.id,
          title: item.title,
          category: item.categories?.name || "Bilinmiyor",
          categorySlug: item.category_slug,
          image: item.image || "https://placehold.co/600x400/e2e8f0/64748b?text=Urun",
          description: item.description,
          price: item.price,
          priceType: item.price_type,
          minOrder: item.min_order,
          harvestDate: item.harvest_date,
          stock: item.stock,
          city: item.city,
          district: item.district,
          isOrganic: item.is_organic,
          isVerified: item.is_verified,
          producer: {
            id: item.profiles?.id || item.producer_id,
            name: item.profiles?.full_name || "Bilinmeyen Üretici",
            avatar: item.profiles?.avatar_url || "",
            city: item.profiles?.city || item.city,
            rating: item.profiles?.rating || 0,
            totalProducts: item.profiles?.total_products || 0,
            isVerified: item.profiles?.is_verified || false,
            memberSince: item.profiles?.member_since || "Yeni",
          }
        } as Product;
      });
    },
  });
}
