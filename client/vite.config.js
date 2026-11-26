import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
    plugins: [react()],
    server: {
        // Alle Requests auf /api leitet Vite an den Express-Server weiter.
        // Dadurch laufen Frontend und Backend für den Browser auf demselben Origin (kein CORS nötig).
        proxy: {
            "/api": "http://localhost:3000",
        },
    },
});
