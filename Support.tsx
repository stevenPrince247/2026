
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatBot from "@/components/ChatBot";

const Support = () => {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleTelegramClick = () => {
    window.open('https://t.me/OfficialChixx9ja', '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col cosmic-bg relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-primary/5 rounded-full blur-2xl animate-float-slow" />
      </div>

      <header className="glass-header py-4 px-5 flex items-center sticky top-0 z-20">
        <button onClick={() => navigate("/dashboard")} className="mr-3 text-foreground/80 hover:text-foreground transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-primary text-glow flex-1 text-center">Support</h1>
        <div className="w-6 h-6"></div>
      </header>

      <div className="p-4 flex-1 relative z-10">
        <h2 className="text-xl font-bold mb-5 text-foreground">How can we help you?</h2>
        
        <div className="space-y-4">
          <div className="glass-card p-5 rounded-2xl border-[#0088cc]/30">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gradient-to-r from-[#0088cc] to-[#00aaff] rounded-full flex items-center justify-center shadow-lg">
                <Send className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">Telegram Support</h3>
                <p className="text-muted-foreground text-sm">Get instant help via Telegram</p>
              </div>
            </div>
            <Button 
              className="w-full mt-4 bg-gradient-to-r from-[#0088cc] to-[#00aaff] text-white hover:from-[#0077b5] hover:to-[#0099dd] py-3 text-sm font-semibold rounded-xl"
              onClick={handleTelegramClick}
            >
              Chat on Telegram
            </Button>
          </div>
          
          <div className="glass-card p-5 rounded-2xl border-primary/30">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center shadow-lg glow-blue">
                <span className="text-primary-foreground font-bold text-lg">@</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">Telegram Handle</h3>
                <p className="text-muted-foreground text-sm">Contact us directly</p>
              </div>
            </div>
            <div className="mt-4 p-4 glass-card rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-center text-primary font-bold text-lg">@OfficialChixx9ja</p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">Available 24/7 for your support needs</p>
          <p className="text-primary font-medium mt-1 text-sm">@OfficialChixx9ja on Telegram</p>
        </div>

        {/* Live Chat Button */}
        <div className="mt-6">
          <Button 
            className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 py-4 text-base font-semibold rounded-xl flex items-center justify-center gap-2"
            onClick={() => setIsChatOpen(true)}
          >
            <MessageCircle className="h-5 w-5" />
            Start Live Chat
          </Button>
        </div>
      </div>

      {/* ChatBot Component */}
      <ChatBot 
        isOpen={isChatOpen} 
        onOpenChange={setIsChatOpen} 
        showToggleButton={false} 
      />
    </div>
  );
};

export default Support;