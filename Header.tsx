
import React from "react";
import { Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationDropdown from "./NotificationDropdown";

const Header = () => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleTelegramClick = () => {
    window.open('https://t.me/OfficialChixx9ja', '_blank');
  };

  return (
    <header className="text-foreground py-3 px-4 flex justify-between items-center sticky top-0 z-20 bg-background/80 backdrop-blur-md">
      <h1 className="text-2xl font-bold text-primary">Overview</h1>
      <div className="flex items-center gap-2">
        <button 
          onClick={handleTelegramClick}
          className="w-10 h-10 rounded-full bg-[#0088cc]/20 flex items-center justify-center hover:bg-[#0088cc]/30 transition-colors"
        >
          <Send size={18} className="text-[#0088cc]" />
        </button>
        <NotificationDropdown />
        <button 
          onClick={handleProfileClick}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          <span className="text-primary-foreground font-bold text-sm">P</span>
        </button>
      </div>
    </header>
  );
};

export default Header;