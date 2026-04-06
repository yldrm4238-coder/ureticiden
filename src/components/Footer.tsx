import { Link } from "react-router-dom";
import { Sprout, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-earth-foreground">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Sprout className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">Üreticiden</span>
            </div>
            <p className="text-sm opacity-70 leading-relaxed">
              Türkiye'nin çiftçi pazarı. Üreticiler ve alıcılar modern bir tarım pazarında buluşuyor.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to="/pazar" className="hover:opacity-100 transition-opacity">Pazar Yeri</Link></li>
              <li><Link to="/kategoriler" className="hover:opacity-100 transition-opacity">Kategoriler</Link></li>
              <li><Link to="/hakkimizda" className="hover:opacity-100 transition-opacity">Hakkımızda</Link></li>
              <li><Link to="/blog" className="hover:opacity-100 transition-opacity">Blog</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Destek</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to="/sss" className="hover:opacity-100 transition-opacity">Sıkça Sorulan Sorular</Link></li>
              <li><Link to="/iletisim" className="hover:opacity-100 transition-opacity">İletişim</Link></li>
              <li><Link to="/gizlilik" className="hover:opacity-100 transition-opacity">Gizlilik Politikası</Link></li>
              <li><Link to="/kosullar" className="hover:opacity-100 transition-opacity">Kullanım Koşulları</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">İletişim</h4>
            <ul className="space-y-3 text-sm opacity-70">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                info@ureticiden.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                +90 (212) 000 00 00
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                İstanbul, Türkiye
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-earth-foreground/10 mt-12 pt-8 text-center text-sm opacity-50">
          © 2026 Üreticiden. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
