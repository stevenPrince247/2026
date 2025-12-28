import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, CheckCircle, XCircle, Eye, Users, CreditCard, 
  Settings, BarChart3, ShoppingBag, Bell, LogOut, Search,
  DollarSign, TrendingUp, UserCheck, Clock, Edit, Save, Loader2,
  ChevronLeft, ChevronRight, Ban
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import SendNotificationForm from "@/components/admin/SendNotificationForm";
import FloatingApprovalIcon from "@/components/admin/FloatingApprovalIcon";

interface WithdrawalRequest {
  id: string;
  user_id: string;
  withdrawal_amount: number;
  amount: number;
  bank_name: string;
  account_name: string;
  account_number: string;
  payment_screenshot: string | null;
  status: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface BPCPurchase {
  id: string;
  user_id: string;
  amount: number;
  email: string;
  full_name: string;
  bpc_code: string | null;
  payment_proof: string | null;
  status: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  profile_image: string | null;
  referral_code: string;
  referral_count: number;
  referral_earnings: number;
  referral_rate: number;
  main_balance: number;
  account_upgraded: boolean;
  created_at: string;
}

interface AdminSettings {
  payment_bank_name: string;
  payment_account_number: string;
  payment_account_name: string;
  bpc_code: string;
  activation_fee: string;
  bpc_amount: string;
  video_link: string;
  activation_link: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [bpcPurchases, setBpcPurchases] = useState<BPCPurchase[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [settings, setSettings] = useState<AdminSettings>({
    payment_bank_name: "",
    payment_account_number: "",
    payment_account_name: "",
    bpc_code: "",
    activation_fee: "",
    bpc_amount: "",
    video_link: "",
    activation_link: "",
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  
  // User editing state
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    full_name: '',
    email: '',
    main_balance: 0,
    referral_earnings: 0,
    referral_rate: 0,
    referral_count: 0,
    account_upgraded: false,
  });
  const [isSavingUser, setIsSavingUser] = useState(false);
  
  // Bulk edit state
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [bulkEditForm, setBulkEditForm] = useState({
    main_balance: 0,
    referral_earnings: 0,
    updateMainBalance: false,
    updateReferralEarnings: false,
  });
  const [isSavingBulk, setIsSavingBulk] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBalance: 0,
    pendingWithdrawals: 0,
    pendingBPC: 0,
    totalReferrals: 0,
    approvedWithdrawals: 0,
  });

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error || !data) {
        toast({
          variant: "destructive",
          description: "Access denied. Admin privileges required.",
        });
        navigate('/dashboard');
        return;
      }

      setIsAdmin(true);
      await Promise.all([
        fetchWithdrawals(),
        fetchBPCPurchases(),
        fetchUsers(),
        fetchSettings(),
        fetchStats(),
      ]);
      setIsLoading(false);
    } catch (error) {
      navigate('/dashboard');
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWithdrawals(data || []);
      
      const pending = (data || []).filter(w => w.status === 'pending').length;
      const approved = (data || []).filter(w => w.status === 'approved').length;
      setStats(prev => ({ ...prev, pendingWithdrawals: pending, approvedWithdrawals: approved }));
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
    }
  };

  const fetchBPCPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from('bpc_purchases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBpcPurchases(data || []);
      
      const pending = (data || []).filter(b => b.status === 'pending').length;
      setStats(prev => ({ ...prev, pendingBPC: pending }));
    } catch (error) {
      console.error('Failed to fetch BPC purchases:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_admin_stats');
      
      if (error) throw error;
      
      if (data) {
        const statsData = data as {
          total_users: number;
          total_main_balance: number;
          total_referral_earnings: number;
          total_referrals: number;
          pending_withdrawals: number;
          approved_withdrawals: number;
          pending_bpc: number;
        };
        setStats({
          totalUsers: statsData.total_users || 0,
          totalBalance: (statsData.total_main_balance || 0) + (statsData.total_referral_earnings || 0),
          pendingWithdrawals: statsData.pending_withdrawals || 0,
          pendingBPC: statsData.pending_bpc || 0,
          totalReferrals: statsData.total_referrals || 0,
          approvedWithdrawals: statsData.approved_withdrawals || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*');

      if (error) throw error;
      
      const settingsMap: Record<string, string> = {};
      (data || []).forEach(item => {
        settingsMap[item.setting_key] = item.setting_value;
      });
      
      setSettings({
        payment_bank_name: settingsMap.payment_bank_name || "",
        payment_account_number: settingsMap.payment_account_number || "",
        payment_account_name: settingsMap.payment_account_name || "",
        bpc_code: settingsMap.bpc_code || "",
        activation_fee: settingsMap.activation_fee || "",
        bpc_amount: settingsMap.bpc_amount || "",
        video_link: settingsMap.video_link || "",
        activation_link: settingsMap.activation_link || "",
      });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const saveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('admin_settings')
          .update({ setting_value: update.setting_value })
          .eq('setting_key', update.setting_key);
        
        if (error) throw error;
      }

      toast({ description: "Settings saved successfully" });
    } catch (error) {
      toast({ variant: "destructive", description: "Failed to save settings" });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleApproveWithdrawal = async (id: string, userId: string, withdrawalAmount: number) => {
    try {
      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update({ status: 'approved' })
        .eq('id', id);

      if (updateError) throw updateError;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('referral_earnings')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      const newEarnings = Math.max(0, (profile.referral_earnings || 0) - withdrawalAmount);

      const { error: earningsError } = await supabase
        .from('profiles')
        .update({ referral_earnings: newEarnings })
        .eq('id', userId);

      if (earningsError) throw earningsError;

      toast({ description: "Withdrawal approved successfully" });
      fetchWithdrawals();
      fetchUsers();
    } catch (error) {
      toast({ variant: "destructive", description: "Failed to approve withdrawal" });
    }
  };

  const handleRejectWithdrawal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;
      toast({ description: "Withdrawal rejected" });
      fetchWithdrawals();
    } catch (error) {
      toast({ variant: "destructive", description: "Failed to reject withdrawal" });
    }
  };

  const handleApproveBPC = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bpc_purchases')
        .update({ status: 'approved', bpc_code: settings.bpc_code })
        .eq('id', id);

      if (error) throw error;
      toast({ description: "BPC purchase approved" });
      fetchBPCPurchases();
    } catch (error) {
      toast({ variant: "destructive", description: "Failed to approve BPC purchase" });
    }
  };

  const handleRejectBPC = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bpc_purchases')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;
      toast({ description: "BPC purchase rejected" });
      fetchBPCPurchases();
    } catch (error) {
      toast({ variant: "destructive", description: "Failed to reject BPC purchase" });
    }
  };

  const handleCancelWithdrawal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;
      toast({ description: "Withdrawal cancelled" });
      fetchWithdrawals();
    } catch (error) {
      toast({ variant: "destructive", description: "Failed to cancel withdrawal" });
    }
  };

  const handleCancelBPC = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bpc_purchases')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;
      toast({ description: "BPC purchase cancelled" });
      fetchBPCPurchases();
    } catch (error) {
      toast({ variant: "destructive", description: "Failed to cancel BPC purchase" });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const openEditUser = (user: UserProfile) => {
    setEditingUser(user);
    setEditUserForm({
      full_name: user.full_name || '',
      email: user.email || '',
      main_balance: user.main_balance || 0,
      referral_earnings: user.referral_earnings || 0,
      referral_rate: user.referral_rate || 7000,
      referral_count: user.referral_count || 0,
      account_upgraded: user.account_upgraded || false,
    });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    
    setIsSavingUser(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editUserForm.full_name,
          email: editUserForm.email,
          main_balance: editUserForm.main_balance,
          referral_earnings: editUserForm.referral_earnings,
          referral_rate: editUserForm.referral_rate,
          referral_count: editUserForm.referral_count,
          account_upgraded: editUserForm.account_upgraded,
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      toast({ description: "User updated successfully" });
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast({ variant: "destructive", description: "Failed to update user" });
    } finally {
      setIsSavingUser(false);
    }
  };

  // View image from storage
  const handleViewImage = async (filePath: string | null, bucketName: string) => {
    if (!filePath) return;
    
    setImageLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;
      setSelectedImage(data.signedUrl);
    } catch (error) {
      console.error('Error getting signed URL:', error);
      toast({ variant: "destructive", description: "Failed to load image" });
    } finally {
      setImageLoading(false);
    }
  };

  // Toggle user selection for bulk edit
  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUserIds);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUserIds(newSelection);
  };

  // Select all users
  const toggleSelectAll = () => {
    if (selectedUserIds.size === filteredUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(filteredUsers.map(u => u.id)));
    }
  };

  // Handle bulk save
  const handleBulkSave = async () => {
    if (selectedUserIds.size === 0) return;
    
    setIsSavingBulk(true);
    try {
      const updates: Record<string, number> = {};
      if (bulkEditForm.updateMainBalance) {
        updates.main_balance = bulkEditForm.main_balance;
      }
      if (bulkEditForm.updateReferralEarnings) {
        updates.referral_earnings = bulkEditForm.referral_earnings;
      }

      if (Object.keys(updates).length === 0) {
        toast({ variant: "destructive", description: "Please select at least one field to update" });
        return;
      }

      for (const userId of selectedUserIds) {
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', userId);
        
        if (error) throw error;
      }

      toast({ description: `Updated ${selectedUserIds.size} users successfully` });
      setShowBulkEdit(false);
      setSelectedUserIds(new Set());
      setBulkEditForm({
        main_balance: 0,
        referral_earnings: 0,
        updateMainBalance: false,
        updateReferralEarnings: false,
      });
      fetchUsers();
    } catch (error) {
      toast({ variant: "destructive", description: "Failed to update users" });
    } finally {
      setIsSavingBulk(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.referral_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginated users
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Reset to page 1 when search or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);

  if (!isAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen cosmic-bg flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float-delayed" />
        </div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cosmic-bg text-foreground relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 right-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl animate-float-slow" />
      </div>

      {/* Header */}
      <header className="glass-header sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="text-foreground">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-glow">BluPay Admin Panel</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-400 hover:text-red-300">
            <LogOut size={18} className="mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass-card grid grid-cols-6 w-full gap-1 p-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 text-xs sm:text-sm">
              <BarChart3 size={16} />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex items-center gap-2 text-xs sm:text-sm">
              <CreditCard size={16} />
              <span className="hidden sm:inline">Withdrawals</span>
            </TabsTrigger>
            <TabsTrigger value="bpc" className="flex items-center gap-2 text-xs sm:text-sm">
              <ShoppingBag size={16} />
              <span className="hidden sm:inline">BPC</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 text-xs sm:text-sm">
              <Clock size={16} />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2 text-xs sm:text-sm">
              <Users size={16} />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 text-xs sm:text-sm">
              <Settings size={16} />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card className="glass-card border-border/30 animate-button-float">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users size={16} className="text-primary" />
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">{stats.totalUsers}</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-border/30 animate-button-float" style={{ animationDelay: '0.1s' }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                    <DollarSign size={16} className="text-green-400" />
                    Total Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-400">₦{stats.totalBalance.toLocaleString()}</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-border/30 animate-button-float" style={{ animationDelay: '0.2s' }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock size={16} className="text-yellow-400" />
                    Pending Withdrawals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-yellow-400">{stats.pendingWithdrawals}</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-border/30 animate-button-float" style={{ animationDelay: '0.3s' }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                    <ShoppingBag size={16} className="text-purple-400" />
                    Pending BPC
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-purple-400">{stats.pendingBPC}</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-border/30 animate-button-float" style={{ animationDelay: '0.4s' }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                    <TrendingUp size={16} className="text-blue-400" />
                    Total Referrals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-400">{stats.totalReferrals}</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-border/30 animate-button-float" style={{ animationDelay: '0.5s' }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                    <UserCheck size={16} className="text-emerald-400" />
                    Approved Payouts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-emerald-400">{stats.approvedWithdrawals}</p>
                </CardContent>
              </Card>
            </div>

            {/* Notifications */}
            <SendNotificationForm />

            {/* Recent Activity */}
            <Card className="glass-card border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell size={20} className="text-primary" />
                  Recent Pending Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {withdrawals.filter(w => w.status === 'pending').slice(0, 5).map(w => (
                    <div key={w.id} className="flex justify-between items-center p-3 glass-card rounded-lg">
                      <div>
                        <p className="font-medium">{w.profiles?.full_name}</p>
                        <p className="text-sm text-muted-foreground">Withdrawal: ₦{w.withdrawal_amount?.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApproveWithdrawal(w.id, w.user_id, w.withdrawal_amount)}>
                          <CheckCircle size={16} />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleRejectWithdrawal(w.id)}>
                          <XCircle size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {withdrawals.filter(w => w.status === 'pending').length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No pending requests</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals">
            <Card className="glass-card border-border/30">
              <CardHeader>
                <CardTitle>Withdrawal Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/30">
                        <TableHead>User</TableHead>
                        <TableHead>Bank Details</TableHead>
                        <TableHead>Withdrawal</TableHead>
                        <TableHead>Fee Paid</TableHead>
                        <TableHead>Proof</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground">
                            No withdrawal requests found
                          </TableCell>
                        </TableRow>
                      ) : (
                        withdrawals.map((withdrawal) => (
                          <TableRow key={withdrawal.id} className="border-border/30">
                            <TableCell>
                              <div>
                                <p className="font-medium">{withdrawal.profiles?.full_name}</p>
                                <p className="text-sm text-muted-foreground">{withdrawal.profiles?.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p>{withdrawal.bank_name}</p>
                                <p>{withdrawal.account_name}</p>
                                <p className="text-muted-foreground">{withdrawal.account_number}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-primary">
                                ₦{withdrawal.withdrawal_amount?.toLocaleString() || 0}
                              </span>
                            </TableCell>
                            <TableCell>₦{withdrawal.amount?.toLocaleString()}</TableCell>
                            <TableCell>
                              {withdrawal.payment_screenshot ? (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleViewImage(withdrawal.payment_screenshot, 'withdrawal-proofs')}
                                  disabled={imageLoading}
                                >
                                  {imageLoading ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                                </Button>
                              ) : (
                                <span className="text-muted-foreground text-sm">No proof</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                withdrawal.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                withdrawal.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                withdrawal.status === 'cancelled' ? 'bg-orange-500/20 text-orange-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {withdrawal.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(withdrawal.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {withdrawal.status === 'pending' && (
                                <div className="flex gap-2">
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApproveWithdrawal(withdrawal.id, withdrawal.user_id, withdrawal.withdrawal_amount)}>
                                    <CheckCircle size={16} />
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleRejectWithdrawal(withdrawal.id)}>
                                    <XCircle size={16} />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => handleCancelWithdrawal(withdrawal.id)}>
                                    <Ban size={16} />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BPC Purchases Tab */}
          <TabsContent value="bpc">
            <Card className="glass-card border-border/30">
              <CardHeader>
                <CardTitle>BPC Purchases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/30">
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Proof</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bpcPurchases.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            No BPC purchases found
                          </TableCell>
                        </TableRow>
                      ) : (
                        bpcPurchases.map((purchase) => (
                          <TableRow key={purchase.id} className="border-border/30">
                            <TableCell className="font-medium">{purchase.full_name}</TableCell>
                            <TableCell className="text-muted-foreground">{purchase.email}</TableCell>
                            <TableCell className="font-semibold text-primary">₦{purchase.amount?.toLocaleString()}</TableCell>
                            <TableCell>
                              {purchase.payment_proof ? (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleViewImage(purchase.payment_proof, 'bpc-proofs')}
                                  disabled={imageLoading}
                                >
                                  {imageLoading ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                                </Button>
                              ) : (
                                <span className="text-muted-foreground text-sm">No proof</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                purchase.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                purchase.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                purchase.status === 'cancelled' ? 'bg-orange-500/20 text-orange-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {purchase.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(purchase.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {purchase.status === 'pending' && (
                                <div className="flex gap-2">
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApproveBPC(purchase.id)}>
                                    <CheckCircle size={16} />
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleRejectBPC(purchase.id)}>
                                    <XCircle size={16} />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => handleCancelBPC(purchase.id)}>
                                    <Ban size={16} />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab - All processed requests */}
          <TabsContent value="history">
            <div className="space-y-6">
              {/* Withdrawal History */}
              <Card className="glass-card border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard size={20} className="text-primary" />
                    Withdrawal History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/30">
                          <TableHead>User</TableHead>
                          <TableHead>Bank Details</TableHead>
                          <TableHead>Withdrawal</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {withdrawals.filter(w => w.status !== 'pending').length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                              No processed withdrawal requests
                            </TableCell>
                          </TableRow>
                        ) : (
                          withdrawals.filter(w => w.status !== 'pending').map((withdrawal) => (
                            <TableRow key={withdrawal.id} className="border-border/30">
                              <TableCell>
                                <div>
                                  <p className="font-medium">{withdrawal.profiles?.full_name}</p>
                                  <p className="text-sm text-muted-foreground">{withdrawal.profiles?.email}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <p>{withdrawal.bank_name}</p>
                                  <p>{withdrawal.account_name}</p>
                                  <p className="text-muted-foreground">{withdrawal.account_number}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-semibold text-primary">
                                  ₦{withdrawal.withdrawal_amount?.toLocaleString() || 0}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  withdrawal.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                  withdrawal.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                  withdrawal.status === 'cancelled' ? 'bg-orange-500/20 text-orange-400' :
                                  'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                  {withdrawal.status}
                                </span>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(withdrawal.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {withdrawal.status === 'approved' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => handleCancelWithdrawal(withdrawal.id)}
                                    className="text-orange-400 border-orange-400/50 hover:bg-orange-400/10"
                                  >
                                    <Ban size={14} className="mr-1" />
                                    Cancel
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* BPC Purchase History */}
              <Card className="glass-card border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag size={20} className="text-purple-400" />
                    BPC Purchase History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/30">
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>BPC Code</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bpcPurchases.filter(b => b.status !== 'pending').length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                              No processed BPC purchases
                            </TableCell>
                          </TableRow>
                        ) : (
                          bpcPurchases.filter(b => b.status !== 'pending').map((purchase) => (
                            <TableRow key={purchase.id} className="border-border/30">
                              <TableCell className="font-medium">{purchase.full_name}</TableCell>
                              <TableCell className="text-muted-foreground">{purchase.email}</TableCell>
                              <TableCell className="font-semibold text-primary">₦{purchase.amount?.toLocaleString()}</TableCell>
                              <TableCell>
                                {purchase.bpc_code ? (
                                  <span className="px-2 py-1 bg-primary/20 rounded text-primary font-mono text-sm">
                                    {purchase.bpc_code}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  purchase.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                  purchase.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                  purchase.status === 'cancelled' ? 'bg-orange-500/20 text-orange-400' :
                                  'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                  {purchase.status}
                                </span>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(purchase.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {purchase.status === 'approved' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => handleCancelBPC(purchase.id)}
                                    className="text-orange-400 border-orange-400/50 hover:bg-orange-400/10"
                                  >
                                    <Ban size={14} className="mr-1" />
                                    Cancel
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="glass-card border-border/30">
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span>All Users ({filteredUsers.length})</span>
                    {selectedUserIds.size > 0 && (
                      <Button 
                        size="sm" 
                        onClick={() => setShowBulkEdit(true)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Edit size={14} className="mr-2" />
                        Bulk Edit ({selectedUserIds.size})
                      </Button>
                    )}
                  </div>
                  <div className="relative w-64">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      placeholder="Search users..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 glass-input"
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/30">
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={selectedUserIds.size === filteredUsers.length && filteredUsers.length > 0}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 rounded border-border cursor-pointer"
                          />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Referral Code</TableHead>
                        <TableHead>Main Balance</TableHead>
                        <TableHead>Referrals</TableHead>
                        <TableHead>Earnings</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Upgraded</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedUsers.map((user) => (
                          <TableRow key={user.id} className={`border-border/30 ${selectedUserIds.has(user.id) ? 'bg-primary/10' : ''}`}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedUserIds.has(user.id)}
                                onChange={() => toggleUserSelection(user.id)}
                                className="w-4 h-4 rounded border-border cursor-pointer"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{user.full_name}</TableCell>
                            <TableCell className="text-muted-foreground">{user.email}</TableCell>
                            <TableCell>
                              <span className="px-2 py-1 bg-primary/20 rounded text-primary font-mono text-sm">
                                {user.referral_code}
                              </span>
                            </TableCell>
                            <TableCell className="font-semibold text-blue-400">
                              ₦{user.main_balance?.toLocaleString() || 0}
                            </TableCell>
                            <TableCell>{user.referral_count}</TableCell>
                            <TableCell className="font-semibold text-green-400">
                              ₦{user.referral_earnings?.toLocaleString() || 0}
                            </TableCell>
                            <TableCell>₦{user.referral_rate?.toLocaleString()}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.account_upgraded ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                              }`}>
                                {user.account_upgraded ? 'Yes' : 'No'}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(user.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => openEditUser(user)}
                                className="hover:bg-primary/20"
                              >
                                <Edit size={16} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination Controls */}
                {filteredUsers.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-border/30">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Show</span>
                      <select
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="glass-input px-2 py-1 rounded border border-border/30 bg-background"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span>per page</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="hidden sm:flex"
                      >
                        First
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft size={16} />
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="hidden sm:flex"
                      >
                        Last
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="glass-card border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard size={20} className="text-primary" />
                    Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input 
                      value={settings.payment_bank_name}
                      onChange={(e) => setSettings(prev => ({ ...prev, payment_bank_name: e.target.value }))}
                      className="glass-input"
                      placeholder="e.g. Opay"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input 
                      value={settings.payment_account_number}
                      onChange={(e) => setSettings(prev => ({ ...prev, payment_account_number: e.target.value }))}
                      className="glass-input"
                      placeholder="e.g. 7043805498"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Name</Label>
                    <Input 
                      value={settings.payment_account_name}
                      onChange={(e) => setSettings(prev => ({ ...prev, payment_account_name: e.target.value }))}
                      className="glass-input"
                      placeholder="e.g. BluPay Official"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag size={20} className="text-purple-400" />
                    BPC & Fees Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>BPC Code</Label>
                    <Input 
                      value={settings.bpc_code}
                      onChange={(e) => setSettings(prev => ({ ...prev, bpc_code: e.target.value }))}
                      className="glass-input"
                      placeholder="e.g. BPC2024PREMIUM"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>BPC Amount (₦)</Label>
                    <Input 
                      value={settings.bpc_amount}
                      onChange={(e) => setSettings(prev => ({ ...prev, bpc_amount: e.target.value }))}
                      className="glass-input"
                      placeholder="e.g. 6200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Activation Fee (₦)</Label>
                    <Input 
                      value={settings.activation_fee}
                      onChange={(e) => setSettings(prev => ({ ...prev, activation_fee: e.target.value }))}
                      className="glass-input"
                      placeholder="e.g. 13450"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Video Link (Embed URL)</Label>
                    <Input 
                      value={settings.video_link}
                      onChange={(e) => setSettings(prev => ({ ...prev, video_link: e.target.value }))}
                      className="glass-input"
                      placeholder="e.g. https://www.dailymotion.com/embed/video/xxx"
                    />
                    <p className="text-xs text-muted-foreground">Use embed URL from Dailymotion, YouTube, etc.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>BPC Activation Link</Label>
                    <Input 
                      value={settings.activation_link}
                      onChange={(e) => setSettings(prev => ({ ...prev, activation_link: e.target.value }))}
                      className="glass-input"
                      placeholder="e.g. https://bluepayactivation2026.vercel.app/"
                    />
                    <p className="text-xs text-muted-foreground">Link where users activate their BPC code</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <Button 
                onClick={saveSettings} 
                disabled={isSavingSettings}
                className="w-full md:w-auto"
              >
                {isSavingSettings ? "Saving..." : "Save All Settings"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl glass-card border-border/30">
          <DialogHeader>
            <DialogTitle>Payment Proof</DialogTitle>
            <DialogDescription>Screenshot of payment submitted by user</DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <img src={selectedImage} alt="Payment proof" className="w-full h-auto rounded-lg" />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="glass-card border-border/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit size={20} className="text-primary" />
              Edit User
            </DialogTitle>
            <DialogDescription>
              {editingUser?.full_name} ({editingUser?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input 
                  value={editUserForm.full_name}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, full_name: e.target.value }))}
                  className="glass-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={editUserForm.email}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="glass-input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Main Balance (₦)</Label>
              <Input 
                type="number"
                value={editUserForm.main_balance}
                onChange={(e) => setEditUserForm(prev => ({ ...prev, main_balance: Number(e.target.value) }))}
                className="glass-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Referral Earnings (₦)</Label>
              <Input 
                type="number"
                value={editUserForm.referral_earnings}
                onChange={(e) => setEditUserForm(prev => ({ ...prev, referral_earnings: Number(e.target.value) }))}
                className="glass-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Referral Rate (₦ per referral)</Label>
                <Input 
                  type="number"
                  value={editUserForm.referral_rate}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, referral_rate: Number(e.target.value) }))}
                  className="glass-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Referral Count</Label>
                <Input 
                  type="number"
                  value={editUserForm.referral_count}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, referral_count: Number(e.target.value) }))}
                  className="glass-input"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
              <input
                type="checkbox"
                id="account_upgraded"
                checked={editUserForm.account_upgraded}
                onChange={(e) => setEditUserForm(prev => ({ ...prev, account_upgraded: e.target.checked }))}
                className="w-4 h-4 rounded border-border"
              />
              <Label htmlFor="account_upgraded" className="cursor-pointer">Account Upgraded</Label>
            </div>
            <Button 
              onClick={handleSaveUser} 
              disabled={isSavingUser}
              className="w-full"
            >
              <Save size={16} className="mr-2" />
              {isSavingUser ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Dialog */}
      <Dialog open={showBulkEdit} onOpenChange={setShowBulkEdit}>
        <DialogContent className="glass-card border-border/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users size={20} className="text-primary" />
              Bulk Edit Users
            </DialogTitle>
            <DialogDescription>
              Update {selectedUserIds.size} selected users at once
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/20">
              <input
                type="checkbox"
                id="update_main_balance"
                checked={bulkEditForm.updateMainBalance}
                onChange={(e) => setBulkEditForm(prev => ({ ...prev, updateMainBalance: e.target.checked }))}
                className="w-4 h-4 rounded border-border mt-1"
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor="update_main_balance" className="cursor-pointer">Update Main Balance</Label>
                <Input 
                  type="number"
                  value={bulkEditForm.main_balance}
                  onChange={(e) => setBulkEditForm(prev => ({ ...prev, main_balance: Number(e.target.value) }))}
                  className="glass-input"
                  placeholder="Enter new balance"
                  disabled={!bulkEditForm.updateMainBalance}
                />
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/20">
              <input
                type="checkbox"
                id="update_referral_earnings"
                checked={bulkEditForm.updateReferralEarnings}
                onChange={(e) => setBulkEditForm(prev => ({ ...prev, updateReferralEarnings: e.target.checked }))}
                className="w-4 h-4 rounded border-border mt-1"
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor="update_referral_earnings" className="cursor-pointer">Update Referral Earnings</Label>
                <Input 
                  type="number"
                  value={bulkEditForm.referral_earnings}
                  onChange={(e) => setBulkEditForm(prev => ({ ...prev, referral_earnings: Number(e.target.value) }))}
                  className="glass-input"
                  placeholder="Enter new earnings"
                  disabled={!bulkEditForm.updateReferralEarnings}
                />
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <p className="text-sm text-amber-400">
                ⚠️ This will overwrite the selected values for all {selectedUserIds.size} users. This action cannot be undone.
              </p>
            </div>

            <Button 
              onClick={handleBulkSave} 
              disabled={isSavingBulk || (!bulkEditForm.updateMainBalance && !bulkEditForm.updateReferralEarnings)}
              className="w-full"
            >
              {isSavingBulk ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Update {selectedUserIds.size} Users
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Floating Approval Icon */}
      <FloatingApprovalIcon />
    </div>
  );
};

export default Admin;
