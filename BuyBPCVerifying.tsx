import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BuyBPCVerifying = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(9);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/buy-bpc/confirmation");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col cosmic-bg relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-primary/5 rounded-full blur-2xl animate-float-slow" />
      </div>

      <header className="glass-header py-4 px-5 flex items-center justify-center sticky top-0 z-20">
        <h1 className="text-xl font-bold text-primary text-glow">BLUEPAY</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        <div className="w-24 h-24 mb-8 relative">
          <div className="w-full h-full rounded-full border-4 border-muted border-t-primary animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-foreground">
            {countdown}
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-3 text-center text-foreground">Verifying your payment</h1>
        <p className="text-base text-muted-foreground text-center max-w-xs">
          Please wait while we confirm your bank transfer...
        </p>
      </div>
    </div>
  );
};

export default BuyBPCVerifying;
