const fs = require('fs');
const path = require('path');

// 10 Hypermarket Departments across the store layout
const CATEGORIES = [
  { id: 'snacks-namkeen', name: 'Snacks & Namkeen', aisleNumber: 1, aisleName: 'Aisle 1: Snacks & Namkeen', color: '#f59e0b', packaging: 'pouch' },
  { id: 'bakery-biscuits', name: 'Bakery & Biscuits', aisleNumber: 2, aisleName: 'Aisle 2: Bakery & Biscuits', color: '#d97706', packaging: 'box' },
  { id: 'beverages-tea-coffee', name: 'Beverages & Tea/Coffee', aisleNumber: 3, aisleName: 'Aisle 3: Beverages & Tea', color: '#0284c7', packaging: 'bottle' },
  { id: 'dairy-breakfast', name: 'Dairy & Breakfast', aisleNumber: 4, aisleName: 'Aisle 4: Dairy & Breakfast', color: '#06b6d4', packaging: 'box' },
  { id: 'rice-flours-pulses', name: 'Rice, Atta & Pulses', aisleNumber: 5, aisleName: 'Aisle 5: Rice, Atta & Pulses', color: '#10b981', packaging: 'pouch' },
  { id: 'spices-cooking-essentials', name: 'Spices & Cooking Oils', aisleNumber: 6, aisleName: 'Aisle 6: Spices & Cooking Oils', color: '#ef4444', packaging: 'bottle' },
  { id: 'instant-packaged-foods', name: 'Instant & Packaged Foods', aisleNumber: 7, aisleName: 'Aisle 7: Instant Foods & Pasta', color: '#8b5cf6', packaging: 'box' },
  { id: 'personal-care', name: 'Personal Care & Hygiene', aisleNumber: 8, aisleName: 'Aisle 8: Personal Care & Hygiene', color: '#ec4899', packaging: 'bottle' },
  { id: 'household-cleaning', name: 'Household & Cleaning', aisleNumber: 9, aisleName: 'Aisle 9: Household & Cleaning', color: '#3b82f6', packaging: 'bottle' },
  { id: 'fresh-produce-fruits-veggies', name: 'Fresh Produce & Fruits', aisleNumber: 10, aisleName: 'Department 10: Farm Fresh Produce', color: '#22c55e', packaging: 'box' }
];

