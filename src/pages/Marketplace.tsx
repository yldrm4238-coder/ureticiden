import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Search, MapPin, SlidersHorizontal, X, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { cities, Product } from "@/lib/data";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";

const Marketplace = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCity, setSelectedCity] = useState(searchParams.get("city") || "Tüm Türkiye");
  const [showFilters, setShowFilters] = useState(false);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  const { data: products = [], isLoading: isLoadingProducts, isError: isProductsError, refetch } = useProducts();
  const { data: categories = [] } = useCategories();

  const filtered = useMemo(() => {
    const result = products.filter((p: Product) => {
      const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === "all" || p.categorySlug === selectedCategory;
      const matchCity = selectedCity === "Tüm Türkiye" || p.city === selectedCity;
      const matchOrganic = !organicOnly || p.isOrganic;
      return matchSearch && matchCategory && matchCity && matchOrganic;
    });

    return result.sort((a: Product, b: Product) => {
      if (sortBy === "price-asc") return (a.price ?? Infinity) - (b.price ?? Infinity);
      if (sortBy === "price-desc") return (b.price ?? -Infinity) - (a.price ?? -Infinity);
      if (sortBy === "organic") return Number(b.isOrganic) - Number(a.isOrganic);
      return 0; // "newest" — API zaten created_at desc döndürüyor
    });
  }, [search, selectedCategory, selectedCity, organicOnly, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedCity("Tüm Türkiye");
    setOrganicOnly(false);
    setPage(1);
  };

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const hasActiveFilters = search || selectedCategory !== "all" || selectedCity !== "Tüm Türkiye" || organicOnly;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Pazar Yeri | Üreticiden — Türkiye'nin Çiftçi Pazarı</title>
        <meta name="description" content="Üreticiden Pazar Yeri'nde taze meyve, sebze ve organik tarım ürünlerini keşfedin. Üreticilerle doğrudan iletişime geçin." />
        <link rel="canonical" href="https://ureticiden.com/pazar" />
      </Helmet>
      <Navbar />

      <div className="container pt-28 pb-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Pazar Yeri</h1>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex gap-3">
            <div className="flex-1 flex items-center gap-2 bg-card border border-border rounded-xl px-4">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Ürün veya üretici ara..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full py-3 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Button
              variant="outline"
              className="rounded-xl gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filtreler</span>
            </Button>
          </div>

          {showFilters && (
            <div className="bg-card border border-border rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Sıralama</label>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground outline-none"
                >
                  <option value="newest">En Yeni</option>
                  <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
                  <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
                  <option value="organic">Önce Organik</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Kategori</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                  className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground outline-none"
                >
                  <option value="all">Tüm Kategoriler</option>
                  {(categories as any[]).map((c) => (
                    <option key={c.id || c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Konum</label>
                <div className="flex items-center gap-2 bg-muted rounded-xl px-4">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <select
                    value={selectedCity}
                    onChange={(e) => { setSelectedCity(e.target.value); setPage(1); }}
                    className="w-full bg-transparent py-2.5 text-sm text-foreground outline-none"
                  >
                    {cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Diğer</label>
                <label className="flex items-center gap-2 bg-muted rounded-xl px-4 py-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={organicOnly}
                    onChange={(e) => { setOrganicOnly(e.target.checked); setPage(1); }}
                    className="accent-primary"
                  />
                  <span className="text-sm text-foreground">Sadece Organik</span>
                </label>
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{filtered.length} sonuç</span>
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-primary hover:underline">
                <X className="w-3 h-3" /> Temizle
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {isLoadingProducts ? (
          <div className="text-center py-20">
            <p className="text-lg font-semibold text-foreground mb-2">Yükleniyor...</p>
          </div>
        ) : isProductsError ? (
          <div className="text-center py-20 space-y-4">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <p className="text-lg font-semibold text-foreground">Ürünler yüklenemedi</p>
            <p className="text-sm text-muted-foreground">Bağlantınızı kontrol edip tekrar deneyin.</p>
            <Button onClick={() => refetch()} variant="outline" className="rounded-xl gap-2">
              <RefreshCw className="w-4 h-4" /> Tekrar Dene
            </Button>
          </div>
        ) : filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {paginated.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← Önceki
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === "..." ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => { setPage(p as number); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                          page === p
                            ? "bg-primary text-primary-foreground"
                            : "border border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                <button
                  onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Sonraki →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-lg font-semibold text-foreground mb-2">Sonuç bulunamadı</p>
            <p className="text-sm text-muted-foreground">Farklı arama kriterleri deneyin.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Marketplace;
