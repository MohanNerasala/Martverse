const fs = require('fs');
const path = require('path');

const catalogPath = path.resolve(__dirname, '../backend/src/main/resources/db/products_catalog.json');
const products = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Exact real 3D coordinates on shelves
const coordinateMap = {
  // --- AISLE 1: BISCUITS & COOKIES (X = -24.0, Z = [-14, 14]) ---
  'SKU-PROD-SNK-04': { worldX: -24.73, worldY: 1.07, worldZ: -6.0, standX: -25.85, standZ: -6.0, standYaw: Math.PI / 2 }, // Parle-G
  'SNK-004':          { worldX: -24.73, worldY: 1.67, worldZ: 2.0, standX: -25.85, standZ: 2.0, standYaw: Math.PI / 2 },  // Good Day
  'SKU-PROD-SNK-01': { worldX: -23.27, worldY: 1.67, worldZ: -4.0, standX: -22.15, standZ: -4.0, standYaw: -Math.PI / 2 }, // Oreo
  'SKU-PROD-SNK-03': { worldX: -23.27, worldY: 1.07, worldZ: 4.0, standX: -22.15, standZ: 4.0, standYaw: -Math.PI / 2 },  // Hide & Seek

  // --- AISLE 2: CHIPS & SAVORIES (X = -17.5, Z = [-14, 14]) ---
  'SKU-PROD-SNK-05': { worldX: -18.23, worldY: 1.07, worldZ: -8.0, standX: -19.35, standZ: -8.0, standYaw: Math.PI / 2 }, // Aloo Bhujia
  'SKU-PROD-SNK-10': { worldX: -18.23, worldY: 1.07, worldZ: -3.0, standX: -19.35, standZ: -3.0, standYaw: Math.PI / 2 }, // Bikaji Sev
  'SKU-PROD-SNK-11': { worldX: -18.23, worldY: 1.07, worldZ: 3.0, standX: -19.35, standZ: 3.0, standYaw: Math.PI / 2 },  // Khatta Meetha
  'SNK-005':          { worldX: -18.23, worldY: 1.67, worldZ: 8.0, standX: -19.35, standZ: 8.0, standYaw: Math.PI / 2 },  // Kurkure
  'SKU-PROD-SNK-08': { worldX: -16.77, worldY: 1.67, worldZ: -6.0, standX: -15.65, standZ: -6.0, standYaw: -Math.PI / 2 }, // Lay's Magic Masala
  'SKU-PROD-SNK-09': { worldX: -16.77, worldY: 1.67, worldZ: -1.0, standX: -15.65, standZ: -1.0, standYaw: -Math.PI / 2 }, // Lay's Salted
  'SKU-PROD-SNK-07': { worldX: -16.77, worldY: 1.07, worldZ: 4.0, standX: -15.65, standZ: 4.0, standYaw: -Math.PI / 2 },  // Bingo Mad Angles
  'SNK-006':          { worldX: -16.77, worldY: 1.07, worldZ: 8.0, standX: -15.65, standZ: 8.0, standYaw: -Math.PI / 2 },  // Doritos

  // --- AISLE 3: ASSAM LEAF TEAS (Z = -5.0, X = [-15.5, -6.5]) ---
  'TEA-001': { worldX: -13.0, worldY: 1.07, worldZ: -5.73, standX: -13.0, standZ: -6.85, standYaw: 0 }, // Tata Tea Gold
  'TEA-002': { worldX: -9.0, worldY: 1.07, worldZ: -5.73, standX: -9.0, standZ: -6.85, standYaw: 0 },   // Red Label
  'TEA-003': { worldX: -11.0, worldY: 1.67, worldZ: -4.27, standX: -11.0, standZ: -3.15, standYaw: Math.PI }, // Taj Mahal

  // --- AISLE 4: COFFEES & SPECIALTY TEAS (Z = 5.0, X = [-15.5, -6.5]) ---
  'COF-001':          { worldX: -13.0, worldY: 1.07, worldZ: 4.27, standX: -13.0, standZ: 3.15, standYaw: 0 },   // Nescafe Classic
  'COF-002':          { worldX: -9.0, worldY: 1.07, worldZ: 4.27, standX: -9.0, standZ: 3.15, standYaw: 0 },     // Bru Instant
  'TEA-004':          { worldX: -13.0, worldY: 1.67, worldZ: 5.73, standX: -13.0, standZ: 6.85, standYaw: Math.PI }, // Twinings Green Tea
  'SKU-PROD-TEA-08': { worldX: -9.0, worldY: 1.67, worldZ: 5.73, standX: -9.0, standZ: 6.85, standYaw: Math.PI },   // Ahmad Tea Earl Grey

  // --- AISLE 5: ATTA, SALT & SUGAR (X = 17.5, Z = [-14, 14]) ---
  'GRO-001':          { worldX: 16.77, worldY: 0.47, worldZ: -5.0, standX: 15.65, standZ: -5.0, standYaw: Math.PI / 2 },  // Aashirvaad Atta
  'GRO-004':          { worldX: 16.77, worldY: 1.07, worldZ: 3.0, standX: 15.65, standZ: 3.0, standYaw: Math.PI / 2 },   // Tata Salt
  'SKU-PROD-GRO-04': { worldX: 18.23, worldY: 0.47, worldZ: 0.0, standX: 19.35, standZ: 0.0, standYaw: -Math.PI / 2 },  // Madhur Sugar

  // --- AISLE 6: BASMATI RICE & DALS (X = 24.0, Z = [-14, 14]) ---
  'GRO-003':          { worldX: 23.27, worldY: 0.47, worldZ: -6.0, standX: 22.15, standZ: -6.0, standYaw: Math.PI / 2 },  // India Gate Basmati
  'SKU-PROD-GRO-06': { worldX: 23.27, worldY: 1.07, worldZ: 4.0, standX: 22.15, standZ: 4.0, standYaw: Math.PI / 2 },   // Toor Dal
  'SKU-PROD-GRO-07': { worldX: 24.73, worldY: 1.07, worldZ: -3.0, standX: 25.85, standZ: -3.0, standYaw: -Math.PI / 2 }, // Moong Dal
  'SKU-PROD-GRO-08': { worldX: 24.73, worldY: 1.07, worldZ: 3.0, standX: 25.85, standZ: 3.0, standYaw: -Math.PI / 2 },  // Chana Dal

  // --- AISLE 7: COOKING OILS & GHEE (Z = -5.0, X = [6.5, 15.5]) ---
  'GRO-002':          { worldX: 9.0, worldY: 0.47, worldZ: -5.73, standX: 9.0, standZ: -6.85, standYaw: 0 },  // Fortune Sunflower Oil
  'SKU-PROD-GRO-09': { worldX: 13.0, worldY: 0.47, worldZ: -5.73, standX: 13.0, standZ: -6.85, standYaw: 0 }, // Saffola Gold Oil
  'SKU-PROD-GRO-10': { worldX: 11.0, worldY: 1.07, worldZ: -4.27, standX: 11.0, standZ: -3.15, standYaw: Math.PI }, // Dhara Mustard Oil

  // --- AISLE 8: NOODLES, SPICES & BREAKFAST (Z = 5.0, X = [6.5, 15.5]) ---
  'SKU-PROD-GRO-02': { worldX: 9.0, worldY: 1.07, worldZ: 4.27, standX: 9.0, standZ: 3.15, standYaw: 0 },   // Maggi Noodles
  'SKU-PROD-GRO-05': { worldX: 13.0, worldY: 1.67, worldZ: 4.27, standX: 13.0, standZ: 3.15, standYaw: 0 }, // Catch Garam Masala
  'SKU-PROD-GRO-01': { worldX: 11.0, worldY: 1.67, worldZ: 5.73, standX: 11.0, standZ: 6.85, standYaw: Math.PI }, // Kellogg's Corn Flakes

  // --- AISLE 9: BEVERAGES & CHILLED SODAS (X = 29.5, Z = [-11, 11]) ---
  'SKU-PROD-BEV-1':  { worldX: 28.77, worldY: 1.07, worldZ: -8.0, standX: 27.65, standZ: -8.0, standYaw: Math.PI / 2 }, // Coca-Cola
  'SKU-PROD-BEV-2':  { worldX: 28.77, worldY: 1.07, worldZ: -4.0, standX: 27.65, standZ: -4.0, standYaw: Math.PI / 2 }, // Pepsi
  'SKU-PROD-BEV-3':  { worldX: 28.77, worldY: 1.07, worldZ: 0.0, standX: 27.65, standZ: 0.0, standYaw: Math.PI / 2 },  // Sprite
  'SKU-PROD-BEV-4':  { worldX: 28.77, worldY: 1.07, worldZ: 4.0, standX: 27.65, standZ: 4.0, standYaw: Math.PI / 2 },  // Fanta
  'SKU-PROD-BEV-5':  { worldX: 28.77, worldY: 1.07, worldZ: 8.0, standX: 27.65, standZ: 8.0, standYaw: Math.PI / 2 },  // Thums Up
  'SKU-PROD-BEV-6':  { worldX: 30.23, worldY: 1.07, worldZ: -6.0, standX: 31.35, standZ: -6.0, standYaw: -Math.PI / 2 }, // Maaza Mango
  'SKU-PROD-BEV-7':  { worldX: 30.23, worldY: 1.07, worldZ: -2.0, standX: 31.35, standZ: -2.0, standYaw: -Math.PI / 2 }, // Bisleri
  'SKU-PROD-BEV-8':  { worldX: 30.23, worldY: 1.67, worldZ: 2.0, standX: 31.35, standZ: 2.0, standYaw: -Math.PI / 2 },  // Red Bull
  'SKU-PROD-BEV-09': { worldX: 30.23, worldY: 1.07, worldZ: 6.0, standX: 31.35, standZ: 6.0, standYaw: -Math.PI / 2 },  // Tropicana
  'SKU-PROD-BEV-10': { worldX: 30.23, worldY: 0.47, worldZ: 9.0, standX: 31.35, standZ: 9.0, standYaw: -Math.PI / 2 },  // Bisleri Case

  // --- LEFT WALL: HOUSEHOLD CLEANING (X = -34.38, Z = [-18, 18]) ---
  'HOU-001':          { worldX: -34.38, worldY: 0.47, worldZ: -16.0, standX: -32.8, standZ: -16.0, standYaw: -Math.PI / 2 }, // Surf Excel Matic 4kg
  'HOU-002':          { worldX: -34.38, worldY: 1.07, worldZ: -12.0, standX: -32.8, standZ: -12.0, standYaw: -Math.PI / 2 }, // Vim Gel 2L
  'HOU-003':          { worldX: -34.38, worldY: 0.47, worldZ: -8.0, standX: -32.8, standZ: -8.0, standYaw: -Math.PI / 2 },   // Harpic 2L
  'HOU-004':          { worldX: -34.38, worldY: 0.47, worldZ: -4.0, standX: -32.8, standZ: -4.0, standYaw: -Math.PI / 2 },   // Lizol Citrus 2L
  'HOU-005':          { worldX: -34.38, worldY: 1.67, worldZ: 0.0, standX: -32.8, standZ: 0.0, standYaw: -Math.PI / 2 },     // Colin Cleaner
  'SKU-PROD-HOU-06': { worldX: -34.38, worldY: 1.07, worldZ: 4.0, standX: -32.8, standZ: 4.0, standYaw: -Math.PI / 2 },     // Ariel Liquid
  'SKU-PROD-HOU-07': { worldX: -34.38, worldY: 1.07, worldZ: 8.0, standX: -32.8, standZ: 8.0, standYaw: -Math.PI / 2 },     // Comfort Conditioner
  'SKU-PROD-HOU-08': { worldX: -34.38, worldY: 0.47, worldZ: 12.0, standX: -32.8, standZ: 12.0, standYaw: -Math.PI / 2 },    // Tide Plus

  // --- LEFT WALL: PERSONAL CARE (X = -34.38, Z = [-18, 18]) ---
  'PER-001':          { worldX: -34.38, worldY: 1.07, worldZ: -14.0, standX: -32.8, standZ: -14.0, standYaw: -Math.PI / 2 }, // Dettol Soap
  'PER-002':          { worldX: -34.38, worldY: 1.67, worldZ: -10.0, standX: -32.8, standZ: -10.0, standYaw: -Math.PI / 2 }, // Head & Shoulders
  'PER-003':          { worldX: -34.38, worldY: 1.07, worldZ: -6.0, standX: -32.8, standZ: -6.0, standYaw: -Math.PI / 2 },   // Colgate Strong Teeth
  'PER-004':          { worldX: -34.38, worldY: 1.67, worldZ: -2.0, standX: -32.8, standZ: -2.0, standYaw: -Math.PI / 2 },   // Dove Body Wash
  'PER-005':          { worldX: -34.38, worldY: 1.67, worldZ: 2.0, standX: -32.8, standZ: 2.0, standYaw: -Math.PI / 2 },     // Nivea Soft Cream
  'SKU-PROD-PER-06': { worldX: -34.38, worldY: 1.07, worldZ: 6.0, standX: -32.8, standZ: 6.0, standYaw: -Math.PI / 2 },     // Clinic Plus
  'SKU-PROD-PER-07': { worldX: -34.38, worldY: 1.07, worldZ: 10.0, standX: -32.8, standZ: 10.0, standYaw: -Math.PI / 2 },    // Lux Soap
  'SKU-PROD-PER-08': { worldX: -34.38, worldY: 1.67, worldZ: 14.0, standX: -32.8, standZ: 14.0, standYaw: -Math.PI / 2 },    // Himalaya Neem
  'SKU-PROD-PER-09': { worldX: -34.38, worldY: 1.67, worldZ: 16.0, standX: -32.8, standZ: 16.0, standYaw: -Math.PI / 2 },    // Pond's Face Wash

  // --- CENTRAL PROMENADE ISLAND 1: CHOCOLATES (Center at X = 0, Z = -22.5) ---
  'CHO-003':          { worldX: -0.5, worldY: 1.1, worldZ: -22.5, standX: -1.75, standZ: -22.5, standYaw: Math.PI / 2 },  // Dairy Milk Silk
  'SKU-PROD-TEA-11': { worldX: 0.5, worldY: 1.1, worldZ: -22.5, standX: 1.75, standZ: -22.5, standYaw: -Math.PI / 2 },   // Dairy Milk Classic
  'CHO-001':          { worldX: 0.0, worldY: 1.1, worldZ: -23.1, standX: 0.0, standZ: -24.2, standYaw: 0 },               // Lindt 70%
  'CHO-002':          { worldX: 0.0, worldY: 1.1, worldZ: -21.9, standX: 0.0, standZ: -20.8, standYaw: Math.PI },          // Ferrero Rocher
  'SKU-PROD-CHO-04': { worldX: -0.3, worldY: 0.75, worldZ: -22.5, standX: -1.75, standZ: -22.5, standYaw: Math.PI / 2 }, // 5 Star
  'SKU-PROD-CHO-05': { worldX: 0.3, worldY: 0.75, worldZ: -22.5, standX: 1.75, standZ: -22.5, standYaw: -Math.PI / 2 },  // Munch
  'SKU-PROD-CHO-06': { worldX: 0.0, worldY: 0.75, worldZ: -22.1, standX: 0.0, standZ: -20.8, standYaw: Math.PI },        // KitKat 4-Finger

  // --- CENTRAL PROMENADE ISLAND 2: FESTIVE SWEETS & DRY FRUITS (Center at X = 0, Z = -5.0) ---
  'SKU-PROD-SWT-04': { worldX: -0.4, worldY: 1.0, worldZ: -5.0, standX: -1.65, standZ: -5.0, standYaw: Math.PI / 2 },  // Gulab Jamun
  'SKU-PROD-SWT-05': { worldX: 0.4, worldY: 1.0, worldZ: -5.0, standX: 1.65, standZ: -5.0, standYaw: -Math.PI / 2 },   // Soan Papdi
  'SKU-PROD-SWT-06': { worldX: 0.0, worldY: 1.0, worldZ: -5.5, standX: 0.0, standZ: -6.6, standYaw: 0 },               // Celebrations Box
  'SKU-PROD-SWT-07': { worldX: 0.0, worldY: 1.0, worldZ: -4.5, standX: 0.0, standZ: -3.4, standYaw: Math.PI },          // Happilo Almonds
  'SKU-PROD-SWT-08': { worldX: 0.3, worldY: 0.7, worldZ: -5.0, standX: 1.65, standZ: -5.0, standYaw: -Math.PI / 2 },  // Happilo Cashews

  // --- RIGHT WALL: DAIRY REFRIGERATOR (X = 33.8, Z = [-11, -4]) ---
  'SKU-PROD-DAIRY-1': { worldX: 33.8, worldY: 1.4, worldZ: -11.0, standX: 32.2, standZ: -11.0, standYaw: Math.PI / 2 }, // Amul Milk
  'SKU-PROD-DAIRY-2': { worldX: 33.8, worldY: 1.0, worldZ: -10.0, standX: 32.2, standZ: -10.0, standYaw: Math.PI / 2 }, // Mother Dairy Curd
  'SKU-PROD-DAIRY-3': { worldX: 33.8, worldY: 1.0, worldZ: -9.0, standX: 32.2, standZ: -9.0, standYaw: Math.PI / 2 },   // Amul Malai Paneer
  'SKU-PROD-DAIRY-4': { worldX: 33.8, worldY: 1.4, worldZ: -8.0, standX: 32.2, standZ: -8.0, standYaw: Math.PI / 2 },   // Amul Butter
  'SKU-PROD-DAIRY-5': { worldX: 33.8, worldY: 1.4, worldZ: -7.0, standX: 32.2, standZ: -7.0, standYaw: Math.PI / 2 },   // Amul Cheese Slices
  'SKU-PROD-DAIRY-6': { worldX: 33.8, worldY: 1.0, worldZ: -6.0, standX: 32.2, standZ: -6.0, standYaw: Math.PI / 2 },   // Greek Yogurt
  'SKU-PROD-DAIRY-7': { worldX: 33.8, worldY: 0.6, worldZ: -5.0, standX: 32.2, standZ: -5.0, standYaw: Math.PI / 2 },   // Amul Lassi
  'SKU-PROD-DAIRY-8': { worldX: 33.8, worldY: 0.6, worldZ: -4.0, standX: 32.2, standZ: -4.0, standYaw: Math.PI / 2 },   // GoodLife Milk

  // --- RIGHT WALL: FROZEN FOODS REFRIGERATOR (X = 33.8, Z = [5, 12]) ---
  'SKU-PROD-FROZ-1': { worldX: 33.8, worldY: 1.4, worldZ: 5.0, standX: 32.2, standZ: 5.0, standYaw: Math.PI / 2 },   // Vanilla Gold
  'SKU-PROD-FROZ-2': { worldX: 33.8, worldY: 1.4, worldZ: 6.0, standX: 32.2, standZ: 6.0, standYaw: Math.PI / 2 },   // Double Choc Cone
  'SKU-PROD-FROZ-3': { worldX: 33.8, worldY: 1.4, worldZ: 7.0, standX: 32.2, standZ: 7.0, standYaw: Math.PI / 2 },   // Feast Bar
  'SKU-PROD-FROZ-4': { worldX: 33.8, worldY: 1.0, worldZ: 8.0, standX: 32.2, standZ: 8.0, standYaw: Math.PI / 2 },   // McCain French Fries
  'SKU-PROD-FROZ-5': { worldX: 33.8, worldY: 1.0, worldZ: 9.0, standX: 32.2, standZ: 9.0, standYaw: Math.PI / 2 },   // Safal Green Peas
  'SKU-PROD-FROZ-6': { worldX: 33.8, worldY: 0.6, worldZ: 10.0, standX: 32.2, standZ: 10.0, standYaw: Math.PI / 2 },  // McCain Veggie Patty
  'SKU-PROD-FROZ-7': { worldX: 33.8, worldY: 0.6, worldZ: 11.0, standX: 32.2, standZ: 11.0, standYaw: Math.PI / 2 },  // Sumeru Samosas
  'SKU-PROD-FROZ-8': { worldX: 33.8, worldY: 0.6, worldZ: 12.0, standX: 32.2, standZ: 12.0, standYaw: Math.PI / 2 },  // Amul Shrikhand
};

const updated = products.map((p) => {
  const coords = coordinateMap[p.sku];
  if (!coords) {
    console.warn('Missing coords for:', p.sku, p.name);
    return p;
  }
  const placement = {
    ...p.placement,
    worldX: coords.worldX,
    worldY: coords.worldY,
    worldZ: coords.worldZ,
    standX: coords.standX,
    standZ: coords.standZ,
    standYaw: coords.standYaw,
  };
  return {
    ...p,
    placement,
  };
});

fs.writeFileSync(catalogPath, JSON.stringify(updated, null, 2), 'utf8');

const tsContent = `import { Product } from '@/types';

/**
 * Single Source of Truth: Canonical Backend Product Collection
 * 87 Real FMCG Products with Exact 3D Shelf Coordinates & Stand Positions.
 */
export const CANONICAL_BACKEND_PRODUCTS: Product[] = ${JSON.stringify(updated, null, 2)};
`;

const frontendTsPath = path.resolve(__dirname, '../frontend/src/lib/productsCatalog.ts');
fs.writeFileSync(frontendTsPath, tsContent, 'utf8');
console.log('Successfully assigned accurate 3D coordinates to all 87 products!');

