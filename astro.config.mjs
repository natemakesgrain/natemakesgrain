import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://natemakesgrain.com",
  image: {
    // Sharp is already installed; Astro uses it as the default image service.
  },
});