// 30 Items per category definition template
const PRODUCTS_DATA = [
  // 1. Snacks & Namkeen (30 SKUs)
  { cat: 'snacks-namkeen', name: 'Golden Crisp Classic Salted Chips', brand: 'Lay\'s', weight: '52 g', price: 20, mrp: 20, packaging: 'pouch', color: '#fbbf24' },
  { cat: 'snacks-namkeen', name: 'Desi Masala Magic Potato Chips', brand: 'Lay\'s', weight: '52 g', price: 20, mrp: 20, packaging: 'pouch', color: '#3b82f6' },
  { cat: 'snacks-namkeen', name: 'Spanish Tomato Tango Chips', brand: 'Lay\'s', weight: '52 g', price: 20, mrp: 20, packaging: 'pouch', color: '#ef4444' },
  { cat: 'snacks-namkeen', name: 'Cream & Onion Gourmet Crisps', brand: 'Lay\'s', weight: '52 g', price: 20, mrp: 20, packaging: 'pouch', color: '#10b981' },
  { cat: 'snacks-namkeen', name: 'Kurkure Masala Munch Crunchy Twists', brand: 'Kurkure', weight: '85 g', price: 20, mrp: 20, packaging: 'pouch', color: '#f97316' },
  { cat: 'snacks-namkeen', name: 'Kurkure Green Chutney Style', brand: 'Kurkure', weight: '85 g', price: 20, mrp: 20, packaging: 'pouch', color: '#22c55e' },
  { cat: 'snacks-namkeen', name: 'Kurkure Chilli Chatka Sticks', brand: 'Kurkure', weight: '85 g', price: 20, mrp: 20, packaging: 'pouch', color: '#dc2626' },
  { cat: 'snacks-namkeen', name: 'Haldiram\'s Aloo Bhujia Spicy Snack', brand: 'Haldiram\'s', weight: '400 g', price: 110, mrp: 125, packaging: 'pouch', color: '#eab308' },
  { cat: 'snacks-namkeen', name: 'Haldiram\'s Bhujia Sev Traditional', brand: 'Haldiram\'s', weight: '400 g', price: 105, mrp: 120, packaging: 'pouch', color: '#ca8a04' },
  { cat: 'snacks-namkeen', name: 'Haldiram\'s All-in-One Mixture', brand: 'Haldiram\'s', weight: '350 g', price: 95, mrp: 110, packaging: 'pouch', color: '#f59e0b' },
  { cat: 'snacks-namkeen', name: 'Haldiram\'s Khatta Meetha Mix', brand: 'Haldiram\'s', weight: '400 g', price: 100, mrp: 115, packaging: 'pouch', color: '#fb923c' },
  { cat: 'snacks-namkeen', name: 'Haldiram\'s Moong Dal Fried & Salted', brand: 'Haldiram\'s', weight: '350 g', price: 120, mrp: 135, packaging: 'pouch', color: '#84cc16' },
  { cat: 'snacks-namkeen', name: 'Haldiram\'s Nut Cracker Coated Peanuts', brand: 'Haldiram\'s', weight: '200 g', price: 55, mrp: 65, packaging: 'pouch', color: '#b45309' },
  { cat: 'snacks-namkeen', name: 'Bikaji Bikaneri Bhujia Authentic', brand: 'Bikaji', weight: '400 g', price: 115, mrp: 130, packaging: 'pouch', color: '#d97706' },
  { cat: 'snacks-namkeen', name: 'Bingo Mad Angles Achaari Masti', brand: 'Bingo', weight: '72 g', price: 20, mrp: 20, packaging: 'pouch', color: '#ea580c' },
  { cat: 'snacks-namkeen', name: 'Bingo Mad Angles Tomato Madness', brand: 'Bingo', weight: '72 g', price: 20, mrp: 20, packaging: 'pouch', color: '#e11d48' },
  { cat: 'snacks-namkeen', name: 'Bingo Tedhe Medhe Masala Tadka', brand: 'Bingo', weight: '90 g', price: 20, mrp: 20, packaging: 'pouch', color: '#c2410c' },
  { cat: 'snacks-namkeen', name: 'Doritos Cheese Supreme Nacho Chips', brand: 'Doritos', weight: '140 g', price: 50, mrp: 50, packaging: 'pouch', color: '#ea580c' },
  { cat: 'snacks-namkeen', name: 'Doritos Sweet Chilli Tortilla Chips', brand: 'Doritos', weight: '140 g', price: 50, mrp: 50, packaging: 'pouch', color: '#9333ea' },
  { cat: 'snacks-namkeen', name: 'Pringles Original Potato Crisps', brand: 'Pringles', weight: '107 g', price: 115, mrp: 130, packaging: 'can', color: '#dc2626' },
  { cat: 'snacks-namkeen', name: 'Pringles Sour Cream & Onion Tube', brand: 'Pringles', weight: '107 g', price: 115, mrp: 130, packaging: 'can', color: '#16a34a' },
  { cat: 'snacks-namkeen', name: 'Pringles South African Peri Peri', brand: 'Pringles', weight: '107 g', price: 115, mrp: 130, packaging: 'can', color: '#b91c1c' },
  { cat: 'snacks-namkeen', name: 'Too Yumm! Multigrain Chips Veggie', brand: 'Too Yumm!', weight: '90 g', price: 30, mrp: 35, packaging: 'pouch', color: '#059669' },
  { cat: 'snacks-namkeen', name: 'Too Yumm! Karare Chilli Achari', brand: 'Too Yumm!', weight: '85 g', price: 20, mrp: 20, packaging: 'pouch', color: '#d97706' },
  { cat: 'snacks-namkeen', name: 'ACT II Golden Sizzle Microwave Popcorn', brand: 'ACT II', weight: '90 g', price: 35, mrp: 40, packaging: 'box', color: '#eab308' },
  { cat: 'snacks-namkeen', name: 'ACT II Butter Lovers Instant Popcorn', brand: 'ACT II', weight: '90 g', price: 35, mrp: 40, packaging: 'box', color: '#f59e0b' },
  { cat: 'snacks-namkeen', name: 'Crax Corn Rings Tangy Tomato', brand: 'Crax', weight: '65 g', price: 20, mrp: 20, packaging: 'pouch', color: '#ef4444' },
  { cat: 'snacks-namkeen', name: 'Cornitos Nacho Crisps Jalapeno', brand: 'Cornitos', weight: '150 g', price: 90, mrp: 100, packaging: 'pouch', color: '#15803d' },
  { cat: 'snacks-namkeen', name: 'Chheda\'s Golden Banana Chips Salted', brand: 'Chheda\'s', weight: '170 g', price: 65, mrp: 75, packaging: 'pouch', color: '#eab308' },
  { cat: 'snacks-namkeen', name: 'Chheda\'s Yellow Banana Chips Masala', brand: 'Chheda\'s', weight: '170 g', price: 65, mrp: 75, packaging: 'pouch', color: '#c2410c' },

  // 2. Bakery & Biscuits (30 SKUs)
  { cat: 'bakery-biscuits', name: 'Parle-G Original Glucose Biscuits', brand: 'Parle', weight: '800 g', price: 75, mrp: 85, packaging: 'box', color: '#f59e0b' },
  { cat: 'bakery-biscuits', name: 'Britannia Good Day Butter Cookies', brand: 'Britannia', weight: '600 g', price: 120, mrp: 140, packaging: 'box', color: '#d97706' },
  { cat: 'bakery-biscuits', name: 'Britannia Good Day Cashew Cookies', brand: 'Britannia', weight: '600 g', price: 135, mrp: 150, packaging: 'box', color: '#b45309' },
  { cat: 'bakery-biscuits', name: 'Britannia Marie Gold Crisp Tea Biscuits', brand: 'Britannia', weight: '950 g', price: 110, mrp: 130, packaging: 'box', color: '#ea580c' },
  { cat: 'bakery-biscuits', name: 'Britannia Bourbon Chocolate Cream Biscuits', brand: 'Britannia', weight: '400 g', price: 70, mrp: 80, packaging: 'box', color: '#78350f' },
  { cat: 'bakery-biscuits', name: 'Britannia Treat Jim Jam Cream Biscuits', brand: 'Britannia', weight: '300 g', price: 60, mrp: 70, packaging: 'box', color: '#e11d48' },
  { cat: 'bakery-biscuits', name: 'Sunfeast Dark Fantasy Choco Fills', brand: 'Sunfeast', weight: '300 g', price: 130, mrp: 160, packaging: 'box', color: '#451a03' },
  { cat: 'bakery-biscuits', name: 'Sunfeast Dark Fantasy Vanilla Fills', brand: 'Sunfeast', weight: '300 g', price: 130, mrp: 160, packaging: 'box', color: '#57534e' },
  { cat: 'bakery-biscuits', name: 'Sunfeast Mom\'s Magic Butter & Cashew', brand: 'Sunfeast', weight: '584 g', price: 115, mrp: 135, packaging: 'box', color: '#b45309' },
  { cat: 'bakery-biscuits', name: 'Oreo Original Vanilla Cream Sandwich', brand: 'Cadbury Oreo', weight: '300 g', price: 85, mrp: 95, packaging: 'box', color: '#1e3a8a' },
  { cat: 'bakery-biscuits', name: 'Oreo Chocolate Flavour Cream Biscuits', brand: 'Cadbury Oreo', weight: '300 g', price: 85, mrp: 95, packaging: 'box', color: '#422006' },
  { cat: 'bakery-biscuits', name: 'Oreo Golden Vanilla Sandwich Cookies', brand: 'Cadbury Oreo', weight: '300 g', price: 90, mrp: 100, packaging: 'box', color: '#ca8a04' },
  { cat: 'bakery-biscuits', name: 'Parle Hide & Seek Real Chocolate Chip', brand: 'Parle', weight: '350 g', price: 80, mrp: 90, packaging: 'box', color: '#451a03' },
  { cat: 'bakery-biscuits', name: 'Parle Hide & Seek Caffe Mocha Biscuits', brand: 'Parle', weight: '350 g', price: 85, mrp: 95, packaging: 'box', color: '#581c87' },
  { cat: 'bakery-biscuits', name: 'Parle Monaco Classic Salted Crackers', brand: 'Parle', weight: '400 g', price: 65, mrp: 75, packaging: 'box', color: '#eab308' },
  { cat: 'bakery-biscuits', name: 'Parle Krackjack Sweet & Salty Biscuits', brand: 'Parle', weight: '400 g', price: 65, mrp: 75, packaging: 'box', color: '#22c55e' },
  { cat: 'bakery-biscuits', name: 'Britannia 50-50 Sweet & Salty Biscuits', brand: 'Britannia', weight: '300 g', price: 50, mrp: 60, packaging: 'box', color: '#16a34a' },
  { cat: 'bakery-biscuits', name: 'Britannia 50-50 Maska Chaska Crackers', brand: 'Britannia', weight: '300 g', price: 55, mrp: 65, packaging: 'box', color: '#15803d' },
  { cat: 'bakery-biscuits', name: 'Britannia NutriChoice Digestive Fibre', brand: 'Britannia', weight: '1 kg', price: 180, mrp: 210, packaging: 'box', color: '#ca8a04' },
  { cat: 'bakery-biscuits', name: 'Britannia NutriChoice Oats & Almond', brand: 'Britannia', weight: '300 g', price: 75, mrp: 90, packaging: 'box', color: '#a16207' },
  { cat: 'bakery-biscuits', name: 'Britannia Premium Bake Rusk Crunchy', brand: 'Britannia', weight: '600 g', price: 90, mrp: 105, packaging: 'pouch', color: '#d97706' },
  { cat: 'bakery-biscuits', name: 'Parle Rusk Real Elaichi Flavour', brand: 'Parle', weight: '400 g', price: 60, mrp: 70, packaging: 'pouch', color: '#059669' },
  { cat: 'bakery-biscuits', name: 'Harvest Gold 100% Whole Wheat Bread', brand: 'Harvest Gold', weight: '400 g', price: 50, mrp: 50, packaging: 'pouch', color: '#92400e' },
  { cat: 'bakery-biscuits', name: 'Harvest Gold White Sandwich Bread', brand: 'Harvest Gold', weight: '400 g', price: 40, mrp: 40, packaging: 'pouch', color: '#dc2626' },
  { cat: 'bakery-biscuits', name: 'English Oven Multigrain Bread Loaf', brand: 'English Oven', weight: '400 g', price: 60, mrp: 60, packaging: 'pouch', color: '#78350f' },
  { cat: 'bakery-biscuits', name: 'Britannia Gobbles Fruity Cake Slice', brand: 'Britannia', weight: '140 g', price: 35, mrp: 40, packaging: 'box', color: '#db2777' },
  { cat: 'bakery-biscuits', name: 'Britannia Gobbles Choco Muffin Cake', brand: 'Britannia', weight: '140 g', price: 35, mrp: 40, packaging: 'box', color: '#451a03' },
  { cat: 'bakery-biscuits', name: 'Unibic Assorted Cookies Gift Pack', brand: 'Unibic', weight: '450 g', price: 175, mrp: 225, packaging: 'box', color: '#9333ea' },
  { cat: 'bakery-biscuits', name: 'Unibic Choco Chip Cookies Box', brand: 'Unibic', weight: '250 g', price: 85, mrp: 100, packaging: 'box', color: '#78350f' },
  { cat: 'bakery-biscuits', name: 'Lotus Biscoff Caramelised Cookies', brand: 'Lotus Biscoff', weight: '250 g', price: 260, mrp: 295, packaging: 'box', color: '#b91c1c' },

  // 3. Beverages & Tea/Coffee (30 SKUs)
  { cat: 'beverages-tea-coffee', name: 'Chai Gold Assam CTC Leaf Tea', brand: 'Tata Tea', weight: '1 kg', price: 440, mrp: 495, packaging: 'pouch', color: '#b45309' },
  { cat: 'beverages-tea-coffee', name: 'Tata Tea Premium Desh Ki Chai', brand: 'Tata Tea', weight: '1 kg', price: 420, mrp: 480, packaging: 'pouch', color: '#15803d' },
  { cat: 'beverages-tea-coffee', name: 'Tata Tea Gold Royal Infusions', brand: 'Tata Tea', weight: '500 g', price: 290, mrp: 330, packaging: 'pouch', color: '#ca8a04' },
  { cat: 'beverages-tea-coffee', name: 'Brooke Bond Red Label Natural Care', brand: 'Red Label', weight: '1 kg', price: 475, mrp: 540, packaging: 'pouch', color: '#dc2626' },
  { cat: 'beverages-tea-coffee', name: 'Brooke Bond Taj Mahal Rich CTC Tea', brand: 'Taj Mahal', weight: '500 g', price: 340, mrp: 390, packaging: 'box', color: '#1e3a8a' },
  { cat: 'beverages-tea-coffee', name: 'Wagh Bakri Premium Leaf Tea Pouch', brand: 'Wagh Bakri', weight: '1 kg', price: 460, mrp: 510, packaging: 'pouch', color: '#ea580c' },
  { cat: 'beverages-tea-coffee', name: 'Tetley Pure Green Tea Bags Box', brand: 'Tetley', weight: '100 bags', price: 399, mrp: 460, packaging: 'box', color: '#16a34a' },
  { cat: 'beverages-tea-coffee', name: 'Lipton Pure & Light Green Tea', brand: 'Lipton', weight: '100 bags', price: 380, mrp: 450, packaging: 'box', color: '#eab308' },
  { cat: 'beverages-tea-coffee', name: 'Nescafe Classic Pure Instant Coffee', brand: 'Nescafe', weight: '200 g', price: 410, mrp: 475, packaging: 'jar', color: '#dc2626' },
  { cat: 'beverages-tea-coffee', name: 'Nescafe Gold Blend Premium Decaf', brand: 'Nescafe', weight: '100 g', price: 540, mrp: 620, packaging: 'jar', color: '#ca8a04' },
  { cat: 'beverages-tea-coffee', name: 'Bru Instant Roasted Chicory Coffee', brand: 'Bru', weight: '200 g', price: 340, mrp: 390, packaging: 'pouch', color: '#78350f' },
  { cat: 'beverages-tea-coffee', name: 'Bru Gold Pure Continental Coffee', brand: 'Bru', weight: '100 g', price: 285, mrp: 325, packaging: 'jar', color: '#b45309' },
  { cat: 'beverages-tea-coffee', name: 'Davidoff Rich Aroma Espresso Roast', brand: 'Davidoff', weight: '100 g', price: 620, mrp: 720, packaging: 'jar', color: '#18181b' },
  { cat: 'beverages-tea-coffee', name: 'Bournvita Cadbury Chocolate Nutrition Drink', brand: 'Cadbury', weight: '1 kg', price: 399, mrp: 440, packaging: 'jar', color: '#9333ea' },
  { cat: 'beverages-tea-coffee', name: 'Horlicks Classic Malt Health Drink', brand: 'Horlicks', weight: '1 kg', price: 415, mrp: 465, packaging: 'jar', color: '#0284c7' },
  { cat: 'beverages-tea-coffee', name: 'Boost Energy Drink Power Vitamin Box', brand: 'Boost', weight: '1 kg', price: 430, mrp: 485, packaging: 'jar', color: '#ea580c' },
  { cat: 'beverages-tea-coffee', name: 'Real Fruit Power Alphonso Mango Nectar', brand: 'Real', weight: '1 L', price: 110, mrp: 130, packaging: 'box', color: '#f59e0b' },
  { cat: 'beverages-tea-coffee', name: 'Real Fruit Power Mixed Fruit Juice', brand: 'Real', weight: '1 L', price: 110, mrp: 130, packaging: 'box', color: '#e11d48' },
  { cat: 'beverages-tea-coffee', name: 'Real Fruit Power Himalayan Apple Nectar', brand: 'Real', weight: '1 L', price: 110, mrp: 130, packaging: 'box', color: '#b91c1c' },
  { cat: 'beverages-tea-coffee', name: 'Tropicana 100% Orange Fruit Juice', brand: 'Tropicana', weight: '1 L', price: 125, mrp: 145, packaging: 'box', color: '#ea580c' },
  { cat: 'beverages-tea-coffee', name: 'Raw Pressery 100% Tender Coconut Water', brand: 'Raw Pressery', weight: '1 L', price: 140, mrp: 160, packaging: 'bottle', color: '#059669' },
  { cat: 'beverages-tea-coffee', name: 'Coca-Cola Original Taste Chilled Soda', brand: 'Coca-Cola', weight: '1.25 L', price: 50, mrp: 50, packaging: 'bottle', color: '#dc2626' },
  { cat: 'beverages-tea-coffee', name: 'Coca-Cola Zero Sugar Refreshing Soda', brand: 'Coca-Cola', weight: '750 ml', price: 40, mrp: 40, packaging: 'bottle', color: '#09090b' },
  { cat: 'beverages-tea-coffee', name: 'Thums Up Charged Carbonated Beverage', brand: 'Thums Up', weight: '1.25 L', price: 50, mrp: 50, packaging: 'bottle', color: '#1e3a8a' },
  { cat: 'beverages-tea-coffee', name: 'Sprite Clear Lemon Lime Carbonated Drink', brand: 'Sprite', weight: '1.25 L', price: 50, mrp: 50, packaging: 'bottle', color: '#16a34a' },
  { cat: 'beverages-tea-coffee', name: 'Limca Fresh Fizzy Lemon Drink', brand: 'Limca', weight: '1.25 L', price: 50, mrp: 50, packaging: 'bottle', color: '#84cc16' },
  { cat: 'beverages-tea-coffee', name: 'Red Bull Energy Drink Classic Can', brand: 'Red Bull', weight: '250 ml', price: 125, mrp: 125, packaging: 'can', color: '#2563eb' },
  { cat: 'beverages-tea-coffee', name: 'Monster Energy Drink Green Original', brand: 'Monster', weight: '350 ml', price: 130, mrp: 130, packaging: 'can', color: '#16a34a' },
  { cat: 'beverages-tea-coffee', name: 'Kinley Sparkling Soda Extra Punch', brand: 'Kinley', weight: '750 ml', price: 20, mrp: 20, packaging: 'bottle', color: '#0284c7' },
  { cat: 'beverages-tea-coffee', name: 'Bisleri Natural Spring Mineral Water', brand: 'Bisleri', weight: '2 L', price: 30, mrp: 30, packaging: 'bottle', color: '#06b6d4' },

  // 4. Dairy & Breakfast (30 SKUs)
  { cat: 'dairy-breakfast', name: 'FreshFarm Full Cream Fresh Milk Pack', brand: 'Amul', weight: '1 L', price: 68, mrp: 70, packaging: 'pouch', color: '#0284c7' },
  { cat: 'dairy-breakfast', name: 'Amul Taaza Homogenised Toned Milk', brand: 'Amul', weight: '1 L', price: 56, mrp: 58, packaging: 'box', color: '#3b82f6' },
  { cat: 'dairy-breakfast', name: 'Amul Pasteurised Salted Cream Butter', brand: 'Amul', weight: '500 g', price: 265, mrp: 280, packaging: 'box', color: '#f59e0b' },
  { cat: 'dairy-breakfast', name: 'Amul Pure Cow Butter Unsalted', brand: 'Amul', weight: '500 g', price: 285, mrp: 300, packaging: 'box', color: '#eab308' },
  { cat: 'dairy-breakfast', name: 'Amul Processed Cheese Block', brand: 'Amul', weight: '500 g', price: 280, mrp: 300, packaging: 'box', color: '#d97706' },
  { cat: 'dairy-breakfast', name: 'Amul Cheese Slices Value Pack', brand: 'Amul', weight: '400 g', price: 270, mrp: 290, packaging: 'box', color: '#ca8a04' },
  { cat: 'dairy-breakfast', name: 'Amul Fresh Malai Paneer Cubes', brand: 'Amul', weight: '400 g', price: 195, mrp: 215, packaging: 'pouch', color: '#38bdf8' },
  { cat: 'dairy-breakfast', name: 'Mother Dairy Fresh Paneer Block', brand: 'Mother Dairy', weight: '400 g', price: 190, mrp: 210, packaging: 'pouch', color: '#0284c7' },
  { cat: 'dairy-breakfast', name: 'Amul Masti Spiced Buttermilk Tub', brand: 'Amul', weight: '1 L', price: 40, mrp: 40, packaging: 'bottle', color: '#06b6d4' },
  { cat: 'dairy-breakfast', name: 'Mother Dairy Classic Sweet Lassi Bottle', brand: 'Mother Dairy', weight: '300 ml', price: 30, mrp: 30, packaging: 'bottle', color: '#0ea5e9' },
  { cat: 'dairy-breakfast', name: 'Epigamia Greek Yogurt Strawberry Tub', brand: 'Epigamia', weight: '90 g', price: 50, mrp: 55, packaging: 'box', color: '#e11d48' },
  { cat: 'dairy-breakfast', name: 'Epigamia Greek Yogurt Natural High Protein', brand: 'Epigamia', weight: '90 g', price: 45, mrp: 50, packaging: 'box', color: '#64748b' },
  { cat: 'dairy-breakfast', name: 'Kellogg\'s Corn Flakes Original Breakfast', brand: 'Kellogg\'s', weight: '1.2 kg', price: 399, mrp: 460, packaging: 'box', color: '#dc2626' },
  { cat: 'dairy-breakfast', name: 'Kellogg\'s Chocos Crunchy Chocolate Bites', brand: 'Kellogg\'s', weight: '1.2 kg', price: 425, mrp: 499, packaging: 'box', color: '#451a03' },
  { cat: 'dairy-breakfast', name: 'Kellogg\'s Special K Protein Fibre Cereal', brand: 'Kellogg\'s', weight: '900 g', price: 430, mrp: 495, packaging: 'box', color: '#b91c1c' },
  { cat: 'dairy-breakfast', name: 'Bagrry\'s White Rolled Oats 100% Wholegrain', brand: 'Bagrry\'s', weight: '1 kg', price: 180, mrp: 220, packaging: 'pouch', color: '#a16207' },
  { cat: 'dairy-breakfast', name: 'Quaker Instant Rolled Oats Breakfast', brand: 'Quaker', weight: '1 kg', price: 190, mrp: 230, packaging: 'pouch', color: '#1e3a8a' },
  { cat: 'dairy-breakfast', name: 'Saffola Masala Oats Classic Masala Burst', brand: 'Saffola', weight: '500 g', price: 155, mrp: 180, packaging: 'pouch', color: '#ea580c' },
  { cat: 'dairy-breakfast', name: 'Nutella Hazelnut Cocoa Spread Jar', brand: 'Nutella', weight: '750 g', price: 699, mrp: 799, packaging: 'jar', color: '#451a03' },
  { cat: 'dairy-breakfast', name: 'Kissan Fresh Tomato Ketchup Bottle', brand: 'Kissan', weight: '1 kg', price: 125, mrp: 145, packaging: 'bottle', color: '#dc2626' },
  { cat: 'dairy-breakfast', name: 'Kissan Mixed Fruit Jam Sweet Spread', brand: 'Kissan', weight: '1 kg', price: 240, mrp: 275, packaging: 'jar', color: '#9f1239' },
  { cat: 'dairy-breakfast', name: 'Sundrop Creamy Peanut Butter Jar', brand: 'Sundrop', weight: '924 g', price: 299, mrp: 350, packaging: 'jar', color: '#b45309' },
  { cat: 'dairy-breakfast', name: 'Pintola All-Natural Crunchy Peanut Butter', brand: 'Pintola', weight: '1 kg', price: 425, mrp: 499, packaging: 'jar', color: '#854d0e' },
  { cat: 'dairy-breakfast', name: 'Dabur 100% Pure Squeezy Honey', brand: 'Dabur', weight: '1 kg', price: 399, mrp: 470, packaging: 'bottle', color: '#ca8a04' },
  { cat: 'dairy-breakfast', name: 'Lion Pure Arabian Seedless Dates Box', brand: 'Lion', weight: '500 g', price: 199, mrp: 240, packaging: 'box', color: '#78350f' },
  { cat: 'dairy-breakfast', name: 'Amul Mithai Mate Sweetened Condensed Milk', brand: 'Amul', weight: '400 g', price: 135, mrp: 145, packaging: 'can', color: '#0284c7' },
  { cat: 'dairy-breakfast', name: 'Nestle Everyday Dairy Whitener Pouch', brand: 'Nestle', weight: '1 kg', price: 490, mrp: 540, packaging: 'pouch', color: '#1d4ed8' },
  { cat: 'dairy-breakfast', name: 'Amul Pro Whey Protein Chocolate Malt', brand: 'Amul', weight: '500 g', price: 210, mrp: 240, packaging: 'jar', color: '#6d28d9' },
  { cat: 'dairy-breakfast', name: 'Mother Dairy Pure Cow Ghee Tin', brand: 'Mother Dairy', weight: '1 L', price: 675, mrp: 740, packaging: 'can', color: '#ca8a04' },
  { cat: 'dairy-breakfast', name: 'Govind Milk Farm Fresh Desi Butter Tub', brand: 'Govind', weight: '500 g', price: 270, mrp: 295, packaging: 'box', color: '#f59e0b' },

  // 5. Rice, Atta & Pulses (30 SKUs)
  { cat: 'rice-flours-pulses', name: 'Royal Basmati Rice Aged Long Grain', brand: 'India Gate', weight: '5 kg', price: 549, mrp: 675, packaging: 'pouch', color: '#15803d' },
  { cat: 'rice-flours-pulses', name: 'India Gate Basmati Rice Classic Premium', brand: 'India Gate', weight: '5 kg', price: 699, mrp: 850, packaging: 'pouch', color: '#166534' },
  { cat: 'rice-flours-pulses', name: 'Daawat Rozana Gold Basmati Rice', brand: 'Daawat', weight: '5 kg', price: 440, mrp: 525, packaging: 'pouch', color: '#b45309' },
  { cat: 'rice-flours-pulses', name: 'Daawat Super Basmati Rice Aromatic', brand: 'Daawat', weight: '5 kg', price: 620, mrp: 750, packaging: 'pouch', color: '#d97706' },
  { cat: 'rice-flours-pulses', name: 'Fortune Everyday Full Grain Basmati', brand: 'Fortune', weight: '5 kg', price: 399, mrp: 490, packaging: 'pouch', color: '#2563eb' },
  { cat: 'rice-flours-pulses', name: 'Aashirvaad Shudh Chakki Atta 100% Whole Wheat', brand: 'Aashirvaad', weight: '10 kg', price: 445, mrp: 495, packaging: 'pouch', color: '#ea580c' },
  { cat: 'rice-flours-pulses', name: 'Aashirvaad Select Sharbati Wheat Atta', brand: 'Aashirvaad', weight: '5 kg', price: 295, mrp: 340, packaging: 'pouch', color: '#c2410c' },
  { cat: 'rice-flours-pulses', name: 'Aashirvaad Multigrains High Fibre Atta', brand: 'Aashirvaad', weight: '5 kg', price: 320, mrp: 375, packaging: 'pouch', color: '#9a3412' },
  { cat: 'rice-flours-pulses', name: 'Pillsbury Chakki Fresh Whole Wheat Atta', brand: 'Pillsbury', weight: '10 kg', price: 435, mrp: 485, packaging: 'pouch', color: '#0284c7' },
  { cat: 'rice-flours-pulses', name: 'Fortune Chakki Fresh Pure Wheat Flour', brand: 'Fortune', weight: '10 kg', price: 420, mrp: 475, packaging: 'pouch', color: '#2563eb' },
  { cat: 'rice-flours-pulses', name: 'Tata Sampann Unpolished Toor Dal', brand: 'Tata Sampann', weight: '1 kg', price: 175, mrp: 210, packaging: 'pouch', color: '#ca8a04' },
  { cat: 'rice-flours-pulses', name: 'Tata Sampann Unpolished Moong Dal Split', brand: 'Tata Sampann', weight: '1 kg', price: 145, mrp: 180, packaging: 'pouch', color: '#65a30d' },
  { cat: 'rice-flours-pulses', name: 'Tata Sampann Unpolished Chana Dal', brand: 'Tata Sampann', weight: '1 kg', price: 115, mrp: 140, packaging: 'pouch', color: '#eab308' },
  { cat: 'rice-flours-pulses', name: 'Tata Sampann Unpolished Urad Dal Black', brand: 'Tata Sampann', weight: '1 kg', price: 165, mrp: 195, packaging: 'pouch', color: '#18181b' },
  { cat: 'rice-flours-pulses', name: 'Tata Sampann Unpolished Masoor Dal Red', brand: 'Tata Sampann', weight: '1 kg', price: 125, mrp: 155, packaging: 'pouch', color: '#f97316' },
  { cat: 'rice-flours-pulses', name: 'Fortune Unpolished Kabuli Chana Chickpeas', brand: 'Fortune', weight: '1 kg', price: 185, mrp: 220, packaging: 'pouch', color: '#d97706' },
  { cat: 'rice-flours-pulses', name: 'Rajma Chitra Himalayan Kidney Beans', brand: 'Organic Tattva', weight: '1 kg', price: 199, mrp: 240, packaging: 'pouch', color: '#b91c1c' },
  { cat: 'rice-flours-pulses', name: 'Tata Sampann 100% Pure Besan Gram Flour', brand: 'Tata Sampann', weight: '1 kg', price: 95, mrp: 120, packaging: 'pouch', color: '#eab308' },
  { cat: 'rice-flours-pulses', name: 'Aashirvaad Superior Quality Sooji Rava', brand: 'Aashirvaad', weight: '1 kg', price: 65, mrp: 75, packaging: 'pouch', color: '#ca8a04' },
  { cat: 'rice-flours-pulses', name: 'Aashirvaad Fine Maida All Purpose Flour', brand: 'Aashirvaad', weight: '1 kg', price: 55, mrp: 65, packaging: 'pouch', color: '#e2e8f0' },
  { cat: 'rice-flours-pulses', name: 'Organic Tattva Brown Basmati Rice', brand: 'Organic Tattva', weight: '1 kg', price: 145, mrp: 185, packaging: 'pouch', color: '#854d0e' },
  { cat: 'rice-flours-pulses', name: 'Poha Thick Flattened Beaten Rice', brand: 'Tata Sampann', weight: '1 kg', price: 75, mrp: 90, packaging: 'pouch', color: '#fef08a' },
  { cat: 'rice-flours-pulses', name: 'Organic Sona Masoori Raw Rice', brand: '24 Mantra', weight: '5 kg', price: 425, mrp: 499, packaging: 'pouch', color: '#15803d' },
  { cat: 'rice-flours-pulses', name: 'Organic Pearl Barley Wholegrain Pack', brand: '24 Mantra', weight: '500 g', price: 85, mrp: 105, packaging: 'pouch', color: '#a16207' },
  { cat: 'rice-flours-pulses', name: 'Nutrela Soya Chunks Protein Rich', brand: 'Nutrela', weight: '1 kg', price: 160, mrp: 195, packaging: 'pouch', color: '#ca8a04' },
  { cat: 'rice-flours-pulses', name: 'Nutrela Mini Soya Chunks Pack', brand: 'Nutrela', weight: '500 g', price: 85, mrp: 105, packaging: 'pouch', color: '#d97706' },
  { cat: 'rice-flours-pulses', name: 'Tata Salt Vaccum Evaporated Iodised', brand: 'Tata Salt', weight: '1 kg', price: 28, mrp: 30, packaging: 'pouch', color: '#1e3a8a' },
  { cat: 'rice-flours-pulses', name: 'Tata Salt Lite Low Sodium Iodised', brand: 'Tata Salt', weight: '1 kg', price: 45, mrp: 50, packaging: 'pouch', color: '#0284c7' },
  { cat: 'rice-flours-pulses', name: 'Puro Healthy Pink Rock Salt Mineral Rich', brand: 'Puro', weight: '1 kg', price: 99, mrp: 120, packaging: 'pouch', color: '#f43f5e' },
  { cat: 'rice-flours-pulses', name: 'Madhur Pure & Hygienic Sulphur Free Sugar', brand: 'Madhur', weight: '5 kg', price: 245, mrp: 280, packaging: 'pouch', color: '#3b82f6' },

  // 6. Spices & Cooking Oils (30 SKUs)
  { cat: 'spices-cooking-essentials', name: 'Fortune Sunlite Refined Sunflower Oil', brand: 'Fortune', weight: '5 L', price: 685, mrp: 799, packaging: 'bottle', color: '#eab308' },
  { cat: 'spices-cooking-essentials', name: 'Saffola Gold Pro Healthy Heart Edible Oil', brand: 'Saffola', weight: '5 L', price: 849, mrp: 999, packaging: 'bottle', color: '#ea580c' },
  { cat: 'spices-cooking-essentials', name: 'Fortune Kachi Ghani Pure Mustard Oil Jar', brand: 'Fortune', weight: '5 L', price: 740, mrp: 880, packaging: 'bottle', color: '#ca8a04' },
  { cat: 'spices-cooking-essentials', name: 'Dhara Kachi Ghani Mustard Oil Bottle', brand: 'Dhara', weight: '1 L', price: 155, mrp: 180, packaging: 'bottle', color: '#a16207' },
  { cat: 'spices-cooking-essentials', name: 'Figaro Pure Extra Virgin Olive Oil Tin', brand: 'Figaro', weight: '1 L', price: 899, mrp: 1100, packaging: 'can', color: '#15803d' },
  { cat: 'spices-cooking-essentials', name: 'Borges Extra Light Olive Oil Cooking', brand: 'Borges', weight: '2 L', price: 1650, mrp: 1999, packaging: 'bottle', color: '#166534' },
  { cat: 'spices-cooking-essentials', name: 'Amul Pure Desi Ghee 100% Cow Milk', brand: 'Amul', weight: '1 L', price: 650, mrp: 720, packaging: 'box', color: '#ca8a04' },
  { cat: 'spices-cooking-essentials', name: 'Aashirvaad Svasti Pure Cow Ghee Jar', brand: 'Aashirvaad', weight: '1 L', price: 699, mrp: 780, packaging: 'jar', color: '#d97706' },
  { cat: 'spices-cooking-essentials', name: 'Everest Turmeric Powder Pure Haldi', brand: 'Everest', weight: '500 g', price: 165, mrp: 190, packaging: 'pouch', color: '#eab308' },
  { cat: 'spices-cooking-essentials', name: 'Everest Red Chilli Powder Tikhalal Hot', brand: 'Everest', weight: '500 g', price: 215, mrp: 250, packaging: 'pouch', color: '#dc2626' },
  { cat: 'spices-cooking-essentials', name: 'Everest Coriander Powder Fresh Dhaniya', brand: 'Everest', weight: '500 g', price: 145, mrp: 170, packaging: 'pouch', color: '#65a30d' },
  { cat: 'spices-cooking-essentials', name: 'Everest Garam Masala Authentic Blend', brand: 'Everest', weight: '200 g', price: 110, mrp: 130, packaging: 'box', color: '#78350f' },
  { cat: 'spices-cooking-essentials', name: 'Everest Chicken Masala Aromatic Spice', brand: 'Everest', weight: '200 g', price: 105, mrp: 125, packaging: 'box', color: '#b91c1c' },
  { cat: 'spices-cooking-essentials', name: 'MDH Deggi Mirch Natural Kashmiri Chilli', brand: 'MDH', weight: '500 g', price: 260, mrp: 295, packaging: 'box', color: '#b91c1c' },
  { cat: 'spices-cooking-essentials', name: 'MDH Chana Masala Savoury Blend Box', brand: 'MDH', weight: '100 g', price: 58, mrp: 68, packaging: 'box', color: '#ca8a04' },
  { cat: 'spices-cooking-essentials', name: 'MDH Kitchen King All Purpose Masala', brand: 'MDH', weight: '200 g', price: 120, mrp: 140, packaging: 'box', color: '#c2410c' },
  { cat: 'spices-cooking-essentials', name: 'Catch Table Salt Sprinkler Dispenser', brand: 'Catch', weight: '200 g', price: 40, mrp: 45, packaging: 'bottle', color: '#1e3a8a' },
  { cat: 'spices-cooking-essentials', name: 'Catch Black Pepper Powder Sprinkler', brand: 'Catch', weight: '100 g', price: 95, mrp: 110, packaging: 'bottle', color: '#18181b' },
  { cat: 'spices-cooking-essentials', name: 'Catch Chat Masala Tangy Sprinkler', brand: 'Catch', weight: '100 g', price: 65, mrp: 75, packaging: 'bottle', color: '#ca8a04' },
  { cat: 'spices-cooking-essentials', name: 'Dabur Hommade Ginger Garlic Paste Tub', brand: 'Dabur', weight: '400 g', price: 85, mrp: 99, packaging: 'pouch', color: '#b45309' },
  { cat: 'spices-cooking-essentials', name: 'Smith & Jones Pure Ginger Garlic Paste', brand: 'Smith & Jones', weight: '200 g', price: 45, mrp: 50, packaging: 'pouch', color: '#ca8a04' },
  { cat: 'spices-cooking-essentials', name: 'Tata Sampann Hing Pure Bandhani Asafoetida', brand: 'Tata Sampann', weight: '50 g', price: 90, mrp: 105, packaging: 'bottle', color: '#eab308' },
  { cat: 'spices-cooking-essentials', name: 'Urban Platter Whole Green Cardamom Pods', brand: 'Urban Platter', weight: '100 g', price: 349, mrp: 399, packaging: 'jar', color: '#15803d' },
  { cat: 'spices-cooking-essentials', name: 'Urban Platter Ceylon Cinnamon Sticks', brand: 'Urban Platter', weight: '100 g', price: 220, mrp: 260, packaging: 'jar', color: '#78350f' },
  { cat: 'spices-cooking-essentials', name: 'Urban Platter Whole Cloves Laung Pack', brand: 'Urban Platter', weight: '100 g', price: 185, mrp: 220, packaging: 'jar', color: '#451a03' },
  { cat: 'spices-cooking-essentials', name: 'Organic Tattva Whole Cumin Seeds Jeera', brand: 'Organic Tattva', weight: '500 g', price: 299, mrp: 360, packaging: 'pouch', color: '#854d0e' },
  { cat: 'spices-cooking-essentials', name: 'Organic Tattva Mustard Seeds Black Rai', brand: 'Organic Tattva', weight: '500 g', price: 110, mrp: 135, packaging: 'pouch', color: '#18181b' },
  { cat: 'spices-cooking-essentials', name: 'Patanjali Pure Mustard Oil Kachi Ghani', brand: 'Patanjali', weight: '1 L', price: 145, mrp: 165, packaging: 'bottle', color: '#d97706' },
  { cat: 'spices-cooking-essentials', name: 'Mother\'s Recipe Mango Pickle Authentic', brand: 'Mother\'s Recipe', weight: '500 g', price: 125, mrp: 145, packaging: 'jar', color: '#b91c1c' },
  { cat: 'spices-cooking-essentials', name: 'Mother\'s Recipe Mixed Vegetable Pickle', brand: 'Mother\'s Recipe', weight: '500 g', price: 125, mrp: 145, packaging: 'jar', color: '#c2410c' },

  // 7. Instant & Packaged Foods (30 SKUs)
  { cat: 'instant-packaged-foods', name: 'Maggi 2-Minute Masala Instant Noodles 12-Pack', brand: 'Nestle Maggi', weight: '840 g', price: 155, mrp: 168, packaging: 'box', color: '#facc15' },
  { cat: 'instant-packaged-foods', name: 'Maggi Special Masala Spicy Noodles 4-Pack', brand: 'Nestle Maggi', weight: '280 g', price: 72, mrp: 80, packaging: 'pouch', color: '#dc2626' },
  { cat: 'instant-packaged-foods', name: 'Maggi Cuppa Masala Instant Cup Noodles', brand: 'Nestle Maggi', weight: '70 g', price: 45, mrp: 50, packaging: 'can', color: '#eab308' },
  { cat: 'instant-packaged-foods', name: 'Yippee! Mood Masala Instant Noodles 8-Pack', brand: 'Sunfeast', weight: '560 g', price: 110, mrp: 120, packaging: 'box', color: '#ea580c' },
  { cat: 'instant-packaged-foods', name: 'Ching\'s Secret Schezwan Instant Noodles', brand: 'Ching\'s Secret', weight: '240 g', price: 55, mrp: 60, packaging: 'pouch', color: '#b91c1c' },
  { cat: 'instant-packaged-foods', name: 'Top Ramen Curry Smoodles Noodles Pack', brand: 'Top Ramen', weight: '280 g', price: 50, mrp: 55, packaging: 'pouch', color: '#f59e0b' },
  { cat: 'instant-packaged-foods', name: 'Borges Penne Rigate Durum Wheat Pasta', brand: 'Borges', weight: '500 g', price: 140, mrp: 175, packaging: 'box', color: '#ca8a04' },
  { cat: 'instant-packaged-foods', name: 'Borges Fusilli Spirali Authentic Italian', brand: 'Borges', weight: '500 g', price: 140, mrp: 175, packaging: 'box', color: '#b45309' },
  { cat: 'instant-packaged-foods', name: 'Barilla Spaghetti n.5 Italian Pasta', brand: 'Barilla', weight: '500 g', price: 215, mrp: 260, packaging: 'box', color: '#1e3a8a' },
  { cat: 'instant-packaged-foods', name: 'Knorr Classic Thick Tomato Soup Pack', brand: 'Knorr', weight: '53 g', price: 45, mrp: 50, packaging: 'pouch', color: '#dc2626' },
  { cat: 'instant-packaged-foods', name: 'Knorr Sweet Corn Veg Soup Gourmet', brand: 'Knorr', weight: '44 g', price: 45, mrp: 50, packaging: 'pouch', color: '#eab308' },
  { cat: 'instant-packaged-foods', name: 'MTR Ready to Eat Paneer Butter Masala', brand: 'MTR', weight: '300 g', price: 125, mrp: 140, packaging: 'box', color: '#d97706' },
  { cat: 'instant-packaged-foods', name: 'MTR Ready to Eat Dal Makhani Rich Cream', brand: 'MTR', weight: '300 g', price: 110, mrp: 125, packaging: 'box', color: '#78350f' },
  { cat: 'instant-packaged-foods', name: 'MTR Instant Rava Idli Breakfast Mix', brand: 'MTR', weight: '500 g', price: 95, mrp: 110, packaging: 'pouch', color: '#0284c7' },
  { cat: 'instant-packaged-foods', name: 'MTR Instant Dosa Batter Crisp Mix', brand: 'MTR', weight: '500 g', price: 95, mrp: 110, packaging: 'pouch', color: '#f59e0b' },
  { cat: 'instant-packaged-foods', name: 'Gits Instant Gulab Jamun Sweet Mix', brand: 'Gits', weight: '500 g', price: 145, mrp: 170, packaging: 'box', color: '#b91c1c' },
  { cat: 'instant-packaged-foods', name: 'Gits Khaman Dhokla Snack Mix Box', brand: 'Gits', weight: '500 g', price: 120, mrp: 140, packaging: 'box', color: '#eab308' },
  { cat: 'instant-packaged-foods', name: 'Veeba Real Eggless Mayonnaise Squeezy', brand: 'Veeba', weight: '875 g', price: 165, mrp: 195, packaging: 'bottle', color: '#3b82f6' },
  { cat: 'instant-packaged-foods', name: 'Veeba Burger Tartar Creamy Mayo Spread', brand: 'Veeba', weight: '350 g', price: 89, mrp: 99, packaging: 'bottle', color: '#f59e0b' },
  { cat: 'instant-packaged-foods', name: 'Veeba Thousand Island Dressing Bottle', brand: 'Veeba', weight: '300 g', price: 110, mrp: 125, packaging: 'bottle', color: '#f97316' },
  { cat: 'instant-packaged-foods', name: 'Ching\'s Secret Schezwan Chutney Dip', brand: 'Ching\'s Secret', weight: '250 g', price: 85, mrp: 95, packaging: 'jar', color: '#dc2626' },
  { cat: 'instant-packaged-foods', name: 'Ching\'s Secret Dark Soy Sauce Glaze', brand: 'Ching\'s Secret', weight: '200 g', price: 55, mrp: 60, packaging: 'bottle', color: '#18181b' },
  { cat: 'instant-packaged-foods', name: 'Ching\'s Secret Red Chilli Sauce Bottle', brand: 'Ching\'s Secret', weight: '200 g', price: 55, mrp: 60, packaging: 'bottle', color: '#b91c1c' },
  { cat: 'instant-packaged-foods', name: 'Ching\'s Secret Green Chilli Sauce', brand: 'Ching\'s Secret', weight: '200 g', price: 55, mrp: 60, packaging: 'bottle', color: '#15803d' },
  { cat: 'instant-packaged-foods', name: 'Wingreens Farms Cheesy Jalapeno Dip', brand: 'Wingreens', weight: '180 g', price: 99, mrp: 120, packaging: 'box', color: '#16a34a' },
  { cat: 'instant-packaged-foods', name: 'Dr. Oetker FunFoods Eggless Mayo Tub', brand: 'FunFoods', weight: '800 g', price: 155, mrp: 185, packaging: 'jar', color: '#2563eb' },
  { cat: 'instant-packaged-foods', name: 'Suhana Butter Chicken Spice Mix', brand: 'Suhana', weight: '50 g', price: 40, mrp: 45, packaging: 'pouch', color: '#ea580c' },
  { cat: 'instant-packaged-foods', name: 'Suhana Paneer Tikka Masala Mix', brand: 'Suhana', weight: '50 g', price: 40, mrp: 45, packaging: 'pouch', color: '#e11d48' },
  { cat: 'instant-packaged-foods', name: 'Bambino Roasted Vermicelli Seviyan', brand: 'Bambino', weight: '850 g', price: 78, mrp: 90, packaging: 'pouch', color: '#ca8a04' },
  { cat: 'instant-packaged-foods', name: 'Urban Platter Organic Apple Cider Vinegar', brand: 'Urban Platter', weight: '500 ml', price: 399, mrp: 450, packaging: 'bottle', color: '#eab308' },

  // 8. Personal Care & Hygiene (30 SKUs)
  { cat: 'personal-care', name: 'Dettol Original Germ Protection Bathing Soap', brand: 'Dettol', weight: '125 g x 4', price: 185, mrp: 210, packaging: 'box', color: '#16a34a' },
  { cat: 'personal-care', name: 'Dettol Skincare Moisturing Soap Bar', brand: 'Dettol', weight: '125 g x 4', price: 195, mrp: 220, packaging: 'box', color: '#db2777' },
  { cat: 'personal-care', name: 'Lifebuoy Total 10 Antibacterial Soap', brand: 'Lifebuoy', weight: '125 g x 4', price: 140, mrp: 160, packaging: 'box', color: '#dc2626' },
  { cat: 'personal-care', name: 'Dove Cream Beauty Bathing Bar Soft', brand: 'Dove', weight: '100 g x 3', price: 210, mrp: 240, packaging: 'box', color: '#0284c7' },
  { cat: 'personal-care', name: 'Pears Pure & Gentle Glycerin Soap', brand: 'Pears', weight: '125 g x 3', price: 240, mrp: 275, packaging: 'box', color: '#d97706' },
  { cat: 'personal-care', name: 'Head & Shoulders Anti-Dandruff Shampoo', brand: 'Head & Shoulders', weight: '650 ml', price: 499, mrp: 575, packaging: 'bottle', color: '#1e3a8a' },
  { cat: 'personal-care', name: 'Pantene Pro-V Hair Fall Control Shampoo', brand: 'Pantene', weight: '650 ml', price: 475, mrp: 550, packaging: 'bottle', color: '#ca8a04' },
  { cat: 'personal-care', name: 'L\'Oreal Paris Total Repair 5 Shampoo', brand: 'L\'Oreal Paris', weight: '650 ml', price: 549, mrp: 649, packaging: 'bottle', color: '#dc2626' },
  { cat: 'personal-care', name: 'Tresemme Keratin Smooth Keratin Shampoo', brand: 'Tresemme', weight: '580 ml', price: 499, mrp: 580, packaging: 'bottle', color: '#b91c1c' },
  { cat: 'personal-care', name: 'Himalaya Purifying Neem Face Wash', brand: 'Himalaya', weight: '300 ml', price: 280, mrp: 325, packaging: 'bottle', color: '#15803d' },
  { cat: 'personal-care', name: 'Garnier Men Acno Fight Anti-Pimple Wash', brand: 'Garnier', weight: '150 g', price: 240, mrp: 275, packaging: 'bottle', color: '#16a34a' },
  { cat: 'personal-care', name: 'Nivea Soft Light Moisturizing Cream Jar', brand: 'Nivea', weight: '300 ml', price: 320, mrp: 375, packaging: 'jar', color: '#1e3a8a' },
  { cat: 'personal-care', name: 'Nivea Men Cool Kick 48H Roll-On Deodorant', brand: 'Nivea', weight: '50 ml', price: 165, mrp: 199, packaging: 'bottle', color: '#0284c7' },
  { cat: 'personal-care', name: 'Vaseline Intensive Care Deep Moisture Body Lotion', brand: 'Vaseline', weight: '400 ml', price: 299, mrp: 360, packaging: 'bottle', color: '#eab308' },
  { cat: 'personal-care', name: 'Colgate Strong Teeth Calcium Toothpaste', brand: 'Colgate', weight: '500 g', price: 199, mrp: 235, packaging: 'box', color: '#dc2626' },
  { cat: 'personal-care', name: 'Colgate MaxFresh Peppermint Gel Toothpaste', brand: 'Colgate', weight: '300 g', price: 180, mrp: 210, packaging: 'box', color: '#0284c7' },
  { cat: 'personal-care', name: 'Sensodyne Fresh Gel Sensitive Teeth', brand: 'Sensodyne', weight: '150 g', price: 195, mrp: 225, packaging: 'box', color: '#2563eb' },
  { cat: 'personal-care', name: 'Oral-B Sensitive Whitening Toothbrush 4-Pack', brand: 'Oral-B', weight: '4 pcs', price: 140, mrp: 160, packaging: 'box', color: '#0ea5e9' },
  { cat: 'personal-care', name: 'Listerine Cool Mint Mouthwash Large Bottle', brand: 'Listerine', weight: '500 ml', price: 275, mrp: 310, packaging: 'bottle', color: '#059669' },
  { cat: 'personal-care', name: 'Gillette Mach 3 Turbo Razor Cartridges', brand: 'Gillette', weight: '4 blades', price: 499, mrp: 575, packaging: 'box', color: '#1e3a8a' },
  { cat: 'personal-care', name: 'Gillette Classic Shaving Foam Lemon Lime', brand: 'Gillette', weight: '418 g', price: 195, mrp: 225, packaging: 'can', color: '#16a34a' },
  { cat: 'personal-care', name: 'Parachute 100% Pure Coconut Hair Oil', brand: 'Parachute', weight: '600 ml', price: 240, mrp: 270, packaging: 'bottle', color: '#0284c7' },
  { cat: 'personal-care', name: 'Bajaj Almond Drops Non Sticky Hair Oil', brand: 'Bajaj', weight: '500 ml', price: 275, mrp: 320, packaging: 'bottle', color: '#ca8a04' },
  { cat: 'personal-care', name: 'Dabur Amla Hair Oil Pure Herbal', brand: 'Dabur', weight: '450 ml', price: 185, mrp: 215, packaging: 'bottle', color: '#15803d' },
  { cat: 'personal-care', name: 'Whisper Ultra Clean Sanitary Pads XL+', brand: 'Whisper', weight: '44 pads', price: 399, mrp: 460, packaging: 'pouch', color: '#7c3aed' },
  { cat: 'personal-care', name: 'Stayfree Secure Extra Large Cottony Pads', brand: 'Stayfree', weight: '40 pads', price: 260, mrp: 300, packaging: 'pouch', color: '#ec4899' },
  { cat: 'personal-care', name: 'Pampers All Round Protection Baby Diapers L', brand: 'Pampers', weight: '64 pcs', price: 899, mrp: 1099, packaging: 'box', color: '#06b6d4' },
  { cat: 'personal-care', name: 'Himalaya Gentle Baby Shampoo Tear Free', brand: 'Himalaya', weight: '400 ml', price: 240, mrp: 280, packaging: 'bottle', color: '#f59e0b' },
  { cat: 'personal-care', name: 'Johnson\'s Baby Powder Mild & Gentle', brand: 'Johnson\'s', weight: '400 g', price: 265, mrp: 310, packaging: 'bottle', color: '#38bdf8' },
  { cat: 'personal-care', name: 'Wild Stone Edge Long Lasting Body Perfume', brand: 'Wild Stone', weight: '120 ml', price: 199, mrp: 249, packaging: 'can', color: '#0f172a' },

  // 9. Household & Cleaning (30 SKUs)
  { cat: 'household-cleaning', name: 'Surf Excel Matic Top Load Detergent Liquid', brand: 'Surf Excel', weight: '2 L', price: 399, mrp: 460, packaging: 'bottle', color: '#2563eb' },
  { cat: 'household-cleaning', name: 'Surf Excel Matic Front Load Liquid Refill', brand: 'Surf Excel', weight: '2 L', price: 425, mrp: 490, packaging: 'bottle', color: '#1d4ed8' },
  { cat: 'household-cleaning', name: 'Surf Excel Easy Wash Detergent Powder', brand: 'Surf Excel', weight: '5 kg', price: 599, mrp: 690, packaging: 'pouch', color: '#3b82f6' },
  { cat: 'household-cleaning', name: 'Ariel Matic Front Load Washing Powder', brand: 'Ariel', weight: '4 kg', price: 799, mrp: 950, packaging: 'box', color: '#059669' },
  { cat: 'household-cleaning', name: 'Tide Plus Double Power Detergent Jasmine', brand: 'Tide', weight: '5 kg', price: 499, mrp: 575, packaging: 'pouch', color: '#ea580c' },
  { cat: 'household-cleaning', name: 'Comfort After Wash Morning Fresh Fabric Conditioner', brand: 'Comfort', weight: '2 L', price: 430, mrp: 499, packaging: 'bottle', color: '#0284c7' },
  { cat: 'household-cleaning', name: 'Vim Dishwash Liquid Gel Lemon Fragrance', brand: 'Vim', weight: '2 L', price: 375, mrp: 425, packaging: 'bottle', color: '#eab308' },
  { cat: 'household-cleaning', name: 'Vim Dishwash Bar Pure Lemon Power 4-Pack', brand: 'Vim', weight: '800 g', price: 75, mrp: 85, packaging: 'box', color: '#84cc16' },
  { cat: 'household-cleaning', name: 'Pril Lime Dishwashing Degreaser Liquid', brand: 'Pril', weight: '750 ml', price: 165, mrp: 190, packaging: 'bottle', color: '#22c55e' },
  { cat: 'household-cleaning', name: 'Lizol Disinfectant Surface Floor Cleaner Citrus', brand: 'Lizol', weight: '2 L', price: 345, mrp: 399, packaging: 'bottle', color: '#ea580c' },
  { cat: 'household-cleaning', name: 'Lizol Disinfectant Floor Cleaner Floral Pine', brand: 'Lizol', weight: '2 L', price: 345, mrp: 399, packaging: 'bottle', color: '#b91c1c' },
  { cat: 'household-cleaning', name: 'Harpic Power Plus Disinfectant Toilet Cleaner', brand: 'Harpic', weight: '1 L', price: 195, mrp: 220, packaging: 'bottle', color: '#1e3a8a' },
  { cat: 'household-cleaning', name: 'Harpic Flushmatic In-Cistern Toilet Block', brand: 'Harpic', weight: '100 g', price: 110, mrp: 125, packaging: 'box', color: '#0284c7' },
  { cat: 'household-cleaning', name: 'Colin Glass & Multi-Surface Cleaner Spray', brand: 'Colin', weight: '1 L', price: 175, mrp: 199, packaging: 'bottle', color: '#0284c7' },
  { cat: 'household-cleaning', name: 'Dettol Antiseptic Liquid Disinfectant', brand: 'Dettol', weight: '1 L', price: 330, mrp: 370, packaging: 'bottle', color: '#b45309' },
  { cat: 'household-cleaning', name: 'Godrej Aer Pocket Bathroom Fragrance 3-Pack', brand: 'Godrej Aer', weight: '3 pcs', price: 165, mrp: 195, packaging: 'box', color: '#9333ea' },
  { cat: 'household-cleaning', name: 'Odonil Room Air Freshener Jasmine Block', brand: 'Odonil', weight: '150 g', price: 85, mrp: 99, packaging: 'box', color: '#7c3aed' },
  { cat: 'household-cleaning', name: 'All Out Ultra Mosquito Repellent Machine + Refill', brand: 'All Out', weight: '45 ml', price: 125, mrp: 140, packaging: 'box', color: '#dc2626' },
  { cat: 'household-cleaning', name: 'Goodknight Gold Flash Mosquito Vaporizer Refill', brand: 'Goodknight', weight: '45 ml x 2', price: 155, mrp: 175, packaging: 'box', color: '#b91c1c' },
  { cat: 'household-cleaning', name: 'Hit Flying Insect Mosquito Killer Spray Can', brand: 'Hit', weight: '625 ml', price: 295, mrp: 335, packaging: 'can', color: '#18181b' },
  { cat: 'household-cleaning', name: 'Hit Anti-Cockroach Spray Fresh Fragrance', brand: 'Hit', weight: '625 ml', price: 295, mrp: 335, packaging: 'can', color: '#dc2626' },
  { cat: 'household-cleaning', name: 'Scotch-Brite Sponge Scrubbers Value 3-Pack', brand: 'Scotch-Brite', weight: '3 pcs', price: 85, mrp: 99, packaging: 'pouch', color: '#16a34a' },
  { cat: 'household-cleaning', name: 'Scotch-Brite Stainless Steel Scrubber 3-Pack', brand: 'Scotch-Brite', weight: '3 pcs', price: 95, mrp: 110, packaging: 'box', color: '#94a3b8' },
  { cat: 'household-cleaning', name: 'Gala Spin Mop Quick Ergo Bucket Set', brand: 'Gala', weight: '1 set', price: 1299, mrp: 1699, packaging: 'box', color: '#0284c7' },
  { cat: 'household-cleaning', name: 'Gala NoDust Broom Ergonomic Handle', brand: 'Gala', weight: '1 pc', price: 199, mrp: 240, packaging: 'box', color: '#059669' },
  { cat: 'household-cleaning', name: 'Origami Luxury Toilet Paper Rolls 6-Pack', brand: 'Origami', weight: '6 rolls', price: 210, mrp: 240, packaging: 'pouch', color: '#38bdf8' },
  { cat: 'household-cleaning', name: 'Origami 3-Ply Kitchen Towel Roll Pack', brand: 'Origami', weight: '2 rolls', price: 145, mrp: 170, packaging: 'pouch', color: '#0284c7' },
  { cat: 'household-cleaning', name: 'Puro Heavy Duty Garbage Bags Large 30 pcs', brand: 'Puro', weight: '30 bags', price: 140, mrp: 165, packaging: 'pouch', color: '#18181b' },
  { cat: 'household-cleaning', name: 'Hindware Chrome Tap Stainless Descaler', brand: 'Hindware', weight: '500 ml', price: 249, mrp: 299, packaging: 'bottle', color: '#64748b' },
  { cat: 'household-cleaning', name: 'Godrej Protekt Germ Fighter Liquid Handwash', brand: 'Godrej', weight: '1.5 L', price: 199, mrp: 235, packaging: 'bottle', color: '#059669' },

  // 10. Fresh Produce & Fruits (30 SKUs)
  { cat: 'fresh-produce-fruits-veggies', name: 'Shimla Royal Delicious Red Apples Box', brand: 'Farm Fresh', weight: '1 kg', price: 180, mrp: 220, packaging: 'box', color: '#dc2626' },
  { cat: 'fresh-produce-fruits-veggies', name: 'Kashmiri Sweet Green Crisp Apples', brand: 'Farm Fresh', weight: '1 kg', price: 160, mrp: 195, packaging: 'box', color: '#65a30d' },
  { cat: 'fresh-produce-fruits-veggies', name: 'Cavendish Fresh Golden Bananas Bunch', brand: 'Farm Fresh', weight: '1 kg', price: 55, mrp: 65, packaging: 'box', color: '#eab308' },
  { cat: 'fresh-produce-fruits-veggies', name: 'Ratnagiri Alphonso Mangoes Gift Pack', brand: 'Farm Fresh', weight: '1.5 kg (6 pcs)', price: 650, mrp: 799, packaging: 'box', color: '#f59e0b' },
  { cat: 'fresh-produce-fruits-veggies', name: 'Nagpur Sweet Juicy Table Oranges', brand: 'Farm Fresh', weight: '1 kg', price: 90, mrp: 110, packaging: 'box', color: '#ea580c' },
  { cat: 'fresh-produce-fruits-veggies', name: 'Nashik Fresh Red Globe Grapes Punnet', brand: 'Farm Fresh', weight: '500 g', price: 95, mrp: 120, packaging: 'box', color: '#9f1239' },
  { cat: 'fresh-produce-fruits-veggies', name: 'Sweet Indian Papaya Farm Ripened', brand: 'Farm Fresh', weight: '1 pc (1 kg)', price: 60, mrp: 75, packaging: 'box', color: '#f97316' },
  { cat: 'fresh-produce-fruits-veggies', name: 'Organic Royal Anar Pomegranate Rich', brand: 'Farm Fresh', weight: '1 kg', price: 220, mrp: 260, packaging: 'box', color: '#b91c1c' },
  { cat: 'fresh-produce-fruits-veggies', name: 'Fresh Green Seedless Table Guava', brand: 'Farm Fresh', weight: '1 kg', price: 80, mrp: 95, packaging: 'box', color: '#84cc16' },
  { cat: 'fresh-produce-fruits-veggies', name: 'Kashmir Sweet Fresh Strawberries Punnet', brand: 'Farm Fresh', weight: '200 g', price: 120, mrp: 150, packaging: 'box', color: '#e11d48' },
  { cat: 'fresh-produce-fruits-veggies', name: 'Farm Fresh Jyoti Potatoes Bag', brand: 'Farm Fresh', weight: '5 kg', price: 140, mrp: 170, packaging: 'pouch', color: '#ca8a04' },
  { cat: 'fresh-produce-fruits-veggies', name: 'Nashik Pink Pungent Cooking Onions', brand: 'Farm Fresh', weight: '5 kg', price: 165, mrp: 200, packaging: 'pouch', color: '#be185d' },
  { cat: 'fresh-produce-fruits-veggies', name: 'Fresh Hybrid Firm Red Tomatoes', brand: 'Farm Fresh', weight: '2 kg', price: 70, mrp: 90, packaging: 'box', color: '#ef4444' },
  { cat: 'fresh-produce-fruits-veggies', name: 'Delhi Sweet Orange Juicy Carrots', brand: 'Farm Fresh', weight: '1 kg', price: 50, mrp: 65, packaging: 'box', color: '#ea580c' },
  { cat: 'fresh-produce-fruits-veggies', name: 'Fresh Crisp English Cucumber Pack', brand: 'Farm Fresh', weight: '1 kg', price: 45, mrp: 55, packaging: 'box', color: '#22c55e' },
  { cat: 'fresh-produce-fruits-veggies', name: 'Green Crunchy Bell Peppers Capsicum', brand: 'Farm Fresh', weight: '500 g', price: 45, mrp: 55, packaging: 'box', color: '#15803d' },
  { cat: 'fresh-produce-fruits-veggies', name: 'Fresh Green Cauliflower Head', brand: 'Farm Fresh', weight: '1 pc (700 g)', price: 40, mrp: 50, packaging: 'box', color: '#e2e8f0' },
  { cat: 'fresh-produce-fruits-veggies', name: 'Fresh Tender Green Cabbage Head', brand: 'Farm Fresh', weight: '1 pc (800 g)', price: 35, mrp: 45, packaging: 'box', color: '#86efac' },
  { cat: 'fresh-produce-fruits-veggies', name: 'Farm Fresh Tender Ladies Finger Bhindi', brand: 'Farm Fresh', weight: '500 g', price: 40, mrp: 50, packaging: 'box', color: '#16a34a' },
  { cat: 'fresh-produce-fruits-veggies', name: 'Organic Green Baby Spinach Palak', brand: 'Farm Fresh', weight: '250 g bunch', price: 25, mrp: 30, packaging: 'pouch', color: '#166534' },
  { cat: 'fresh-produce-fruits-veggies', name: 'Fresh Aromatic Coriander Leaves Bunch', brand: 'Farm Fresh', weight: '100 g bunch', price: 15, mrp: 20, packaging: 'pouch', color: '#15803d' },
  { cat: 'fresh-produce-fruits-veggies', name: 'Fresh Spicy Green Chillies Bag', brand: 'Farm Fresh', weight: '200 g', price: 20, mrp: 25, packaging: 'pouch', color: '#16a34a' },
  { cat: 'fresh-produce-fruits-veggies', name: 'Fresh Root Ginger Adrak Premium', brand: 'Farm Fresh', weight: '250 g', price: 45, mrp: 55, packaging: 'pouch', color: '#a16207' },
  { cat: 'fresh-produce-fruits-veggies', name: 'Ooty Fresh White Button Mushrooms', brand: 'Farm Fresh', weight: '200 g pack', price: 55, mrp: 65, packaging: 'box', color: '#f1f5f9' },
  { cat: 'fresh-produce-fruits-veggies', name: 'Fresh Baby Sweet Corn Cob Pack', brand: 'Farm Fresh', weight: '250 g pack', price: 45, mrp: 55, packaging: 'box', color: '#fde047' },
  { cat: 'fresh-produce-fruits-veggies', name: 'Fresh Tender Green Peas Matar', brand: 'Farm Fresh', weight: '1 kg', price: 90, mrp: 110, packaging: 'box', color: '#22c55e' },
  { cat: 'fresh-produce-fruits-veggies', name: 'Fresh Farm Broccoli Crown Imported', brand: 'Farm Fresh', weight: '500 g', price: 95, mrp: 120, packaging: 'box', color: '#14532d' },
  { cat: 'fresh-produce-fruits-veggies', name: 'Fresh Sweet Watermelon Whole', brand: 'Farm Fresh', weight: '1 pc (2.5 kg)', price: 99, mrp: 130, packaging: 'box', color: '#15803d' },
  { cat: 'fresh-produce-fruits-veggies', name: 'Fresh Golden Pineapple Sweet Crown', brand: 'Farm Fresh', weight: '1 pc (1 kg)', price: 80, mrp: 100, packaging: 'box', color: '#ca8a04' },
  { cat: 'fresh-produce-fruits-veggies', name: 'Organic Lemon Yellow Juicy Nimbu 6-Pack', brand: 'Farm Fresh', weight: '6 pcs', price: 30, mrp: 35, packaging: 'pouch', color: '#eab308' }
];

