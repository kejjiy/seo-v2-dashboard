import { env } from "@/lib/env";
import supabaseClient from "@/lib/supabase-client";

export function getEngineApiBaseUrl() {
    return env().NEXT_PUBLIC_ENGINE_API_BASE_URL.replace(/\/+$/, "");
}

export function getEngineInternalApiBaseUrl() {
    return env().ENGINE_API_BASE_URL.replace(/\/+$/, "");
}

export async function getEngineAuthHeaders() {
    const {
        data: { session },
    } = await supabaseClient.auth.getSession();

    if (!session?.access_token) {
        throw new Error("No active session");
    }

    return {
        Authorization: `Bearer ${session.access_token}`,
    };
}
