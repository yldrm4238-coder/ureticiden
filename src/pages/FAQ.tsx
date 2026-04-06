import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: "Genel",
    question: "Üreticiden nedir?",
    answer: "Üreticiden, Türkiye'deki çiftçilerin ürünlerini doğrudan alıcılara ulaştırmasını sağlayan dijital bir tarım pazarıdır. Aracıları ortadan kaldırarak hem üreticilere adil fiyat hem alıcılara taze ürün garantisi sunuyoruz.",
  },
  {
    category: "Genel",
    question: "Platform ücretsiz mi?",
    answer: "Evet, platforma kayıt olmak ve ilan vermek tamamen ücretsizdir. Gelecekte premium özellikler için ücretli planlar sunmayı planlıyoruz, ancak temel özellikler her zaman ücretsiz kalacaktır.",
  },
  {
    category: "Üreticiler",
    question: "Nasıl üretici olarak kayıt olabilirim?",
    answer: "Ana sayfadaki 'Ücretsiz Kayıt' butonuna tıklayın, 'Üretici' rolünü seçin ve bilgilerinizi doldurun. E-posta onayından sonra hemen ürünlerinizi listelemeye başlayabilirsiniz.",
  },
  {
    category: "Üreticiler",
    question: "Ürün ilanı nasıl oluşturulur?",
    answer: "Hesabınıza giriş yaptıktan sonra kontrol panelinizden 'Yeni Ürün Ekle' butonuna tıklayın. Ürün adı, kategori, fiyat, minimum sipariş miktarı, konum ve fotoğraflarını ekleyerek ilanınızı yayınlayabilirsiniz.",
  },
  {
    category: "Üreticiler",
    question: "Profil doğrulama nasıl yapılır?",
    answer: "Profilinizi doğrulatmak için kimlik bilgilerinizi ve çiftçi belgelerinizi sistem üzerinden yükleyin. Ekibimiz belgeleri inceledikten sonra profilinize 'Doğrulanmış Üretici' rozeti eklenir.",
  },
  {
    category: "Alıcılar",
    question: "Ürün nasıl sipariş edilir?",
    answer: "Beğendiğiniz ürünün sayfasından üreticiyle doğrudan iletişime geçebilirsiniz. Mesaj göndererek veya telefon ile arayarak sipariş detaylarını ve teslimat koşullarını görüşebilirsiniz.",
  },
  {
    category: "Alıcılar",
    question: "Ödeme nasıl yapılır?",
    answer: "Şu an ödeme doğrudan üretici ile alıcı arasında gerçekleşmektedir. Güvenli ödeme sistemi yakında platforma entegre edilecektir.",
  },
  {
    category: "Güvenlik",
    question: "Ürün kalitesi nasıl garanti ediliyor?",
    answer: "Doğrulanmış üretici rozetine sahip çiftçilerin belgeleri kontrol edilmiştir. Ayrıca kullanıcı değerlendirme sistemi sayesinde diğer alıcıların deneyimlerini görebilirsiniz.",
  },
  {
    category: "Güvenlik",
    question: "Kişisel bilgilerim güvende mi?",
    answer: "Tüm kişisel verileriniz SSL şifreleme ile korunmaktadır. KVKK kapsamında verileriniz güvenle saklanır ve üçüncü taraflarla paylaşılmaz.",
  },
];

const categories = [...new Set(faqData.map((f) => f.category))];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("Tüm");

  const filtered = activeCategory === "Tüm" ? faqData : faqData.filter((f) => f.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container pt-32 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <p className="text-sm font-semibold text-primary uppercase tracking-wide">SSS</p>
            <h1 className="text-4xl font-extrabold text-foreground">Sıkça Sorulan Sorular</h1>
            <p className="text-muted-foreground">
              Aradığınız cevabı bulamadınız mı?{" "}
              <Link to="/iletisim" className="text-primary font-medium hover:underline">
                Bize ulaşın
              </Link>
            </p>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {["Tüm", ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* FAQ items */}
          <div className="space-y-3">
            {filtered.map((item, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-sm font-semibold text-foreground pr-4">{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-5 pb-5 -mt-1">
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center space-y-4">
            <h3 className="text-xl font-bold text-foreground">Başka sorunuz mu var?</h3>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl" asChild>
              <Link to="/iletisim">İletişime Geçin</Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQ;
