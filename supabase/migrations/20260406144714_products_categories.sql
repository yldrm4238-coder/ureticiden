-- Create categories table
CREATE TABLE public.categories (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    slug text not null unique,
    image text,
    count integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create products table
CREATE TABLE public.products (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    category_slug text references public.categories(slug) on delete restrict,
    image text,
    description text,
    price numeric,
    price_type text not null check (price_type in ('kg', 'ton', 'negotiable', 'quote')),
    min_order text,
    harvest_date text,
    stock text,
    city text,
    district text,
    producer_id uuid references public.profiles(id) on delete cascade not null,
    is_organic boolean default false,
    is_verified boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Turn on RLS for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Categories RLS policies
-- Allow public read access to categories
CREATE POLICY "Categories are viewable by everyone."
  ON public.categories FOR SELECT
  USING ( true );

-- Products RLS policies
-- Allow public read access
CREATE POLICY "Products are viewable by everyone."
  ON public.products FOR SELECT
  USING ( true );

-- Insert policy for authenticated farmers
CREATE POLICY "Farmers can insert products"
  ON public.products FOR INSERT
  WITH CHECK (
    auth.uid() = producer_id
    AND public.has_role('farmer', auth.uid())
  );

-- Update policy for authenticated farmers
CREATE POLICY "Farmers can update own products"
  ON public.products FOR UPDATE
  USING (
    auth.uid() = producer_id
    AND public.has_role('farmer', auth.uid())
  )
  WITH CHECK (
    auth.uid() = producer_id
    AND public.has_role('farmer', auth.uid())
  );

-- Delete policy for authenticated farmers
CREATE POLICY "Farmers can delete own products"
  ON public.products FOR DELETE
  USING (
    auth.uid() = producer_id
    AND public.has_role('farmer', auth.uid())
  );

-- Insert initial mockup categories
INSERT INTO public.categories (name, slug, image, count) VALUES
('Sebzeler', 'sebzeler', '/src/assets/vegetables.jpg', 0),
('Meyveler', 'meyveler', '/src/assets/fruits.jpg', 0),
('Tahıllar', 'tahillar', '/src/assets/grains.jpg', 0),
('Kuruyemişler', 'kuruyemisler', '/src/assets/nuts.jpg', 0),
('Organik Ürünler', 'organik', '/src/assets/organic.jpg', 0),
('Baklagiller', 'baklagiller', '/src/assets/grains.jpg', 0);
