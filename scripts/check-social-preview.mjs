import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {content} from '../src/content.mjs';
import {contentSecurityPolicy} from './initial-render.mjs';
const root=new URL('../',import.meta.url);
const image='https://arcruntime.com/assets/arc-runtime-social-2026-10-09-v1.png';
const decode=s=>s.replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
for(const lang of ['en','ja']){
 const html=await readFile(new URL(lang==='en'?'dist/index.html':'dist/ja/index.html',root),'utf8');
 const tags=[...html.matchAll(/<meta (?:property|name)="([^"]+)" content="([^"]*)">/g)];
 const get=key=>{const matches=tags.filter(m=>m[1]===key);assert.equal(matches.length,1,key+' appears once');return decode(matches[0][2]);};
 const url='https://arcruntime.com/'+(lang==='ja'?'ja/':'');
 for(const [key,value] of Object.entries({'og:type':'website','og:site_name':'Arc Runtime','og:url':url,'og:locale':lang==='ja'?'ja_JP':'en_US','og:locale:alternate':lang==='ja'?'en_US':'ja_JP','og:image':image,'og:image:secure_url':image,'og:image:type':'image/png','og:image:width':'1200','og:image:height':'630','og:title':content[lang].title,'og:description':content[lang].description,'twitter:card':'summary_large_image','twitter:image':image,'twitter:url':url,'twitter:title':content[lang].title,'twitter:description':content[lang].description}))assert.equal(get(key),value,key);
 assert.equal(get('og:image:alt'),get('twitter:image:alt'));assert(get('og:image:alt').includes('Arc Runtime'));
 assert.equal(/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(get('og:image:alt')),lang==='ja');
 assert(html.includes(`<link rel="canonical" href="${url}">`));
 for(const [tag,attr] of [['style','data-initial-styles'],['script','data-initial-theme']]){const text=html.match(new RegExp(`<${tag} ${attr}>([\\s\\S]*?)<\\/${tag}>`))[1];assert(contentSecurityPolicy.includes(`'sha256-${createHash('sha256').update(text).digest('base64')}'`));}
 assert(!/<link[^>]*rel="stylesheet"/.test(html));
}
const png=await readFile(new URL('dist/assets/arc-runtime-social-2026-10-09-v1.png',root));
assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),630);assert(png.length<1024*1024);
console.log(JSON.stringify({languages:['en','ja'],image,width:1200,height:630,bytes:png.length,metadata:'Open Graph and Twitter fields pass',initialRender:'Exact CSP hashes preserved'},null,2));
