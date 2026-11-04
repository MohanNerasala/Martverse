import * as THREE from 'three';
import { Product } from '@/types';

// Texture & Material Caches for 2048px Shelf-Edge Price Rails
const shelfStripTextureCache = new Map<string, THREE.CanvasTexture>();
const shelfStripMaterialCache = new Map<string, THREE.MeshStandardMaterial>();

/**
 * Calculates a clean unit price string based on product price and weight
 * e.g., ₹20 for 52g -> ₹38.46 / 100g
 * e.g., ₹440 for 1kg -> ₹440 / kg
 */
function calculateUnitPrice(price: number, weightStr?: string): string {
  if (!weightStr) return `₹${price} / unit`;
  const clean = weightStr.toLowerCase().trim();

  // Grams
  const gMatch = clean.match(/^([\d.]+)\s*g$/);
  if (gMatch) {
    const grams = parseFloat(gMatch[1]);
    if (grams > 0) {
      const per100g = ((price / grams) * 100).toFixed(1);
      return `₹${per100g} / 100g`;
    }
  }

  // Kilograms
  const kgMatch = clean.match(/^([\d.]+)\s*kg$/);
  if (kgMatch) {
    const kg = parseFloat(kgMatch[1]);
    if (kg > 0) {
      const perKg = (price / kg).toFixed(0);
      return `₹${perKg} / kg`;
    }
  }

  // Milliliters
  const mlMatch = clean.match(/^([\d.]+)\s*ml$/);
  if (mlMatch) {
    const ml = parseFloat(mlMatch[1]);
    if (ml > 0) {
      const per100ml = ((price / ml) * 100).toFixed(1);
      return `₹${per100ml} / 100ml`;
    }
  }

  // Liters
  const lMatch = clean.match(/^([\d.]+)\s*l$/);
  if (lMatch) {
    const l = parseFloat(lMatch[1]);
    if (l > 0) {
      const perL = (price / l).toFixed(0);
      return `₹${perL} / L`;
    }
  }

  return `₹${price} / pack`;
}

/**
 * Generates an ultra-crisp, photorealistic 2048px shelf-edge price rail texture
 * displaying: Product Name, Weight, Price (₹), Unit Price, Strikethrough MRP, and Category Color Bar.
 */
