const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'images');
const files = fs.readdirSync(imgDir).filter(f => f.endsWith('.jpg'));

async function convert() {
  for (const file of files) {
    const src = path.join(imgDir, file);
    const dest = path.join(imgDir, file.replace('.jpg', '.webp'));
    await sharp(src).webp({ quality: 72 }).toFile(dest);
    const stat = fs.statSync(dest);
    const kb = Math.round(stat.size / 1024);
    console.log(`${file} -> ${path.basename(dest)}: ${kb}KB`);
    if (kb > 100) {
      // Re-encode with lower quality
      await sharp(src).webp({ quality: 50 }).toFile(dest);
      const stat2 = fs.statSync(dest);
      console.log(`  Re-encoded: ${Math.round(stat2.size/1024)}KB`);
    }
  }
  console.log('All done!');
}

convert().catch(console.error);
