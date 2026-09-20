import { defineConfig } from 'astro/config';

// https://astro.build/config
// DayJob is a fully static, self-contained app served straight out of
// public/ (public/index.html) — Astro here only exists to build and
// deploy the static output to Netlify, no SSR/integrations needed.
export default defineConfig({
    output: 'static'
});
