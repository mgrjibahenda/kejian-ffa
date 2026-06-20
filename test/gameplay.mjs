// ---------------------------------------------------------------------------
// 单机玩法功能测试（Playwright）
// 在 ?test=1 离线模式下，真实地驱动游戏逻辑，验证"单机能跑动能开枪"：
//   - 进入战场（joined）
//   - 按 W 能向前移动（位置变化）
//   - 换枪生效
//   - 开火：弹药 -1 且生成弹道特效
//   - 换弹：弹匣装满
//   - 受伤：扣血正确
//   - 全程控制台零报错
//
// 运行：  node test/gameplay.mjs
// ---------------------------------------------------------------------------
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.css':'text/css', '.json':'application/json' };

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      try {
        let p = decodeURIComponent(req.url.split('?')[0]);
        if (p === '/' ) p = '/index.html';
        const fp = path.join(ROOT, path.normalize(p));
        if (!fp.startsWith(ROOT) || !existsSync(fp)) { res.writeHead(404); res.end('nf'); return; }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
        res.end(await readFile(fp));
      } catch (e) { res.writeHead(500); res.end(String(e)); }
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

const results = [];
const check = (label, pass, extra='') => { results.push({ label, pass, extra }); console.log(`[${pass?'PASS':'FAIL'}] ${label}${extra?'  '+extra:''}`); };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const server = await startServer();
  const port = server.address().port;
  const url = `http://127.0.0.1:${port}/index.html?test=1`;
  console.log('Static server:', url, '\n');

  const browser = await chromium.launch({ headless:true,
    args:['--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'] });
  const page = await browser.newPage();

  const consoleErrors = [], pageErrors = [];
  page.on('console', m => { if (m.type()==='error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => pageErrors.push(e.message));

  await page.goto(url, { waitUntil:'load' });
  await page.waitForFunction(() => window.__booted === true, { timeout:5000 });

  // 进入战场
  await page.fill('#nameInput', '自测机器人');
  await page.fill('#roomInput', 'smoke-room');
  await page.click('#joinBtn');
  await page.waitForFunction(() => window.__test && window.__test.joined() === true, { timeout:5000 });
  check('进入战场 (joined)', true);
  const notPaused = await page.evaluate(() => window.__test.paused() === false);
  check('未暂停 (paused=false)', notPaused);

  // 移动：按 W 约 0.4s，z 应明显减少（朝 -Z 前进）
  const pos0 = await page.evaluate(() => window.__test.pos());
  await page.evaluate(() => window.__test.setKey('KeyW', true));
  await sleep(450);
  await page.evaluate(() => window.__test.setKey('KeyW', false));
  const pos1 = await page.evaluate(() => window.__test.pos());
  const dz = pos1.z - pos0.z;
  check('按 W 能前进 (z 减小)', dz < -0.8, `Δz=${dz.toFixed(2)}`);

  // 换枪到步枪(索引2)
  await page.evaluate(() => window.__test.weapon(2));
  const widx = await page.evaluate(() => window.__test.widx());
  check('换枪到步枪(2)', widx === 2, `widx=${widx}`);

  // 开火：弹药 -1，且生成弹道特效
  const ammoBefore = await page.evaluate(() => window.__test.ammo());
  const fxBefore = await page.evaluate(() => window.__test.fxCount());
  await page.evaluate(() => window.__test.fire());
  const ammoAfter = await page.evaluate(() => window.__test.ammo());
  const fxAfter = await page.evaluate(() => window.__test.fxCount());
  check('开火消耗 1 发弹药', ammoAfter === ammoBefore - 1, `${ammoBefore}→${ammoAfter}`);
  check('开火生成弹道特效', fxAfter > fxBefore, `fx ${fxBefore}→${fxAfter}`);

  // 再打几发，然后换弹，等待装填完成 → 弹匣应装满
  for (let i = 0; i < 3; i++) { await page.evaluate(() => window.__test.fire()); await sleep(160); }
  await page.evaluate(() => window.__test.reloadNow());
  await sleep(2300); // 步枪换弹 2.0s
  const ammoFull = await page.evaluate(() => window.__test.ammo());
  const mag = await page.evaluate(() => window.__test.mag());
  check('换弹后弹匣装满', ammoFull === mag, `${ammoFull}/${mag}`);

  // 受伤：扣血正确
  const hp0 = await page.evaluate(() => window.__test.hp());
  await page.evaluate(() => window.__test.takeHit(30));
  const hp1 = await page.evaluate(() => window.__test.hp());
  check('受伤扣血 30', hp1 === hp0 - 30, `${hp0}→${hp1}`);

  // ---- 联机逻辑（喂合成消息进真实 handleMessage，不依赖 WebRTC 传输） ----
  const myId = await page.evaluate(() => window.__test.myId());
  // 1) 对端加入 → 出现一个小人 + 计分条
  await page.evaluate(() => window.__test.recv({ type:'hello', from:'p2', name:'敌人', color:0xff3344 }));
  const rc1 = await page.evaluate(() => window.__test.remoteCount());
  const names1 = await page.evaluate(() => window.__test.scoreNames());
  check('对端加入 → 新增小人', rc1 === 1, `remotes=${rc1}`);
  check('对端加入 → 进入计分板', names1.includes('敌人'), JSON.stringify(names1));

  // 2) 对端状态广播 → 仍是同一个小人（不重复创建）
  await page.evaluate(() => window.__test.recv({ type:'state', from:'p2', name:'敌人', color:0xff3344,
    x:5, y:1.6, z:5, yaw:0, pitch:0, weapon:0, hp:80, alive:true, kills:1, deaths:0 }));
  const rc2 = await page.evaluate(() => window.__test.remoteCount());
  check('对端状态更新 → 不重复建小人', rc2 === 1, `remotes=${rc2}`);

  // 3) 被对端命中 → 自己扣血
  const hpA = await page.evaluate(() => window.__test.hp());
  await page.evaluate((id) => window.__test.recv({ type:'hit', from:'p2', to:id, dmg:25, weapon:'rifle' }), myId);
  const hpB = await page.evaluate(() => window.__test.hp());
  check('收到 hit(发给我) → 扣血 25', hpB === hpA - 25, `${hpA}→${hpB}`);

  // 4) 我击杀对端（对端广播 kill，killer=我）→ 我的击杀 +1
  const k0 = await page.evaluate(() => window.__test.kills());
  await page.evaluate((id) => window.__test.recv({ type:'kill', from:'p2', killer:id, victim:'p2', weapon:'rifle' }), myId);
  const k1 = await page.evaluate(() => window.__test.kills());
  check('收到 kill(我是凶手) → 击杀 +1', k1 === k0 + 1, `${k0}→${k1}`);

  // 5) 对端离开 → 小人与计分条移除
  await page.evaluate(() => window.__test.recv({ type:'leave', from:'p2' }));
  const rc3 = await page.evaluate(() => window.__test.remoteCount());
  check('对端离开 → 移除小人', rc3 === 0, `remotes=${rc3}`);

  // 全程零报错
  const zero = consoleErrors.length === 0 && pageErrors.length === 0;
  check('全程控制台零报错', zero, `err=${consoleErrors.length}, pageerr=${pageErrors.length}`);
  if (consoleErrors.length) console.log('  console.error:\n   - ' + consoleErrors.join('\n   - '));
  if (pageErrors.length)    console.log('  pageerror:\n   - ' + pageErrors.join('\n   - '));

  await browser.close();
  server.close();

  const allPass = results.every(r => r.pass);
  console.log('\n' + (allPass ? 'OVERALL: PASS ✅' : 'OVERALL: FAIL ❌'));
  process.exit(allPass ? 0 : 1);
})().catch(e => { console.error('gameplay test crashed:', e); process.exit(2); });
