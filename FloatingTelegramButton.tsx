import React from "react";
import { Send } from "lucide-react";

const FloatingTelegramButton = () => {
  const handleClick = () => {
    window.open("https://t.me/OfficialChixx9ja", "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#0088cc] to-[#006699] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group animate-pulse-slow"
      aria-label="Contact support on Telegram"
    >
      <div className="absolute inset-0 rounded-full bg-[#0088cc]/30 animate-ping" />
      <Send className="w-6 h-6 text-white transform rotate-45 group-hover:rotate-[60deg] transition-transform duration-300" />
    </button>
  );
};

export default FloatingTelegramButton;
