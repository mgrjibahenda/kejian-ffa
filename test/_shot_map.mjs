// 通用地图截图：node test/_shot_map.mjs <mapId>  → 加载该图, 多机位截 PNG, 打印 console 报错。
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MAP = process.argv[2] || 'basic';
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8' };
function startServer(){ return new Promise((resolve)=>{ const s=http.createServer(async(req,res)=>{ try{ let u=decodeURIComponent(req.url.split('?')[0]); if(u==='/'||u==='')u='/index.html'; const f=path.join(ROOT,path.normalize(u)); if(!f.startsWith(ROOT)||!existsSync(f)){res.writeHead(404);res.end('nf');return;} const d=await readFile(f); res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'}); res.end(d);}catch(e){res.writeHead(500);res.end(String(e));} }); s.listen(0,'127.0.0.1',()=>resolve(s)); }); }
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));

(async()=>{
  const server = await startServer();
  const port = server.address().port;
  const url = `http://127.0.0.1:${port}/index.html?test=1`;
  const browser = await chromium.launch({ headless:true, args:['--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport:{ width:1280, height:720 } });
  const errs=[]; page.on('console',m=>{ if(m.type()==='error')errs.push(m.text()); }); page.on('pageerror',e=>errs.push('PAGEERR '+e.message));
  await page.goto(url,{ waitUntil:'load' });
  await page.waitForFunction(()=>window.__booted===true,{ timeout:8000 });
  const loadRes = await page.evaluate((m)=>{ try{ if(!window.__test.joined()) window.__test.join('demo'); window.__test.loadMap(m); return { ok:true, info:window.__test.mapInfo() }; }catch(e){ return { ok:false, err:String(e&&e.stack||e) }; } }, MAP);
  console.log('loadMap', MAP, '=>', JSON.stringify(loadRes));
  await sleep(500);
  const shots = [
    { name:'edge',   x:0,  y:1.6, z:27, yaw:0,            pitch:-0.04 },
    { name:'corner', x:22, y:1.6, z:22, yaw:Math.PI*0.25, pitch:-0.04 },
    { name:'center', x:0,  y:1.6, z:13, yaw:0,            pitch:0.10  },
    { name:'side',   x:26, y:1.6, z:0,  yaw:Math.PI*0.5,  pitch:0.0   },
  ];
  for(const s of shots){
    await page.evaluate(v=>{ try{ window.__test.setView(v.x,v.y,v.z,v.yaw,v.pitch); }catch(e){} }, s);
    await sleep(450);
    await page.screenshot({ path: path.join(__dirname, `_shot_${MAP}_${s.name}.png`) });
  }
  console.log('console.errors =', errs.length);
  if(errs.length) console.log(errs.slice(0,30).join('\n'));
  await browser.close(); server.close();
  process.exit(errs.length ? 1 : 0);
})().catch(e=>{ console.error('shot crashed:', e); process.exit(2); });
