import { useParams, Link } from "react-router-dom";
import { MapPin, BadgeCheck, Leaf, ArrowLeft, MessageCircle, Phone, Star, Package, Calendar, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { priceTypeLabels } from "@/lib/data";
import { useProducts } from "@/hooks/useProducts";

const ProductDetail = () => {
  const { id } = useParams();
  const { data: products = [], isLoading } = useProducts();
  const product = products.find((p) => p.id === id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Ürün bulunamadı</p>
          <Link to="/pazar" className="text-primary hover:underline text-sm mt-2 inline-block">
            Pazar yerine dön
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = products.filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 4);

  const renderPrice = () => {
    if (product.price) {
      return (
        <div>
          <span className="text-3xl font-bold text-foreground">
            ₺{product.price.toLocaleString("tr-TR")}
          </span>
          <span className="text-lg text-muted-foreground ml-1">
            /{product.priceType === "ton" ? "ton" : "kg"}
          </span>
        </div>
      );
    }
    return (
      <span className="text-2xl font-bold text-accent">
        {priceTypeLabels[product.priceType]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container pt-28 pb-20">
        {/* Breadcrumb */}
        <Link to="/pazar" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Pazar Yerine Dön
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden aspect-square">
            <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              {product.isOrganic && (
                <span className="flex items-center gap-1 bg-leaf-light text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
                  <Leaf className="w-3.5 h-3.5" />
                  Organik
                </span>
              )}
              {product.isVerified && (
                <span className="flex items-center gap-1 bg-muted text-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
                  <BadgeCheck className="w-3.5 h-3.5 text-primary" />
                  Onaylı Üretici
                </span>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide mb-1">{product.category}</p>
              <h1 className="text-3xl font-bold text-foreground">{product.title}</h1>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{product.city}, {product.district}</span>
            </div>

            {renderPrice()}

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Scale, label: "Min. Sipariş", value: product.minOrder },
                { icon: Package, label: "Stok", value: product.stock },
                { icon: Calendar, label: "Hasat", value: product.harvestDate },
              ].map((spec) => (
                <div key={spec.label} className="bg-muted rounded-xl p-4 space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <spec.icon className="w-4 h-4" />
                    <span className="text-xs font-medium">{spec.label}</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{spec.value}</p>
                </div>
              ))}
            </div>

            {/* Producer card */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-4 mb-4">
                <Link to={`/uretici/${product.producer.id}`} className="w-12 h-12 rounded-full bg-leaf-light flex items-center justify-center hover:ring-2 hover:ring-primary transition-all">
                  <span className="text-sm font-bold text-primary">
                    {product.producer.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </Link>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link to={`/uretici/${product.producer.id}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                      {product.producer.name}
                    </Link>
                    {product.producer.isVerified && <BadgeCheck className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" /> {product.producer.city}
                    <span className="mx-1">·</span>
                    <Star className="w-3 h-3 fill-accent text-accent" /> {product.producer.rating}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Mesaj Gönder
                </Button>
                <Button variant="outline" className="rounded-xl gap-2">
                  <Phone className="w-4 h-4" />
                  Ara
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-foreground mb-8">Benzer Ürünler</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
