// Deploy this staging directory only; never upload the repository root.
import {mkdir,copyFile,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {initialStyles, themeBootstrap, contentSecurityPolicy} from './initial-render.mjs';
const root=new URL('../',import.meta.url);
const files=['index.html','ja/index.html','site.css','site.js','robots.txt','sitemap.xml','assets/seal.svg','assets/narelog.png','assets/lodestone.png','assets/plink.png','assets/arc-runtime-social-2026-10-09-v1.png'];
await mkdir(new URL('review/deploy/ja/',root),{recursive:true});await mkdir(new URL('review/deploy/assets/',root),{recursive:true});
const manifest={};
for(const file of files){const data=await readFile(new URL('dist/'+file,root));manifest[file]=createHash('sha256').update(data).digest('hex');await copyFile(new URL('dist/'+file,root),new URL('review/deploy/'+file,root));}
// Hash authorization must match the exact inline bytes in the tested HTML.
for (const file of ['index.html','ja/index.html']) {
 const html = await readFile(new URL('dist/'+file,root),'utf8');
 if (!html.includes(`<style data-initial-styles>${initialStyles}</style>`) || !html.includes(`<script data-initial-theme>${themeBootstrap}</script>`)) throw Error('Rebuild before staging: initial-render bytes changed.');
}
const hosting = JSON.parse(await readFile(new URL('vercel.json',root),'utf8'));
const csp = hosting.headers.flatMap(rule=>rule.headers).find(header=>header.key.toLowerCase()==='content-security-policy');
if (!csp) throw Error('Missing hosting CSP header.');
csp.value = contentSecurityPolicy;
// Keep the root config identical: some CLI paths resolve it before --cwd.
await writeFile(new URL('vercel.json',root),JSON.stringify(hosting,null,2)+'\n');
await writeFile(new URL('review/deploy/vercel.json',root),JSON.stringify(hosting,null,2)+'\n');
await writeFile(new URL('review/release-manifest.json',root),JSON.stringify(manifest,null,2));
console.log('Staged eleven public files and Vercel routing configuration. Verify CLI dry inventory before upload.');
