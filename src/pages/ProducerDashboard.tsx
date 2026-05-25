import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, Settings, LogOut, Plus, Home, Pencil, Trash2, MapPin, Leaf, BadgeCheck, MessageCircle, Heart } from "lucide-react";
import { ProductForm } from "@/components/ProductForm";
import { ProfileSettings } from "@/components/ProfileSettings";
import { useProducts } from "@/hooks/useProducts";
import { useFavorites } from "@/hooks/useFavorites";
import ProductCard from "@/components/ProductCard";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Product, priceTypeLabels } from "@/lib/data";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ProducerDashboard() {
  const { user, loading, signOut } = useAuth();
  const { data: products = [], isLoading: isLoadingProducts } = useProducts();
  const { favoriteIds } = useFavorites();
  const [view, setView] = useState<"list" | "add" | "edit" | "profile" | "favorites">("list");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const myProducts = user ? products.filter((p) => p.producer.id === user.id) : [];

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setView("edit");
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    setDeleteLoading(true);
    try {
      const { error } = await (supabase as any).from("products").delete().eq("id", deletingProduct.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Ürün silindi", description: `"${deletingProduct.title}" başarıyla kaldırıldı.` });
    } catch (err: any) {
      toast({ title: "Hata", description: err.message, variant: "destructive" });
    } finally {
      setDeleteLoading(false);
      setDeletingProduct(null);
    }
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
    setEditingProduct(null);
    setView("list");
  };

  if (loading) return (
    <div className="p-8 text-center text-muted-foreground flex items-center justify-center min-h-screen">
      Yükleniyor...
    </div>
  );
  if (!user) return <Navigate to="/giris" replace />;

  return (
    <div className="min-h-screen bg-muted/30 flex w-full">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r h-screen hidden md:flex flex-col sticky top-0">
        <div className="p-4 border-b font-medium flex items-center h-16">
          <Link to="/" className="flex items-center text-primary group">
            <span className="text-xl font-bold bg-primary text-primary-foreground px-2 py-1 rounded mr-2 group-hover:bg-primary/90 transition-colors">Ü</span>
            Üretici Paneli
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => { setView("list"); setEditingProduct(null); }}
          >
            <Package className="mr-2 h-4 w-4" /> Ürünlerim
          </Button>
          <Button
            variant={view === "favorites" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => { setView("favorites"); setEditingProduct(null); }}
          >
            <Heart className="mr-2 h-4 w-4" /> Favorilerim
          </Button>
          <Button variant={view === "profile" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => { setView("profile"); setEditingProduct(null); }}>
            <Settings className="mr-2 h-4 w-4" /> Profil Ayarları
          </Button>
          <Link to="/mesajlarim">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground">
              <MessageCircle className="mr-2 h-4 w-4" /> Mesajlarım
            </Button>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground mt-4">
              <Home className="mr-2 h-4 w-4" /> Siteye Dön
            </Button>
          </Link>
        </nav>
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" /> Çıkış Yap
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-4 md:p-8">

        {view === "list" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold">Ürünlerim</h1>
                <p className="text-sm text-muted-foreground mt-0.5">{myProducts.length} ürün listeleniyor</p>
              </div>
              <Button onClick={() => setView("add")} className="rounded-xl">
                <Plus className="mr-2 h-4 w-4" /> Yeni Ürün Ekle
              </Button>
            </div>

            {isLoadingProducts ? (
              <div className="text-center py-12 text-muted-foreground">Ürünler Yükleniyor...</div>
            ) : myProducts.length === 0 ? (
              <div className="bg-background rounded-2xl border shadow-sm p-12 text-center max-w-2xl mx-auto mt-12">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Henüz ürününüz yok</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Müşterilerinize ulaşmak için ilk ürününüzü hemen ekleyin.
                </p>
                <Button size="lg" className="rounded-full px-8" onClick={() => setView("add")}>
                  <Plus className="mr-2 h-5 w-5" /> İlk Ürünü Ekle
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {myProducts.map((product) => (
                  <DashboardProductCard
                    key={product.id}
                    product={product}
                    onEdit={() => handleEdit(product)}
                    onDelete={() => setDeletingProduct(product)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {view === "add" && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Yeni Ürün Ekle</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Ürün bilgilerini doldurun ve yayınlayın</p>
            </div>
            <ProductForm
              onCancel={() => setView("list")}
              onSuccess={handleFormSuccess}
            />
          </>
        )}

        {view === "profile" && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Profil Ayarları</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Profil bilgilerinizi güncelleyin</p>
            </div>
            <ProfileSettings />
          </>
        )}

        {view === "favorites" && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Favorilerim</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{favoriteIds.length} ürün favorilendi</p>
            </div>
            {favoriteIds.length === 0 ? (
              <div className="bg-background rounded-2xl border shadow-sm p-12 text-center max-w-2xl mx-auto mt-12">
                <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-red-400" />
                </div>
                <h3 className="text-xl font-medium mb-2">Henüz favori ürününüz yok</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Pazar yerinde beğendiğiniz ürünlerin kalbine tıklayarak buraya ekleyebilirsiniz.
                </p>
                <Button size="lg" className="rounded-full px-8" onClick={() => window.location.href = "/pazar"}>
                  Pazar Yerine Git
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products
                  .filter((p) => favoriteIds.includes(p.id))
                  .map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
              </div>
            )}
          </>
        )}

        {view === "edit" && editingProduct && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Ürünü Düzenle</h1>
              <p className="text-sm text-muted-foreground mt-0.5">"{editingProduct.title}" ürününü düzenliyorsunuz</p>
            </div>
            <ProductForm
              product={editingProduct}
              onCancel={() => { setView("list"); setEditingProduct(null); }}
              onSuccess={handleFormSuccess}
            />
          </>
        )}
      </main>

      {/* Silme Onay Dialogu */}
      <AlertDialog open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ürünü silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">"{deletingProduct?.title}"</span> adlı ürün kalıcı olarak silinecek. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? "Siliniyor..." : "Evet, Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DashboardProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const renderPrice = () => {
    if (product.price) {
      return (
        <span className="font-bold text-foreground">
          ₺{product.price.toLocaleString("tr-TR")}
          <span className="text-sm font-normal text-muted-foreground">
            /{product.priceType === "ton" ? "ton" : "kg"}
          </span>
        </span>
      );
    }
    return <span className="font-semibold text-primary">{priceTypeLabels[product.priceType]}</span>;
  };

  return (
    <div className="group rounded-2xl overflow-hidden bg-card border border-border hover:shadow-md transition-shadow duration-200">
      {/* Resim */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {product.isOrganic && (
            <span className="flex items-center gap-1 bg-primary text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full">
              <Leaf className="w-3 h-3" /> Organik
            </span>
          )}
          {product.isVerified && (
            <span className="flex items-center gap-1 bg-card/90 backdrop-blur text-foreground text-xs font-medium px-2.5 py-1 rounded-full">
              <BadgeCheck className="w-3 h-3 text-primary" /> Onaylı
            </span>
          )}
        </div>
        {/* Aksiyon Butonları */}
        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={onEdit}
            className="bg-white/90 backdrop-blur hover:bg-white text-foreground p-2 rounded-xl shadow-sm transition-colors"
            title="Düzenle"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="bg-white/90 backdrop-blur hover:bg-destructive hover:text-white text-foreground p-2 rounded-xl shadow-sm transition-colors"
            title="Sil"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* İçerik */}
      <div className="p-4 space-y-2">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{product.category}</p>
        <h3 className="font-semibold text-card-foreground">{product.title}</h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5" />
          {product.city}, {product.district}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          {renderPrice()}
          <span className="text-xs text-muted-foreground">Min: {product.minOrder}</span>
        </div>
      </div>

      {/* Alt Aksiyon Bar */}
      <div className="px-4 pb-4 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 rounded-xl text-xs h-8"
          onClick={onEdit}
        >
          <Pencil className="w-3 h-3 mr-1" /> Düzenle
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 rounded-xl text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
          onClick={onDelete}
        >
          <Trash2 className="w-3 h-3 mr-1" /> Sil
        </Button>
      </div>
    </div>
  );
}
