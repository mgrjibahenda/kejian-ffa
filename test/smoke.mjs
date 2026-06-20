// ---------------------------------------------------------------------------
// Headless 冒烟测试（Playwright）
// 启一个内置静态服务器加载 index.html，用 headless Chromium 跑断言：
//   1) 控制台零 error（pageerror / console.error）
//   2) window.THREE 与 window.Peer 都已定义
//   3) canvas 元素存在
//   4) window.__booted === true（引擎已启动）
//
// 运行：  node test/smoke.mjs
// 依赖：  npm i -D playwright  &&  npx playwright install chromium
// 说明：本测试不点击"进入战场"，因此不会触发 PeerJS 联网，控制台保持干净。
// ---------------------------------------------------------------------------
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.mjs':  'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

// --- 极简静态服务器（仅服务项目目录，相对路径） ---
function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      try {
        let urlPath = decodeURIComponent(req.url.split('?')[0]);
        if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
        const filePath = path.join(ROOT, path.normalize(urlPath));
        if (!filePath.startsWith(ROOT) || !existsSync(filePath)) {
          res.writeHead(404); res.end('not found'); return;
        }
        const data = await readFile(filePath);
        res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
        res.end(data);
      } catch (e) {
        res.writeHead(500); res.end(String(e));
      }
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

const ok = (b) => (b ? 'PASS' : 'FAIL');

(async () => {
  const server = await startServer();
  const port = server.address().port;
  const url = `http://127.0.0.1:${port}/index.html`;
  console.log('Static server:', url);

  const browser = await chromium.launch({
    headless: true,
    // 让 headless Chromium 拿到（软件渲染的）WebGL
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'],
  });
  const page = await browser.newPage();

  const consoleErrors = [];
  const pageErrors = [];
  const warnings = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
    else if (msg.type() === 'warning') warnings.push(msg.text());
  });
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await page.goto(url, { waitUntil: 'load' });

  // 最多等 5 秒，直到 window.__booted === true
  let booted = false;
  try {
    await page.waitForFunction(() => window.__booted === true, { timeout: 5000 });
    booted = true;
  } catch { booted = false; }

  const hasTHREE = await page.evaluate(() => typeof window.THREE !== 'undefined');
  const hasPeer  = await page.evaluate(() => typeof window.Peer !== 'undefined');
  const hasCanvas = (await page.locator('canvas').count()) > 0;
  const libError = await page.evaluate(() => window.__libError || null);

  const zeroErrors = consoleErrors.length === 0 && pageErrors.length === 0;

  console.log('\n==================== SMOKE TEST RESULT ====================');
  console.log(`[${ok(zeroErrors)}] 控制台零报错        (console.error=${consoleErrors.length}, pageerror=${pageErrors.length})`);
  console.log(`[${ok(hasTHREE)}] window.THREE 已定义`);
  console.log(`[${ok(hasPeer)}] window.Peer 已定义`);
  console.log(`[${ok(hasCanvas)}] canvas 元素存在`);
  console.log(`[${ok(booted)}] window.__booted === true`);
  console.log(`      (库加载错误 window.__libError = ${libError ? JSON.stringify(libError) : 'null'})`);
  console.log(`      (console.warning 数量 = ${warnings.length})`);
  if (consoleErrors.length) console.log('  console.error:\n   - ' + consoleErrors.join('\n   - '));
  if (pageErrors.length)    console.log('  pageerror:\n   - ' + pageErrors.join('\n   - '));
  if (warnings.length)      console.log('  warnings:\n   - ' + warnings.slice(0, 8).join('\n   - '));
  console.log('==========================================================\n');

  await browser.close();
  server.close();

  const allPass = zeroErrors && hasTHREE && hasPeer && hasCanvas && booted;
  console.log(allPass ? 'OVERALL: PASS ✅' : 'OVERALL: FAIL ❌');
  process.exit(allPass ? 0 : 1);
})().catch((e) => { console.error('smoke test crashed:', e); process.exit(2); });
