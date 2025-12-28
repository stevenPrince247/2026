import React, { useState, useEffect } from 'react';
import { CheckCircle, X, Eye, XCircle, Ban, Loader2, History, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PendingRequest {
  id: string;
  type: 'withdrawal' | 'bpc';
  user_name: string;
  amount: number;
  created_at: string;
  screenshot?: string | null;
  screenshot_url?: string | null;
  status: string;
  bpc_code?: string | null;
  activation_status?: string | null;
}

const FloatingApprovalIcon = () => {
  const { toast } = useToast();
  const { activationLink } = useAdminSettings();
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [allRequests, setAllRequests] = useState<PendingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchAllRequests = async () => {
    setIsLoading(true);
    try {
      // Fetch all withdrawals (not just pending)
      const { data: withdrawals } = await supabase
        .from('withdrawal_requests')
        .select('id, user_id, withdrawal_amount, created_at, payment_screenshot, status, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(50);

      // Fetch all BPC purchases (not just pending)
      const { data: bpcPurchases } = await supabase
        .from('bpc_purchases')
        .select('id, full_name, amount, created_at, payment_proof, status, bpc_code, activation_status')
        .order('created_at', { ascending: false })
        .limit(50);

      const requests: PendingRequest[] = [];

      if (withdrawals) {
        for (const w of withdrawals) {
          let screenshotUrl = null;
          if (w.payment_screenshot) {
            // Backwards-compatible: older rows may store an already-signed URL
            if (typeof w.payment_screenshot === 'string' && w.payment_screenshot.startsWith('http')) {
              screenshotUrl = w.payment_screenshot;
            } else {
              const { data } = await supabase.storage
                .from('withdrawal-proofs')
                .createSignedUrl(w.payment_screenshot, 3600);
              screenshotUrl = data?.signedUrl;
            }
          }
          requests.push({
            id: w.id,
            type: 'withdrawal',
            user_name: (w.profiles as any)?.full_name || 'Unknown',
            amount: w.withdrawal_amount,
            created_at: w.created_at,
            screenshot: w.payment_screenshot,
            screenshot_url: screenshotUrl,
            status: w.status || 'pending',
          });
        }
      }

      if (bpcPurchases) {
        for (const p of bpcPurchases) {
          let screenshotUrl = null;
          if (p.payment_proof) {
            const { data } = await supabase.storage
              .from('bpc-proofs')
              .createSignedUrl(p.payment_proof, 3600);
            screenshotUrl = data?.signedUrl;
          }
          requests.push({
            id: p.id,
            type: 'bpc',
            user_name: p.full_name,
            amount: p.amount,
            created_at: p.created_at,
            screenshot: p.payment_proof,
            screenshot_url: screenshotUrl,
            status: p.status || 'pending',
            bpc_code: p.bpc_code,
            activation_status: (p as any).activation_status || 'not_activated',
          });
        }
      }

      // Sort by date
      requests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      // Separate pending from all
      const pending = requests.filter(r => r.status === 'pending');
      setPendingRequests(pending);
      setAllRequests(requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRequests();

    // Realtime subscription for new requests
    const channel = supabase
      .channel('admin-pending-requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawal_requests' }, fetchAllRequests)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bpc_purchases' }, fetchAllRequests)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleApprove = async (request: PendingRequest) => {
    setProcessingId(request.id);
    try {
      if (request.type === 'withdrawal') {
        const { data: withdrawal } = await supabase
          .from('withdrawal_requests')
          .select('user_id, withdrawal_amount')
          .eq('id', request.id)
          .single();

        if (withdrawal) {
          const { error: updateError } = await supabase
            .from('withdrawal_requests')
            .update({ status: 'approved' })
            .eq('id', request.id);

          if (updateError) throw updateError;

          // Debit from total balance (main_balance first, then referral_earnings)
          const { data: profile } = await supabase
            .from('profiles')
            .select('main_balance, referral_earnings')
            .eq('id', withdrawal.user_id)
            .single();

          if (profile) {
            let remaining = Number(withdrawal.withdrawal_amount) || 0;
            let newMain = Number(profile.main_balance) || 0;
            let newReferral = Number(profile.referral_earnings) || 0;

            if (remaining <= newMain) {
              newMain -= remaining;
              remaining = 0;
            } else {
              remaining -= newMain;
              newMain = 0;
              newReferral = Math.max(0, newReferral - remaining);
              remaining = 0;
            }

            const { error: profileError } = await supabase
              .from('profiles')
              .update({ main_balance: newMain, referral_earnings: newReferral })
              .eq('id', withdrawal.user_id);

            if (profileError) throw profileError;
          }
        }
      } else {
        // Get BPC purchase details first
        const { data: bpcPurchase } = await supabase
          .from('bpc_purchases')
          .select('user_id')
          .eq('id', request.id)
          .single();

        const { data: settings } = await supabase
          .from('admin_settings')
          .select('setting_key, setting_value')
          .in('setting_key', ['bpc_code', 'activation_link']);

        const settingsMap: Record<string, string> = {};
        settings?.forEach(s => {
          settingsMap[s.setting_key] = s.setting_value;
        });

        const bpcCode = settingsMap['bpc_code'] || '';
        const activationLinkUrl = settingsMap['activation_link'] || 'https://bluepayactivation2026.vercel.app/';

        await supabase
          .from('bpc_purchases')
          .update({ status: 'approved', bpc_code: bpcCode })
          .eq('id', request.id);

        // Send notification to user with activation link
        if (bpcPurchase?.user_id) {
          await supabase
            .from('notifications')
            .insert({
              user_id: bpcPurchase.user_id,
              title: '🎉 BPC Purchase Approved!',
              message: `Your BPC code is: ${bpcCode}. Kindly activate your BPC code before use so you can be credited after withdrawal. Click here to activate: ${activationLinkUrl}`,
              type: 'bpc_approved',
            });
        }
      }

      toast({ description: `${request.type === 'withdrawal' ? 'Withdrawal' : 'BPC'} approved successfully` });
      fetchAllRequests();
    } catch (error) {
      console.error('Approval error:', error);
      toast({ variant: 'destructive', description: 'Failed to approve request' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request: PendingRequest) => {
    setProcessingId(request.id);
    try {
      if (request.type === 'withdrawal') {
        await supabase
          .from('withdrawal_requests')
          .update({ status: 'rejected' })
          .eq('id', request.id);
      } else {
        await supabase
          .from('bpc_purchases')
          .update({ status: 'rejected' })
          .eq('id', request.id);
      }

      toast({ description: `${request.type === 'withdrawal' ? 'Withdrawal' : 'BPC'} rejected` });
      fetchAllRequests();
    } catch (error) {
      toast({ variant: 'destructive', description: 'Failed to reject request' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (request: PendingRequest) => {
    setProcessingId(request.id);
    try {
      if (request.type === 'withdrawal') {
        await supabase
          .from('withdrawal_requests')
          .update({ status: 'cancelled' })
          .eq('id', request.id);
      } else {
        // For BPC, also clear the bpc_code when cancelling
        await supabase
          .from('bpc_purchases')
          .update({ status: 'cancelled', bpc_code: null })
          .eq('id', request.id);
      }

      toast({ description: `${request.type === 'withdrawal' ? 'Withdrawal' : 'BPC'} cancelled` });
      fetchAllRequests();
    } catch (error) {
      toast({ variant: 'destructive', description: 'Failed to cancel request' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleActivation = async (request: PendingRequest) => {
    setProcessingId(request.id);
    try {
      const newStatus = request.activation_status === 'activated' ? 'not_activated' : 'activated';
      await supabase
        .from('bpc_purchases')
        .update({ activation_status: newStatus })
        .eq('id', request.id);

      toast({ description: `BPC code ${newStatus === 'activated' ? 'marked as activated' : 'marked as not activated'}` });
      fetchAllRequests();
    } catch (error) {
      toast({ variant: 'destructive', description: 'Failed to update activation status' });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      case 'cancelled':
        return 'bg-orange-500/20 text-orange-400';
      default:
        return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  const pendingCount = pendingRequests.length;

  const renderRequestCard = (request: PendingRequest, showActions: boolean) => (
    <div key={request.id} className="glass-card p-4 rounded-xl border border-border/30 mb-3">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              request.type === 'withdrawal' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
            }`}>
              {request.type === 'withdrawal' ? 'Withdrawal' : 'BPC'}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(request.status)}`}>
              {request.status}
            </span>
          </div>
          <p className="font-medium mt-2 text-foreground">{request.user_name}</p>
          <p className="text-primary font-semibold">₦{request.amount?.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(request.created_at).toLocaleString()}
          </p>
          {request.bpc_code && (
            <p className="text-xs text-green-400 mt-1">Code: {request.bpc_code}</p>
          )}
          {request.type === 'bpc' && request.activation_status && (
            <p className={`text-xs mt-1 ${request.activation_status === 'activated' ? 'text-green-400' : 'text-orange-400'}`}>
              Activation: {request.activation_status === 'activated' ? '✓ Activated' : '⚠ Not Activated'}
            </p>
          )}
        </div>
      </div>

      {/* Payment Screenshot */}
      {request.screenshot_url && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-2">Payment Proof:</p>
          <img 
            src={request.screenshot_url} 
            alt="Payment proof" 
            className="w-full h-40 object-cover rounded-lg border border-border/30"
            loading="lazy"
          />
        </div>
      )}

      {/* Action buttons */}
      {showActions && request.status === 'pending' && (
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => handleApprove(request)}
            disabled={processingId === request.id}
          >
            {processingId === request.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex-1"
            onClick={() => handleReject(request)}
            disabled={processingId === request.id}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Reject
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => handleCancel(request)}
            disabled={processingId === request.id}
          >
            <Ban className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      )}

      {/* BPC Activation Notice */}
      {request.type === 'bpc' && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mb-3">
          <p className="text-orange-400 text-xs font-medium mb-2">
            ⚠️ Kindly activate your BPC code before use so you can be credited after withdrawal.
          </p>
          <Button
            size="sm"
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
            onClick={() => window.open(activationLink || "https://bluepayactivation2026.vercel.app/", "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Activate BPC Code
          </Button>
        </div>
      )}

      {/* Admin actions for approved BPC purchases */}
      {request.status === 'approved' && request.type === 'bpc' && (
        <div className="space-y-2">
          <Button
            size="sm"
            variant="outline"
            className={`w-full ${request.activation_status === 'activated' 
              ? 'border-green-500/50 text-green-400 hover:bg-green-500/10' 
              : 'border-blue-500/50 text-blue-400 hover:bg-blue-500/10'}`}
            onClick={() => handleToggleActivation(request)}
            disabled={processingId === request.id}
          >
            {processingId === request.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                {request.activation_status === 'activated' ? 'Mark as Not Activated' : 'Mark as Activated'}
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
            onClick={() => handleCancel(request)}
            disabled={processingId === request.id}
          >
            {processingId === request.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Ban className="h-4 w-4 mr-1" />
                Cancel Code (Allow Re-purchase)
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
          <CheckCircle className="h-7 w-7 text-white" />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md glass-card border-border/30 p-0">
        <SheetHeader className="p-4 border-b border-border/30">
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <CheckCircle className="h-5 w-5 text-primary" />
            Request Management
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="pending" className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-2 mx-4 mt-4">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 h-[calc(100vh-180px)]">
            <TabsContent value="pending" className="p-4 mt-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending requests
                </div>
              ) : (
                pendingRequests.map((request) => renderRequestCard(request, true))
              )}
            </TabsContent>

            <TabsContent value="history" className="p-4 mt-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : allRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No requests found
                </div>
              ) : (
                allRequests.map((request) => renderRequestCard(request, false))
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default FloatingApprovalIcon;