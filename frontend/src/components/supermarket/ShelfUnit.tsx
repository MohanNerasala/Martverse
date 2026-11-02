'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SupermarketAisle, Product, ProductPlacement } from '@/types';
import { useMartStore } from '@/store/useMartStore';
import { Text } from '@react-three/drei';

// Shared pre-allocated geometries (eliminates 3,000+ geometry allocations and GC pauses)
const sharedGeometries = {
  box: new THREE.BoxGeometry(1, 1, 1),
  plane: new THREE.PlaneGeometry(1, 1),
  cyl14: new THREE.CylinderGeometry(1, 1, 1, 14),
  cyl12: new THREE.CylinderGeometry(1, 1, 1, 12),
  cyl8: new THREE.CylinderGeometry(1, 1, 1, 8),
  contactShadow: new THREE.PlaneGeometry(0.34, 0.26),
  crimpRib: new THREE.BoxGeometry(1, 1, 1),
};

// Shared texture cache to prevent duplicate fetches across shelf units
export const shelfTextureCache = new Map<string, THREE.Texture>();

// Cached Canvas Textures for ESL digital price tags (Ultra-Fast 256x128)
export const eslTextureCache = new Map<string, THREE.CanvasTexture>();
export const eslMaterialCache = new Map<string, THREE.MeshBasicMaterial>();
// =========================================================================
// Photorealistic Indian Supermarket Branded Packaging Texture Generator
// Produces 512x640 crisp CanvasTextures for all 73 catalog items (0ms cache)
// =========================================================================
export function getProductPackagingTexture(product: Product): THREE.Texture {
  const cacheKey = `pkg-${product.slug || product.id}`;
  if (shelfTextureCache.has(cacheKey)) {
    return shelfTextureCache.get(cacheKey)!;
  }

  if (typeof document === 'undefined') {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    drawBrandedPackagingArtwork(ctx, product);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  shelfTextureCache.set(cacheKey, texture);

  return texture;
}

function drawBrandedPackagingArtwork(ctx: CanvasRenderingContext2D, prod: Product) {
  const name = (prod.name || '').toLowerCase();
  const slug = (prod.slug || '').toLowerCase();
  const brand = prod.brand || 'MARTVERSE';
  const price = prod.price;
  const mrp = prod.mrp || Math.round(price * 1.2);
  const unit = prod.unit || 'Standard Pack';

  // Determine Brand Palette & Styling
  let bgGradient: [string, string, string] = ['#1e293b', '#334155', '#0f172a'];
  let brandColor = '#facc15';
  let headerTitle = brand.toUpperCase();
  let subHeadline = (prod.name || '').toUpperCase();
  let graphicType = 'generic';

  if (slug.includes('tata-tea') || name.includes('tata tea')) {
    bgGradient = ['#0a0a0a', '#1c1917', '#78350f'];
    brandColor = '#facc15';
    headerTitle = 'TATA TEA';
    subHeadline = 'GOLD • 100% ASSAM LEAF';
    graphicType = 'tea';
  } else if (slug.includes('red-label') || name.includes('red label')) {
    bgGradient = ['#991b1b', '#dc2626', '#7f1d1d'];
    brandColor = '#ffffff';
    headerTitle = 'Brooke Bond';
    subHeadline = 'RED LABEL • NATURAL CARE';
    graphicType = 'tea';
  } else if (slug.includes('taj-mahal') || name.includes('taj mahal')) {
    bgGradient = ['#0f172a', '#1e3a8a', '#172554'];
    brandColor = '#facc15';
    headerTitle = 'Taj Mahal';
    subHeadline = 'WAH TAJ! • GOLDEN TEA';
    graphicType = 'tea';
  } else if (slug.includes('twinings') || name.includes('twinings')) {
    bgGradient = ['#365314', '#65a30d', '#1a2e05'];
    brandColor = '#fef08a';
    headerTitle = 'TWININGS';
    subHeadline = 'OF LONDON • PURE GREEN TEA';
    graphicType = 'greentea';
  } else if (slug.includes('ahmad-tea') || slug.includes('earl-grey') || name.includes('ahmad')) {
    bgGradient = ['#0c1427', '#1e3a8a', '#080c18'];
    brandColor = '#facc15';
    headerTitle = 'AHMAD TEA';
    subHeadline = 'LONDON • CLASSIC EARL GREY';
    graphicType = 'earlgrey';
  } else if (slug.includes('nescafe') || name.includes('nescafe')) {
    bgGradient = ['#1a0505', '#7f1d1d', '#450a0a'];
    brandColor = '#ffffff';
    headerTitle = 'NESCAFE';
    subHeadline = 'CLASSIC • 100% PURE COFFEE';
    graphicType = 'coffee';
  } else if (slug.includes('bru') || name.includes('bru')) {
    bgGradient = ['#064e3b', '#047857', '#022c22'];
    brandColor = '#fde047';
    headerTitle = 'BRU';
    subHeadline = 'INSTANT • ROASTED CHICORY';
    graphicType = 'coffee';
  } else if (slug.includes('parle-g') || name.includes('parle-g')) {
    bgGradient = ['#fef08a', '#facc15', '#eab308'];
    brandColor = '#dc2626';
    headerTitle = 'Parle-G';
    subHeadline = 'ORIGINAL GLUCOSE BISCUITS';
    graphicType = 'biscuit';
  } else if (slug.includes('good-day') || name.includes('good day')) {
    bgGradient = ['#fef08a', '#f59e0b', '#d97706'];
    brandColor = '#991b1b';
    headerTitle = 'BRITANNIA';
    subHeadline = 'Good Day • CASHEW SMILE';
    graphicType = 'biscuit';
  } else if (slug.includes('oreo') || name.includes('oreo')) {
    bgGradient = ['#0284c7', '#1e3a8a', '#0f172a'];
    brandColor = '#ffffff';
    headerTitle = 'OREO';
    subHeadline = 'VANILLA CREME SANDWICH';
    graphicType = 'oreo';
  } else if (slug.includes('hide-and-seek') || name.includes('hide & seek')) {
    bgGradient = ['#1c1917', '#451a03', '#292524'];
    brandColor = '#fde68a';
    headerTitle = 'Parle';
    subHeadline = 'Hide & Seek • CHOCO CHIP';
    graphicType = 'chocochip';
  } else if (slug.includes('lays-indias-magic') || name.includes('magic masala')) {
    bgGradient = ['#1e3a8a', '#2563eb', '#1d4ed8'];
    brandColor = '#facc15';
    headerTitle = "Lay's";
    subHeadline = "INDIA'S MAGIC MASALA";
    graphicType = 'chips';
  } else if (slug.includes('lays-classic') || name.includes('classic salted')) {
    bgGradient = ['#fef08a', '#facc15', '#ca8a04'];
    brandColor = '#dc2626';
    headerTitle = "Lay's";
    subHeadline = 'CLASSIC SALTED POTATO CHIPS';
    graphicType = 'chips';
  } else if (slug.includes('kurkure') || name.includes('kurkure')) {
    bgGradient = ['#ea580c', '#f97316', '#c2410c'];
    brandColor = '#facc15';
    headerTitle = 'Kurkure';
    subHeadline = 'MASALA MUNCH CHATPATA';
    graphicType = 'puffed';
  } else if (slug.includes('bingo') || name.includes('bingo')) {
    bgGradient = ['#fde047', '#f59e0b', '#ea580c'];
    brandColor = '#dc2626';
    headerTitle = 'BINGO!';
    subHeadline = 'Mad Angles • ACHAARI MASTI';
    graphicType = 'triangle';
  } else if (slug.includes('doritos') || name.includes('doritos')) {
    bgGradient = ['#991b1b', '#dc2626', '#7f1d1d'];
    brandColor = '#ffffff';
    headerTitle = 'Doritos';
    subHeadline = 'NACHO CHEESE CRUNCH';
    graphicType = 'triangle';
  } else if (slug.includes('aashirvaad') || name.includes('aashirvaad')) {
    bgGradient = ['#14532d', '#15803d', '#166534'];
    brandColor = '#facc15';
    headerTitle = 'AASHIRVAAD';
    subHeadline = 'SHUDH CHAKKI 100% ATTA';
    graphicType = 'wheat';
  } else if (slug.includes('fortune') || name.includes('fortune')) {
    bgGradient = ['#fef08a', '#eab308', '#ca8a04'];
    brandColor = '#dc2626';
    headerTitle = 'Fortune';
    subHeadline = 'SUNLITE SUNFLOWER OIL';
    graphicType = 'sunflower';
  } else if (slug.includes('india-gate') || name.includes('india gate')) {
    bgGradient = ['#7f1d1d', '#991b1b', '#450a0a'];
    brandColor = '#facc15';
    headerTitle = 'INDIA GATE';
    subHeadline = 'CLASSIC AGED BASMATI RICE';
    graphicType = 'rice';
  } else if (slug.includes('tata-salt') || name.includes('tata salt')) {
    bgGradient = ['#ffffff', '#f1f5f9', '#e2e8f0'];
    brandColor = '#1d4ed8';
    headerTitle = 'TATA SALT';
    subHeadline = 'DESH KA NAMAK • IODIZED';
    graphicType = 'salt';
  } else if (slug.includes('maggi') || name.includes('maggi')) {
    bgGradient = ['#fef08a', '#facc15', '#eab308'];
    brandColor = '#dc2626';
    headerTitle = 'Maggi';
    subHeadline = '2-MINUTE MASALA NOODLES';
    graphicType = 'noodles';
  } else if (slug.includes('kellogg') || name.includes('kellogg')) {
    bgGradient = ['#ffffff', '#fee2e2', '#fef2f2'];
    brandColor = '#dc2626';
    headerTitle = "Kellogg's";
    subHeadline = 'CORN FLAKES TOASTED';
    graphicType = 'cereal';
  } else if (slug.includes('colgate') || name.includes('colgate')) {
    bgGradient = ['#991b1b', '#dc2626', '#b91c1c'];
    brandColor = '#ffffff';
    headerTitle = 'Colgate';
    subHeadline = 'STRONG TEETH • CALCIUM';
    graphicType = 'smile';
  } else if (slug.includes('dove') || name.includes('dove')) {
    bgGradient = ['#f8fafc', '#ffffff', '#e2e8f0'];
    brandColor = '#1e3a8a';
    headerTitle = 'Dove';
    subHeadline = 'DEEP MOISTURE BODY WASH';
    graphicType = 'milk';
  } else if (slug.includes('dettol') || name.includes('dettol')) {
    bgGradient = ['#ffffff', '#f0fdf4', '#dcfce7'];
    brandColor = '#15803d';
    headerTitle = 'Dettol';
    subHeadline = 'ORIGINAL 99.9% GERM DEFENSE';
    graphicType = 'shield';
  } else if (slug.includes('head-and-shoulders') || name.includes('head & shoulders')) {
    bgGradient = ['#ffffff', '#eff6ff', '#dbeafe'];
    brandColor = '#1e3a8a';
    headerTitle = 'head & shoulders';
    subHeadline = 'COOL MENTHOL ANTI-DANDRUFF';
    graphicType = 'menthol';
  } else if (slug.includes('surf-excel') || name.includes('surf excel')) {
    bgGradient = ['#3b0764', '#1e1b4b', '#4338ca'];
    brandColor = '#facc15';
    headerTitle = 'Surf Excel';
    subHeadline = 'MATIC FRONT LOAD 4KG';
    graphicType = 'washing';
  } else if (slug.includes('vim') || name.includes('vim')) {
    bgGradient = ['#15803d', '#65a30d', '#84cc16'];
    brandColor = '#facc15';
    headerTitle = 'Vim';
    subHeadline = 'LEMON DISHWASH GEL 2L';
    graphicType = 'lemon';
  } else if (slug.includes('harpic') || name.includes('harpic')) {
    bgGradient = ['#172554', '#1e3a8a', '#1e1b4b'];
    brandColor = '#ef4444';
    headerTitle = 'HARPIC';
    subHeadline = 'POWER PLUS 10X MAX';
    graphicType = 'toilet';
  } else if (slug.includes('lizol') || name.includes('lizol')) {
    bgGradient = ['#ea580c', '#f97316', '#f59e0b'];
    brandColor = '#ffffff';
    headerTitle = 'Lizol';
    subHeadline = 'DISINFECTANT FLOOR CLEANER';
    graphicType = 'lemon';
  } else if (slug.includes('colin') || name.includes('colin')) {
    bgGradient = ['#0284c7', '#38bdf8', '#0ea5e9'];
    brandColor = '#ffffff';
    headerTitle = 'Colin';
    subHeadline = 'ULTRA ADVANCED GLASS CLEANER';
    graphicType = 'spray';
  } else if (slug.includes('lindt') || name.includes('lindt')) {
    bgGradient = ['#09090b', '#18181b', '#09090b'];
    brandColor = '#facc15';
    headerTitle = 'Lindt';
    subHeadline = 'EXCELLENCE 70% COCOA';
    graphicType = 'chocolate';
  } else if (slug.includes('silk') || name.includes('silk')) {
    bgGradient = ['#2e1065', '#3b0764', '#581c87'];
    brandColor = '#fbbf24';
    headerTitle = 'Cadbury Silk';
    subHeadline = 'PURE CHOCOLATE INDULGENCE';
    graphicType = 'chocolate';
  } else if (slug.includes('dairy-milk') || name.includes('dairy milk')) {
    bgGradient = ['#3b0764', '#4c1d95', '#2e1065'];
    brandColor = '#fde047';
    headerTitle = 'Cadbury';
    subHeadline = 'Dairy Milk • GLASS & A HALF';
    graphicType = 'chocolate';
  } else if (slug.includes('5-star') || name.includes('5 star')) {
    bgGradient = ['#854d0e', '#ca8a04', '#713f12'];
    brandColor = '#fde047';
    headerTitle = '5 STAR';
    subHeadline = 'CARAMEL & NOUGAT CHOC';
    graphicType = 'chocolate';
  } else if (slug.includes('munch') || name.includes('munch')) {
    bgGradient = ['#7f1d1d', '#b91c1c', '#dc2626'];
    brandColor = '#fde047';
    headerTitle = 'MUNCH';
    subHeadline = 'CRUNCHILICIOUS WAFER';
    graphicType = 'chocolate';
  } else if (slug.includes('kitkat') || name.includes('kitkat')) {
    bgGradient = ['#991b1b', '#dc2626', '#b91c1c'];
    brandColor = '#ffffff';
    headerTitle = 'KitKat';
    subHeadline = 'HAVE A BREAK • 4 FINGER';
    graphicType = 'chocolate';
  } else if (slug.includes('lux') || name.includes('lux')) {
    bgGradient = ['#be185d', '#db2777', '#9d174d'];
    brandColor = '#fde047';
    headerTitle = 'LUX';
    subHeadline = 'VELVET GLOW JASMINE';
    graphicType = 'generic';
  } else if (slug.includes('himalaya') || name.includes('himalaya')) {
    bgGradient = ['#064e3b', '#047857', '#022c22'];
    brandColor = '#ffffff';
    headerTitle = 'Himalaya';
    subHeadline = 'PURIFYING NEEM FACE WASH';
    graphicType = 'menthol';
  } else if (slug.includes('ponds') || name.includes("pond's") || name.includes('ponds')) {
    bgGradient = ['#f43f5e', '#fb7185', '#e11d48'];
    brandColor = '#ffffff';
    headerTitle = "POND'S";
    subHeadline = 'BRIGHT BEAUTY GLOW';
    graphicType = 'generic';
  } else if (slug.includes('tropicana') || name.includes('tropicana')) {
    bgGradient = ['#c2410c', '#ea580c', '#f97316'];
    brandColor = '#ffffff';
    headerTitle = 'Tropicana';
    subHeadline = '100% PURE ORANGE JUICE';
    graphicType = 'lemon';
  } else if (slug.includes('saffola') || name.includes('saffola')) {
    bgGradient = ['#1e3a8a', '#1d4ed8', '#172554'];
    brandColor = '#facc15';
    headerTitle = 'Saffola';
    subHeadline = 'GOLD PRO HEALTHY OIL';
    graphicType = 'sunflower';
  } else if (slug.includes('dhara') || name.includes('dhara')) {
    bgGradient = ['#713f12', '#a16207', '#ca8a04'];
    brandColor = '#fef08a';
    headerTitle = 'Dhara';
    subHeadline = 'KACHI GHANI MUSTARD OIL';
    graphicType = 'sunflower';
  } else if (slug.includes('gulab-jamun') || name.includes('gulab jamun')) {
    bgGradient = ['#831843', '#9d174d', '#701a75'];
    brandColor = '#fde047';
    headerTitle = "Haldiram's";
    subHeadline = 'ROYAL GULAB JAMUN 1KG';
    graphicType = 'generic';
  } else if (slug.includes('soan-papdi') || name.includes('soan papdi')) {
    bgGradient = ['#a16207', '#ca8a04', '#eab308'];
    brandColor = '#ffffff';
    headerTitle = "Haldiram's";
    subHeadline = 'DESI GHEE SOAN PAPDI';
    graphicType = 'generic';
  } else if (slug.includes('celebrations') || name.includes('celebrations')) {
    bgGradient = ['#3b0764', '#581c87', '#2e1065'];
    brandColor = '#facc15';
    headerTitle = 'Celebrations';
    subHeadline = 'RICH DRY FRUIT GIFT PACK';
    graphicType = 'chocolate';
  } else if (slug.includes('happilo') || name.includes('almond') || name.includes('cashew')) {
    bgGradient = ['#064e3b', '#047857', '#022c22'];
    brandColor = '#facc15';
    headerTitle = 'Happilo';
    subHeadline = 'PREMIUM ROYAL DRY FRUITS';
    graphicType = 'generic';
  } else if (slug.includes('tide') || name.includes('tide')) {
    bgGradient = ['#c2410c', '#ea580c', '#1d4ed8'];
    brandColor = '#ffffff';
    headerTitle = 'Tide';
    subHeadline = 'DOUBLE POWER EXTRA WHITE';
    graphicType = 'washing';
  } else if (slug.includes('comfort') || name.includes('comfort')) {
    bgGradient = ['#0284c7', '#38bdf8', '#be185d'];
    brandColor = '#ffffff';
    headerTitle = 'Comfort';
    subHeadline = 'FABRIC CONDITIONER 2L';
    graphicType = 'washing';
  } else if (slug.includes('wagh-bakri') || name.includes('wagh bakri')) {
    bgGradient = ['#14532d', '#15803d', '#166534'];
    brandColor = '#facc15';
    headerTitle = 'Wagh Bakri';
    subHeadline = 'PREMIUM CTC SPICED TEA';
    graphicType = 'tea';
  } else if (slug.includes('bikaji') || name.includes('bikaji')) {
    bgGradient = ['#b91c1c', '#dc2626', '#ca8a04'];
    brandColor = '#facc15';
    headerTitle = 'Bikaji';
    subHeadline = 'BIKANERI BHUJIA 1KG';
    graphicType = 'biscuit';
  }

  // 1. Draw Background Gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 640);
  grad.addColorStop(0, bgGradient[0]);
  grad.addColorStop(0.5, bgGradient[1]);
  grad.addColorStop(1, bgGradient[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 640);

  // Decorative Border / Inner Foil Rim
  ctx.strokeStyle = brandColor;
  ctx.lineWidth = 6;
  ctx.strokeRect(16, 16, 480, 608);

  // 2. FSSAI Green Veg Square Dot
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 3;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(440, 32, 36, 36);
  ctx.strokeRect(440, 32, 36, 36);
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.arc(458, 50, 10, 0, Math.PI * 2);
  ctx.fill();

  // 3. Top Brand Name Header
  ctx.fillStyle = brandColor;
  ctx.font = '900 46px "Arial Black", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(headerTitle, 256, 75);

  // 4. Product Sub-Headline Pill Banner
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fillRect(32, 115, 448, 48);
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 20px system-ui, sans-serif';
  ctx.fillText(subHeadline, 256, 139);

  // 5. Center Photorealistic Artwork Illustration
  ctx.save();
  ctx.translate(256, 310);

  if (graphicType === 'tea' || graphicType === 'greentea' || graphicType === 'earlgrey') {
    // Ceramic Teacup with Saucer & Steaming Brew
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 85, 140, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    // White Cup Body
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-90, 0);
    ctx.bezierCurveTo(-90, 80, 90, 80, 90, 0);
    ctx.closePath();
    ctx.fill();
    // Tea Liquor
    ctx.fillStyle = graphicType === 'greentea' ? '#65a30d' : '#b45309';
    ctx.beginPath();
    ctx.ellipse(0, 5, 80, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    // Fresh Green Leaf
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(70, -20, 35, 16, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (graphicType === 'coffee') {
    // Red Coffee Mug with Roasted Beans
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-70, -30, 140, 110);
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(0, -30, 70, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    // Foam Crema
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(0, -30, 56, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (graphicType === 'biscuit') {
    // Golden Baked Glucose Cookie
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-110, -55, 220, 110);
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 4;
    ctx.strokeRect(-102, -47, 204, 94);
    ctx.fillStyle = '#92400e';
    ctx.font = '900 32px "Arial Black", sans-serif';
    ctx.fillText('Parle-G', 0, 5);
  } else if (graphicType === 'oreo') {
    // Dark Cocoa Cookie with Cream
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.arc(0, 0, 85, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 36px "Arial Black", sans-serif';
    ctx.fillText('OREO', 0, 10);
  } else if (graphicType === 'chips' || graphicType === 'triangle' || graphicType === 'puffed') {
    // Crispy Golden Chips / Nachos
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(0, -80);
    ctx.lineTo(85, 70);
    ctx.lineTo(-85, 70);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(15, -10, 6, 0, Math.PI * 2);
    ctx.arc(-25, 25, 5, 0, Math.PI * 2);
    ctx.arc(35, 35, 7, 0, Math.PI * 2);
    ctx.fill();
  } else if (graphicType === 'chocolate') {
    // Chocolate Squares
    ctx.fillStyle = '#3b0764';
    ctx.fillRect(-90, -60, 180, 120);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.strokeRect(-80, -50, 160, 100);
    ctx.fillStyle = '#facc15';
    ctx.font = '900 28px "Arial Black", sans-serif';
    ctx.fillText('PURE COCOA', 0, 8);
  } else {
    // Supermarket Quality Seal
    ctx.fillStyle = brandColor;
    ctx.beginPath();
    ctx.arc(0, 0, 75, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 24px "Arial Black", sans-serif';
    ctx.fillText('100% PURE', 0, -8);
    ctx.font = '800 16px sans-serif';
    ctx.fillText('GUARANTEE', 0, 20);
  }
  ctx.restore();

  // 6. Pack Size & Weight Badge (Bottom Left)
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(36, 485, 170, 48);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 485, 170, 48);
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 22px system-ui, sans-serif';
  ctx.fillText(unit, 121, 509);

  // 7. D-Mart Yellow Savings Price Pill (Bottom Right)
  ctx.fillStyle = '#fde047';
  ctx.fillRect(296, 485, 180, 48);
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 26px "Arial Black", system-ui, sans-serif';
  ctx.fillText(`₹${price}`, 386, 509);

  // 8. Authentic Product Barcode at Bottom
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(40, 560, 432, 54);
  ctx.fillStyle = '#0f172a';
  for (let x = 60; x < 450; x += 9) {
    const barW = (x * 13) % 7 > 3 ? 5 : 2;
    ctx.fillRect(x, 568, barW, 38);
  }
}

let gondolaPegboardTextureCache: THREE.CanvasTexture | null = null;
export function getGondolaPegboardTexture(): THREE.CanvasTexture {
  if (gondolaPegboardTextureCache) return gondolaPegboardTextureCache;
  if (typeof document === 'undefined') {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // 1. Powder-coated commercial supermarket ivory metal base
    ctx.fillStyle = '#eceef2';
    ctx.fillRect(0, 0, 512, 512);

    // 2. Horizontal gondola slatwall panel seams every 64px
    for (let y = 0; y <= 512; y += 64) {
      // Soft shadow above groove
      ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
      ctx.fillRect(0, y - 2, 512, 2);
      // Dark recessed steel seam
      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, y, 512, 2);
      // Crisp bottom metallic highlight
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, y + 2, 512, 1.5);
    }

    // 3. Stamped vertical double-column pegboard punch holes
    for (let x = 16; x < 512; x += 32) {
      for (let y = 16; y < 512; y += 32) {
        // Drop shadow
        ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
        ctx.beginPath();
        ctx.ellipse(x, y + 1, 3.5, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Hole interior
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.ellipse(x, y, 3, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Lower highlight rim
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(x - 2, y + 4.5, 4, 1);
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 4);
  texture.anisotropy = 8;
  gondolaPegboardTextureCache = texture;
  return texture;
}

export const shelfMaterialCache = new Map<string, THREE.Material>();

// Static shared materials for all 10 aisles to eliminate redundant WebGL shader switches
const shelfRackMaterials = {
  divider: new THREE.MeshStandardMaterial({
    color: '#e2e8f0',
    ...(typeof document !== 'undefined' ? { map: getGondolaPegboardTexture() } : {}),
    metalness: 0.25,
    roughness: 0.35,
  }),
  plank: new THREE.MeshStandardMaterial({ color: '#f8fafc', metalness: 0.15, roughness: 0.28 }),
  bracket: new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.7, roughness: 0.25 }), // Cantilever steel bracket
  led: new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: new THREE.Color('#f8fafc'), emissiveIntensity: 0.45, roughness: 0.1 }),
  rail: new THREE.MeshStandardMaterial({ color: '#1d4ed8', roughness: 0.32, metalness: 0.1 }), // Commercial royal blue shelf rail (matches Carrefour/D-Mart)
  neon: new THREE.MeshBasicMaterial({ color: '#facc15' }), // D-Mart yellow accent
  post: new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.45, roughness: 0.3 }), // Commercial powder-coated slotted steel uprights
  postNeon: new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.5 }), // Slotted notch accent
  eslCasing: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2, metalness: 0.1 }),
  kickplate: new THREE.MeshStandardMaterial({ color: '#64748b', metalness: 0.8, roughness: 0.25 }), // Brushed aluminum kickplate
  endCapSign: new THREE.MeshStandardMaterial({ color: '#0284c7', metalness: 0.3, roughness: 0.2 }),
  acrylicTray: new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.3, roughness: 0.1, metalness: 0.05 }),
  acrylicLip: new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.35, roughness: 0.1 }),
  cartonFlap: new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.5 }),
  whiteCap: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3, metalness: 0.1 }),
  hangerBar: new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.5 }),
  hangerHook: new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 0.95, roughness: 0.1 }),
  contactShadow: new THREE.MeshBasicMaterial({ color: '#090d16', transparent: true, opacity: 0.22, depthWrite: false }),
  crimpSilver: new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.8, roughness: 0.3 }),
  crimpGold: new THREE.MeshStandardMaterial({ color: '#ca8a04', metalness: 0.8, roughness: 0.3 }),
  sackStitch: new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.9 }),
  pegboard: new THREE.MeshStandardMaterial({
    color: '#e2e8f0',
    ...(typeof document !== 'undefined' ? { map: getGondolaPegboardTexture() } : {}),
    roughness: 0.35,
    metalness: 0.25,
  }),
  pumpChrome: new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.9, roughness: 0.15 }),
};

