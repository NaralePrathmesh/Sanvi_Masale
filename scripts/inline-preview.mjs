// Combines preview-build/ into one self-contained HTML page (preview-build/rasoi-ratna-preview.html).
import fs from 'node:fs';
import path from 'node:path';
const dir = 'preview-build';
const assets = fs.readdirSync(path.join(dir, 'assets'));
const js = assets.filter((f) => f.endsWith('.js')).map((f) => fs.readFileSync(path.join(dir, 'assets', f), 'utf8')).join('\n');
const css = assets.filter((f) => f.endsWith('.css')).map((f) => fs.readFileSync(path.join(dir, 'assets', f), 'utf8')).join('\n');
const fav = fs.readFileSync('public/favicon.png').toString('base64');
const html = `<title>सान्वी मसाले</title>
<meta name="description" content="सान्वी मसाले — demo Indian masala storefront (frontend preview).">
<link rel="icon" type="image/png" href="data:image/png;base64,${fav}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Manrope:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Serif+Devanagari:wght@500;600&family=Yatra+One&display=swap">
<style>${css}
:root{color-scheme:light}
body{background:#FFFCF7;color:#2A2521}
</style>
<div id="root"></div>
<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>
`;
fs.writeFileSync(path.join(dir, 'rasoi-ratna-preview.html'), html);
console.log('wrote', (html.length / 1024).toFixed(0), 'KB');
