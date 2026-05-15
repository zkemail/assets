import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import * as fontkit from "fontkit";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const svgDir = path.join(dist, "svg");
const pngDir = path.join(dist, "png");
const iconDir = path.join(dist, "icons");
const previewDir = path.join(dist, "previews");
const sourceDir = path.join(root, "source");

const black = "#000000";
const white = "#ffffff";
const brandName = "Ivy Research";
const horizontalWordmark = "vy Research";
const fontPath =
  process.env.IVY_RESEARCH_FONT_PATH ||
  process.env.VY_RESEARCH_FONT_PATH ||
  "/System/Library/Fonts/Avenir Next.ttc";
const fontName =
  process.env.IVY_RESEARCH_FONT_NAME ||
  process.env.VY_RESEARCH_FONT_NAME ||
  "Avenir Next Demi Bold";

const fontFile = fontkit.openSync(fontPath);
const font = Array.isArray(fontFile.fonts)
  ? fontFile.fonts.find((candidate) => candidate.fullName === fontName)
  : fontFile;

if (!font) {
  throw new Error(`Could not find "${fontName}" in ${fontPath}.`);
}

await resetDir(dist);
await Promise.all([
  fs.mkdir(svgDir, { recursive: true }),
  fs.mkdir(pngDir, { recursive: true }),
  fs.mkdir(iconDir, { recursive: true }),
  fs.mkdir(previewDir, { recursive: true }),
  fs.mkdir(sourceDir, { recursive: true }),
]);

const logoHorizontalBlack = horizontalLogo(black, "Ivy Research logo");
const logoHorizontalWhite = horizontalLogo(white, "Ivy Research logo inverse");
const markBlack = markLogo(black, "Ivy Research mark");
const markWhite = markLogo(white, "Ivy Research mark inverse");
const wordmarkBlack = wordmarkLogo(black, "Ivy Research wordmark");
const wordmarkWhite = wordmarkLogo(white, "Ivy Research wordmark inverse");
const stackedBlack = stackedLogo(black, "Ivy Research stacked logo");
const stackedWhite = stackedLogo(white, "Ivy Research stacked logo inverse");
const faviconSvg = squareMark(black, "Ivy Research favicon");

const svgs = {
  "logo-horizontal-black.svg": logoHorizontalBlack,
  "logo-horizontal-white.svg": logoHorizontalWhite,
  "logo-stacked-black.svg": stackedBlack,
  "logo-stacked-white.svg": stackedWhite,
  "mark-black.svg": markBlack,
  "mark-white.svg": markWhite,
  "wordmark-black.svg": wordmarkBlack,
  "wordmark-white.svg": wordmarkWhite,
  "favicon.svg": faviconSvg,
};

await Promise.all(
  Object.entries(svgs).flatMap(([name, contents]) => [
    fs.writeFile(path.join(svgDir, name), contents),
    fs.writeFile(path.join(sourceDir, name), contents),
  ]),
);

await Promise.all([
  ...[512, 1024, 2048].flatMap((width) => [
    renderWidth(
      logoHorizontalBlack,
      path.join(pngDir, `logo-horizontal-black-${width}.png`),
      width,
    ),
    renderWidth(
      logoHorizontalWhite,
      path.join(pngDir, `logo-horizontal-white-${width}.png`),
      width,
    ),
  ]),
  ...[512, 1024, 2048].flatMap((width) => [
    renderWidth(
      stackedBlack,
      path.join(pngDir, `logo-stacked-black-${width}.png`),
      width,
    ),
    renderWidth(
      stackedWhite,
      path.join(pngDir, `logo-stacked-white-${width}.png`),
      width,
    ),
  ]),
  ...[128, 256, 512, 1024].flatMap((width) => [
    renderWidth(markBlack, path.join(pngDir, `mark-black-${width}.png`), width),
    renderWidth(markWhite, path.join(pngDir, `mark-white-${width}.png`), width),
  ]),
]);

const iconPngs = await Promise.all(
  [16, 32, 48, 64, 128, 180, 192, 256, 512, 1024].map(async (size) => {
    const buffer = await renderSquare(faviconSvg, size);
    await fs.writeFile(path.join(iconDir, `icon-${size}.png`), buffer);
    return { size, buffer };
  }),
);

await fs.writeFile(
  path.join(iconDir, "apple-touch-icon.png"),
  await sharp(Buffer.from(faviconSvg))
    .resize(180, 180)
    .flatten({ background: white })
    .png()
    .toBuffer(),
);
await fs.writeFile(
  path.join(iconDir, "favicon.ico"),
  makeIco(iconPngs.filter(({ size }) => [16, 32, 48].includes(size))),
);
await fs.writeFile(path.join(iconDir, "favicon.svg"), faviconSvg);
await fs.writeFile(
  path.join(iconDir, "site.webmanifest"),
  `${JSON.stringify(
    {
      name: "Ivy Research",
      short_name: "Ivy",
      icons: [
        {
          src: "icon-192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "icon-512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
      theme_color: black,
      background_color: white,
      display: "standalone",
    },
    null,
    2,
  )}\n`,
);

await Promise.all([
  renderPreview(
    path.join(pngDir, "logo-horizontal-black-1024.png"),
    path.join(previewDir, "logo-horizontal-on-white.png"),
    white,
  ),
  renderPreview(
    path.join(pngDir, "logo-horizontal-white-1024.png"),
    path.join(previewDir, "logo-horizontal-on-black.png"),
    black,
  ),
  renderPreview(
    path.join(pngDir, "logo-stacked-black-1024.png"),
    path.join(previewDir, "logo-stacked-on-white.png"),
    white,
  ),
  renderPreview(
    path.join(iconDir, "icon-512.png"),
    path.join(previewDir, "icon-on-white.png"),
    white,
  ),
]);

