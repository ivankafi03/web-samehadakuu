const fs = require('fs');
const src = 'C:\\Users\\Pongo\\.gemini\\antigravity\\brain\\8ff73f30-b1a8-4c2e-bf62-93380e7406eb\\samehadakuu_logo_1778506861222.png';
fs.copyFileSync(src, './public/logo.png');
fs.copyFileSync(src, './app/icon.png');
console.log('Copied successfully!');
