import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // ESTO ES CLAVE: Fuerza a Vite a unificar cualquier versión de React
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
});