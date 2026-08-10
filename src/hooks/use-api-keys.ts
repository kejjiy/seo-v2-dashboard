import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import supabaseClient from "@/lib/supabase-client";
import { getEngineApiBaseUrl } from "@/lib/engine";

const ENGINE_URL = getEngineApiBaseUrl();

export function useAPIKeys(siteId: string) {
    const queryClient = useQueryClient();

    // Fetch keys from Supabase directly (explicit columns to exclude key_hash — F1 fix)
    const { data: keys, isLoading } = useQuery({
        queryKey: ["apiKeys", siteId],
        queryFn: async () => {
            const { data, error } = await supabaseClient
                .from('api_keys')
                .select('id, organization_id, site_id, prefix, name, status, created_at')
                .eq('site_id', siteId)
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
    });

    // Helper to get auth headers for Engine API calls (F3/F6 fix)
    const getAuthHeaders = async (): Promise<Record<string, string>> => {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) throw new Error("No active session");
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
        };
    };

    // Create a new key via the Engine API
    // organization_id is no longer sent from client — derived server-side (F6 fix)
    const createKeyMutation = useMutation({
        mutationFn: async (name: string) => {
            const headers = await getAuthHeaders();

            const response = await fetch(`${ENGINE_URL}/api/v1/sites/${siteId}/keys`, {
                method: "POST",
                headers,
                body: JSON.stringify({ name }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Failed to generate API Key");
            }

            return response.json(); // { plain_key: string, key_info: dict }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["apiKeys", siteId] });
        },
    });

    // Revoke a key via the Engine API
    const revokeKeyMutation = useMutation({
        mutationFn: async (keyId: string) => {
            const headers = await getAuthHeaders();

            const response = await fetch(`${ENGINE_URL}/api/v1/keys/${keyId}`, {
                method: "DELETE",
                headers,
            });

            if (!response.ok) {
                throw new Error("Failed to revoke API Key");
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["apiKeys", siteId] });
        },
    });

    return {
        keys,
        isLoading,
        createKey: createKeyMutation.mutateAsync,
        isCreating: createKeyMutation.isPending,
        revokeKey: revokeKeyMutation.mutateAsync,
        isRevoking: revokeKeyMutation.isPending,
    };
}
