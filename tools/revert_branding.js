const fs = require('fs');
const path = require('path');

const baseDir = 'd:/folder_coding/anime/anime';

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory && !f.startsWith('.') && f !== 'node_modules') {
            walk(dirPath, callback);
        } else if (!isDirectory) {
            callback(path.join(dir, f));
        }
    });
}

const fileExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.css'];

walk(baseDir, (filePath) => {
    const ext = path.extname(filePath);
    if (!fileExtensions.includes(ext)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace imports
    content = content.replace(/@\/lib\/samehadakuu/g, '@/lib/anime');
    content = content.replace(/\.\.\/lib\/samehadakuu/g, '../lib/anime');
    content = content.replace(/\.\.\/\.\.\/lib\/samehadakuu/g, '../../lib/anime');
    
    // Replace text branding (case insensitive but keeping common patterns)
    content = content.replace(/Samehadakuu/g, 'Samehadakuu');
    content = content.replace(/samehadakuu/g, 'samehadakuu');
    content = content.replace(/samehadakuu\.com/g, 'samehadakuu.com');
    
    if (content !== original) {
        console.log(`Updated: ${filePath}`);
        fs.writeFileSync(filePath, content, 'utf8');
    }
});
