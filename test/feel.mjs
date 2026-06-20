// ---------------------------------------------------------------------------
// "手感"验证：后坐力、换弹动画、走路头部摆动、枪口闪光
// 用 Playwright（保持页面活跃，rAF 正常）数值化断言这些动画确实在跑，
// 并截两张图（换弹中 / 开火）给人看。
// 运行：node test/feel.mjs
// ---------------------------------------------------------------------------
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css' };
function startServer(){ return new Promise(res=>{ const s=http.createServer(async(rq,rs)=>{ let p=decodeURIComponent(rq.url.split('?')[0]); if(p==='/')p='/index.html'; const fp=path.join(ROOT,p); if(!fp.startsWith(ROOT)||!existsSync(fp)){rs.writeHead(404);rs.end();return;} rs.writeHead(200,{'Content-Type':MIME[path.extname(fp)]||'application/octet-stream'}); rs.end(await readFile(fp)); }); s.listen(0,'127.0.0.1',()=>res(s)); }); }
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const results=[]; const check=(l,p,e='')=>{ results.push(p); console.log(`[${p?'PASS':'FAIL'}] ${l}${e?'  '+e:''}`); };

(async () => {
  const server = await startServer();
  const port = server.address().port;
  const url = `http://127.0.0.1:${port}/index.html?test=1`;
  const browser = await chromium.launch({ headless:true, args:['--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport:{ width:1024, height:600 } });
  const errs=[]; page.on('console',m=>{if(m.type()==='error')errs.push(m.text());}); page.on('pageerror',e=>errs.push(e.message));

  await page.goto(url, { waitUntil:'load' });
  await page.waitForFunction(()=>window.__booted===true,{timeout:5000});
  await page.fill('#nameInput','我'); await page.fill('#roomInput','demo'); await page.click('#joinBtn');
  await page.waitForFunction(()=>window.__test&&window.__test.joined(),{timeout:5000});
  // 放两个小人 + 切步枪
  await page.evaluate(()=>{ window.__test.recv({type:'state',from:'a',name:'小红',color:0xf72585,x:8,y:1.6,z:-6,yaw:1,pitch:0,weapon:0,hp:70,alive:true,kills:2,deaths:1});
    window.__test.recv({type:'state',from:'b',name:'小刚',color:0x90be6d,x:-4,y:1.6,z:-10,yaw:-1,pitch:0,weapon:2,hp:100,alive:true,kills:0,deaths:0});
    window.__test.weapon(2); });
  await sleep(120);

  const rest = await page.evaluate(()=>window.__test.gunInfo());

  // 1) 开火后坐 + 枪口闪光（后坐在下一帧才作用到枪上，故等一帧再读；闪光 55ms 内仍可见）
  await page.evaluate(()=>window.__test.fire());
  await sleep(30);
  const justFired = await page.evaluate(()=>window.__test.gunInfo());
  check('开火→枪口闪光出现', justFired.muzzle === true, `muzzle=${justFired.muzzle}`);
  check('开火→枪向后顶(后坐)', justFired.pz > rest.pz + 0.005, `pz ${rest.pz.toFixed(3)}→${justFired.pz.toFixed(3)}`);

  // 2) 换弹动画：弹匣未满→换弹，等到中段，枪应明显下沉 + 前倾
  await page.evaluate(()=>window.__test.reloadNow());
  await sleep(900); // 步枪换弹 2.0s，约中段
  const mid = await page.evaluate(()=>window.__test.gunInfo());
  const reloadingNow = await page.evaluate(()=>window.__test.reloading());
  check('换弹动画→枪下沉', mid.py < rest.py - 0.05, `py ${rest.py.toFixed(3)}→${mid.py.toFixed(3)}`);
  check('换弹动画→枪前倾(rx 增大)', mid.rx > rest.rx + 0.2, `rx ${rest.rx.toFixed(3)}→${mid.rx.toFixed(3)}`);
  await page.screenshot({ path: path.join(__dirname,'feel-reload.png') });

  // 等换弹结束
  await page.waitForFunction(()=>!window.__test.reloading(), { timeout:2000 }).catch(()=>{});

  // 3) 走路头部摆动：按住 W，相机高度应随脚步上下变化
  const ys = [];
  await page.evaluate(()=>window.__test.setKey('KeyW', true));
  for (let i=0;i<14;i++){ await sleep(60); ys.push(await page.evaluate(()=>window.__test.camY())); }
  await page.evaluate(()=>window.__test.setKey('KeyW', false));
  const ymin = Math.min(...ys), ymax = Math.max(...ys);
  check('走路→相机头部摆动(高度起伏)', (ymax - ymin) > 0.01, `Δy=${(ymax-ymin).toFixed(3)}`);

  // 开火截图（连续开火让闪光更易截到）
  await page.evaluate(()=>{ for(let i=0;i<1;i++) window.__test.fire(); });
  await page.screenshot({ path: path.join(__dirname,'feel-fire.png') });

  check('全程零报错', errs.length===0, `err=${errs.length}`);
  if (errs.length) console.log('  '+errs.join('\n  '));

  await browser.close(); server.close();
  const allPass = results.every(Boolean);
  console.log('\nscreenshots: test/feel-reload.png, test/feel-fire.png');
  console.log(allPass ? 'OVERALL: PASS ✅' : 'OVERALL: FAIL ❌');
  process.exit(allPass?0:1);
})().catch(e=>{ console.error('feel test crashed:', e); process.exit(2); });
