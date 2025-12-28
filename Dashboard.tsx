import React from "react";
import { useUserStore } from "../stores/userStore";
import Header from "../components/dashboard/Header";
import UserGreeting from "../components/dashboard/UserGreeting";
import BalanceCard from "../components/dashboard/BalanceCard";
import QuickActions from "../components/dashboard/QuickActions";
import MoreServices from "../components/dashboard/MoreServices";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import BottomNavigation from "../components/dashboard/BottomNavigation";
import OpayNotificationBanner from "../components/dashboard/OpayNotificationBanner";
import ImportantInformation from "../components/dashboard/ImportantInformation";
import StatusNotificationModal from "../components/dashboard/StatusNotificationModal";
import WelcomeBonusModal from "../components/dashboard/WelcomeBonusModal";
import JoinChannelPrompt from "../components/dashboard/JoinChannelPrompt";
import ReferralSuccessNotification from "../components/dashboard/ReferralSuccessNotification";

const Dashboard = () => {
  const { transactions } = useUserStore();

  return (
    <div className="min-h-screen flex flex-col cosmic-bg pb-24 relative">
      {/* Background effects with floating animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl animate-float-slow" />
      </div>
      
      {/* Full-screen status notification modal */}
      <StatusNotificationModal />
      
      {/* Referral success notification */}
      <ReferralSuccessNotification />
      
      {/* Welcome bonus for new users */}
      <WelcomeBonusModal />
      
      {/* Join channel prompt for returning users */}
      <JoinChannelPrompt />
      
      <OpayNotificationBanner />
      <Header />

      <div className="px-4 pt-4 relative z-10 flex-1">
        {/* Balance Card - Full width prominent */}
        <BalanceCard />
        
        {/* Important Info / Image Carousel - Moved up */}
        <ImportantInformation />
        
        {/* Quick Actions Section */}
        <div className="mb-4">
          <h3 className="text-xs font-bold text-primary tracking-wider uppercase mb-3">Quick Actions</h3>
          <QuickActions />
        </div>
        
        {/* More Services Section */}
        <div className="mb-4">
          <MoreServices />
        </div>
        
        {/* Recent Transactions Section */}
        <div className="mb-4">
          <RecentTransactions transactions={transactions} />
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Dashboard;
