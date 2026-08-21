import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sprout, Mail, Lock, User, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "E-posta adresi gerekli").email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

export const signupSchema = loginSchema.extend({
  fullName: z.string().trim().min(2, "Ad soyad en az 2 karakter olmalı").max(80, "Ad soyad en fazla 80 karakter olabilir"),
  role: z.enum(["farmer", "buyer"]),
});

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    watch: watchSignup,
    setValue: setSignupValue,
    formState: { errors: signupErrors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: "buyer" },
  });

  const role = watchSignup("role");

  const onLogin = async (values: LoginValues) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword(values);
      if (error) throw error;
      toast({ title: "Giriş başarılı!", description: "Yönlendiriliyorsunuz..." });
      navigate("/");
    } catch (error) {
      const description = error instanceof Error ? error.message : "Giriş yapılamadı.";
      toast({ title: "Hata", description, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const onSignup = async (values: SignupValues) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { full_name: values.fullName, role: values.role },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      toast({
        title: "Kayıt başarılı!",
        description: "Lütfen e-posta adresinize gönderilen onay bağlantısına tıklayın.",
      });
    } catch (error) {
      const description = error instanceof Error ? error.message : "Kayıt oluşturulamadı.";
      toast({ title: "Hata", description, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative items-center justify-center p-12">
        <div className="relative z-10 space-y-6 max-w-md">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground flex items-center justify-center">
              <Sprout className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-primary-foreground">Üreticiden</span>
          </Link>
          <h2 className="text-3xl font-bold text-primary-foreground leading-tight">
            Türkiye'nin En Büyük
            <br />
            Çiftçi Pazarına Hoş Geldiniz
          </h2>
          <p className="text-primary-foreground/70">
            Binlerce üretici ve alıcı burada buluşuyor. Ücretsiz kayıt olun, hemen başlayın.
          </p>
          <div className="flex gap-8 pt-4">
            {[
              { number: "2,500+", label: "Üretici" },
              { number: "8,000+", label: "Ürün" },
              { number: "81", label: "İl" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-xl font-bold text-primary-foreground">{stat.number}</p>
                <p className="text-sm text-primary-foreground/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="w-4 h-4" />
              Ana Sayfa
            </Link>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isLogin ? "Giriş Yap" : "Ücretsiz Kayıt Ol"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isLogin
                ? "Hesabınıza giriş yapın"
                : "Hesap oluşturun ve hemen başlayın"}
            </p>
          </div>

          {!isLogin && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSignupValue("role", "farmer")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  role === "farmer"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <Sprout className={`w-5 h-5 mb-2 ${role === "farmer" ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-sm font-semibold text-foreground">Üretici</p>
                <p className="text-xs text-muted-foreground">Ürünlerinizi satın</p>
              </button>
              <button
                type="button"
                onClick={() => setSignupValue("role", "buyer")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  role === "buyer"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <User className={`w-5 h-5 mb-2 ${role === "buyer" ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-sm font-semibold text-foreground">Alıcı</p>
                <p className="text-xs text-muted-foreground">Ürün keşfedin</p>
              </button>
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4" noValidate>
              <div className="space-y-1">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="E-posta adresi"
                    className="pl-10 rounded-xl"
                    {...registerLogin("email")}
                  />
                </div>
                {loginErrors.email && <p className="text-xs text-destructive pl-1">{loginErrors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Şifre"
                    className="pl-10 pr-10 rounded-xl"
                    {...registerLogin("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {loginErrors.password && <p className="text-xs text-destructive pl-1">{loginErrors.password.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-11"
                disabled={loading}
              >
                {loading ? "Yükleniyor..." : "Giriş Yap"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit(onSignup)} className="space-y-4" noValidate>
              <div className="space-y-1">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Ad Soyad"
                    className="pl-10 rounded-xl"
                    {...registerSignup("fullName")}
                  />
                </div>
                {signupErrors.fullName && <p className="text-xs text-destructive pl-1">{signupErrors.fullName.message}</p>}
              </div>

              <div className="space-y-1">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="E-posta adresi"
                    className="pl-10 rounded-xl"
                    {...registerSignup("email")}
                  />
                </div>
                {signupErrors.email && <p className="text-xs text-destructive pl-1">{signupErrors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Şifre"
                    className="pl-10 pr-10 rounded-xl"
                    {...registerSignup("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signupErrors.password && <p className="text-xs text-destructive pl-1">{signupErrors.password.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-11"
                disabled={loading}
              >
                {loading ? "Yükleniyor..." : "Kayıt Ol"}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground mt-8">
            {isLogin ? "Hesabınız yok mu?" : "Zaten hesabınız var mı?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-semibold hover:underline"
            >
              {isLogin ? "Kayıt Ol" : "Giriş Yap"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
