const fs = require('fs');

let content = fs.readFileSync('src/index.css', 'utf8');

const explicitDarkCSS = `
@custom-variant dark (&:is(.dark *));

html.dark {
  color-scheme: dark;
}

html.dark body {
  background-color: #09090b !important;
  color: #f4f4f5 !important;
}

html.dark .bg-white {
  background-color: #18181b !important;
}

html.dark .bg-gray-50, html.dark .bg-neutral-50, html.dark .bg-zinc-50 {
  background-color: #09090b !important;
}

html.dark .border-gray-200, html.dark .border-neutral-200, html.dark .border-gray-100, html.dark .border-zinc-200 {
  border-color: #27272a !important;
}

html.dark .text-gray-900, html.dark .text-neutral-900, html.dark .text-zinc-900 {
  color: #fafafa !important;
}

html.dark .text-gray-600, html.dark .text-neutral-600, html.dark .text-gray-500, html.dark .text-zinc-500, html.dark .text-zinc-600 {
  color: #a1a1aa !important;
}
`;

if (!content.includes('html.dark body')) {
  content += explicitDarkCSS;
  fs.writeFileSync('src/index.css', content);
}
