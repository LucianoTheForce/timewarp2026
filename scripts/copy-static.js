const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
const itemsToCopy = ['control.html', 'js', 'assets'];

for (const item of itemsToCopy) {
    const src = path.join(__dirname, '..', item);
    if (!fs.existsSync(src)) continue;

    const dest = path.join(dist, item);
    fs.mkdirSync(path.dirname(dest), { recursive: true });

    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        copyDir(src, dest);
    } else {
        fs.copyFileSync(src, dest);
    }
}

function copyDir(srcDir, destDir) {
    fs.mkdirSync(destDir, { recursive: true });
    for (const entry of fs.readdirSync(srcDir)) {
        const srcPath = path.join(srcDir, entry);
        const destPath = path.join(destDir, entry);
        const stat = fs.statSync(srcPath);
        if (stat.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

console.log('Static files copied to dist');
