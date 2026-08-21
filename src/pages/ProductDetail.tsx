import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MapPin, BadgeCheck, Leaf, ArrowLeft, MessageCircle, Phone, Star, Package, Calendar, Scale, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { priceTypeLabels, Product } from "@/lib/data";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: products = [], isLoading, isError } = useProducts();
  const product = products.find((p: Product) => p.id === id);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!user) { navigate("/giris"); return; }
    if (!messageText.trim() || !product) return;
    setSending(true);
    try {
      // Konuşma bul veya oluştur
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("product_id", product.id)
        .eq("buyer_id", user.id)
        .eq("producer_id", product.producer.id)
        .single();

      let convId = existing?.id;
      if (!convId) {
        const { data: newConv, error } = await supabase
          .from("conversations")
          .insert({ product_id: product.id, buyer_id: user.id, producer_id: product.producer.id })
          .select("id")
          .single();
        if (error) throw error;
        convId = newConv.id;
      }

      // Mesaj gönder
      const { error: msgError } = await supabase
        .from("messages")
        .insert({ conversation_id: convId, sender_id: user.id, content: messageText.trim() });
      if (msgError) throw msgError;

      toast({ title: "Mesaj gönderildi!", description: "Mesajlarım sayfasından takip edebilirsiniz." });
      setMessageText("");
      setShowMessageBox(false);
      navigate("/mesajlarim");
    } catch (err) {
      const description = err instanceof Error ? err.message : "Bir hata oluştu.";
      toast({ title: "Hata", description, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold text-foreground">Ürün yüklenemedi</p>
          <p className="text-sm text-muted-foreground">Bağlantınızı kontrol edip sayfayı yenileyin.</p>
          <Link to="/pazar" className="text-primary hover:underline text-sm inline-block">
            Pazar yerine dön
          </Link>
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

  const relatedProducts = products.filter((p: Product) => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 4);

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

  const pageTitle = `${product.title} — ${product.producer.name} | Üreticiden`;
  const pageDesc = product.description.slice(0, 160);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        {product.image && <meta property="og:image" content={product.image} />}
        <meta property="og:type" content="product" />
        <link rel="canonical" href={`https://www.ureticiden.tr/urun/${product.id}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.title,
            "image": product.image ? [product.image] : [],
            "description": pageDesc,
            "offers": {
              "@type": "Offer",
              "url": `https://www.ureticiden.tr/urun/${product.id}`,
              "priceCurrency": "TRY",
              "price": product.price || 0,
              "availability": "https://schema.org/InStock",
              "seller": {
                "@type": "Organization",
                "name": product.producer.name
              }
            }
          })}
        </script>
      </Helmet>
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
                    {product.producer.name.split(" ").map((n: string) => n[0]).join("")}
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
              {showMessageBox ? (
                <div className="space-y-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value.slice(0, 1000))}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                      placeholder="Mesajınızı yazın..."
                      maxLength={1000}
                      className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      autoFocus
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={sending || !messageText.trim()}
                      className="rounded-xl px-4 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { setShowMessageBox(false); setMessageText(""); }}
                      className="rounded-xl px-3"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  {messageText.length > 800 && (
                    <p className={`text-xs text-right ${messageText.length >= 1000 ? "text-destructive" : "text-muted-foreground"}`}>
                      {messageText.length}/1000
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowMessageBox(true)}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Mesaj Gönder
                  </Button>
                  {product.producer.phone ? (
                    <a href={`tel:${product.producer.phone}`}>
                      <Button variant="outline" className="rounded-xl gap-2">
                        <Phone className="w-4 h-4" />
                        Ara
                      </Button>
                    </a>
                  ) : (
                    <Button variant="outline" className="rounded-xl gap-2" disabled title="Üretici telefon numarası eklenmemiş">
                      <Phone className="w-4 h-4" />
                      Ara
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-foreground mb-8">Benzer Ürünler</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map((p: Product) => (
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
