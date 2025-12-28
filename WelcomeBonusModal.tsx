import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles, PartyPopper } from "lucide-react";

const WelcomeBonusModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("bluepay-welcome-bonus-seen");
    if (!hasSeenWelcome) {
      // Small delay to show after page loads
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("bluepay-welcome-bonus-seen", "true");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-sm mx-auto bg-gradient-to-br from-background via-background to-primary/10 border-2 border-primary/50 p-0 overflow-hidden">
        {/* Animated background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        <div className="relative z-10 p-6 text-center">
          {/* Confetti/sparkle icons */}
          <div className="flex justify-center gap-4 mb-4">
            <PartyPopper className="h-8 w-8 text-yellow-400 animate-bounce" style={{ animationDelay: '0s' }} />
            <Gift className="h-12 w-12 text-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
            <PartyPopper className="h-8 w-8 text-yellow-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>

          {/* Welcome text */}
          <h2 className="text-2xl font-bold text-primary mb-2 animate-fade-in">
            🎉 Welcome to BluePay!
          </h2>
          
          <p className="text-muted-foreground mb-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Congratulations on joining our platform!
          </p>

          {/* Bonus amount */}
          <div className="glass-card p-6 rounded-2xl border border-primary/30 mb-4 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-medium text-muted-foreground">Your Welcome Bonus</span>
              <Sparkles className="h-5 w-5 text-yellow-400" />
            </div>
            <p className="text-4xl font-bold text-primary glow-blue">
              ₦200,000
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Has been credited to your account!
            </p>
          </div>

          {/* Info text */}
          <p className="text-xs text-muted-foreground mb-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Start exploring BluePay and maximize your earnings through our referral program!
          </p>

          {/* Close button */}
          <Button 
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold py-3 rounded-xl animate-fade-in"
            style={{ animationDelay: '0.4s' }}
          >
            Start Earning Now! 🚀
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeBonusModal;
