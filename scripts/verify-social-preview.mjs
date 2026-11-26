import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {contentSecurityPolicy} from './initial-render.mjs';
const root=new URL('../',import.meta.url),manifest=JSON.parse(await readFile(new URL('review/release-manifest.json',root),'utf8'));
const imagePath='assets/arc-runtime-social-2026-10-09-v1.png',imageUrl='https://arcruntime.com/'+imagePath;
const checks=[];
for(const host of ['arcruntime.com','www.arcruntime.com']){
 for(const agent of ['Mozilla/5.0','LinkedInBot/1.0','Twitterbot/1.0'])for(const lang of ['en','ja']){
  const file=lang==='ja'?'ja/index.html':'index.html',url='https://'+host+(lang==='ja'?'/ja/':'/');
  const response=await fetch(url,{headers:{'User-Agent':agent},redirect:'error'});assert.equal(response.status,200,url);assert.match(response.headers.get('content-type'),/^text\/html/);assert.equal(response.headers.get('content-security-policy'),contentSecurityPolicy);
  const html=await response.text();assert.equal(createHash('sha256').update(html).digest('hex'),manifest[file]);
  const meta=Object.fromEntries([...html.matchAll(/<meta (?:property|name)="([^"]+)" content="([^"]*)">/g)].map(m=>[m[1],m[2]]));
  assert.equal(meta['og:image'],imageUrl);assert.equal(meta['twitter:image'],imageUrl);assert.equal(meta['twitter:card'],'summary_large_image');assert.equal(meta['og:url'],'https://arcruntime.com/'+(lang==='ja'?'ja/':''));assert.equal(meta['og:locale'],lang==='ja'?'ja_JP':'en_US');
  checks.push({url,agent,status:response.status,contentType:response.headers.get('content-type'),canonical:meta['og:url'],image:meta['og:image'],locale:meta['og:locale'],exactHtml:true,exactCsp:true});
 }
 const url='https://'+host+'/'+imagePath,response=await fetch(url,{headers:{'User-Agent':'LinkedInBot/1.0'},redirect:'error'});assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/^image\/png/);const bytes=Buffer.from(await response.arrayBuffer());assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest[imagePath]);assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.equal(bytes.readUInt32BE(16),1200);assert.equal(bytes.readUInt32BE(20),630);
 checks.push({url,status:response.status,contentType:response.headers.get('content-type'),cacheControl:response.headers.get('cache-control'),width:1200,height:630,bytes:bytes.length,exactImage:true});
}
await writeFile(new URL('review/social-preview-live-checks.json',root),JSON.stringify({imageUrl,checks},null,2)+'\n');console.log(JSON.stringify({passed:checks.length,imageUrl,htmlResponses:12,imageResponses:2,anonymous:true},null,2));
