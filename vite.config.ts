import { defineConfig, type Plugin } from 'vite';
import tailwindcss from '@tailwindcss/vite';

/**
 * No build: embute o CSS no HTML (some um round trip que bloqueava a renderização)
 * e faz preload da Archivo do título — sem isso o h1 troca de fonte depois de pintado e quebra as linhas (CLS).
 */
function criticalAssets(): Plugin {
  return {
    name: 'dsolare-critical-assets',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const bundle = ctx.bundle ?? {};
        let out = html;
        for (const [file, chunk] of Object.entries(bundle)) {
          if (!file.endsWith('.css') || chunk.type !== 'asset') continue;
          const tag = new RegExp(`<link rel="stylesheet"[^>]*href="/${file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`);
          if (tag.test(out)) out = out.replace(tag, () => `<style>${String(chunk.source)}</style>`);
        }
        const font = Object.keys(bundle).find((f) => /archivo-latin-wdth-normal-.*\.woff2$/.test(f));
        if (font) out = out.replace('</title>', `</title>\n    <link rel="preload" href="/${font}" as="font" type="font/woff2" crossorigin />`);
        return out;
      },
    },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), criticalAssets()],
  build: {
    rollupOptions: {
      input: { main: 'index.html', privacidade: 'privacidade.html' },
    },
  },
});
