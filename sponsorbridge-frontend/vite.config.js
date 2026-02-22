import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        open: true,
        // Proxy API requests to Spring Boot backend
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                rewrite: function (path) { return path; },
                secure: false,
            },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
    },
});
