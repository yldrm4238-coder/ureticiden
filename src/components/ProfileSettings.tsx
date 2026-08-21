import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ImagePlus, X, User } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  city: string | null;
  district: string | null;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: string;
  member_since: string | null;
}

export function ProfileSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        toast({ title: "Hata", description: "Profil yüklenemedi.", variant: "destructive" });
      } else if (data) {
        setProfile(data as Profile);
        if (data.avatar_url) setAvatarPreview(data.avatar_url);
      }
      setFetchLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast({ title: "Hata", description: "Fotoğraf 3MB'dan küçük olmalıdır.", variant: "destructive" });
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const fileName = `avatars/${user!.id}.${ext}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const form = e.currentTarget;
    const full_name = (form.elements.namedItem("full_name") as HTMLInputElement).value;
    const city = (form.elements.namedItem("city") as HTMLInputElement).value;
    const district = (form.elements.namedItem("district") as HTMLInputElement).value;
    const phone = (form.elements.namedItem("phone") as HTMLInputElement).value;
    const bio = (form.elements.namedItem("bio") as HTMLTextAreaElement).value;

    try {
      let avatar_url = profile?.avatar_url ?? null;
      if (avatarFile) {
        avatar_url = await uploadAvatar(avatarFile);
      } else if (!avatarPreview) {
        avatar_url = null;
      }

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name,
        city: city || null,
        district: district || null,
        phone: phone || null,
        bio: bio || null,
        avatar_url,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({ title: "Profil güncellendi!", description: "Bilgileriniz başarıyla kaydedildi." });
      setProfile((prev) => prev ? { ...prev, full_name, city, district, phone, bio, avatar_url } : prev);
    } catch (err) {
      const description = err instanceof Error ? err.message : "Bir hata oluştu.";
      toast({ title: "Hata", description, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return <div className="text-center py-12 text-muted-foreground">Profil yükleniyor...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Profil Fotoğrafı */}
      <div className="bg-background p-6 rounded-xl border shadow-sm space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Profil Fotoğrafı</h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            {avatarPreview ? (
              <div className="relative">
                <img
                  src={avatarPreview}
                  alt="Profil"
                  className="w-24 h-24 rounded-full object-cover border-2 border-border"
                />
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 hover:bg-destructive/80"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <User className="w-10 h-10 text-muted-foreground/50" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="w-4 h-4 mr-2" />
              Fotoğraf Seç
            </Button>
            <p className="text-xs text-muted-foreground">PNG veya JPG — max 3MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Kişisel Bilgiler */}
      <div className="bg-background p-6 rounded-xl border shadow-sm space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Kişisel Bilgiler</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Ad Soyad</Label>
            <Input
              id="full_name"
              name="full_name"
              required
              placeholder="Ad Soyad"
              defaultValue={profile?.full_name ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="05XX XXX XX XX"
              defaultValue={profile?.phone ?? ""}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">İl</Label>
            <Input
              id="city"
              name="city"
              placeholder="Örn: Antalya"
              defaultValue={profile?.city ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">İlçe</Label>
            <Input
              id="district"
              name="district"
              placeholder="Örn: Kumluca"
              defaultValue={profile?.district ?? ""}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Hakkınızda</Label>
          <Textarea
            id="bio"
            name="bio"
            placeholder="Kendinizi ve ürettiğiniz ürünleri kısaca tanıtın..."
            rows={4}
            defaultValue={profile?.bio ?? ""}
          />
        </div>
      </div>

      {/* Hesap Bilgileri (salt okunur) */}
      <div className="bg-muted/40 p-6 rounded-xl border space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Hesap Bilgileri</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">E-posta</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Hesap Türü</p>
            <p className="font-medium capitalize">{profile?.role === "farmer" ? "Üretici" : "Alıcı"}</p>
          </div>
          {profile?.member_since && (
            <div>
              <p className="text-muted-foreground">Üyelik Tarihi</p>
              <p className="font-medium">{profile.member_since}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4 pb-12">
        <Button type="submit" disabled={loading} className="rounded-xl px-8">
          {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </Button>
      </div>
    </form>
  );
}
