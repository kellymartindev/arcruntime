import {mkdir, readFile, writeFile, copyFile, rm} from 'node:fs/promises';
import {content} from '../src/content.mjs';
import {renderBetaSection, renderBetaCta} from '../src/beta.mjs';
import {renderCaseNotes} from '../src/case-notes.mjs';
import {initialStyles, themeBootstrap} from './initial-render.mjs';
import {renderSocialMeta, socialImagePath} from '../src/social.mjs';
const root = new URL('../', import.meta.url);
const config = JSON.parse(await readFile(new URL('site.config.json', root), 'utf8'));
export function validateConfig(config) {
 if(config.backgroundMusic !== undefined && typeof config.backgroundMusic !== 'boolean') throw Error('backgroundMusic must be a boolean.');
 if(config.betaSection !== undefined && !['coming-soon','full'].includes(config.betaSection)) throw Error('Invalid beta section mode.');
 if(config.showBetaCta !== undefined && typeof config.showBetaCta !== 'boolean') throw Error('showBetaCta must be a boolean.');
 if(config.betaFormUrl) {
  const u = new URL(config.betaFormUrl);
  if(u.protocol !== 'https:' || u.username || u.password || !['subscribepage.io','subscribepage.com','preview.mailerlite.io','landing.mailerlite.com'].includes(u.hostname)) throw Error('Use the verified HTTPS MailerLite hosted form URL.');
 }
 if(config.contactEmail && !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@arcruntime\.com$/i.test(config.contactEmail)) throw Error('Use a verified Arc Runtime mailbox.');
}
validateConfig(config);
const esc = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mark = cls => `<img class="${cls}" src="/assets/seal.svg" width="64" height="64" alt="">`;
export function render(lang, configuration=config) {
 validateConfig(configuration);
 const c=content[lang], other=lang==='en'?'ja':'en', otherPath=other==='en'?'/':'/ja/';
 return `<!doctype html>
<html lang="${lang}" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="dark light"><meta name="description" content="${esc(c.description)}"><meta name="robots" content="index,follow">${renderSocialMeta(lang, c, esc)}<link rel="canonical" href="https://arcruntime.com/${lang==='ja'?'ja/':''}"><link rel="alternate" hreflang="en" href="https://arcruntime.com/"><link rel="alternate" hreflang="ja" href="https://arcruntime.com/ja/"><title>${esc(c.title)}</title><link rel="icon" href="/assets/seal.svg" type="image/svg+xml"><script data-initial-theme>${themeBootstrap}</script><style data-initial-styles>${initialStyles}</style><script src="/site.js" defer></script></head><body id="top">
<a class="skip" href="#main">${c.skip}</a>
<header class="site-header"><div class="wrap header-row"><a class="brand" href="#top" aria-label="Arc Runtime">${mark('brand-mark')}<span><strong>ARC RUNTIME</strong><small lang="ja">アーク・ランタイム</small></span></a><nav aria-label="${lang==='en'?'Main navigation':'メインナビゲーション'}">${c.nav.map((n,i)=>`<a href="#${['work','workshop','about'][i]}">${n}</a>`).join('')}</nav><div class="preferences"><div class="display-controls"><a class="pill" data-language href="${otherPath}" lang="${other}" hreflang="${other}" aria-label="${c.langLabel}">${c.lang}</a><button hidden class="pill" data-theme-toggle data-light="${c.theme}" data-dark="${c.dark}" aria-pressed="false">${c.theme}</button></div></div></div></header>
<main id="main"><section class="hero" aria-labelledby="hero-title"><div class="wrap hero-grid"><div class="hero-copy"><div class="eyebrow">${c.eyebrow}</div><h1 id="hero-title">${lang==='ja'?'<span class="headline-line">好奇心から、</span><span class="headline-line">学びと創作へ。</span>':c.headline}</h1><p>${c.intro}</p><div class="actions"><a class="button primary" href="#work">${c.see}<span aria-hidden="true">↓</span></a>${renderBetaCta(c, configuration)}</div></div><div class="hero-mark"><button class="seal-button" data-seal disabled aria-label="${c.audio.replay}"><svg class="seal-drawing" viewBox="0 0 64 64" aria-hidden="true"><defs><mask id="seal-cut"><rect width="64" height="64" fill="white"/><path class="seal-border" d="M14 9H50Q55 9 55 14V50Q55 55 50 55H14Q9 55 9 50V14Q9 9 14 9Z" fill="none" stroke="black" stroke-width="1.6" stroke-linecap="round" pathLength="1"/><path class="seal-arc" d="M17 45Q32 11 47 45" fill="none" stroke="black" stroke-width="5.5" stroke-linecap="round" pathLength="1"/><circle class="seal-dot" cx="32" cy="17" r="3.4"/></mask></defs><rect x="4" y="4" width="56" height="56" rx="8" fill="#dc592f" mask="url(#seal-cut)"/></svg></button><p data-seal-hint data-ready="${c.audio.unavailable}">ARC RUNTIME</p></div></div></section>
<section id="work" aria-labelledby="work-title"><div class="wrap section-pad"><div class="section-heading"><div><p class="section-label">${c.workLabel}</p><h2 id="work-title">${c.workTitle}</h2></div><p class="mono">${c.workNote}</p></div><div class="projects">${c.products.map(p=>`<article class="project" aria-labelledby="${p.id}-title"><figure class="${p.id}"><img src="/assets/${p.id}.png" width="800" height="600" alt="${esc(p.alt)}" loading="lazy"><figcaption class="caption">${p.caption}</figcaption></figure><div class="project-body"><div class="product-name"><h3 id="${p.id}-title">${p.name}</h3><span lang="ja">${p.jp}</span></div><div class="status">${p.status}</div><p class="project-description">${p.text}</p><p class="access-note">${p.note}</p>${renderCaseNotes(lang, p, {esc})}${p.link ? `<a class="project-link" href="${esc(p.link)}">${p.action}<span aria-hidden="true">${p.link.startsWith('#')?'↓':'↗'}</span></a>` : ''}</div></article>`).join('')}</div></div></section>
<section id="workshop" aria-labelledby="workshop-title"><div class="wrap section-pad split"><div><p class="section-label">${c.workshopLabel}</p><h2 id="workshop-title">${c.workshopTitle}</h2><p class="section-intro">${c.workshopIntro}</p></div><ul class="experiments">${c.experiments.map(([name,status,text])=>`<li><div class="experiment-top"><h3>${name}</h3><span class="tag">${status}</span></div><p>${text}</p></li>`).join('')}</ul></div></section>
<section id="about" class="about" aria-labelledby="about-title"><div class="wrap section-pad split"><div class="bio"><p class="section-label">${c.aboutLabel}</p><h2 id="about-title">${c.aboutTitle}</h2><p>${c.bio}</p><p>${c.bio2}</p></div><ol class="principles">${c.principles.map(([n,title,text])=>`<li><span class="number" aria-hidden="true">${n}</span><div><h3>${title}</h3><p>${text}</p></div></li>`).join('')}</ol></div></section>
${renderBetaSection(c, configuration, {mark, esc})}</main>
<footer class="wrap"><div class="footer-row mono"><span>© 2026 ARC RUNTIME</span><span class="location">${c.footer}</span><a href="#top">${c.back} ↑</a></div></footer></body></html>`;
}
// Only these files can enter the web root. No repository docs, app source or history.
await rm(new URL('dist/',root),{recursive:true,force:true});
await mkdir(new URL('dist/ja/',root),{recursive:true});
await mkdir(new URL('dist/assets/',root),{recursive:true});
for(const lang of ['en','ja']) await writeFile(new URL(lang==='en'?'dist/index.html':'dist/ja/index.html',root),render(lang));
for(const name of ['site.css','site.js','assets/seal.svg','assets/narelog.png','assets/lodestone.png','assets/plink.png',socialImagePath]) await copyFile(new URL('src/'+name,root),new URL('dist/'+name,root));
await writeFile(new URL('dist/robots.txt',root),'User-agent: *\nAllow: /\nSitemap: https://arcruntime.com/sitemap.xml\n');
await writeFile(new URL('dist/sitemap.xml',root),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://arcruntime.com/</loc></url><url><loc>https://arcruntime.com/ja/</loc></url></urlset>');
console.log('Built English and Japanese review pages. Signup: '+(config.betaFormUrl?'configured':'closed'));
