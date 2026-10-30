-- ============================================================
-- MARTVERSE Database Schema
-- Supabase PostgreSQL
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS & AUTH
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_profiles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name       VARCHAR(255),
    phone           VARCHAR(20),
    avatar_url      VARCHAR(500),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PRODUCT CATALOG
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    parent_id       UUID REFERENCES categories(id),
    floor_number    INTEGER NOT NULL DEFAULT 1,
    image_url       VARCHAR(500),
    display_order   INTEGER NOT NULL DEFAULT 0,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku             VARCHAR(50) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(150) UNIQUE,
    description     TEXT,
    brand           VARCHAR(100),
    category_id     UUID NOT NULL REFERENCES categories(id),
    price           DECIMAL(10,2) NOT NULL,
    discount_price  DECIMAL(10,2),
    image_url       VARCHAR(500),
    has_variants    BOOLEAN NOT NULL DEFAULT FALSE,
    weight          VARCHAR(50),
    unit            VARCHAR(20),
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_variants (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size            VARCHAR(20),
    color           VARCHAR(50),
    color_hex       VARCHAR(7),
    sku_suffix      VARCHAR(20) NOT NULL,
    price_override  DECIMAL(10,2),
    image_url       VARCHAR(500),
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(product_id, sku_suffix)
);

CREATE TABLE IF NOT EXISTS inventory (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id      UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    stock_quantity  INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER NOT NULL DEFAULT 5,
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(product_id, variant_id)
);

-- ============================================================
-- SUPERMARKET LAYOUT
-- ============================================================
CREATE TABLE IF NOT EXISTS supermarket_floors (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    floor_number    INTEGER NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    height_offset   DECIMAL(6,2) NOT NULL DEFAULT 0,
    length          DECIMAL(6,2) NOT NULL DEFAULT 50.0,
    width           DECIMAL(6,2) NOT NULL DEFAULT 36.0,
    height          DECIMAL(6,2) NOT NULL DEFAULT 4.5,
    active          BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS supermarket_aisles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    floor_id        UUID NOT NULL REFERENCES supermarket_floors(id),
    aisle_number    INTEGER NOT NULL,
    name            VARCHAR(100) NOT NULL,
    category_id     UUID REFERENCES categories(id),
    position_x      DECIMAL(8,2) NOT NULL DEFAULT 0,
    position_z      DECIMAL(8,2) NOT NULL DEFAULT 0,
    start_x         DECIMAL(8,2) NOT NULL DEFAULT 0,
    start_z         DECIMAL(8,2) NOT NULL DEFAULT -12.0,
    end_x           DECIMAL(8,2) NOT NULL DEFAULT 0,
    end_z           DECIMAL(8,2) NOT NULL DEFAULT 12.0,
    shelf_height    DECIMAL(4,2) NOT NULL DEFAULT 2.8,
    shelf_tiers     INTEGER NOT NULL DEFAULT 3,
    color_code      VARCHAR(20) NOT NULL DEFAULT '#10b981',
    banner_text     VARCHAR(255),
    length          DECIMAL(8,2) NOT NULL DEFAULT 24.0,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE(floor_id, aisle_number)
);

CREATE TABLE IF NOT EXISTS product_placements (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    floor_id        UUID NOT NULL REFERENCES supermarket_floors(id),
    aisle_id        UUID NOT NULL REFERENCES supermarket_aisles(id),
    shelf_side      VARCHAR(10) NOT NULL DEFAULT 'LEFT',
    shelf_level     INTEGER NOT NULL DEFAULT 2,
    position_index  INTEGER NOT NULL DEFAULT 1,
    display_type    VARCHAR(20) NOT NULL DEFAULT 'BOX',
    world_x         DECIMAL(8,2),
    world_y         DECIMAL(8,2),
    world_z         DECIMAL(8,2),
    rotation_y      DECIMAL(8,4),
    color           VARCHAR(30),
    model_type      VARCHAR(30),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SHOPPING CART
-- ============================================================
CREATE TABLE IF NOT EXISTS carts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id      VARCHAR(100),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id         UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id),
    variant_id      UUID REFERENCES product_variants(id),
    quantity        INTEGER NOT NULL DEFAULT 1,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(cart_id, product_id, variant_id)
);

-- ============================================================
-- BILLING SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS billing_sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id         UUID NOT NULL REFERENCES carts(id),
    user_id         UUID REFERENCES users(id),
    status          VARCHAR(30) NOT NULL DEFAULT 'CREATED',
    scanned_count   INTEGER NOT NULL DEFAULT 0,
    subtotal        DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount      DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount    DECIMAL(10,2) NOT NULL DEFAULT 0,
    counter_number  INTEGER NOT NULL DEFAULT 1,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS addresses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id),
    full_name       VARCHAR(255) NOT NULL,
    phone           VARCHAR(20) NOT NULL,
    email           VARCHAR(255),
    address_type    VARCHAR(30) DEFAULT 'HOME',
    house_no        VARCHAR(255),
    area            VARCHAR(255),
    landmark        VARCHAR(255),
    address_line1   VARCHAR(500) NOT NULL,
    address_line2   VARCHAR(500),
    city            VARCHAR(100) NOT NULL,
    state           VARCHAR(100) NOT NULL,
    pin_code        VARCHAR(10) NOT NULL,
    delivery_instructions TEXT,
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id),
    order_number    VARCHAR(30) NOT NULL UNIQUE,
    billing_session_id UUID REFERENCES billing_sessions(id),
    address_id      UUID REFERENCES addresses(id),
    status          VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    subtotal        DECIMAL(10,2) NOT NULL,
    tax_amount      DECIMAL(10,2) NOT NULL DEFAULT 0,
    delivery_charge DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount    DECIMAL(10,2) NOT NULL,
    fulfilment_type VARCHAR(20) NOT NULL DEFAULT 'DELIVERY',
    notes           TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id),
    variant_id      UUID REFERENCES product_variants(id),
    product_name    VARCHAR(255) NOT NULL,
    product_sku     VARCHAR(70) NOT NULL,
    variant_info    VARCHAR(100),
    unit_price      DECIMAL(10,2) NOT NULL,
    quantity        INTEGER NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    line_total      DECIMAL(10,2) NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id            UUID NOT NULL REFERENCES orders(id),
    payment_method      VARCHAR(30) NOT NULL DEFAULT 'CARD',
    payment_provider    VARCHAR(30) NOT NULL DEFAULT 'PAYMENT_GATEWAY',
    provider_order_id   VARCHAR(100),
    provider_payment_id VARCHAR(100),
    provider_signature  VARCHAR(500),
    amount              DECIMAL(10,2) NOT NULL,
    currency            VARCHAR(3) NOT NULL DEFAULT 'INR',
    status              VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    test_mode           BOOLEAN NOT NULL DEFAULT FALSE,
    failure_reason      TEXT,
    paid_at             TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_status_history (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status          VARCHAR(30) NOT NULL,
    notes           TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_variant ON inventory(variant_id);
CREATE INDEX IF NOT EXISTS idx_product_placements_aisle ON product_placements(aisle_id);
CREATE INDEX IF NOT EXISTS idx_product_placements_floor ON product_placements(floor_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_carts_user ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
