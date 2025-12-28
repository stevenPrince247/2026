
import React, { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import TypewriterText from "../ui/TypewriterText";

const OpayNotificationBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [showTypewriter, setShowTypewriter] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTypewriter(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const notificationText = "Dear User, We're currently experiencing issues with Opay bank transfers. Please use other supported banks for your payments.";

  return (
    <div className="bg-card border-b border-border overflow-hidden relative">
      <div className="flex items-center py-3 px-5">
        <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 text-destructive" />
        <div className="flex-1 text-sm font-medium min-h-[20px] overflow-hidden">
          {showTypewriter ? (
            <div className="animate-marquee whitespace-nowrap">
              <TypewriterText 
                text={notificationText}
                speed={50}
                className="text-destructive font-medium inline-block"
              />
            </div>
          ) : (
            <span></span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsVisible(false)}
          className="text-muted-foreground hover:text-foreground hover:bg-accent ml-3 h-8 w-8 flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default OpayNotificationBanner;
