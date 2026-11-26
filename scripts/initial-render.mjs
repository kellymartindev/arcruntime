import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

// Render-critical bytes travel with the HTML; no stylesheet request is needed.
export const initialStyles = await readFile(new URL('../src/site.css', import.meta.url), 'utf8');
export const themeBootstrap = "try{document.documentElement.dataset.theme=localStorage.getItem('arc-theme')==='light'?'light':'dark'}catch{}";
if (/<\/style/i.test(initialStyles)) throw Error('Unexpected closing style tag in stylesheet.');
const hash = text => `'sha256-${createHash('sha256').update(text).digest('base64')}'`;
export const contentSecurityPolicy = `default-src 'self'; script-src 'self' ${hash(themeBootstrap)}; style-src 'self' ${hash(initialStyles)}; img-src 'self'; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`;
