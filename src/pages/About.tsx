import { Link } from "react-router-dom";
import { Users, Target, Sprout, Heart, Globe, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="container pt-32 pb-16">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <p className="text-sm font-semibold text-primary uppercase tracking-wide">Hakkımızda</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground leading-tight">
            Türkiye'nin Çiftçisini
            <br />
            <span className="text-gradient-primary">Dünyayla Buluşturuyoruz</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Üreticiden, Türkiye'deki çiftçilerin ürünlerini doğrudan alıcılara ulaştırmasını sağlayan
            dijital bir tarım pazarıdır. Aracıları ortadan kaldırarak hem üreticilerin hem alıcıların
            kazanmasını hedefliyoruz.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-muted/50">
        <div className="container py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-2xl p-8 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Misyonumuz</h2>
              <p className="text-muted-foreground leading-relaxed">
                Türkiye'deki tarımsal üreticiyi dijitalleştirmek, ürünlerini adil fiyatla doğrudan
                alıcılara ulaştırmak ve sürdürülebilir bir tarım ekosistemi oluşturmak.
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-8 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Globe className="w-6 h-6 text-accent" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Vizyonumuz</h2>
              <p className="text-muted-foreground leading-relaxed">
                Türkiye'nin en güvenilir ve en büyük tarımsal pazarı olmak.
                Her çiftçinin dijital dünyada var olabildiği bir gelecek inşa etmek.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container py-20">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">Değerlerimiz</p>
          <h2 className="text-3xl font-bold text-foreground">Bizi Biz Yapan İlkeler</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Heart, title: "Şeffaflık", desc: "Fiyatlar, ürün bilgileri ve üretici profilleri tamamen açıktır." },
            { icon: Users, title: "Topluluk", desc: "Üretici ve alıcıları bir araya getiren güçlü bir topluluk inşa ediyoruz." },
            { icon: Sprout, title: "Sürdürülebilirlik", desc: "Organik tarımı destekliyor, doğaya saygılı üretimi teşvik ediyoruz." },
            { icon: TrendingUp, title: "Adil Ticaret", desc: "Aracıları ortadan kaldırarak üreticiye adil gelir sağlıyoruz." },
            { icon: Globe, title: "Erişilebilirlik", desc: "81 ilden üreticilerin platformumuza kolayca katılmasını sağlıyoruz." },
            { icon: Target, title: "Kalite", desc: "Doğrulanmış üreticiler ve kalite kontrol süreçleriyle güven oluşturuyoruz." },
          ].map((v) => (
            <div key={v.title} className="bg-card border border-border rounded-2xl p-6 space-y-3 card-hover">
              <div className="w-10 h-10 rounded-xl bg-leaf-light flex items-center justify-center">
                <v.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary">
        <div className="container py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "2,500+", label: "Aktif Üretici" },
              { number: "8,000+", label: "Ürün İlanı" },
              { number: "81", label: "İl" },
              { number: "50,000+", label: "Aylık Ziyaretçi" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-extrabold text-primary-foreground">{s.number}</p>
                <p className="text-sm text-primary-foreground/60 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <div className="gradient-earth rounded-3xl p-10 sm:p-16 text-center space-y-6">
          <h2 className="text-3xl font-bold text-earth-foreground">Bize Katılın</h2>
          <p className="text-earth-foreground/70 max-w-lg mx-auto">
            Üretici veya alıcı olarak platforma katılın, Türkiye'nin en büyük çiftçi pazarında yerinizi alın.
          </p>
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8" asChild>
            <Link to="/giris">Ücretsiz Kayıt Ol</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