export function get2048ShelfStripTexture(product: Product, categoryColor = '#1d4ed8'): THREE.CanvasTexture {
  const key = `${product.id || product.slug || 'item'}_${product.price}_${categoryColor}`;
  const existing = shelfStripTextureCache.get(key);
  if (existing) return existing;

  if (typeof document === 'undefined') {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }

  // 2048px width x 256px height (8:1 aspect ratio) for ultra-sharp legibility at 2m on 1080p
  const W = 2048;
  const H = 256;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. Pristine Off-White Commercial Shelf Strip Body
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // Subtle brushed metallic gradient overlay
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#f8fafc');
    grad.addColorStop(0.5, '#ffffff');
    grad.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // 2. Top Category Accent Band (24px height)
    ctx.fillStyle = categoryColor;
    ctx.fillRect(0, 0, W, 24);

    // Subtle dark separator at bottom of category bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 22, W, 2);

    // 3. Category Name in subtle small white text inside the accent bar
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const catName = (product.category?.name || 'MARTVERSE HYPERMARKET').toUpperCase();
    ctx.fillText(`★  ${catName}  ★`, 32, 12);

    // 4. Brand Tag Pill (Left)
    const brandStr = (product.brand || 'MARTVERSE').toUpperCase();
    ctx.fillStyle = categoryColor;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(32, 42, 280, 50, 10) : ctx.rect(32, 42, 280, 50);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 28px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(brandStr, 172, 68);

    // 5. Product Name (Large, Bold, High Contrast)
    ctx.fillStyle = '#0f172a'; // Deep slate black
    ctx.font = '900 52px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    const rawName = product.name || 'Commercial Product';
    const nameStr = rawName.length > 34 ? rawName.substring(0, 32) + '...' : rawName;
    ctx.fillText(nameStr, 330, 74);

    // 6. Net Weight / Package Specification
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 36px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`Net Wt: ${product.weight || product.unit || 'Standard Pack'}`, 32, 145);

    // 7. Unit Price Tag (e.g. ₹38.46 / 100g)
    const unitPriceStr = calculateUnitPrice(product.price, product.weight || product.unit);
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 36px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`Unit Price: ${unitPriceStr}`, 32, 205);

    // Vertical Divider Line
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(960, 36);
    ctx.lineTo(960, 240);
    ctx.stroke();

    // 8. D-Mart Special Price Box (Prominent Center-Right)
    // Red promotional header
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(990, 38, 480, 42, 8) : ctx.rect(990, 38, 480, 42);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MARTVERSE SPECIAL PRICE', 1230, 60);

    // Massive Bold Price (₹)
    ctx.fillStyle = '#dc2626';
    ctx.font = '900 86px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`₹${product.price}`, 990, 155);

    // Strikethrough MRP & Savings
    const mrp = product.mrp && product.mrp > product.price ? product.mrp : Math.round(product.price * 1.25);
    const savings = mrp - product.price;

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 34px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`MRP ₹${mrp}`, 990, 210);

    // MRP Strikethrough Line
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(990, 200);
    ctx.lineTo(1160, 200);
    ctx.stroke();

    // Green Savings Pill
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(1185, 178, 280, 46, 8) : ctx.rect(1185, 178, 280, 46);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 26px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`SAVE ₹${savings}`, 1325, 204);

    // Vertical Divider Line
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(1510, 36);
    ctx.lineTo(1510, 240);
    ctx.stroke();

    // 9. Right Section: Authentic FMCG Barcode & Veg Stamp
    // Authentic Barcode lines
    ctx.fillStyle = '#0f172a';
    const barX = 1540;
    const barWidths = [4, 2, 6, 2, 4, 7, 3, 5, 3, 2, 5, 3, 7, 2, 5, 4, 3, 6, 3, 4, 7, 3, 5, 2, 4, 6, 2, 4, 7, 3, 5, 2, 4, 7, 3];
    let curX = barX;
    for (let i = 0; i < barWidths.length; i++) {
      const bw = barWidths[i];
      if (i % 2 === 0) {
        ctx.fillRect(curX, 48, bw, 110);
      }
      curX += bw + 4;
      if (curX > 1850) break;
    }

    // SKU Code
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(product.sku || `MV-${String(product.id).substring(0, 10).toUpperCase()}`, 1695, 182);

    // Green Veg Icon Stamp
    const vegX = 1910;
    const vegY = 60;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(vegX, vegY, 90, 90);
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 6;
    ctx.strokeRect(vegX, vegY, 90, 90);
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(vegX + 45, vegY + 45, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#16a34a';
    ctx.font = '900 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('100% VEG', vegX + 45, vegY + 120);

    // 10. Outer Border Frame
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, W - 3, H - 3);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 16;
  texture.needsUpdate = true;

  shelfStripTextureCache.set(key, texture);
  return texture;
}

/**
 * Returns a cached, self-illuminated MeshStandardMaterial with the 2048px shelf strip texture.
 * Emissive self-illumination (0.35) ensures zero-shadow darkness at all angles and distances.
 */
export function get2048ShelfStripMaterial(product: Product, categoryColor = '#1d4ed8'): THREE.MeshStandardMaterial {
  const key = `${product.id || product.slug || 'item'}_${product.price}_${categoryColor}`;
  const existing = shelfStripMaterialCache.get(key);
  if (existing) return existing;

  const tex = get2048ShelfStripTexture(product, categoryColor);
  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    emissive: new THREE.Color('#ffffff'),
    emissiveMap: tex,
    emissiveIntensity: 0.35, // Simulates retail LED shelf under-glow strip
    roughness: 0.25,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  shelfStripMaterialCache.set(key, mat);
  return mat;
}
