import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {render} from './build.mjs';
import {content} from '../src/content.mjs';
import {caseNotes,caseNoteSlots} from '../src/case-notes.mjs';
// Offline checks for the case-note slice. Importing build.mjs rebuilds dist/ first, as check.mjs does.
const root=new URL('../',import.meta.url);
const checks=[];
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ids=content.en.products.map(p=>p.id);
assert.deepEqual(ids,['narelog','lodestone','plink']);
assert.deepEqual(content.ja.products.map(p=>p.id),ids);

const japanese=/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u;
const latin=s=>new Set(s.match(/[A-Za-z][A-Za-z0-9]*/g)||[]);
const digits=s=>(s.match(/\d+/g)||[]).join(',');
for(const lang of ['en','ja']){
 const {labels,projects}=caseNotes[lang];
 for(const key of ['summary',...caseNoteSlots])assert(typeof labels[key]==='string'&&labels[key].trim(),`${lang} label ${key}`);
 assert.deepEqual(Object.keys(projects).sort(),[...ids].sort(),`${lang} notes cover each card`);
 for(const id of ids){
  assert.deepEqual(Object.keys(projects[id]).sort(),[...caseNoteSlots].sort(),`${lang} ${id} uses the four slots`);
  for(const slot of caseNoteSlots){
   const text=projects[id][slot];
   assert(typeof text==='string'&&text.trim().length>=20,`${lang} ${id}.${slot} has content`);
   assert(!/[<>]|https?:|www\.|\.com\b|#join|mailto:/i.test(text),`${lang} ${id}.${slot} has no markup or links`);
   assert(!/AI music|intelligen|understands you|unlock|seamless|empower|journey|revolutionar|reimagin|practise|[!！]|アンロック|シームレス|革新的|\bL\d+\b|\d{4}-\d{2}-\d{2}/i.test(text),`${lang} ${id}.${slot} claim and build-ID scan`);
   assert.equal(japanese.test(text),lang==='ja',`${lang} ${id}.${slot} is written in the page language`);
  }
 }
}
for(const id of ids)for(const slot of caseNoteSlots){
 const en=caseNotes.en.projects[id][slot],ja=caseNotes.ja.projects[id][slot],enTokens=latin(en);
 for(const token of latin(ja))assert(enTokens.has(token),`${id}.${slot}: "${token}" appears in Japanese but not English`);
 assert.equal(digits(en),digits(ja),`${id}.${slot}: numbers match across languages`);
}
// Current release facts that both languages must state.
for(const [id,slot,en,ja] of [
 ['narelog','limits',/beta access/,/ベータアクセス/],
 ['lodestone','limits',/English only/,/英語のみ/],
 ['lodestone','limits',/Home Screen/,/ホーム画面/],
 ['plink','decision',/local rules/,/決められたルール/],
 ['plink','decision',/without a cloud AI service/,/クラウドのAIサービスは使いません/],
 ['plink','decision',/does not learn from audio recordings/,/録音データから学習する仕組みではありません/],
 ['plink','limits',/public experimental demo/,/実験的な公開デモ/],
 ['plink','limits',/no save or export/,/保存・書き出し機能はまだありません/]
]){assert.match(caseNotes.en.projects[id][slot],en,`${id}.${slot} EN fact`);assert.match(caseNotes.ja.projects[id][slot],ja,`${id}.${slot} JA fact`);}
checks.push('Case notes: four slots per card in EN and JA, no links or markup, claim/build-ID scan, script, token and number parity, and current release facts pass.');

const approvedBio={
 en:'Arc Runtime is where I make my own things. I grew up in the Bay Area, have lived in Japan for over a decade, and come from product marketing.',
 ja:'Arc Runtimeは、自分のつくりたいものを形にする場所です。ベイエリアで育ち、日本で暮らして十年以上になります。これまでプロダクトマーケティングに携わってきました。'
};
const lodestone='https://lodestone-55o.pages.dev/app/?build=2026-09-29-l21';
const plink='https://plink-arcruntime.netlify.app/';
const productLinks={en:['https://narelog.com/',lodestone,plink],ja:['https://narelog.com/?lang=ja',lodestone,plink]};
const images=['/assets/seal.svg','/assets/narelog.png','/assets/lodestone.png','/assets/plink.png'];
for(const lang of ['en','ja']){
 const html=render(lang),c=content[lang],{labels,projects}=caseNotes[lang];
 assert.equal(html.match(/<details class="case-notes">/g)?.length,3,`${lang} renders three case notes`);
 assert.equal(html.match(/<details[\s>]/g).length,html.match(/<\/details>/g).length);
 assert(!/<details[^>]*\sopen/.test(html),`${lang} case notes start closed`);
 const articles=html.split('<article class="project"').slice(1).map(a=>a.slice(0,a.indexOf('</article>')));
 assert.equal(articles.length,3);
 articles.forEach((a,i)=>{
  const p=c.products[i],notes=projects[p.id];
  assert(a.includes(`id="${p.id}-title"`));
  const note=a.indexOf('class="access-note"'),details=a.indexOf('<details class="case-notes">'),action=a.indexOf('class="project-link');
  assert(note>0&&note<details,`${lang} ${p.id}: notes follow the access note`);
  assert(p.link ? details<action : action===-1,`${lang} ${p.id}: only available destinations get an action`);
  assert(!/\bL\d+\b|Paper island/i.test(p.status+' '+p.caption),`${lang} ${p.id}: no internal release labels in status/caption`);
  assert(a.includes(`<summary>${labels.summary}<span class="visually-hidden">${esc(labels.project(p.name))}</span></summary>`),`${lang} ${p.id}: summary names the project`);
  for(const slot of caseNoteSlots)assert(a.includes(`<dt>${labels[slot]}</dt><dd>${esc(notes[slot])}</dd>`),`${lang} ${p.id}.${slot} rendered`);
 });
 assert(articles[2].includes(`href="${plink}"`),`${lang} Plink card uses verified public demo`);
 assert(!/href="#join"|Public preview coming soon|一般公開は準備中です/.test(articles[2]),`${lang} no dead-end Plink action`);
 assert.equal([...html.matchAll(/href="([^"]*)"/g)].filter(([,h])=>h===plink).length,1,`${lang} one clear Plink link`);
 for(const link of productLinks[lang])assert(html.includes(`href="${esc(link)}"`),`${lang} link unchanged: ${link}`);
 assert(html.includes(`<p>${approvedBio[lang]}</p>`),`${lang} approved bio unchanged`);
 assert(html.includes(`<link rel="canonical" href="https://arcruntime.com/${lang==='ja'?'ja/':''}">`));
 assert(html.includes(`data-language href="${lang==='en'?'/ja/':'/'}"`));
 assert(!/<form|<input|<audio|<video|<iframe|mailto:|type="email"|data-audio-controls|data-music-toggle/i.test(html),`${lang} no forms, mailbox or media`);
 assert.deepEqual([...new Set([...html.matchAll(/<img[^>]*\ssrc="([^"]+)"/g)].map(m=>m[1]))].sort(),[...images].sort(),`${lang} images are the seal and the three project cards only`);
 assert.equal(render(lang,{betaSection:'full',showBetaCta:true,betaFormUrl:'https://subscribepage.io/test-fixture',contactEmail:''}).match(/<details class="case-notes">/g)?.length,3);
}
checks.push('Rendered EN/JA pages: closed native disclosures in card order, named summaries, verified Plink link, preserved other links, routes and approved bio, no forms, mailbox, media or extra images.');

const allowed=['index.html','ja/index.html','site.css','site.js','robots.txt','sitemap.xml','assets/seal.svg','assets/narelog.png','assets/lodestone.png','assets/plink.png','assets/arc-runtime-social-2026-10-09-v1.png'];
async function walk(dir,prefix=''){let files=[];for(const item of await readdir(dir,{withFileTypes:true})){const p=prefix+item.name;if(item.isDirectory())files.push(...await walk(new URL(item.name+'/',dir),p+'/'));else files.push(p)}return files}
assert.deepEqual((await walk(new URL('dist/',root))).sort(),allowed.sort());
const css=await readFile(new URL('dist/site.css',root),'utf8');
assert(css.includes('.case-notes{')&&css.includes('.visually-hidden{'));
for(const lang of ['en','ja'])assert.equal(await readFile(new URL(lang==='en'?'dist/index.html':'dist/ja/index.html',root),'utf8'),render(lang));
checks.push('dist/ keeps the existing file allowlist, ships the case-note styles, and matches the rendered pages.');
console.log(JSON.stringify({checks},null,2));
