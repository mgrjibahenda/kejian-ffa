import fs from 'node:fs';
const OUT = 'C:/Users/zhengers/AppData/Local/Temp/claude/C--Users-zhengers-Guns/7f097d6a-f4d6-434f-a49a-1647c3dae278/tasks/w6f9e0w82.output';
const raw = JSON.parse(fs.readFileSync(OUT, 'utf8'));
const mods = (raw.result && raw.result.modules) || raw.modules || [];
console.log('modules:', mods.length);
for (const m of mods) {
  const code = m.moduleCode || '';
  const ent = (code.match(/&lt;|&gt;|&amp;|&quot;/g) || []).length;
  fs.writeFileSync('test/_mod_' + m.id + '.js', code);
  console.log(`${m.id} | ${m.name} | chars:${code.length} | htmlEntities:${ent} | risks:${(m.riskNotes||[]).length}`);
  if ((m.riskNotes||[]).length) console.log('   risks: ' + m.riskNotes.join(' || '));
}
