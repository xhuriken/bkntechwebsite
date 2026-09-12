import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');
const POSTS_JSON = path.resolve(process.cwd(), 'api', 'posts.json');
const SETTINGS_JSON = path.resolve(process.cwd(), 'api', 'settings.json');
const DETAILED_PROJECTS_JS = path.resolve(process.cwd(), 'src', 'utils', 'detailedProjects.js');

async function runOptimization() {
  console.log('==================================================');
  console.log('  OPTIMISATION & CONVERSION WEBP DES IMAGES EXISTANTES');
  console.log('==================================================\n');

  if (!fs.existsSync(UPLOADS_DIR)) {
    console.log(`Répertoire introuvable : ${UPLOADS_DIR}`);
    return;
  }

  const files = fs.readdirSync(UPLOADS_DIR);
  const replacements = new Map(); // oldUrl -> newUrl

  let totalOriginal = 0;
  let totalOptimized = 0;
  let convertedCount = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const isTargetImage = ['.png', '.jpg', '.jpeg', '.avif', '.bmp'].includes(ext);

    if (!isTargetImage) {
      if (ext === '.webp') {
        console.log(`[PASS] Déjà au format WebP : ${file}`);
      } else if (['.mp4', '.webm', '.mov', '.ogg'].includes(ext)) {
        console.log(`[VIDEO] Vidéo préservée : ${file}`);
      } else {
        console.log(`[SKIP] Fichier non concerné : ${file}`);
      }
      continue;
    }

    const oldFilePath = path.join(UPLOADS_DIR, file);
    const rawBuffer = fs.readFileSync(oldFilePath);
    const originalSize = rawBuffer.length;
    totalOriginal += originalSize;

    const baseName = path.basename(file, ext);
    const newFileName = `${baseName}.webp`;
    const newFilePath = path.join(UPLOADS_DIR, newFileName);

    try {
      const optimizedBuffer = await sharp(rawBuffer)
        .rotate()
        .resize({
          width: 1920,
          height: 1920,
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: 82, effort: 4 })
        .toBuffer();

      const newSize = optimizedBuffer.length;
      totalOptimized += newSize;

      fs.writeFileSync(newFilePath, optimizedBuffer);

      // Si le nom a changé (png/jpg -> webp), on supprime l'ancien fichier lourd
      if (oldFilePath !== newFilePath) {
        fs.unlinkSync(oldFilePath);
      }

      const oldUrl = `/uploads/${file}`;
      const newUrl = `/uploads/${newFileName}`;
      replacements.set(oldUrl, newUrl);

      const percentSaved = Math.round(((originalSize - newSize) / originalSize) * 100);
      console.log(`[CONVERTI] ✅ ${file} -> ${newFileName}`);
      console.log(`           ${Math.round(originalSize / 1024)} Ko -> ${Math.round(newSize / 1024)} Ko (-${percentSaved}%)\n`);
      convertedCount++;
    } catch (err) {
      console.error(`[ERREUR] Impossible d'optimiser ${file} :`, err.message);
    }
  }

  console.log(`\n🎉 ${convertedCount} image(s) convertie(s) en WebP.`);
  const totalSaved = totalOriginal - totalOptimized;
  console.log(`Taille initiale : ${(totalOriginal / (1024 * 1024)).toFixed(2)} Mo`);
  console.log(`Taille optimisée: ${(totalOptimized / (1024 * 1024)).toFixed(2)} Mo`);
  console.log(`Économie totale : ${(totalSaved / (1024 * 1024)).toFixed(2)} Mo (-${Math.round((totalSaved / totalOriginal) * 100)}%)\n`);

  // Remplacement des URLs dans les fichiers de données
  console.log('Mise à jour des références dans posts.json, settings.json, detailedProjects.js...');

  function replaceInFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let replacedCount = 0;

    for (const [oldUrl, newUrl] of replacements.entries()) {
      if (content.includes(oldUrl)) {
        content = content.split(oldUrl).join(newUrl);
        replacedCount++;
      }
    }

    if (replacedCount > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${path.basename(filePath)} mis à jour (${replacedCount} référence(s) remplacée(s))`);
    } else {
      console.log(`ℹ️  ${path.basename(filePath)} (aucune modification nécessaire)`);
    }
  }

  replaceInFile(POSTS_JSON);
  replaceInFile(SETTINGS_JSON);
  replaceInFile(DETAILED_PROJECTS_JS);

  console.log('\nOptimisation terminée avec succès !');
}

runOptimization();
