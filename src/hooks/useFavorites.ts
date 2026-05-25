import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favoriteIds = [] } = useQuery({
    queryKey: ["favorites", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("favorites")
        .select("product_id")
        .eq("user_id", user!.id);
      return (data || []).map((f: any) => f.product_id as string);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) return;
      const isFav = favoriteIds.includes(productId);
      if (isFav) {
        await (supabase as any)
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);
      } else {
        await (supabase as any)
          .from("favorites")
          .insert({ user_id: user.id, product_id: productId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] });
    },
  });

  return {
    favoriteIds,
    isFavorite: (productId: string) => favoriteIds.includes(productId),
    toggle: (productId: string) => toggleMutation.mutate(productId),
  };
}
