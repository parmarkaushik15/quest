import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const root = new URL('..', import.meta.url).pathname

/** Same pattern as hirabagroup: explicit targets with maxWidth + quality. */
const targets = [
  // Hero / LCP
  { file: 'assets/img/home-2/hero-image.jpg', maxWidth: 828, quality: 82 },
  { file: 'assets/img/home-2/special-image.jpg', maxWidth: 1920, quality: 78 },

  // Large photos
  { file: 'assets/img/home-2/choose-us.jpg', maxWidth: 800, quality: 80 },
  { file: 'assets/img/home-2/faq-image.png', maxWidth: 718, quality: 85 },
  { file: 'assets/img/home-2/about-image.png', maxWidth: 800, quality: 85 },
  { file: 'assets/img/home-2/extra-activities-1.jpg', maxWidth: 720, quality: 75 },
  { file: 'assets/img/home-2/extra-activities-2.jpg', maxWidth: 720, quality: 75 },
  { file: 'assets/img/home-2/extra-activities-3.jpg', maxWidth: 720, quality: 75 },

  // Brand / flyers
  { file: 'images/logo.png', maxWidth: 714, quality: 85 },
  { file: 'images/handwriting-olympiad-flyer.png', maxWidth: 723, quality: 88 },
  { file: 'images/summer-camp-flyer.png', maxWidth: 682, quality: 88 },

  // Team
  { file: 'assets/img/home-2/team-01.png', maxWidth: 390, quality: 85 },
  { file: 'assets/img/home-2/team-02.png', maxWidth: 506, quality: 85 },

  // Course mascots (transparent PNGs)
  { file: 'assets/img/home-2/program1.png', maxWidth: 300, quality: 90 },
  { file: 'assets/img/home-2/program2.png', maxWidth: 300, quality: 90 },
  { file: 'assets/img/home-2/program3.png', maxWidth: 300, quality: 90 },
  { file: 'assets/img/home-2/program4.png', maxWidth: 300, quality: 90 },
  { file: 'assets/img/home-2/program5.png', maxWidth: 300, quality: 90 },
  { file: 'assets/img/home-2/program6.png', maxWidth: 300, quality: 90 },

  // Hero overlays (alpha — higher quality like hirabagroup PNGs)
  { file: 'assets/img/home-2/hero-line.png', maxWidth: 891, quality: 92 },
  { file: 'assets/img/home-2/hero-shape1.png', maxWidth: 125, quality: 92 },
  { file: 'assets/img/home-2/hero-shape2.png', maxWidth: 125, quality: 92 },

  // Footer / header
  { file: 'assets/img/home-1/footer-top.png', maxWidth: 1200, quality: 82 },
  { file: 'assets/img/header/top-bar-2.png', maxWidth: 1920, quality: 82 },
]

async function convert({ file, maxWidth, quality, out }) {
  const input = path.join(root, file)
  if (!fs.existsSync(input)) {
    console.warn('skip missing', file)
    return false
  }

  const webpOut = path.join(root, out ?? file.replace(/\.(jpe?g|png)$/i, '.webp'))
  const before = fs.statSync(input).size

  await sharp(input)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality, effort: 6, alphaQuality: 100 })
    .toFile(webpOut)

  const after = fs.statSync(webpOut).size
  console.log(`${file} -> ${path.relative(root, webpOut)}: ${(before / 1024).toFixed(0)}KiB -> ${(after / 1024).toFixed(0)}KiB`)
  return true
}

function findImages(dir, results = []) {
  if (!fs.existsSync(dir)) return results
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.venv' || entry.name === 'scripts') continue
      findImages(full, results)
    } else if (/\.(jpe?g|png)$/i.test(entry.name)) {
      results.push(path.relative(root, full))
    }
  }
  return results
}

const converted = new Set()

for (const target of targets) {
  if (await convert(target)) {
    converted.add(target.file)
  }
}

// Remaining images: defaults (PNG with alpha → quality 92)
for (const file of findImages(root)) {
  if (converted.has(file)) continue

  const input = path.join(root, file)
  const meta = await sharp(input).metadata()
  await convert({
    file,
    maxWidth: meta.width,
    quality: meta.hasAlpha ? 92 : 82,
  })
}
