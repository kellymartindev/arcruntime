// Rasterize the original seal and existing wordmark treatment. No generated logo/assets.
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const root=path.resolve(__dirname,'..'),seal=fs.readFileSync(path.join(root,'src/assets/seal.svg'),'utf8');
 const browser=await chromium.launch();
 try{const p=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
 await p.route('**/*',r=>r.abort());
 await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
 *{box-sizing:border-box}html,body{margin:0;width:1200px;height:630px;overflow:hidden}
 body{background:#14110f;color:#f1e6cf;display:flex;align-items:center;justify-content:center;font-family:Arial,'Hiragino Kaku Gothic ProN','Yu Gothic',Meiryo,sans-serif}
 main{display:flex;align-items:center;gap:42px}svg{display:block;width:200px;height:200px;flex:none}
 h1{margin:0;font-size:62px;line-height:1.1;letter-spacing:.055em;font-weight:700;white-space:nowrap}
 p{margin:19px 0 0;font-size:25px;line-height:1.3;letter-spacing:.2em;color:#b6ad9f}
 </style></head><body><main>${seal}<div><h1>ARC RUNTIME</h1><p lang="ja">アーク・ランタイム</p></div></main></body></html>`);
 await p.screenshot({path:path.join(root,'src/assets/arc-runtime-social-2026-10-09-v1.png')});
 console.log('Rendered original Arc Runtime seal + wordmark to 1200×630 PNG.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
