import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Crown, Medal, Star, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import BottomNavigation from '@/components/dashboard/BottomNavigation';

interface LeaderboardEntry {
  id: string;
  full_name: string;
  profile_image: string | null;
  referral_count: number;
  referral_rate: number;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [currentUserData, setCurrentUserData] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Fetch top referrers using the secure function
        const { data, error } = await supabase.rpc('get_top_referrers', { limit_count: 50 });
        
        if (error) throw error;
        
        setLeaders(data || []);

        // Get current user's position
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, profile_image, referral_count, referral_rate')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile) {
            setCurrentUserData(profile);
            // Find user's rank
            const rank = data?.findIndex((l: LeaderboardEntry) => l.id === profile.id);
            if (rank !== undefined && rank !== -1) {
              setCurrentUserRank(rank + 1);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">{rank}</span>;
    }
  };

  const getRankBadgeClass = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-300/20 border-gray-400/50';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-orange-500/20 border-amber-600/50';
      default:
        return 'bg-muted/30 border-border/50';
    }
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';
  };

  const formatEarnings = (count: number, rate: number) => {
    return (count * rate).toLocaleString();
  };

  return (
    <div className="min-h-screen flex flex-col cosmic-bg pb-24">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float-delayed" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Leaderboard
              </h1>
              <p className="text-xs text-muted-foreground">Top Referrers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="px-4 py-4 relative z-10">
        <div className="glass-card p-4 rounded-2xl border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-amber-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Referrers</p>
                <p className="text-2xl font-bold text-foreground">{leaders.length}</p>
              </div>
            </div>
            {currentUserRank && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Your Rank</p>
                <p className="text-2xl font-bold text-yellow-400">#{currentUserRank}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      {leaders.length >= 3 && (
        <div className="px-4 mb-4 relative z-10">
          <div className="flex items-end justify-center gap-2">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {leaders[1]?.profile_image ? (
                  <img 
                    src={leaders[1].profile_image} 
                    alt={leaders[1].full_name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-gray-400"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center border-4 border-gray-400">
                    <span className="text-white font-bold">{getInitials(leaders[1]?.full_name || '')}</span>
                  </div>
                )}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold">
                  2
                </div>
              </div>
              <p className="mt-3 text-xs font-semibold text-foreground text-center truncate max-w-[80px]">{leaders[1]?.full_name}</p>
              <p className="text-xs text-muted-foreground">{leaders[1]?.referral_count} refs</p>
              <div className="h-16 w-20 bg-gradient-to-t from-gray-400/30 to-gray-400/10 rounded-t-lg mt-2" />
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center -mt-4">
              <Crown className="w-8 h-8 text-yellow-400 mb-1 animate-bounce" />
              <div className="relative">
                {leaders[0]?.profile_image ? (
                  <img 
                    src={leaders[0].profile_image} 
                    alt={leaders[0].full_name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-yellow-400 shadow-lg shadow-yellow-500/30"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center border-4 border-yellow-400 shadow-lg shadow-yellow-500/30">
                    <span className="text-white font-bold text-lg">{getInitials(leaders[0]?.full_name || '')}</span>
                  </div>
                )}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center text-white text-sm font-bold">
                  1
                </div>
              </div>
              <p className="mt-3 text-sm font-bold text-foreground text-center truncate max-w-[100px]">{leaders[0]?.full_name}</p>
              <p className="text-xs text-yellow-400 font-semibold">{leaders[0]?.referral_count} refs</p>
              <div className="h-24 w-24 bg-gradient-to-t from-yellow-500/30 to-yellow-400/10 rounded-t-lg mt-2" />
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {leaders[2]?.profile_image ? (
                  <img 
                    src={leaders[2].profile_image} 
                    alt={leaders[2].full_name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-amber-600"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-orange-500 flex items-center justify-center border-4 border-amber-600">
                    <span className="text-white font-bold">{getInitials(leaders[2]?.full_name || '')}</span>
                  </div>
                )}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center text-white text-xs font-bold">
                  3
                </div>
              </div>
              <p className="mt-3 text-xs font-semibold text-foreground text-center truncate max-w-[80px]">{leaders[2]?.full_name}</p>
              <p className="text-xs text-muted-foreground">{leaders[2]?.referral_count} refs</p>
              <div className="h-12 w-20 bg-gradient-to-t from-amber-600/30 to-amber-600/10 rounded-t-lg mt-2" />
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="px-4 flex-1 relative z-10">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          All Rankings
        </h3>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="glass-card p-4 rounded-xl animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-24 mb-2" />
                    <div className="h-3 bg-muted rounded w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : leaders.length === 0 ? (
          <div className="glass-card p-8 rounded-xl text-center">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No referrers yet</p>
            <p className="text-sm text-muted-foreground mt-1">Be the first to refer someone!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaders.map((leader, index) => (
              <div
                key={leader.id}
                className={`glass-card p-3 rounded-xl border ${getRankBadgeClass(index + 1)} transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <div className="w-8 flex justify-center">
                    {getRankIcon(index + 1)}
                  </div>

                  {/* Avatar */}
                  {leader.profile_image ? (
                    <img 
                      src={leader.profile_image} 
                      alt={leader.full_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{getInitials(leader.full_name)}</span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{leader.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {leader.referral_count} referrals • ₦{formatEarnings(leader.referral_count, leader.referral_rate)} earned
                    </p>
                  </div>

                  {/* Stars for top 3 */}
                  {index < 3 && (
                    <div className="flex">
                      {[...Array(3 - index)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Current user's position if not in top 50 */}
        {currentUserData && !currentUserRank && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Your Position</p>
            <div className="glass-card p-3 rounded-xl border border-primary/50 bg-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-8 flex justify-center">
                  <span className="text-muted-foreground font-bold">-</span>
                </div>
                {currentUserData.profile_image ? (
                  <img 
                    src={currentUserData.profile_image} 
                    alt={currentUserData.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{getInitials(currentUserData.full_name)}</span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{currentUserData.full_name} (You)</p>
                  <p className="text-xs text-muted-foreground">
                    {currentUserData.referral_count} referrals
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Leaderboard;
