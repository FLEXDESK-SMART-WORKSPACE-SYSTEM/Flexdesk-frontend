import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: `${root}index.html`,
        login: `${root}login.html`,
        forgotPassword: `${root}forgot-password.html`,
        admin: `${root}admin.html`,
        availability: `${root}availability-floor-map.html`,
        bookings: `${root}my-bookings.html`
      }
    }
  }
});