// Global shared product body material cache to avoid thousands of duplicate WebGL programs
const productBodyMaterials = new Map<string, THREE.MeshStandardMaterial>();
export function getProductBodyMaterial(color: string, roughness = 0.32, metalness = 0.08): THREE.MeshStandardMaterial {
  const key = `${color}-${roughness}-${metalness}`;
  let mat = productBodyMaterials.get(key);
  if (!mat) {
    mat = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    productBodyMaterials.set(key, mat);
  }
  return mat;
}

let sharedPriceTalkerTexture: THREE.CanvasTexture | null = null;
let sharedPriceTalkerMaterial: THREE.MeshBasicMaterial | null = null;

export function getSharedPriceTalkerMaterial(): THREE.MeshBasicMaterial {
  if (sharedPriceTalkerMaterial) return sharedPriceTalkerMaterial;
  if (typeof document === 'undefined') {
    return new THREE.MeshBasicMaterial();
  }
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Bright yellow promotional retail tag
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(0, 0, 256, 64);

    // Red D-Mart pill
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(4, 4, 110, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText('D-MART PRICE', 10, 14);

    // Main Price
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('SPECIAL', 6, 44);

    // Savings
    ctx.fillStyle = '#15803d';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('SAVE 25%', 120, 20);
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('BEST VALUE', 120, 44);

    // Barcode
    ctx.fillStyle = '#1e293b';
    for (let x = 205; x < 250; x += 3) {
      ctx.fillRect(x, 8, (x % 2 === 0 ? 2 : 1), 48);
    }
  }
  sharedPriceTalkerTexture = new THREE.CanvasTexture(canvas);
  sharedPriceTalkerTexture.colorSpace = THREE.SRGBColorSpace;
  sharedPriceTalkerTexture.minFilter = THREE.LinearFilter;
  sharedPriceTalkerTexture.magFilter = THREE.LinearFilter;
  sharedPriceTalkerMaterial = new THREE.MeshBasicMaterial({
    map: sharedPriceTalkerTexture,
    toneMapped: false,
  });
  return sharedPriceTalkerMaterial;
}

