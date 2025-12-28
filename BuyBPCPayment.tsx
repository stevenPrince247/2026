import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Upload, Image, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSettings } from "@/hooks/useAdminSettings";

const BuyBPCPayment = () => {
  const navigate = useNavigate();
  const { paymentBankName, paymentAccountNumber, paymentAccountName, bpcAmount } = useAdminSettings();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showOpayAlert, setShowOpayAlert] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 10-second loading timer
  useEffect(() => {
    const duration = 10000; // 10 seconds
    const interval = 100; // Update every 100ms
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      setLoadingProgress((elapsed / duration) * 100);

      if (elapsed >= duration) {
        clearInterval(timer);
        setIsLoading(false);
        setShowOpayAlert(true);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        description: `${type} copied to clipboard!`,
        duration: 2000,
      });
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          description: "Please select an image file",
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
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handlePaymentConfirm = async () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        description: "Please upload your payment proof",
      });
      return;
    }

    setIsUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          variant: "destructive",
          description: "Please login to continue",
        });
        navigate("/login");
        return;
      }

      const userId = session.user.id;
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Upload payment proof to storage
      const { error: uploadError } = await supabase.storage
        .from('bpc-proofs')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get the file URL
      const { data: urlData } = supabase.storage
        .from('bpc-proofs')
        .getPublicUrl(fileName);

      // Create BPC purchase record
      const { error: insertError } = await supabase
        .from('bpc_purchases')
        .insert({
          user_id: userId,
          full_name: session.user.user_metadata?.fullName || 'Unknown',
          email: session.user.email || '',
          amount: bpcAmount,
          payment_proof: fileName,
          status: 'pending',
        });

      if (insertError) throw insertError;

      toast({
        title: "Payment Submitted",
        description: "Your payment proof has been uploaded. Waiting for admin approval.",
      });

      navigate("/buy-bpc/pending");
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Failed to upload payment proof",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col cosmic-bg relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <header className="glass-header py-4 px-5 flex items-center justify-center sticky top-0 z-20">
          <h1 className="text-xl font-bold text-primary text-glow">BLUEPAY</h1>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
          <div className="glass-card p-8 max-w-sm w-full text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <Loader2 className="w-24 h-24 text-primary animate-spin" />
            </div>
            
            <h2 className="text-xl font-bold text-foreground mb-2">Processing Payment</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Please wait while we prepare your payment details...
            </p>

            {/* Progress bar */}
            <div className="w-full bg-muted/30 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-100"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>

            <p className="text-muted-foreground text-xs">
              {Math.ceil((100 - loadingProgress) / 10)} seconds remaining...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col cosmic-bg relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-primary/5 rounded-full blur-2xl animate-float-slow" />
      </div>

      {showOpayAlert && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-sm w-full mx-4 text-center">
            <div className="flex flex-col items-center">
              <img
                src="https://i.ibb.co/qLVCfHVK/icon.jpg"
                alt="Opay Logo"
                className="w-12 h-12 mb-3 rounded-full"
              />
              <h2 className="text-destructive text-lg font-bold mb-2">
                Opay Service Down
              </h2>
              <p className="text-foreground mb-3 text-sm">
                Please do not use Opay bank for payments at this time.
              </p>
              <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-xl mb-4 text-xs">
                The Opay bank service is currently experiencing issues. Please
                use other supported banks for your payment.
              </div>
              <Button
                className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90"
                onClick={() => setShowOpayAlert(false)}
              >
                I Understand
              </Button>
            </div>
          </div>
        </div>
      )}

      <header className="glass-header py-4 px-5 flex items-center justify-between sticky top-0 z-20">
        <h1 className="text-xl font-bold text-primary text-glow">BLUEPAY</h1>
      </header>

      <div className="px-4 py-3 flex items-center justify-between border-b border-border/30 relative z-10">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3 text-foreground/80 hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-bold text-foreground">Bank Transfer</h2>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="text-destructive font-medium text-sm"
        >
          Cancel
        </button>
      </div>

      <div className="flex flex-col items-center p-6 relative z-10">
        <h1 className="text-3xl font-bold text-foreground mb-1">NGN {bpcAmount.toLocaleString()}</h1>
        <p className="text-muted-foreground text-sm">BPC Code Purchase</p>
      </div>

      <div className="glass-card mx-4 p-4 border-primary/30 bg-primary/5 relative z-10">
        <h3 className="text-primary text-base font-semibold mb-3">
          Instructions:
        </h3>
        <ol className="list-decimal pl-5 text-foreground space-y-2 text-sm">
          <li>Copy the account details below</li>
          <li>Open your bank app and make a transfer</li>
          <li>Upload your payment screenshot below</li>
          <li>Click "Submit Payment" and wait for admin approval</li>
        </ol>
      </div>

      <div className="glass-card m-4 p-4 relative z-10">
        <div className="mb-4">
          <p className="text-muted-foreground text-xs mb-1">Amount</p>
          <div className="flex justify-between items-center">
            <p className="text-lg font-bold text-foreground">NGN {bpcAmount.toLocaleString()}</p>
            <Button
              variant="default"
              size="sm"
              className="bg-primary hover:bg-primary/90 flex items-center gap-1"
              onClick={() => handleCopy(bpcAmount.toString(), "Amount")}
            >
              <Copy size={14} />
              Copy
            </Button>
          </div>
        </div>

        <div className="mb-4 border-t border-border/30 pt-4">
          <p className="text-muted-foreground text-xs mb-1">Account Number</p>
          <div className="flex justify-between items-center">
            <p className="text-lg font-bold text-foreground">{paymentAccountNumber}</p>
            <Button
              variant="default"
              size="sm"
              className="bg-primary hover:bg-primary/90 flex items-center gap-1"
              onClick={() => handleCopy(paymentAccountNumber, "Account Number")}
            >
              <Copy size={14} />
              Copy
            </Button>
          </div>
        </div>

        <div className="mb-4 border-t border-border/30 pt-4">
          <p className="text-muted-foreground text-xs mb-1">Bank Name</p>
          <p className="text-lg font-bold text-foreground">{paymentBankName}</p>
        </div>

        <div className="border-t border-border/30 pt-4">
          <p className="text-muted-foreground text-xs mb-1">Account Name</p>
          <p className="text-lg font-bold text-foreground">{paymentAccountName}</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="glass-card mx-4 mb-4 p-4 relative z-10">
        <h3 className="text-foreground font-semibold mb-3">Upload Payment Proof</h3>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
        />

        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Payment proof preview"
              className="w-full h-48 object-cover rounded-lg border border-border/30"
            />
            <button
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
              className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 text-xs"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-32 border-2 border-dashed border-primary/30 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors"
          >
            <Upload className="h-8 w-8 text-primary/60" />
            <span className="text-muted-foreground text-sm">Click to upload payment screenshot</span>
          </button>
        )}
      </div>

      <div className="px-4 mb-6 relative z-10">
        <Button
          className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 py-6 text-base font-semibold rounded-xl"
          onClick={handlePaymentConfirm}
          disabled={isUploading || !selectedFile}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            "Submit Payment"
          )}
        </Button>
      </div>
    </div>
  );
};

export default BuyBPCPayment;