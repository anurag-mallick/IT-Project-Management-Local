const fs = require('fs');
const path = require('path');

const replacement = `  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: { role: true }
  });
  if (dbUser?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }`;

const apiDir = path.join(__dirname, 'src/app/api');

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(file));
    } else if (file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walkDir(apiDir);
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // Pattern 1: if (user.role !== 'ADMIN') { ... } 
  // with early return. Since there are different variations and spacings, we use regex.
  const regex1 = /([ \t]*)if\s*\(\s*user\.role\s*!==\s*['"]ADMIN['"]\s*\)\s*\{\s*return\s*NextResponse\.json[^}]+\}\s*\}/g;
  
  // Actually, some are just single line: if (user.role !== 'ADMIN') return NextResponse...
  const regex2 = /([ \t]*)if\s*\(\s*user\.role\s*!==\s*['"]ADMIN['"]\s*\)\s*return\s*NextResponse\.json.*?;/g;
  
  // Specific match for Assets where role !== ADMIN && role !== STAFF
  const regex3 = /([ \t]*)if\s*\(\s*user\.role\s*!==\s*['"]ADMIN['"]\s*&&\s*user\.role\s*!==\s*['"]STAFF['"]\s*\)\s*\{\s*return\s*NextResponse\.json[^}]+\}\s*\}/g;

  if (regex1.test(content) || regex2.test(content) || regex3.test(content)) {
    console.log('Fixing:', file);
    
    content = content.replace(regex1, (match, indent) => {
        return indent + replacement.replace(/\n  /g, '\n' + indent);
    });

    content = content.replace(regex2, (match, indent) => {
        return indent + replacement.replace(/\n  /g, '\n' + indent);
    });

    content = content.replace(regex3, (match, indent) => {
        const staffReplacement = `  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: { role: true }
  });
  if (dbUser?.role !== 'ADMIN' && dbUser?.role !== 'STAFF') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }`;
        return indent + staffReplacement.replace(/\n  /g, '\n' + indent);
    });
    
    // Make sure prisma and NextResponse are imported if we added them
    if (content.includes('prisma.user.findUnique') && !content.includes('import { prisma }')) {
       content = `import { prisma } from "@/lib/prisma";\n` + content;
    }
    
    fs.writeFileSync(file, content, 'utf8');
    modified = true;
  }
});

console.log('Role checks updated.');
