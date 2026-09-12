import sharp from 'sharp';

/**
 * Optimise et compresse une image reçue au téléversement :
 * - Redimensionne à 1920px max de côté (sans agrandissement si déjà inférieure)
 * - Corrige l'orientation automatique via les tags EXIF
 * - Supprime les métadonnées superflues
 * - Convertit en format moderne WebP (qualité 82%, effort 4)
 *
 * En cas d'erreur sur un format spécifique ou un flux corrompu,
 * bascule en repli transparent sur le buffer d'origine sans rejeter l'upload.
 */
export async function optimizeUploadedImage(
  inputBuffer,
  originalMimeType = '',
  originalExtension = ''
) {
  const isCompressibleImage =
    originalMimeType === 'image/png' ||
    originalMimeType === 'image/jpeg' ||
    originalMimeType === 'image/jpg' ||
    originalMimeType === 'image/webp' ||
    originalMimeType === 'image/avif' ||
    originalMimeType === 'image/bmp' ||
    /\.(png|jpe?g|webp|avif|bmp)$/i.test(originalExtension);

  // SVG, GIF animés, vidéos et formats non compressibles sont préservés tels quels
  if (!isCompressibleImage) {
    return {
      buffer: inputBuffer,
      mimeType: originalMimeType,
      extension: originalExtension.replace(/^\./, '') || 'bin',
      sizeBytes: inputBuffer.length,
      isOptimized: false
    };
  }

  try {
    const optimizedBuffer = await sharp(inputBuffer)
      .rotate() // Auto-rotation basée sur l'orientation EXIF
      .resize({
        width: 1920,
        height: 1920,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({
        quality: 82,
        effort: 4,
      })
      .toBuffer();

    return {
      buffer: optimizedBuffer,
      mimeType: 'image/webp',
      extension: 'webp',
      sizeBytes: optimizedBuffer.length,
      isOptimized: true
    };
  } catch (err) {
    console.warn('[imageOptimizer] Avertissement compression (repli sur buffer original) :', err.message);
    return {
      buffer: inputBuffer,
      mimeType: originalMimeType,
      extension: originalExtension.replace(/^\./, '') || 'png',
      sizeBytes: inputBuffer.length,
      isOptimized: false
    };
  }
}
