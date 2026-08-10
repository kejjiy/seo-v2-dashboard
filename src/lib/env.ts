const envRef = {
    current: {
        SUPABASE_URL: "",
        SUPABASE_ANON_KEY: "",
        SUPABASE_BASE_KEY: "",
        NEXT_PUBLIC_ENGINE_API_BASE_URL: "",
        ENGINE_API_BASE_URL: "",
    },
};

export const reloadEnv = () => {
    envRef.current = {
        SUPABASE_URL: String(process.env.SUPABASE_URL),
        SUPABASE_ANON_KEY: String(process.env.SUPABASE_ANON_KEY),
        SUPABASE_BASE_KEY: String(
            process.env.SUPABASE_BASE_KEY ||
                process.env.SUPABASE_ANON_KEY,
        ),
        NEXT_PUBLIC_ENGINE_API_BASE_URL: String(
            process.env.NEXT_PUBLIC_ENGINE_API_BASE_URL ||
                process.env.ENGINE_API_BASE_URL ||
                "http://localhost:8000",
        ),
        ENGINE_API_BASE_URL: String(
            process.env.ENGINE_API_BASE_URL || "http://localhost:8000",
        ),
    };

    const publicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publicSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (publicSupabaseUrl) {
        envRef.current.SUPABASE_URL = String(publicSupabaseUrl);
    }

    if (publicSupabaseAnonKey) {
        envRef.current.SUPABASE_ANON_KEY = String(publicSupabaseAnonKey);
        if (!process.env.SUPABASE_BASE_KEY) {
            envRef.current.SUPABASE_BASE_KEY = String(publicSupabaseAnonKey);
        }
    }
};

reloadEnv();

export const env = () => envRef.current;
