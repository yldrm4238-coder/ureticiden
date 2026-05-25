import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Send, MessageCircle, Package, ArrowLeft } from "lucide-react";

interface Conversation {
  id: string;
  product_id: string | null;
  buyer_id: string;
  producer_id: string;
  updated_at: string;
  product_title?: string;
  product_image?: string;
  other_name?: string;
  last_message?: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (!selectedConv) return;
    fetchMessages(selectedConv.id);

    const sub = supabase
      .channel(`messages:${selectedConv.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${selectedConv.id}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [selectedConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    const { data, error } = await (supabase as any)
      .from("conversations")
      .select(`
        *,
        products(title, image),
        buyer:profiles!conversations_buyer_id_fkey(full_name),
        producer:profiles!conversations_producer_id_fkey(full_name),
        messages(content, created_at)
      `)
      .or(`buyer_id.eq.${user!.id},producer_id.eq.${user!.id}`)
      .order("updated_at", { ascending: false });

    if (error) {
      const { data: simpleData } = await (supabase as any)
        .from("conversations")
        .select("*")
        .or(`buyer_id.eq.${user!.id},producer_id.eq.${user!.id}`)
        .order("updated_at", { ascending: false });

      setConversations((simpleData || []).map((c: any) => ({
        ...c,
        other_name: "Kullanıcı",
        product_title: "Ürün",
      })));
      return;
    }

    const mapped = (data || []).map((c: any) => {
      const isBuyer = c.buyer_id === user!.id;
      const otherProfile = isBuyer ? c.producer : c.buyer;
      const msgs = c.messages || [];
      const lastMsg = msgs.sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      return {
        id: c.id,
        product_id: c.product_id,
        buyer_id: c.buyer_id,
        producer_id: c.producer_id,
        updated_at: c.updated_at,
        product_title: c.products?.title || "Ürün",
        product_image: c.products?.image || null,
        other_name: otherProfile?.full_name || "Kullanıcı",
        last_message: lastMsg?.content || "",
      };
    });

    setConversations(mapped);
    if (mapped.length > 0 && !selectedConv) {
      setSelectedConv(mapped[0]);
    }
  };

  const fetchMessages = async (convId: string) => {
    const { data } = await (supabase as any)
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    setMessages(data || []);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConv || !user) return;
    setSending(true);
    try {
      const { error } = await (supabase as any).from("messages").insert({
        conversation_id: selectedConv.id,
        sender_id: user.id,
        content: newMessage.trim(),
      });
      if (error) throw error;

      await (supabase as any)
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", selectedConv.id);

      setNewMessage("");
    } catch (err: any) {
      toast({ title: "Hata", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "Dün";
    return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Yükleniyor...</div>;
  if (!user) return <Navigate to="/giris" replace />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 container pt-24 pb-6 flex gap-0 max-w-6xl">
        <div className="flex w-full rounded-2xl border overflow-hidden shadow-sm" style={{ height: "calc(100vh - 120px)" }}>

          {/* Sol — Konuşma Listesi: mobilde sohbet açıkken gizle */}
          <div className={`w-full md:w-80 border-r flex flex-col shrink-0 ${selectedConv ? "hidden md:flex" : "flex"}`}>
            <div className="p-4 border-b">
              <h2 className="font-bold text-lg">Mesajlarım</h2>
              <p className="text-xs text-muted-foreground">{conversations.length} konuşma</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <MessageCircle className="w-10 h-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">Henüz mesajınız yok</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Ürün sayfasından mesaj gönderin</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`w-full text-left p-4 border-b hover:bg-muted/40 transition-colors ${selectedConv?.id === conv.id ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      {conv.product_image ? (
                        <img src={conv.product_image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold truncate">{conv.other_name}</p>
                          <span className="text-xs text-muted-foreground shrink-0 ml-1">{formatTime(conv.updated_at)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{conv.product_title}</p>
                        {conv.last_message && (
                          <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{conv.last_message}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Sağ — Aktif Konuşma: mobilde sohbet açıkken tam ekran */}
          <div className={`flex-1 flex-col ${selectedConv ? "flex" : "hidden md:flex"}`}>
            {!selectedConv ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <MessageCircle className="w-14 h-14 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">Bir konuşma seçin</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-4 border-b flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConv(null)}
                    className="md:hidden p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  {selectedConv.product_image ? (
                    <img src={selectedConv.product_image} alt="" className="w-9 h-9 rounded-lg object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                      <Package className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm">{selectedConv.other_name}</p>
                    <p className="text-xs text-muted-foreground">{selectedConv.product_title}</p>
                  </div>
                </div>

                {/* Mesajlar */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-8">
                      Henüz mesaj yok. İlk mesajı gönderin.
                    </div>
                  )}
                  {messages.map((msg) => {
                    const isMe = msg.sender_id === user.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                          isMe
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm"
                        }`}>
                          <p>{msg.content}</p>
                          <p className={`text-xs mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t space-y-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value.slice(0, 1000))}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                      placeholder="Mesajınızı yazın..."
                      maxLength={1000}
                      className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="rounded-xl px-4"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  {newMessage.length > 800 && (
                    <p className={`text-xs text-right ${newMessage.length >= 1000 ? "text-destructive" : "text-muted-foreground"}`}>
                      {newMessage.length}/1000
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
