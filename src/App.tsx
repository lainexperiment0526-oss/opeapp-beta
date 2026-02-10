import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { PiProvider } from "@/hooks/usePiNetwork";
import Index from "./pages/Index";
import AppDetail from "./pages/AppDetail";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import SubmitApp from "./pages/SubmitApp";
import MyApps from "./pages/MyApps";
import AdvertiserDashboard from "./pages/AdvertiserDashboard";
import AdModeration from "./pages/AdModeration";
import Analytics from "./pages/Analytics";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import License from "./pages/License";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <PiProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/app/:id" element={<AppDetail />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/submit" element={<SubmitApp />} />
                <Route path="/my-apps" element={<MyApps />} />
                <Route path="/advertiser" element={<AdvertiserDashboard />} />
                <Route path="/ad-moderation" element={<AdModeration />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/license" element={<License />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </PiProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
