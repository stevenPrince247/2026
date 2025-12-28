
import React from "react";
import { ArrowLeft, ExternalLink, Users, MessageCircle, Globe, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Platform = () => {
  const navigate = useNavigate();
  
  const handleJoinTelegram = () => {
    window.open("https://t.me/OfficialChixx9ja", "_blank");
  };
  
  const handleJoinWhatsapp = () => {
    window.open("https://chat.whatsapp.com/LUS3IRRaGrR3BueOPCObgb", "_blank");
  };

  return (
    <div className="min-h-screen cosmic-bg relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <header className="glass-header py-4 px-5 flex items-center sticky top-0 z-20">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(-1)}
          className="mr-3 text-foreground/80 hover:text-foreground hover:bg-muted/20"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold text-primary text-glow">Platform Communities</h1>
      </header>

      <div className="p-5 space-y-6 relative z-10">
        <Card className="p-6 glass-card">
          <div className="text-center mb-6">
            <div className="h-16 w-16 glass-card rounded-full mx-auto mb-4 flex items-center justify-center border-primary/30 glow-blue">
              <Globe className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to BluePay Community</h2>
            <p className="text-muted-foreground">Connect with other BluePay users, get support, and stay updated with the latest news and features.</p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 glass-card">
            <div className="text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-foreground">5,000+</h3>
              <p className="text-sm text-muted-foreground">Active Members</p>
            </div>
          </Card>
          <Card className="p-4 glass-card">
            <div className="text-center">
              <Shield className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-foreground">24/7</h3>
              <p className="text-sm text-muted-foreground">Community Support</p>
            </div>
          </Card>
        </div>

        <Card className="p-6 glass-card">
          <h2 className="text-xl font-bold text-foreground mb-4 text-center">Join Our Communities</h2>
          <p className="text-muted-foreground mb-6 text-center">Connect with other BluePay users and get the latest updates.</p>
          
          <div className="space-y-4">
            <div className="glass-card p-4 rounded-xl border-primary/30 hover:border-primary/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Telegram Channel</h3>
                    <p className="text-sm text-muted-foreground">Official BluePay announcements</p>
                  </div>
                </div>
                <ExternalLink className="h-5 w-5 text-muted-foreground" />
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 py-3 text-lg font-medium"
                onClick={handleJoinTelegram}
              >
                Join Telegram Channel
              </Button>
            </div>

            <div className="glass-card p-4 rounded-xl border-green-500/30 hover:border-green-500/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-green-500/20 rounded-full flex items-center justify-center mr-4">
                    <MessageCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">WhatsApp Group</h3>
                    <p className="text-sm text-muted-foreground">Community discussions & support</p>
                  </div>
                </div>
                <ExternalLink className="h-5 w-5 text-muted-foreground" />
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 py-3 text-lg font-medium"
                onClick={handleJoinWhatsapp}
              >
                Join WhatsApp Group
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 glass-card">
          <h3 className="text-xl font-bold text-foreground mb-4 text-center">What You'll Get</h3>
          <div className="space-y-4">
            {[
              { num: 1, color: 'primary', title: 'Latest Updates', desc: 'Be the first to know about new features and improvements' },
              { num: 2, color: 'green-400', title: 'Community Support', desc: 'Get help from other users and our support team' },
              { num: 3, color: 'purple-400', title: 'Exclusive Tips', desc: 'Learn tips and tricks to make the most of BluePay' },
            ].map(({ num, color, title, desc }) => (
              <div key={num} className="flex items-start">
                <div className={`h-8 w-8 bg-${color}/20 rounded-full flex items-center justify-center mr-3 mt-1`}>
                  <span className={`text-${color} font-bold text-sm`}>{num}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{title}</h4>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Platform;