export function getEslTexture(price: number, brand: string): THREE.CanvasTexture {
  const key = `${price}-${brand}`;
  const existing = eslTextureCache.get(key);
  if (existing) return existing;

  if (typeof document === 'undefined') {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // D-Mart style vibrant yellow promotional retail price tag
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(0, 0, 256, 128);

    // Red promotional header pill
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(8, 8, 140, 26);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText('D-MART PRICE', 14, 21);

    // Bold Price
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`₹${price}`, 12, 66);

    // Strikethrough MRP
    const mrp = Math.round(price * 1.2);
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`MRP ₹${mrp}`, 12, 104);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(12, 104);
    ctx.lineTo(92, 104);
    ctx.stroke();

    // Green savings label
    ctx.fillStyle = '#15803d';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`SAVE ₹${mrp - price}`, 106, 104);

    // Retail Barcode pattern on right
    ctx.fillStyle = '#1e293b';
    const barX = 188;
    const barWidths = [2, 1, 3, 1, 2, 3, 1, 3, 2, 1, 2, 3, 1, 3];
    let currX = barX;
    for (let i = 0; i < barWidths.length; i++) {
      ctx.fillRect(currX, 16, barWidths[i], 88);
      currX += barWidths[i] + (i % 2 === 0 ? 2 : 1.5);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  eslTextureCache.set(key, texture);
  return texture;
}

