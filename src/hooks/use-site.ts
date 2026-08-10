import supabaseClient from "@/lib/supabase-client";
import { useQuery } from "@tanstack/react-query";
import { Database } from "@/types/database";

export type Site = Database['public']['Tables']['sites']['Row'];

export function useSite(siteId: string) {
    return useQuery({
        queryKey: ["site", siteId],
        queryFn: async (): Promise<Site> => {
            const { data, error } = await supabaseClient
                .from('sites')
                .select('*')
                .eq('id', siteId)
                .single();

            if (error) throw error;
            return data;
        },
    });
}
