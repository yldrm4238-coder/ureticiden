-- Add "Sabun & Temizlik" category
INSERT INTO public.categories (name, slug, image, count)
VALUES ('Sabun & Temizlik', 'sabun-temizlik', '/assets/categories/sabun-temizlik.jpg', 0)
ON CONFLICT (slug) DO NOTHING;
