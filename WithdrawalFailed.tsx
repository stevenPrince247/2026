import React from "react";
import { useNavigate } from "react-router-dom";
import { XCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const WithdrawalFailed = () => {
  const navigate = useNavigate();
  const whatsappNumber = "+2347059382766";

  const handleWhatsAppSupport = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=Hello, I need help with my withdrawal request.`, '_blank');
  };

  return (
    <div className="min-h-screen cosmic-bg flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <header className="glass-header py-4 px-5 flex items-center justify-center sticky top-0 z-20">
        <h1 className="text-xl font-bold text-primary text-glow">Withdrawal Status</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        <div className="w-24 h-24 mb-8 flex items-center justify-center">
          <XCircle size={96} className="text-destructive" strokeWidth={2} />
        </div>
        
        <h1 className="text-2xl font-bold mb-3 text-center text-foreground">Payment Not Completed</h1>
        <p className="text-base text-muted-foreground text-center mb-8 max-w-md">
          We could not verify your payment at this time. Please contact our support team for assistance with your withdrawal request.
        </p>
        
        <div className="w-full max-w-md space-y-3">
          <Button 
            onClick={handleWhatsAppSupport}
            className="w-full gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 py-6 rounded-xl font-semibold"
          >
            <MessageCircle size={20} />
            Contact Support on WhatsApp
          </Button>

          <Button 
            onClick={() => navigate("/earn-more")}
            variant="outline"
            className="w-full py-6 rounded-xl font-semibold border-border/50 text-foreground hover:bg-muted/20"
          >
            Back to Earnings
          </Button>
        </div>

        <div className="mt-8 glass-card p-4 max-w-md">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">💡 Note:</span> Our support team will help verify your payment and process your withdrawal request manually.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalFailed;
