import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useUserStore } from "./stores/userStore";
import FloatingTelegramButton from "./components/FloatingTelegramButton";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Withdraw from "./pages/Withdraw";
import WithdrawProcessing from "./pages/WithdrawProcessing";
import WithdrawalForm from "./pages/WithdrawalForm";
import WithdrawalPayment from "./pages/WithdrawalPayment";
import WithdrawalFailed from "./pages/WithdrawalFailed";
import AccountUpgrade from "./pages/AccountUpgrade";
import BuyBPC from "./pages/BuyBPC";
import BuyBPCProcessing from "./pages/BuyBPCProcessing";
import BuyBPCPayment from "./pages/BuyBPCPayment";
import BuyBPCPending from "./pages/BuyBPCPending";
import BuyBPCVerifying from "./pages/BuyBPCVerifying";
import BuyBPCConfirmation from "./pages/BuyBPCConfirmation";
import Broadcast from "./pages/Broadcast";
import Support from "./pages/Support";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import Faq from "./pages/Faq";
import Platform from "./pages/Platform";
import EarnMore from "./pages/EarnMore";
import TransactionHistory from "./pages/TransactionHistory";
import Leaderboard from "./pages/Leaderboard";

const queryClient = new QueryClient();

// Theme management component
const ThemeManager = () => {
  const { themeMode } = useUserStore();

  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes first
    root.classList.remove('dark', 'light', 'system', 'device');

    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else if (themeMode === 'system') {
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.add('light');
      }

      // Add listener for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          root.classList.remove('light');
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
          root.classList.add('light');
        }
      };

      mediaQuery.addEventListener('change', handleChange);

      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    } else if (themeMode === 'device') {
      root.classList.add('device');
    } else {
      // Light mode is default
      root.classList.add('light');
    }
  }, [themeMode]);

  return null;
};

const AppShell = () => {
  const location = useLocation();

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/withdraw" element={<Withdraw />} />
        <Route path="/withdraw/processing" element={<WithdrawProcessing />} />
        <Route path="/withdrawal/form" element={<WithdrawalForm />} />
        <Route path="/withdrawal/payment" element={<WithdrawalPayment />} />
        <Route path="/withdrawal/failed" element={<WithdrawalFailed />} />
        <Route path="/account-upgrade" element={<AccountUpgrade />} />
        <Route path="/buy-bpc" element={<BuyBPC />} />
        <Route path="/buy-bpc/processing" element={<BuyBPCProcessing />} />
        <Route path="/buy-bpc/payment" element={<BuyBPCPayment />} />
        <Route path="/buy-bpc/pending" element={<BuyBPCPending />} />
        <Route path="/buy-bpc/verifying" element={<BuyBPCVerifying />} />
        <Route path="/buy-bpc/confirmation" element={<BuyBPCConfirmation />} />
        <Route path="/broadcast" element={<Broadcast />} />
        <Route path="/support" element={<Support />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/platform" element={<Platform />} />
        <Route path="/earn-more" element={<EarnMore />} />
        <Route path="/transaction-history" element={<TransactionHistory />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Floating Telegram button on all pages except start page */}
      {location.pathname !== "/" && <FloatingTelegramButton />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeManager />
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
