import React, { useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, Users, Copy, Share2, CheckCircle, ArrowUpCircle, Loader2, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const EarnMore = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState<number>(0);
  const [referralRate, setReferralRate] = useState<number>(7000);
  const [accountUpgraded, setAccountUpgraded] = useState(false);
  const [taxJoinCompletedAt, setTaxJoinCompletedAt] = useState<string | null>(null);

  useEffect(() => {
    fetchUserReferralData();
  }, []);

  const fetchUserReferralData = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast({
          title: "Error",
          description: "Please log in to view your referral data",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('referral_code, referral_count, referral_earnings, referral_rate, account_upgraded, tax_join_completed_at')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setReferralCode(data.referral_code || '');
        setReferralCount(data.referral_count || 0);
        setReferralEarnings(Number(data.referral_earnings) || 0);
        setReferralRate(Number(data.referral_rate) || 7000);
        setAccountUpgraded(data.account_upgraded || false);
        setTaxJoinCompletedAt(data.tax_join_completed_at);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load referral data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const generateReferralLink = () => {
    return `${window.location.origin}/register?ref=${referralCode}`;
  };

  const generateReferralMessage = () => {
    return `🎉 Join BluePay and earn money! 💰\n\nUse my referral code: ${referralCode}\n\nRegister here: ${generateReferralLink()}\n\n#BluePay #EarnMoney #Referral`;
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(generateReferralLink());
    toast({
      title: "Link Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const copyReferralMessage = () => {
    navigator.clipboard.writeText(generateReferralMessage());
    toast({
      title: "Message Copied!",
      description: "Full referral message copied to clipboard",
    });
  };

  const shareReferralLink = () => {
    const referralLink = generateReferralLink();
    const referralMessage = generateReferralMessage();
    
    if (navigator.share) {
      navigator.share({
        title: 'Join BluePay and Earn!',
        text: referralMessage,
        url: referralLink,
      });
    } else {
      copyReferralMessage();
    }
  };


  const handleTaxJoinGroup = async () => {
    const telegramLink = "https://t.me/OfficialChixx9ja";
    
    window.open(telegramLink, '_blank');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newRate = referralRate + 10000;
      
      const { error } = await supabase
        .from('profiles')
        .update({
          referral_rate: newRate,
          tax_join_completed_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        description: "🎉 Bonus activated! Your referral rate increased by ₦10,000 for 24 hours!",
      });

      fetchUserReferralData();
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to activate bonus. Please try again.",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };


  if (loading) {
    return (
      <div className="min-h-screen cosmic-bg flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float-delayed" />
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

      <header className="glass-header py-4 px-5 sticky top-0 z-10">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-3 hover:bg-primary/20"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold text-glow">Earn More</h1>
        </div>
      </header>

      <div className="p-5 space-y-6 relative z-10">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="glass-card p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{referralCount}</p>
            <p className="text-xs text-muted-foreground">Referrals</p>
          </Card>
          <Card className="glass-card p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-400" />
            <p className="text-2xl font-bold">₦{formatCurrency(referralEarnings)}</p>
            <p className="text-xs text-muted-foreground">Earnings</p>
          </Card>
          <Card className="glass-card p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">₦{formatCurrency(referralRate)}</p>
            <p className="text-xs text-muted-foreground">Per Referral</p>
          </Card>
        </div>

        {/* Leaderboard Link */}
        <Card 
          className="glass-card p-4 cursor-pointer hover:scale-[1.02] transition-transform border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-amber-500/10"
          onClick={() => navigate('/leaderboard')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Referral Leaderboard</h3>
                <p className="text-xs text-muted-foreground">See top referrers & your rank</p>
              </div>
            </div>
            <ArrowUpCircle className="w-5 h-5 text-yellow-400" />
          </div>
        </Card>

        {/* Info about earnings going to main balance */}
        <div className="glass-card p-4 rounded-xl border border-primary/30">
          <p className="text-sm text-center text-muted-foreground">
            💡 <span className="text-primary font-medium">Referral earnings</span> are automatically added to your main BluePay balance!
          </p>
        </div>

        {/* Referral Details */}
        <Card className="glass-card p-5">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 bg-green-500/20 rounded-full flex items-center justify-center mr-4">
              <Users className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Referral Program</h3>
              <p className="text-sm text-muted-foreground">Share and earn ₦{formatCurrency(referralRate)}/referral</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="glass-card p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Your Referral Code</h4>
              <div className="flex items-center gap-2 p-3 glass-card rounded border border-border/30">
                <span className="font-mono text-lg font-bold flex-1 text-primary">{referralCode}</span>
                <Button size="sm" variant="outline" onClick={copyReferralCode} className="glass-button">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="glass-card p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Your Referral Link</h4>
              <div className="flex items-center gap-2 p-3 glass-card rounded border border-border/30">
                <span className="text-sm flex-1 break-all text-muted-foreground">{generateReferralLink()}</span>
                <Button size="sm" variant="outline" onClick={copyReferralLink} className="glass-button">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 glass-button"
                onClick={shareReferralLink}
              >
                <Share2 className="h-4 w-4" />
                Share Link
              </Button>
              <Button 
                variant="outline"
                onClick={copyReferralMessage}
                className="glass-button"
              >
                <Copy className="h-4 w-4" />
                Copy Message
              </Button>
            </div>
            
            <div className="glass-card p-4 rounded-lg border border-primary/30">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h5 className="font-semibold text-sm">How it works:</h5>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    <li>• Share your referral code or link with friends</li>
                    <li>• When they register, you earn ₦{formatCurrency(referralRate)}</li>
                    <li>• Earnings are added to your main balance automatically</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tax/Join Group Bonus */}
        {!taxJoinCompletedAt && (
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="glass-card border border-primary/30 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">
                  🎁 Boost Your Earnings!
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  Join our community groups and get +₦10,000 bonus for 24 hours
                </p>
                <Button 
                  onClick={handleTaxJoinGroup}
                  className="w-full bg-gradient-to-r from-primary to-primary/80"
                  variant="default"
                >
                  Perform Tax / Join Group
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {taxJoinCompletedAt && (
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="glass-card border border-green-500/30 rounded-lg p-4">
                <p className="text-sm text-green-400 font-medium">
                  ✨ Bonus Active! +₦10,000 for 24hrs
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upgrade Referral Rate Section */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpCircle className="w-5 h-5" />
              Upgrade Referral Rate
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Increase your earnings per referral by upgrading your rate
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { rate: 7000, label: "Default", current: referralRate === 7000 },
              { rate: 15000, label: "Premium", current: referralRate === 15000 },
              { rate: 25000, label: "Elite", current: referralRate === 25000 },
            ].map((tier) => (
              <div
                key={tier.rate}
                className={`p-4 glass-card rounded-lg ${
                  tier.current ? 'border border-primary glow-blue' : 'border border-border/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{tier.label} - ₦{formatCurrency(tier.rate)}/referral</p>
                    <p className="text-sm text-muted-foreground">
                      {tier.current ? 'Current Rate' : `Upgrade for ₦${formatCurrency(tier.rate)}`}
                    </p>
                  </div>
                  {tier.current && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EarnMore;
