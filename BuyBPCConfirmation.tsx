import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const BuyBPCConfirmation = () => {
  const navigate = useNavigate();
  
  const handleSupport = () => {
    toast({
      description: "Redirecting to support...",
      duration: 2000,
    });
    navigate("/support");
  };

  const handleRecheck = () => {
    toast({
      description: "Checking payment status...",
      duration: 2000,
    });
    setTimeout(() => {
      toast({
        variant: "destructive",
        description: "Payment still not confirmed",
        duration: 3000,
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col cosmic-bg relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-primary/5 rounded-full blur-2xl animate-float-slow" />
      </div>

      <header className="glass-header py-4 px-5 flex items-center justify-between sticky top-0 z-20">
        <div className="text-lg font-medium text-foreground">Bank Transfer</div>
        <button 
          onClick={() => navigate("/dashboard")} 
          className="text-destructive font-medium text-sm"
        >
          Cancel
        </button>
      </header>

      <div className="flex-1 flex flex-col p-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center mb-3 md:mb-0">
            <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center glow-blue">
              <div className="w-10 h-10 relative">
                <div className="absolute inset-0 rounded-full border-2 border-yellow-400"></div>
                <div className="absolute inset-1 rounded-full border-2 border-red-500"></div>
                <div className="absolute inset-2 rounded-full bg-primary"></div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">NGN 6,200</p>
          </div>
        </div>
        
        <div className="text-center my-6">
          <p className="text-lg font-medium text-foreground">
            Proceed to your bank app to complete this Transfer
          </p>
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="glass-card border-destructive/30 bg-destructive/10 p-4 flex items-center">
            <AlertCircle className="h-6 w-6 text-destructive mr-3" />
            <span className="text-base font-medium text-destructive">
              Payment not confirmed
            </span>
          </div>
          
          <div className="flex items-center justify-center mt-6">
            <div className="bg-destructive/20 p-4 rounded-full">
              <AlertCircle size={40} className="text-destructive" />
            </div>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-foreground text-base font-medium">
              Need help? Contact support:
            </p>
            
            <button 
              onClick={handleSupport}
              className="text-primary font-medium text-base hover:underline mt-2"
            >
              here
            </button>
          </div>
          
          <div className="flex justify-center mt-4">
            <Button 
              onClick={handleRecheck}
              className="w-full max-w-xs bg-green-600 hover:bg-green-700 text-white py-4 text-lg rounded-xl"
            >
              Re-check
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyBPCConfirmation;
