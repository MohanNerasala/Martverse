-- ============================================================
-- MARTVERSE Database Seed Data
-- 2 Floors, 11 Aisles (5 Ground Floor, 6 Floor 2 Clothing)
-- Real products with 3D placements, variants, and stock
-- ============================================================

-- ── USERS ────────────────────────────────────────────────────
-- Passwords: admin123, customer123 (BCrypt hash)
INSERT INTO users (id, email, password_hash, role, active) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@martverse.com', '$2a$12$LJ3mFsB4W0jlTOHBKfYhUeY1HVOJOsjFdbGZB7r/m3t.jHZ8IYVdW', 'ADMIN', true),
('00000000-0000-0000-0000-000000000003', 'customer@martverse.com', '$2a$12$LJ3mFsB4W0jlTOHBKfYhUeY1HVOJOsjFdbGZB7r/m3t.jHZ8IYVdW', 'CUSTOMER', true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO customer_profiles (id, user_id, full_name, phone) VALUES
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'MARTVERSE Store Admin', '+91 9876543210'),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'Priya Sharma', '+91 9820012345')
ON CONFLICT (user_id) DO NOTHING;

-- ── SUPERMARKET FLOORS ───────────────────────────────────────
INSERT INTO supermarket_floors (id, floor_number, name, description, height_offset, length, width, height) VALUES
('f0000000-0000-0000-0000-000000000001', 1, 'Ground Floor: Groceries, Snacks & Essentials', 'Aisle rows covering snacks, sweets, daily groceries, personal care, and household cleaning products.', 0.00, 50.00, 36.00, 4.50),
('f0000000-0000-0000-0000-000000000002', 2, 'First Floor: Fashion Studio & Apparel', 'Six dedicated clothing aisle rows: Three for Women and Three for Men.', 5.00, 50.00, 36.00, 4.50)
ON CONFLICT (floor_number) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  height_offset = EXCLUDED.height_offset;

-- ── CATEGORIES ───────────────────────────────────────────────
INSERT INTO categories (id, name, description, floor_number, display_order) VALUES
('c0000000-0000-0000-0000-000000000001', 'Snacks & Biscuits', 'Crunchy namkeens, chips, crackers, and biscuits', 1, 1),
('c0000000-0000-0000-0000-000000000002', 'Sweets & Confectionery', 'Chocolates, candies, toffees, and festive sweets', 1, 2),
('c0000000-0000-0000-0000-000000000003', 'Groceries & Staples', 'Atta, rice, cooking oils, dals, and spices', 1, 3),
('c0000000-0000-0000-0000-000000000004', 'Personal Care & Toiletries', 'Oral care, soaps, shampoos, and skincare', 1, 4),
('c0000000-0000-0000-0000-000000000005', 'Household & Cleaning Products', 'Detergents, dishwash gels, and floor cleaners', 1, 5),
('c0000000-0000-0000-0000-000000000006', 'Women''s Ethnic Wear & Kurtas', 'Straight kurtas, anarkalis, and palazzos', 2, 6),
('c0000000-0000-0000-0000-000000000007', 'Women''s Sarees & Traditional Wear', 'Silk, banarasi, and embroidered sarees', 2, 7),
('c0000000-0000-0000-0000-000000000008', 'Women''s Western Tops & Dresses', 'Casual tops, floral dresses, and jeans', 2, 8),
('c0000000-0000-0000-0000-000000000009', 'Men''s Formal & Casual Shirts', 'Executive shirts, linen shirts, and button-downs', 2, 9),
('c0000000-0000-0000-0000-000000000010', 'Men''s T-Shirts & Polos', 'Pique polos, graphic tees, and henleys', 2, 10),
('c0000000-0000-0000-0000-000000000011', 'Men''s Denim Jeans & Trousers', 'Slim fit stretch jeans, chinos, and trousers', 2, 11)
ON CONFLICT DO NOTHING;

