import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useUserStore } from "../../stores/userStore";
import { useProfileBalances } from "@/hooks/useProfileBalances";

const BalanceCard = () => {
  const navigate = useNavigate();
  const { balanceVisible, toggleBalanceVisibility } = useUserStore();
  const { totalBalance, isLoading } = useProfileBalances();

  return (
    <div className="glass-card p-3 mb-3 border-primary/30">
      <p className="text-xs mb-1 text-muted-foreground">Available Balance</p>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold text-foreground">
            {isLoading
              ? "₦..."
              : balanceVisible
                ? `₦${totalBalance.toLocaleString()}`
                : "₦***********"}
          </h3>
          <button
            onClick={toggleBalanceVisibility}
            className="p-1 hover:bg-primary/10 rounded transition-colors"
          >
            {balanceVisible ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>
        <Button
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 font-semibold text-xs px-3 py-1 h-7 rounded-full border border-primary/30"
          onClick={() => navigate("/withdraw")}
        >
          Withdraw
        </Button>
      </div>
      <div className="bg-muted/30 rounded-lg p-2 backdrop-blur-sm border border-border/20">
        <div className="flex justify-between items-center">
          <p className="text-[10px] text-muted-foreground">Daily spend target</p>
          <p className="text-[10px] font-semibold text-foreground">₦200,000</p>
        </div>
        <div className="w-full bg-muted/50 h-1 rounded-full mt-1">
          <div
            className="bg-gradient-to-r from-primary to-accent h-1 rounded-full shadow-sm"
            style={{ width: "35%" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;

