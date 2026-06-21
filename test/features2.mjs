// ---------------------------------------------------------------------------
// 新机制验证（Playwright，?test=1）：
//   1) 四肢伤害 < 躯干 < 头（部位倍率）
//   2) 回血：受伤 8s 后开始回血（用 forceRegenReady 跳过等待）
//   3) 超级武器 4 种随机：超级机枪/崩星炮/黑洞炮/秘境枪 各自弹药
//   4) 崩星炮：0.7s 后贯穿秒杀（向命中者上报 9999）
//   5) 黑洞炮：附近的人被吸入处死
//   6) 秘境枪：持枪者进入秘境(200血/高射速)，对手死亡→回到主场
//   全程控制台零报错
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
const ev = (page, fn, ...a) => page.evaluate(fn, ...a);

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
  const myId = await ev(page, ()=>window.__test.myId());

  // ---------- 1) 部位伤害：四肢 < 躯干 < 头 ----------
  await ev(page, ()=>window.__test.weapon(4)); // 狙击
  async function shoot(x, y) {
    await ev(page, (a)=>window.__test.recv({type:'state',from:'t',name:'靶',color:0xff3344,x:a.x,y:a.y,z:-5,yaw:0,pitch:0,weapon:0,hp:100,alive:true,kills:0,deaths:0}), {x, y});
    await sleep(520);
    await ev(page, ()=>window.__test.fire());
    await sleep(80);
    return ev(page, ()=>window.__test.lastHit());
  }
  const headHit = await shoot(20, 1.6);     // 头对准视线
  await sleep(1400);
  const bodyHit = await shoot(20, 2.1);     // 躯干对准视线
  await sleep(1400);
  const limbHit = await shoot(20.13, 2.8);  // 左腿对准视线(避开躯干/头)
  check('头伤害 > 躯干 > 四肢', headHit.dmg > bodyHit.dmg && bodyHit.dmg > limbHit.dmg,
    `头${headHit.dmg} 躯干${bodyHit.dmg} 四肢${limbHit.dmg}`);
  check('躯干=92(×1)', bodyHit.dmg === 92, `dmg=${bodyHit.dmg}`);
  check('四肢=55(×0.6)', limbHit.dmg === 55 && limbHit.head === false, `dmg=${limbHit.dmg}`);

  // ---------- 2) 回血 ----------
  await ev(page, ()=>{ window.__test.setHp(40); window.__test.damageNow(); });
  await sleep(900);
  const hpRecent = await ev(page, ()=>window.__test.hp());
  check('刚受伤→不回血', hpRecent <= 41, `hp=${hpRecent.toFixed(1)}`);
  await ev(page, ()=>{ window.__test.setHp(40); window.__test.forceRegenReady(); });
  await sleep(1200);
  const hpRegen = await ev(page, ()=>window.__test.hp());
  check('受伤 8s 后→开始回血', hpRegen > 48, `hp 40→${hpRegen.toFixed(1)}`);

  // ---------- 2.5) 人物动画：跳跃 / 奔跑 / 死亡 ----------
  const st = (o)=>Object.assign({type:'state',from:'anim',name:'动画',color:0x4cc9f0,yaw:0,pitch:0,weapon:0,hp:100,alive:true,kills:0,deaths:0,z:-10}, o);
  await ev(page, (m)=>window.__test.recv(m), st({x:10,y:1.6})); await sleep(500);
  await ev(page, (m)=>window.__test.recv(m), st({x:10,y:3.0})); await sleep(300);   // 离地=跳跃
  const jump = await ev(page, ()=>window.__test.remotePose('anim'));
  check('跳跃→离地收腿', jump && jump.y > 0.5 && jump.legL < -0.3, JSON.stringify(jump));
  let ran = false;                                                                   // 连续移动=奔跑
  for (let i=0;i<9;i++){ await ev(page, (m)=>window.__test.recv(m), st({x:10+i*0.9, y:1.6})); await sleep(90);
    const p = await ev(page, ()=>window.__test.remotePose('anim')); if (Math.abs(p.legL) > 0.12) ran = true; }
  check('奔跑→腿前后摆动', ran, `ran=${ran}`);
  await ev(page, (m)=>window.__test.recv(m), Object.assign(st({x:18,y:1.6}), {hp:0,alive:false}));  // 死亡
  let leaned = false;
  for (let i=0;i<9 && !leaned;i++){ await sleep(100); const p = await ev(page, ()=>window.__test.remotePose('anim')); if (p.leanZ > 0.6) leaned = true; }
  check('死亡→倒下动画', leaned, `leaned=${leaned}`);
  await ev(page, ()=>window.__test.recv({type:'leave', from:'anim'}));

  // ---------- 3) 超级武器 4 种 ----------
  async function pickKind(kind) {
    await ev(page, ()=>window.__test.drop());
    const pos = await ev(page, ()=>window.__test.pos());
    await ev(page, (p)=>window.__test.spawnSuperAt(p.x, p.z, p.kind), {x:pos.x, z:pos.z, kind});
    await sleep(160);
    return ev(page, ()=>window.__test.superInfo());
  }
  const mg = await pickKind('mg'), star = await pickKind('star'), hole = await pickKind('hole'), realm = await pickKind('realm');
  check('超级机枪 100 发', mg.kind==='mg' && mg.ammo===100, JSON.stringify(mg));
  check('崩星炮 5 发',     star.kind==='star' && star.ammo===5, JSON.stringify(star));
  check('黑洞炮 4 发',     hole.kind==='hole' && hole.ammo===4, JSON.stringify(hole));
  check('秘境枪 3 发',     realm.kind==='realm' && realm.ammo===3, JSON.stringify(realm));

  // ---------- 4) 崩星炮：0.7s 后贯穿秒杀 ----------
  await ev(page, ()=>window.__test.drop());
  await ev(page, ()=>window.__test.recv({type:'state',from:'v1',name:'敌',color:0xff3344,x:20,y:1.6,z:-5,yaw:0,pitch:0,weapon:0,hp:100,alive:true,kills:0,deaths:0}));
  const pos2 = await ev(page, ()=>window.__test.pos());
  await ev(page, (p)=>window.__test.spawnSuperAt(p.x, p.z, 'star'), {x:pos2.x, z:pos2.z});
  await sleep(160);
  await ev(page, ()=>window.__test.clearSentHits());
  await ev(page, ()=>window.__test.fire());
  const beamN = await ev(page, ()=>window.__test.beamCount());
  check('崩星炮→出现可见轨迹', beamN > 0, `beams=${beamN}`);
  await sleep(900); // 等过 0.7s 蓄力 → 结算
  const sent = await ev(page, ()=>window.__test.sentHits());
  const killed = sent.some(h => h.to==='v1' && h.dmg>=9999);
  check('崩星炮→0.7s 后贯穿秒杀(上报9999)', killed, JSON.stringify(sent));
  await ev(page, ()=>window.__test.drop());

  // ---------- 5) 秘境枪：持枪者进入秘境(200血/高射速)，对手死亡→回主场 ----------
  await ev(page, ()=>window.__test.recv({type:'state',from:'rivX',name:'对手',color:0x90be6d,x:20,y:1.6,z:-5,yaw:0,pitch:0,weapon:0,hp:100,alive:true,kills:0,deaths:0}));
  await ev(page, ()=>window.__test.fireRealmAt('rivX'));
  const rh = await ev(page, ()=>window.__test.realmInfo());
  check('秘境(持枪者)→进入秘境', rh.inRealm===true && rh.opponent==='rivX', JSON.stringify(rh));
  check('秘境(持枪者)→200 血 + 高射速', rh.maxHp===200 && rh.hp===200 && rh.fireRateMul < 1, `maxHp=${rh.maxHp} hp=${rh.hp} rate=${rh.fireRateMul}`);
  check('秘境→被传送到秘境平台(z≈-200)', rh.z < -150, `z=${rh.z.toFixed(0)}`);
  await ev(page, (id)=>window.__test.recv({type:'kill', from:'rivX', killer:id, victim:'rivX', weapon:'rifle'}), myId);
  const rh2 = await ev(page, ()=>window.__test.realmInfo());
  check('对手死亡→赢家回到主场', rh2.inRealm===false && rh2.z > -150 && rh2.maxHp===100, JSON.stringify(rh2));

  // ---------- 6) 秘境枪：被命中者被拖入秘境 ----------
  await ev(page, (id)=>window.__test.recv({type:'realm_start', from:'H2', holder:'H2', victim:id, vx:6, vy:1.6, vz:-200}), myId);
  const rv = await ev(page, ()=>window.__test.realmInfo());
  check('秘境(被命中者)→被拖入秘境 1v1', rv.inRealm===true && rv.opponent==='H2' && rv.maxHp===100 && rv.z < -150, JSON.stringify(rv));
  // 对手(H2)死亡 → 我赢 → 回主场
  await ev(page, ()=>window.__test.recv({type:'kill', from:'H2', killer:'someone', victim:'H2', weapon:'rifle'}));
  const rv2 = await ev(page, ()=>window.__test.realmInfo());
  check('对手死亡→回到主场', rv2.inRealm===false && rv2.z > -150, JSON.stringify(rv2));

  // ---------- 7) 排山倒海手：被巨浪卷起翻滚后处死 ----------
  await ev(page, ()=>window.__test.setPos(0, 0));
  await ev(page, ()=>window.__test.recv({type:'tsunami', from:'enemy', tid:'ts1', owner:'enemy', x:0, z:5, dx:0, dz:-1}));
  const tN = await ev(page, ()=>window.__test.tsunamiCount());
  check('排山倒海→生成巨浪', tN > 0, `tsunamis=${tN}`);
  let tumbled = false, tdied = false;
  for (let i=0;i<26;i++){ await sleep(100);
    if (!tumbled && await ev(page, ()=>window.__test.tumbling())) tumbled = true;
    if (!(await ev(page, ()=>window.__test.alive()))) { tdied = true; break; }
  }
  check('被巨浪卷起→疯狂翻滚', tumbled, `tumbled=${tumbled}`);
  check('翻滚后→被处死', tdied, `died=${tdied}`);
  await ev(page, ()=>window.__test.revive());
  for (let i=0;i<20 && !(await ev(page, ()=>window.__test.alive())); i++) await sleep(100);

  // ---------- 8) 黑洞炮·路径致死：飞行途中扫过也能杀人（停下点离玩家>吸力范围，只能是路径致死） ----------
  await ev(page, ()=>window.__test.setPos(0, 0));
  await ev(page, ()=>window.__test.recv({type:'blackhole', from:'enemy', hid:'bhp', owner:'enemy', x:0, y:1.2, z:9, dx:0, dz:-1}));
  let pdied = false;
  for (let i=0;i<10 && !pdied;i++){ await sleep(100); pdied = !(await ev(page, ()=>window.__test.alive())); }
  check('黑洞→飞行途中路径上也能杀人', pdied, `alive=${!pdied}`);
  await ev(page, ()=>window.__test.revive());
  for (let i=0;i<20 && !(await ev(page, ()=>window.__test.alive())); i++) await sleep(100);

  // ---------- 9) 黑洞炮：停下后被吸入处死 ----------
  await ev(page, ()=>window.__test.setPos(0, 8));
  await ev(page, ()=>window.__test.recv({type:'blackhole', from:'enemy', hid:'bh1', owner:'enemy', x:0, y:1.2, z:24.8, dx:0, dz:-1}));
  const hN = await ev(page, ()=>window.__test.holeCount());
  check('黑洞炮→生成黑洞', hN > 0, `holes=${hN}`);
  let died = false;
  for (let i=0;i<20 && !died;i++){ await sleep(120); died = !(await ev(page, ()=>window.__test.alive())); }
  check('黑洞→附近的人被吸入处死', died, `alive=${!died}`);

  check('全程控制台零报错', errs.length===0, `err=${errs.length}`);
  if (errs.length) console.log('  '+errs.join('\n  '));

  await browser.close(); server.close();
  const allPass = results.every(Boolean);
  console.log('\n' + (allPass ? 'OVERALL: PASS ✅' : 'OVERALL: FAIL ❌'));
  process.exit(allPass?0:1);
})().catch(e=>{ console.error('features2 test crashed:', e); process.exit(2); });
