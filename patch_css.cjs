const fs = require('fs');
let content = fs.readFileSync('src/index.css', 'utf8');

if (!content.includes('body {')) {
  content += `\n\nbody {
  @apply bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100;
}`;
} else if (!content.includes('bg-[#09090b]')) {
  content = content.replace(/body\s*\{[\s\S]*?\}/, `body {
  @apply bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100;
}`);
}

fs.writeFileSync('src/index.css', content);