-- ── AISLES ───────────────────────────────────────────────────
-- Floor 1: 5 Aisles at X = -10, -5, 0, 5, 10
INSERT INTO supermarket_aisles (id, floor_id, aisle_number, name, category_id, position_x, position_z, start_x, start_z, end_x, end_z, shelf_height, shelf_tiers, color_code, banner_text) VALUES
('a0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 1, 'Snacks & Biscuits', 'c0000000-0000-0000-0000-000000000001', -10.00, 0, -10.00, -12.00, -10.00, 12.00, 2.80, 3, '#f59e0b', 'AISLE 1 • SNACKS & BISCUITS • BEST SAVINGS'),
('a0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 2, 'Sweets & Confectionery', 'c0000000-0000-0000-0000-000000000002', -5.00, 0, -5.00, -12.00, -5.00, 12.00, 2.80, 3, '#ec4899', 'AISLE 2 • SWEETS & CHOCOLATES • FESTIVE DELIGHT'),
('a0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', 3, 'Groceries & Staples', 'c0000000-0000-0000-0000-000000000003', 0.00, 0, 0.00, -12.00, 0.00, 12.00, 2.80, 3, '#10b981', 'AISLE 3 • ATTA, RICE, OILS & SPICES • DMART BACHAT'),
('a0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000001', 4, 'Personal Care & Toiletries', 'c0000000-0000-0000-0000-000000000004', 5.00, 0, 5.00, -12.00, 5.00, 12.00, 2.80, 3, '#06b6d4', 'AISLE 4 • SKINCARE, SHAMPOO & DENTAL CARE'),
('a0000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000001', 5, 'Household & Cleaning Products', 'c0000000-0000-0000-0000-000000000005', 10.00, 0, 10.00, -12.00, 10.00, 12.00, 2.80, 3, '#8b5cf6', 'AISLE 5 • DETERGENTS & HOME CLEANING'),

-- Floor 2: 6 Clothing Aisles (3 Women, 3 Men)
('a0000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000002', 6, 'Women''s Ethnic Wear & Kurtas', 'c0000000-0000-0000-0000-000000000006', -11.00, 0, -11.00, -12.00, -11.00, 12.00, 2.80, 3, '#db2777', 'ROW 6 • WOMEN''S ETHNIC KURTAS & PALAZZOS'),
('a0000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000002', 7, 'Women''s Sarees & Traditional Wear', 'c0000000-0000-0000-0000-000000000007', -6.50, 0, -6.50, -12.00, -6.50, 12.00, 2.80, 3, '#f43f5e', 'ROW 7 • SILK & BANARASI SAREES'),
('a0000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000002', 8, 'Women''s Western Tops & Dresses', 'c0000000-0000-0000-0000-000000000008', -2.00, 0, -2.00, -12.00, -2.00, 12.00, 2.80, 3, '#e11d48', 'ROW 8 • TRENDING WESTERN TOPS & JEANS'),
('a0000000-0000-0000-0000-000000000009', 'f0000000-0000-0000-0000-000000000002', 9, 'Men''s Formal & Casual Shirts', 'c0000000-0000-0000-0000-000000000009', 2.50, 0, 2.50, -12.00, 2.50, 12.00, 2.80, 3, '#3b82f6', 'ROW 9 • EXECUTIVE FORMAL & CASUAL SHIRTS'),
('a0000000-0000-0000-0000-000000000010', 'f0000000-0000-0000-0000-000000000002', 10, 'Men''s T-Shirts & Polos', 'c0000000-0000-0000-0000-000000000010', 7.00, 0, 7.00, -12.00, 7.00, 12.00, 2.80, 3, '#6366f1', 'ROW 10 • CASUAL POLOS & PRINTED TEES'),
('a0000000-0000-0000-0000-000000000011', 'f0000000-0000-0000-0000-000000000002', 11, 'Men''s Denim Jeans & Trousers', 'c0000000-0000-0000-0000-000000000011', 11.50, 0, 11.50, -12.00, 11.50, 12.00, 2.80, 3, '#1d4ed8', 'ROW 11 • SLIM FIT DENIMS & CHINOS')
ON CONFLICT (floor_id, aisle_number) DO UPDATE SET
  name = EXCLUDED.name,
  position_x = EXCLUDED.position_x,
  start_x = EXCLUDED.start_x,
  start_z = EXCLUDED.start_z,
  end_x = EXCLUDED.end_x,
  end_z = EXCLUDED.end_z,
  color_code = EXCLUDED.color_code,
  banner_text = EXCLUDED.banner_text;

-- ── PRODUCTS ─────────────────────────────────────────────────
INSERT INTO products (id, sku, name, slug, description, brand, category_id, price, discount_price, has_variants, weight, unit, image_url) VALUES
-- Floor 1
('b0000000-0000-0000-0000-000000000001', 'SNK-001', 'Parle-G Original Glucose Biscuits', 'parle-g-glucose-biscuits-800g', 'India''s beloved tea companion made with nourishing wheat and milk goodness.', 'Parle', 'c0000000-0000-0000-0000-000000000001', 90.00, 75.00, false, '800g', 'Family Pack', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop&q=80'),
('b0000000-0000-0000-0000-000000000002', 'SNK-002', 'Haldiram''s Nagpur Aloo Bhujia', 'haldirams-nagpur-aloo-bhujia-400g', 'Crispy, spicy potato-gram flour crunchies seasoned with authentic mint and spices.', 'Haldiram''s', 'c0000000-0000-0000-0000-000000000001', 140.00, 115.00, false, '400g', 'Pouch', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=80'),
('b0000000-0000-0000-0000-000000000003', 'CHO-001', 'Cadbury Dairy Milk Silk Chocolate', 'cadbury-dairy-milk-silk-150g', 'Rich, smooth and creamy chocolate bar that melts in your mouth.', 'Cadbury', 'c0000000-0000-0000-0000-000000000002', 175.00, 150.00, false, '150g', 'Bar', 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&auto=format&fit=crop&q=80'),
('b0000000-0000-0000-0000-000000000004', 'CHO-002', 'Ferrero Rocher Premium Pralines', 'ferrero-rocher-16-pieces', 'Whole crunchy hazelnut enveloped in delicious creamy chocolate cream and crispy wafer.', 'Ferrero', 'c0000000-0000-0000-0000-000000000002', 599.00, 499.00, false, '200g', '16 Pieces Box', 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=500&auto=format&fit=crop&q=80'),
('b0000000-0000-0000-0000-000000000005', 'GRO-001', 'Aashirvaad Shudh Chakki Atta', 'aashirvaad-shudh-chakki-atta-10kg', '100% pure whole wheat grain flour ensuring softer and nutrient-rich rotis.', 'Aashirvaad', 'c0000000-0000-0000-0000-000000000003', 495.00, 420.00, false, '10kg', 'Eco Bag', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80'),
('b0000000-0000-0000-0000-000000000006', 'GRO-002', 'Fortune Sunlite Refined Sunflower Oil', 'fortune-sunlite-sunflower-oil-5l', 'Light, healthy and cholesterol-friendly cooking oil enriched with Vitamins A & D.', 'Fortune', 'c0000000-0000-0000-0000-000000000003', 750.00, 640.00, false, '5L', 'Can', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80'),
('b0000000-0000-0000-0000-000000000007', 'PER-001', 'Head & Shoulders Cool Menthol Shampoo', 'head-and-shoulders-cool-menthol-650ml', 'Clinically proven up to 100% dandruff-free hair with invigorating menthol sensation.', 'Head & Shoulders', 'c0000000-0000-0000-0000-000000000004', 550.00, 439.00, false, '650ml', 'Pump Bottle', 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&auto=format&fit=crop&q=80'),
('b0000000-0000-0000-0000-000000000008', 'PER-002', 'Colgate Strong Teeth Dental Cream', 'colgate-strong-teeth-toothpaste-500g', 'Amino Shakti formula adds natural calcium to your teeth, strengthening them from within.', 'Colgate', 'c0000000-0000-0000-0000-000000000004', 280.00, 220.00, false, '500g', 'Saver Pack', 'https://images.unsplash.com/photo-1559567244-493717b2def8?w=500&auto=format&fit=crop&q=80'),
('b0000000-0000-0000-0000-000000000009', 'HOU-001', 'Surf Excel Matic Front Load Detergent', 'surf-excel-matic-front-load-4kg', 'Tough stain removal in washing machines with zero residue and vibrant freshness.', 'Surf Excel', 'c0000000-0000-0000-0000-000000000005', 580.00, 495.00, false, '4kg', 'Carton', 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500&auto=format&fit=crop&q=80'),
('b0000000-0000-0000-0000-000000000010', 'HOU-002', 'Vim Lemon Dishwash Liquid Gel', 'vim-dishwash-gel-2l', 'Power of 100 lemons packed in every drop. Leaves utensils sparkling clean and grease-free.', 'Vim', 'c0000000-0000-0000-0000-000000000005', 450.00, 375.00, false, '2L', 'Refill Pouch', 'https://images.unsplash.com/photo-1585837575652-267c041d77d4?w=500&auto=format&fit=crop&q=80'),

-- Floor 2 Clothing
('b0000000-0000-0000-0000-000000000011', 'APP-001', 'FabIndia Pure Cotton Straight Kurta', 'fabindia-cotton-straight-kurta', 'Handcrafted pure breathable cotton straight-cut ethnic kurta with elegant side slits.', 'FabIndia', 'c0000000-0000-0000-0000-000000000006', 1999.00, 1499.00, true, 'Regular Fit', 'Piece', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop&q=80'),
('b0000000-0000-0000-0000-000000000012', 'APP-002', 'Kanjivaram Art Silk Traditional Saree', 'kanjivaram-art-silk-saree-red', 'Opulent woven jacquard gold zari border art silk saree with unstitched matching blouse piece.', 'Nalli', 'c0000000-0000-0000-0000-000000000007', 3999.00, 2499.00, false, '6.2m', 'Piece', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80'),
('b0000000-0000-0000-0000-000000000013', 'APP-003', 'Vero Moda Women Floral Tiered Midi Dress', 'vero-moda-floral-midi-dress', 'Chic Parisian floral printed chiffon dress with square neckline and flared hem.', 'Vero Moda', 'c0000000-0000-0000-0000-000000000008', 2799.00, 1899.00, true, 'A-Line Fit', 'Piece', 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop&q=80'),
('b0000000-0000-0000-0000-000000000014', 'APP-004', 'Peter England Men Slim Fit Formal Shirt', 'peter-england-formal-shirt-white', 'Crisp poly-cotton wrinkle-resistant formal shirt tailored for comfortable executive wear.', 'Peter England', 'c0000000-0000-0000-0000-000000000009', 1499.00, 999.00, true, 'Slim Fit', 'Piece', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=80'),
('b0000000-0000-0000-0000-000000000015', 'APP-005', 'US Polo Assn Men Solid Pique Polo T-Shirt', 'us-polo-assn-pique-polo', 'Authentic breathable cotton pique polo with signature embroidered crest and ribbed collar.', 'U.S. Polo Assn.', 'c0000000-0000-0000-0000-000000000010', 1899.00, 1199.00, true, 'Classic Fit', 'Piece', 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&auto=format&fit=crop&q=80'),
('b0000000-0000-0000-0000-000000000016', 'APP-006', 'Levi''s 511 Slim Fit Stretchable Denim Jeans', 'levis-511-slim-fit-jeans', 'Modern slim cut with room to move. Premium dark indigo wash with built-in stretch.', 'Levi''s', 'c0000000-0000-0000-0000-000000000011', 3499.00, 2199.00, true, 'Stretch Denim', 'Piece', 'https://images.unsplash.com/photo-1542272604-780c96856592?w=500&auto=format&fit=crop&q=80')
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price = EXCLUDED.price,
  discount_price = EXCLUDED.discount_price,
  has_variants = EXCLUDED.has_variants;

-- ── PRODUCT VARIANTS ─────────────────────────────────────────
INSERT INTO product_variants (id, product_id, size, color, color_hex, sku_suffix, price_override, active) VALUES
-- FabIndia Kurta
('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000011', 'S', 'Royal Navy', '#1e3a8a', '-S', 1499.00, true),
('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000011', 'M', 'Royal Navy', '#1e3a8a', '-M', 1499.00, true),
('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000011', 'L', 'Royal Navy', '#1e3a8a', '-L', 1499.00, true),

-- Vero Moda Dress
('e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000013', 'S', 'Coral Blush', '#fb7185', '-S', 1899.00, true),
('e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000013', 'M', 'Coral Blush', '#fb7185', '-M', 1899.00, true),

-- Peter England Shirt
('e0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000014', '39 (M)', 'Crisp White', '#ffffff', '-39', 999.00, true),
('e0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000014', '40 (L)', 'Crisp White', '#ffffff', '-40', 999.00, true),

-- US Polo T-Shirt
('e0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000015', 'M', 'Forest Green', '#15803d', '-M', 1199.00, true),
('e0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000015', 'L', 'Forest Green', '#15803d', '-L', 1199.00, true),

-- Levi's Jeans
('e0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000016', '32W x 32L', 'Dark Indigo', '#1e3a8a', '-32', 2199.00, true),
('e0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000016', '34W x 32L', 'Dark Indigo', '#1e3a8a', '-34', 2199.00, true)
ON CONFLICT (product_id, sku_suffix) DO NOTHING;

-- ── INVENTORY ────────────────────────────────────────────────
-- Floor 1 standard products
INSERT INTO inventory (id, product_id, variant_id, stock_quantity, low_stock_threshold) VALUES
('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', NULL, 120, 10),
('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', NULL, 85, 10),
('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', NULL, 150, 15),
('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', NULL, 45, 5),
('d0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', NULL, 90, 10),
('d0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', NULL, 70, 8),
('d0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000007', NULL, 60, 5),
('d0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000008', NULL, 110, 15),
('d0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000009', NULL, 50, 5),
('d0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000010', NULL, 65, 8),
('d0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000012', NULL, 30, 5),

-- Clothing Variants Inventory
('d0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-000000000001', 15, 3),
('d0000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-000000000002', 20, 3),
('d0000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-000000000003', 15, 3),

('d0000000-0000-0000-0000-000000000016', 'b0000000-0000-0000-0000-000000000013', 'e0000000-0000-0000-0000-000000000004', 10, 2),
('d0000000-0000-0000-0000-000000000017', 'b0000000-0000-0000-0000-000000000013', 'e0000000-0000-0000-0000-000000000005', 15, 2),

('d0000000-0000-0000-0000-000000000018', 'b0000000-0000-0000-0000-000000000014', 'e0000000-0000-0000-0000-000000000006', 15, 3),
('d0000000-0000-0000-0000-000000000019', 'b0000000-0000-0000-0000-000000000014', 'e0000000-0000-0000-0000-000000000007', 20, 3),

('d0000000-0000-0000-0000-000000000020', 'b0000000-0000-0000-0000-000000000015', 'e0000000-0000-0000-0000-000000000008', 20, 4),
('d0000000-0000-0000-0000-000000000021', 'b0000000-0000-0000-0000-000000000015', 'e0000000-0000-0000-0000-000000000009', 15, 4),

('d0000000-0000-0000-0000-000000000022', 'b0000000-0000-0000-0000-000000000016', 'e0000000-0000-0000-0000-000000000010', 15, 3),
('d0000000-0000-0000-0000-000000000023', 'b0000000-0000-0000-0000-000000000016', 'e0000000-0000-0000-0000-000000000011', 20, 3)
ON CONFLICT (product_id, variant_id) DO NOTHING;

-- ── 3D PRODUCT PLACEMENTS ────────────────────────────────────
-- Exactly matched to the 3D coordinates in SupermarketScene
INSERT INTO product_placements (id, product_id, floor_id, aisle_id, shelf_side, shelf_level, position_index, display_type, world_x, world_y, world_z, rotation_y, color, model_type) VALUES
-- Floor 1: Aisle 1 (Snacks)
('ba000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'LEFT', 2, 1, 'BOX', -10.80, 1.50, -6.00, 1.5708, '#f59e0b', 'box'),
('ba000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'RIGHT', 2, 1, 'PACKET', -9.20, 1.50, 4.00, -1.5708, '#f97316', 'bag'),

-- Floor 1: Aisle 2 (Sweets)
('ba000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'LEFT', 2, 1, 'BOX', -5.80, 1.50, -4.00, 1.5708, '#4c1d95', 'box'),
('ba000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'RIGHT', 2, 1, 'BOX', -4.20, 1.50, 6.00, -1.5708, '#eab308', 'box'),

-- Floor 1: Aisle 3 (Groceries)
('ba000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'LEFT', 1, 1, 'BAG', -0.80, 0.70, -2.00, 1.5708, '#d97706', 'bag'),
('ba000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'RIGHT', 1, 1, 'BOTTLE', 0.80, 0.70, 4.00, -1.5708, '#ca8a04', 'bottle'),

-- Floor 1: Aisle 4 (Personal Care)
('ba000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'LEFT', 2, 1, 'BOTTLE', 4.20, 1.50, -5.00, 1.5708, '#0284c7', 'bottle'),
('ba000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'RIGHT', 2, 1, 'BOX', 5.80, 1.50, 3.00, -1.5708, '#dc2626', 'box'),

-- Floor 1: Aisle 5 (Household)
('ba000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000009', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 'LEFT', 1, 1, 'BAG', 9.20, 0.70, -4.00, 1.5708, '#2563eb', 'bag'),
('ba000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000010', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 'RIGHT', 2, 1, 'BOTTLE', 10.80, 1.50, 4.00, -1.5708, '#eab308', 'bottle'),

-- Floor 2: 3 Women's Apparel Aisles (Rows 6, 7, 8)
('ba000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000011', 'f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000006', 'LEFT', 2, 1, 'SHIRT', -11.80, 6.50, -4.00, 1.5708, '#db2777', 'shirt'),
('ba000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000012', 'f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000007', 'LEFT', 2, 1, 'BAG', -7.30, 6.50, -2.00, 1.5708, '#b91c1c', 'bag'),
('ba000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000013', 'f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000008', 'RIGHT', 2, 1, 'HANGER', -1.20, 6.50, 4.00, -1.5708, '#f43f5e', 'hanger'),

-- Floor 2: 3 Men's Apparel Aisles (Rows 9, 10, 11)
('ba000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000014', 'f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000009', 'LEFT', 2, 1, 'SHIRT', 1.70, 6.50, -4.00, 1.5708, '#f8fafc', 'shirt'),
('ba000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000015', 'f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000010', 'RIGHT', 2, 1, 'SHIRT', 7.80, 6.50, 2.00, -1.5708, '#15803d', 'shirt'),
('ba000000-0000-0000-0000-000000000016', 'b0000000-0000-0000-0000-000000000016', 'f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000011', 'LEFT', 2, 1, 'HANGER', 10.70, 6.50, -4.00, 1.5708, '#1d4ed8', 'hanger')
ON CONFLICT DO NOTHING;
