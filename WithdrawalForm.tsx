import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useProfileBalances } from "@/hooks/useProfileBalances";

const withdrawalSchema = z.object({
  bankName: z.string().min(3, "Bank name is required"),
  accountName: z.string().min(3, "Account name is required"),
  accountNumber: z
    .string()
    .length(10, "Account number must be 10 digits")
    .regex(/^\d+$/, "Must be numbers only"),
  withdrawalAmount: z.number().min(100000, "Minimum withdrawal is ₦100,000"),
});

const WithdrawalForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { activationFee } = useAdminSettings();
  const { totalBalance, isLoading } = useProfileBalances();

  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");

  useEffect(() => {
    checkPendingWithdrawals();
  }, []);

  const checkPendingWithdrawals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("withdrawal_requests")
        .select("id")
        .eq("user_id", user.id)
        .in("status", ["pending", "under_review"])
        .maybeSingle();

      if (error) throw error;

      if (data) {
        toast({
          variant: "destructive",
          description: "You already have a pending withdrawal request",
        });
        navigate("/earn-more");
      }
    } catch {
      // Silent fail - user can still proceed
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Remove commas and parse as integer to avoid decimal issues
    const cleanAmount = withdrawalAmount.replace(/,/g, "");
    const amount = parseInt(cleanAmount, 10);

    if (isNaN(amount)) {
      toast({
        variant: "destructive",
        description: "Please enter a valid amount",
      });
      return;
    }

    if (amount > totalBalance) {
      toast({
        variant: "destructive",
        description: "Withdrawal amount exceeds available balance",
      });
      return;
    }

    try {
      withdrawalSchema.parse({
        bankName,
        accountName,
        accountNumber,
        withdrawalAmount: amount,
      });

      navigate("/withdrawal/payment", {
        state: {
          bankName,
          accountName,
          accountNumber,
          withdrawalAmount: amount,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          description: error.errors[0].message,
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen cosmic-bg flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-float-delayed" />
        </div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary relative z-10"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cosmic-bg relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-primary/5 rounded-full blur-2xl animate-float-slow" />
      </div>

      <header className="glass-header py-4 px-5 flex items-center sticky top-0 z-20">
        <button
          onClick={() => navigate(-1)}
          className="mr-3 text-foreground/80 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-primary text-glow">Withdrawal Details</h1>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-md relative z-10">
        <section className="glass-card p-6 mb-6" aria-label="Withdrawal form">
          <div className="bg-primary/10 rounded-xl p-4 mb-6 border border-primary/20">
            <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
            <p className="text-2xl font-bold text-primary">₦{totalBalance.toLocaleString()}</p>
          </div>

          <h2 className="text-lg font-semibold mb-4 text-foreground">Enter Your Bank Details</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="bankName" className="text-muted-foreground">
                Bank Name
              </Label>
              <Input
                id="bankName"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Enter bank name"
                className="glass-input mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="accountName" className="text-muted-foreground">
                Account Name
              </Label>
              <Input
                id="accountName"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Enter account name"
                className="glass-input mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="accountNumber" className="text-muted-foreground">
                Account Number
              </Label>
              <Input
                id="accountNumber"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter 10-digit account number"
                className="glass-input mt-1"
                maxLength={10}
                required
              />
            </div>

            <div>
              <Label htmlFor="withdrawalAmount" className="text-muted-foreground">
                Withdrawal Amount
              </Label>
              <Input
                id="withdrawalAmount"
                type="text"
                inputMode="numeric"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                placeholder="Enter amount (minimum ₦100,000)"
                className="glass-input mt-1"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Minimum: ₦100,000</p>
            </div>

            <Button
              type="submit"
              className="w-full mt-6 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 py-6 rounded-xl font-semibold"
              disabled={!withdrawalAmount}
            >
              Proceed to Payment
            </Button>
          </form>
        </section>

        <aside className="glass-card p-4 text-sm border-amber-500/30 bg-amber-500/5">
          <p className="font-medium mb-2 text-foreground">📌 Important Notice:</p>
          <p className="text-muted-foreground">• Minimum withdrawal: ₦100,000</p>
          <p className="text-muted-foreground">• Activation fee: ₦{activationFee.toLocaleString()}</p>
        </aside>
      </main>
    </div>
  );
};

export default WithdrawalForm;

