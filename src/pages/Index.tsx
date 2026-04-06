import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, ChevronRight, ArrowRight, Sprout, TrendingUp, Shield, Users, Star, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import { cities } from "@/lib/data";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import heroImage from "@/assets/hero-farm.jpg";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Tüm Türkiye");

  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();

  const featuredProducts = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Türkiye tarım alanları" className="w-full h-full object-cover" />
          <div className="absolute inset-0 gradient-hero-overlay" />
        </div>

        <div className="container relative z-10 pt-24">
          <div className="max-w-2xl space-y-6">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 bg-primary-foreground/20 backdrop-blur text-primary-foreground text-sm font-medium px-4 py-2 rounded-full">
                <Sprout className="w-4 h-4" />
                Türkiye'nin Çiftçi Pazarı
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-[1.1] animate-fade-up animate-fade-up-delay-1">
              Üreticiden
              <br />
              Sofranıza
            </h1>

            <p className="text-lg text-primary-foreground/80 max-w-lg animate-fade-up animate-fade-up-delay-2">
              Çiftçiler ve alıcılar modern bir tarım pazarında buluşuyor.
              Taze ürünleri doğrudan üreticiden keşfedin.
            </p>

            {/* Search bar */}
            <div className="animate-fade-up animate-fade-up-delay-3 bg-primary-foreground/95 backdrop-blur rounded-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-xl">
              <div className="flex-1 flex items-center gap-2 px-4">
                <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Ürün ara... (domates, buğday, fıstık)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-3 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 border-l border-border">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="bg-transparent text-sm text-foreground outline-none py-3 pr-2"
                  >
                    {cities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-6">
                  Ara
                </Button>
              </div>
            </div>

            {/* Trust numbers */}
            <div className="animate-fade-up animate-fade-up-delay-4 flex gap-8 pt-4">
              {[
                { number: "2,500+", label: "Üretici" },
                { number: "8,000+", label: "Ürün İlanı" },
                { number: "81", label: "İl" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-primary-foreground">{stat.number}</p>
                  <p className="text-sm text-primary-foreground/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">Kategoriler</p>
            <h2 className="text-3xl font-bold text-foreground">Ne Arıyorsunuz?</h2>
          </div>
          <Link to="/pazar" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Tümünü Gör <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {(categories as any[]).map((cat) => (
            <CategoryCard key={cat.id || cat.slug} category={cat} />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-muted/50">
        <div className="container py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">Öne Çıkanlar</p>
              <h2 className="text-3xl font-bold text-foreground">Günün Ürünleri</h2>
            </div>
            <Link to="/pazar" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Tüm Ürünler <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container py-20">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">Nasıl Çalışır?</p>
          <h2 className="text-3xl font-bold text-foreground">3 Adımda Başlayın</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Users,
              step: "01",
              title: "Kayıt Olun",
              desc: "Üretici veya alıcı olarak ücretsiz hesap oluşturun.",
            },
            {
              icon: Search,
              step: "02",
              title: "Ürün Keşfedin",
              desc: "Kategorilere göz atın, konum bazlı arama yapın.",
            },
            {
              icon: TrendingUp,
              step: "03",
              title: "Direkt İletişim",
              desc: "Üreticiyle doğrudan iletişime geçin, anlaşın.",
            },
          ].map((item) => (
            <div key={item.step} className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-leaf-light flex items-center justify-center">
                <item.icon className="w-7 h-7 text-primary" />
              </div>
              <span className="text-xs font-bold text-muted-foreground">{item.step}</span>
              <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-primary">
        <div className="container py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Farmers */}
            <div className="space-y-6">
              <p className="text-sm font-semibold text-primary-foreground/60 uppercase tracking-wide">Üreticiler İçin</p>
              <h2 className="text-3xl font-bold text-primary-foreground">Ürünlerinizi Türkiye'ye Tanıtın</h2>
              <ul className="space-y-4">
                {[
                  "Ücretsiz ilan verin",
                  "Binlerce alıcıya ulaşın",
                  "Profilinizi doğrulatın",
                  "Direkt mesajlaşma ile anlaşın",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-primary-foreground/80">
                    <div className="w-5 h-5 rounded-full bg-primary-foreground/20 flex items-center justify-center shrink-0">
                      <ChevronRight className="w-3 h-3 text-primary-foreground" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/giris">
                <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-xl">
                  Üretici Olarak Kayıt Ol <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            {/* Buyers */}
            <div className="space-y-6">
              <p className="text-sm font-semibold text-primary-foreground/60 uppercase tracking-wide">Alıcılar İçin</p>
              <h2 className="text-3xl font-bold text-primary-foreground">Doğrudan Üreticiden Alın</h2>
              <ul className="space-y-4">
                {[
                  "Binlerce üreticiyi keşfedin",
                  "Bölge ve ürün bazlı filtreleyin",
                  "Fiyat karşılaştırması yapın",
                  "Güvenilir üreticilerle çalışın",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-primary-foreground/80">
                    <div className="w-5 h-5 rounded-full bg-primary-foreground/20 flex items-center justify-center shrink-0">
                      <ChevronRight className="w-3 h-3 text-primary-foreground" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/giris">
                <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-xl">
                  Alıcı Olarak Kayıt Ol <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-20">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">Kullanıcı Yorumları</p>
          <h2 className="text-3xl font-bold text-foreground">Üreticilerimiz Ne Diyor?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Ahmet Yılmaz",
              role: "Domates Üreticisi, Antalya",
              quote: "Ürünlerimi doğrudan alıcılara sunabiliyorum. Aracı olmadan, adil fiyatla.",
            },
            {
              name: "Zeynep Arslan",
              role: "Restaurant Sahibi, İstanbul",
              quote: "Taze ürünleri doğrudan çiftçiden temin ediyoruz. Kalite ve fiyat mükemmel.",
            },
            {
              name: "Hasan Öztürk",
              role: "Buğday Üreticisi, Konya",
              quote: "Platform sayesinde Türkiye genelinde alıcılara ulaşıyorum. İşlerimi büyüttüm.",
            },
          ].map((testimonial) => (
            <div key={testimonial.name} className="card-hover bg-card rounded-2xl p-6 border border-border space-y-4">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">"{testimonial.quote}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-leaf-light flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {testimonial.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="bg-muted/50">
        <div className="container py-16">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-10 text-center">
            {[
              { icon: Shield, label: "Güvenli Platform" },
              { icon: BadgeCheck, label: "Doğrulanmış Üreticiler" },
              { icon: Sprout, label: "Organik Sertifika Desteği" },
              { icon: Users, label: "7/24 Destek" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <item.icon className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <div className="gradient-earth rounded-3xl p-10 sm:p-16 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-earth-foreground">
            Türkiye'nin En Büyük Çiftçi Pazarına Katılın
          </h2>
          <p className="text-earth-foreground/70 max-w-lg mx-auto">
            Binlerce üretici ve alıcı zaten burada. Ücretsiz kayıt olun, hemen başlayın.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/giris">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8 w-full sm:w-auto">
                Üretici Olarak Başla
              </Button>
            </Link>
            <Link to="/giris">
              <Button size="lg" variant="outline" className="border-earth-foreground/30 text-earth-foreground hover:bg-earth-foreground/10 rounded-xl px-8 w-full sm:w-auto">
                Alıcı Olarak Başla
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
