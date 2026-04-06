import { useState, useMemo } from "react";
import { Search, MapPin, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { cities } from "@/lib/data";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";

const Marketplace = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCity, setSelectedCity] = useState("Tüm Türkiye");
  const [showFilters, setShowFilters] = useState(false);
  const [organicOnly, setOrganicOnly] = useState(false);

  const { data: products = [], isLoading: isLoadingProducts } = useProducts();
  const { data: categories = [] } = useCategories();

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === "all" || p.categorySlug === selectedCategory;
      const matchCity = selectedCity === "Tüm Türkiye" || p.city === selectedCity;
      const matchOrganic = !organicOnly || p.isOrganic;
      return matchSearch && matchCategory && matchCity && matchOrganic;
    });
  }, [search, selectedCategory, selectedCity, organicOnly]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedCity("Tüm Türkiye");
    setOrganicOnly(false);
  };

  const hasActiveFilters = search || selectedCategory !== "all" || selectedCity !== "Tüm Türkiye" || organicOnly;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container pt-28 pb-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Pazar Yeri</h1>
          <p className="text-muted-foreground">Türkiye genelinde tarım ürünlerini keşfedin</p>
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
                onChange={(e) => setSearch(e.target.value)}
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
            <div className="bg-card border border-border rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Kategori</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
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
                    onChange={(e) => setSelectedCity(e.target.value)}
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
                    onChange={(e) => setOrganicOnly(e.target.checked)}
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
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
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
