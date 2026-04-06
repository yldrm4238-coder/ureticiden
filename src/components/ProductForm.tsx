import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "@/hooks/useCategories";

export function ProductForm({ onCancel, onSuccess }: { onCancel: () => void, onSuccess: () => void }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: categories = [] } = useCategories();
  const [loading, setLoading] = useState(false);
  const [isOrganic, setIsOrganic] = useState(false);
  const [priceType, setPriceType] = useState("kg");
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Hata", description: "Lütfen önce giriş yapın.", variant: "destructive"});
      return;
    }
    setLoading(true);
    
    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement).value;
    const category_slug = (form.elements.namedItem("category") as HTMLSelectElement).value;
    const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value;
    const stock = (form.elements.namedItem("stock") as HTMLInputElement).value;
    const min_order = (form.elements.namedItem("minOrder") as HTMLInputElement).value;
    const city = (form.elements.namedItem("city") as HTMLInputElement).value;
    const district = (form.elements.namedItem("district") as HTMLInputElement).value;
    const harvest_date = (form.elements.namedItem("harvestDate") as HTMLInputElement).value;
    
    const priceRaw = (form.elements.namedItem("price") as HTMLInputElement)?.value;
    const price = priceRaw ? parseFloat(priceRaw) : null;

    try {
      const { error } = await (supabase as any).from('products').insert({
        title,
        category_slug,
        description,
        stock,
        min_order,
        city,
        district,
        harvest_date,
        price_type: priceType,
        price,
        is_organic: isOrganic,
        producer_id: user.id
      });

      if (error) throw error;

      toast({
        title: "Ürün Eklendi!",
        description: "Ürününüz başarıyla oluşturuldu.",
      });
      onSuccess();
    } catch (err: any) {
      toast({
        title: "Hata",
        description: err.message || "Ürün eklenirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-4 bg-background p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Temel Bilgiler</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Ürün Başlığı</Label>
            <Input id="title" name="title" required placeholder="Örn: Antalya Domatesi" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <select 
              id="category" 
              name="category"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="">Seçiniz...</option>
              {(categories as any[]).map(c => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Ürün Açıklaması</Label>
          <Textarea id="description" name="description" required placeholder="Ürününüzün özelliklerini kısaca açıklayın..." rows={3} />
        </div>
      </div>

      <div className="space-y-4 bg-background p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Fiyat ve Stok</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="priceType">Fiyat Tipi</Label>
            <select 
              id="priceType" 
              name="priceType"
              value={priceType}
              onChange={(e) => setPriceType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="kg">₺ / Kilogram</option>
              <option value="ton">₺ / Ton</option>
              <option value="negotiable">Pazarlık Usulü</option>
              <option value="quote">Teklif İste</option>
            </select>
          </div>
          
          {(priceType === "kg" || priceType === "ton") && (
            <div className="space-y-2">
              <Label htmlFor="price">Fiyat (₺)</Label>
              <Input id="price" name="price" type="number" required placeholder="Örn: 45" />
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stock">Mevcut Stok</Label>
            <Input id="stock" name="stock" required placeholder="Örn: 5 ton, 1000 kg" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minOrder">Asgari Sipariş</Label>
            <Input id="minOrder" name="minOrder" required placeholder="Örn: 50 kg" />
          </div>
        </div>
      </div>

      <div className="space-y-4 bg-background p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Konum ve Tarih</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">İl</Label>
            <Input id="city" name="city" required placeholder="Örn: Antalya" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">İlçe</Label>
            <Input id="district" name="district" required placeholder="Örn: Kumluca" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="harvestDate">Hasat Tarihi (veya Beklenen)</Label>
          <Input id="harvestDate" name="harvestDate" required placeholder="Örn: Mart 2026" />
        </div>
        
        <div className="flex items-center space-x-2 pt-4">
          <Checkbox id="organic" name="organic" checked={isOrganic} onCheckedChange={(c) => setIsOrganic(c === true)} />
          <Label htmlFor="organic" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Bu ürün organik sertifikalıdır
          </Label>
        </div>
      </div>

      <div className="flex justify-end gap-4 pb-12">
        <Button type="button" variant="outline" onClick={onCancel}>
          İptal Et
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Kaydediliyor..." : "Ürünü Yayınla"}
        </Button>
      </div>
    </form>
  );
}

