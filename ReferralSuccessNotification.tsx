import React, { useState, useEffect, useRef } from 'react';
import { Gift, Sparkles, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface ReferralData {
  referral_count: number;
  referral_earnings: number;
  referral_rate: number;
}

// Sound effect for referral success
const playReferralSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Play a celebratory coin/cash sound
    const playTone = (freq: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + startTime);
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + duration);
      oscillator.start(audioContext.currentTime + startTime);
      oscillator.stop(audioContext.currentTime + startTime + duration);
    };
    
    // Ascending celebratory notes
    playTone(523.25, 0, 0.15); // C5
    playTone(659.25, 0.1, 0.15); // E5
    playTone(783.99, 0.2, 0.15); // G5
    playTone(1046.50, 0.3, 0.2); // C6
    playTone(1318.51, 0.4, 0.3); // E6
  } catch (error) {
    console.log('Audio not supported:', error);
  }
};

const ReferralSuccessNotification = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [earnedAmount, setEarnedAmount] = useState(0);
  const [newReferralCount, setNewReferralCount] = useState(0);
  const lastReferralCountRef = useRef<number | null>(null);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    const setupReferralTracking = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      userIdRef.current = session.user.id;

      // Get initial referral count
      const { data } = await supabase
        .from('profiles')
        .select('referral_count, referral_earnings, referral_rate')
        .eq('id', session.user.id)
        .maybeSingle();

      if (data) {
        lastReferralCountRef.current = data.referral_count;
      }
    };

    setupReferralTracking();

    // Subscribe to realtime updates for the user's profile
    const channel = supabase
      .channel('referral-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        async (payload) => {
          const newData = payload.new as ReferralData & { id: string };
          
          // Check if this update is for the current user
          if (newData.id !== userIdRef.current) return;
          
          // Check if referral count increased
          if (
            lastReferralCountRef.current !== null &&
            newData.referral_count > lastReferralCountRef.current
          ) {
            const newReferrals = newData.referral_count - lastReferralCountRef.current;
            const earned = newReferrals * newData.referral_rate;
            
            setEarnedAmount(earned);
            setNewReferralCount(newData.referral_count);
            setIsVisible(true);
            playReferralSound();
          }
          
          lastReferralCountRef.current = newData.referral_count;
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center min-h-screen w-full animate-modal-fade-in overflow-hidden">
      {/* Full screen backdrop */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-10" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large pulsing orbs */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-green-500/20 rounded-full blur-[150px] animate-pulse-slow -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse-slower translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-green-500/15 rounded-full blur-[100px] animate-pulse-slow -translate-x-1/2 -translate-y-1/2" />
        
        {/* Floating coins/particles */}
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float-particle"
            style={{
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
              left: `${Math.random() * 100}%`,
              top: `${100 + Math.random() * 20}%`,
              backgroundColor: ['#22c55e', '#10b981', '#fbbf24', '#34d399'][i % 4],
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 6}s`,
              opacity: 0.8,
            }}
          />
        ))}
        
        {/* Sparkle particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`sparkle-${i}`}
            className="absolute rounded-full animate-sparkle-float"
            style={{
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: '#fbbf24',
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute top-6 left-6 w-12 h-12 rounded-full bg-muted/30 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all z-10 border border-border/30"
      >
        <X size={24} />
      </button>

      {/* Main content */}
      <div className="relative w-full max-w-lg mx-4 px-6 animate-modal-slide-up z-10">
        {/* Card */}
        <div className="p-10 rounded-3xl border-2 border-green-500/30 bg-green-500/10 backdrop-blur-xl overflow-hidden shadow-2xl shadow-green-500/20">
          {/* Icon with animation */}
          <div className="relative flex justify-center mb-8">
            {/* Pulsing rings */}
            <div className="absolute w-36 h-36 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 opacity-20 animate-ping-slow" />
            <div className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 opacity-30 animate-ping-slower" />
            
            {/* Main icon container */}
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-green-500/50 animate-icon-pop">
              <Gift className="w-14 h-14 text-white animate-icon-check" strokeWidth={2} />
            </div>
            
            {/* Sparkles */}
            <Sparkles className="absolute -top-2 right-1/4 w-7 h-7 text-yellow-400 animate-sparkle" />
            <Sparkles className="absolute top-1/4 -right-2 w-6 h-6 text-yellow-400 animate-sparkle-delayed" />
            <Sparkles className="absolute -bottom-1 left-1/4 w-5 h-5 text-yellow-400 animate-sparkle-delayed-2" />
          </div>

          {/* Text content */}
          <div className="text-center mb-8 animate-content-fade-in">
            <p className="text-sm font-medium text-green-400 mb-2">🎉 Referral Success!</p>
            <h2 className="text-3xl font-bold text-foreground mb-3">You Earned a Bonus!</h2>
            <p className="text-muted-foreground">Someone just signed up with your referral code</p>
          </div>

          {/* Earnings display */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 mb-6 animate-content-fade-in-delayed">
            <p className="text-muted-foreground text-sm text-center mb-2">Bonus Earned</p>
            <p className="text-4xl font-bold text-center text-green-400 animate-number-pop">
              +₦{earnedAmount.toLocaleString()}
            </p>
          </div>

          {/* Referral count */}
          <div className="flex items-center justify-center gap-3 mb-8 animate-content-fade-in-delayed">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-full">
              <Users className="w-5 h-5 text-green-400" />
              <span className="text-foreground font-semibold">{newReferralCount} Total Referrals</span>
            </div>
          </div>

          {/* Action button */}
          <div className="animate-content-fade-in-delayed-2">
            <Button
              className="w-full py-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 hover:opacity-90 transition-all hover:scale-[1.02]"
              onClick={handleDismiss}
            >
              Awesome! 🎉
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modal-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modal-slide-up {
          from { opacity: 0; transform: translateY(50px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ping-slow {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes ping-slower {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.15); }
        }
        @keyframes icon-pop {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes icon-check {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.4) rotate(180deg); opacity: 0.7; }
        }
        @keyframes content-fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes number-pop {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes float-particle {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes sparkle-float {
          0%, 100% { transform: scale(0) translateY(0); opacity: 0; }
          25% { transform: scale(1.2) translateY(-20px); opacity: 1; }
          50% { transform: scale(0.8) translateY(-40px); opacity: 0.8; }
          75% { transform: scale(1) translateY(-60px); opacity: 0.6; }
        }
        .animate-modal-fade-in { animation: modal-fade-in 0.4s ease-out; }
        .animate-modal-slide-up { animation: modal-slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-ping-slow { animation: ping-slow 2s ease-in-out infinite; }
        .animate-ping-slower { animation: ping-slower 2s ease-in-out infinite 0.5s; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-pulse-slower { animation: pulse-slower 4s ease-in-out infinite 1s; }
        .animate-icon-pop { animation: icon-pop 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-icon-check { animation: icon-check 0.4s ease-out forwards 0.3s; opacity: 0; }
        .animate-sparkle { animation: sparkle 1.5s ease-in-out infinite; }
        .animate-sparkle-delayed { animation: sparkle 1.5s ease-in-out infinite 0.3s; }
        .animate-sparkle-delayed-2 { animation: sparkle 1.5s ease-in-out infinite 0.6s; }
        .animate-content-fade-in { animation: content-fade-in 0.5s ease-out forwards 0.2s; opacity: 0; }
        .animate-content-fade-in-delayed { animation: content-fade-in 0.5s ease-out forwards 0.4s; opacity: 0; }
        .animate-content-fade-in-delayed-2 { animation: content-fade-in 0.5s ease-out forwards 0.6s; opacity: 0; }
        .animate-number-pop { animation: number-pop 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.5s; opacity: 0; }
        .animate-float-particle { animation: float-particle linear infinite; }
        .animate-sparkle-float { animation: sparkle-float 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default ReferralSuccessNotification;
