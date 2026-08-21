import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const favoritesKey = ["favorites", user?.id] as const;

  const { data: favoriteIds = [] } = useQuery({
    queryKey: favoritesKey,
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("favorites")
        .select("product_id")
        .eq("user_id", user!.id);
      return (data ?? []).map((f) => f.product_id);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) return;
      const isFav = favoriteIds.includes(productId);
      if (isFav) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: user.id, product_id: productId });
        if (error) throw error;
      }
    },
    // Optimistic update: flip the id in the local cache immediately instead
    // of waiting on a full refetch, and roll back if the request fails.
    onMutate: async (productId: string) => {
      await queryClient.cancelQueries({ queryKey: favoritesKey });
      const previous = queryClient.getQueryData<string[]>(favoritesKey) ?? [];
      const next = previous.includes(productId)
        ? previous.filter((id) => id !== productId)
        : [...previous, productId];
      queryClient.setQueryData(favoritesKey, next);
      return { previous };
    },
    onError: (_err, _productId, context) => {
      if (context) queryClient.setQueryData(favoritesKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: favoritesKey });
    },
  });

  return {
    favoriteIds,
    isFavorite: (productId: string) => favoriteIds.includes(productId),
    toggle: (productId: string) => toggleMutation.mutate(productId),
  };
}
