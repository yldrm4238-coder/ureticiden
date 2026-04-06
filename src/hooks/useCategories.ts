import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("categories")
        .select("*")
        .order("name", { ascending: true });
        
      if (error) {
        console.error("Error fetching categories:", error);
        return [];
      }
      return data || [];
    },
  });
}