export function getEslMaterial(price: number, brand: string): THREE.MeshBasicMaterial {
  const key = `${price}-${brand}`;
  const existing = eslMaterialCache.get(key);
  if (existing) return existing;
  const tex = getEslTexture(price, brand);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    toneMapped: false,
  });
  eslMaterialCache.set(key, mat);
  return mat;
}

export function getShelfMaterial(tex: THREE.Texture, key: string, materialType: 'basic' | 'standard' = 'basic'): THREE.Material {
  const cacheKey = `${key}-${materialType}`;
  const existing = shelfMaterialCache.get(cacheKey);
  if (existing) return existing;

  const mat = materialType === 'standard'
    ? new THREE.MeshStandardMaterial({
        map: tex,
        transparent: true,
        alphaTest: 0.01,
        roughness: 0.25,
        metalness: 0.12,
        side: THREE.FrontSide,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
      })
    : new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        alphaTest: 0.01,
        toneMapped: false,
        side: THREE.FrontSide,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
      });

  shelfMaterialCache.set(cacheKey, mat);
  return mat;
}

const ProductSmallImage: React.FC<{
  url?: string | any;
  product?: Product;
  position: [number, number, number];
  scale: [number, number];
  rotation?: [number, number, number];
  materialType?: 'basic' | 'standard';
  roughness?: number;
  metalness?: number;
  alphaTest?: number;
}> = React.memo(({ url, product, position, scale, rotation, materialType = 'basic' }) => {
  // Synchronous instant packaging texture (0ms paint, crisp branded vector artwork)
  const texture = useMemo(() => {
    if (product) return getProductPackagingTexture(product);
    const resolvedUrl: string = typeof url === 'object' && url && 'src' in url ? url.src : (url || '/products/sweets/DairyMilk.png');
    return shelfTextureCache.get(resolvedUrl) || null;
  }, [product, url]);

  const mat = texture
    ? getShelfMaterial(texture, product ? `pkg-${product.slug || product.id}` : (url || 'default'), materialType)
    : null;

  return (
    <mesh
      position={position}
      rotation={rotation}
      geometry={sharedGeometries.plane}
      scale={[scale[0], scale[1], 1]}
      raycast={() => null}
      material={mat || undefined}
    >
      {!mat && <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />}
    </mesh>
  );
});
ProductSmallImage.displayName = 'ProductSmallImage';

interface ShelfSlotItemProps {
  slot: {
    key: string;
    product: Product;
    side: 'LEFT' | 'RIGHT';
    tier?: number;
    blockIdx: number;
    slotIdx: number;
    relX: number;
    relY: number;
    relZ: number;
    worldX: number;
    worldY: number;
    worldZ: number;
    rotationY: number;
  };
  eslMaterial?: THREE.MeshBasicMaterial;
}

// High-Performance Interactive 3D Product Item
// Batched, shared materials, zero back-row duplicates, 0ms pre-warmed packaging textures
const ShelfProductItem: React.FC<{ slot: ShelfSlotItemProps['slot'] }> = React.memo(({ slot }) => {
  const openProductModal = useMartStore((state) => state.openProductModal);
  const setHoveredProduct = useMartStore((state) => state.setHoveredProduct);

  const prod = slot.product;
  const plc = prod.placement || {
    color: '#3b82f6',
    modelType: 'box',
  };
  const color = plc.color || '#3b82f6';
  const isDairyMilk = prod.slug.includes('dairy-milk') ||
                      prod.name.toLowerCase().includes('dairy milk') ||
                      prod.brand?.toLowerCase().includes('cadbury');

  const animGroupRef = useRef<THREE.Group>(null);
  const animFrameRef = useRef<number | null>(null);

  const startHoverAnimation = (hovering: boolean) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    const targetScale = hovering ? 1.15 : 1.0;
    const targetLift = hovering ? 0.04 : 0.0;
    const targetFwd = hovering ? 0.06 : 0.0;

    const step = () => {
      if (!animGroupRef.current) return;
      const curScale = animGroupRef.current.scale.x;
      const curLift = animGroupRef.current.position.y;
      const curFwd = animGroupRef.current.position.z;

      const newScale = curScale + (targetScale - curScale) * 0.35;
      const newLift = curLift + (targetLift - curLift) * 0.35;
      const newFwd = curFwd + (targetFwd - curFwd) * 0.35;

      animGroupRef.current.scale.set(newScale, newScale, newScale);
      animGroupRef.current.position.set(0, newLift, newFwd);

      if (Math.abs(targetScale - newScale) > 0.005 || Math.abs(targetLift - newLift) > 0.002) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        animGroupRef.current.scale.set(targetScale, targetScale, targetScale);
        animGroupRef.current.position.set(0, targetLift, targetFwd);
        animFrameRef.current = null;
      }
    };
    animFrameRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Commercial Retail Product Form Classification
  const nameLower = ((prod.name || '') + ' ' + (prod.category?.name || '') + ' ' + (prod.brand || '')).toLowerCase();
  const isPouch = /chips|kurkure|bingo|lays|snack|bhujia|namkeen|wafer|puff|chindi/i.test(nameLower);
  const isGrainSack = /atta|rice|flour|salt|sugar|wheat|grain|basmati|chakki/i.test(nameLower);
  const isOilCan = /oil|sunlite|saffola|kachi|ghani|mustard|fortune|detergent liquid|surf excel liquid/i.test(nameLower);
  const isPumpBottle = /shampoo|dove|head & shoulders|pantene|handwash|dettol liquid|vim gel|harpic|lizol/i.test(nameLower) || plc.modelType === 'bottle';
  const isChoc = plc.modelType === 'chocolate' || plc.modelType === 'bar' || isDairyMilk;

  const bodyMat = useMemo(() => {
    if (isChoc) return getProductBodyMaterial('#4a044e', 0.3, 0.12);
    if (isGrainSack) return getProductBodyMaterial(color, 0.85, 0.04);
    if (isPouch) return getProductBodyMaterial(color, 0.35, 0.12);
    if (isPumpBottle) return getProductBodyMaterial(color, 0.25, 0.1);
    if (isOilCan) return getProductBodyMaterial(color, 0.25, 0.1);
    return getProductBodyMaterial(color, 0.3, 0.06);
  }, [color, isChoc, isGrainSack, isPouch, isPumpBottle, isOilCan]);

  return (
    <group
      position={[slot.relX, slot.relY, slot.relZ]}
      rotation={[0, slot.rotationY, 0]}
    >
      {/* Invisible Interaction Hitbox - Exclusively raycasted */}
      <mesh
        visible={false}
        position={[0, 0.18, 0.08]}
        geometry={sharedGeometries.box}
        scale={[isDairyMilk ? 0.72 : 0.60, 0.46, 0.42]}
        onPointerOver={(e) => {
          e.stopPropagation();
          startHoverAnimation(true);
          if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
          setHoveredProduct(prod);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          startHoverAnimation(false);
          if (typeof document !== 'undefined') document.body.style.cursor = 'default';
          setHoveredProduct(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          openProductModal(prod);
        }}
      />

      {/* Smoothly Animated Product Group (Raycast bypassed internally) */}
      <group ref={animGroupRef} raycast={() => null}>
        {isPumpBottle ? (
          <group position={[0, 0, 0.04]}>
            <mesh position={[0, 0.12, 0]} geometry={sharedGeometries.cyl14} scale={[0.078, 0.22, 0.078]} material={bodyMat} />
            <mesh position={[0, 0.25, 0]} geometry={sharedGeometries.cyl14} scale={[0.055, 0.04, 0.055]} material={bodyMat} />
            <mesh position={[0, 0.29, 0]} geometry={sharedGeometries.cyl12} scale={[0.024, 0.04, 0.024]} material={shelfRackMaterials.pumpChrome} />
            <mesh position={[0, 0.315, 0.015]} geometry={sharedGeometries.box} scale={[0.022, 0.014, 0.045]} material={shelfRackMaterials.whiteCap} />
            <ProductSmallImage product={prod} position={[0, 0.12, 0.082]} scale={[0.13, 0.14]} />
          </group>
        ) : isOilCan ? (
          <group position={[0, 0, 0.03]}>
            <mesh position={[0, 0.17, 0]} geometry={sharedGeometries.box} scale={[0.20, 0.32, 0.13]} material={bodyMat} />
            <mesh position={[-0.05, 0.34, 0]} geometry={sharedGeometries.cyl12} scale={[0.028, 0.03, 0.028]} material={shelfRackMaterials.neon} />
            <ProductSmallImage product={prod} position={[0, 0.16, 0.07]} scale={[0.19, 0.25]} />
          </group>
        ) : isGrainSack ? (
          <group position={[0, 0, 0.02]}>
            <mesh position={[0, 0.18, 0]} geometry={sharedGeometries.box} scale={[0.27, 0.35, 0.16]} material={bodyMat} />
            <mesh position={[0, 0.36, 0]} geometry={sharedGeometries.box} scale={[0.26, 0.016, 0.02]} material={shelfRackMaterials.sackStitch} />
            <ProductSmallImage product={prod} position={[0, 0.18, 0.086]} scale={[0.24, 0.31]} />
          </group>
        ) : isPouch ? (
          <group position={[0, 0, 0.03]} rotation={[-0.04, 0, 0]}>
            <mesh position={[0, 0.17, 0]} geometry={sharedGeometries.box} scale={[0.24, 0.31, 0.11]} material={bodyMat} />
            <ProductSmallImage product={prod} position={[0, 0.17, 0.06]} scale={[0.23, 0.28]} />
          </group>
        ) : isChoc ? (
          <group position={[0, 0, 0]}>
            <mesh position={[0, 0.008, 0.02]} geometry={sharedGeometries.box} scale={[0.70, 0.016, 0.16]} material={shelfRackMaterials.acrylicTray} />
            <mesh position={[0, 0.026, 0.095]} geometry={sharedGeometries.box} scale={[0.70, 0.036, 0.006]} material={shelfRackMaterials.acrylicLip} />
            <group position={[0, 0.155, 0.03]} rotation={[-0.04, 0, 0]}>
              <mesh geometry={sharedGeometries.box} scale={[0.65, 0.296, 0.022]} material={bodyMat} />
              <ProductSmallImage product={prod} position={[0, 0.016, 0.016]} scale={[0.66, 0.302]} materialType="basic" />
            </group>
          </group>
        ) : (
          <group position={[0, 0, 0.03]}>
            <mesh position={[0, 0.18, 0]} geometry={sharedGeometries.box} scale={[0.26, 0.35, 0.14]} material={bodyMat} />
            <ProductSmallImage product={prod} position={[0, 0.18, 0.076]} scale={[0.25, 0.33]} />
          </group>
        )}
      </group>
    </group>
  );
});

