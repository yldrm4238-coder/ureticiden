import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const productSchema = z
  .object({
    title: z.string().trim().min(3, "Başlık en az 3 karakter olmalı").max(120, "Başlık en fazla 120 karakter olabilir"),
    category_slug: z.string().min(1, "Kategori seçiniz"),
    description: z.string().trim().min(10, "Açıklama en az 10 karakter olmalı").max(2000, "Açıklama en fazla 2000 karakter olabilir"),
    stock: z.string().trim().min(1, "Mevcut stok bilgisi girin"),
    min_order: z.string().trim().min(1, "Asgari sipariş bilgisi girin"),
    city: z.string().min(1, "İl seçiniz"),
    district: z.string().min(1, "İlçe seçiniz"),
    harvest_date: z.string().trim().min(1, "Hasat tarihi girin"),
    price_type: z.enum(["kg", "ton", "negotiable", "quote"]),
    price: z.union([z.coerce.number().positive("Fiyat 0'dan büyük olmalıdır"), z.literal("")]).optional(),
    is_organic: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.price_type === "kg" || data.price_type === "ton") {
        return typeof data.price === "number" && data.price > 0;
      }
      return true;
    },
    { message: "Bu fiyat tipi için geçerli bir fiyat girmelisiniz", path: ["price"] }
  );

type ProductFormValues = z.infer<typeof productSchema>;

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: product?.title ?? "",
      category_slug: product?.categorySlug ?? "",
      description: product?.description ?? "",
      stock: product?.stock ?? "",
      min_order: product?.minOrder ?? "",
      city: product?.city ?? "",
      district: product?.district ?? "",
      harvest_date: product?.harvestDate ?? "",
      price_type: product?.priceType ?? "kg",
      price: product?.price ?? "",
      is_organic: product?.isOrganic ?? false,
    },
  });

  const priceType = watch("price_type");
  const selectedCity = watch("city");
  const isOrganic = watch("is_organic");
  const selectedCityData = turkeyData.find((c) => c.name === selectedCity);
  const districts = selectedCityData ? selectedCityData.districts : [];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Hata", description: "Lütfen bir resim dosyası seçin.", variant: "destructive" });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
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

  const onSubmit = async (values: ProductFormValues) => {
    if (!user) {
      toast({ title: "Hata", description: "Lütfen önce giriş yapın.", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      let imageUrl: string | null = imagePreview && !imageFile ? imagePreview : null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const price = values.price === "" || values.price === undefined ? null : values.price;

      if (isEditing) {
        const payload: TablesUpdate<"products"> = {
          title: values.title,
          category_slug: values.category_slug,
          description: values.description,
          stock: values.stock,
          min_order: values.min_order,
          city: values.city,
          district: values.district,
          harvest_date: values.harvest_date,
          price_type: values.price_type,
          price,
          is_organic: values.is_organic,
          image: imageUrl,
        };
        const { error } = await supabase.from("products").update(payload).eq("id", product.id);
        if (error) throw error;
        toast({ title: "Ürün Güncellendi!", description: "Değişiklikler başarıyla kaydedildi." });
      } else {
        const payload: TablesInsert<"products"> = {
          title: values.title,
          category_slug: values.category_slug,
          description: values.description,
          stock: values.stock,
          min_order: values.min_order,
          city: values.city,
          district: values.district,
          harvest_date: values.harvest_date,
          price_type: values.price_type,
          price,
          is_organic: values.is_organic,
          image: imageUrl,
          producer_id: user.id,
        };
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
        toast({ title: "Ürün Eklendi!", description: "Ürününüz başarıyla oluşturuldu." });
      }

      onSuccess();
    } catch (err) {
      const description = err instanceof Error ? err.message : "İşlem sırasında bir hata oluştu.";
      toast({ title: "Hata", description, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
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
            <Input id="title" placeholder="Örn: Antalya Domatesi" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <select
              id="category"
              {...register("category_slug")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Seçiniz...</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
            {errors.category_slug && <p className="text-xs text-destructive">{errors.category_slug.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Ürün Açıklaması</Label>
          <Textarea
            id="description"
            placeholder="Ürününüzün özelliklerini kısaca açıklayın..."
            rows={3}
            {...register("description")}
          />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>
      </div>

      <div className="space-y-4 bg-background p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Fiyat ve Stok</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="priceType">Fiyat Tipi</Label>
            <select
              id="priceType"
              {...register("price_type")}
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
              <Input id="price" type="number" step="0.01" placeholder="Örn: 45" {...register("price")} />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stock">Mevcut Stok</Label>
            <Input id="stock" placeholder="Örn: 5 ton, 1000 kg" {...register("stock")} />
            {errors.stock && <p className="text-xs text-destructive">{errors.stock.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="minOrder">Asgari Sipariş</Label>
            <Input id="minOrder" placeholder="Örn: 50 kg" {...register("min_order")} />
            {errors.min_order && <p className="text-xs text-destructive">{errors.min_order.message}</p>}
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
              {...register("city", {
                onChange: () => setValue("district", ""),
              })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">İl Seçiniz...</option>
              {turkeyData.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
            {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">İlçe</Label>
            <select
              id="district"
              {...register("district")}
              disabled={!selectedCity}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">İlçe Seçiniz...</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            {errors.district && <p className="text-xs text-destructive">{errors.district.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="harvestDate">Hasat Tarihi (veya Beklenen)</Label>
          <Input id="harvestDate" placeholder="Örn: Mart 2026" {...register("harvest_date")} />
          {errors.harvest_date && <p className="text-xs text-destructive">{errors.harvest_date.message}</p>}
        </div>

        <div className="flex items-center space-x-2 pt-4">
          <Checkbox
            id="organic"
            checked={isOrganic}
            onCheckedChange={(c) => setValue("is_organic", c === true)}
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
