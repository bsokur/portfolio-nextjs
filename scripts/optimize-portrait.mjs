import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Keep the original photograph intact; only resize and encode for display.
const source = fileURLToPath(new URL('../assets/portrait.png', import.meta.url));
const outputDirectory = new URL('../public/images/', import.meta.url);
const widths = [192, 320, 416, 624];

await mkdir(outputDirectory, { recursive: true });

for (const width of widths) {
  const output = fileURLToPath(new URL(`portrait-${width}.webp`, outputDirectory));
  const result = await sharp(source)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82, effort: 6, smartSubsample: true })
    .toFile(output);

  console.log(`portrait-${width}.webp: ${result.width}×${result.height}, ${result.size.toLocaleString('en-US')} bytes`);
}
