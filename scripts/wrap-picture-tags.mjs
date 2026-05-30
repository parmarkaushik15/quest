import fs from 'fs'
import path from 'path'

const root = new URL('..', import.meta.url).pathname
const htmlPath = path.join(root, 'index.html')
let html = fs.readFileSync(htmlPath, 'utf8')

function webpExists(src) {
  const webp = path.join(root, src.replace(/\.(jpe?g|png)$/i, '.webp'))
  return fs.existsSync(webp)
}

const imgRe = /<img([^>]*)\ssrc="((?:images|assets\/img)\/[^"]+\.(jpe?g|png))"([^>]*)\/?>/gi

html = html.replace(imgRe, (match, before, file, _ext, after) => {
  if (match.includes('<picture')) return match
  if (!webpExists(file)) return match

  const base = file.replace(/\.(jpe?g|png)$/i, '')
  const attrs = `${before} ${after}`.trim()
  const isLcp = base.includes('hero-image')
  const fetchAttr = isLcp && !/fetchpriority/i.test(attrs) ? ' fetchpriority="high"' : ''
  const lazyAttr = isLcp || /loading=/i.test(attrs) ? '' : ' loading="lazy"'
  const decoding = /decoding=/i.test(attrs) ? '' : ' decoding="async"'

  return `<picture><source srcset="${base}.webp" type="image/webp"><img src="${file}"${before}${after}${fetchAttr}${lazyAttr}${decoding}></picture>`
})

fs.writeFileSync(htmlPath, html)
console.log('Updated index.html with picture elements')
