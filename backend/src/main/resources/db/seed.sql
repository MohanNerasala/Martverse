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
('c0000000-0000-0000-0000-000000000005', 'Household & Cleaning Products', 'Detergents, dishwash gels, and floor cleaners', 1, 5)
ON CONFLICT DO NOTHING;

-- ── AISLES ───────────────────────────────────────────────────
-- Floor 1: 5 Aisles at X = -10, -5, 0, 5, 10
INSERT INTO supermarket_aisles (id, floor_id, aisle_number, name, category_id, position_x, position_z, start_x, start_z, end_x, end_z, shelf_height, shelf_tiers, color_code, banner_text) VALUES
('a0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 1, 'Snacks & Biscuits', 'c0000000-0000-0000-0000-000000000001', -10.00, 0, -10.00, -12.00, -10.00, 12.00, 2.80, 3, '#f59e0b', 'AISLE 1 • SNACKS & BISCUITS • BEST SAVINGS'),
('a0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 2, 'Sweets & Confectionery', 'c0000000-0000-0000-0000-000000000002', -5.00, 0, -5.00, -12.00, -5.00, 12.00, 2.80, 3, '#ec4899', 'AISLE 2 • SWEETS & CHOCOLATES • FESTIVE DELIGHT'),
('a0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', 3, 'Groceries & Staples', 'c0000000-0000-0000-0000-000000000003', 0.00, 0, 0.00, -12.00, 0.00, 12.00, 2.80, 3, '#10b981', 'AISLE 3 • ATTA, RICE, OILS & SPICES • DMART BACHAT'),
('a0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000001', 4, 'Personal Care & Toiletries', 'c0000000-0000-0000-0000-000000000004', 5.00, 0, 5.00, -12.00, 5.00, 12.00, 2.80, 3, '#06b6d4', 'AISLE 4 • SKINCARE, SHAMPOO & DENTAL CARE'),
('a0000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000001', 5, 'Household & Cleaning Products', 'c0000000-0000-0000-0000-000000000005', 10.00, 0, 10.00, -12.00, 10.00, 12.00, 2.80, 3, '#8b5cf6', 'AISLE 5 • DETERGENTS & HOME CLEANING')
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
-- Floor 1: Aisle 1 (Snacks & Biscuits)
('b0000000-0000-0000-0000-000000000001', 'SNK-001', 'Parle-G Original Glucose Biscuits', 'parle-g-glucose-biscuits-800g', 'India''s beloved tea companion made with nourishing wheat and milk goodness.', 'Parle', 'c0000000-0000-0000-0000-000000000001', 90.00, 75.00, false, '800g', 'Family Pack', '/products/snacks/parle-g-biscuits.svg'),
('b0000000-0000-0000-0000-000000000002', 'SNK-002', 'Haldiram''s Nagpur Aloo Bhujia', 'haldirams-nagpur-aloo-bhujia-400g', 'Crispy, spicy potato-gram flour crunchies seasoned with authentic mint and spices.', 'Haldiram''s', 'c0000000-0000-0000-0000-000000000001', 140.00, 115.00, false, '400g', 'Pouch', '/products/snacks/haldirams-aloo-bhujia.svg'),
('b0000000-0000-0000-0000-000000000017', 'SNK-003', 'Lay''s India''s Magic Masala Potato Chips', 'lays-indias-magic-masala-115g', 'Spicy, flavorful ribbed potato chips tossed in signature Indian spices.', 'Lay''s', 'c0000000-0000-0000-0000-000000000001', 60.00, 50.00, false, '115g', 'Party Pack', '/products/snacks/lays-magic-masala.svg'),
('b0000000-0000-0000-0000-000000000018', 'SNK-004', 'Britannia Good Day Cashew Cookies', 'britannia-good-day-cashew-200g', 'Rich buttery cookies studded with crunchy roasted cashew nuts.', 'Britannia', 'c0000000-0000-0000-0000-000000000001', 55.00, 45.00, false, '200g', 'Saver Pack', '/products/snacks/britannia-good-day.svg'),
('b0000000-0000-0000-0000-000000000019', 'SNK-005', 'Kurkure Masala Munch Crunchy Snacks', 'kurkure-masala-munch-160g', 'Irresistibly spicy corn-rice puffs bursting with chatpata Indian masala flavor.', 'Kurkure', 'c0000000-0000-0000-0000-000000000001', 50.00, 40.00, false, '160g', 'Pouch', '/products/snacks/kurkure-masala-munch.svg'),

-- Floor 1: Aisle 2 (Sweets & Confectionery)
('b0000000-0000-0000-0000-000000000003', 'CHO-001', 'Cadbury Dairy Milk', 'cadbury-dairy-milk-chocolate', 'Classic rich, smooth and creamy Cadbury milk chocolate bar that melts in your mouth with pure joy.', 'Cadbury', 'c0000000-0000-0000-0000-000000000002', 45.00, 40.00, false, '50g', 'Bar', '/products/sweets/DairyMilk.png'),
('b0000000-0000-0000-0000-000000000004', 'CHO-002', 'Cadbury Dairy Milk Silk Chocolate', 'cadbury-dairy-milk-silk', 'Pure melt-in-the-mouth smoother, silkier chocolate indulgence.', 'Cadbury', 'c0000000-0000-0000-0000-000000000002', 95.00, 80.00, false, '60g', 'Bar', '/products/sweets/DairyMilk.png'),
('b0000000-0000-0000-0000-000000000020', 'CHO-003', 'Cadbury Dairy Milk Roast Almond', 'cadbury-dairy-milk-roast-almond', 'Whole crunchy roasted almonds blended with creamy Cadbury milk chocolate.', 'Cadbury', 'c0000000-0000-0000-0000-000000000002', 105.00, 90.00, false, '55g', 'Bar', '/products/sweets/DairyMilk.png'),
('b0000000-0000-0000-0000-000000000021', 'CHO-004', 'Cadbury Dairy Milk Fruit & Nut', 'cadbury-dairy-milk-fruit-nut', 'Delicious Cadbury milk chocolate studded with plump raisins and crunchy almonds.', 'Cadbury', 'c0000000-0000-0000-0000-000000000002', 100.00, 85.00, false, '55g', 'Bar', '/products/sweets/DairyMilk.png'),
('b0000000-0000-0000-0000-000000000022', 'CHO-005', 'Cadbury Dairy Milk Family Pack', 'cadbury-dairy-milk-family-pack', 'Large sharing pack of delicious creamy Cadbury milk chocolate.', 'Cadbury', 'c0000000-0000-0000-0000-000000000002', 175.00, 150.00, false, '130g', 'Family Bar', '/products/sweets/DairyMilk.png'),

-- Floor 1: Aisle 3 (Groceries & Staples)
('b0000000-0000-0000-0000-000000000005', 'GRO-001', 'Aashirvaad Shudh Chakki Atta', 'aashirvaad-shudh-chakki-atta-10kg', '100% pure whole wheat grain flour ensuring softer and nutrient-rich rotis.', 'Aashirvaad', 'c0000000-0000-0000-0000-000000000003', 495.00, 420.00, false, '10kg', 'Eco Bag', '/products/groceries/aashirvaad-shudh-chakki-atta.svg'),
('b0000000-0000-0000-0000-000000000006', 'GRO-002', 'Fortune Sunlite Refined Sunflower Oil', 'fortune-sunlite-sunflower-oil-5l', 'Light, healthy and cholesterol-friendly cooking oil enriched with Vitamins A & D.', 'Fortune', 'c0000000-0000-0000-0000-000000000003', 750.00, 640.00, false, '5L', 'Can', '/products/groceries/fortune-sunflower-oil.svg'),
('b0000000-0000-0000-0000-000000000023', 'GRO-003', 'India Gate Classic Basmati Rice Aged 2 Years', 'india-gate-classic-basmati-rice-5kg', 'Exotic long grain aromatic basmati rice aged to perfection for biryanis and pulao.', 'India Gate', 'c0000000-0000-0000-0000-000000000003', 695.00, 575.00, false, '5kg', 'Eco Bag', '/products/groceries/india-gate-basmati-rice.svg'),
('b0000000-0000-0000-0000-000000000024', 'GRO-004', 'Tata Salt Vacuum Evaporated Pure Iodized Salt', 'tata-salt-iodized-1kg', 'Desh Ka Namak. Purity tested vacuum evaporated iodized table salt for mental development.', 'Tata', 'c0000000-0000-0000-0000-000000000003', 32.00, 28.00, false, '1kg', 'Packet', '/products/groceries/tata-salt.svg'),
('b0000000-0000-0000-0000-000000000025', 'GRO-005', 'Maggi 2-Minute Masala Instant Noodles', 'maggi-2-minute-masala-noodles-12-pack', 'India''s favorite noodle with goodness of iron and signature blend of 10 roasted spices.', 'Nestle Maggi', 'c0000000-0000-0000-0000-000000000003', 168.00, 144.00, false, '840g', '12-Pack Family Saver', '/products/groceries/maggi-2-minute-noodles.svg'),

-- Floor 1: Aisle 4 (Personal Care & Toiletries)
('b0000000-0000-0000-0000-000000000007', 'PER-001', 'Dettol Original Germ Protection Bathing Soap', 'dettol-original-soap-pack-of-5', 'Trusted 99.9% germ protection with pine fragrance and moisturizing glycerine formula.', 'Dettol', 'c0000000-0000-0000-0000-000000000004', 235.00, 195.00, false, '625g', 'Pack of 5', '/products/personal-care/dettol-bathing-soap.svg'),
('b0000000-0000-0000-0000-000000000008', 'PER-002', 'Head & Shoulders Cool Menthol Anti-Dandruff Shampoo', 'head-and-shoulders-cool-menthol-650ml', 'Clinically proven up to 100% dandruff-free hair with invigorating menthol sensation.', 'Head & Shoulders', 'c0000000-0000-0000-0000-000000000004', 550.00, 439.00, false, '650ml', 'Pump Bottle', '/products/personal-care/head-and-shoulders-shampoo.svg'),
('b0000000-0000-0000-0000-000000000026', 'PER-003', 'Colgate Strong Teeth Calcium Dental Cream', 'colgate-strong-teeth-toothpaste-500g', 'Amino Shakti formula adds natural calcium to teeth, making them 2X stronger.', 'Colgate', 'c0000000-0000-0000-0000-000000000004', 280.00, 220.00, false, '500g', 'Twin Saver Pack', '/products/personal-care/colgate-strong-teeth.svg'),
('b0000000-0000-0000-0000-000000000027', 'PER-004', 'Dove Deep Moisture Nourishing Body Wash', 'dove-deep-moisture-body-wash-800ml', 'Instant soft skin with NutriumMoisture formula that nourishes deep into the surface layers.', 'Dove', 'c0000000-0000-0000-0000-000000000004', 450.00, 380.00, false, '800ml', 'Bottle', '/products/personal-care/dove-deep-moisture-body-wash.svg'),
('b0000000-0000-0000-0000-000000000028', 'PER-005', 'Nivea Soft Light Moisturizing Cream', 'nivea-soft-light-cream-300ml', 'Refreshing light formula with Jojoba Oil and Vitamin E for face, hands and body.', 'Nivea', 'c0000000-0000-0000-0000-000000000004', 375.00, 299.00, false, '300ml', 'Tub', '/products/personal-care/nivea-soft-cream.svg'),

-- Floor 1: Aisle 5 (Household & Cleaning Products)
('b0000000-0000-0000-0000-000000000009', 'HOU-001', 'Surf Excel Matic Front Load Detergent Powder', 'surf-excel-matic-front-load-4kg', 'Tough stain removal in washing machines with zero residue and vibrant freshness.', 'Surf Excel', 'c0000000-0000-0000-0000-000000000005', 580.00, 495.00, false, '4kg', 'Value Box', '/products/household/surf-excel-matic-powder.svg'),
('b0000000-0000-0000-0000-000000000010', 'HOU-002', 'Vim Lemon Concentrated Dishwash Liquid Gel', 'vim-dishwash-gel-2l', 'Power of 100 lemons packed in every drop. Leaves utensils sparkling clean and grease-free.', 'Vim', 'c0000000-0000-0000-0000-000000000005', 450.00, 375.00, false, '2L', 'Family Can', '/products/household/vim-dishwash-gel.svg'),
('b0000000-0000-0000-0000-000000000029', 'HOU-003', 'Harpic Power Plus 10X Disinfectant Toilet Cleaner', 'harpic-power-plus-1l-twin-pack', '10X better than bleach at eliminating stains, limescale, and 99.9% germs.', 'Harpic', 'c0000000-0000-0000-0000-000000000005', 220.00, 185.00, false, '2L', '1L Twin Value Pack', '/products/household/harpic-toilet-cleaner.svg'),
('b0000000-0000-0000-0000-000000000030', 'HOU-004', 'Lizol 10X Surface Disinfectant Floor Cleaner Citrus', 'lizol-disinfectant-floor-cleaner-2l', 'Kills 99.9% germs and viruses while leaving homes smelling like fresh zesty lemons.', 'Lizol', 'c0000000-0000-0000-0000-000000000005', 399.00, 340.00, false, '2L', 'Economy Jug', '/products/household/lizol-floor-cleaner.svg'),
('b0000000-0000-0000-0000-000000000031', 'HOU-005', 'Colin Ultra Advanced Glass & Multi-Surface Cleaner', 'colin-glass-cleaner-500ml', 'Shine boosters provide 2X more shine on glass tables, mirrors, and car windows without streaks.', 'Colin', 'c0000000-0000-0000-0000-000000000005', 130.00, 110.00, false, '500ml', 'Trigger Spray', '/products/household/colin-surface-cleaner.svg'),

-- Floor 1: Fresh Harvest / Additional Snacks
('b0000000-0000-0000-0000-000000000032', 'SNK-006', 'Doritos Nacho Cheese Tortilla Chips', 'doritos-nacho-cheese-150g', 'Crunchy triangles packed with bold, fiery cheesy nacho flavor.', 'Doritos', 'c0000000-0000-0000-0000-000000000001', 75.00, 60.00, false, '150g', 'Pouch', '/products/snacks/doritos-nacho-cheese.svg'),
('b0000000-0000-0000-0000-000000000033', 'SNK-007', 'Lay''s Classic Salted Potato Chips', 'lays-classic-salted-115g', 'Golden crispy sliced farm-grown potatoes simply seasoned with a touch of pure salt.', 'Lay''s', 'c0000000-0000-0000-0000-000000000001', 60.00, 50.00, false, '115g', 'Party Pack', '/products/snacks/lays-classic-salted.svg')
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price = EXCLUDED.price,
  discount_price = EXCLUDED.discount_price,
  has_variants = EXCLUDED.has_variants,
  image_url = EXCLUDED.image_url;

-- ── PRODUCT VARIANTS ─────────────────────────────────────────
-- (Floor 2 variants removed - to be added later by user)

-- ── INVENTORY ────────────────────────────────────────────────
-- Floor 1 standard products (All 27 products)
INSERT INTO inventory (id, product_id, variant_id, stock_quantity, low_stock_threshold) VALUES
('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', NULL, 120, 10),
('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', NULL, 85, 10),
('d0000000-0000-0000-0000-000000000024', 'b0000000-0000-0000-0000-000000000017', NULL, 150, 15),
('d0000000-0000-0000-0000-000000000025', 'b0000000-0000-0000-0000-000000000018', NULL, 95, 10),
('d0000000-0000-0000-0000-000000000026', 'b0000000-0000-0000-0000-000000000019', NULL, 110, 15),

('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', NULL, 95, 10),
('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', NULL, 70, 8),
('d0000000-0000-0000-0000-000000000027', 'b0000000-0000-0000-0000-000000000020', NULL, 65, 8),
('d0000000-0000-0000-0000-000000000028', 'b0000000-0000-0000-0000-000000000021', NULL, 50, 5),
('d0000000-0000-0000-0000-000000000029', 'b0000000-0000-0000-0000-000000000022', NULL, 120, 15),

('d0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', NULL, 80, 10),
('d0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', NULL, 110, 15),
('d0000000-0000-0000-0000-000000000030', 'b0000000-0000-0000-0000-000000000023', NULL, 70, 8),
('d0000000-0000-0000-0000-000000000031', 'b0000000-0000-0000-0000-000000000024', NULL, 200, 20),
('d0000000-0000-0000-0000-000000000032', 'b0000000-0000-0000-0000-000000000025', NULL, 140, 15),

('d0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000007', NULL, 100, 12),
('d0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000008', NULL, 75, 8),
('d0000000-0000-0000-0000-000000000033', 'b0000000-0000-0000-0000-000000000026', NULL, 90, 10),
('d0000000-0000-0000-0000-000000000034', 'b0000000-0000-0000-0000-000000000027', NULL, 65, 8),
('d0000000-0000-0000-0000-000000000035', 'b0000000-0000-0000-0000-000000000028', NULL, 80, 10),

('d0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000009', NULL, 90, 10),
('d0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000010', NULL, 65, 8),
('d0000000-0000-0000-0000-000000000036', 'b0000000-0000-0000-0000-000000000029', NULL, 110, 12),
('d0000000-0000-0000-0000-000000000037', 'b0000000-0000-0000-0000-000000000030', NULL, 75, 8),
('d0000000-0000-0000-0000-000000000038', 'b0000000-0000-0000-0000-000000000031', NULL, 95, 10),

('d0000000-0000-0000-0000-000000000039', 'b0000000-0000-0000-0000-000000000032', NULL, 50, 5),
('d0000000-0000-0000-0000-000000000040', 'b0000000-0000-0000-0000-000000000033', NULL, 80, 8)
ON CONFLICT (product_id, variant_id) DO NOTHING;

-- ── 3D PRODUCT PLACEMENTS ────────────────────────────────────
-- Exactly matched to the 3D coordinates in SupermarketScene & mockData
INSERT INTO product_placements (id, product_id, floor_id, aisle_id, shelf_side, shelf_level, position_index, display_type, world_x, world_y, world_z, rotation_y, color, model_type) VALUES
-- Floor 1: Aisle 1 (Snacks & Biscuits) - 6 Blocks (-10, -6, -2, 2, 6, 10)
('ba000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'LEFT', 2, 1, 'BOX', -10.80, 1.50, -10.00, 1.5708, '#f59e0b', 'box'),
('ba000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'RIGHT', 2, 1, 'PACKET', -9.20, 1.50, -6.00, -1.5708, '#f97316', 'bag'),
('ba000000-0000-0000-0000-000000000017', 'b0000000-0000-0000-0000-000000000017', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'LEFT', 2, 2, 'PACKET', -10.80, 1.50, -2.00, 1.5708, '#0284c7', 'bag'),
('ba000000-0000-0000-0000-000000000018', 'b0000000-0000-0000-0000-000000000018', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'RIGHT', 2, 2, 'BOX', -9.20, 1.50, 2.00, -1.5708, '#eab308', 'box'),
('ba000000-0000-0000-0000-000000000019', 'b0000000-0000-0000-0000-000000000019', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'LEFT', 2, 3, 'PACKET', -10.80, 1.50, 6.00, 1.5708, '#ea580c', 'bag'),

-- Floor 1: Aisle 2 (Sweets & Confectionery) - 6 Blocks (-10, -6, -2, 2, 6, 10)
('ba000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'LEFT', 2, 1, 'CHOCOLATE', -5.80, 1.32, -10.00, -1.5708, '#28074d', 'chocolate'),
('ba000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'RIGHT', 2, 1, 'CHOCOLATE', -4.20, 1.32, -6.00, 1.5708, '#28074d', 'chocolate'),
('ba000000-0000-0000-0000-000000000020', 'b0000000-0000-0000-0000-000000000020', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'LEFT', 2, 2, 'CHOCOLATE', -5.80, 1.32, -2.00, -1.5708, '#28074d', 'chocolate'),
('ba000000-0000-0000-0000-000000000021', 'b0000000-0000-0000-0000-000000000021', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'RIGHT', 2, 2, 'CHOCOLATE', -4.20, 1.32, 2.00, 1.5708, '#28074d', 'chocolate'),
('ba000000-0000-0000-0000-000000000022', 'b0000000-0000-0000-0000-000000000022', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'LEFT', 2, 3, 'CHOCOLATE', -5.80, 1.32, 6.00, -1.5708, '#28074d', 'chocolate'),

-- Floor 1: Aisle 3 (Groceries & Staples) - 6 Blocks (-10, -6, -2, 2, 6, 10)
('ba000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'LEFT', 1, 1, 'BAG', -0.80, 0.70, -10.00, 1.5708, '#ea580c', 'bag'),
('ba000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'RIGHT', 1, 1, 'BOTTLE', 0.80, 0.70, -6.00, -1.5708, '#eab308', 'bottle'),
('ba000000-0000-0000-0000-000000000023', 'b0000000-0000-0000-0000-000000000023', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'LEFT', 1, 2, 'BAG', -0.80, 0.70, -2.00, 1.5708, '#047857', 'bag'),
('ba000000-0000-0000-0000-000000000024', 'b0000000-0000-0000-0000-000000000024', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'RIGHT', 2, 2, 'BAG', 0.80, 1.50, 2.00, -1.5708, '#2563eb', 'bag'),
('ba000000-0000-0000-0000-000000000025', 'b0000000-0000-0000-0000-000000000025', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'LEFT', 2, 3, 'BOX', -0.80, 1.50, 6.00, 1.5708, '#eab308', 'box'),

-- Floor 1: Aisle 4 (Personal Care & Toiletries) - 6 Blocks (-10, -6, -2, 2, 6, 10)
('ba000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'LEFT', 2, 1, 'BOX', 4.20, 1.50, -10.00, 1.5708, '#15803d', 'box'),
('ba000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'RIGHT', 2, 1, 'BOTTLE', 5.80, 1.50, -6.00, -1.5708, '#0284c7', 'bottle'),
('ba000000-0000-0000-0000-000000000026', 'b0000000-0000-0000-0000-000000000026', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'LEFT', 2, 2, 'BOX', 4.20, 1.50, -2.00, 1.5708, '#dc2626', 'box'),
('ba000000-0000-0000-0000-000000000027', 'b0000000-0000-0000-0000-000000000027', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'RIGHT', 2, 2, 'BOTTLE', 5.80, 1.50, 2.00, -1.5708, '#1e40af', 'bottle'),
('ba000000-0000-0000-0000-000000000028', 'b0000000-0000-0000-0000-000000000028', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'LEFT', 2, 3, 'BOX', 4.20, 1.50, 6.00, 1.5708, '#1d4ed8', 'box'),

-- Floor 1: Aisle 5 (Household & Cleaning) - 6 Blocks (-10, -6, -2, 2, 6, 10)
('ba000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000009', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 'LEFT', 1, 1, 'BOX', 9.20, 0.70, -10.00, 1.5708, '#2563eb', 'box'),
('ba000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000010', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 'RIGHT', 2, 1, 'BOTTLE', 10.80, 1.50, -6.00, -1.5708, '#eab308', 'bottle'),
('ba000000-0000-0000-0000-000000000029', 'b0000000-0000-0000-0000-000000000029', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 'LEFT', 2, 2, 'BOTTLE', 9.20, 1.50, -2.00, 1.5708, '#b91c1c', 'bottle'),
('ba000000-0000-0000-0000-000000000030', 'b0000000-0000-0000-0000-000000000030', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 'RIGHT', 1, 2, 'BOTTLE', 10.80, 0.70, 2.00, -1.5708, '#ea580c', 'bottle'),
('ba000000-0000-0000-0000-000000000031', 'b0000000-0000-0000-0000-000000000031', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 'LEFT', 2, 3, 'BOTTLE', 9.20, 1.50, 6.00, 1.5708, '#0284c7', 'bottle'),

-- Floor 1: Aisle 1 (Additional Real Snacks: Doritos & Lay's Classic Salted)
('ba000000-0000-0000-0000-000000000032', 'b0000000-0000-0000-0000-000000000032', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'LEFT', 2, 4, 'PACKET', -10.80, 1.50, -10.00, 1.5708, '#dc2626', 'bag'),
('ba000000-0000-0000-0000-000000000033', 'b0000000-0000-0000-0000-000000000033', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'RIGHT', 2, 4, 'PACKET', -9.20, 1.50, -10.00, -1.5708, '#ca8a04', 'bag')
ON CONFLICT DO NOTHING;
