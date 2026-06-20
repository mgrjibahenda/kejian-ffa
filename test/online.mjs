// ---------------------------------------------------------------------------
// 真·端到端联机测试：两个独立浏览器，走真实的 PeerJS 公共 broker + WebRTC，
// 加入同一个房间号，断言两边能互相看到对方的小人。
// 这验证的是"联机传输层"本身（之前只验证了消息处理逻辑）。
//
// 运行：node test/online.mjs   （需要联网访问 PeerJS broker）
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

async function joinPage(ctx, baseUrl, name, room) {
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page._errs = errs;
  await page.goto(baseUrl, { waitUntil:'load' });
  await page.waitForFunction(() => window.__booted === true, { timeout:5000 });
  await page.fill('#nameInput', name);
  await page.fill('#roomInput', room);
  await page.click('#joinBtn');   // 真实联机：进入战场即开始连 PeerJS
  return page;
}
const remoteCount = (page) => page.evaluate(() => window.__game ? Object.keys(window.__game.remotes).length : -1);
const netText = (page) => page.evaluate(() => { const e=document.getElementById('nettext'); return e?e.textContent:''; });

(async () => {
  const server = await startServer();
  const port = server.address().port;
  const url = `http://127.0.0.1:${port}/index.html`;
  // 每次用唯一房间号，避免撞到 broker 上遗留的同名主机 id
  const room = 'autotest-' + Date.now().toString(36);
  console.log('Static server:', url, '\nRoom:', room, '\n');

  const browser = await chromium.launch({ headless:true,
    args:['--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'] });
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();

  console.log('玩家甲 加入…');
  const pageA = await joinPage(ctxA, url, '甲', room);
  await sleep(1500); // 让甲先成为主机
  console.log('玩家乙 加入…');
  const pageB = await joinPage(ctxB, url, '乙', room);

  // 最多等 25 秒，直到两边都看到对方（remoteCount 各为 1）
  let connected = false;
  const deadline = Date.now() + 25000;
  let a = 0, b = 0;
  while (Date.now() < deadline) {
    a = await remoteCount(pageA);
    b = await remoteCount(pageB);
    if (a >= 1 && b >= 1) { connected = true; break; }
    await sleep(500);
  }

  const statusA = await netText(pageA);
  const statusB = await netText(pageB);

  console.log('\n==================== ONLINE TEST RESULT ====================');
  console.log(`甲 网络状态: ${statusA}   看到对手数: ${a}`);
  console.log(`乙 网络状态: ${statusB}   看到对手数: ${b}`);
  console.log(`[${connected?'PASS':'FAIL'}] 两个独立浏览器经 PeerJS broker + WebRTC 互相连上、互相看到`);
  const errs = [...pageA._errs, ...pageB._errs];
  console.log(`[${errs.length===0?'PASS':'FAIL'}] 无未捕获页面异常 (pageerror=${errs.length})`);
  if (errs.length) console.log('  '+errs.join('\n  '));
  console.log('===========================================================');

  await browser.close(); server.close();
  const allPass = connected && errs.length === 0;
  console.log(allPass ? 'OVERALL: PASS ✅  —— 真实联机可用' : 'OVERALL: FAIL ❌  —— 见上方状态（可能是网络/broker 不可达）');
  process.exit(allPass ? 0 : 1);
})().catch(e => { console.error('online test crashed:', e); process.exit(2); });
