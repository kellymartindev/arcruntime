// Read-only captures from the current project sources. Writes only this repository.
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=path.resolve(__dirname,'../..'),out=path.resolve(__dirname,'../src/assets');
const roots={narelog:path.join(base,'narelog-site'),lodestone:path.join(base,'lodestone/site'),plink:path.join(base,'sonholm')};
const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://localhost'),parts=u.pathname.split('/').filter(Boolean),key=parts.shift();if(!roots[key])return res.writeHead(404).end();let rel=parts.join('/');if(!rel||u.pathname.endsWith('/'))rel+=(rel?'/':'')+'index.html';const p=path.resolve(roots[key],rel);if(!p.startsWith(roots[key]+'/'))return res.writeHead(403).end();try{res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'})[path.extname(p)]||'application/octet-stream');res.end(fs.readFileSync(p))}catch{res.writeHead(404).end()}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;const browser=await chromium.launch({headless:true});const evidence=[];
try {
 const p=await browser.newPage({viewport:{width:1100,height:900},deviceScaleFactor:1});
 p.on('pageerror',e=>console.log('Page error',e.message));
 // Capture the current approved site's explicitly illustrative word card.
 await p.goto(url+'/narelog/?lang=en');await p.evaluate(()=>document.fonts.ready);await p.locator('figure.scene').first().screenshot({path:out+'/narelog.png'});evidence.push({project:'Narelog',source:'narelog-site/index.html, approved public site 2026-09-30',kind:'Illustration, not beta screenshot'});
 await p.setViewportSize({width:800,height:650});await p.goto(url+'/plink/');await p.locator('#look-around').click();
 for(const [type,x,y] of [['pot',.35,.5],['pan',.18,.72],['bowl',.65,.32],['leaf',.76,.7]]){await p.locator('[data-type="'+type+'"]').first().click();const b=await p.evaluate(()=>stageBounds());await p.mouse.click(b.left+b.width*x,b.top+b.height*y)}
 await p.screenshot({path:out+'/plink.png'});evidence.push({project:'Plink',source:'sonholm current Paper island c880bddd9295',kind:'Quiet local preview with four sample objects'});
 await p.setViewportSize({width:650,height:650});await p.goto(url+'/lodestone/app/?build=2026-09-29-l21');await p.locator('[data-action="intro-begin"]').click();await p.waitForFunction(()=>onboardingStep==='home');await p.locator('[data-action="intro-contrast"]').click();await p.waitForFunction(()=>onboardingStep==='away');await p.screenshot({path:out+'/lodestone.png'});evidence.push({project:'Lodestone',source:'lodestone/site/app/index.html L21',kind:'Current Home and Away lesson'});
 for(const [name,url] of [['Narelog','https://narelog.com/'],['Lodestone','https://lodestone-55o.pages.dev/app/?build=2026-09-29-l21']]){try{const response=await p.goto(url,{timeout:30000});evidence.push({name,url,status:response.status(),title:await p.title()});if(name==='Lodestone'){const live=await response.body();evidence.push({liveL21MatchesLocal:live.equals(fs.readFileSync(roots.lodestone+'/app/index.html'))})}}catch(e){evidence.push({name,url,error:e.message})}}
 fs.writeFileSync(path.resolve(__dirname,'../review/preview-provenance.json'),JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence,null,2));
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1});
