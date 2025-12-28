
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Wallet, Globe, ShoppingBag, Radio } from "lucide-react";

const BottomNavigation = () => {
  const navigate = useNavigate();

  return (
    <div className="h-20 glass-nav fixed bottom-0 w-full flex justify-around items-center px-4 z-20">
      <div 
        className="flex flex-col items-center cursor-pointer group"
        onClick={() => navigate("/dashboard")}
      >
        <div className="p-2 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
          <Wallet className="w-5 h-5 text-primary" />
        </div>
        <span className="text-xs font-medium mt-1 text-primary">Wallet</span>
      </div>

      <div 
        className="flex flex-col items-center cursor-pointer group" 
        onClick={() => navigate("/platform")}
      >
        <div className="p-2 rounded-xl bg-muted/30 group-hover:bg-muted/50 transition-colors">
          <Globe className="w-5 h-5 text-muted-foreground" />
        </div>
        <span className="text-xs font-medium mt-1 text-muted-foreground">Social</span>
      </div>

      <div className="flex flex-col items-center -mt-6">
        <Button 
          className="rounded-full h-14 w-14 bg-gradient-to-br from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 shadow-lg glow-blue border border-primary/30"
          onClick={() => navigate("/buy-bpc")}
        >
          <ShoppingBag className="w-6 h-6" />
        </Button>
      </div>

      <div 
        className="flex flex-col items-center cursor-pointer group" 
        onClick={() => navigate("/broadcast")}
      >
        <div className="p-2 rounded-xl bg-muted/30 group-hover:bg-muted/50 transition-colors">
          <Radio className="w-5 h-5 text-muted-foreground" />
        </div>
        <span className="text-xs font-medium mt-1 text-muted-foreground">Broadcast</span>
      </div>
    </div>
  );
};

export default BottomNavigation;
