
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserData } from "../../types/user";
import TypewriterText from "../ui/TypewriterText";
import { Bell, User } from "lucide-react";

interface UserGreetingProps {
  userData: UserData | null;
}

const UserGreeting = ({ userData }: UserGreetingProps) => {
  return (
    <div className="flex justify-between items-center mb-3 px-1">
      <div className="flex items-center gap-3">
        <Avatar className="w-11 h-11 border-2 border-primary/40 ring-2 ring-primary/20">
          {userData?.profileImage ? (
            <AvatarImage src={userData.profileImage} alt="Profile" className="object-cover" />
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30">
              <User className="w-5 h-5 text-primary" />
            </AvatarFallback>
          )}
        </Avatar>
        <h2 className="text-lg font-semibold text-foreground">
          Hi, <TypewriterText text={userData?.fullName || "User"} speed={100} className="font-semibold text-primary" />
        </h2>
      </div>
      <div className="w-10 h-10 rounded-full glass-card flex items-center justify-center border-primary/30 hover:bg-primary/10 transition-colors cursor-pointer">
        <Bell className="w-5 h-5 text-primary" />
      </div>
    </div>
  );
};

export default UserGreeting;
