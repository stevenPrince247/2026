import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSettings } from "@/hooks/useAdminSettings";

const AccountUpgrade = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { paymentBankName, paymentAccountNumber, paymentAccountName, activationFee, isLoading: settingsLoading } = useAdminSettings();

  const bluepayAccount = {
    bankName: paymentBankName,
    accountNumber: paymentAccountNumber,
    accountName: paymentAccountName
  };

  const upgradeAmount = activationFee;

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
      const fileName = `upgrade_${user.data.user.id}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('upgrade-proofs')
        .upload(fileName, screenshot);

      if (uploadError) throw uploadError;

      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('upgrade-proofs')
        .createSignedUrl(fileName, 86400);

      if (signedUrlError) throw signedUrlError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          account_upgraded: true 
        })
        .eq('id', user.data.user.id);

      if (updateError) throw updateError;

      await supabase.from('referral_upgrades').insert({
        user_id: user.data.user.id,
        previous_rate: 7000,
        new_rate: 7000,
        payment_amount: upgradeAmount,
        payment_proof: signedUrlData.signedUrl,
        payment_status: 'pending'
      });

      toast({
        description: "Account upgraded successfully! You can now make withdrawals.",
      });

      setTimeout(() => {
        setIsProcessing(false);
        navigate("/earn-more");
      }, 2000);

    } catch (error) {
      setIsProcessing(false);
      toast({
        variant: "destructive",
        description: "Failed to process upgrade. Please try again.",
      });
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen cosmic-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float-delayed" />
        </div>
        <div className="w-20 h-20 mb-6 relative z-10">
          <div className="w-full h-full rounded-full border-4 border-muted border-t-primary animate-spin"></div>
        </div>
        <h1 className="text-2xl font-bold mb-3 text-center text-glow relative z-10">Processing Upgrade...</h1>
        <p className="text-muted-foreground text-center relative z-10">
          Please wait while we activate your account
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen cosmic-bg text-foreground relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 right-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl animate-float-slow" />
      </div>

      <header className="glass-header sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-foreground">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-glow">Upgrade Account</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-md relative z-10">
        <div className="glass-card rounded-lg p-6 mb-6 glow-blue">
          <h2 className="text-2xl font-bold mb-2 text-glow">Unlock Withdrawals</h2>
          <p className="text-muted-foreground mb-4">
            Upgrade your account to access withdrawal features and start earning!
          </p>
          <div className="glass-card rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Upgrade Fee</p>
            <p className="text-3xl font-bold text-primary">₦{upgradeAmount.toLocaleString()}</p>
          </div>
        </div>

        <div className="glass-card rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-4">Make Payment To:</h3>

          <div className="space-y-4 glass-card p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Bank Name</p>
                <p className="font-semibold">{bluepayAccount.bankName}</p>
              </div>
              <button onClick={() => handleCopy(bluepayAccount.bankName, "Bank name")} className="hover:text-primary transition-colors">
                <Copy size={18} className="text-muted-foreground" />
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Account Number</p>
                <p className="font-semibold text-primary">{bluepayAccount.accountNumber}</p>
              </div>
              <button onClick={() => handleCopy(bluepayAccount.accountNumber, "Account number")} className="hover:text-primary transition-colors">
                <Copy size={18} className="text-muted-foreground" />
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Account Name</p>
                <p className="font-semibold">{bluepayAccount.accountName}</p>
              </div>
              <button onClick={() => handleCopy(bluepayAccount.accountName, "Account name")} className="hover:text-primary transition-colors">
                <Copy size={18} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-4">Upload Payment Screenshot</h3>
          
          <div className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center glass-card">
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
                  <img src={previewUrl} alt="Payment proof" className="max-h-48 mx-auto rounded" />
                  <div className="flex items-center justify-center gap-2 text-green-400">
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
          className="w-full glass-button bg-gradient-to-r from-primary to-primary/80"
          disabled={!screenshot}
        >
          Confirm & Upgrade Account
        </Button>

        <div className="glass-card rounded-lg p-4 mt-6 text-sm border border-primary/30">
          <p className="font-medium">✨ Benefits After Upgrade:</p>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            <li>• Access to withdrawal features</li>
            <li>• Earn ₦7,000 per referral</li>
            <li>• Withdraw earnings from ₦100,000</li>
            <li>• Priority support</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AccountUpgrade;
