import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Upload, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSettings } from "@/hooks/useAdminSettings";

const WithdrawalPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { bankName, accountName, accountNumber, withdrawalAmount } = location.state || {};
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { paymentBankName, paymentAccountNumber, paymentAccountName, activationFee } = useAdminSettings();

  const bluepayAccount = {
    bankName: paymentBankName,
    accountNumber: paymentAccountNumber,
    accountName: paymentAccountName
  };

  const paymentAmount = activationFee;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: `${label} copied to clipboard!`,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          description: "File size must be less than 5MB",
        });
        return;
      }
      setScreenshot(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleConfirm = async () => {
    if (!screenshot) {
      toast({
        variant: "destructive",
        description: "Please upload payment screenshot",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("Not authenticated");

      const fileExt = screenshot.name.split('.').pop();
      const fileName = `${user.data.user.id}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('withdrawal-proofs')
        .upload(fileName, screenshot);

      if (uploadError) throw uploadError;

      // Store the file path, not the signed URL (signed URLs expire)
      const { error: insertError } = await supabase.from('withdrawal_requests').insert({
        user_id: user.data.user.id,
        amount: paymentAmount,
        withdrawal_amount: Number(withdrawalAmount),
        account_name: accountName,
        account_number: accountNumber,
        bank_name: bankName,
        payment_screenshot: fileName,
        activation_fee: paymentAmount,
        status: 'pending'
      });

      if (insertError) throw insertError;

      setIsProcessing(false);
      navigate("/withdraw-processing", {
        state: {
          amount: withdrawalAmount,
          accountName,
          accountNumber,
          bank: bankName
        }
      });

    } catch (error) {
      setIsProcessing(false);
      toast({
        variant: "destructive",
        description: "Failed to process withdrawal. Please try again.",
      });
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen cosmic-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-float-delayed" />
        </div>
        <div className="w-24 h-24 mb-8 relative z-10">
          <div className="w-full h-full rounded-full border-4 border-muted border-t-primary animate-spin"></div>
        </div>
        <h1 className="text-2xl font-bold mb-3 text-center text-foreground relative z-10">Processing Payment...</h1>
        <p className="text-muted-foreground text-center relative z-10">
          Please wait while we verify your payment
        </p>
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
        <button onClick={() => navigate(-1)} className="mr-3 text-foreground/80 hover:text-foreground transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-primary text-glow">Complete Payment</h1>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-md relative z-10">
        <div className="glass-card p-6 mb-6">
          <div className="bg-primary/10 rounded-xl p-4 mb-4 border border-primary/20">
            <p className="text-sm text-muted-foreground mb-1">Withdrawal Amount</p>
            <p className="text-2xl font-bold text-primary">₦{withdrawalAmount?.toLocaleString()}</p>
          </div>

          <h2 className="text-lg font-semibold mb-4 text-foreground">Payment Required</h2>
          <p className="text-muted-foreground mb-6">
            To process your withdrawal of ₦{withdrawalAmount?.toLocaleString()}, please send a processing fee of ₦{paymentAmount.toLocaleString()} to:
          </p>

          <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-border/30">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Bank Name</p>
                <p className="font-semibold text-foreground">{bluepayAccount.bankName}</p>
              </div>
              <button onClick={() => handleCopy(bluepayAccount.bankName, "Bank name")} className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
                <Copy size={18} className="text-primary" />
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Account Number</p>
                <p className="font-semibold text-foreground">{bluepayAccount.accountNumber}</p>
              </div>
              <button onClick={() => handleCopy(bluepayAccount.accountNumber, "Account number")} className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
                <Copy size={18} className="text-primary" />
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Account Name</p>
                <p className="font-semibold text-foreground">{bluepayAccount.accountName}</p>
              </div>
              <button onClick={() => handleCopy(bluepayAccount.accountName, "Account name")} className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
                <Copy size={18} className="text-primary" />
              </button>
            </div>

            <div className="border-t border-border/30 pt-4 mt-4">
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-2xl font-bold text-primary">₦{paymentAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 mb-6">
          <h3 className="font-semibold mb-4 text-foreground">Upload Payment Screenshot</h3>
          
          <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center bg-muted/10">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="screenshot-upload"
            />
            <label htmlFor="screenshot-upload" className="cursor-pointer">
              {previewUrl ? (
                <div className="space-y-4">
                  <img src={previewUrl} alt="Payment proof" className="max-h-48 mx-auto rounded-lg" />
                  <div className="flex items-center justify-center gap-2 text-green-500">
                    <CheckCircle size={20} />
                    <span>Screenshot uploaded</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload size={32} className="mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload screenshot</p>
                </div>
              )}
            </label>
          </div>
        </div>

        <Button 
          onClick={handleConfirm} 
          className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 py-6 rounded-xl font-semibold"
          disabled={!screenshot}
        >
          Confirm Payment
        </Button>

        <div className="glass-card p-4 mt-6 border-amber-500/30 bg-amber-500/5">
          <p className="font-medium text-amber-500">⚠️ Important:</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Please ensure you've made the payment before clicking confirm. 
            Your withdrawal will be processed after verification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalPayment;
