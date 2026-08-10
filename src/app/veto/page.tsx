import { VetoConfirmation } from "./veto-confirmation";

interface VetoPageProps {
    searchParams?: Promise<{
        token?: string;
    }>;
}

export default async function VetoPage({ searchParams }: VetoPageProps) {
    const params = (await searchParams) ?? {};
    const token =
        typeof params.token === "string" ? params.token : "";
    return <VetoConfirmation token={token} />;
}
