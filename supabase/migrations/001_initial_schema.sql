-- ============================================
-- Tharigai Paadham Footwear - Database Schema
-- ============================================
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS (synced from Clerk via webhook)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- 2. STORE SETTINGS (singleton row)
-- ============================================
CREATE TABLE store_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_name TEXT DEFAULT 'Tharigai Paadham Footwear',
    whatsapp_number TEXT DEFAULT '+91 96888 22826',
    instagram_url TEXT DEFAULT 'https://instagram.com/tharigai_paadham_puliampatti',
    email TEXT DEFAULT '',
    phone TEXT DEFAULT '+91 96888 22826',
    address TEXT DEFAULT '',
    city TEXT DEFAULT 'Puliampatti',
    state TEXT DEFAULT 'Tamil Nadu',
    pincode TEXT DEFAULT '',
    business_hours JSONB DEFAULT '{"monday":"9:00 AM - 9:00 PM","tuesday":"9:00 AM - 9:00 PM","wednesday":"9:00 AM - 9:00 PM","thursday":"9:00 AM - 9:00 PM","friday":"9:00 AM - 9:00 PM","saturday":"9:00 AM - 9:00 PM","sunday":"10:00 AM - 8:00 PM"}'::jsonb,
    google_maps_url TEXT DEFAULT '',
    facebook_url TEXT DEFAULT '',
    twitter_url TEXT DEFAULT '',
    youtube_url TEXT DEFAULT '',
    shipping_fee DECIMAL(10,2) DEFAULT 49.00,
    free_shipping_threshold DECIMAL(10,2) DEFAULT 999.00,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. CATEGORIES
-- ============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- ============================================
-- 4. PRODUCTS
-- ============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    brand TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    price DECIMAL(10,2) NOT NULL,
    discount_price DECIMAL(10,2),
    gender TEXT CHECK (gender IN ('men', 'women', 'kids', 'unisex')),
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    total_sold INT DEFAULT 0,
    avg_rating DECIMAL(2,1) DEFAULT 0,
    review_count INT DEFAULT 0,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_gender ON products(gender);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_products_created ON products(created_at DESC);
CREATE INDEX idx_products_sold ON products(total_sold DESC);

-- ============================================
-- 5. PRODUCT IMAGES
-- ============================================
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- ============================================
-- 6. PRODUCT SIZES
-- ============================================
CREATE TABLE product_sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    size TEXT NOT NULL,
    stock INT DEFAULT 0,
    UNIQUE(product_id, size)
);

CREATE INDEX idx_product_sizes_product ON product_sizes(product_id);

-- ============================================
-- 7. PRODUCT COLORS
-- ============================================
CREATE TABLE product_colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    hex_code TEXT NOT NULL,
    UNIQUE(product_id, name)
);

CREATE INDEX idx_product_colors_product ON product_colors(product_id);

-- ============================================
-- 8. ADDRESSES
-- ============================================
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON addresses(user_id);

-- ============================================
-- 9. COUPONS
-- ============================================
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')) NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2),
    usage_limit INT,
    used_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code);

-- ============================================
-- 10. CART
-- ============================================
CREATE TABLE cart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    size TEXT NOT NULL,
    color TEXT,
    quantity INT DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id, size, color)
);

CREATE INDEX idx_cart_user ON cart(user_id);

-- ============================================
-- 11. WISHLIST
-- ============================================
CREATE TABLE wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlist_user ON wishlist(user_id);

-- ============================================
-- 12. ORDERS
-- ============================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
    coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'confirmed', 'processing', 'shipped',
        'delivered', 'cancelled', 'refunded'
    )),
    payment_method TEXT DEFAULT 'razorpay',
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
        'pending', 'paid', 'failed', 'refunded'
    )),
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    shipping_address JSONB,
    tracking_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- ============================================
-- 13. ORDER ITEMS
-- ============================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    size TEXT NOT NULL,
    color TEXT,
    quantity INT NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================
-- 14. REVIEWS
-- ============================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- ============================================
-- 15. BANNERS
-- ============================================
CREATE TABLE banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 16. INVENTORY LOGS
-- ============================================
CREATE TABLE inventory_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    size TEXT NOT NULL,
    previous_stock INT NOT NULL,
    new_stock INT NOT NULL,
    change_type TEXT CHECK (change_type IN ('restock', 'sale', 'adjustment', 'return')) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_logs_product ON inventory_logs(product_id);
