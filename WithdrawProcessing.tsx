import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const WithdrawProcessing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { amount = 0, accountName = "", accountNumber = "", bank = "" } = location.state || {};

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSuccess(true);
      setTimeout(() => setShowConfetti(true), 200);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex flex-col cosmic-bg relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-green-400/10 rounded-full blur-2xl animate-float-slow" />
          
          {/* Floating particles */}
          {showConfetti && [...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'][i % 5],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <header className="glass-header py-4 px-5 flex items-center justify-center sticky top-0 z-20">
          <h1 className="text-xl font-bold text-primary text-glow">BLUEPAY</h1>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
          {/* Success animation container */}
          <div className="relative mb-8">
            {/* Pulsing rings */}
            <div className="absolute inset-0 w-32 h-32 -m-4">
              <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping-slow" />
              <div className="absolute inset-2 rounded-full bg-green-500/30 animate-ping-slower" />
              <div className="absolute inset-4 rounded-full bg-green-500/40 animate-ping-slowest" />
            </div>
            
            {/* Main icon */}
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center animate-success-bounce shadow-lg shadow-green-500/50">
              <CheckCircle size={56} className="text-white animate-success-check" strokeWidth={2.5} />
            </div>
            
            {/* Sparkles */}
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-sparkle" />
            <Sparkles className="absolute -bottom-1 -left-3 w-5 h-5 text-yellow-400 animate-sparkle-delayed" />
          </div>
          
          <h1 className="text-3xl font-bold mb-3 text-center text-foreground animate-slide-up">
            Transfer Successful!
          </h1>
          
          <p className="text-lg text-muted-foreground text-center mb-8 max-w-xs animate-slide-up-delayed">
            Your transfer has been processed successfully
          </p>
          
          {/* Amount card */}
          <div className="glass-card p-6 rounded-2xl border border-green-500/30 bg-green-500/5 mb-8 animate-slide-up-delayed-2 w-full max-w-sm">
            <p className="text-muted-foreground text-sm text-center mb-2">Amount Transferred</p>
            <p className="text-4xl font-bold text-center text-green-400 animate-number-count">
              ₦{amount.toLocaleString()}
            </p>
            <div className="mt-4 pt-4 border-t border-border/30 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Account</span>
                <span className="text-foreground font-medium">{accountName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bank</span>
                <span className="text-foreground font-medium">{bank}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Account No.</span>
                <span className="text-foreground font-medium">{accountNumber}</span>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleBackToDashboard}
            className="w-full max-w-sm bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 py-6 text-lg rounded-xl font-semibold shadow-lg shadow-green-500/30 animate-slide-up-delayed-3 transition-all hover:scale-[1.02]"
          >
            Continue to Dashboard
          </Button>
        </div>

        <style>{`
          @keyframes ping-slow {
            0% { transform: scale(1); opacity: 0.5; }
            100% { transform: scale(2); opacity: 0; }
          }
          @keyframes ping-slower {
            0% { transform: scale(1); opacity: 0.5; }
            100% { transform: scale(1.8); opacity: 0; }
          }
          @keyframes ping-slowest {
            0% { transform: scale(1); opacity: 0.5; }
            100% { transform: scale(1.6); opacity: 0; }
          }
          @keyframes success-bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          @keyframes success-check {
            0% { transform: scale(0) rotate(-45deg); opacity: 0; }
            50% { transform: scale(1.2) rotate(0deg); }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          @keyframes sparkle {
            0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
            50% { transform: scale(1.3) rotate(180deg); opacity: 0.8; }
          }
          @keyframes slide-up {
            0% { transform: translateY(30px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          @keyframes confetti {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
          }
          @keyframes number-count {
            0% { transform: scale(0.5); opacity: 0; }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-ping-slow { animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
          .animate-ping-slower { animation: ping-slower 2s cubic-bezier(0, 0, 0.2, 1) infinite 0.3s; }
          .animate-ping-slowest { animation: ping-slowest 2s cubic-bezier(0, 0, 0.2, 1) infinite 0.6s; }
          .animate-success-bounce { animation: success-bounce 2s ease-in-out infinite; }
          .animate-success-check { animation: success-check 0.6s ease-out forwards; }
          .animate-sparkle { animation: sparkle 1.5s ease-in-out infinite; }
          .animate-sparkle-delayed { animation: sparkle 1.5s ease-in-out infinite 0.5s; }
          .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
          .animate-slide-up-delayed { animation: slide-up 0.5s ease-out forwards 0.1s; opacity: 0; }
          .animate-slide-up-delayed-2 { animation: slide-up 0.5s ease-out forwards 0.2s; opacity: 0; }
          .animate-slide-up-delayed-3 { animation: slide-up 0.5s ease-out forwards 0.3s; opacity: 0; }
          .animate-confetti { animation: confetti 3s linear infinite; }
          .animate-number-count { animation: number-count 0.6s ease-out forwards 0.3s; opacity: 0; }
        `}</style>
      </div>
    );
  }

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
        {/* Enhanced loading spinner */}
        <div className="relative w-28 h-28 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-muted/30" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-accent animate-spin-reverse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-3 text-center text-foreground">Processing Transfer</h1>
        <p className="text-base text-muted-foreground text-center max-w-xs">
          Please wait while we process your transfer...
        </p>
        
        {/* Progress dots */}
        <div className="flex gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-reverse { animation: spin-reverse 1.5s linear infinite; }
      `}</style>
    </div>
  );
};

export default WithdrawProcessing;