const fs = require('fs');
const path = require('path');

const catalogPath = path.resolve(__dirname, '../backend/src/main/resources/db/products_catalog.json');
const rawData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

console.log('Read', rawData.length, 'products from backend catalog.');

// Map each product to its true category, aisle, and metadata
const processed = rawData.map((p, idx) => {
  const sku = (p.sku || '').toUpperCase();
  let categoryName = p.categoryName || (p.category && p.category.name) || '';
  let aisleNumber = p.placement ? p.placement.aisleNumber : null;
  let aisleName = p.placement ? p.placement.aisleName : null;
  let aisleCategory = p.placement ? p.placement.aisleCategory : null;
  let modelType = p.placement?.modelType || 'box';
  let color = p.placement?.color || '#3b82f6';

  // 1. Household & Cleaning (Left Wall Gondola)
  if (sku.startsWith('HOU-') || sku.startsWith('SKU-PROD-HOU-')) {
    categoryName = 'Household & Cleaning Products';
    aisleNumber = 104;
    aisleName = 'Household & Cleaning Products';
    aisleCategory = 'Household';
    color = '#8b5cf6';
    modelType = (sku === 'HOU-002' || sku === 'HOU-003' || sku === 'HOU-004' || sku === 'HOU-005' || sku.includes('ARIEL') || sku.includes('COMFORT')) ? 'bottle' : 'box';
  }
  // 2. Personal Care & Beauty (Left Wall Gondola)
  else if (sku.startsWith('PER-') || sku.startsWith('SKU-PROD-PER-')) {
    categoryName = 'Personal Care & Beauty';
    aisleNumber = 105;
    aisleName = 'Personal Care & Beauty';
    aisleCategory = 'Personal Care';
    color = '#06b6d4';
    modelType = (sku.includes('SHAMPOO') || sku.includes('BODY-WASH') || sku.includes('FACEWASH') || sku === 'PER-002' || sku === 'PER-004') ? 'bottle' : 'box';
  }
  // 3. Biscuits & Cookies (Aisle 1)
  else if (sku === 'SKU-PROD-SNK-04' || sku === 'SNK-004' || sku === 'SKU-PROD-SNK-01' || sku === 'SKU-PROD-SNK-03') {
    categoryName = 'Biscuits & Snacks';
    aisleNumber = 1;
    aisleName = 'Biscuits, Cookies & Breakfast Snacks';
    aisleCategory = 'Biscuits & Snacks';
    color = '#f59e0b';
    modelType = 'box';
  }
  // 4. Savory Chips & Namkeen (Aisle 2)
  else if (sku.startsWith('SNK-') || sku.startsWith('SKU-PROD-SNK-')) {
    categoryName = 'Biscuits & Snacks';
    aisleNumber = 2;
    aisleName = 'Crispy Chips, Namkeen & Savories';
    aisleCategory = 'Biscuits & Snacks';
    color = '#f97316';
    modelType = 'bag';
  }
  // 5. Assam Leaf Teas (Aisle 3)
  else if (sku === 'TEA-001' || sku === 'TEA-002' || sku === 'TEA-003') {
    categoryName = 'Tea, Coffee & Sweets';
    aisleNumber = 3;
    aisleName = 'Assam Leaf Teas, Green Teas & Infusions';
    aisleCategory = 'Tea, Coffee & Sweets';
    color = '#059669';
    modelType = 'box';
  }
  // 6. Coffees & Specialty Teas (Aisle 4)
  else if (sku.startsWith('COF-') || sku === 'TEA-004' || sku === 'SKU-PROD-TEA-08') {
    categoryName = 'Tea, Coffee & Sweets';
    aisleNumber = 4;
    aisleName = 'Instant Coffees, Roasted Beans & Health Drinks';
    aisleCategory = 'Tea, Coffee & Sweets';
    color = '#78350f';
    modelType = sku.startsWith('COF-') ? 'bottle' : 'box';
  }
  // 7. Chocolates & Confectionery (Central Island & Sweet Section)
  else if (sku.startsWith('CHO-') || sku.startsWith('SKU-PROD-CHO-') || sku === 'SKU-PROD-TEA-11') {
    categoryName = 'Chocolates & Sweets';
    aisleNumber = 106;
    aisleName = 'Chocolates & Confectionery';
    aisleCategory = 'Chocolates & Sweets';
    color = '#7c3aed';
    modelType = 'box';
  }
  // 8. Chakki Atta, Salt & Sugar (Aisle 5)
  else if (sku === 'GRO-001' || sku === 'GRO-004' || sku === 'SKU-PROD-GRO-04') {
    categoryName = 'Groceries & Staples';
    aisleNumber = 5;
    aisleName = 'Chakki Atta, Organic Flours & Grains';
    aisleCategory = 'Groceries & Staples';
    color = '#10b981';
    modelType = 'bag';
  }
  // 9. Basmati Rice, Dals & Pulses (Aisle 6)
  else if (sku === 'GRO-003' || sku === 'SKU-PROD-GRO-06' || sku === 'SKU-PROD-GRO-07' || sku === 'SKU-PROD-GRO-08') {
    categoryName = 'Groceries & Staples';
    aisleNumber = 6;
    aisleName = 'Basmati Rice, Organic Dals & Pulses';
    aisleCategory = 'Groceries & Staples';
    color = '#047857';
    modelType = 'bag';
  }
  // 10. Cooking Oils & Ghee (Aisle 7)
  else if (sku === 'GRO-002' || sku === 'SKU-PROD-GRO-09' || sku === 'SKU-PROD-GRO-10') {
    categoryName = 'Groceries & Staples';
    aisleNumber = 7;
    aisleName = 'Refined Cooking Oils, Pure Ghee & Spices';
    aisleCategory = 'Groceries & Staples';
    color = '#ca8a04';
    modelType = 'bottle';
  }
  // 11. Instant Foods, Noodles & Spices (Aisle 8)
  else if (sku === 'SKU-PROD-GRO-01' || sku === 'SKU-PROD-GRO-02' || sku === 'SKU-PROD-GRO-05') {
    categoryName = 'Groceries & Staples';
    aisleNumber = 8;
    aisleName = 'Instant Noodles, Pasta & Breakfast Foods';
    aisleCategory = 'Groceries & Staples';
    color = '#0284c7';
    modelType = 'box';
  }
  // 12. Soft Drinks, Juices & Packaged Water (Aisle 9 & Refrigerator 102)
  else if (sku.startsWith('SKU-PROD-BEV-')) {
    categoryName = 'Cold Drinks & Beverages';
    aisleNumber = 9;
    aisleName = 'Soft Drinks, Fruit Juices & Bottled Water';
    aisleCategory = 'Cold Drinks & Beverages';
    color = '#2563eb';
    modelType = 'bottle';
  }
  // 13. Festive Sweets & Dry Fruits (Central Island & Aisle 10)
  else if (sku.startsWith('SKU-PROD-SWT-')) {
    categoryName = 'Tea, Coffee & Sweets';
    aisleNumber = 10;
    aisleName = 'Festive Gifting, Sweets & Dry Fruits';
    aisleCategory = 'Tea, Coffee & Sweets';
    color = '#ec4899';
    modelType = 'box';
  }
  // 14. Dairy Refrigerator (Aisle 101)
  else if (sku.startsWith('SKU-PROD-DAIRY-')) {
    categoryName = 'Dairy & Fresh Milk';
    aisleNumber = 101;
    aisleName = 'Dairy Refrigerator Gallery';
    aisleCategory = 'Dairy';
    color = '#38bdf8';
    modelType = (sku.includes('MILK') || sku.includes('LASSI')) ? 'bottle' : 'box';
  }
  // 15. Frozen Foods Refrigerator (Aisle 103)
  else if (sku.startsWith('SKU-PROD-FROZ-')) {
    categoryName = 'Frozen Foods & Ice Cream';
    aisleNumber = 103;
    aisleName = 'Frozen Foods & Ice Cream';
    aisleCategory = 'Frozen';
    color = '#06b6d4';
    modelType = 'box';
  }

  // Ensure placement exists
  const placement = {
    id: p.placement?.id || `place-${p.id}`,
    productId: p.id,
    productName: p.name,
    productSlug: p.slug,
    productPrice: p.price,
    productMrp: p.mrp || Math.round(p.price * 1.15),
    floorNumber: 1,
    aisleId: `aisle-${aisleNumber}`,
    aisleNumber: aisleNumber,
    aisleName: aisleName,
    aisleCategory: aisleCategory || categoryName,
    shelfSide: p.placement?.shelfSide || (idx % 2 === 0 ? 'LEFT' : 'RIGHT'),
    shelfTier: p.placement?.shelfTier || ((idx % 4) + 1),
    shelfPosition: p.placement?.shelfPosition || idx,
    worldX: p.placement?.worldX || 0,
    worldY: p.placement?.worldY || 1.0,
    worldZ: p.placement?.worldZ || 0,
    rotationY: p.placement?.rotationY || 0,
    color,
    modelType,
  };

  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    slug: p.slug,
    description: p.description || `${p.name} - Premium Quality FMCG Grocery`,
    brand: p.brand || 'MARTVERSE',
    categoryId: `cat-${categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    categoryName,
    category: {
      id: `cat-${categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: categoryName,
      slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    },
    mrp: p.mrp || Math.round(p.price * 1.15),
    price: p.price,
    effectivePrice: p.effectivePrice || p.price,
    discountPrice: p.discountPrice || p.price,
    discountPercentage: p.discountPercentage || Math.round((( (p.mrp || p.price * 1.15) - p.price) / (p.mrp || p.price * 1.15)) * 100),
    isVeg: p.isVeg !== undefined ? p.isVeg : true,
    unit: p.unit || 'Pack',
    packageType: p.packageType || 'Standard Pack',
    imageUrl: p.imageUrl,
    inStock: true,
    stockQuantity: p.stockQuantity && p.stockQuantity > 0 ? p.stockQuantity : 100,
    featured: Boolean(p.featured),
    hasVariants: false,
    variants: [],
    placement,
  };
});

// Write updated catalog to backend
fs.writeFileSync(catalogPath, JSON.stringify(processed, null, 2), 'utf8');
console.log('Successfully written reconciled backend catalog to:', catalogPath);

// Write TypeScript file for frontend single source of truth
const tsContent = `import { Product } from '@/types';

/**
 * Single Source of Truth: Canonical Backend Product Collection
 * 87 Real FMCG Products from authentic Indian Hypermarket inventory.
 * Automatically synchronized with /backend/src/main/resources/db/products_catalog.json
 */
export const CANONICAL_BACKEND_PRODUCTS: Product[] = ${JSON.stringify(processed, null, 2)};
`;

const frontendTsPath = path.resolve(__dirname, '../frontend/src/lib/productsCatalog.ts');
fs.writeFileSync(frontendTsPath, tsContent, 'utf8');
console.log('Successfully written frontend source of truth to:', frontendTsPath);

