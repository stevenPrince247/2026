import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, ShoppingBag, Info, Radio } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useAdminSettings } from "@/hooks/useAdminSettings";

const QuickActions = () => {
  const navigate = useNavigate();
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const { videoLink } = useAdminSettings();

  const handleInfo = () => {
    setIsVideoOpen(true);
  };

  const quickActions = [
    {
      id: "buy-bpc",
      title: "Buy BPC",
      icon: ShoppingBag,
      gradient: "from-purple-500/20 to-purple-600/30",
      iconColor: "text-purple-400",
      onClick: () => navigate("/buy-bpc"),
    },
    {
      id: "info",
      title: "Info",
      icon: Info,
      gradient: "from-primary/20 to-accent/30",
      iconColor: "text-primary",
      onClick: handleInfo,
    },
    {
      id: "broadcast",
      title: "Broadcast",
      icon: Radio,
      gradient: "from-orange-500/20 to-orange-600/30",
      iconColor: "text-orange-400",
      onClick: () => navigate("/broadcast"),
    },
  ];

  return (
    <>
      <div className="flex justify-between gap-3">
        {quickActions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <div
              key={action.id}
              className="flex flex-col items-center cursor-pointer group flex-1"
              onClick={action.onClick}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div
                className={`h-14 w-14 rounded-2xl mb-2 flex items-center justify-center bg-gradient-to-br ${action.gradient} border border-border/30 group-hover:scale-105 transition-transform backdrop-blur-sm animate-button-float`}
                style={{ animationDelay: `${index * 0.3}s` }}
              >
                <IconComponent className={`w-6 h-6 ${action.iconColor}`} />
              </div>
              <p className="text-xs font-medium text-center text-foreground">{action.title}</p>
            </div>
          );
        })}
      </div>

      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="max-w-4xl w-full p-0 glass-card border-border/30">
          <DialogHeader className="p-4 pb-0">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-foreground">BluPay Tutorial</DialogTitle>
              <button
                onClick={() => setIsVideoOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </DialogHeader>
          <div className="aspect-video w-full">
            <iframe
              width="100%"
              height="100%"
              src={videoLink}
              frameBorder="0"
              allowFullScreen
              className="rounded-b-2xl"
              title="BluPay Tutorial"
            ></iframe>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickActions;