console.log('Total products defined:', PRODUCTS_DATA.length);

// Generate 3D coordinates for all 300 products across the 10 aisles
// Aisle X coordinates and layout:
// Aisle 1 (X = -24.0, Z = [-14, 14]) -> Snacks & Namkeen (30 items, 15 Left, 15 Right)
// Aisle 2 (X = -17.5, Z = [-14, 14]) -> Bakery & Biscuits (30 items)
// Aisle 3 (Z = -5.0, X = [-16, -6]) -> Beverages (30 items, North & South)
// Aisle 4 (Z = 5.0, X = [-16, -6]) -> Dairy & Breakfast (30 items)
// Aisle 5 (X = 17.5, Z = [-14, 14]) -> Rice, Atta & Pulses (30 items)
// Aisle 6 (X = 24.0, Z = [-14, 14]) -> Spices & Oils (30 items)
// Aisle 7 (Z = -5.0, X = [6, 16]) -> Instant Foods (30 items)
// Aisle 8 (Z = 5.0, X = [6, 16]) -> Personal Care (30 items)
// Aisle 9 (X = 29.5, Z = [-11, 11]) -> Household & Cleaning (30 items)
// Department 10 (Left Wall, X = -34.8, Z = [-14, 14]) -> Fresh Produce (30 items)

