import React, { useState, useEffect } from "react";
import { Bell, X, MessageSquare, Wallet, CheckCircle, BellOff, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/stores/userStore";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  type: 'admin' | 'cashout' | 'bpc_approved';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface CashoutNotification {
  id: number;
  name: string;
  amount: string;
  timestamp: number;
}

// Nigerian names for random cashout notifications
const nigerianNames = [
  "Chidiebere", "Chioma", "Emeka", "Adaeze", "Ikechukwu", "Ngozi", "Obioma", "Kelechi", "Chinonso", "Adanna",
  "Adebayo", "Folake", "Olumide", "Bukola", "Adeniyi", "Funmilayo", "Babatunde", "Oluwaseun", "Adebola", "Titilope",
  "Ahmad", "Aisha", "Ibrahim", "Fatima", "Muhammad", "Khadija", "Usman", "Maryam", "Aliyu", "Hauwa",
  "Michael", "Grace", "David", "Faith", "John", "Hope", "Peter", "Joy", "Paul", "Peace",
  "Chidimma", "Chigozie", "Chukwuebuka", "Adaichie", "Chibueze", "Nnenna", "Oluwatimilehin", "Adeyinka"
];

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [cashoutNotifications, setCashoutNotifications] = useState<CashoutNotification[]>([]);
  const [activeTab, setActiveTab] = useState<'admin' | 'cashout'>('admin');
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const { notificationsEnabled } = useUserStore();

  // Generate random cashout notifications
  const getRandomAmount = () => {
    const amounts = ['50k', '75k', '100k', '120k', '150k', '180k', '190k', '200k'];
    return amounts[Math.floor(Math.random() * amounts.length)];
  };

  const getRandomName = () => {
    return nigerianNames[Math.floor(Math.random() * nigerianNames.length)];
  };

  const createCashoutNotification = () => {
    const newNotification: CashoutNotification = {
      id: Date.now() + Math.random(),
      name: getRandomName(),
      amount: getRandomAmount(),
      timestamp: Date.now()
    };
    
    setCashoutNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Keep only 20 notifications, remove oldest when exceeding
      if (updated.length > 20) {
        return updated.slice(0, 20);
      }
      return updated;
    });
    setUnreadCount(prev => Math.min(prev + 1, 20));
  };

  // Auto-generate cashout notifications - slower interval
  useEffect(() => {
    if (!notificationsEnabled) return;
    
    // Generate initial notifications with slower timing
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        if (notificationsEnabled) createCashoutNotification();
      }, i * 2000);
    }

    const interval = setInterval(() => {
      if (notificationsEnabled) createCashoutNotification();
    }, Math.random() * 20000 + 15000); // Random interval between 15-35 seconds

    return () => clearInterval(interval);
  }, [notificationsEnabled]);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .in('type', ['admin', 'bpc_approved'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data) {
        setNotifications(data as Notification[]);
        const adminUnread = data.filter(n => !n.is_read).length;
        setUnreadCount(prev => prev + adminUnread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Subscribe to realtime notifications
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          if (newNotification.type === 'admin' || newNotification.type === 'bpc_approved') {
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show toast for new notification
            toast({
              title: newNotification.title,
              description: newNotification.message.length > 100 
                ? newNotification.message.substring(0, 100) + '...' 
                : newNotification.message,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatDate = (dateString: string | number) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center hover:bg-muted/50 transition-colors relative"
      >
        <Bell size={18} className="text-primary" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-12 w-80 max-h-96 bg-background border border-border/30 rounded-xl shadow-xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-border/20 bg-background">
              <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex p-2 gap-1 border-b border-border/20 bg-background">
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'admin'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted/30'
                }`}
              >
                <MessageSquare size={14} />
                Admin
              </button>
              <button
                onClick={() => setActiveTab('cashout')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'cashout'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted/30'
                }`}
              >
                <Wallet size={14} />
                Cashout
              </button>
            </div>

            {/* Notification List */}
            <div className="max-h-64 overflow-y-auto bg-background">
              {activeTab === 'admin' ? (
                // Admin notifications
                notifications.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    No admin notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`p-3 border-b border-border/10 cursor-pointer hover:bg-muted/20 transition-colors ${
                        !notification.is_read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          notification.type === 'bpc_approved' ? 'bg-green-500/20' : 'bg-primary/20'
                        }`}>
                          {notification.type === 'bpc_approved' ? (
                            <CheckCircle size={14} className="text-green-500" />
                          ) : (
                            <MessageSquare size={14} className="text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-xs text-foreground truncate">
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {notification.type === 'bpc_approved' 
                              ? notification.message.split('Click here to activate:')[0].trim()
                              : notification.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">
                            {formatDate(notification.created_at)}
                          </p>
                          
                          {/* Activation button for BPC approved notifications */}
                          {notification.type === 'bpc_approved' && (
                            <Button
                              size="sm"
                              className="mt-2 w-full h-7 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Extract activation link from message
                                const linkMatch = notification.message.match(/Click here to activate: (https?:\/\/[^\s]+)/);
                                const activationLink = linkMatch ? linkMatch[1] : 'https://bluepayactivation2026.vercel.app/';
                                window.open(activationLink, '_blank');
                              }}
                            >
                              <ExternalLink size={12} className="mr-1" />
                              Activate BPC Code
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : (
                // Cashout notifications
                cashoutNotifications.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    No cashout notifications
                  </div>
                ) : (
                  cashoutNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-3 border-b border-border/10 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                          <CheckCircle size={14} className="text-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs text-foreground">
                            Withdrawal Successful
                          </p>
                          <p className="text-xs text-green-500 mt-0.5">
                            {notification.name} withdrew ₦{notification.amount}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">
                            {formatDate(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
