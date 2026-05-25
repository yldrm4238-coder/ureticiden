import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, BadgeCheck, Star, Package, Calendar, ArrowLeft, MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Product } from "@/lib/data";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ProducerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data: products = [], isLoading: isLoadingProducts } = useProducts();

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
      return data;
    },
  });

  const { data: reviews = [], isLoading: isLoadingReviews } = useQuery({
    queryKey: ["reviews", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("reviews")
        .select(`*, reviewer:profiles!reviews_reviewer_id_fkey(full_name, avatar_url)`)
        .eq("producer_id", id)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const submitReview = useMutation({
    mutationFn: async () => {
      if (!user || !id) return;
      const { error } = await (supabase as any).from("reviews").insert({
        reviewer_id: user.id,
        producer_id: id,
        rating: reviewRating,
        content: reviewText.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
      toast({ title: "Yorumunuz eklendi!" });
      setReviewText("");
      setReviewRating(5);
      setShowReviewForm(false);
    },
    onError: (err: any) => {
      if (err.message?.includes("unique")) {
        toast({ title: "Hata", description: "Bu üreticiye zaten yorum yaptınız.", variant: "destructive" });
      } else {
        toast({ title: "Hata", description: err.message, variant: "destructive" });
      }
    },
  });

  const deleteReview = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await (supabase as any).from("reviews").delete().eq("id", reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
      toast({ title: "Yorum silindi." });
    },
  });

  const handleSendMessage = async () => {
    if (!user) { navigate("/giris"); return; }
    if (!messageText.trim() || !id) return;
    setSending(true);
    try {
      const { data: existing } = await (supabase as any)
        .from("conversations")
        .select("id")
        .is("product_id", null)
        .eq("buyer_id", user.id)
        .eq("producer_id", id)
        .single();

      let convId = existing?.id;
      if (!convId) {
        const { data: newConv, error } = await (supabase as any)
          .from("conversations")
          .insert({ product_id: null, buyer_id: user.id, producer_id: id })
          .select("id")
          .single();
        if (error) throw error;
        convId = newConv.id;
      }

      const { error: msgError } = await (supabase as any)
        .from("messages")
        .insert({ conversation_id: convId, sender_id: user.id, content: messageText.trim() });
      if (msgError) throw msgError;

      toast({ title: "Mesaj gönderildi!", description: "Mesajlarım sayfasından takip edebilirsiniz." });
      setMessageText("");
      setShowMessageBox(false);
      navigate("/mesajlarim");
    } catch (err: any) {
      toast({ title: "Hata", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const producerProducts = products.filter((p: Product) => p.producer.id === id);
  const isLoading = isLoadingProducts || isLoadingProfile;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg font-semibold text-foreground">Yükleniyor...</p>
      </div>
    );
  }

  const producerFromProducts = producerProducts[0]?.producer;
  const name = profile?.full_name || producerFromProducts?.name;

  if (!name) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Üretici bulunamadı</p>
          <Link to="/pazar" className="text-primary hover:underline text-sm mt-2 inline-block">
            Pazar yerine dön
          </Link>
        </div>
      </div>
    );
  }

  const city = profile?.city || producerFromProducts?.city || "";
  const isVerified = producerFromProducts?.isVerified ?? false;
  const memberSince = producerFromProducts?.memberSince || profile?.created_at?.slice(0, 4) || "";
  const bio = profile?.bio || null;
  const avatarUrl = profile?.avatar_url || null;
  const initials = name.split(" ").map((n: string) => n[0]).join("");

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const alreadyReviewed = reviews.some((r: any) => r.reviewer_id === user?.id);
  const isOwnProfile = user?.id === id;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  };

  const pageTitle = `${name} — Üretici Profili | Üreticiden`;
  const pageDesc = bio || `${name}, ${city} bölgesinden ${producerProducts.length} ürün sunan üretici.`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        {avatarUrl && <meta property="og:image" content={avatarUrl} />}
        <meta property="og:type" content="profile" />
      </Helmet>
      <Navbar />

      <div className="container pt-28 pb-20">
        <Link to="/pazar" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Pazar Yerine Dön
        </Link>

        {/* Producer header */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-leaf-light flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary">{initials}</span>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">{name}</h1>
                {isVerified && <BadgeCheck className="w-5 h-5 text-primary" />}
              </div>

              {bio && <p className="text-sm text-muted-foreground">{bio}</p>}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {city}
                  </span>
                )}
                {avgRating && (
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    {avgRating} ({reviews.length} yorum)
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  {producerProducts.length} ürün
                </span>
                {memberSince && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {memberSince}'den beri üye
                  </span>
                )}
              </div>
            </div>

            {!isOwnProfile && (
              showMessageBox ? (
                <div className="space-y-1 w-full sm:w-auto">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value.slice(0, 1000))}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                      placeholder="Mesajınızı yazın..."
                      maxLength={1000}
                      className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      autoFocus
                    />
                    <Button onClick={handleSendMessage} disabled={sending || !messageText.trim()} className="rounded-xl px-4 bg-primary text-primary-foreground hover:bg-primary/90">
                      <Send className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" onClick={() => { setShowMessageBox(false); setMessageText(""); }} className="rounded-xl px-3">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  {messageText.length > 800 && (
                    <p className={`text-xs text-right ${messageText.length >= 1000 ? "text-destructive" : "text-muted-foreground"}`}>
                      {messageText.length}/1000
                    </p>
                  )}
                </div>
              ) : (
                <Button onClick={() => setShowMessageBox(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl gap-2 shrink-0">
                  <MessageCircle className="w-4 h-4" />
                  Mesaj Gönder
                </Button>
              )
            )}
          </div>
        </div>

        {/* Products */}
        {producerProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-6">
              Ürünleri ({producerProducts.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {producerProducts.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">
              Değerlendirmeler {reviews.length > 0 && `(${reviews.length})`}
            </h2>
            {user && !isOwnProfile && !alreadyReviewed && !showReviewForm && (
              <Button variant="outline" className="rounded-xl gap-2" onClick={() => setShowReviewForm(true)}>
                <Star className="w-4 h-4" />
                Yorum Yap
              </Button>
            )}
          </div>

          {/* Yorum formu */}
          {showReviewForm && (
            <div className="bg-card border border-border rounded-2xl p-5 mb-6 space-y-4">
              <h3 className="font-semibold text-foreground">Yorum Yap</h3>

              {/* Yıldız seçimi */}
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= (hoverRating || reviewRating)
                          ? "fill-accent text-accent"
                          : "text-border"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground self-center">
                  {["", "Çok kötü", "Kötü", "Orta", "İyi", "Mükemmel"][hoverRating || reviewRating]}
                </span>
              </div>

              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Deneyiminizi paylaşın..."
                rows={3}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />

              <div className="flex gap-2 justify-end">
                <Button variant="outline" className="rounded-xl" onClick={() => { setShowReviewForm(false); setReviewText(""); setReviewRating(5); }}>
                  İptal
                </Button>
                <Button
                  className="rounded-xl"
                  disabled={!reviewText.trim() || submitReview.isPending}
                  onClick={() => submitReview.mutate()}
                >
                  {submitReview.isPending ? "Gönderiliyor..." : "Yorumu Gönder"}
                </Button>
              </div>
            </div>
          )}

          {isLoadingReviews ? (
            <p className="text-sm text-muted-foreground">Yorumlar yükleniyor...</p>
          ) : reviews.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
              <Star className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <div key={review.id} className="bg-card border border-border rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
                        {review.reviewer?.avatar_url ? (
                          <img src={review.reviewer.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-muted-foreground">
                            {(review.reviewer?.full_name || "?").split(" ").map((n: string) => n[0]).join("")}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {review.reviewer?.full_name || "Kullanıcı"}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDate(review.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < review.rating ? "fill-accent text-accent" : "text-border"}`}
                          />
                        ))}
                      </div>
                      {user?.id === review.reviewer_id && (
                        <button
                          onClick={() => deleteReview.mutate(review.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                          title="Yorumu sil"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProducerProfile;
