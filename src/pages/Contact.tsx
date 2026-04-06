import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({ title: "Hata", description: "Lütfen tüm zorunlu alanları doldurun.", variant: "destructive" });
      return;
    }

    setLoading(true);
    // Simulate sending
    setTimeout(() => {
      toast({ title: "Mesajınız gönderildi!", description: "En kısa sürede size dönüş yapacağız." });
      setName(""); setEmail(""); setSubject(""); setMessage("");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container pt-32 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 space-y-4">
            <p className="text-sm font-semibold text-primary uppercase tracking-wide">İletişim</p>
            <h1 className="text-4xl font-extrabold text-foreground">Bize Ulaşın</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Sorularınız, önerileriniz veya işbirliği teklifleriniz için bize yazın.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact info */}
            <div className="space-y-4">
              {[
                { icon: Mail, title: "E-posta", info: "info@ureticiden.com", desc: "7/24 destek" },
                { icon: Phone, title: "Telefon", info: "+90 (212) 000 00 00", desc: "Hafta içi 09:00-18:00" },
                { icon: MapPin, title: "Adres", info: "İstanbul, Türkiye", desc: "Merkez ofis" },
              ].map((c) => (
                <div key={c.title} className="bg-card border border-border rounded-2xl p-5 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-leaf-light flex items-center justify-center">
                    <c.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{c.title}</h3>
                  <p className="text-sm text-foreground font-medium">{c.info}</p>
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                </div>
              ))}

              <div className="bg-muted rounded-2xl p-5 space-y-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-bold text-foreground">SSS</h3>
                <p className="text-xs text-muted-foreground">
                  Cevabını hızlıca bulmak için{" "}
                  <Link to="/sss" className="text-primary font-medium hover:underline">
                    SSS sayfamıza
                  </Link>{" "}
                  göz atın.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Ad Soyad *</label>
                    <Input
                      placeholder="Adınız Soyadınız"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-xl"
                      required
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">E-posta *</label>
                    <Input
                      type="email"
                      placeholder="ornek@mail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-xl"
                      required
                      maxLength={255}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Konu</label>
                  <Input
                    placeholder="Mesajınızın konusu"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="rounded-xl"
                    maxLength={200}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Mesaj *</label>
                  <Textarea
                    placeholder="Mesajınızı buraya yazın..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="rounded-xl min-h-[140px]"
                    required
                    maxLength={2000}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-11 gap-2"
                  disabled={loading}
                >
                  <Send className="w-4 h-4" />
                  {loading ? "Gönderiliyor..." : "Mesaj Gönder"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
