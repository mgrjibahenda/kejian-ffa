// 回归守卫: 每把超武/仙器/绝对处死之炮 装备+开火 都不崩(多会话改伤害/视觉/武器最容易踩这里)
// 运行: node test/weapons.mjs
import http from 'node:http'; import { readFile } from 'node:fs/promises'; import { existsSync } from 'node:fs';
import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { chromium } from 'playwright';
const __dirname = path.dirname(fileURLToPath(import.meta.url)); const ROOT = path.resolve(__dirname, '..');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.ogg':'audio/ogg','.glb':'model/gltf-binary'};
function srv(){return new Promise(r=>{const s=http.createServer(async(q,p)=>{try{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';const f=path.join(ROOT,u);if(!f.startsWith(ROOT)||!existsSync(f)){p.writeHead(404);p.end();return;}p.writeHead(200,{'Content-Type':(MIME[path.extname(f)]||'application/octet-stream')});p.end(await readFile(f));}catch(e){p.writeHead(500);p.end(String(e));}});s.listen(0,'127.0.0.1',()=>r(s));});}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const s=await srv();const port=s.address().port;
  const br=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await br.newPage({viewport:{width:1280,height:720}}); const errs=[];
  pg.on('pageerror',e=>errs.push('PE '+e.message)); pg.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await pg.goto(`http://127.0.0.1:${port}/index.html?test=1`,{waitUntil:'load'});
  await pg.waitForFunction(()=>window.__booted===true,{timeout:9000});
  await pg.evaluate(()=>{ if(!window.__test.joined()) window.__test.join('demo'); });
  const KINDS=['mg','star','hole','realm','tsunami','mecha','roar','blade','godmecha','execute'];
  const results=[];
  for (const k of KINDS) {
    const e0=errs.length;
    await pg.evaluate((kk)=>{ window.__test.setView(0,1.7,10,0,0); window.__test.equipSuper(kk); if(window.__test.superInfo && window.__test.wearNow && (kk==='mecha'||kk==='godmecha')) window.__test.wearNow(); },k);
    await sleep(80);
    for (let i=0;i<3;i++){ await pg.evaluate(()=>window.__test.fire()); await sleep(120); }
    await sleep(200);
    const eN=errs.length;
    results.push({k, ok:(eN===e0)});
  }
  // 绝对处死之炮 beamViz 校验(radius=21)
  await pg.evaluate(()=>{ window.__test.equipSuper('execute'); window.__test.setView(0,1.7,22,0,0); });
  await sleep(60); await pg.evaluate(()=>window.__test.fire()); await sleep(150);
  const viz = await pg.evaluate(()=>window.__test.beamViz? window.__test.beamViz():null);
  let allOk=true;
  for(const r of results){ if(!r.ok)allOk=false; console.log((r.ok?'[PASS] ':'[FAIL] ')+r.k+' 装备+开火无报错'); }
  const vizOk = viz && viz.kind==='execute' && Math.round(viz.radius)===21;
  console.log((vizOk?'[PASS] ':'[FAIL] ')+'绝对处死之炮 beamViz radius='+(viz?viz.radius:'?'));
  const pass = allOk && vizOk && errs.length===0;
  console.log('console.errors='+errs.length); if(errs.length) console.log(errs.slice(0,6).join('\n'));
  console.log('OVERALL: '+(pass?'PASS ✅':'FAIL ❌'));
  await br.close(); s.close(); process.exit(pass?0:1);
})().catch(e=>{ console.error('crash:',e); process.exit(2); });
