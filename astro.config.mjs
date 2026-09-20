import { defineConfig } from 'astro/config';
import { transform } from 'rolldown/utils';
export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  base: process.env.BASE_PATH || '/',
  output: 'static',
  trailingSlash: 'always',
  // Keep CommonJS packages in Node's native loader during content collection builds.
  vite: { plugins: [{
    name: 'native-commonjs-loader',
    enforce: 'pre',
    resolveId(source) { if (source === 'picomatch') return '\0native-picomatch'; },
    load(id) {
      if (id === '\0native-picomatch') return `import { createRequire } from 'node:module'; export default createRequire(${JSON.stringify(import.meta.url)})('picomatch');`;
    },
  }, {
    // Use Vite's in-process transformer: restricted Windows environments cannot
    // create the child-process pipes used by esbuild's environment replacement.
    name: 'static-environment-literals',
    configResolved(config) {
      const environmentPlugin = config.plugins.find(plugin => plugin.name === 'astro:vite-plugin-env');
      if (environmentPlugin) environmentPlugin.transform = async function(code, id) {
        if (!code.includes('import.meta.env')) return;
        const result = await transform(id.split('?')[0] + '.js', code, {
          define: { 'import.meta.env': JSON.stringify({ ...config.env, SSR: this.environment?.name !== 'client' }) },
        });
        if (result.errors?.length) this.error(result.errors[0].message);
        return { code: result.code, map: result.map || null };
      };
    },
  }] },
});
