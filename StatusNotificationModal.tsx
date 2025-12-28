import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Ban, X, Sparkles, Copy, Volume2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAdminSettings } from '@/hooks/useAdminSettings';

interface PendingStatus {
  type: 'withdrawal' | 'bpc';
  status: 'approved' | 'rejected' | 'cancelled';
  id: string;
  amount?: number;
  bpcCode?: string;
  message?: string;
}

// Sound effect generator using Web Audio API
const createNotificationSound = (type: 'approved' | 'rejected' | 'cancelled') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'approved') {
      // Success sound - ascending chime
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime + 0.3); // C6
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } else if (type === 'rejected') {
      // Error sound - descending tone
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
      oscillator.frequency.setValueAtTime(349.23, audioContext.currentTime + 0.15); // F4
      oscillator.frequency.setValueAtTime(293.66, audioContext.currentTime + 0.3); // D4
      oscillator.type = 'square';
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } else {
      // Cancel sound - warning beeps
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.2);
      oscillator.type = 'triangle';
      gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.35);
    }
  } catch (error) {
    console.log('Audio not supported:', error);
  }
};

const StatusNotificationModal = () => {
  const navigate = useNavigate();
  const { activationLink } = useAdminSettings();
  const [pendingStatuses, setPendingStatuses] = useState<PendingStatus[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const soundPlayedRef = useRef<Set<string>>(new Set());

  // Play sound when notification appears
  const playSound = useCallback((status: 'approved' | 'rejected' | 'cancelled', id: string) => {
    const soundKey = `${id}_${status}`;
    if (!soundPlayedRef.current.has(soundKey)) {
      soundPlayedRef.current.add(soundKey);
      createNotificationSound(status);
    }
  }, []);

  const checkPendingStatuses = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const statuses: PendingStatus[] = [];

      // Check withdrawal requests
      const { data: withdrawals } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', session.user.id)
        .in('status', ['approved', 'rejected', 'cancelled'])
        .order('updated_at', { ascending: false });

      if (withdrawals) {
        const dismissed = JSON.parse(localStorage.getItem('dismissed_status_notifications') || '[]');
        
        withdrawals.forEach(w => {
          const notificationKey = `withdrawal_${w.id}_${w.status}`;
          if (!dismissed.includes(notificationKey)) {
            statuses.push({
              type: 'withdrawal',
              status: w.status as 'approved' | 'rejected' | 'cancelled',
              id: w.id,
              amount: w.withdrawal_amount,
              message: w.notes,
            });
          }
        });
      }

      // Check BPC purchases
      const { data: bpcPurchases } = await supabase
        .from('bpc_purchases')
        .select('*')
        .eq('user_id', session.user.id)
        .in('status', ['approved', 'rejected', 'cancelled'])
        .order('updated_at', { ascending: false });

      if (bpcPurchases) {
        const dismissed = JSON.parse(localStorage.getItem('dismissed_status_notifications') || '[]');
        
        bpcPurchases.forEach(p => {
          const notificationKey = `bpc_${p.id}_${p.status}`;
          if (!dismissed.includes(notificationKey)) {
            statuses.push({
              type: 'bpc',
              status: p.status as 'approved' | 'rejected' | 'cancelled',
              id: p.id,
              bpcCode: p.bpc_code,
            });
          }
        });
      }

      if (statuses.length > 0) {
        setPendingStatuses(statuses);
        setIsVisible(true);
        // Play sound for first status
        playSound(statuses[0].status, statuses[0].id);
        if (statuses[0].status === 'approved') {
          setTimeout(() => setShowParticles(true), 300);
        }
      }
    } catch (error) {
      console.error('Error checking pending statuses:', error);
    }
  };

  useEffect(() => {
    let currentUserId: string | null = null;

    const setupRealtimeSubscriptions = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      currentUserId = session.user.id;
      
      await checkPendingStatuses();
    };

    setupRealtimeSubscriptions();

    // Subscribe to realtime updates for withdrawal_requests
    const withdrawalChannel = supabase
      .channel('withdrawal-status-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'withdrawal_requests',
        },
        async (payload) => {
          const newStatus = payload.new as any;
          
          // Get current user session to filter
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user || newStatus.user_id !== session.user.id) return;
          
          // Check if this notification was already dismissed
          const dismissed = JSON.parse(localStorage.getItem('dismissed_status_notifications') || '[]');
          const notificationKey = `withdrawal_${newStatus.id}_${newStatus.status}`;
          if (dismissed.includes(notificationKey)) return;
          
          if (['approved', 'rejected', 'cancelled'].includes(newStatus.status)) {
            const newPendingStatus: PendingStatus = {
              type: 'withdrawal',
              status: newStatus.status,
              id: newStatus.id,
              amount: newStatus.withdrawal_amount,
              message: newStatus.notes,
            };
            setPendingStatuses(prev => {
              // Check if already exists with same id and status
              const exists = prev.some(p => p.id === newStatus.id && p.status === newStatus.status);
              if (exists) return prev;
              // Remove any previous status for this id
              const filtered = prev.filter(p => p.id !== newStatus.id);
              return [...filtered, newPendingStatus];
            });
            setIsVisible(true);
            // Play sound for new status
            playSound(newStatus.status, newStatus.id);
            if (newStatus.status === 'approved') {
              setTimeout(() => setShowParticles(true), 300);
            }
          }
        }
      )
      .subscribe();

    // Subscribe to realtime updates for bpc_purchases
    const bpcChannel = supabase
      .channel('bpc-status-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bpc_purchases',
        },
        async (payload) => {
          const newStatus = payload.new as any;
          
          // Get current user session to filter
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user || newStatus.user_id !== session.user.id) return;
          
          // Check if this notification was already dismissed
          const dismissed = JSON.parse(localStorage.getItem('dismissed_status_notifications') || '[]');
          const notificationKey = `bpc_${newStatus.id}_${newStatus.status}`;
          if (dismissed.includes(notificationKey)) return;
          
          if (['approved', 'rejected', 'cancelled'].includes(newStatus.status)) {
            const newPendingStatus: PendingStatus = {
              type: 'bpc',
              status: newStatus.status,
              id: newStatus.id,
              bpcCode: newStatus.bpc_code,
            };
            setPendingStatuses(prev => {
              // Check if already exists with same id and status
              const exists = prev.some(p => p.id === newStatus.id && p.status === newStatus.status);
              if (exists) return prev;
              // Remove any previous status for this id
              const filtered = prev.filter(p => p.id !== newStatus.id);
              return [...filtered, newPendingStatus];
            });
            setIsVisible(true);
            // Play sound for new status
            playSound(newStatus.status, newStatus.id);
            if (newStatus.status === 'approved') {
              setTimeout(() => setShowParticles(true), 300);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(withdrawalChannel);
      supabase.removeChannel(bpcChannel);
    };
  }, []);

  const handleDismiss = () => {
    if (pendingStatuses.length === 0) return;

    const current = pendingStatuses[currentIndex];
    const notificationKey = `${current.type}_${current.id}_${current.status}`;
    
    const dismissed = JSON.parse(localStorage.getItem('dismissed_status_notifications') || '[]');
    dismissed.push(notificationKey);
    localStorage.setItem('dismissed_status_notifications', JSON.stringify(dismissed));

    if (currentIndex < pendingStatuses.length - 1) {
      setCurrentIndex(prev => prev + 1);
      const nextStatus = pendingStatuses[currentIndex + 1];
      setShowParticles(nextStatus.status === 'approved');
    } else {
      setIsVisible(false);
      setPendingStatuses([]);
      setCurrentIndex(0);
      setShowParticles(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ description: "BPC code copied to clipboard!" });
  };

  const getStatusConfig = (status: PendingStatus) => {
    switch (status.status) {
      case 'approved':
        return {
          icon: CheckCircle,
          iconColor: 'text-green-400',
          bgGradient: 'from-green-500 to-emerald-600',
          glowColor: 'shadow-green-500/50',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          particleColors: ['#22c55e', '#10b981', '#34d399', '#6ee7b7'],
          title: status.type === 'withdrawal' ? 'Withdrawal Approved!' : 'BPC Purchase Approved!',
          subtitle: 'Congratulations!',
          description: status.type === 'withdrawal' 
            ? `Your withdrawal of ₦${status.amount?.toLocaleString()} has been approved and is being processed.`
            : 'Your BPC purchase has been approved!',
        };
      case 'rejected':
        return {
          icon: XCircle,
          iconColor: 'text-red-400',
          bgGradient: 'from-red-500 to-rose-600',
          glowColor: 'shadow-red-500/50',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          particleColors: ['#ef4444', '#f87171'],
          title: status.type === 'withdrawal' ? 'Withdrawal Rejected' : 'BPC Purchase Rejected',
          subtitle: 'Request Declined',
          description: status.message || (status.type === 'withdrawal' 
            ? 'Your withdrawal request was rejected. Please contact support for assistance.'
            : 'Your BPC purchase was rejected. Please try again or contact support.'),
        };
      case 'cancelled':
        return {
          icon: Ban,
          iconColor: 'text-orange-400',
          bgGradient: 'from-orange-500 to-amber-600',
          glowColor: 'shadow-orange-500/50',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/30',
          particleColors: ['#f97316', '#fb923c'],
          title: status.type === 'withdrawal' ? 'Withdrawal Cancelled' : 'BPC Cancelled',
          subtitle: 'Request Cancelled',
          description: status.message || (status.type === 'withdrawal' 
            ? 'Your withdrawal request has been cancelled.'
            : 'Your BPC purchase has been cancelled. You can now purchase a new code.'),
        };
      default:
        return {
          icon: CheckCircle,
          iconColor: 'text-muted-foreground',
          bgGradient: 'from-muted to-muted',
          glowColor: '',
          bgColor: 'bg-muted/10',
          borderColor: 'border-border',
          particleColors: ['#888'],
          title: 'Status Update',
          subtitle: '',
          description: 'Your request status has been updated.',
        };
    }
  };

  if (!isVisible || pendingStatuses.length === 0) return null;

  const current = pendingStatuses[currentIndex];
  const config = getStatusConfig(current);
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center min-h-screen w-full animate-modal-fade-in overflow-hidden">
      {/* Full screen backdrop */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Animated gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-10`} />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large pulsing orbs */}
        <div className={`absolute top-0 left-0 w-[600px] h-[600px] ${config.bgColor} rounded-full blur-[150px] animate-pulse-slow -translate-x-1/2 -translate-y-1/2`} />
        <div className={`absolute bottom-0 right-0 w-[500px] h-[500px] ${config.bgColor} rounded-full blur-[120px] animate-pulse-slower translate-x-1/2 translate-y-1/2`} />
        <div className={`absolute top-1/2 left-1/2 w-[400px] h-[400px] ${config.bgColor} rounded-full blur-[100px] animate-pulse-slow -translate-x-1/2 -translate-y-1/2`} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
        
        {/* Floating particles for all statuses */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float-particle"
            style={{
              width: `${3 + Math.random() * 6}px`,
              height: `${3 + Math.random() * 6}px`,
              left: `${Math.random() * 100}%`,
              top: `${100 + Math.random() * 20}%`,
              backgroundColor: config.particleColors[i % config.particleColors.length],
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 6}s`,
              opacity: 0.6,
            }}
          />
        ))}
        
        {/* Extra sparkle particles for approved */}
        {showParticles && current.status === 'approved' && [...Array(30)].map((_, i) => (
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

      {/* Sound indicator */}
      <div className="absolute top-6 right-6 z-10">
        <div className={`p-3 rounded-full ${config.bgColor} ${config.borderColor} border animate-pulse`}>
          <Volume2 className={`w-5 h-5 ${config.iconColor}`} />
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute top-6 left-6 w-12 h-12 rounded-full bg-muted/30 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all z-10 border border-border/30"
      >
        <X size={24} />
      </button>

      {/* Main content - centered */}
      <div className="relative w-full max-w-lg mx-4 px-6 animate-modal-slide-up z-10">
        {/* Card */}
        <div className={`p-10 rounded-3xl border-2 ${config.borderColor} ${config.bgColor} backdrop-blur-xl overflow-hidden shadow-2xl ${config.glowColor}`}>
          {/* Icon with animation */}
          <div className="relative flex justify-center mb-6">
            {/* Pulsing rings for approved */}
            {current.status === 'approved' && (
              <>
                <div className={`absolute w-32 h-32 rounded-full bg-gradient-to-r ${config.bgGradient} opacity-20 animate-ping-slow`} />
                <div className={`absolute w-28 h-28 rounded-full bg-gradient-to-r ${config.bgGradient} opacity-30 animate-ping-slower`} />
              </>
            )}
            
            {/* Shake animation for rejected/cancelled */}
            {(current.status === 'rejected' || current.status === 'cancelled') && (
              <div className={`absolute w-28 h-28 rounded-full ${config.bgColor} animate-shake-subtle`} />
            )}
            
            {/* Main icon container */}
            <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${config.bgGradient} flex items-center justify-center shadow-xl ${config.glowColor} animate-icon-pop`}>
              <Icon className="w-12 h-12 text-white animate-icon-check" strokeWidth={2.5} />
            </div>
            
            {/* Sparkles for approved */}
            {current.status === 'approved' && (
              <>
                <Sparkles className="absolute -top-2 right-1/4 w-6 h-6 text-yellow-400 animate-sparkle" />
                <Sparkles className="absolute top-1/4 -right-2 w-5 h-5 text-yellow-400 animate-sparkle-delayed" />
                <Sparkles className="absolute -bottom-1 left-1/4 w-4 h-4 text-yellow-400 animate-sparkle-delayed-2" />
              </>
            )}
          </div>

          {/* Text content */}
          <div className="text-center mb-6 animate-content-fade-in">
            <p className={`text-sm font-medium ${config.iconColor} mb-1`}>{config.subtitle}</p>
            <h2 className="text-2xl font-bold text-foreground mb-3">{config.title}</h2>
            <p className="text-muted-foreground">{config.description}</p>
          </div>

          {/* Amount display for withdrawals */}
          {current.type === 'withdrawal' && current.status === 'approved' && current.amount && (
            <div className={`${config.bgColor} border ${config.borderColor} rounded-2xl p-5 mb-6 animate-content-fade-in-delayed`}>
              <p className="text-muted-foreground text-sm text-center mb-2">Amount Approved</p>
              <p className="text-3xl font-bold text-center text-green-400 animate-number-pop">
                ₦{current.amount.toLocaleString()}
              </p>
            </div>
          )}

          {/* BPC Code display */}
          {current.type === 'bpc' && current.status === 'approved' && current.bpcCode && (
            <>
              <div className={`${config.bgColor} border ${config.borderColor} rounded-2xl p-5 mb-4 animate-content-fade-in-delayed`}>
                <p className="text-muted-foreground text-sm text-center mb-2">Your BPC Code</p>
                <div className="flex items-center justify-center gap-3">
                  <p className="text-2xl font-mono font-bold text-green-400 tracking-widest animate-number-pop">
                    {current.bpcCode}
                  </p>
                  <button
                    onClick={() => handleCopyCode(current.bpcCode!)}
                    className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-colors"
                  >
                    <Copy className="w-5 h-5 text-green-400" />
                  </button>
                </div>
              </div>
              
              {/* Activation Warning */}
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 mb-6 animate-content-fade-in-delayed">
                <p className="text-orange-400 text-sm font-medium text-center mb-3">
                  ⚠️ Kindly activate your BPC code before use so you can be credited after withdrawal.
                </p>
                <Button
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                  onClick={() => window.open(activationLink || "https://bluepayactivation2026.vercel.app/", "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Activate BPC Code
                </Button>
              </div>
            </>
          )}

          {/* Progress indicator */}
          {pendingStatuses.length > 1 && (
            <div className="flex justify-center gap-2 mb-6">
              {pendingStatuses.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentIndex ? 'bg-primary w-6' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3 animate-content-fade-in-delayed-2">
            <Button
              className={`w-full py-6 text-lg font-semibold rounded-xl bg-gradient-to-r ${config.bgGradient} text-white shadow-lg ${config.glowColor} hover:opacity-90 transition-all hover:scale-[1.02]`}
              onClick={handleDismiss}
            >
              {currentIndex < pendingStatuses.length - 1 ? 'Next Notification' : 'Continue'}
            </Button>
            
            {(current.status === 'rejected' || current.status === 'cancelled') && (
              <Button
                variant="outline"
                className="w-full py-5 rounded-xl border-2"
                onClick={() => {
                  handleDismiss();
                  navigate('/support');
                }}
              >
                Contact Support
              </Button>
            )}
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
        @keyframes shake-subtle {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
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
        .animate-shake-subtle { animation: shake-subtle 0.5s ease-in-out; }
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

export default StatusNotificationModal;