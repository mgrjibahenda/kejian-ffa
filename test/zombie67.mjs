// 回归守卫: 僵尸模式下 67 武器全部对僵尸生效(伤害函数热点, 防 s1视觉改动/s2/s4 误伤 s3 的 zHurt* 钩子)
// 运行: node test/zombie67.mjs   (绿=全部武器在僵尸模式秒僵尸 + 67切武器放下棒球棍)
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
  await pg.evaluate(()=>window.__test.zStartGame()); await sleep(400);
  async function testW(kind, dist, waitMs, wear){
    const r = await pg.evaluate(([k,d,w])=>{
      window.__test.setView(0,1.7,12,0,0); window.__test.equipSuper(k); if (w) window.__test.wearNow();
      var bat = window.__test.zWeaponNow().bat; var id = window.__test.zSpawn('walker', 0, 12-d);
      var before = window.__test.zInfo(id); window.__test.fire();
      return { id:id, bat:bat, hp0:before?before.hp:null };
    },[kind,dist,wear]);
    await sleep(waitMs);
    if (kind==='mg') { for(let i=0;i<14;i++){ await pg.evaluate(()=>window.__test.fire()); await sleep(70); } }
    const after = await pg.evaluate((id)=>{ var z=window.__test.zInfo(id); return z?{hp:z.hp,alive:z.alive}:{gone:true,alive:false}; }, r.id);
    const dmgOk = after.gone || after.alive===false || (after.hp!=null && after.hp < r.hp0);
    return { kind, batCleared:(r.bat===false), dmgOk };
  }
  const out = [];
  for (const w of [['execute',8,500],['star',8,1300],['roar',8,2600],['hole',7,1900],['tsunami',7,2600],['mecha',8,2600,true],['blade',3,1400],['mg',4,200]])
    out.push(await testW(w[0],w[1],w[2],w[3]));
  let allDmg=true, allBat=true;
  for(const r of out){ if(!r.dmgOk)allDmg=false; if(!r.batCleared)allBat=false; console.log((r.dmgOk&&r.batCleared?'[PASS] ':'[FAIL] ')+r.kind+' 伤害='+r.dmgOk+' 放下棒球棍='+r.batCleared); }
  const pass = allDmg && allBat && errs.length===0;
  console.log('console.errors='+errs.length);
  console.log('OVERALL: '+(pass?'PASS ✅':'FAIL ❌'));
  await br.close(); s.close(); process.exit(pass?0:1);
})().catch(e=>{ console.error('crash:',e); process.exit(2); });