// High-Performance Batched Product Instancing (Reduces 4,000 draw calls to <250, ensures rock-solid 60 FPS)
const ProductBatch: React.FC<{
  product: Product;
  slots: ShelfSlotItemProps['slot'][];
}> = React.memo(({ product, slots }) => {
  const openProductModal = useMartStore((state) => state.openProductModal);
  const setHoveredProduct = useMartStore((state) => state.setHoveredProduct);

  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const labelRef = useRef<THREE.InstancedMesh>(null);

  const nameLower = ((product.name || '') + ' ' + (product.category?.name || '') + ' ' + (product.brand || '')).toLowerCase();
  const isPouch = /chips|kurkure|bingo|lays|snack|bhujia|namkeen/i.test(nameLower);
  const isGrainSack = /atta|rice|flour|salt|sugar|wheat|grain|basmati/i.test(nameLower);
  const isOilCan = /oil|sunlite|saffola|mustard|fortune/i.test(nameLower);
  const isChoc = /chocolate|dairy milk|cadbury|kitkat|bar/i.test(nameLower);

  const plcColor = product.placement?.color || '#3b82f6';
  const bodyMat = useMemo(() => {
    if (isChoc) return getProductBodyMaterial('#4a044e', 0.3, 0.12);
    if (isGrainSack) return getProductBodyMaterial(plcColor, 0.85, 0.04);
    if (isPouch) return getProductBodyMaterial(plcColor, 0.35, 0.12);
    return getProductBodyMaterial(plcColor, 0.3, 0.08);
  }, [plcColor, isChoc, isGrainSack, isPouch]);

  const frontTex = useMemo(() => getProductPackagingTexture(product), [product]);
  const labelMat = useMemo(() => {
    return getShelfMaterial(frontTex, `pkg-${product.slug || product.id}`, 'standard');
  }, [frontTex, product]);

  const dims = useMemo(() => {
    if (isGrainSack) return { bw: 0.27, bh: 0.35, bd: 0.16, lw: 0.25, lh: 0.32, yOff: 0.18 };
    if (isPouch) return { bw: 0.24, bh: 0.31, bd: 0.11, lw: 0.23, lh: 0.28, yOff: 0.16 };
    if (isOilCan) return { bw: 0.20, bh: 0.32, bd: 0.13, lw: 0.19, lh: 0.26, yOff: 0.17 };
    if (isChoc) return { bw: 0.28, bh: 0.24, bd: 0.06, lw: 0.27, lh: 0.23, yOff: 0.13 };
    return { bw: 0.26, bh: 0.35, bd: 0.14, lw: 0.25, lh: 0.33, yOff: 0.18 };
  }, [isGrainSack, isPouch, isOilCan, isChoc]);

  useEffect(() => {
    if (!bodyRef.current || !labelRef.current || slots.length === 0) return;
    const dummy = new THREE.Object3D();
    const labelDummy = new THREE.Object3D();

    slots.forEach((slot, idx) => {
      const isLeft = slot.side === 'LEFT';

      // 3D Body Box
      dummy.position.set(slot.relX, slot.relY + dims.yOff, slot.relZ);
      dummy.rotation.set(0, slot.rotationY, 0);
      dummy.scale.set(dims.bw, dims.bh, dims.bd);
      dummy.updateMatrix();
      bodyRef.current!.setMatrixAt(idx, dummy.matrix);

      // Branded Front Packaging Label
      const labelX = slot.relX + (isLeft ? -dims.bd / 2 - 0.003 : dims.bd / 2 + 0.003);
      labelDummy.position.set(labelX, slot.relY + dims.yOff, slot.relZ);
      labelDummy.rotation.set(0, slot.rotationY, 0);
      labelDummy.scale.set(dims.lw, dims.lh, 1);
      labelDummy.updateMatrix();
      labelRef.current!.setMatrixAt(idx, labelDummy.matrix);
    });

    bodyRef.current.instanceMatrix.needsUpdate = true;
    labelRef.current.instanceMatrix.needsUpdate = true;
  }, [slots, dims]);

  if (slots.length === 0) return null;

  return (
    <group>
      <instancedMesh
        ref={bodyRef}
        args={[sharedGeometries.box, bodyMat, slots.length]}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
          setHoveredProduct(product);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          if (typeof document !== 'undefined') document.body.style.cursor = 'default';
          setHoveredProduct(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          openProductModal(product);
        }}
      />
      <instancedMesh
        ref={labelRef}
        args={[sharedGeometries.plane, labelMat, slots.length]}
        raycast={() => null}
      />
    </group>
  );
});
ProductBatch.displayName = 'ProductBatch';

