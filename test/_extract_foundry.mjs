import fs from 'node:fs';
import { execSync } from 'node:child_process';
const OUT = 'C:/Users/zhengers/AppData/Local/Temp/claude/C--Users-zhengers-Guns/7f097d6a-f4d6-434f-a49a-1647c3dae278/tasks/wwhgnyidu.output';
const raw = JSON.parse(fs.readFileSync(OUT, 'utf8'));
const sets = (raw.result && raw.result.sets) || raw.sets || [];
console.log('sets:', sets.length);
let all = '';
const allFns = [];
const allKeys = new Set();
sets.forEach((s, i) => {
  const code = s.code || '';
  fs.writeFileSync(`test/_prop_${i}.js`, code);
  const fns = [...code.matchAll(/function\s+(make[A-Za-z0-9_]+)\s*\(/g)].map(m => m[1]);
  allFns.push(...fns);
  [...code.matchAll(/mats\.([A-Za-z0-9_]+)/g)].forEach(m => allKeys.add(m[1]));
  const sceneAdd = (code.match(/scene\.add/g) || []).length;
  const mAddCall = (code.match(/\bmAdd\s*\(/g) || []).length;
  const newMat = (code.match(/new\s+THREE\.[A-Za-z]*Material/g) || []).length;
  console.log(`\n[${i}] ${s.category} | chars:${code.length} | fns:${fns.length} | scene.add:${sceneAdd} | mAdd:${mAddCall} | newMaterial:${newMat}`);
  console.log('   fns: ' + fns.join(', '));
  if ((s.placementHints||[]).length) console.log('   hints: ' + s.placementHints.slice(0,12).join(' | '));
  if ((s.riskNotes||[]).length) console.log('   risks: ' + s.riskNotes.slice(0,6).join(' | '));
  all += `\n// ===== set ${i}: ${s.category} =====\n` + code + '\n';
});
fs.writeFileSync('test/_props_all.js', all);
console.log('\n==== total fns:', allFns.length, '====');
console.log('==== mats keys used (' + allKeys.size + '):', [...allKeys].sort().join(', '));
try { execSync('node --check test/_props_all.js', { stdio:'pipe' }); console.log('==== SYNTAX: OK ===='); }
catch(e){ console.log('==== SYNTAX ERROR ====\n' + (e.stderr ? e.stderr.toString() : e.message)); }
