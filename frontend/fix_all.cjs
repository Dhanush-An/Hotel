const fs = require('fs');
const path = require('path');

const directories = [
    'd:/HMS/frontend/src/components',
    'd:/HMS/frontend/src/pages',
    'd:/HMS/frontend/src/layouts'
];

function processFile(filePath) {
    if (filePath.includes('Login.jsx') || filePath.includes('DashboardLayout.jsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Fix hovers: Add dark hover equivalents where missing
    // We match `hover:bg-gray-50` that DOES NOT have `dark:hover:bg-` following it
    content = content.replace(/hover:bg-gray-50(?!\s*dark:hover:bg-)/g, 'hover:bg-gray-50 dark:hover:bg-[#2a2a35]');
    content = content.replace(/hover:bg-gray-100(?!\s*dark:hover:bg-)/g, 'hover:bg-gray-100 dark:hover:bg-[#2a2a35]');
    content = content.replace(/hover:bg-\[#F4F4F4\](?!\s*dark:hover:bg-)/g, 'hover:bg-[#F4F4F4] dark:hover:bg-[#2a2a35]');
    content = content.replace(/hover:bg-blue-50(?!\s*dark:hover:bg-)/g, 'hover:bg-blue-50 dark:hover:bg-blue-900/40');
    content = content.replace(/hover:bg-yellow-50(?!\s*dark:hover:bg-)/g, 'hover:bg-yellow-50 dark:hover:bg-yellow-900/40');
    content = content.replace(/hover:bg-green-50(?!\s*dark:hover:bg-)/g, 'hover:bg-green-50 dark:hover:bg-green-900/40');
    content = content.replace(/hover:bg-purple-50(?!\s*dark:hover:bg-)/g, 'hover:bg-purple-50 dark:hover:bg-purple-900/40');
    content = content.replace(/hover:bg-red-50(?!\s*dark:hover:bg-)/g, 'hover:bg-red-50 dark:hover:bg-red-900/40');
    content = content.replace(/hover:bg-orange-50(?!\s*dark:hover:bg-)/g, 'hover:bg-orange-50 dark:hover:bg-orange-900/40');

    // Fix recharts width/height warnings
    // Only replace if they don't already have minWidth
    content = content.replace(/<ResponsiveContainer([^>]*)>/g, (match, attrs) => {
        if (attrs.includes('minWidth')) return match; 
        return `<ResponsiveContainer${attrs} minWidth={0} minHeight={0}>`;
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed file: ' + filePath);
    }
}

function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.tsx')) {
            processFile(fullPath);
        }
    }
}

directories.forEach(dir => processDirectory(dir));
console.log('Done.');