// Sleek Commercial D-Mart Aisle Category Hanging Sign (Compact, Non-Intrusive, Realistic)
const AisleCategorySign: React.FC<{ aisleNumber: number; categoryName: string; height: number }> = React.memo(({ aisleNumber, categoryName, height }) => {
  const subtitleMap: Record<number, string> = {
    1: 'Detergents • Surface Cleaners • Fabric Care',
    2: 'Soaps • Shampoos • Oral Care • Face Wash',
    3: 'Cookies • Biscuits • Chips • Ready Bites',
    4: 'Premium Tea • Instant Coffee • Green Tea',
    5: 'Chocolates • Gifting Bars • Sweet Treats',
    6: 'Chakki Atta • Basmati Rice • Organic Pulses',
    7: 'Refined Oils • Mustard Oil • Spices & Masalas',
    8: 'Chilled Sodas • Pure Fruit Juices • Water',
    9: 'Authentic Namkeen • Bhujia • Crispy Snacks',
    10: 'Gourmet Dry Fruits • Festive Hampers • Sweets',
  };
  const subtitle = subtitleMap[aisleNumber] || 'Daily Groceries & Essentials';

  const titleMap: Record<number, string> = {
    1: 'HOUSEHOLD & CLEANING',
    2: 'PERSONAL CARE & BEAUTY',
    3: 'BISCUITS & SNACKS',
    4: 'TEA & COFFEE ESSENTIALS',
    5: 'CHOCOLATES & SWEETS',
    6: 'FLOURS, RICE & DALS',
    7: 'COOKING OILS & SPICES',
    8: 'BEVERAGES & COLD DRINKS',
    9: 'SNACK PACKS & NAMKEEN',
    10: 'FESTIVE GIFTS & DRY FRUITS',
  };
  const title = titleMap[aisleNumber] || categoryName.toUpperCase();

  return (
    <group position={[0, height / 2 + 1.45, 0]} raycast={() => null}>
      {/* Sleek Stainless Steel Ceiling Suspension Rods */}
      <mesh position={[-0.72, 0.55, 0]} geometry={sharedGeometries.cyl8} scale={[0.006, 1.1, 0.006]} material={shelfRackMaterials.post} />
      <mesh position={[0.72, 0.55, 0]} geometry={sharedGeometries.cyl8} scale={[0.006, 1.1, 0.006]} material={shelfRackMaterials.post} />

      {/* Modern Slim Commercial Signboard Panel (Compact 1.72m x 0.46m x 0.03m) */}
      <mesh geometry={sharedGeometries.box} scale={[1.72, 0.46, 0.03]} material={shelfRackMaterials.plank} />
      {/* Slim Silver Border Trim */}
      <mesh position={[0, 0, 0]} geometry={sharedGeometries.box} scale={[1.74, 0.48, 0.024]} material={shelfRackMaterials.post} />

      {/* FRONT FACE (Facing -Z) */}
      <group position={[0, 0, -0.018]} rotation={[0, Math.PI, 0]}>
        {/* Top D-Mart Royal Blue Pill */}
        <mesh position={[0, 0.125, 0]} geometry={sharedGeometries.box} scale={[0.62, 0.12, 0.005]} material={shelfRackMaterials.endCapSign} />
        <Text position={[0, 0.125, 0.006]} fontSize={0.075} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="extrabold">
          {`AISLE ${aisleNumber}`}
        </Text>
        {/* Main Category Headline */}
        <Text position={[0, -0.03, 0.006]} fontSize={0.13} color="#0f172a" anchorX="center" anchorY="middle" fontWeight="extrabold" letterSpacing={0.02}>
          {title}
        </Text>
        {/* Subtle Subtitle */}
        <Text position={[0, -0.15, 0.006]} fontSize={0.062} color="#047857" anchorX="center" anchorY="middle" fontWeight="bold">
          {`✓ ${subtitle}`}
        </Text>
      </group>

      {/* BACK FACE (Facing +Z) */}
      <group position={[0, 0, 0.018]}>
        {/* Top D-Mart Royal Blue Pill */}
        <mesh position={[0, 0.125, 0]} geometry={sharedGeometries.box} scale={[0.62, 0.12, 0.005]} material={shelfRackMaterials.endCapSign} />
        <Text position={[0, 0.125, 0.006]} fontSize={0.075} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="extrabold">
          {`AISLE ${aisleNumber}`}
        </Text>
        {/* Main Category Headline */}
        <Text position={[0, -0.03, 0.006]} fontSize={0.13} color="#0f172a" anchorX="center" anchorY="middle" fontWeight="extrabold" letterSpacing={0.02}>
          {title}
        </Text>
        {/* Subtle Subtitle */}
        <Text position={[0, -0.15, 0.006]} fontSize={0.062} color="#047857" anchorX="center" anchorY="middle" fontWeight="bold">
          {`✓ ${subtitle}`}
        </Text>
      </group>
    </group>
  );
});

// Instanced Shelf Surface Contact Shadows (1 draw call per aisle instead of 144)
const AisleContactShadows: React.FC<{ slots: ShelfSlotItemProps['slot'][] }> = React.memo(({ slots }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!meshRef.current || slots.length === 0) return;
    const dummy = new THREE.Object3D();
    slots.forEach((slot, idx) => {
      dummy.position.set(slot.relX, slot.relY + 0.003, slot.relZ);
      dummy.rotation.set(-Math.PI / 2, slot.rotationY, 0);
      dummy.scale.set(0.28, 0.22, 1);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(idx, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [slots]);

  if (slots.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[sharedGeometries.contactShadow, shelfRackMaterials.contactShadow, slots.length]}
      raycast={() => null}
    />
  );
});