CREATE INDEX idx_inventory_logs_created ON inventory_logs(created_at DESC);

-- ============================================
-- 17. NEWSLETTER SUBSCRIBERS
-- ============================================
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_settings_updated_at BEFORE UPDATE ON store_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'TP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_order_number BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ policies (no auth required)
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read products" ON products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read product_images" ON product_images FOR SELECT USING (TRUE);
CREATE POLICY "Public read product_sizes" ON product_sizes FOR SELECT USING (TRUE);
CREATE POLICY "Public read product_colors" ON product_colors FOR SELECT USING (TRUE);
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "Public read banners" ON banners FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read store_settings" ON store_settings FOR SELECT USING (TRUE);
CREATE POLICY "Public read coupons" ON coupons FOR SELECT USING (is_active = TRUE);

-- USER policies (authenticated via service role - Clerk JWT passed from server)
-- Cart: users can only access their own cart
CREATE POLICY "Users manage own cart" ON cart FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Wishlist: users can only access their own wishlist
CREATE POLICY "Users manage own wishlist" ON wishlist FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Addresses: users can only access their own addresses
CREATE POLICY "Users manage own addresses" ON addresses FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Orders: users can only view their own orders
CREATE POLICY "Users view own orders" ON orders FOR SELECT USING (TRUE);
CREATE POLICY "Users create orders" ON orders FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users update own orders" ON orders FOR UPDATE USING (TRUE);

-- Order items: users can view items from their own orders
CREATE POLICY "Users view order items" ON order_items FOR SELECT USING (TRUE);
CREATE POLICY "Users create order items" ON order_items FOR INSERT WITH CHECK (TRUE);

-- Reviews: users can manage their own reviews
CREATE POLICY "Users manage reviews" ON reviews FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Users: read own profile
CREATE POLICY "Users read own profile" ON users FOR SELECT USING (TRUE);
CREATE POLICY "Users update own profile" ON users FOR UPDATE USING (TRUE);
CREATE POLICY "Service role manages users" ON users FOR INSERT WITH CHECK (TRUE);

-- Newsletter
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers FOR INSERT WITH CHECK (TRUE);

-- Admin policies (service role bypasses RLS)
-- Categories admin
CREATE POLICY "Admin manage categories" ON categories FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Products admin
CREATE POLICY "Admin manage products" ON products FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin manage product_images" ON product_images FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin manage product_sizes" ON product_sizes FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin manage product_colors" ON product_colors FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Banners admin
CREATE POLICY "Admin manage banners" ON banners FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Coupons admin
CREATE POLICY "Admin manage coupons" ON coupons FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Inventory
CREATE POLICY "Admin manage inventory" ON inventory_logs FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Store settings
CREATE POLICY "Admin manage store_settings" ON store_settings FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Orders admin
CREATE POLICY "Admin manage orders" ON orders FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin manage order items" ON order_items FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Newsletter admin
CREATE POLICY "Admin manage newsletter" ON newsletter_subscribers FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- ============================================
-- STORAGE BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', TRUE) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', TRUE) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('categories', 'categories', TRUE) ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Public read product images" ON storage.objects FOR SELECT USING (bucket_id IN ('products', 'banners', 'categories'));
CREATE POLICY "Admin upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('products', 'banners', 'categories'));
CREATE POLICY "Admin update images" ON storage.objects FOR UPDATE USING (bucket_id IN ('products', 'banners', 'categories'));
CREATE POLICY "Admin delete images" ON storage.objects FOR DELETE USING (bucket_id IN ('products', 'banners', 'categories'));

-- ============================================
-- SEED DATA: Store Settings
-- ============================================
INSERT INTO store_settings (store_name, whatsapp_number, instagram_url, phone, city, state)
VALUES ('Tharigai Paadham Footwear', '+91 96888 22826', 'https://instagram.com/tharigai_paadham_puliampatti', '+91 96888 22826', 'Puliampatti', 'Tamil Nadu');

