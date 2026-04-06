import { useParams, Link } from "react-router-dom";
import { MapPin, BadgeCheck, Star, Package, Calendar, ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";

const ProducerProfile = () => {
  const { id } = useParams();
  const { data: products = [], isLoading } = useProducts();

  // Find the producer from products data
  const producerProducts = products.filter((p) => p.producer.id === id);
  const producer = producerProducts.length > 0 ? producerProducts[0].producer : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!producer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Üretici bulunamadı</p>
          <Link to="/pazar" className="text-primary hover:underline text-sm mt-2 inline-block">
            Pazar yerine dön
          </Link>
        </div>
      </div>
    );
  }

  const initials = producer.name.split(" ").map((n) => n[0]).join("");

  // Mock reviews
  const reviews = [
    { id: 1, author: "Mehmet K.", rating: 5, text: "Çok kaliteli ürünler, zamanında teslimat.", date: "2 hafta önce" },
    { id: 2, author: "Ayşe D.", rating: 4, text: "Ürünler taze ve lezzetli. Tekrar sipariş vereceğim.", date: "1 ay önce" },
    { id: 3, author: "Ali V.", rating: 5, text: "Güvenilir üretici, iletişimi çok iyi.", date: "2 ay önce" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container pt-28 pb-20">
        <Link to="/pazar" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Pazar Yerine Dön
        </Link>

        {/* Producer header */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-leaf-light flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-primary">{initials}</span>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">{producer.name}</h1>
                {producer.isVerified && <BadgeCheck className="w-5 h-5 text-primary" />}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {producer.city}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  {producer.rating} puan
                </span>
                <span className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  {producerProducts.length} ürün
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {producer.memberSince}'den beri üye
                </span>
              </div>
            </div>

            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl gap-2 shrink-0">
              <MessageCircle className="w-4 h-4" />
              Mesaj Gönder
            </Button>
          </div>
        </div>

        {/* Products */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-6">
            Ürünleri ({producerProducts.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {producerProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-6">
            Değerlendirmeler ({reviews.length})
          </h2>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-bold text-muted-foreground">
                        {review.author.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{review.author}</p>
                      <p className="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < review.rating
                            ? "fill-accent text-accent"
                            : "text-border"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProducerProfile;
