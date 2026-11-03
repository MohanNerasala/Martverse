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
('f0000000-0000-0000-0000-000000000001', 1, 'Ground Floor: Groceries, Snacks & Essentials', 'Aisle rows covering snacks, sweets, daily groceries, personal care, and household cleaning products.', 0.00, 72.00, 72.00, 5.20),
('f0000000-0000-0000-0000-000000000002', 2, 'Upper Level', 'Upper supermarket level (future department expansion).', 5.20, 72.00, 72.00, 5.20)
ON CONFLICT (floor_number) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  height_offset = EXCLUDED.height_offset,
  length = EXCLUDED.length,
  width = EXCLUDED.width,
  height = EXCLUDED.height;

-- ── CATEGORIES ───────────────────────────────────────────────
INSERT INTO categories (id, name, description, floor_number, display_order) VALUES
('c0000000-0000-0000-0000-000000000001', 'Household & Cleaning Products', 'Detergents, dishwash gels, fabric softeners, and surface cleaners', 1, 1),
('c0000000-0000-0000-0000-000000000002', 'Personal Care & Beauty', 'Oral care, soaps, shampoos, conditioners, and skincare face washes', 1, 2),
('c0000000-0000-0000-0000-000000000003', 'Biscuits & Snacks', 'Crunchy namkeens, chips, crackers, and biscuits', 1, 3),
('c0000000-0000-0000-0000-000000000004', 'Tea & Coffee Essentials', 'Premium teas, instant coffees, green teas, and morning essentials', 1, 4),
('c0000000-0000-0000-0000-000000000005', 'Chocolates & Sweets', 'Premium chocolate bars, pralines, confectionery, and gifting sweets', 1, 5),
('c0000000-0000-0000-0000-000000000006', 'Flours, Rice, Dals & Pulses', 'Chakki wheat atta, aged basmati rice, organic dals, sugar, and iodized salt', 1, 6),
('c0000000-0000-0000-0000-000000000007', 'Cooking Oils, Spices & Instant Foods', 'Refined sunflower oil, mustard oil, blended spices, noodles, and pasta', 1, 7),
('c0000000-0000-0000-0000-000000000008', 'Soft Drinks, Juices & Packaged Water', 'Chilled carbonated sodas, natural fruit juices, energy drinks, and packaged water', 1, 8),
('c0000000-0000-0000-0000-000000000009', 'Snack Packs, Namkeen & Ready Bites', 'Traditional Indian namkeen, crispy potato wafers, tortilla chips, and bites', 1, 9),
('c0000000-0000-0000-0000-000000000010', 'Festive Gifting, Sweets & Dry Fruits', 'Traditional tin sweets, festive gift boxes, premium almonds, cashews, and raisins', 1, 10)
ON CONFLICT DO NOTHING;