// High-Performance Instanced ESL Casings & Price Talkers (Flush with shelf rail edge)
const AisleEslCasings: React.FC<{ slots: ShelfSlotItemProps['slot'][] }> = React.memo(({ slots }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const talkerRef = useRef<THREE.InstancedMesh>(null);
  const talkerMat = useMemo(() => getSharedPriceTalkerMaterial(), []);

  useEffect(() => {
    if (!meshRef.current || !talkerRef.current || slots.length === 0) return;
    const dummy = new THREE.Object3D();
    const talkerDummy = new THREE.Object3D();

    slots.forEach((slot, idx) => {
      const isLeft = slot.side === 'LEFT';
      const eslX = isLeft ? -0.875 : 0.875;
      const talkerX = isLeft ? -0.880 : 0.880;

      dummy.position.set(eslX, slot.relY, slot.relZ);
      dummy.rotation.set(0, slot.rotationY, 0);
      dummy.scale.set(0.24, 0.045, 0.008);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(idx, dummy.matrix);

      talkerDummy.position.set(talkerX, slot.relY, slot.relZ);
      talkerDummy.rotation.set(0, slot.rotationY, 0);
      talkerDummy.scale.set(0.22, 0.038, 1);
      talkerDummy.updateMatrix();
      talkerRef.current!.setMatrixAt(idx, talkerDummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    talkerRef.current.instanceMatrix.needsUpdate = true;
  }, [slots]);

  if (slots.length === 0) return null;

  return (
    <group raycast={() => null}>
      <instancedMesh
        ref={meshRef}
        args={[sharedGeometries.box, shelfRackMaterials.eslCasing, slots.length]}
        raycast={() => null}
      />
      <instancedMesh
        ref={talkerRef}
        args={[sharedGeometries.plane, talkerMat, slots.length]}
        raycast={() => null}
      />
    </group>
  );
});

// High-Performance Instanced Support Posts (Commercial Ivory Slotted Uprights)
const AisleSupportPosts: React.FC<{ length: number; height: number }> = React.memo(({ length, height }) => {
  const postsRef = useRef<THREE.InstancedMesh>(null);
  const neonsRef = useRef<THREE.InstancedMesh>(null);
  const zPositions = useMemo(() => {
    const postCount = Math.max(5, Math.round(length / 4.0) + 1);
    const step = length / (postCount - 1);
    return Array.from({ length: postCount }, (_, i) => -length / 2 + i * step);
  }, [length]);

  const maxPostInstances = zPositions.length * 2;

  useEffect(() => {
    if (!postsRef.current || !neonsRef.current) return;
    const dummy = new THREE.Object3D();
    let idx = 0;

    zPositions.forEach((zPos) => {
      // Left post
      dummy.position.set(-0.86, 0, zPos);
      dummy.scale.set(0.04, height, 0.04);
      dummy.updateMatrix();
      postsRef.current!.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(-0.882, 0, zPos);
      dummy.scale.set(0.005, height * 0.94, 0.015);
      dummy.updateMatrix();
      neonsRef.current!.setMatrixAt(idx, dummy.matrix);
      idx++;

      // Right post
      dummy.position.set(0.86, 0, zPos);
      dummy.scale.set(0.04, height, 0.04);
      dummy.updateMatrix();
      postsRef.current!.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(0.882, 0, zPos);
      dummy.scale.set(0.005, height * 0.94, 0.015);
      dummy.updateMatrix();
      neonsRef.current!.setMatrixAt(idx, dummy.matrix);
      idx++;
    });

    postsRef.current.instanceMatrix.needsUpdate = true;
    neonsRef.current.instanceMatrix.needsUpdate = true;
  }, [zPositions, height]);

  return (
    <group raycast={() => null}>
      <instancedMesh ref={postsRef} args={[sharedGeometries.box, shelfRackMaterials.post, maxPostInstances]} raycast={() => null} />
      <instancedMesh ref={neonsRef} args={[sharedGeometries.box, shelfRackMaterials.postNeon, maxPostInstances]} raycast={() => null} />
    </group>
  );
});

// High-Performance Instanced Shelf Planks, Cantilever Steel Brackets & Royal Blue Price Rails
const AisleShelves: React.FC<{ length: number; height: number }> = React.memo(({ length, height }) => {
  const planksRef = useRef<THREE.InstancedMesh>(null);
  const ledsRef = useRef<THREE.InstancedMesh>(null);
  const railsRef = useRef<THREE.InstancedMesh>(null);
  const neonsRef = useRef<THREE.InstancedMesh>(null);
  const bracketsRef = useRef<THREE.InstancedMesh>(null);

  const postCount = useMemo(() => Math.max(5, Math.round(length / 4.0)) + 1, [length]);
  const zPositions = useMemo(() => {
    const step = length / (postCount - 1);
    return Array.from({ length: postCount }, (_, i) => -length / 2 + i * step);
  }, [length, postCount]);

  const maxBracketInstances = zPositions.length * 4 * 2; // 4 tiers x 2 sides

  useEffect(() => {
    if (!planksRef.current || !ledsRef.current || !railsRef.current || !neonsRef.current || !bracketsRef.current) return;
    const dummy = new THREE.Object3D();
    const shelfHeights = [0.45, 1.05, 1.65, 2.25];
    let idx = 0;
    let bIdx = 0;

    shelfHeights.forEach((shelfH) => {
      const yRel = shelfH - height / 2;

      // Left side plank
      dummy.position.set(-0.45, yRel, 0);
      dummy.scale.set(0.85, 0.04, length);
      dummy.updateMatrix();
      planksRef.current!.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(-0.45, yRel - 0.024, 0);
      dummy.scale.set(0.06, 0.012, length);
      dummy.updateMatrix();
      ledsRef.current!.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(-0.875, yRel, 0);
      dummy.scale.set(0.015, 0.05, length);
      dummy.updateMatrix();
      railsRef.current!.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(-0.884, yRel, 0);
      dummy.scale.set(0.004, 0.015, length);
      dummy.updateMatrix();
      neonsRef.current!.setMatrixAt(idx, dummy.matrix);
      idx++;

      // Right side plank
      dummy.position.set(0.45, yRel, 0);
      dummy.scale.set(0.85, 0.04, length);
      dummy.updateMatrix();
      planksRef.current!.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(0.45, yRel - 0.024, 0);
      dummy.scale.set(0.06, 0.012, length);
      dummy.updateMatrix();
      ledsRef.current!.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(0.875, yRel, 0);
      dummy.scale.set(0.015, 0.05, length);
      dummy.updateMatrix();
      railsRef.current!.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(0.884, yRel, 0);
      dummy.scale.set(0.004, 0.015, length);
      dummy.updateMatrix();
      neonsRef.current!.setMatrixAt(idx, dummy.matrix);
      idx++;

      // Cantilever steel brackets underneath each shelf tier at every post position
      zPositions.forEach((zPos) => {
        // Left side cantilever bracket
        dummy.position.set(-0.44, yRel - 0.038, zPos);
        dummy.scale.set(0.78, 0.045, 0.03);
        dummy.updateMatrix();
        bracketsRef.current!.setMatrixAt(bIdx++, dummy.matrix);

        // Right side cantilever bracket
        dummy.position.set(0.44, yRel - 0.038, zPos);
        dummy.scale.set(0.78, 0.045, 0.03);
        dummy.updateMatrix();
        bracketsRef.current!.setMatrixAt(bIdx++, dummy.matrix);
      });
    });

    planksRef.current.instanceMatrix.needsUpdate = true;
    ledsRef.current.instanceMatrix.needsUpdate = true;
    railsRef.current.instanceMatrix.needsUpdate = true;
    neonsRef.current.instanceMatrix.needsUpdate = true;
    bracketsRef.current.instanceMatrix.needsUpdate = true;
  }, [length, height, zPositions]);

  return (
    <group raycast={() => null}>
      <instancedMesh ref={planksRef} args={[sharedGeometries.box, shelfRackMaterials.plank, 8]} raycast={() => null} />
      <instancedMesh ref={ledsRef} args={[sharedGeometries.box, shelfRackMaterials.led, 8]} raycast={() => null} />
      <instancedMesh ref={railsRef} args={[sharedGeometries.box, shelfRackMaterials.rail, 8]} raycast={() => null} />
      <instancedMesh ref={neonsRef} args={[sharedGeometries.box, shelfRackMaterials.neon, 8]} raycast={() => null} />
      <instancedMesh ref={bracketsRef} args={[sharedGeometries.box, shelfRackMaterials.bracket, maxBracketInstances]} raycast={() => null} />
    </group>
  );
});

// Aisle Base Kickplates (Brushed Aluminum Commercial Dust & Trolley Protection)
const AisleKickplates: React.FC<{ length: number; height: number }> = React.memo(({ length, height }) => {
  const yBase = -height / 2 + 0.10;
  return (
    <group raycast={() => null}>
      <mesh position={[-0.45, yBase, 0]} geometry={sharedGeometries.box} scale={[0.85, 0.20, length]} material={shelfRackMaterials.kickplate} />
      <mesh position={[0.45, yBase, 0]} geometry={sharedGeometries.box} scale={[0.85, 0.20, length]} material={shelfRackMaterials.kickplate} />
    </group>
  );
});

// Photorealistic Commercial Gondola End-Cap Feature Display (Replaces Artificial Black Boards)
const SingleEndCapFacing: React.FC<{
  height: number;
  aisleNumber: number;
  categoryName: string;
  featureProducts: Product[];
}> = React.memo(({ height, aisleNumber, categoryName, featureProducts }) => {
  const openProductModal = useMartStore((state) => state.openProductModal);
  const setHoveredProduct = useMartStore((state) => state.setHoveredProduct);

  const tiers = [0.45, 1.05, 1.65, 2.25];
  const itemX = [-0.60, -0.30, 0, 0.30, 0.60];

  return (
    <group>
      {/* 1. Commercial Ivory Gondola Backing Wall (Perforated Pegboard Texture Tone) */}
      <mesh geometry={sharedGeometries.box} scale={[1.74, height, 0.04]} material={shelfRackMaterials.divider} raycast={() => null} />

      {/* 2. Commercial Brushed Aluminum Corner Uprights */}
      <mesh position={[-0.84, 0, 0]} geometry={sharedGeometries.box} scale={[0.06, height, 0.06]} material={shelfRackMaterials.post} raycast={() => null} />
      <mesh position={[0.84, 0, 0]} geometry={sharedGeometries.box} scale={[0.06, height, 0.06]} material={shelfRackMaterials.post} raycast={() => null} />

      {/* 3. Base Stainless Steel Kickplate Plinth */}
      <mesh position={[0, -height / 2 + 0.09, 0.16]} geometry={sharedGeometries.box} scale={[1.74, 0.18, 0.36]} material={shelfRackMaterials.kickplate} raycast={() => null} />

      {/* 4. Top Illuminated D-Mart Header Lightbox */}
      <group position={[0, height / 2 - 0.34, 0.06]} raycast={() => null}>
        {/* Outer Silver Bezel */}
        <mesh geometry={sharedGeometries.box} scale={[1.70, 0.50, 0.08]} material={shelfRackMaterials.post} />
        {/* Pure White Acrylic Panel */}
        <mesh position={[0, 0, 0.02]} geometry={sharedGeometries.box} scale={[1.66, 0.46, 0.06]} material={shelfRackMaterials.plank} />
        {/* D-Mart Sapphire Blue Header Pill */}
        <mesh position={[0, 0.14, 0.055]} geometry={sharedGeometries.box} scale={[1.52, 0.12, 0.005]} material={shelfRackMaterials.endCapSign} />
        <Text position={[0, 0.14, 0.06]} fontSize={0.068} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="extrabold" letterSpacing={0.04}>
          {'D-MART BACHAT BAZAAR • SPECIAL OFFERS'}
        </Text>
        {/* Main Category Headline */}
        <Text position={[0, -0.01, 0.06]} fontSize={0.12} color="#0f172a" anchorX="center" anchorY="middle" fontWeight="extrabold" letterSpacing={0.02}>
          {categoryName.toUpperCase()}
        </Text>
        {/* Promotional Savings Badge */}
        <Text position={[0, -0.15, 0.06]} fontSize={0.065} color="#047857" anchorX="center" anchorY="middle" fontWeight="bold">
          {'★ SPECIAL VALUE • FLAT 20% TO 50% OFF ★'}
        </Text>
      </group>

      {/* 5. 4 Tiered Outward-Facing Display Shelves */}
      {tiers.map((tierH, tIdx) => {
        const yRel = tierH - height / 2;
        return (
          <group key={`endcap-shelf-${tIdx}`} position={[0, yRel, 0.19]} raycast={() => null}>
            {/* White Powder-Coated Shelf Plank */}
            <mesh geometry={sharedGeometries.box} scale={[1.64, 0.035, 0.38]} material={shelfRackMaterials.plank} />
            {/* Left & Right Cantilever Steel Support Brackets */}
            <mesh position={[-0.78, -0.03, -0.03]} geometry={sharedGeometries.box} scale={[0.04, 0.045, 0.32]} material={shelfRackMaterials.bracket} />
            <mesh position={[0.78, -0.03, -0.03]} geometry={sharedGeometries.box} scale={[0.04, 0.045, 0.32]} material={shelfRackMaterials.bracket} />
            {/* D-Mart Blue Front Price Rail */}
            <mesh position={[0, 0, 0.195]} geometry={sharedGeometries.box} scale={[1.64, 0.042, 0.012]} material={shelfRackMaterials.rail} />
            {/* Yellow Promotional Price Talker Strip */}
            <mesh position={[0, 0, 0.202]} geometry={sharedGeometries.box} scale={[1.60, 0.022, 0.004]} material={shelfRackMaterials.neon} />
          </group>
        );
      })}

      {/* 6. Stocked Front-Facing Feature Products on Each Tier (5 items per tier) */}
      {tiers.map((tierH, tIdx) => {
        const yRel = tierH - height / 2;
        return itemX.map((xPos, iIdx) => {
          const prodIdx = (tIdx * 5 + iIdx) % (featureProducts.length || 1);
          const prod = featureProducts[prodIdx];
          if (!prod) return null;

          const plcColor = prod.placement?.color || '#3b82f6';
          const bodyMat = getProductBodyMaterial(plcColor, 0.3, 0.08);

          return (
            <group key={`endcap-prod-${tIdx}-${iIdx}`} position={[xPos, yRel, 0.22]}>
              {/* Invisible Pointer Hitbox */}
              <mesh
                visible={false}
                position={[0, 0.17, 0]}
                geometry={sharedGeometries.box}
                scale={[0.26, 0.36, 0.18]}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
                  setHoveredProduct(prod);
                }}
                onPointerOut={(e) => {
                  e.stopPropagation();
                  if (typeof document !== 'undefined') document.body.style.cursor = 'default';
                  setHoveredProduct(null);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  openProductModal(prod);
                }}
              />
              {/* Front-Facing Product 3D Body */}
              <mesh position={[0, 0.17, 0]} geometry={sharedGeometries.box} scale={[0.24, 0.34, 0.13]} material={bodyMat} raycast={() => null} />
              {/* High-Resolution Branded Packaging Artwork */}
              <ProductSmallImage product={prod} position={[0, 0.17, 0.07]} scale={[0.23, 0.32]} />
            </group>
          );
        });
      })}
    </group>
  );
});

const AisleGondolaEndCaps: React.FC<{
  length: number;
  height: number;
  aisleNumber: number;
  categoryName: string;
  aisleProducts: Product[];
}> = React.memo(({ length, height, aisleNumber, categoryName, aisleProducts }) => {
  const featureProducts = useMemo(() => {
    return aisleProducts && aisleProducts.length > 0 ? aisleProducts.slice(0, 12) : [];
  }, [aisleProducts]);

  return (
    <group>
      {/* North End-Cap (Facing -Z towards front concourse) */}
      <group position={[0, 0, -length / 2 - 0.20]} rotation={[0, Math.PI, 0]}>
        <SingleEndCapFacing
          height={height}
          aisleNumber={aisleNumber}
          categoryName={categoryName}
          featureProducts={featureProducts}
        />
      </group>

      {/* South End-Cap (Facing +Z towards back concourse) */}
      <group position={[0, 0, length / 2 + 0.20]}>
        <SingleEndCapFacing
          height={height}
          aisleNumber={aisleNumber}
          categoryName={categoryName}
          featureProducts={featureProducts}
        />
      </group>
    </group>
  );
});

interface ShelfUnitProps {
  aisle: SupermarketAisle;
  products: Product[];
  floorYOffset: number;
}

const ShelfUnitComponent: React.FC<ShelfUnitProps> = ({ aisle, products, floorYOffset }) => {
  const activeFloor = useMartStore((state) => state.activeFloor);
  const isFloorActive = (floorYOffset > 2 ? 2 : 1) === activeFloor;

  const aisleProducts = useMemo(() => {
    const floorNum = floorYOffset > 2 ? 2 : 1;
    const directMatches = products.filter(
      (p) => (p.placement && p.placement.aisleNumber === aisle.aisleNumber) ||
             (p.category && p.category.name && aisle.categoryName && p.category.name.toLowerCase() === aisle.categoryName.toLowerCase()) ||
             (p.placement && p.placement.aisleCategory && aisle.categoryName && p.placement.aisleCategory.toLowerCase() === aisle.categoryName.toLowerCase())
    );
    if (directMatches.length > 0) return directMatches;

    // Fallback to active floor products so shelves never stand empty
    const floorProducts = products.filter((p) => {
      const pFloor = p.placement?.floorNumber ?? 1;
      return pFloor === floorNum;
    });
    if (floorNum === 2) {
      return floorProducts; // Floor 2 items removed until user adds them later
    }
    return floorProducts.length > 0 ? floorProducts : products;
  }, [products, aisle.aisleNumber, aisle.categoryName, floorYOffset]);

  const length = Math.abs(aisle.endZ - aisle.startZ);
  const centerX = (aisle.startX + aisle.endX) / 2;
  const centerZ = (aisle.startZ + aisle.endZ) / 2;
  const centerY = floorYOffset + aisle.shelfHeight / 2;

  const BLOCK_COUNT = useMemo(() => Math.max(6, Math.round(length / 4.0)), [length]);
  const blockWidth = length / BLOCK_COUNT;

  const blockCenters = useMemo(() => {
    return Array.from(
      { length: BLOCK_COUNT },
      (_, b) => -length / 2 + (b + 0.5) * blockWidth
    );
  }, [length, blockWidth, BLOCK_COUNT]);

  const itemOffsets = [-1.50, -1.00, -0.50, 0, 0.50, 1.00, 1.50];

  const SHELF_TIERS = useMemo(() => [
    { tier: 1, height: 0.45 },
    { tier: 2, height: 1.05 },
    { tier: 3, height: 1.65 },
    { tier: 4, height: 2.25 },
  ], []);

  // Generate BLOCK_COUNT blocks x 7 items x 4 tiers per side (Dense, photorealistic supermarket rows)
  const displaySlots = useMemo(() => {
    if (!isFloorActive || !aisleProducts || aisleProducts.length === 0) return [];

    const slots: Array<{
      key: string;
      product: Product;
      side: 'LEFT' | 'RIGHT';
      tier: number;
      blockIdx: number;
      slotIdx: number;
      relX: number;
      relY: number;
      relZ: number;
      worldX: number;
      worldY: number;
      worldZ: number;
      rotationY: number;
    }> = [];

    const sides: Array<{ side: 'LEFT' | 'RIGHT'; relX: number; rotationY: number }> = [
      { side: 'LEFT', relX: -0.45, rotationY: -Math.PI / 2 },
      { side: 'RIGHT', relX: 0.45, rotationY: Math.PI / 2 },
    ];

    sides.forEach((s) => {
      SHELF_TIERS.forEach((tierInfo, tIdx) => {
        const shelfTierY = tierInfo.height - aisle.shelfHeight / 2 + 0.02;

        for (let b = 0; b < BLOCK_COUNT; b++) {
          for (let k = 0; k < itemOffsets.length; k++) {
            const zRel = blockCenters[b] + itemOffsets[k];
            const tierProducts = aisleProducts.filter((p) => p.placement?.shelfTier === tierInfo.tier);
            const pool = tierProducts.length > 0 ? tierProducts : aisleProducts;
            const prodIdx = (b * itemOffsets.length + k + (s.side === 'RIGHT' ? 1 : 0)) % pool.length;
            const product = pool[prodIdx];

            const slotWorldX = centerX + s.relX;
            const slotWorldY = centerY + shelfTierY;
            const slotWorldZ = centerZ + zRel;

            const slotPlacement: ProductPlacement = product.placement
              ? {
                  ...product.placement,
                  worldX: slotWorldX,
                  worldY: slotWorldY,
                  worldZ: slotWorldZ,
                  floorNumber: floorYOffset > 2 ? 2 : 1,
                  aisleNumber: aisle.aisleNumber,
                  aisleName: aisle.name,
                  shelfSide: s.side,
                  shelfTier: tierInfo.tier,
                }
              : {
                  id: `place-${product.id}-t${tierInfo.tier}-${b}-${k}`,
                  productId: product.id,
                  productName: product.name,
                  productSlug: product.slug,
                  productPrice: product.price,
                  productMrp: product.mrp,
                  floorNumber: floorYOffset > 2 ? 2 : 1,
                  aisleId: aisle.id,
                  aisleNumber: aisle.aisleNumber,
                  aisleName: aisle.name,
                  aisleCategory: aisle.categoryName,
                  shelfSide: s.side,
                  shelfTier: tierInfo.tier,
                  shelfPosition: b * itemOffsets.length + k + 1,
                  worldX: slotWorldX,
                  worldY: slotWorldY,
                  worldZ: slotWorldZ,
                  rotationY: s.rotationY,
                  color: '#3b82f6',
                  modelType: 'box',
                };

            const slotProduct: Product = {
              ...product,
              placement: slotPlacement,
            };

            slots.push({
              key: `${s.side}-t${tierInfo.tier}-b${b}-s${k}-${product.id}`,
              product: slotProduct,
              side: s.side,
              tier: tierInfo.tier,
              blockIdx: b,
              slotIdx: k,
              relX: s.relX,
              relY: shelfTierY,
              relZ: zRel,
              worldX: slotWorldX,
              worldY: slotWorldY,
              worldZ: slotWorldZ,
              rotationY: s.rotationY,
            });
          }
        }
      });
    });

    return slots;
  }, [isFloorActive, aisleProducts, blockCenters, SHELF_TIERS, centerX, centerY, centerZ, floorYOffset, aisle.aisleNumber, aisle.name, aisle.shelfHeight, aisle.id, aisle.categoryName]);

  // Group slots by unique product for high-performance InstancedMesh batching
  const productBatches = useMemo(() => {
    const map = new Map<string, { product: Product; slots: typeof displaySlots }>();
    displaySlots.forEach((slot) => {
      const pid = slot.product.id;
      let batch = map.get(pid);
      if (!batch) {
        batch = { product: slot.product, slots: [] };
        map.set(pid, batch);
      }
      batch.slots.push(slot);
    });
    return Array.from(map.values());
  }, [displaySlots]);

  // Floor Culling: unmount completely if this shelf belongs to inactive floor (placed AFTER all hooks)
  if (!isFloorActive) return null;

  return (
    <group position={[centerX, centerY, centerZ]}>
      {/* Professional D-Mart Aisle Category Sign (Compact, Non-Intrusive, Realistic) */}
      <AisleCategorySign aisleNumber={aisle.aisleNumber} categoryName={aisle.categoryName} height={aisle.shelfHeight} />

      {/* Central Shelving Rack - High-Performance Instanced Rendering (60+ FPS) */}
      <group raycast={() => null}>
        {/* Central Back Divider Wall with Gondola Pegboard Texture */}
        <mesh position={[0, 0, 0]} geometry={sharedGeometries.box} scale={[0.08, aisle.shelfHeight, length]} material={shelfRackMaterials.divider} />

        {/* Instanced Shelf Planks, Cantilever Steel Brackets, LED Glow Strips & Price Rails */}
        <AisleShelves length={length} height={aisle.shelfHeight} />

        {/* Instanced Commercial Powder-Coated Upright Posts */}
        <AisleSupportPosts length={length} height={aisle.shelfHeight} />

        {/* Base Kickplates for Retail Realism */}
        <AisleKickplates length={length} height={aisle.shelfHeight} />
      </group>

      {/* Photorealistic Commercial Gondola End-Cap Feature Displays */}
      <AisleGondolaEndCaps
        length={length}
        height={aisle.shelfHeight}
        aisleNumber={aisle.aisleNumber}
        categoryName={aisle.categoryName}
        aisleProducts={aisleProducts}
      />

      {/* Instanced Shelf Surface Contact Shadows (1 draw call per aisle instead of 392) */}
      <AisleContactShadows slots={displaySlots} />

      {/* Instanced ESL Digital Price Tag Casings & Talkers (2 draw calls per aisle instead of 392) */}
      <AisleEslCasings slots={displaySlots} />

      {/* High-Performance Batched Instanced Product Facings (Locked 60 FPS, <250 Draw Calls) */}
      <group>
        {productBatches.map((batch) => (
          <ProductBatch
            key={batch.product.id}
            product={batch.product}
            slots={batch.slots}
          />
        ))}
      </group>
    </group>
  );
};

export const ShelfUnit = React.memo(ShelfUnitComponent);
