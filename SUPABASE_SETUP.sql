-- Üreticiden - Veritabanı Kurulum Scripti (Supabase SQL Editor)
-- Lütfen bu komutları Supabase projenizin SQL Editor sekmesine yapıştırıp (RUN) tuşuna basarak çalıştırın.

-- 1. Kategoriler tablosunu oluştur
CREATE TABLE public.categories (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    slug text not null unique,
    image text,
    count integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Ürünler tablosunu oluştur
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

-- 3. Row Level Security (RLS) ayarlarını aktif et
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 4. Herkese Açık Okuma İzinlerini Tanımla
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);

-- 5. Üreticiler (Farmers) için Yazma İzinlerini Tanımla
-- Yeni ürün ekleme
CREATE POLICY "Farmers can insert products" ON public.products FOR INSERT
WITH CHECK (
    auth.uid() = producer_id
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'farmer'::public.app_role)
);

-- Kendi ürününü güncelleme
CREATE POLICY "Farmers can update own products" ON public.products FOR UPDATE
USING (
    auth.uid() = producer_id
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'farmer'::public.app_role)
)
WITH CHECK (
    auth.uid() = producer_id
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'farmer'::public.app_role)
);

-- Kendi ürününü silme
CREATE POLICY "Farmers can delete own products" ON public.products FOR DELETE
USING (
    auth.uid() = producer_id
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'farmer'::public.app_role)
);

-- 6. Kategoriler İçin Başlangıç Verilerini Ekle
INSERT INTO public.categories (name, slug, image, count) VALUES
('Et ve Et Ürünleri', 'et-ve-et-urunleri', 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&auto=format&fit=crop&q=60', 0),
('Süt ve Süt Ürünleri', 'sut-ve-sut-urunleri', 'https://images.unsplash.com/photo-1550583724-125581f77833?w=800&auto=format&fit=crop&q=60', 0),
('Yağlar', 'yaglar', 'https://images.unsplash.com/photo-1474979266404-7eaacbacf845?w=800&auto=format&fit=crop&q=60', 0),
('Ballar', 'ballar', 'https://images.unsplash.com/photo-1471943038886-dfca81ad7137?w=800&auto=format&fit=crop&q=60', 0),
('Tahıllar', 'tahillar', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=60', 0),
('Yem Malzemesi', 'yem-malzemesi', 'https://images.unsplash.com/photo-1595113316349-9fa4eb24f884?w=800&auto=format&fit=crop&q=60', 0),
('Büyükbaş Hayvan', 'buyukbas-hayvan', 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=800&auto=format&fit=crop&q=60', 0),
('Küçükbaş Hayvan', 'kucukbas-hayvan', 'https://images.unsplash.com/photo-1484557918186-7b2439161678?w=800&auto=format&fit=crop&q=60', 0)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, image = EXCLUDED.image;