console.log("Generated Ivy Research brand assets in dist/ and source/.");

function horizontalLogo(color, title) {
  const wordmark = textGeometry(horizontalWordmark, 122, 150, 135, color);
  return svg({
    title,
    width: Math.ceil(wordmark.bounds.x2 + 32),
    height: 189,
    body: `${markGroup(color)}
${wordmark.elements}`,
  });
}

function markLogo(color, title) {
  return svg({
    title,
    width: 128,
    height: 176,
    body: markGroup(color),
  });
}

function squareMark(color, title) {
  return svg({
    title,
    width: 192,
    height: 192,
    body: `<g transform="translate(21 1) scale(1.05)">
${indent(markGroup(color), 2)}
  </g>`,
  });
}

function wordmarkLogo(color, title) {
  const raw = textGeometry(brandName, 0, 0, 135, color);
  const pad = 10;
  const wordmark = textGeometry(
    brandName,
    pad - raw.bounds.x1,
    pad - raw.bounds.y1,
    135,
    color,
  );
  const width = wordmark.bounds.x2 + pad;
  const height = wordmark.bounds.y2 + pad;
  return svg({
    title,
    width,
    height,
    precision: 3,
    body: wordmark.elements,
  });
}

function stackedLogo(color, title) {
  const raw = textGeometry(brandName, 0, 0, 112, color);
  const wordWidth = raw.bounds.x2 - raw.bounds.x1;
  const wordX = (1000 - wordWidth) / 2 - raw.bounds.x1;
  const wordY = 345 - raw.bounds.y1;
  const wordmark = textGeometry(brandName, wordX, wordY, 112, color);
  return svg({
    title,
    width: 1000,
    height: 520,
    body: `<g transform="translate(421 42) scale(1.22)">
${indent(markGroup(color), 2)}
  </g>
${wordmark.elements}`,
  });
}

function markGroup(color) {
  const top = [58, 32];
  const mid = [80, 91];
  const bottom = [58, 150];
  const r = 18;
  return `<g fill="${color}" stroke="${color}" stroke-linecap="round" stroke-width="7">
    <line x1="${top[0]}" y1="${top[1]}" x2="${mid[0]}" y2="${mid[1]}" />
    <line x1="${mid[0]}" y1="${mid[1]}" x2="${bottom[0]}" y2="${bottom[1]}" />
    <circle cx="${top[0]}" cy="${top[1]}" r="${r}" stroke="none" />
    <circle cx="${mid[0]}" cy="${mid[1]}" r="${r}" stroke="none" />
    <circle cx="${bottom[0]}" cy="${bottom[1]}" r="${r}" stroke="none" />
  </g>`;
}

function textGeometry(text, x, y, size, color) {
  const run = font.layout(text);
  const scale = size / font.unitsPerEm;
  let penX = 0;
  const bounds = {
    x1: Number.POSITIVE_INFINITY,
    y1: Number.POSITIVE_INFINITY,
    x2: Number.NEGATIVE_INFINITY,
    y2: Number.NEGATIVE_INFINITY,
  };

  const elements = run.glyphs
    .map((glyph, index) => {
      const position = run.positions[index];
      const glyphX = penX + position.xOffset;
      const glyphY = position.yOffset;

      if (glyph.bbox) {
        bounds.x1 = Math.min(bounds.x1, x + (glyphX + glyph.bbox.minX) * scale);
        bounds.x2 = Math.max(bounds.x2, x + (glyphX + glyph.bbox.maxX) * scale);
        bounds.y1 = Math.min(bounds.y1, y - (glyphY + glyph.bbox.maxY) * scale);
        bounds.y2 = Math.max(bounds.y2, y - (glyphY + glyph.bbox.minY) * scale);
      }

      penX += position.xAdvance;

      return `  <path fill="${color}" transform="translate(${round(
        x + glyphX * scale,
      )} ${round(y - glyphY * scale)}) scale(${round(scale, 5)} ${round(
        -scale,
        5,
      )})" d="${glyph.path.toSVG()}" />`;
    })
    .join("\n");

  return { elements, bounds };
}

function svg({ title, width, height, body, precision = 0 }) {
  const w = round(width, precision);
  const h = round(height, precision);
  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <title id="title">${escapeXml(title)}</title>
${body}
</svg>
`;
}

async function renderWidth(contents, outPath, width) {
  await sharp(Buffer.from(contents)).resize({ width }).png().toFile(outPath);
}

async function renderSquare(contents, size) {
  return sharp(Buffer.from(contents)).resize(size, size).png().toBuffer();
}

async function renderPreview(inPath, outPath, background) {
  await sharp(inPath).flatten({ background }).png().toFile(outPath);
}

function makeIco(images) {
  const headerSize = 6;
  const entrySize = 16;
  let offset = headerSize + images.length * entrySize;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const entries = images.map(({ size, buffer }) => {
    const entry = Buffer.alloc(entrySize);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += buffer.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map(({ buffer }) => buffer)]);
}

async function resetDir(dir) {
  await fs.rm(dir, { recursive: true, force: true });
}

function indent(value, spaces) {
  return value
    .split("\n")
    .map((line) => " ".repeat(spaces) + line)
    .join("\n");
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function round(value, precision = 2) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}
