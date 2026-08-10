import supabaseClient from "@/lib/supabase-client";
import { useQuery } from "@tanstack/react-query";
import { Database } from "@/types/database";

export type Site = Database['public']['Tables']['sites']['Row'];

export function useUserSites() {
    const queryFn = async (): Promise<Site[]> => {
        const { data: sessionData, error: sessionError } = await supabaseClient
            .auth.getSession();

        if (sessionError || !sessionData?.session) {
            return [];
        }

        const { data, error } = await supabaseClient
            .from('sites')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return data ?? [];
    };

    return useQuery({
        queryKey: ["userSites"],
        queryFn,
    });
}
