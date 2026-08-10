"use client";

import * as React from "react";
import { useState } from "react";
import LayoutSidebar from "@/components/layout-sidebar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useUserOrganization } from "@/hooks/use-organization";
import { updateAgencyBranding, BrandingFormData } from "@/actions/branding";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_COLOR = "#059669";

export default function BrandingSettingsPage() {
    const { data: organization, isLoading } = useUserOrganization();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState<BrandingFormData>({
        agency_name: "",
        agency_logo_url: "",
        agency_primary_color: DEFAULT_COLOR,
        agency_contact_email: "",
    });

    React.useEffect(() => {
        if (organization) {
            setFormData({
                agency_name: organization.agency_name || "",
                agency_logo_url: organization.agency_logo_url || "",
                agency_primary_color:
                    organization.agency_primary_color || DEFAULT_COLOR,
                agency_contact_email: organization.agency_contact_email || "",
            });
        }
    }, [organization]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!organization) return;

        setIsSaving(true);
        try {
            await updateAgencyBranding(organization.id, formData);
            toast({
                title: "Success",
                description: "Branding settings saved successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to save branding settings",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <LayoutSidebar>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </LayoutSidebar>
        );
    }

    if (!organization) {
        return (
            <LayoutSidebar>
                <div className="container py-8 text-center text-muted-foreground">
                    Organization not found.
                </div>
            </LayoutSidebar>
        );
    }

    return (
        <LayoutSidebar>
            <div className="container py-8 max-w-2xl">
                <div className="mb-8">
                    <Breadcrumbs
                        items={[
                            { label: "Dashboard", href: "/dashboard" },
                            {
                                label: "Settings",
                                href: "/dashboard/settings/branding",
                            },
                            {
                                label: "Branding",
                                href: "/dashboard/settings/branding",
                                active: true,
                            },
                        ]}
                    />
                    <div className="mt-4">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Agency Branding
                        </h1>
                        <p className="text-muted-foreground">
                            Configure your agency branding for PDF reports
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="agency_name">Agency Name</Label>
                        <Input
                            id="agency_name"
                            value={formData.agency_name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    agency_name: e.target.value,
                                })
                            }
                            placeholder="Your Agency Name"
                        />
                        <p className="text-xs text-muted-foreground">
                            This name will appear on all generated PDF reports.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="agency_logo_url">Logo URL</Label>
                        <Input
                            id="agency_logo_url"
                            type="url"
                            value={formData.agency_logo_url}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    agency_logo_url: e.target.value,
                                })
                            }
                            placeholder="https://example.com/logo.png"
                        />
                        <p className="text-xs text-muted-foreground">
                            URL to your agency logo (HTTPS only). Recommended
                            size: 200x80px.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="agency_primary_color">
                            Primary Color
                        </Label>
                        <div className="flex gap-3 items-center">
                            <Input
                                id="agency_primary_color"
                                type="color"
                                value={formData.agency_primary_color}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        agency_primary_color: e.target.value,
                                    })
                                }
                                className="w-16 h-10 p-1 cursor-pointer"
                            />
                            <Input
                                type="text"
                                value={formData.agency_primary_color}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        agency_primary_color: e.target.value,
                                    })
                                }
                                placeholder="#059669"
                                className="flex-1"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Primary color for report headers and accents.
                            Default: Emerald-600 (#059669).
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="agency_contact_email">
                            Contact Email
                        </Label>
                        <Input
                            id="agency_contact_email"
                            type="email"
                            value={formData.agency_contact_email}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    agency_contact_email: e.target.value,
                                })
                            }
                            placeholder="contact@agency.com"
                        />
                        <p className="text-xs text-muted-foreground">
                            Contact email displayed in report footers.
                        </p>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </LayoutSidebar>
    );
}
