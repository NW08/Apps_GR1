import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // The FS cache can serve stale Angular test bundles after non-spec files change.
    fsModuleCache: false,
  },
});
