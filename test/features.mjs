// ---------------------------------------------------------------------------
// 新功能验证（Playwright，?test=1）：
//   1) 右键开镜（ADS）：视野缩小(fov 变小)，松开恢复
//   2) 爆头：打头伤害 = 身体伤害 × HEAD_MULT(2)
//   3) 超级武器：地图刷新→走过去捡到→100 发→打光自动失去
//   全程控制台零报错
// 运行：node test/features.mjs
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
  const browser = await chromium.launch({ headless:true, args:['--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport:{ width:1024, height:600 } });
  const errs=[]; page.on('console',m=>{if(m.type()==='error')errs.push(m.text());}); page.on('pageerror',e=>errs.push(e.message));

  await page.goto(`http://127.0.0.1:${port}/index.html?test=1`, { waitUntil:'load' });
  await page.waitForFunction(()=>window.__booted===true,{timeout:5000});
  await page.fill('#nameInput','我'); await page.fill('#roomInput','demo'); await page.click('#joinBtn');
  await page.waitForFunction(()=>window.__test&&window.__test.joined(),{timeout:5000});

  // ---------- 1) 开镜 ADS ----------
  await page.evaluate(()=>window.__test.weapon(2)); // 步枪
  const fov0 = await page.evaluate(()=>window.__test.fov());
  await page.evaluate(()=>window.__test.setAds(true));
  await sleep(350);
  const fovA = await page.evaluate(()=>window.__test.fov());
  const adsAmt = await page.evaluate(()=>window.__test.adsAmt());
  check('右键开镜→视野缩小(fov 变小)', fovA < fov0 - 5, `fov ${fov0.toFixed(0)}→${fovA.toFixed(0)}`);
  check('开镜进度 adsAmt→~1', adsAmt > 0.8, `adsAmt=${adsAmt.toFixed(2)}`);
  await page.evaluate(()=>window.__test.setAds(false));
  await sleep(350);
  const fovB = await page.evaluate(()=>window.__test.fov());
  check('松开右键→视野恢复', fovB > fovA + 5, `fov ${fovA.toFixed(0)}→${fovB.toFixed(0)}`);

  // ---------- 2) 爆头 ----------
  await page.evaluate(()=>window.__test.weapon(4)); // 狙击(高精度，便于命中头/身)
  // 正前方放一个小人，头部对准视线高度(msg.y=1.6 → 头在 y≈1.5，水平视线 1.6 命中头)
  await page.evaluate(()=>window.__test.recv({type:'state',from:'dummy',name:'靶',color:0xff3344,x:20,y:1.6,z:-5,yaw:0,pitch:0,weapon:0,hp:100,alive:true,kills:0,deaths:0}));
  await sleep(500); // 等小人插值到位
  await page.evaluate(()=>window.__test.fire());
  await sleep(80);
  const headHit = await page.evaluate(()=>window.__test.lastHit());
  check('打头→判定爆头', headHit && headHit.head === true, JSON.stringify(headHit));
  check('打头→伤害=92×2=184', headHit && headHit.dmg === 184, headHit ? ('dmg='+headHit.dmg) : 'null');

  // 同一个靶移到身体对准视线(msg.y=2.6 → 身体中心≈1.6)，等狙击冷却(1.25s)再打
  await page.evaluate(()=>window.__test.recv({type:'state',from:'dummy',name:'靶',color:0xff3344,x:20,y:2.6,z:-5,yaw:0,pitch:0,weapon:0,hp:100,alive:true,kills:0,deaths:0}));
  await sleep(1500);
  await page.evaluate(()=>window.__test.fire());
  await sleep(80);
  const bodyHit = await page.evaluate(()=>window.__test.lastHit());
  check('打身体→非爆头', bodyHit && bodyHit.head === false, JSON.stringify(bodyHit));
  check('打身体→伤害=92', bodyHit && bodyHit.dmg === 92, bodyHit ? ('dmg='+bodyHit.dmg) : 'null');

  // ---------- 3) 超级武器 ----------
  const pos = await page.evaluate(()=>window.__test.pos());
  // 先刷在远处(5 米外，超出拾取半径) → 确认它出现在地图上、不会被立刻捡走
  await page.evaluate(p=>window.__test.spawnSuperAt(p.x + 5, p.z), pos);
  await sleep(120);
  const onMap = await page.evaluate(()=>window.__test.superInfo());
  check('超级武器在地图上出现(远处未捡)', onMap.onMap === true && onMap.active === false, JSON.stringify(onMap));
  // 再刷到脚下 → 下一帧自动捡起（旧的会被替换）
  await page.evaluate(p=>window.__test.spawnSuperAt(p.x, p.z), pos);
  await sleep(160);
  const got = await page.evaluate(()=>window.__test.superInfo());
  check('走到上面→捡起超级武器', got.active === true, `active=${got.active}`);
  check('超级武器 100 发', got.ammo === 100, `ammo=${got.ammo}`);
  check('捡起后地图上的它消失', got.onMap === false, `onMap=${got.onMap}`);

  await page.evaluate(()=>window.__test.fire());
  await sleep(60);
  const after1 = await page.evaluate(()=>window.__test.superInfo());
  check('超级武器开火消耗 1 发', after1.ammo === 99, `ammo=${after1.ammo}`);

  // 把弹药设成 1，再打一发 → 打光 → 自动失去超级武器
  await page.evaluate(()=>window.__test.setSuperAmmo(1));
  await sleep(60);
  await page.evaluate(()=>window.__test.fire());
  await sleep(80);
  const after2 = await page.evaluate(()=>window.__test.superInfo());
  check('打光 100 发→自动失去超级武器', after2.active === false, `active=${after2.active}`);

  check('全程控制台零报错', errs.length===0, `err=${errs.length}`);
  if (errs.length) console.log('  '+errs.join('\n  '));

  await browser.close(); server.close();
  const allPass = results.every(Boolean);
  console.log('\n' + (allPass ? 'OVERALL: PASS ✅' : 'OVERALL: FAIL ❌'));
  process.exit(allPass?0:1);
})().catch(e=>{ console.error('features test crashed:', e); process.exit(2); });
