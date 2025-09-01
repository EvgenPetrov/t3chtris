import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    base: "/t3chtris/",
    plugins: [react()],
});
