import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "@/hooks/useCategories";
import { Product } from "@/lib/data";
import { ImagePlus, X } from "lucide-react";
import { turkeyData } from "@/lib/turkey-data";

interface ProductFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  product?: Product;
}

export function ProductForm({ onCancel, onSuccess, product }: ProductFormProps) {
  const isEditing = !!product;
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: categories = [] } = useCategories();
  const [loading, setLoading] = useState(false);
  const [isOrganic, setIsOrganic] = useState(product?.isOrganic ?? false);
  const [priceType, setPriceType] = useState<"kg" | "ton" | "negotiable" | "quote">(
    (product?.priceType as "kg" | "ton" | "negotiable" | "quote") ?? "kg"
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image ?? null);
  const [selectedCity, setSelectedCity] = useState<string>(product?.city ?? "");
  const selectedCityData = turkeyData.find(c => c.name === selectedCity);
  const districts = selectedCityData ? selectedCityData.districts : [];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Hata", description: "Resim 5MB'dan küçük olmalıdır.", variant: "destructive" });
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const fileName = `${user!.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Hata", description: "Lütfen önce giriş yapın.", variant: "destructive" });
      return;
    }
    setLoading(true);

    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement).value;
    const category_slug = (form.elements.namedItem("category") as HTMLSelectElement).value;
    const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value;
    const stock = (form.elements.namedItem("stock") as HTMLInputElement).value;
    const min_order = (form.elements.namedItem("minOrder") as HTMLInputElement).value;
    const city = (form.elements.namedItem("city") as HTMLSelectElement).value;
    const district = (form.elements.namedItem("district") as HTMLSelectElement).value;
    const harvest_date = (form.elements.namedItem("harvestDate") as HTMLInputElement).value;
    const priceRaw = (form.elements.namedItem("price") as HTMLInputElement)?.value;
    const price = priceRaw ? parseFloat(priceRaw) : null;

    try {
      let imageUrl: string | null = imagePreview && !imageFile ? imagePreview : null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const payload = {
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
        image: imageUrl,
      };

      if (isEditing) {
        const { error } = await (supabase as any).from("products").update(payload).eq("id", product.id);
        if (error) throw error;
        toast({ title: "Ürün Güncellendi!", description: "Değişiklikler başarıyla kaydedildi." });
      } else {
        const { error } = await (supabase as any).from("products").insert({ ...payload, producer_id: user.id });
        if (error) throw error;
        toast({ title: "Ürün Eklendi!", description: "Ürününüz başarıyla oluşturuldu." });
      }

      onSuccess();
    } catch (err: any) {
      toast({
        title: "Hata",
        description: err.message || "İşlem sırasında bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-4 bg-background p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Temel Bilgiler</h2>

        {/* Resim Yükleme */}
        <div className="space-y-2">
          <Label>Ürün Resmi</Label>
          {imagePreview ? (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border">
              <img src={imagePreview} alt="Önizleme" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
            >
              <ImagePlus className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Resim seçmek için tıklayın</span>
              <span className="text-xs text-muted-foreground/70 mt-1">PNG, JPG — max 5MB</span>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Ürün Başlığı</Label>
            <Input id="title" name="title" required placeholder="Örn: Antalya Domatesi" defaultValue={product?.title} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <select
              id="category"
              name="category"
              defaultValue={product?.categorySlug ?? ""}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="">Seçiniz...</option>
              {(categories as any[]).map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Ürün Açıklaması</Label>
          <Textarea
            id="description"
            name="description"
            required
            placeholder="Ürününüzün özelliklerini kısaca açıklayın..."
            rows={3}
            defaultValue={product?.description}
          />
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
              onChange={(e) => setPriceType(e.target.value as "kg" | "ton" | "negotiable" | "quote")}
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
              <Input
                id="price"
                name="price"
                type="number"
                required
                placeholder="Örn: 45"
                defaultValue={product?.price ?? undefined}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stock">Mevcut Stok</Label>
            <Input id="stock" name="stock" required placeholder="Örn: 5 ton, 1000 kg" defaultValue={product?.stock} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minOrder">Asgari Sipariş</Label>
            <Input id="minOrder" name="minOrder" required placeholder="Örn: 50 kg" defaultValue={product?.minOrder} />
          </div>
        </div>
      </div>

      <div className="space-y-4 bg-background p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Konum ve Tarih</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">İl</Label>
            <select
              id="city"
              name="city"
              required
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">İl Seçiniz...</option>
              {turkeyData.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">İlçe</Label>
            <select
              id="district"
              name="district"
              required
              defaultValue={product?.district ?? ""}
              disabled={!selectedCity}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">İlçe Seçiniz...</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="harvestDate">Hasat Tarihi (veya Beklenen)</Label>
          <Input id="harvestDate" name="harvestDate" required placeholder="Örn: Mart 2026" defaultValue={product?.harvestDate} />
        </div>

        <div className="flex items-center space-x-2 pt-4">
          <Checkbox
            id="organic"
            name="organic"
            checked={isOrganic}
            onCheckedChange={(c) => setIsOrganic(c === true)}
          />
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
          {loading ? "Kaydediliyor..." : isEditing ? "Değişiklikleri Kaydet" : "Ürünü Yayınla"}
        </Button>
      </div>
    </form>
  );
}
