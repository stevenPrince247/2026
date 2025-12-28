import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserStore } from "../stores/userStore";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { useGoBack } from "@/hooks/useGoBack";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useProfileBalances } from "@/hooks/useProfileBalances";

const withdrawalSchema = z.object({
  accountName: z
    .string()
    .trim()
    .min(3, "Account name too short")
    .max(100, "Account name too long")
    .regex(/^[a-zA-Z\s]+$/, "Account name must contain only letters"),
  accountNumber: z
    .string()
    .trim()
    .length(10, "Account number must be exactly 10 digits")
    .regex(/^\d{10}$/, "Account number must contain only digits"),
  bank: z.string().trim().min(1, "Please select a bank"),
  amount: z
    .number()
    .positive("Amount must be positive")
    .min(100, "Minimum withdrawal is ₦100")
    .max(10000000, "Maximum withdrawal is ₦10,000,000"),
  bpcCode: z.string().trim().min(1, "BPC code is required"),
});

const Withdraw = () => {
  const goBack = useGoBack();
  const navigate = useNavigate();
  const { userData, addTransaction } = useUserStore();
  const { totalBalance, mainBalance, referralEarnings, isLoading: isLoadingBalance, refresh } = useProfileBalances();

  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bank, setBank] = useState("");
  const [amount, setAmount] = useState("");
  const [bpcCode, setBpcCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAccountName, setIsLoadingAccountName] = useState(false);
  const [validBpcCode, setValidBpcCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchBpcCode = async () => {
      const { data } = await supabase
        .from("admin_settings")
        .select("setting_value")
        .eq("setting_key", "bpc_code")
        .single();

      if (data) {
        setValidBpcCode(data.setting_value);
      }
    };
    fetchBpcCode();
  }, []);

  const nigerianBanks = [
    "Access Bank",
    "Zenith Bank",
    "First Bank",
    "GTBank",
    "UBA",
    "Fidelity Bank",
    "Ecobank",
    "Sterling Bank",
    "Union Bank",
    "Wema Bank",
    "FCMB",
    "Polaris Bank",
    "Stanbic IBTC",
    "Heritage Bank",
    "Keystone Bank",
    "Jaiz Bank",
    "Unity Bank",
    "Providus Bank",
    "TAJBank",
    "SunTrust Bank",
    "Globus Bank",
    "Premium Trust Bank",
    "Kuda Bank",
    "Moniepoint",
    "PalmPay",
    "OPay",
    "VFD Microfinance Bank",
    "Brass Bank",
    "Carbon",
    "Sparkle",
    "Rubies Bank",
    "Mint Digital Bank",
  ];

  const mockAccountLookup = () => {
    if (userData && userData.fullName) {
      return userData.fullName.toUpperCase();
    }
    return "ACCOUNT HOLDER NAME";
  };

  useEffect(() => {
    if (accountNumber.length === 10 && bank) {
      setIsLoadingAccountName(true);

      const timer = setTimeout(() => {
        const fetchedName = mockAccountLookup();
        if (fetchedName) {
          setAccountName(fetchedName);
          toast({
            description: "Account name loaded successfully!",
          });
        } else {
          setAccountName("");
          toast({
            variant: "destructive",
            description: "Account not found. Please verify account number and bank.",
          });
        }
        setIsLoadingAccountName(false);
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      setAccountName("");
    }
  }, [accountNumber, bank, userData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const numericAmount = parseInt(amount, 10);

      const validated = withdrawalSchema.parse({
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        bank: bank.trim(),
        amount: numericAmount,
        bpcCode: bpcCode.trim(),
      });

      if (!validBpcCode || validated.bpcCode !== validBpcCode) {
        toast({
          variant: "destructive",
          description: "Invalid BPC code. Please enter a valid code.",
        });
        return;
      }

      if (validated.amount > totalBalance) {
        toast({
          variant: "destructive",
          description: "Insufficient balance for this withdrawal",
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ variant: "destructive", description: "Please login again." });
        return;
      }

      // Debit backend balance so Dashboard updates immediately
      let remaining = Number(validated.amount) || 0;
      let newMain = Number(mainBalance) || 0;
      let newReferral = Number(referralEarnings) || 0;

      if (remaining <= newMain) {
        newMain -= remaining;
        remaining = 0;
      } else {
        remaining -= newMain;
        newMain = 0;
        newReferral = Math.max(0, newReferral - remaining);
        remaining = 0;
      }

      const { error: balanceError } = await supabase
        .from("profiles")
        .update({ main_balance: newMain, referral_earnings: newReferral })
        .eq("id", user.id);

      if (balanceError) throw balanceError;

      await refresh();

      addTransaction({
        id: Date.now(),
        type: "Bank Transfer",
        amount: `-₦${validated.amount.toLocaleString()}`,
        date: new Date().toLocaleString(),
        status: "Completed",
        recipient: `${validated.accountName} - ${validated.accountNumber} (${validated.bank})`,
      });

      toast({
        description: "Transfer initiated successfully!",
      });

      navigate("/withdraw/processing", {
        state: {
          amount: validated.amount,
          accountName: validated.accountName,
          accountNumber: validated.accountNumber,
          bank: validated.bank,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          description: error.errors[0].message,
        });
      } else {
        toast({
          variant: "destructive",
          description: "An error occurred. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col cosmic-bg relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-primary/5 rounded-full blur-2xl animate-float-slow" />
      </div>

      <header className="glass-header py-4 px-5 flex items-center sticky top-0 z-20">
        <button
          onClick={goBack}
          className="mr-3 text-foreground/80 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-primary text-glow">Transfer To Bank</h1>
      </header>

      <main className="p-4 relative z-10 flex-1">
        <h2 className="text-2xl font-bold mb-5 text-foreground">Bank Details</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="glass-input"
              placeholder={
                isLoadingAccountName ? "Loading account name..." : "Account Name"
              }
              disabled={isLoadingAccountName}
            />
            {isLoadingAccountName && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <Input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="glass-input"
            placeholder="Account Number (10 digits)"
            maxLength={10}
          />

          <Select value={bank} onValueChange={setBank}>
            <SelectTrigger className="glass-input h-12">
              <SelectValue placeholder="Select Bank" />
            </SelectTrigger>
            <SelectContent className="glass-card border-border/30 max-h-[250px]">
              {nigerianBanks.map((bankName) => (
                <SelectItem
                  key={bankName}
                  value={bankName}
                  className="text-foreground hover:bg-primary/10"
                >
                  {bankName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="glass-input"
            placeholder="Amount"
            inputMode="numeric"
          />

          <Input
            type="text"
            value={bpcCode}
            onChange={(e) => setBpcCode(e.target.value)}
            className="glass-input"
            placeholder="BPC CODE (Buy BPC)"
          />

          <div
            className="text-primary text-base font-semibold cursor-pointer hover:underline"
            onClick={() => navigate("/buy-bpc")}
          >
            <p>Buy BPC code</p>
          </div>

          <div className="glass-card p-4 rounded-xl mt-6">
            <p className="text-lg font-bold text-foreground">
              Available Balance:{" "}
              <span className="text-primary">
                {isLoadingBalance ? "₦..." : `₦${totalBalance.toLocaleString()}`}
              </span>
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 text-base py-6 mt-3 rounded-xl font-semibold"
          >
            {isSubmitting ? "Processing..." : "Submit"}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default Withdraw;

