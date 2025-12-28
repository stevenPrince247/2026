import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle, AlertCircle, Loader2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSettings } from "@/hooks/useAdminSettings";

const BuyBPCPending = () => {
  const navigate = useNavigate();
  const { activationLink } = useAdminSettings();
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes in seconds
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | 'cancelled'>('pending');
  const [bpcCode, setBpcCode] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0 || status !== 'pending') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, status]);

  // Initial status check
  useEffect(() => {
    const checkStatus = async () => {
      setIsChecking(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data, error } = await supabase
          .from('bpc_purchases')
          .select('status, bpc_code')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          if (data.status === 'approved') {
            setStatus('approved');
            setBpcCode(data.bpc_code);
          } else if (data.status === 'rejected') {
            setStatus('rejected');
          } else if (data.status === 'cancelled') {
            setStatus('cancelled');
          }
        }
      } catch (error) {
        console.error('Error checking status:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkStatus();
  }, []);

  // Realtime subscription for instant updates - filter by user_id
  useEffect(() => {
    const setupSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const userId = session.user.id;
      
      const channel = supabase
        .channel('bpc-purchase-status-user')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'bpc_purchases',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log('BPC purchase update received:', payload);
            const newData = payload.new as any;
            if (newData.status === 'approved') {
              setStatus('approved');
              setBpcCode(newData.bpc_code);
            } else if (newData.status === 'rejected') {
              setStatus('rejected');
            } else if (newData.status === 'cancelled') {
              setStatus('cancelled');
            }
          }
        )
        .subscribe((status) => {
          console.log('BPC subscription status:', status);
        });

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupSubscription();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((10 * 60 - timeLeft) / (10 * 60)) * 100;
  };

  if (status === 'approved') {
    return (
      <div className="min-h-screen flex flex-col cosmic-bg relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <header className="glass-header py-4 px-5 flex items-center justify-center sticky top-0 z-20">
          <h1 className="text-xl font-bold text-primary text-glow">BLUEPAY</h1>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
          <div className="glass-card p-8 max-w-sm w-full text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-2">Payment Approved!</h2>
            <p className="text-muted-foreground mb-6">Your BPC code is ready</p>
            
            {bpcCode && (
              <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-4">
                <p className="text-muted-foreground text-sm mb-2">Your BPC Code</p>
                <p className="text-2xl font-bold text-primary tracking-wider">{bpcCode}</p>
              </div>
            )}

            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6">
              <p className="text-orange-400 text-sm font-medium">
                ⚠️ Kindly activate your BPC code before use so you can be credited after withdrawal.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                onClick={() => window.open(activationLink || "https://bluepayactivation2026.vercel.app/", "_blank")}
              >
                Activate BPC Code
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'rejected' || status === 'cancelled') {
    return (
      <div className="min-h-screen flex flex-col cosmic-bg relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-0 right-0 w-96 h-96 ${status === 'cancelled' ? 'bg-orange-500/10' : 'bg-destructive/10'} rounded-full blur-3xl animate-float`} />
          <div className={`absolute bottom-1/4 left-0 w-64 h-64 ${status === 'cancelled' ? 'bg-orange-500/5' : 'bg-destructive/5'} rounded-full blur-3xl animate-float-delayed`} />
        </div>

        <header className="glass-header py-4 px-5 flex items-center justify-center sticky top-0 z-20">
          <h1 className="text-xl font-bold text-primary text-glow">BLUEPAY</h1>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
          <div className="glass-card p-8 max-w-sm w-full text-center">
            <div className={`w-20 h-20 rounded-full ${status === 'cancelled' ? 'bg-orange-500/20' : 'bg-destructive/20'} flex items-center justify-center mx-auto mb-6`}>
              {status === 'cancelled' ? (
                <Ban className="h-10 w-10 text-orange-500" />
              ) : (
                <AlertCircle className="h-10 w-10 text-destructive" />
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {status === 'cancelled' ? 'Purchase Cancelled' : 'Payment Rejected'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {status === 'cancelled' 
                ? 'Your BPC purchase was cancelled by admin. Please contact support for more information.'
                : 'Your payment could not be verified. Please contact support or try again.'}
            </p>

            <div className="space-y-3">
              <Button
                className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90"
                onClick={() => navigate("/buy-bpc")}
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/support")}
              >
                Contact Support
              </Button>
            </div>
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

      <header className="glass-header py-4 px-5 flex items-center justify-center sticky top-0 z-20">
        <h1 className="text-xl font-bold text-primary text-glow">BLUEPAY</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="glass-card p-8 max-w-sm w-full text-center">
          <div className="relative w-32 h-32 mx-auto mb-6">
            {/* Circular progress background */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted/20"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                className="text-primary"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - getProgressPercentage() / 100)}`}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            
            {/* Timer display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Clock className="h-6 w-6 text-primary mb-1" />
              <span className="text-2xl font-bold text-foreground">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-foreground mb-2">Payment Pending</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Waiting for admin approval. This usually takes a few minutes.
          </p>

          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2">
              {isChecking ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
              )}
              <span className="text-foreground text-sm">
                {isChecking ? 'Checking status...' : 'Monitoring for approval...'}
              </span>
            </div>
          </div>

          <p className="text-muted-foreground text-xs mb-4">
            You can close this page. We'll notify you when your payment is approved.
          </p>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/dashboard")}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BuyBPCPending;