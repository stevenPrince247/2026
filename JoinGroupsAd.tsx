import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, MessageCircle, Send } from "lucide-react";

const JoinGroupsAd = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed this ad
    const hasSeenAd = localStorage.getItem("bluepay-groups-ad-dismissed");
    if (!hasSeenAd) {
      setIsOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("bluepay-groups-ad-dismissed", "true");
    setIsOpen(false);
  };

  const handleJoinTelegram = () => {
    window.location.href = "https://t.me/chixx9ja2";
    handleDismiss();
  };

  const handleJoinWhatsApp = () => {
    window.location.href = "https://whatsapp.com/channel/0029VbAyfnW8vd1LYwcqzh1E";
    handleDismiss();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-sm mx-auto bg-white dark:bg-gray-800 border-2 border-bluepay-blue">
        <DialogHeader className="text-center">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-bold text-bluepay-blue flex-1">
              Join Our Community! 🎉
            </DialogTitle>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
            Stay updated with the latest news, promotions, and get instant support by joining our official groups!
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleJoinTelegram}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Send className="h-4 w-4" />
              Telegram
            </Button>
            
            <Button
              onClick={handleJoinWhatsApp}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
            >
              <MessageCircle className="h-4 w-4" />
              Channel
            </Button>
          </div>
          
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="w-full text-gray-600 border-gray-300 hover:bg-gray-50"
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JoinGroupsAd;