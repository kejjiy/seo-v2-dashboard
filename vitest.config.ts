import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
    test: {
        globals: true,
        environment: "happy-dom",
        include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}", "__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}"],
        setupFiles: ["./test/setup-dom.ts"],
        deps: {
            inline: [/@testing-library/],
        },
        pool: 'forks',
        poolOptions: {
            forks: {
                isolate: true,
                minForks: 1,
                maxForks: 1,
            },
        },
        testTimeout: 30000,
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    esbuild: {
        jsx: "automatic",
    },
});