function build3DPlacements() {
  const fullList = [];

  CATEGORIES.forEach((catMeta) => {
    const itemsInCat = PRODUCTS_DATA.filter(p => p.cat === catMeta.id);
    const aisleNum = catMeta.aisleNumber;

    itemsInCat.forEach((raw, idx) => {
      const isLeft = idx < 15;
      const slotIndex = idx % 15; // 0 to 14
      const tierIndex = slotIndex % 3; // 3 vertical shelf tiers: 0=bottom, 1=middle, 2=top
      const bayIndex = Math.floor(slotIndex / 3); // 5 bays along the gondola length

      let worldX, worldY, worldZ, standX, standZ, standYaw, shelfSide;

      // Base vertical shelf heights
      const tierHeights = [0.45, 0.88, 1.32];
      worldY = tierHeights[tierIndex];

      if (aisleNum === 1) { // Longitudinal (X = -24.0)
        worldX = isLeft ? -24.45 : -23.55;
        worldZ = -12.0 + bayIndex * 6.0 + (tierIndex * 0.4);
        shelfSide = isLeft ? 'LEFT' : 'RIGHT';
        standX = isLeft ? -25.8 : -22.2;
        standZ = worldZ;
        standYaw = isLeft ? Math.PI / 2 : -Math.PI / 2;
      } else if (aisleNum === 2) { // Longitudinal (X = -17.5)
        worldX = isLeft ? -17.95 : -17.05;
        worldZ = -12.0 + bayIndex * 6.0 + (tierIndex * 0.4);
        shelfSide = isLeft ? 'LEFT' : 'RIGHT';
        standX = isLeft ? -19.3 : -15.7;
        standZ = worldZ;
        standYaw = isLeft ? Math.PI / 2 : -Math.PI / 2;
      } else if (aisleNum === 3) { // Cross (Z = -5.0, X = [-16, -6])
        worldZ = isLeft ? -5.45 : -4.55;
        worldX = -15.0 + bayIndex * 2.2 + (tierIndex * 0.3);
        shelfSide = isLeft ? 'LEFT' : 'RIGHT';
        standX = worldX;
        standZ = isLeft ? -6.8 : -3.2;
        standYaw = isLeft ? 0 : Math.PI;
      } else if (aisleNum === 4) { // Cross (Z = 5.0, X = [-16, -6])
        worldZ = isLeft ? 4.55 : 5.45;
        worldX = -15.0 + bayIndex * 2.2 + (tierIndex * 0.3);
        shelfSide = isLeft ? 'LEFT' : 'RIGHT';
        standX = worldX;
        standZ = isLeft ? 3.2 : 6.8;
        standYaw = isLeft ? 0 : Math.PI;
      } else if (aisleNum === 5) { // Longitudinal (X = 17.5)
        worldX = isLeft ? 17.05 : 17.95;
        worldZ = -12.0 + bayIndex * 6.0 + (tierIndex * 0.4);
        shelfSide = isLeft ? 'LEFT' : 'RIGHT';
        standX = isLeft ? 15.7 : 19.3;
        standZ = worldZ;
        standYaw = isLeft ? Math.PI / 2 : -Math.PI / 2;
      } else if (aisleNum === 6) { // Longitudinal (X = 24.0)
        worldX = isLeft ? 23.55 : 24.45;
        worldZ = -12.0 + bayIndex * 6.0 + (tierIndex * 0.4);
        shelfSide = isLeft ? 'LEFT' : 'RIGHT';
        standX = isLeft ? 22.2 : 25.8;
        standZ = worldZ;
        standYaw = isLeft ? Math.PI / 2 : -Math.PI / 2;
      } else if (aisleNum === 7) { // Cross (Z = -5.0, X = [6, 16])
        worldZ = isLeft ? -5.45 : -4.55;
        worldX = 7.0 + bayIndex * 2.2 + (tierIndex * 0.3);
        shelfSide = isLeft ? 'LEFT' : 'RIGHT';
        standX = worldX;
        standZ = isLeft ? -6.8 : -3.2;
        standYaw = isLeft ? 0 : Math.PI;
      } else if (aisleNum === 8) { // Cross (Z = 5.0, X = [6, 16])
        worldZ = isLeft ? 4.55 : 5.45;
        worldX = 7.0 + bayIndex * 2.2 + (tierIndex * 0.3);
        shelfSide = isLeft ? 'LEFT' : 'RIGHT';
        standX = worldX;
        standZ = isLeft ? 3.2 : 6.8;
        standYaw = isLeft ? 0 : Math.PI;
      } else if (aisleNum === 9) { // Longitudinal (X = 29.5)
        worldX = isLeft ? 29.05 : 29.95;
        worldZ = -10.0 + bayIndex * 5.0 + (tierIndex * 0.4);
        shelfSide = isLeft ? 'LEFT' : 'RIGHT';
        standX = isLeft ? 27.6 : 31.4;
        standZ = worldZ;
        standYaw = isLeft ? Math.PI / 2 : -Math.PI / 2;
      } else { // Department 10: Produce / Left Wall (X = -34.5)
        worldX = -34.2;
        worldZ = -13.5 + idx * 0.92;
        shelfSide = 'RIGHT';
        standX = -32.8;
        standZ = worldZ;
        standYaw = -Math.PI / 2;
      }

      const slug = raw.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const sku = `MV-${raw.cat.substring(0, 3).toUpperCase()}-${String(idx + 1).padStart(3, '0')}`;
      const rating = parseFloat((4.2 + (idx % 7) * 0.1).toFixed(1));
      const stock = 18 + (idx % 25);

      const prodId = `mv-prod-${catMeta.id}-${idx + 1}`;
      const discountPercentage = Math.max(0, Math.round(((raw.mrp - raw.price) / raw.mrp) * 100));

      const prod = {
        id: prodId,
        sku: sku,
        name: raw.name,
        slug: slug,
        description: `Premium quality ${raw.name} from ${raw.brand}. Carefully packed and freshness guaranteed at Martverse.`,
        brand: raw.brand,
        categoryId: catMeta.id,
        category: {
          id: catMeta.id,
          name: catMeta.name,
          slug: catMeta.id
        },
        aisleNumber: aisleNum,
        shelfNumber: tierIndex + 1,
        weight: raw.weight,
        unit: raw.weight,
        price: raw.price,
        mrp: raw.mrp,
        discountPercentage: discountPercentage,
        rating: rating,
        stock: stock,
        stockQuantity: stock,
        inStock: true,
        featured: idx % 10 === 0,
        isVeg: true,
        packageType: raw.packaging,
        packagingType: raw.packaging,
        color: raw.color,
        imageUrl: `/products/${raw.cat}/${slug}.svg`,
        image: `/products/${raw.cat}/${slug}.svg`,
        placement: {
          id: `plc-${prodId}`,
          productId: prodId,
          productName: raw.name,
          productSlug: slug,
          productPrice: raw.price,
          productMrp: raw.mrp,
          aisleId: `aisle-${aisleNum}`,
          aisleCategory: catMeta.name,
          worldX: parseFloat(worldX.toFixed(3)),
          worldY: parseFloat(worldY.toFixed(3)),
          worldZ: parseFloat(worldZ.toFixed(3)),
          rotationY: parseFloat(standYaw.toFixed(3)),
          standX: parseFloat(standX.toFixed(3)),
          standZ: parseFloat(standZ.toFixed(3)),
          standYaw: parseFloat(standYaw.toFixed(3)),
          floorNumber: 1,
          aisleNumber: aisleNum,
          aisleName: catMeta.aisleName,
          shelfTier: tierIndex + 1,
          shelfSide: shelfSide,
          shelfPosition: slotIndex + 1,
          modelType: raw.packaging,
          color: raw.color
        }
      };

      fullList.push(prod);
    });
  });

  return fullList;
}

const canonical300 = build3DPlacements();
console.log('Successfully generated 300 canonical SKUs. Count:', canonical300.length);

// 1. Write backend JSON catalog
const backendJsonPath = path.resolve(__dirname, '../backend/src/main/resources/db/products_catalog.json');
fs.writeFileSync(backendJsonPath, JSON.stringify(canonical300, null, 2), 'utf8');
console.log('Wrote', backendJsonPath);

// 2. Write frontend TypeScript catalog
const frontendTsPath = path.resolve(__dirname, '../frontend/src/lib/productsCatalog.ts');
const tsContent = `// ============================================================================
// CANONICAL MARTVERSE 300-SKU BACKEND PRODUCTS CATALOG
// 10 Hypermarket Departments • 30 SKUs Per Department • Exact 3D Shelf Coordinates
// ============================================================================
import { Product } from '@/types';

export const CANONICAL_BACKEND_PRODUCTS: Product[] = ${JSON.stringify(canonical300, null, 2)};
`;
fs.writeFileSync(frontendTsPath, tsContent, 'utf8');
console.log('Wrote', frontendTsPath);
