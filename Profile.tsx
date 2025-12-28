
import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, User, Upload, Sun, Moon, CircleHelp, Smartphone, Download, ChevronRight, RotateCcw, Copy, Share2, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useUserStore } from "../stores/userStore";
import { useToast } from "@/components/ui/use-toast";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import ResetBalance from "../components/ResetBalance";
import { supabase } from "@/integrations/supabase/client";
import { useGoBack } from "@/hooks/useGoBack";

const Profile = () => {
  const goBack = useGoBack();
  const { toast } = useToast();
  const { userData, setUserData, themeMode, setThemeMode, notificationsEnabled, setNotificationsEnabled } = useUserStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isResetBalanceOpen, setIsResetBalanceOpen] = useState(false);
  const [referralCode, setReferralCode] = useState<string>("");
  const [referralCount, setReferralCount] = useState<number>(0);
  
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("referral_code, referral_count")
          .eq("id", user.id)
          .single();
        
        if (profile) {
          setReferralCode(profile.referral_code);
          setReferralCount(profile.referral_count);
        }
      }
    };
    
    fetchProfile();
  }, []);

  useEffect(() => {
    applyTheme(themeMode);
  }, [themeMode]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUserData({
          ...userData!,
          profileImage: reader.result as string
        });
        toast({
          title: "Profile updated",
          description: "Your profile image has been updated successfully",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleThemeChange = (value: string) => {
    setThemeMode(value as 'dark' | 'light' | 'system' | 'device');
    toast({
      title: "Theme updated",
      description: `Theme has been set to ${value} mode`,
    });
  };

  const applyTheme = (mode: string) => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light', 'system', 'device');
    
    if (mode === 'dark') {
      root.classList.add('dark');
    } else if (mode === 'system') {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.add('light');
      }
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          root.classList.remove('light');
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
          root.classList.add('light');
        }
      };
      
      try {
        mediaQuery.removeEventListener('change', handleChange);
      } catch (e) {}
      
      mediaQuery.addEventListener('change', handleChange);
    } else if (mode === 'device') {
      root.classList.add('device');
    } else {
      root.classList.add('light');
    }
  };

  const handleDownloadApp = () => {
    window.open("https://www.upload-apk.com/DGGv0TvbouKJJHW", "_blank");
    toast({
      title: "Opening download page",
      description: "Redirecting to app download...",
    });
  };

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
  };

  const handleShareReferralLink = () => {
    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: "Join BluePay",
        text: `Use my referral code ${referralCode} to get ₦20,000 bonus when you sign up!`,
        url: referralLink,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(referralLink);
      toast({
        title: "Link Copied!",
        description: "Referral link copied to clipboard",
      });
    }
  };

  return (
    <div className="min-h-screen cosmic-bg text-foreground relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-primary/5 rounded-full blur-2xl animate-float-slow" />
      </div>

      <header className="glass-header p-4 flex items-center sticky top-0 z-20">
        <button onClick={goBack} className="flex items-center text-foreground/80 hover:text-foreground transition-colors">
          <ArrowLeft className="h-6 w-6 mr-2" />
        </button>
        <h1 className="text-xl font-bold flex-1 text-center text-primary text-glow">Profile</h1>
        <div className="w-6"></div>
      </header>

      <div className="flex flex-col items-center p-4 relative z-10">
        <div className="relative mb-4">
          <Avatar className="w-24 h-24 border-2 border-primary/40 ring-2 ring-primary/20">
            {userData?.profileImage ? (
              <AvatarImage src={userData.profileImage} alt="Profile" className="object-cover" />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30">
                <User className="h-10 w-10 text-primary" />
              </AvatarFallback>
            )}
          </Avatar>
          <div 
            className="absolute bottom-0 right-0 glass-card p-2 rounded-full cursor-pointer border-primary/40 hover:bg-primary/20 transition-colors"
            onClick={triggerFileUpload}
          >
            <Upload className="h-4 w-4 text-primary" />
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload} 
              className="hidden" 
              accept="image/*"
            />
          </div>
        </div>

        <h2 className="text-xl font-bold text-foreground">{userData?.fullName || "User"}</h2>
        <p className="text-muted-foreground mb-6">{userData?.email || "No email set"}</p>

        <div className="w-full max-w-md glass-card p-5 rounded-2xl">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Account Information</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-muted-foreground mb-1 text-sm">Full Name</p>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-primary" />
                <p className="text-sm text-foreground">{userData?.fullName || "Not set"}</p>
              </div>
              <div className="h-px bg-border/30 my-3"></div>
            </div>
            
            <div>
              <p className="text-muted-foreground mb-1 text-sm">Email Address</p>
              <p className="text-sm text-foreground">{userData?.email || "Not set"}</p>
              <div className="h-px bg-border/30 my-3"></div>
            </div>
            
            <div>
              <p className="text-muted-foreground mb-1 text-sm">Account Level</p>
              <p className="text-sm text-foreground">Basic</p>
              <div className="h-px bg-border/30 my-3"></div>
            </div>

            {referralCode && (
              <div className="glass-card p-4 rounded-xl border-primary/30 bg-primary/5">
                <p className="text-foreground font-semibold mb-2 text-sm">Your Referral Code</p>
                <div className="flex items-center justify-between mb-3">
                  <code className="text-2xl font-bold text-primary text-glow">{referralCode}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyReferralCode}
                    className="flex items-center gap-1 glass-button border-primary/30"
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  You've referred <span className="font-bold text-primary">{referralCount}</span> {referralCount === 1 ? 'person' : 'people'}
                </p>
                <Button
                  onClick={handleShareReferralLink}
                  className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 flex items-center justify-center gap-2"
                  size="sm"
                >
                  <Share2 className="h-4 w-4" />
                  Share Referral Link
                </Button>
              </div>
            )}

            <div>
              <div 
                className="flex items-center justify-between cursor-pointer hover:bg-muted/20 p-3 rounded-xl transition-colors"
                onClick={() => setIsResetBalanceOpen(true)}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-destructive/20 rounded-full flex items-center justify-center mr-3">
                    <RotateCcw className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Reset Balance</p>
                    <p className="text-xs text-muted-foreground">Reset your account balance</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="h-px bg-border/30 my-2"></div>
            </div>
            
            <div>
              <div 
                className="flex items-center justify-between cursor-pointer hover:bg-muted/20 p-3 rounded-xl transition-colors"
                onClick={handleDownloadApp}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mr-3">
                    <Download className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Download App</p>
                    <p className="text-xs text-muted-foreground">Get the mobile app</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="h-px bg-border/30 my-2"></div>
            </div>

            {/* Notifications Toggle */}
            <div>
              <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/20 transition-colors">
                <div className="flex items-center">
                  <div className={`w-10 h-10 ${notificationsEnabled ? 'bg-primary/20' : 'bg-muted/30'} rounded-full flex items-center justify-center mr-3`}>
                    {notificationsEnabled ? (
                      <Bell className="h-5 w-5 text-primary" />
                    ) : (
                      <BellOff className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Notifications</p>
                    <p className="text-xs text-muted-foreground">
                      {notificationsEnabled ? 'Notifications are enabled' : 'Notifications are disabled'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={(checked) => {
                    setNotificationsEnabled(checked);
                    toast({
                      title: checked ? "Notifications enabled" : "Notifications disabled",
                      description: checked ? "You will receive notifications" : "You won't receive notifications",
                    });
                  }}
                />
              </div>
              <div className="h-px bg-border/30 my-2"></div>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-muted-foreground mb-1 text-sm">Theme</p>
                  <div className="flex items-center">
                    {themeMode === 'light' && <Sun className="h-4 w-4 mr-2 text-primary" />}
                    {themeMode === 'dark' && <Moon className="h-4 w-4 mr-2 text-primary" />}
                    {themeMode === 'system' && <CircleHelp className="h-4 w-4 mr-2 text-primary" />}
                    {themeMode === 'device' && <Smartphone className="h-4 w-4 mr-2 text-primary" />}
                    <p className="text-sm text-foreground">{themeMode === 'light' ? 'Light Mode' : 
                                           themeMode === 'dark' ? 'Dark Mode' : 
                                           themeMode === 'system' ? 'System Mode' : 'Device Mode'}</p>
                  </div>
                </div>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="glass-button border-primary/30 text-xs">
                      Toggle
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="glass-card border-t border-border/30 rounded-t-3xl">
                    <SheetHeader className="mb-3">
                      <SheetTitle className="text-lg text-foreground">Select Theme</SheetTitle>
                      <SheetDescription className="text-sm text-muted-foreground">
                        Choose your preferred app appearance
                      </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-3 py-2">
                      <div className="space-y-3">
                        {[
                          { mode: 'light', icon: Sun, label: 'Light Mode', desc: 'Standard light appearance' },
                          { mode: 'dark', icon: Moon, label: 'Dark Mode', desc: 'Easier on the eyes' },
                          { mode: 'system', icon: CircleHelp, label: 'System Mode', desc: 'Match system settings' },
                          { mode: 'device', icon: Smartphone, label: 'Device Mode', desc: 'Optimized for device' },
                        ].map(({ mode, icon: Icon, label, desc }) => (
                          <div 
                            key={mode}
                            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${themeMode === mode ? 'glass-card border-primary/40 bg-primary/10' : 'hover:bg-muted/20'}`}
                            onClick={() => handleThemeChange(mode)}
                          >
                            <div className="flex items-center">
                              <Icon className="h-5 w-5 mr-3 text-primary" />
                              <div>
                                <p className="font-medium text-sm text-foreground">{label}</p>
                                <p className="text-xs text-muted-foreground">{desc}</p>
                              </div>
                            </div>
                            {themeMode === mode && <div className="h-2 w-2 bg-primary rounded-full glow-blue"></div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="destructive"
          size="sm"
          className="mt-6 w-full max-w-md bg-destructive/80 hover:bg-destructive"
          onClick={() => window.location.href = "/"}
        >
          Logout
        </Button>
      </div>

      <ResetBalance isOpen={isResetBalanceOpen} onClose={() => setIsResetBalanceOpen(false)} />
    </div>
  );
};

export default Profile;
