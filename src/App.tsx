import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import ProductDetail from "./pages/ProductDetail";
import ProducerProfile from "./pages/ProducerProfile";
import Auth from "./pages/Auth";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import ProducerDashboard from "./pages/ProducerDashboard";
import MessagesPage from "./pages/MessagesPage";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/pazar" element={<Marketplace />} />
            <Route path="/urun/:id" element={<ProductDetail />} />
            <Route path="/uretici/:id" element={<ProducerProfile />} />
            <Route path="/giris" element={<Auth />} />
            <Route path="/panel" element={<ProducerDashboard />} />
            <Route path="/hakkimizda" element={<About />} />
            <Route path="/sss" element={<FAQ />} />
            <Route path="/iletisim" element={<Contact />} />
            <Route path="/mesajlarim" element={<MessagesPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
