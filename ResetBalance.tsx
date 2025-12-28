
import React, { useState } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserStore } from "../stores/userStore";
import { useToast } from "@/components/ui/use-toast";

interface ResetBalanceProps {
  isOpen: boolean;
  onClose: () => void;
}

const ResetBalance = ({ isOpen, onClose }: ResetBalanceProps) => {
  const [bpcCode, setBpcCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { balance, updateBalance, addTransaction } = useUserStore();
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleReset = () => {
    setIsSubmitting(true);
    
    if (!bpcCode) {
      toast({
        variant: "destructive",
        description: "Please enter your BPC code",
      });
      setIsSubmitting(false);
      return;
    }

    if (bpcCode !== "BPC55262527") {
      toast({
        variant: "destructive",
        description: "Invalid BPC code. Please enter a valid code.",
      });
      setIsSubmitting(false);
      return;
    }

    // Reset balance to 200,000
    const newBalance = 200000;
    const difference = newBalance - balance;
    updateBalance(difference);

    // Add transaction record
    addTransaction({
      id: Date.now(),
      type: "Balance Reset",
      amount: `+₦${difference.toLocaleString()}`,
      date: new Date().toLocaleString(),
      status: "Completed",
    });

    toast({
      description: "Balance reset successful! Your balance is now ₦200,000",
    });

    setBpcCode("");
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-bluepay-blue">
      <header className="p-3 flex items-center text-white">
        <button onClick={onClose} className="flex items-center">
          <ArrowLeft className="h-6 w-6 mr-2" />
        </button>
        <h1 className="text-xl font-bold flex-1 text-center">Reset Balance</h1>
        <div className="w-6"></div>
      </header>

      <div className="flex flex-col items-center p-4 text-white">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6">
          <RotateCcw className="h-10 w-10 text-bluepay-blue" />
        </div>

        <h2 className="text-2xl font-bold mb-2 text-center">Reset Your Balance</h2>
        <p className="text-center text-gray-200 mb-8 px-4">
          Enter your BPC code to reset your account balance to ₦200,000
        </p>

        <div className="w-full max-w-md bg-white rounded-xl p-6 text-gray-800">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              BPC Code
            </label>
            <Input
              type="text"
              value={bpcCode}
              onChange={(e) => setBpcCode(e.target.value)}
              placeholder="Enter your BPC code"
              className="w-full"
            />
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Current Balance</h3>
            <p className="text-2xl font-bold text-bluepay-blue">₦{balance.toLocaleString()}</p>
          </div>

          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-gray-700 mb-1">After Reset</h4>
            <p className="text-2xl font-bold text-green-600">₦200,000</p>
          </div>

          <Button
            onClick={handleReset}
            disabled={isSubmitting}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 mb-4"
          >
            {isSubmitting ? "Processing..." : "Reset Balance"}
          </Button>

          <p className="text-sm text-gray-500 text-center">
            This action will reset your balance to ₦200,000. This cannot be undone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetBalance;
