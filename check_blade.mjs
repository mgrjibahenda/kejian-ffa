import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '.');
const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css' };
function startServer(){ return new Promise(res=>{ const s=http.createServer(async(rq,rs)=>{ let p=decodeURIComponent(rq.url.split('?')[0]); if(p==='/')p='/index.html'; const fp=path.join(ROOT,p); if(!fp.startsWith(ROOT)||!existsSync(fp)){rs.writeHead(404);rs.end();return;} rs.writeHead(200,{'Content-Type':MIME[path.extname(fp)]||'application/octet-stream'}); rs.end(await readFile(fp)); }); s.listen(0,'127.0.0.1',()=>res(s)); }); }

(async () => {
  const server = await startServer();
  const port = server.address().port;
  const browser = await chromium.launch({ headless:true, args:['--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport:{ width:1024, height:600 } });
  const errs=[]; page.on('console',m=>{if(m.type()==='error')errs.push(m.text());}); page.on('pageerror',e=>errs.push(e.message));
  await page.goto(`http://127.0.0.1:${port}/index.html?test=1`, { waitUntil:'load' });
  await page.waitForFunction(()=>window.__booted===true,{timeout:8000});
  await page.fill('#nameInput','我'); await page.evaluate(()=>window.__test.join('demo'));
  await page.waitForFunction(()=>window.__test&&window.__test.joined(),{timeout:5000});

  // Equip the blade super (cheat) and let frames run so viewGun rebuilds from GUN_PARTS.
  await page.evaluate(()=>window.__test.equipSuper('blade'));
  await page.waitForTimeout(500);
  const info = await page.evaluate(()=>{
    const si = window.__test.superInfo();
    const gi = window.__test.gunInfo();
    // measure the view weapon bbox
    let bbox=null;
    try {
      // viewGun is closure-scoped; reach it via gunInfo presence + a fresh measure hook
      bbox = window.__test.bladeBBox ? window.__test.bladeBBox() : null;
    } catch(e){}
    return { superInfo:si, gunInfo:gi, gunVisible:window.__test.gunVisible() };
  });
  console.log('BUILD INFO:', JSON.stringify(info));
  console.log('CONSOLE ERRORS:', errs.length, JSON.stringify(errs.slice(0,10)));
  await browser.close(); server.close();
  process.exit(0);
})().catch(e=>{ console.error('FATAL', e); process.exit(1); });
