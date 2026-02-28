const fs = require('fs');
for (const p of ['node_modules/@prisma/dev/dist/index.cjs', 'node_modules/@prisma/dev/dist/state.cjs', 'node_modules/@prisma/dev/dist/index.js', 'node_modules/@prisma/dev/dist/state.js']) {
  if (fs.existsSync(p)) {
    let d = fs.readFileSync(p, 'utf-8');
    d = d.replace(/require\(['"]zeptomatch['"]\)/g, '({default:()=>true})');
    fs.writeFileSync(p, d);
  }
}
console.log('patched');
