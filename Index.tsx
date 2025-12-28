import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatBot from "@/components/ChatBot";

const HERO_IMAGE_VERSION = "2025-12-23";

const Index = () => {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="fixed inset-0 w-full h-full">
      {/* Fullscreen hero image - tapping anywhere (except support) navigates to register */}
      <div
        className="w-full h-full cursor-pointer"
        onClick={() => navigate("/register")}
      >
        <img
          src={`/lovable-uploads/bluepay2026-hero.png?v=${HERO_IMAGE_VERSION}`}
          alt="BluePay 2026 start screen"
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>

      {/* Clickable area ONLY (no extra icon). Positioned over the support icon inside the image. */}
      <button
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-transparent z-50"
        onClick={(e) => {
          e.stopPropagation();
          setIsChatOpen(true);
        }}
        aria-label="Support live chat"
      />

      {/* Live Chat */}
      <ChatBot 
        isOpen={isChatOpen} 
        onOpenChange={setIsChatOpen} 
        showToggleButton={false} 
      />
    </div>
  );
};

export default Index;
