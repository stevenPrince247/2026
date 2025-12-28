import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Copy, ExternalLink, Upload } from "lucide-react";
import { z } from "zod";

const WITHDRAW_MIN_NGN = 100000;
const WITHDRAW_ACTIVATION_FEE_NGN = 13450;
const ACTIVATION_BANK_NAME = "Moniepoint MFB";
const ACTIVATION_ACCOUNT_NAME = "BLESSING WILLIAMS";
const ACTIVATION_ACCOUNT_NUMBER = "6477528228";
const SUPPORT_TELEGRAM_URL = "https://t.me/OfficialChixx9ja";

const withdrawalSchema = z.object({
  amount: z.number()
    .min(WITHDRAW_MIN_NGN, `Minimum withdrawal is ₦${WITHDRAW_MIN_NGN.toLocaleString()}`)
    .max(1000000000, "Amount too large"),
  bankName: z.string()
    .trim()
    .min(2, "Bank name required")
    .max(100, "Bank name too long"),
  accountName: z.string()
    .trim()
    .min(2, "Account name required")
    .max(100, "Account name too long"),
  accountNumber: z.string()
    .trim()
    .regex(/^[0-9]{10}$/, "Account number must be exactly 10 digits"),
});

interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
  availableBalance: number;
  onSuccess: () => void;
}

export const WithdrawModal = ({ open, onClose, availableBalance, onSuccess }: WithdrawModalProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [withdrawalId, setWithdrawalId] = useState<string>("");
  
  const [formData, setFormData] = useState({
    amount: WITHDRAW_MIN_NGN,
    bankName: "",
    accountName: "",
    accountNumber: "",
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStep1Submit = async () => {
    try {
      setLoading(true);

      // Validate form
      const validation = withdrawalSchema.safeParse({
        ...formData,
        amount: Number(formData.amount),
      });

      if (!validation.success) {
        toast({
          variant: "destructive",
          description: validation.error.errors[0].message,
        });
        return;
      }

      // Check balance
      if (formData.amount > availableBalance) {
        toast({
          variant: "destructive",
          description: "Insufficient balance",
        });
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create withdrawal request
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: user.id,
          amount: formData.amount,
          withdrawal_amount: formData.amount,
          bank_name: formData.bankName,
          account_name: formData.accountName,
          account_number: formData.accountNumber,
          activation_fee: WITHDRAW_ACTIVATION_FEE_NGN,
          status: 'awaiting_activation_payment'
        })
        .select()
        .single();

      if (error) throw error;

      setWithdrawalId(data.id);
      setStep(2);
      
      toast({
        description: "Withdrawal request created. Please complete activation payment.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: "Failed to create withdrawal request. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyAccountDetails = () => {
    const details = `Bank: ${ACTIVATION_BANK_NAME}\nAccount Name: ${ACTIVATION_ACCOUNT_NAME}\nAccount Number: ${ACTIVATION_ACCOUNT_NUMBER}`;
    navigator.clipboard.writeText(details);
    toast({
      description: "Account details copied to clipboard",
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        description: "Only PNG, JPG, and PDF files are allowed",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        description: "File size must be less than 5MB",
      });
      return;
    }

    try {
      setLoading(true);

      // Upload to Supabase storage
      const fileName = `${withdrawalId}-${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage
        .from('withdrawal-proofs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Generate signed URL (expires in 24 hours)
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('withdrawal-proofs')
        .createSignedUrl(fileName, 86400);

      if (signedUrlError) throw signedUrlError;

      // Update withdrawal request
      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update({
          payment_screenshot: signedUrlData.signedUrl,
          status: 'under_review'
        })
        .eq('id', withdrawalId);

      if (updateError) throw updateError;

      toast({
        description: "Receipt uploaded. We'll review and notify you.",
      });

      // Reset and close
      setTimeout(() => {
        handleClose();
        onSuccess();
      }, 1500);

    } catch (error: any) {
      toast({
        variant: "destructive",
        description: "Failed to upload receipt. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      amount: WITHDRAW_MIN_NGN,
      bankName: "",
      accountName: "",
      accountNumber: "",
    });
    setWithdrawalId("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Withdrawal</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Minimum withdrawal is ₦{WITHDRAW_MIN_NGN.toLocaleString()}. Activation fee is ₦{WITHDRAW_ACTIVATION_FEE_NGN.toLocaleString()}.
            </p>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (NGN)</Label>
              <Input
                id="amount"
                type="number"
                min={WITHDRAW_MIN_NGN}
                max={availableBalance}
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Available: ₦{availableBalance.toLocaleString()}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                type="text"
                placeholder="e.g., Access Bank"
                value={formData.bankName}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                type="text"
                placeholder="Full name as per bank"
                value={formData.accountName}
                onChange={(e) => handleInputChange('accountName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                type="text"
                placeholder="10-digit account number"
                maxLength={10}
                value={formData.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <Button 
              onClick={handleStep1Submit} 
              className="w-full"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Proceed
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="font-semibold text-sm mb-3">
                To process your withdrawal, pay ₦{WITHDRAW_ACTIVATION_FEE_NGN.toLocaleString()} to:
              </p>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Bank:</span> {ACTIVATION_BANK_NAME}</p>
                <p><span className="font-medium">Account Name:</span> {ACTIVATION_ACCOUNT_NAME}</p>
                <p><span className="font-medium">Account Number:</span> {ACTIVATION_ACCOUNT_NUMBER}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={copyAccountDetails}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Details
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.open(SUPPORT_TELEGRAM_URL, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Support
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt">Upload payment receipt</Label>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, or PDF (max 5MB)
              </p>
              <div className="flex items-center justify-center w-full">
                <label htmlFor="receipt" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload receipt
                    </p>
                  </div>
                  <input 
                    id="receipt" 
                    type="file" 
                    className="hidden" 
                    accept="image/png,image/jpeg,image/jpg,application/pdf"
                    onChange={handleFileUpload}
                    disabled={loading}
                  />
                </label>
              </div>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Uploading receipt...</span>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};