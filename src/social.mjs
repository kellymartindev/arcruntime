// Version the image filename when the artwork changes so crawlers get a new URL.
export const socialImagePath = 'assets/arc-runtime-social-2026-10-09-v1.png';
export function renderSocialMeta(lang, content, esc) {
 const url = `https://arcruntime.com/${lang === 'ja' ? 'ja/' : ''}`;
 const image = `https://arcruntime.com/${socialImagePath}`;
 const alt = lang === 'ja'
  ? '暗い背景に、Arc Runtimeのオレンジ色の印とクリーム色のロゴ文字。'
  : 'Arc Runtime’s orange seal and cream wordmark on a dark background.';
 const properties = {
  'og:type':'website', 'og:site_name':'Arc Runtime',
  'og:title':content.title, 'og:description':content.description, 'og:url':url,
  'og:locale':lang === 'ja' ? 'ja_JP' : 'en_US',
  'og:locale:alternate':lang === 'ja' ? 'en_US' : 'ja_JP',
  'og:image':image, 'og:image:secure_url':image, 'og:image:type':'image/png',
  'og:image:width':'1200', 'og:image:height':'630', 'og:image:alt':alt
 };
 const names = {
  'twitter:card':'summary_large_image', 'twitter:title':content.title,
  'twitter:description':content.description, 'twitter:url':url,
  'twitter:image':image, 'twitter:image:alt':alt
 };
 return Object.entries(properties).map(([key,value])=>`<meta property="${key}" content="${esc(value)}">`).join('')
  + Object.entries(names).map(([key,value])=>`<meta name="${key}" content="${esc(value)}">`).join('');
}
