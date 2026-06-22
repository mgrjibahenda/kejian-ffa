import fs from 'node:fs';
const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');
const ANCHOR = "if (!MAP_LIST.some(function (m) { return m.id === 'magmacore'; })) MAP_LIST.push({ id:'magmacore', name:'熔岩地心·钢铁工厂' });";
const idx = html.indexOf(ANCHOR);
if (idx < 0) { console.error('ANCHOR NOT FOUND — abort'); process.exit(1); }
if (html.indexOf(ANCHOR, idx + 1) >= 0) { console.error('ANCHOR NOT UNIQUE — abort'); process.exit(1); }
// 已集成过则跳过(防重复插入)
if (html.indexOf("MAP_BUILD['skytemple']") >= 0) { console.error('skytemple already integrated — abort'); process.exit(1); }
const ids = ['skytemple', 'frostfort', 'cybercity'];
let blob = '\n';
for (const id of ids) {
  const code = fs.readFileSync('test/_mod_' + id + '.js', 'utf8');
  blob += '\n    // ===== 档位4 P3 量产地图: ' + id + ' =====\n' + code.split('\n').map(l => l.length ? '    ' + l : l).join('\n') + '\n';
}
const insertAt = idx + ANCHOR.length;
html = html.slice(0, insertAt) + '\n' + blob + html.slice(insertAt);
fs.writeFileSync(FILE, html);
console.log('integrated 3 modules; file now', html.length, 'chars');
