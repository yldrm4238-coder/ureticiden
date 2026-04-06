import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, Settings, LogOut, Plus, Home } from "lucide-react";
import { ProductForm } from "@/components/ProductForm";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";

export default function ProducerDashboard() {
  const { user, loading, signOut } = useAuth();
  const { data: products = [], isLoading: isLoadingProducts } = useProducts();
  const [view, setView] = useState<"list" | "add">("list");
  
  const myProducts = user ? products.filter((p) => p.producer.id === user.id) : [];
  
  if (loading) return <div className="p-8 text-center text-muted-foreground flex items-center justify-center min-h-screen">Yükleniyor...</div>;
  if (!user) return <Navigate to="/giris" replace />;
  
  return (
    <div className="min-h-screen bg-muted/30 flex w-full">
      <aside className="w-64 bg-background border-r h-screen hidden md:flex flex-col sticky top-0">
        <div className="p-4 border-b font-medium flex items-center h-16">
          <Link to="/" className="flex items-center text-primary group">
             <span className="text-xl font-bold bg-primary text-primary-foreground px-2 py-1 rounded mr-2 group-hover:bg-primary/90 transition-colors">Ü</span>
             Üretici Paneli
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Button variant={view === "list" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setView("list")}>
             <Package className="mr-2 h-4 w-4" /> Ürünlerim
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => alert("Ayarlar daha sonra eklenecek.")}>
             <Settings className="mr-2 h-4 w-4" /> Profil Ayarları
          </Button>
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground mt-4">
               <Home className="mr-2 h-4 w-4" /> Siteye Dön
            </Button>
          </Link>
        </nav>
        <div className="p-4 border-t">
           <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={signOut}>
             <LogOut className="mr-2 h-4 w-4" /> Çıkış Yap
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-4 md:p-8">
        
        {view === "list" ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Ürünlerim</h1>
              <Button onClick={() => setView("add")}>
                <Plus className="mr-2 h-4 w-4" /> Yeni Ürün Ekle
              </Button>
            </div>
            
            {isLoadingProducts ? (
              <div className="text-center py-12 text-muted-foreground">Ürünler Yükleniyor...</div>
            ) : myProducts.length === 0 ? (
              <div className="bg-background rounded-xl border shadow-sm p-12 text-center max-w-2xl mx-auto mt-12">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Package className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Henüz ürününüz yok</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Müşterilerinize ulaşmak için ilk ürününüzü hemen ekleyin. Taze ürünlerinizi yüzlerce alıcıyla buluşturun.
                  </p>
                  <Button size="lg" className="rounded-full px-8" onClick={() => setView("add")}>
                    <Plus className="mr-2 h-5 w-5" /> İlk Ürünü Ekle
                  </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {myProducts.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Yeni Ürün Ekle</h1>
            </div>
            <ProductForm onCancel={() => setView("list")} onSuccess={() => setView("list")} />
          </>
        )}
      </main>
    </div>
  );
}