-- ── AISLES ───────────────────────────────────────────────────
-- Floor 1: 10 Aisles across 72m footprint at X = [-24.3, -18.9, -13.5, -8.1, -2.7, 2.7, 8.1, 13.5, 18.9, 24.3], Length = 32m
INSERT INTO supermarket_aisles (id, floor_id, aisle_number, name, category_id, position_x, position_z, start_x, start_z, end_x, end_z, shelf_height, shelf_tiers, color_code, banner_text) VALUES
('a0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 1, 'Household & Cleaning', 'c0000000-0000-0000-0000-000000000001', -24.30, 0, -24.30, -16.00, -24.30, 16.00, 2.80, 4, '#8b5cf6', 'AISLE 1 • HOUSEHOLD & CLEANING • DETERGENTS, SURFACE CLEANERS & DISHWASH'),
('a0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 2, 'Personal Care & Beauty', 'c0000000-0000-0000-0000-000000000002', -18.90, 0, -18.90, -16.00, -18.90, 16.00, 2.80, 4, '#06b6d4', 'AISLE 2 • PERSONAL CARE & BEAUTY • SOAPS, SHAMPOO, ORAL CARE & FACE WASH'),
('a0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', 3, 'Biscuits & Snacks', 'c0000000-0000-0000-0000-000000000003', -13.50, 0, -13.50, -16.00, -13.50, 16.00, 2.80, 4, '#f59e0b', 'AISLE 3 • BISCUITS & SNACKS • COOKIES, CHIPS & CRACKERS'),
('a0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000001', 4, 'Tea & Coffee Essentials', 'c0000000-0000-0000-0000-000000000004', -8.10, 0, -8.10, -16.00, -8.10, 16.00, 2.80, 4, '#059669', 'AISLE 4 • TEA & COFFEE ESSENTIALS • PREMIUM TEA & INSTANT COFFEES'),
('a0000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000001', 5, 'Chocolates & Sweets', 'c0000000-0000-0000-0000-000000000005', -2.70, 0, -2.70, -16.00, -2.70, 16.00, 2.80, 4, '#7c3aed', 'AISLE 5 • CHOCOLATES & SWEETS • DAIRY MILK, CANDIES & DELIGHTS'),
('a0000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000001', 6, 'Flours, Rice, Dals & Pulses', 'c0000000-0000-0000-0000-000000000006', 2.70, 0, 2.70, -16.00, 2.70, 16.00, 2.80, 4, '#10b981', 'AISLE 6 • FLOURS, RICE & DALS • ATTA, BASMATI, PULSES, SUGAR & SALT'),
('a0000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000001', 7, 'Cooking Oils, Spices & Instant Foods', 'c0000000-0000-0000-0000-000000000007', 8.10, 0, 8.10, -16.00, 8.10, 16.00, 2.80, 4, '#f97316', 'AISLE 7 • COOKING OILS & SPICES • SUNFLOWER, MUSTARD OIL & MASALAS'),
('a0000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000001', 8, 'Soft Drinks, Juices & Packaged Water', 'c0000000-0000-0000-0000-000000000008', 13.50, 0, 13.50, -16.00, 13.50, 16.00, 2.80, 4, '#0284c7', 'AISLE 8 • BEVERAGES & COLD DRINKS • CHILLED SODAS, JUICES & WATER'),
('a0000000-0000-0000-0000-000000000009', 'f0000000-0000-0000-0000-000000000001', 9, 'Snack Packs, Namkeen & Ready Bites', 'c0000000-0000-0000-0000-000000000009', 18.90, 0, 18.90, -16.00, 18.90, 16.00, 2.80, 4, '#eab308', 'AISLE 9 • SNACK PACKS & NAMKEEN • BHUJIA, WAFER & CRISPY BITES'),
('a0000000-0000-0000-0000-000000000010', 'f0000000-0000-0000-0000-000000000001', 10, 'Festive Gifting, Sweets & Dry Fruits', 'c0000000-0000-0000-0000-000000000010', 24.30, 0, 24.30, -16.00, 24.30, 16.00, 2.80, 4, '#ec4899', 'AISLE 10 • FESTIVE GIFTS & DRY FRUITS • SWEETS & DRY FRUIT HAMPERS')
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

-- Floor 1: Aisle 2 (Tea, Coffee & Sweets)
('b0000000-0000-0000-0000-000000000003', 'TEA-001', 'Tata Tea Gold Pure Assam Leaf & Aroma Pearls', 'tata-tea-gold-assam-500g', 'Finest handpicked Assam tea leaves with gently rolled golden aroma balls for unmatched taste.', 'Tata Tea', 'c0000000-0000-0000-0000-000000000002', 440.00, 380.00, false, '500g', 'Bag', '/products/tea/tata-tea-gold.svg'),
('b0000000-0000-0000-0000-000000000004', 'TEA-002', 'Brooke Bond Red Label Natural Care Tea', 'brooke-bond-red-label-tea-500g', 'Infused with the Ayurvedic goodness of Tulsi, Ashwagandha, Mulethi, Ginger and Cardamom.', 'Brooke Bond', 'c0000000-0000-0000-0000-000000000002', 370.00, 320.00, false, '500g', 'Box', '/products/tea/brooke-bond-red-label.svg'),
('b0000000-0000-0000-0000-000000000020', 'TEA-003', 'Brooke Bond Taj Mahal Rich Golden Tea', 'brooke-bond-taj-mahal-tea-500g', 'Precious golden orange pekoe blend offering rare balance of strength and exquisite aroma. Wah Taj!', 'Brooke Bond Taj Mahal', 'c0000000-0000-0000-0000-000000000002', 525.00, 460.00, false, '500g', 'Royal Box', '/products/tea/taj-mahal-tea.svg'),
('b0000000-0000-0000-0000-000000000021', 'TEA-004', 'Twinings of London Pure Green Tea', 'twinings-pure-green-tea-100g', 'Delicately steamed oriental green tea leaves creating smooth, refreshing antioxidant brew.', 'Twinings', 'c0000000-0000-0000-0000-000000000002', 395.00, 340.00, false, '100g', '50 Bags', '/products/tea/twinings-pure-green-tea.svg'),
('b0000000-0000-0000-0000-000000000022', 'COF-001', 'Nescafe Classic 100% Pure Instant Coffee Jar', 'nescafe-classic-instant-coffee-200g', 'Signature roast Arabica and Robusta beans delivering unmistakable rich coffee aroma and taste.', 'Nescafe', 'c0000000-0000-0000-0000-000000000002', 560.00, 485.00, false, '200g', 'Glass Jar', '/products/tea/nescafe-classic-coffee.svg'),
('b0000000-0000-0000-0000-000000000034', 'COF-002', 'Bru Instant Coffee with Roasted Chicory', 'bru-instant-coffee-200g', 'Perfect blend of 70% selected coffee beans and 30% chicory for rich South Indian filter flavor.', 'Bru', 'c0000000-0000-0000-0000-000000000002', 450.00, 390.00, false, '200g', 'Pouch', '/products/tea/bru-instant-coffee.svg'),
('b0000000-0000-0000-0000-000000000035', 'CHO-001', 'Lindt Excellence 70% Cocoa Dark Chocolate Bar', 'lindt-excellence-70-percent-cocoa-100g', 'Expertly crafted intensely rich dark chocolate with balanced floral notes.', 'Lindt', 'c0000000-0000-0000-0000-000000000002', 330.00, 285.00, false, '100g', 'Bar', '/products/sweets/lindt-excellence-70.svg'),
('b0000000-0000-0000-0000-000000000036', 'CHO-002', 'Ferrero Rocher Hazelnut & Chocolate Pralines Box', 'ferrero-rocher-16-pieces-200g', 'Whole crunchy hazelnut in delicious creamy chocolate cream enclosed in crisp wafer sphere.', 'Ferrero Rocher', 'c0000000-0000-0000-0000-000000000002', 575.00, 495.00, false, '200g', '16 Pcs Box', '/products/sweets/ferrero-rocher.svg'),
('b0000000-0000-0000-0000-000000000037', 'CHO-003', 'Cadbury Dairy Milk Silk Pure Chocolate Bar', 'cadbury-dairy-milk-silk-60g', 'Pure melt-in-the-mouth smoother, silkier chocolate indulgence.', 'Cadbury', 'c0000000-0000-0000-0000-000000000002', 95.00, 80.00, false, '60g', 'Bar', '/products/sweets/cadbury-dairy-milk-silk.svg'),

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

-- Floor 1: Aisle 2 (Tea, Coffee & Sweets) - 6 Blocks (-10, -6, -2, 2, 6, 10)
('ba000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'LEFT', 3, 1, 'BOX', -5.80, 1.65, -10.00, -1.5708, '#171717', 'box'),
('ba000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'RIGHT', 3, 1, 'BOX', -4.20, 1.65, -6.00, 1.5708, '#dc2626', 'box'),
('ba000000-0000-0000-0000-000000000020', 'b0000000-0000-0000-0000-000000000020', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'LEFT', 3, 2, 'BOX', -5.80, 1.65, -2.00, -1.5708, '#1e3a8a', 'box'),
('ba000000-0000-0000-0000-000000000021', 'b0000000-0000-0000-0000-000000000021', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'RIGHT', 2, 2, 'BOX', -4.20, 1.05, 2.00, 1.5708, '#65a30d', 'box'),
('ba000000-0000-0000-0000-000000000022', 'b0000000-0000-0000-0000-000000000022', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'LEFT', 1, 3, 'BOTTLE', -5.80, 0.45, 6.00, -1.5708, '#991b1b', 'bottle'),

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


-- Merged Products from Catalogue
INSERT INTO products (id, sku, name, slug, description, brand, category_id, mrp, price, is_veg, unit, package_type, image_url) VALUES
('b0000000-0000-0000-0000-000000000018', 'SNK-004', 'Britannia Good Day Cashew Cookies', 'britannia-good-day-cashew-200g', 'Rich buttery cookies studded with crunchy roasted cashew nuts.', 'Britannia', 'c0000000-0000-0000-0000-000000000001', 55, 45, false, '200g', 'Saver Pack', '/products/snacks/britannia-good-day.svg'),
('b0000000-0000-0000-0000-000000000019', 'SNK-005', 'Kurkure Masala Munch Crunchy Snacks', 'kurkure-masala-munch-160g', 'Irresistibly spicy corn-rice puffs bursting with chatpata Indian masala flavor.', 'Kurkure', 'c0000000-0000-0000-0000-000000000001', 50, 40, false, '160g', 'Pouch', '/products/snacks/kurkure-masala-munch.svg'),
('b0000000-0000-0000-0000-000000000003', 'TEA-001', 'Tata Tea Gold Pure Assam Leaf & Aroma Pearls', 'tata-tea-gold-assam-500g', 'Finest handpicked Assam tea leaves with gently rolled golden aroma balls for unmatched taste.', 'Tata Tea', 'c0000000-0000-0000-0000-000000000002', 440, 380, false, '500g', 'Bag', '/products/tea/tata-tea-gold.svg'),
('b0000000-0000-0000-0000-000000000004', 'TEA-002', 'Brooke Bond Red Label Natural Care Tea', 'brooke-bond-red-label-tea-500g', 'Infused with the Ayurvedic goodness of Tulsi, Ashwagandha, Mulethi, Ginger and Cardamom.', 'Brooke Bond', 'c0000000-0000-0000-0000-000000000002', 370, 320, false, '500g', 'Box', '/products/tea/brooke-bond-red-label.svg'),
('b0000000-0000-0000-0000-000000000020', 'TEA-003', 'Brooke Bond Taj Mahal Rich Golden Tea', 'brooke-bond-taj-mahal-tea-500g', 'Precious golden orange pekoe blend offering rare balance of strength and exquisite aroma. Wah Taj!', 'Brooke Bond Taj Mahal', 'c0000000-0000-0000-0000-000000000002', 525, 460, false, '500g', 'Royal Box', '/products/tea/taj-mahal-tea.svg'),
('b0000000-0000-0000-0000-000000000021', 'TEA-004', 'Twinings of London Pure Green Tea', 'twinings-pure-green-tea-100g', 'Delicately steamed oriental green tea leaves creating smooth, refreshing antioxidant brew.', 'Twinings', 'c0000000-0000-0000-0000-000000000002', 395, 340, false, '100g', '50 Bags', '/products/tea/twinings-pure-green-tea.svg'),
('b0000000-0000-0000-0000-000000000022', 'COF-001', 'Nescafe Classic 100% Pure Instant Coffee Jar', 'nescafe-classic-instant-coffee-200g', 'Signature roast Arabica and Robusta beans delivering unmistakable rich coffee aroma and taste.', 'Nescafe', 'c0000000-0000-0000-0000-000000000002', 560, 485, false, '200g', 'Glass Jar', '/products/tea/nescafe-classic-coffee.svg'),
('b0000000-0000-0000-0000-000000000034', 'COF-002', 'Bru Instant Coffee with Roasted Chicory', 'bru-instant-coffee-200g', 'Perfect blend of 70% selected coffee beans and 30% chicory for rich South Indian filter flavor.', 'Bru', 'c0000000-0000-0000-0000-000000000002', 450, 390, false, '200g', 'Pouch', '/products/tea/bru-instant-coffee.svg'),
('b0000000-0000-0000-0000-000000000035', 'CHO-001', 'Lindt Excellence 70% Cocoa Dark Chocolate Bar', 'lindt-excellence-70-percent-cocoa-100g', 'Expertly crafted intensely rich dark chocolate with balanced floral notes.', 'Lindt', 'c0000000-0000-0000-0000-000000000002', 330, 285, false, '100g', 'Bar', '/products/sweets/lindt-excellence-70.svg'),
('b0000000-0000-0000-0000-000000000036', 'CHO-002', 'Ferrero Rocher Hazelnut & Chocolate Pralines Box', 'ferrero-rocher-16-pieces-200g', 'Whole crunchy hazelnut in delicious creamy chocolate cream enclosed in crisp wafer sphere.', 'Ferrero Rocher', 'c0000000-0000-0000-0000-000000000002', 575, 495, false, '200g', '16 Pcs Box', '/products/sweets/ferrero-rocher.svg'),
('b0000000-0000-0000-0000-000000000037', 'CHO-003', 'Cadbury Dairy Milk Silk Pure Chocolate Bar', 'cadbury-dairy-milk-silk-60g', 'Pure melt-in-the-mouth smoother, silkier chocolate indulgence.', 'Cadbury', 'c0000000-0000-0000-0000-000000000002', 95, 80, false, '60g', 'Bar', '/products/sweets/cadbury-dairy-milk-silk.svg'),
('b0000000-0000-0000-0000-000000000005', 'GRO-001', 'Aashirvaad Shudh Chakki Atta', 'aashirvaad-shudh-chakki-atta-10kg', '100% pure whole wheat grain flour ensuring softer and nutrient-rich rotis.', 'Aashirvaad', 'c0000000-0000-0000-0000-000000000003', 495, 420, false, '10kg', 'Eco Bag', '/products/groceries/aashirvaad-shudh-chakki-atta.svg'),
('b0000000-0000-0000-0000-000000000006', 'GRO-002', 'Fortune Sunlite Refined Sunflower Oil', 'fortune-sunlite-sunflower-oil-5l', 'Light, healthy and cholesterol-friendly cooking oil enriched with Vitamins A & D.', 'Fortune', 'c0000000-0000-0000-0000-000000000003', 750, 640, false, '5L', 'Can', '/products/groceries/fortune-sunflower-oil.svg'),
('b0000000-0000-0000-0000-000000000023', 'GRO-003', 'India Gate Classic Basmati Rice Aged 2 Years', 'india-gate-classic-basmati-rice-5kg', 'Exotic long grain aromatic basmati rice aged to perfection for biryanis and pulao.', 'India Gate', 'c0000000-0000-0000-0000-000000000003', 695, 575, false, '5kg', 'Eco Bag', '/products/groceries/india-gate-basmati-rice.svg'),
('b0000000-0000-0000-0000-000000000024', 'GRO-004', 'Tata Salt Vacuum Evaporated Pure Iodized Salt', 'tata-salt-iodized-1kg', 'Desh Ka Namak. Purity tested vacuum evaporated iodized table salt for mental development.', 'Tata', 'c0000000-0000-0000-0000-000000000003', 32, 28, false, '1kg', 'Packet', '/products/groceries/tata-salt.svg'),
('b0000000-0000-0000-0000-000000000007', 'PER-001', 'Dettol Original Germ Protection Bathing Soap', 'dettol-original-soap-pack-of-5', 'Trusted 99.9% germ protection with pine fragrance and moisturizing glycerine formula.', 'Dettol', 'c0000000-0000-0000-0000-000000000004', 235, 195, false, '625g', 'Pack of 5', '/products/personal-care/dettol-bathing-soap.svg'),
('b0000000-0000-0000-0000-000000000008', 'PER-002', 'Head & Shoulders Cool Menthol Anti-Dandruff Shampoo', 'head-and-shoulders-cool-menthol-650ml', 'Clinically proven up to 100% dandruff-free hair with invigorating menthol sensation.', 'Head & Shoulders', 'c0000000-0000-0000-0000-000000000004', 550, 439, false, '650ml', 'Pump Bottle', '/products/personal-care/head-and-shoulders-shampoo.svg'),
('b0000000-0000-0000-0000-000000000026', 'PER-003', 'Colgate Strong Teeth Calcium Dental Cream', 'colgate-strong-teeth-toothpaste-500g', 'Amino Shakti formula adds natural calcium to teeth, making them 2X stronger.', 'Colgate', 'c0000000-0000-0000-0000-000000000004', 280, 220, false, '500g', 'Twin Saver Pack', '/products/personal-care/colgate-strong-teeth.svg'),
('b0000000-0000-0000-0000-000000000027', 'PER-004', 'Dove Deep Moisture Nourishing Body Wash', 'dove-deep-moisture-body-wash-800ml', 'Instant soft skin with NutriumMoisture formula that nourishes deep into the surface layers.', 'Dove', 'c0000000-0000-0000-0000-000000000004', 450, 380, false, '800ml', 'Bottle', '/products/personal-care/dove-deep-moisture-body-wash.svg'),
('b0000000-0000-0000-0000-000000000028', 'PER-005', 'Nivea Soft Light Moisturizing Cream', 'nivea-soft-light-cream-300ml', 'Refreshing light formula with Jojoba Oil and Vitamin E for face, hands and body.', 'Nivea', 'c0000000-0000-0000-0000-000000000004', 375, 299, false, '300ml', 'Tub', '/products/personal-care/nivea-soft-cream.svg'),
('b0000000-0000-0000-0000-000000000009', 'HOU-001', 'Surf Excel Matic Front Load Detergent Powder', 'surf-excel-matic-front-load-4kg', 'Tough stain removal in washing machines with zero residue and vibrant freshness.', 'Surf Excel', 'c0000000-0000-0000-0000-000000000005', 580, 495, false, '4kg', 'Value Box', '/products/household/surf-excel-matic-powder.svg'),
('b0000000-0000-0000-0000-000000000010', 'HOU-002', 'Vim Lemon Concentrated Dishwash Liquid Gel', 'vim-dishwash-gel-2l', 'Power of 100 lemons packed in every drop. Leaves utensils sparkling clean and grease-free.', 'Vim', 'c0000000-0000-0000-0000-000000000005', 450, 375, false, '2L', 'Family Can', '/products/household/vim-dishwash-gel.svg'),
('b0000000-0000-0000-0000-000000000029', 'HOU-003', 'Harpic Power Plus 10X Disinfectant Toilet Cleaner', 'harpic-power-plus-1l-twin-pack', '10X better than bleach at eliminating stains, limescale, and 99.9% germs.', 'Harpic', 'c0000000-0000-0000-0000-000000000005', 220, 185, false, '2L', '1L Twin Value Pack', '/products/household/harpic-toilet-cleaner.svg'),
('b0000000-0000-0000-0000-000000000030', 'HOU-004', 'Lizol 10X Surface Disinfectant Floor Cleaner Citrus', 'lizol-disinfectant-floor-cleaner-2l', 'Kills 99.9% germs and viruses while leaving homes smelling like fresh zesty lemons.', 'Lizol', 'c0000000-0000-0000-0000-000000000005', 399, 340, false, '2L', 'Economy Jug', '/products/household/lizol-floor-cleaner.svg'),
('b0000000-0000-0000-0000-000000000031', 'HOU-005', 'Colin Ultra Advanced Glass & Multi-Surface Cleaner', 'colin-glass-cleaner-500ml', 'Shine boosters provide 2X more shine on glass tables, mirrors, and car windows without streaks.', 'Colin', 'c0000000-0000-0000-0000-000000000005', 130, 110, false, '500ml', 'Trigger Spray', '/products/household/colin-surface-cleaner.svg'),
('b0000000-0000-0000-0000-000000000032', 'SNK-006', 'Doritos Nacho Cheese Tortilla Chips', 'doritos-nacho-cheese-150g', 'Crunchy triangles packed with bold, fiery cheesy nacho flavor.', 'Doritos', 'c0000000-0000-0000-0000-000000000001', 75, 60, false, '150g', 'Pouch', '/products/snacks/doritos-nacho-cheese.svg'),
('prod-dairy-1', 'SKU-PROD-DAIRY-1', 'Amul Taaza Homogenised Toned Milk', 'amul-taaza-toned-milk-1l', 'Fresh, pure, pasteurised and homogenised toned milk rich in calcium and protein.', 'Amul', 'cat-dairy', 56, 54, true, '1 L Tetra Pack', 'Pack', '/products/dairy/amul-milk.svg'),
('prod-dairy-2', 'SKU-PROD-DAIRY-2', 'Mother Dairy Classic Dahi / Curd', 'mother-dairy-classic-curd-400g', 'Thick, creamy, and delicious probiotic curd made with pure milk.', 'Mother Dairy', 'cat-dairy', 40, 35, true, '400 g Tub', 'Pack', '/products/dairy/mother-dairy-curd.svg'),
('prod-dairy-3', 'SKU-PROD-DAIRY-3', 'Amul Fresh Malai Paneer', 'amul-fresh-malai-paneer-200g', 'Soft, succulent, and rich cottage cheese made from pasteurised milk.', 'Amul', 'cat-dairy', 95, 90, true, '200 g Vacuum Pack', 'Pack', '/products/dairy/amul-paneer.svg'),
('prod-dairy-4', 'SKU-PROD-DAIRY-4', 'Amul Pasteurized Table Butter', 'amul-pasteurized-butter-500g', 'The taste of India — delicious, creamy, and golden salted butter.', 'Amul', 'cat-dairy', 290, 275, true, '500 g Carton', 'Pack', '/products/dairy/amul-butter.svg'),
('prod-dairy-5', 'SKU-PROD-DAIRY-5', 'Amul Processed Cheese Slices', 'amul-processed-cheese-slices-200g', 'Individually wrapped slices of delicious melt-in-mouth cheese.', 'Amul', 'cat-dairy', 155, 140, true, '200 g (10 Slices)', 'Pack', '/products/dairy/amul-cheese.svg'),
('prod-dairy-6', 'SKU-PROD-DAIRY-6', 'Epigamia Greek Yogurt Natural', 'epigamia-greek-yogurt-120g', 'High-protein, strained Greek yogurt with thick texture and zero preservatives.', 'Epigamia', 'cat-dairy', 60, 50, true, '120 g Cup', 'Pack', '/products/dairy/epigamia-yogurt.svg'),
('prod-dairy-7', 'SKU-PROD-DAIRY-7', 'Amul Kool Elaichi / Rose Lassi Drink', 'amul-kool-lassi-drink-200ml', 'Refreshing sweet probiotic lassi chilled to perfection with natural cardamom.', 'Amul', 'cat-dairy', 30, 25, true, '200 ml Bottle', 'Pack', '/products/dairy/amul-kool.svg'),
('prod-dairy-8', 'SKU-PROD-DAIRY-8', 'Nandini GoodLife Pure Toned Milk', 'nandini-goodlife-toned-milk-1l', 'UHT treated long life pure cow milk with nourishing goodness.', 'Nandini', 'cat-dairy', 62, 58, true, '1 L Tetra', 'Pack', '/products/dairy/nandini-milk.svg'),
('prod-bev-1', 'SKU-PROD-BEV-1', 'Coca-Cola Original Taste Chilled Cola', 'coca-cola-original-taste-750ml', 'The classic crisp, uplifting taste of Coca-Cola served chilled.', 'Coca-Cola', 'cat-beverages', 45, 40, true, '750 ml Pet Bottle', 'Pack', '/products/beverages/coca-cola.svg'),
('prod-bev-2', 'SKU-PROD-BEV-2', 'Pepsi Refreshing Chilled Cola', 'pepsi-refreshing-cola-750ml', 'Bold, sweet, and fizzy cola that quenches thirst instantly.', 'Pepsi', 'cat-beverages', 45, 38, true, '750 ml Bottle', 'Pack', '/products/beverages/pepsi.svg'),
('prod-bev-3', 'SKU-PROD-BEV-3', 'Sprite Crisp Lemon-Lime Soda', 'sprite-lemon-lime-750ml', 'Clear, crisp, and refreshing lemon-lime flavored carbonated soda.', 'Sprite', 'cat-beverages', 45, 40, true, '750 ml Bottle', 'Pack', '/products/beverages/sprite.svg'),
('prod-bev-4', 'SKU-PROD-BEV-4', 'Fanta Sparkling Orange Fruit Drink', 'fanta-orange-soda-750ml', 'Vibrant, fruity orange soda with punchy bubbles and citrus aroma.', 'Fanta', 'cat-beverages', 45, 38, true, '750 ml Bottle', 'Pack', '/products/beverages/fanta.svg'),
('prod-bev-5', 'SKU-PROD-BEV-5', 'Thums Up Charged Strong Taste Cola', 'thums-up-strong-cola-750ml', 'India’s legendary strong cola with a thunderous kick and spicy undertone.', 'Thums Up', 'cat-beverages', 45, 40, true, '750 ml Bottle', 'Pack', '/products/beverages/thums-up.svg'),
('prod-bev-6', 'SKU-PROD-BEV-6', 'Maaza Alphonso Mango Pulp Drink', 'maaza-alphonso-mango-drink-1-2l', 'Thick, sweet, authentic Indian mango pulp drink made with ripe Alphonso mangoes.', 'Maaza', 'cat-beverages', 75, 65, true, '1.2 L Bottle', 'Pack', '/products/beverages/maaza.svg'),
('prod-bev-7', 'SKU-PROD-BEV-7', 'Bisleri Pure Mineral Water with Added Minerals', 'bisleri-mineral-water-1l', '10-stage purified mineral water enriched with essential minerals.', 'Bisleri', 'cat-beverages', 20, 20, true, '1 L Bottle', 'Pack', '/products/beverages/bisleri.svg'),
('prod-bev-8', 'SKU-PROD-BEV-8', 'Red Bull Energy Drink Chilled Can', 'red-bull-energy-drink-250ml', 'Vitalizes body and mind with taurine, B-group vitamins, and pure alpine water.', 'Red Bull', 'cat-beverages', 125, 120, true, '250 ml Slim Can', 'Pack', '/products/beverages/red-bull.svg'),
('prod-froz-1', 'SKU-PROD-FROZ-1', 'Amul Real Ice Cream Vanilla Gold Tub', 'amul-vanilla-gold-ice-cream-1l', 'Rich and creamy pure milk ice cream infused with aromatic premium vanilla.', 'Amul', 'cat-frozen', 180, 160, true, '1 L Party Tub', 'Pack', '/products/frozen/amul-vanilla.svg'),
('prod-froz-2', 'SKU-PROD-FROZ-2', 'Kwality Wall''s Double Chocolate Cornetto', 'kwality-walls-chocolate-cornetto-120ml', 'Crispy wafer cone lined with rich chocolate and topped with roasted nuts and chocolate sauce.', 'Kwality Wall''s', 'cat-frozen', 50, 45, true, '120 ml Cone', 'Pack', '/products/frozen/cornetto.svg'),
('prod-froz-3', 'SKU-PROD-FROZ-3', 'Kwality Wall''s Feast Chocolate Crunch Bar', 'kwality-walls-feast-crunch-bar-70ml', 'Solid chocolate center encased in smooth vanilla ice cream and biscuit crunchy crust.', 'Kwality Wall''s', 'cat-frozen', 45, 40, true, '70 ml Stick Bar', 'Pack', '/products/frozen/feast.svg'),
('prod-froz-4', 'SKU-PROD-FROZ-4', 'McCain Crispy French Fries Ready to Cook', 'mccain-crispy-french-fries-420g', 'Deliciously golden, crunchy potato fries made from farm-select potatoes.', 'McCain', 'cat-frozen', 130, 110, true, '420 g Saver Pouch', 'Pack', '/products/frozen/mccain-fries.svg'),
('prod-froz-5', 'SKU-PROD-FROZ-5', 'Safal Select Green Tender Peas Quick Frozen', 'safal-green-tender-peas-1kg', 'Farm-fresh, naturally sweet green peas individually quick frozen (IQF) to lock in nutrients.', 'Safal', 'cat-frozen', 150, 125, true, '1 kg Pouch', 'Pack', '/products/frozen/safal-peas.svg'),
('prod-froz-6', 'SKU-PROD-FROZ-6', 'McCain Veggie Burger Patty / Aloo Tikki', 'mccain-aloo-tikki-patty-400g', 'Crispy spiced potato and vegetable patties infused with fragrant Indian herbs.', 'McCain', 'cat-frozen', 135, 115, true, '400 g Pack', 'Pack', '/products/frozen/mccain-tikki.svg'),
('prod-froz-7', 'SKU-PROD-FROZ-7', 'Sumeru Crispy Mini Cocktail Vegetable Samosas', 'sumeru-cocktail-veg-samosas-300g', 'Golden crispy pastry triangles stuffed with spiced potatoes, peas, and coriander.', 'Sumeru', 'cat-frozen', 165, 145, true, '300 g Party Box', 'Pack', '/products/frozen/sumeru-samosa.svg'),
('prod-froz-8', 'SKU-PROD-FROZ-8', 'Amul Kesar Pista Traditional Shrikhand', 'amul-kesar-pista-shrikhand-500g', 'Gourmet sweet strained yogurt delicacy enriched with royal saffron and chopped pistachios.', 'Amul', 'cat-frozen', 145, 130, true, '500 g Tub', 'Pack', '/products/frozen/amul-shrikhand.svg'),
('prod-snk-01', 'SKU-PROD-SNK-01', 'Cadbury Oreo Vanilla Creme Sandwich Cookies', 'cadbury-oreo-vanilla-creme-300g', 'Crispy chocolate wafer cookies filled with rich, smooth vanilla creme.', 'Cadbury Oreo', 'cat-snacks', 100, 85, true, '300 g Family Pack', 'Pack', '/products/snacks/cadbury-oreo.svg'),
('prod-snk-03', 'SKU-PROD-SNK-03', 'Parle Hide & Seek Chocolate Chip Biscuits', 'parle-hide-and-seek-chocolate-200g', 'Crispy chocolate biscuits bursting with real rich chocolate chips.', 'Parle', 'cat-snacks', 60, 50, true, '200 g Pack', 'Pack', '/products/snacks/parle-hide-and-seek.svg'),
('prod-snk-04', 'SKU-PROD-SNK-04', 'Parle-G Original Glucose Biscuits', 'parle-g-glucose-biscuits-800g', 'India''s beloved tea companion made with nourishing wheat and milk goodness.', 'Parle', 'cat-snacks', 90, 75, true, '800 g Family Pack', 'Pack', '/products/snacks/parle-g-biscuits.svg'),
('prod-snk-05', 'SKU-PROD-SNK-05', 'Haldiram''s Nagpur Aloo Bhujia', 'haldirams-nagpur-aloo-bhujia-400g', 'Crispy, spicy potato-gram flour crunchies seasoned with authentic mint and spices.', 'Haldiram''s', 'cat-snacks', 140, 115, true, '400 g Pouch', 'Pack', '/products/snacks/haldirams-aloo-bhujia.svg'),
('prod-snk-07', 'SKU-PROD-SNK-07', 'Bingo! Mad Angles Achaari Masti', 'bingo-mad-angles-achaari-130g', 'Perfect triangle chips seasoned with mouthwatering mango pickle seasoning.', 'Bingo', 'cat-snacks', 55, 45, true, '130 g Pouch', 'Pack', '/products/snacks/bingo-mad-angles.svg'),
('prod-snk-08', 'SKU-PROD-SNK-08', 'Lay''s India''s Magic Masala Potato Chips', 'lays-indias-magic-masala-115g', 'Spicy, flavorful ribbed potato chips tossed in signature Indian spices.', 'Lay''s', 'cat-snacks', 60, 50, true, '115 g Party Pack', 'Pack', '/products/snacks/lays-magic-masala.svg'),
('prod-snk-09', 'SKU-PROD-SNK-09', 'Lay''s Classic Salted Potato Chips', 'lays-classic-salted-115g', 'Golden crispy sliced farm-grown potatoes simply seasoned with pure salt.', 'Lay''s', 'cat-snacks', 60, 50, true, '115 g Party Pack', 'Pack', '/products/snacks/lays-classic-salted.svg'),
('prod-tea-08', 'SKU-PROD-TEA-08', 'Ahmad Tea London Classic Earl Grey', 'ahmad-tea-london-earl-grey-200g', 'Subtle blend of oriental teas scented with aromatic oil of Mediterranean bergamot citrus.', 'Ahmad Tea', 'cat-tea-sweets', 480, 420, true, '200 g Royal Box', 'Pack', '/products/tea/ahmad-tea-earl-grey.svg'),
('prod-tea-11', 'SKU-PROD-TEA-11', 'Cadbury Dairy Milk Classic Milk Chocolate Bar', 'cadbury-dairy-milk-chocolate-50g', 'Classic creamy Cadbury milk chocolate bar with a glass and a half of pure full-cream milk.', 'Cadbury', 'cat-tea-sweets', 45, 40, true, '50 g Bar', 'Pack', '/products/sweets/DairyMilk.png'),
('prod-gro-01', 'SKU-PROD-GRO-01', 'Kellogg''s Corn Flakes Original Toasted Flakes', 'kelloggs-corn-flakes-500g', 'Golden, crispy sun-ripened corn flakes packed with essential vitamins and iron for breakfast energy.', 'Kellogg''s', 'cat-groceries', 225, 195, true, '500 g Box', 'Pack', '/products/groceries/kelloggs-corn-flakes.svg'),
('prod-gro-02', 'SKU-PROD-GRO-02', 'Maggi 2-Minute Masala Instant Noodles 12-Pack', 'maggi-2-minute-masala-noodles-12-pack', 'India''s favorite noodle with goodness of iron and signature blend of 10 roasted spices.', 'Nestle Maggi', 'cat-groceries', 168, 144, true, '840 g 12-Pack', 'Pack', '/products/groceries/maggi-2-minute-noodles.svg'),
('prod-gro-04', 'SKU-PROD-GRO-04', 'Madhur Pure & Hygienic Sulphur-Free Sugar', 'madhur-pure-sugar-1kg', '100% pure, sparkling white crystal sugar refined without harmful sulphur chemicals.', 'Madhur', 'cat-groceries', 62, 54, true, '1 kg Packet', 'Pack', '/products/groceries/madhur-sugar.svg'),
('prod-gro-05', 'SKU-PROD-GRO-05', 'Catch Royal Garam Masala Powder', 'catch-royal-garam-masala-100g', 'Aromatic blend of ground Indian spices using low-temperature grinding to lock in natural oils.', 'Catch', 'cat-groceries', 92, 78, true, '100 g Box', 'Pack', '/products/groceries/catch-garam-masala.svg'),
('prod-gro-06', 'SKU-PROD-GRO-06', 'Tata Sampann Unpolished High Protein Toor Dal', 'tata-sampann-unpolished-toor-dal-1kg', 'Nutritious unpolished yellow pigeon peas rich in natural dietary fibers and protein goodness.', 'Tata Sampann', 'cat-groceries', 195, 165, true, '1 kg Pouch', 'Pack', '/products/groceries/tata-sampann-toor-dal.svg'),
('prod-per-06', 'SKU-PROD-PER-06', 'Clinic Plus Strong & Long Health Shampoo', 'clinic-plus-strong-and-long-650ml', 'Milk protein formula penetrates hair fibres to nourish from root to tip.', 'Clinic Plus', 'cat-personal', 430, 360, true, '650 ml Bottle', 'Pack', '/products/personal-care/clinic-plus-shampoo.svg'),
('prod-hou-06', 'SKU-PROD-HOU-06', 'Ariel Matic 2X Stain Removal Liquid Detergent', 'ariel-matic-liquid-detergent-2l', 'Deep cleaning liquid detergent designed to lift tough grease and turmeric stains in 1 wash.', 'Ariel', 'cat-household', 520, 440, true, '2 L Economy Bottle', 'Pack', '/products/household/ariel-liquid-detergent.svg'),
('prod-hou-07', 'SKU-PROD-HOU-07', 'Comfort Fabric Conditioner Morning Fresh', 'comfort-fabric-conditioner-2l', 'Provides long-lasting 14-day fragrance, shine, and unbelievable softness to clothes.', 'Comfort', 'cat-household', 420, 360, true, '2 L Bottle', 'Pack', '/products/household/comfort-fabric-conditioner.svg'),
('prod-hou-08', 'SKU-PROD-HOU-08', 'Tide Plus Double Power Detergent Powder', 'tide-plus-double-power-4kg', 'Extra whiteness and bright lemon-mint freshness for family laundry.', 'Tide', 'cat-household', 510, 430, true, '4 kg Saver Pack', 'Pack', '/products/household/tide-plus-powder.svg'),
('prod-per-07', 'SKU-PROD-PER-07', 'Lux Velvet Glow Jasmine & Almond Oil Beauty Soap', 'lux-velvet-glow-soap-pack-of-4', 'Infused with floral beauty oil and jasmine extract for fragrant, radiant skin.', 'Lux', 'cat-personal', 220, 180, true, '500 g Pack of 4', 'Pack', '/products/personal-care/lux-soap.svg'),
('prod-per-08', 'SKU-PROD-PER-08', 'Himalaya Purifying Neem Face Wash', 'himalaya-purifying-neem-face-wash-300ml', 'Soap-free herbal formulation that clears impurities and helps prevent pimples.', 'Himalaya', 'cat-personal', 299, 245, true, '300 ml Pump Pack', 'Pack', '/products/personal-care/himalaya-neem-facewash.svg'),
('prod-per-09', 'SKU-PROD-PER-09', 'Pond''s Bright Beauty Spot-less Glow Face Wash', 'ponds-bright-beauty-face-wash-200g', 'Infused with Vitamin B3+ to deep cleanse, remove dead skin cells and reveal radiant skin.', 'Pond''s', 'cat-personal', 249, 199, true, '200 g Tube', 'Pack', '/products/personal-care/ponds-bright-beauty.svg'),
('prod-cho-04', 'SKU-PROD-CHO-04', 'Cadbury 5 Star Caramel & Nougat Chocolate Bar', 'cadbury-5-star-chocolate-bar-40g', 'Chewy golden caramel and fluffy nougat enrobed in smooth Cadbury milk chocolate.', 'Cadbury', 'cat-tea-sweets', 20, 20, true, '40 g Bar', 'Pack', '/products/sweets/cadbury-5-star.svg'),
('prod-cho-05', 'SKU-PROD-CHO-05', 'Nestle Munch Crunchy Wafer Chocolate Bar', 'nestle-munch-crunchy-wafer-32g', 'Crunchilicious roasted crispy wafer layers coated in delicious chocolate.', 'Nestle', 'cat-tea-sweets', 15, 15, true, '32 g Bar', 'Pack', '/products/sweets/nestle-munch.svg'),
('prod-cho-06', 'SKU-PROD-CHO-06', 'KitKat 4-Finger Crisp Wafer Chocolate Bar', 'kitkat-4-finger-wafer-38g', 'Have a break, have a KitKat! Four crisp wafer fingers coated in smooth milk chocolate.', 'KitKat', 'cat-tea-sweets', 30, 25, true, '38 g Bar', 'Pack', '/products/sweets/kitkat-4-finger.svg'),
('prod-gro-07', 'SKU-PROD-GRO-07', 'Fortune Unpolished Moong Dal', 'fortune-unpolished-moong-dal-1kg', 'Rich in dietary fiber and natural protein with no water or chemical polish.', 'Fortune', 'cat-groceries', 160, 135, true, '1 kg Eco Pack', 'Pack', '/products/groceries/fortune-moong-dal.svg'),
('prod-gro-08', 'SKU-PROD-GRO-08', 'Tata Sampann Pure Organic Chana Dal', 'tata-sampann-chana-dal-1kg', 'Naturally nutritious chickpeas sourced directly from best farms with 5-step purity check.', 'Tata Sampann', 'cat-groceries', 130, 110, true, '1 kg Pack', 'Pack', '/products/groceries/tata-sampann-chana-dal.svg'),
('prod-gro-09', 'SKU-PROD-GRO-09', 'Saffola Gold Pro Healthy Balanced Cooking Oil', 'saffola-gold-pro-healthy-oil-5l', 'Dual-seed blend of rice bran and sunflower oil with Oryzanol for superior heart wellness.', 'Saffola', 'cat-groceries', 950, 799, true, '5 L Jar', 'Pack', '/products/groceries/saffola-gold-oil.svg'),
('prod-gro-10', 'SKU-PROD-GRO-10', 'Dhara Kachi Ghani Pure Mustard Cooking Oil', 'dhara-kachi-ghani-mustard-oil-1l', 'Cold pressed authentic spicy mustard oil rich in MUFA and natural pungency.', 'Dhara', 'cat-groceries', 185, 155, true, '1 L Bottle', 'Pack', '/products/groceries/dhara-mustard-oil.svg'),
('prod-bev-09', 'SKU-PROD-BEV-09', 'Tropicana 100% Pure Orange Fruit Juice', 'tropicana-100-pure-orange-juice-1l', 'Delicious sunshine in a glass with no added sugar, artificial flavors or preservatives.', 'Tropicana', 'cat-beverages', 150, 125, true, '1 L Tetra Pack', 'Pack', '/products/beverages/tropicana-orange-juice.svg'),
('prod-bev-10', 'SKU-PROD-BEV-10', 'Bisleri Pure Mineral Water 24-Pack Case', 'bisleri-mineral-water-case-500ml', '24 bottles of 10-step purified mineral water enriched with essential minerals.', 'Bisleri', 'cat-beverages', 288, 240, true, '24 x 500 ml Case', 'Pack', '/products/beverages/bisleri-case.svg'),
('prod-snk-10', 'SKU-PROD-SNK-10', 'Bikaji Bikaneri Bhujia Sev Special', 'bikaji-bikaneri-bhujia-sev-1kg', 'Crispy Bikaneri moth bean and gram flour strings seasoned with authentic Rajasthani spices.', 'Bikaji', 'cat-snacks', 310, 260, true, '1 kg Mega Pack', 'Pack', '/products/snacks/bikaji-bhujia.svg'),
('prod-snk-11', 'SKU-PROD-SNK-11', 'Haldiram''s Khatta Meetha Sweet & Sour Mixture', 'haldirams-khatta-meetha-mixture-400g', 'Delectable crunchy mix of chickpea flour noodles, puffed rice, green peas and golden raisins.', 'Haldiram''s', 'cat-snacks', 135, 110, true, '400 g Pouch', 'Pack', '/products/snacks/haldirams-khatta-meetha.svg'),
('prod-swt-04', 'SKU-PROD-SWT-04', 'Haldiram''s Traditional Gulab Jamun Sweet Tin', 'haldirams-gulab-jamun-tin-1kg', 'Soft melt-in-mouth cottage cheese and milk solids dumplings steeped in aromatic saffron syrup.', 'Haldiram''s', 'cat-tea-sweets', 275, 235, true, '1 kg Tin', 'Pack', '/products/sweets/haldirams-gulab-jamun.svg'),
('prod-swt-05', 'SKU-PROD-SWT-05', 'Haldiram''s Royal Soan Papdi Ghee Box', 'haldirams-soan-papdi-ghee-500g', 'Flaky, crisp golden sweet made with pure desi ghee, almond slivers and fragrant green cardamom.', 'Haldiram''s', 'cat-tea-sweets', 180, 150, true, '500 g Box', 'Pack', '/products/sweets/haldirams-soan-papdi.svg'),
('prod-swt-06', 'SKU-PROD-SWT-06', 'Cadbury Celebrations Rich Dry Fruit Gift Pack', 'cadbury-celebrations-dry-fruit-gift-250g', 'Luxurious gift box of chocolate-coated whole almonds and raisins for special celebrations.', 'Cadbury', 'cat-tea-sweets', 400, 350, true, '250 g Gift Box', 'Pack', '/products/sweets/cadbury-celebrations.svg'),
('prod-swt-07', 'SKU-PROD-SWT-07', 'Happilo Premium California Inshell Almonds', 'happilo-premium-california-almonds-500g', 'Crunchy, 100% natural supreme raw almonds loaded with Vitamin E and healthy proteins.', 'Happilo', 'cat-tea-sweets', 625, 499, true, '500 g Zip Pouch', 'Pack', '/products/sweets/happilo-almonds.svg'),
('prod-swt-08', 'SKU-PROD-SWT-08', 'Happilo 100% Natural Whole Cashews', 'happilo-whole-natural-cashews-500g', 'Grade W240 whole jumbo white cashews offering rich nutty crunch and wholesome nutrition.', 'Happilo', 'cat-tea-sweets', 699, 549, true, '500 g Zip Pouch', 'Pack', '/products/sweets/happilo-cashews.svg')
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, mrp = EXCLUDED.mrp, image_url = EXCLUDED.image_url;
