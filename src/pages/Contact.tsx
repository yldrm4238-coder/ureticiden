import { Phone, MapPin, MessageCircle, Clock, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const WHATSAPP_NUMBER = "905320000000";
const PHONE_NUMBER = "+90 532 000 00 00";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container pt-32 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14 space-y-4">
            <p className="text-sm font-semibold text-primary uppercase tracking-wide">İletişim</p>
            <h1 className="text-4xl font-extrabold text-foreground">Bize Ulaşın</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Sorularınız için bizi arayabilir veya WhatsApp'tan yazabilirsiniz. En hızlı yanıtı bu şekilde alırsınız.
            </p>
          </div>

          {/* Ana iletişim butonları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="bg-[#25D366] hover:bg-[#20c05a] transition-colors rounded-2xl p-6 text-white text-center space-y-3 cursor-pointer">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto">
                  <MessageCircle className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold">WhatsApp</h3>
                <p className="text-white/80 text-sm">Hemen yazın, hızlıca yanıt alalım</p>
                <div className="flex items-center justify-center gap-1 text-sm font-semibold">
                  {PHONE_NUMBER} <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>
            </a>

            <a href={`tel:${WHATSAPP_NUMBER}`} className="block">
              <div className="bg-primary hover:bg-primary/90 transition-colors rounded-2xl p-6 text-primary-foreground text-center space-y-3 cursor-pointer">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto">
                  <Phone className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold">Telefon</h3>
                <p className="text-primary-foreground/80 text-sm">Sizi arayalım veya siz arayın</p>
                <div className="text-sm font-semibold">{PHONE_NUMBER}</div>
              </div>
            </a>
          </div>

          {/* Bilgi kartları */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="bg-card border border-border rounded-2xl p-5 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-leaf-light flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Çalışma Saatleri</h3>
              <p className="text-sm text-foreground font-medium">Hafta içi 08:00 – 20:00</p>
              <p className="text-xs text-muted-foreground">Cumartesi 09:00 – 17:00</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-leaf-light flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Adres</h3>
              <p className="text-sm text-foreground font-medium">İstanbul, Türkiye</p>
              <p className="text-xs text-muted-foreground">Merkez ofis</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-leaf-light flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Sık Sorulan Sorular</h3>
              <p className="text-xs text-muted-foreground">
                Cevabınızı hızlıca bulmak için{" "}
                <Link to="/sss" className="text-primary font-medium hover:underline">
                  SSS sayfamıza
                </Link>{" "}
                göz atın.
              </p>
            </div>
          </div>

          {/* Site içi mesajlaşma */}
          <div className="bg-muted/50 border border-border rounded-2xl p-6 text-center space-y-3">
            <h3 className="font-semibold text-foreground">Üreticiyle mi iletişim kurmak istiyorsunuz?</h3>
            <p className="text-sm text-muted-foreground">
              Üretici ve alıcılar platform üzerinden doğrudan mesajlaşabilir.
            </p>
            <Link to="/pazar">
              <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 mt-1">
                Pazar Yerine Git
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
