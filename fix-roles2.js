const fs = require('fs');
const path = require('path');

const replacementAdmin = `  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: { role: true }
  });
  if (dbUser?.role !== 'ADMIN')`;

const replacementStaff = `  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: { role: true }
  });
  if (dbUser?.role !== 'ADMIN' && dbUser?.role !== 'STAFF')`;

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

  const regexAdmin1 = /([ \t]*)if\s*\(\s*user\.role\s*!==\s*['"]ADMIN['"]\s*\)/g;
  const regexStaff1 = /([ \t]*)if\s*\(\s*user\.role\s*!==\s*['"]ADMIN['"]\s*&&\s*user\.role\s*!==\s*['"]STAFF['"]\s*\)/g;

  if (regexStaff1.test(content) || regexAdmin1.test(content)) {
    // Only apply if it doesn't already have the dbUser check to avoid double-adding
    if (!content.includes('const dbUser = await prisma.user.findUnique')) {
        console.log('Fixing:', file);
        
        content = content.replace(regexStaff1, (match, indent) => {
            return indent + replacementStaff.replace(/\n  /g, '\n' + indent);
        });

        content = content.replace(regexAdmin1, (match, indent) => {
            return indent + replacementAdmin.replace(/\n  /g, '\n' + indent);
        });
        
        if (content.includes('prisma.user.findUnique') && !content.includes('import { prisma }')) {
           content = `import { prisma } from "@/lib/prisma";\n` + content;
        }
        
        fs.writeFileSync(file, content, 'utf8');
        modified = true;
    }
  }
});
console.log('Done.');
