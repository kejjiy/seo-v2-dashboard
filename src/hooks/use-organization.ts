import supabaseClient from "@/lib/supabase-client";
import { useQuery } from "@tanstack/react-query";
import { Database } from "@/types/database";

export type Organization = Database["public"]["Tables"]["organizations"]["Row"];

export function useUserOrganization() {
    const queryFn = async (): Promise<Organization | null> => {
        const { data: sessionData, error: sessionError } =
            await supabaseClient.auth.getSession();

        if (sessionError || !sessionData?.session) {
            return null;
        }

        const { data: memberData, error: memberError } = await supabaseClient
            .from("members")
            .select("organization_id")
            .limit(1)
            .single();

        if (memberError || !memberData) {
            return null;
        }

        const { data, error } = await supabaseClient
            .from("organizations")
            .select("*")
            .eq("id", memberData.organization_id)
            .single();

        if (error) {
            throw error;
        }

        return data;
    };

    return useQuery({
        queryKey: ["userOrganization"],
        queryFn,
    });
}
