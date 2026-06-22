// 一次性截图脚本：加载 magmacore，摆几个机位截 PNG，打印 console 报错。node test/_shot_magma.mjs
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
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
  await page.evaluate(()=>{ if(!window.__test.joined()) window.__test.join('demo'); window.__test.loadMap('magmacore'); });
  await sleep(400);

  const shots = [
    { name:'A_edge',   x:0,  y:1.6, z:27, yaw:0,            pitch:-0.05 },
    { name:'B_corner', x:22, y:1.6, z:22, yaw:Math.PI*0.25, pitch:-0.05 },
    { name:'C_center', x:0,  y:1.6, z:13, yaw:0,            pitch:0.12  },
    { name:'D_yaw90',  x:0,  y:1.6, z:0,  yaw:Math.PI*0.5,  pitch:0.0   },
  ];
  for(const s of shots){
    await page.evaluate(v=>{ window.__test.setView(v.x,v.y,v.z,v.yaw,v.pitch); }, s);
    await sleep(450);
    await page.screenshot({ path: path.join(__dirname, `_shot_magma_${s.name}.png`) });
  }
  console.log('console.errors =', errs.length);
  if(errs.length) console.log(errs.slice(0,20).join('\n'));
  await browser.close(); server.close();
  process.exit(0);
})().catch(e=>{ console.error('shot crashed:', e); process.exit(2); });
