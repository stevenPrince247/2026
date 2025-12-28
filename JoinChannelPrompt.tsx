import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Send, MessageCircle, Users } from "lucide-react";

const JoinChannelPrompt = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show this prompt every time user returns to dashboard
    // But with a small delay and only if welcome bonus was already seen
    const hasSeenWelcome = localStorage.getItem("bluepay-welcome-bonus-seen");
    
    if (hasSeenWelcome) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
  };

  const handleJoinTelegram = () => {
    window.open("https://t.me/chixx9ja2", "_blank");
    handleDismiss();
  };

  const handleJoinWhatsApp = () => {
    window.open("https://whatsapp.com/channel/0029VbAyfnW8vd1LYwcqzh1E", "_blank");
    handleDismiss();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-sm mx-auto glass-card border-2 border-primary/30 p-0 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0088cc]/20 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        <div className="relative z-10 p-5">
          <DialogHeader className="mb-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center animate-pulse">
                  <Users className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-foreground">
                    Join Our Channels! 📢
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">Stay updated with news & promos</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1.5 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </DialogHeader>
          
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Get instant updates, promotions, and support by joining our official channels!
            </p>
            
            {/* Telegram Button */}
            <Button
              onClick={handleJoinTelegram}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#0088cc] to-[#00aaff] hover:from-[#0077b5] hover:to-[#0099dd] text-white py-4 rounded-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <Send className="h-5 w-5" />
              <span className="font-semibold">Join Telegram Channel</span>
            </Button>
            
            {/* WhatsApp Button */}
            <Button
              onClick={handleJoinWhatsApp}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold">Join WhatsApp Channel</span>
            </Button>
            
            {/* Skip button */}
            <button
              onClick={handleDismiss}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground py-2 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JoinChannelPrompt;
