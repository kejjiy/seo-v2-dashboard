"use server";

import createClient from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;
const DEFAULT_COLOR = "#059669";

function validateHexColor(color: string | null | undefined): string {
    if (!color) return DEFAULT_COLOR;
    const trimmed = color.trim();
    if (!HEX_COLOR_REGEX.test(trimmed)) {
        throw new Error(`Invalid hex color format: ${color}. Expected format: #RRGGBB`);
    }
    return trimmed;
}

function validateLogoUrl(url: string | null | undefined): string | null {
    if (!url) return null;

    try {
        const parsed = new URL(url);
        if (parsed.protocol !== "https:") {
            throw new Error("Logo URL must use HTTPS");
        }

        const blockedHosts = [
            "localhost",
            "127.0.0.1",
            "0.0.0.0",
            "::1",
        ];

        const hostname = parsed.hostname;
        const isPrivateIp =
            hostname.startsWith("10.") ||
            hostname.startsWith("192.168.") ||
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);

        if (blockedHosts.includes(hostname) || isPrivateIp) {
            throw new Error("Logo URL cannot point to internal addresses");
        }

        return url;
    } catch (e) {
        if (e instanceof TypeError) {
            throw new Error("Invalid URL format");
        }
        throw e;
    }
}

export interface BrandingFormData {
    agency_name: string;
    agency_logo_url: string;
    agency_primary_color: string;
    agency_contact_email: string;
}

export async function getOrganizationBranding(organizationId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("organizations")
        .select(
            "agency_name, agency_logo_url, agency_primary_color, agency_contact_email"
        )
        .eq("id", organizationId)
        .single();

    if (error) {
        throw new Error(`Failed to fetch branding: ${error.message}`);
    }

    return data;
}

export async function updateAgencyBranding(
    organizationId: string,
    formData: BrandingFormData
) {
    const supabase = await createClient();

    const validatedColor = validateHexColor(formData.agency_primary_color);
    const validatedLogoUrl = validateLogoUrl(formData.agency_logo_url);

    const { error } = await supabase
        .from("organizations")
        .update({
            agency_name: formData.agency_name?.trim() || null,
            agency_logo_url: validatedLogoUrl,
            agency_primary_color: validatedColor,
            agency_contact_email: formData.agency_contact_email?.trim() || null,
        })
        .eq("id", organizationId);

    if (error) {
        throw new Error(`Failed to update branding: ${error.message}`);
    }

    revalidatePath("/dashboard/settings/branding");
    return { success: true };
}
