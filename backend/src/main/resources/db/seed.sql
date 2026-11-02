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
