
import React from "react";
import { useNavigate } from "react-router-dom";
import { Headphones, Users, UserPlus } from "lucide-react";

const MoreServices = () => {
  const navigate = useNavigate();

  const moreServices = [
    {
      id: 'support',
      title: 'Support',
      icon: Headphones,
      gradient: 'from-gray-500/20 to-gray-600/30',
      iconColor: 'text-gray-400',
      onClick: () => navigate("/support")
    },
    {
      id: 'community',
      title: 'Community',
      icon: Users,
      gradient: 'from-primary/20 to-accent/30',
      iconColor: 'text-primary',
      onClick: () => navigate("/platform")
    },
    {
      id: 'invite',
      title: 'Invite',
      icon: UserPlus,
      gradient: 'from-yellow-500/20 to-yellow-600/30',
      iconColor: 'text-yellow-400',
      onClick: () => navigate("/earn-more")
    }
  ];

  return (
    <div className="mb-3">
      <h3 className="text-xs font-bold text-primary tracking-wider uppercase mb-3">More Services</h3>
      <div className="flex justify-between gap-3">
        {moreServices.map((service, index) => {
          const IconComponent = service.icon;
          return (
            <div 
              key={service.id}
              className="flex flex-col items-center cursor-pointer group flex-1"
              onClick={service.onClick}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className={`h-14 w-14 rounded-2xl mb-2 flex items-center justify-center bg-gradient-to-br ${service.gradient} border border-border/30 group-hover:scale-105 transition-transform backdrop-blur-sm animate-button-float`} style={{ animationDelay: `${index * 0.3}s` }}>
                <IconComponent className={`w-6 h-6 ${service.iconColor}`} />
              </div>
              <p className="text-xs font-medium text-center text-foreground">{service.title}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MoreServices;
