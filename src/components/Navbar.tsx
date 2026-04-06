import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Sprout, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Pazar Yeri", href: "/pazar" },
  { label: "Hakkımızda", href: "/hakkimizda" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
      <nav className="glass-nav rounded-2xl px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Sprout className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">Üreticiden</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground gap-1"
                onClick={() => navigate("/panel")}
              >
                <User className="w-4 h-4" />
                Panelim
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground gap-1"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
                Çıkış
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => navigate("/giris")}
              >
                Giriş Yap
              </Button>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
                onClick={() => navigate("/giris")}
              >
                Ücretsiz Kayıt
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menü"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass-nav mt-2 rounded-2xl p-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border flex flex-col gap-2">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start text-muted-foreground gap-2"
                  onClick={() => { setMobileOpen(false); navigate("/panel"); }}
                >
                  <User className="w-4 h-4" />
                  Panelim
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start text-muted-foreground gap-2"
                  onClick={() => { setMobileOpen(false); handleSignOut(); }}
                >
                  <LogOut className="w-4 h-4" />
                  Çıkış Yap
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start text-muted-foreground"
                  onClick={() => { setMobileOpen(false); navigate("/giris"); }}
                >
                  Giriş Yap
                </Button>
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
                  onClick={() => { setMobileOpen(false); navigate("/giris"); }}
                >
                  Ücretsiz Kayıt
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
