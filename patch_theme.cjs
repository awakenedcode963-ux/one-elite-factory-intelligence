const fs = require('fs');
let content = fs.readFileSync('src/lib/ThemeContext.tsx', 'utf8');

const regex = /useEffect\(\(\) => \{[\s\S]*?\}, \[theme\]\);/;
const replacement = `useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/lib/ThemeContext.tsx', content);
