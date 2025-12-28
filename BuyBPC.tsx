import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Copy, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserStore } from "../stores/userStore";
import { toast } from "@/hooks/use-toast";
import TypewriterText from "../components/ui/TypewriterText";
import { useGoBack } from "@/hooks/useGoBack";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { supabase } from "@/integrations/supabase/client";

const BuyBPC = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const { userData } = useUserStore();
  const { bpcAmount, activationLink } = useAdminSettings();
  const [fullName, setFullName] = useState(userData?.fullName || "");
  const [email, setEmail] = useState(userData?.email || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTypewriter, setShowTypewriter] = useState(true);
  
  // State for existing approved BPC
  const [isCheckingBPC, setIsCheckingBPC] = useState(true);
  const [existingBPC, setExistingBPC] = useState<{
    bpc_code: string;
    created_at: string;
  } | null>(null);

  useEffect(() => {
    checkExistingApprovedBPC();
  }, []);

  const checkExistingApprovedBPC = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsCheckingBPC(false);
        return;
      }

      const { data, error } = await supabase
        .from('bpc_purchases')
        .select('bpc_code, created_at')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && data.bpc_code) {
        setExistingBPC({
          bpc_code: data.bpc_code,
          created_at: data.created_at,
        });
      }
    } catch (error) {
      console.error('Error checking existing BPC:', error);
    } finally {
      setIsCheckingBPC(false);
    }
  };

  const handleCopyCode = () => {
    if (existingBPC?.bpc_code) {
      navigator.clipboard.writeText(existingBPC.bpc_code);
      toast({
        description: "BPC code copied to clipboard!",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !email) {
      toast({
        variant: "destructive",
        description: "Please fill in all fields",
      });
      return;
    }
    
    setIsSubmitting(true);
    navigate("/buy-bpc/payment");
  };

  // Show loading while checking for existing BPC
  if (isCheckingBPC) {
    return (
      <div className="min-h-screen flex flex-col cosmic-bg relative overflow-hidden items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground mt-4">Checking your BPC status...</p>
      </div>
    );
  }

  // Show existing BPC code if user has one
  if (existingBPC) {
    return (
      <div className="min-h-screen flex flex-col cosmic-bg relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <header className="glass-header py-4 px-5 flex items-center sticky top-0 z-20">
          <button onClick={goBack} className="mr-3 text-foreground/80 hover:text-foreground transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-primary text-glow">Your BPC Code</h1>
        </header>

        <div className="flex-1 p-4 relative z-10 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="glass-card p-8 rounded-2xl border border-green-500/30 bg-green-500/5 text-center">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-foreground mb-2">
                You Already Have a BPC Code!
              </h2>
              <p className="text-muted-foreground mb-6">
                Your BPC purchase was approved. Here's your code:
              </p>

              <div className="bg-background/50 rounded-xl p-6 mb-6 border border-border/30">
                <p className="text-3xl font-mono font-bold text-primary tracking-widest">
                  {existingBPC.bpc_code}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Purchased on {new Date(existingBPC.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-col gap-3 mb-4">
                <Button
                  onClick={handleCopyCode}
                  className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 text-lg py-6 rounded-xl font-semibold"
                >
                  <Copy className="h-5 w-5 mr-2" />
                  Copy Code
                </Button>

                <Button
                  onClick={() => window.open(activationLink, '_blank')}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 text-lg py-6 rounded-xl font-semibold"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Activate BPC Code
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                Kindly activate your BPC code before use so you can be credited after withdrawal.
              </p>
            </div>

            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="w-full mt-4 text-muted-foreground"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col cosmic-bg relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-primary/5 rounded-full blur-2xl animate-float-slow" />
      </div>

      <header className="glass-header py-4 px-5 flex items-center sticky top-0 z-20">
        <button onClick={goBack} className="mr-3 text-foreground/80 hover:text-foreground transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-primary text-glow">Buy BPC Code</h1>
      </header>

      {showTypewriter && userData && (
        <div className="glass-card mx-4 mt-4 p-4 border-primary/30 bg-primary/5 relative z-10">
          <p className="text-foreground text-sm">
            Welcome back, <TypewriterText text={userData.fullName || "User"} speed={100} className="font-semibold text-primary" />
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Email: <TypewriterText text={userData.email || ""} speed={80} className="font-medium" />
          </p>
        </div>
      )}

      <div className="flex-1 p-4 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Amount</label>
            <Input
              type="text"
              value={`₦${bpcAmount.toLocaleString()}`}
              readOnly
              className="glass-input bg-muted/30"
              placeholder="₦0.00"
            />
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Full Name</label>
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="glass-input"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Your Email Address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input"
              placeholder="email@example.com"
            />
          </div>
          
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 text-lg py-6 rounded-xl font-semibold"
          >
            {isSubmitting ? "Processing..." : "Pay"}
          </Button>
          
          <p className="text-center text-muted-foreground text-sm">
            Your BPC code will be displayed on the app once your payment is confirmed.
          </p>
        </form>
      </div>
    </div>
  );
};

export default BuyBPC;