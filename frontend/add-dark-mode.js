const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

function convertClasses(cls) {
    let result = cls;
    
    // Backgrounds
    if (result.includes('bg-white') && !result.includes('dark:bg-[#1A1D1F]')) {
        result = result.replace(/bg-white/g, 'bg-white dark:bg-[#1A1D1F]');
    }
    if (result.includes('bg-[#F7F9FB]') && !result.includes('dark:bg-[#111315]')) {
        result = result.replace(/bg-\\[#F7F9FB\\]/g, 'bg-[#F7F9FB] dark:bg-[#111315]');
    }
    if (result.includes('bg-[#F4F4F4]') && !result.includes('dark:bg-[#272B30]')) {
        result = result.replace(/bg-\\[#F4F4F4\\]/g, 'bg-[#F4F4F4] dark:bg-[#272B30]');
    }
    
    // Text colors
    if (result.includes('text-[#1A1D1F]') && !result.includes('dark:text-white')) {
        result = result.replace(/text-\\[#1A1D1F\\]/g, 'text-[#1A1D1F] dark:text-white');
    }
    if (result.includes('text-[#6F767E]') && !result.includes('dark:text-[#9A9FA5]')) {
        result = result.replace(/text-\\[#6F767E\\]/g, 'text-[#6F767E] dark:text-[#9A9FA5]');
    }

    // Borders
    if (result.includes('border-[#EFF2F5]') && !result.includes('dark:border-[#272B30]')) {
        result = result.replace(/border-\\[#EFF2F5\\]/g, 'border-[#EFF2F5] dark:border-[#272B30]');
    }
    
    return result;
}

const regex = /className=[\"'](.*?)[\"']/g;
const clsxRegex = /cn\(\s*(?:[\"'](.*?)[\"']|\n\s*[\"'](.*?)[\"'])/g;

['src/components', 'src/pages', 'src/layouts'].forEach(folder => {
  const folderPath = path.join(__dirname, folder);
  if (!fs.existsSync(folderPath)) return;
  walk(folderPath, (filePath) => {
    if (filePath.endsWith('.jsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      
      // Simple className strings
      content = content.replace(regex, (match, p1) => {
          return `className="${convertClasses(p1)}"`;
      });
      // Template literals
      content = content.replace(/className=\{`([^`]+)`\}/g, (match, p1) => {
          return `className={\`${convertClasses(p1)}\`}`;
      });

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log('Updated', filePath);
      }
    }
  });
});
