import React, { useState, useEffect } from "react";
import { ArrowLeft, History, Filter, Download, FileText, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import TransactionReceipt from "@/components/TransactionReceipt";

interface Transaction {
  id: string;
  type: "withdrawal" | "bpc_purchase";
  amount: number;
  status: string;
  date: string;
  details: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    bpcCode?: string;
    email?: string;
    fullName?: string;
  };
}

const TransactionHistory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      // Fetch withdrawals
      const { data: withdrawals, error: wError } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (wError) throw wError;

      // Fetch BPC purchases
      const { data: bpcPurchases, error: bError } = await supabase
        .from("bpc_purchases")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (bError) throw bError;

      // Map withdrawals to transaction format
      const withdrawalTransactions: Transaction[] = (withdrawals || []).map((w) => ({
        id: w.id,
        type: "withdrawal" as const,
        amount: w.withdrawal_amount || w.amount,
        status: w.status || "pending",
        date: w.created_at,
        details: {
          bankName: w.bank_name,
          accountName: w.account_name,
          accountNumber: w.account_number,
        },
      }));

      // Map BPC purchases to transaction format
      const bpcTransactions: Transaction[] = (bpcPurchases || []).map((b) => ({
        id: b.id,
        type: "bpc_purchase" as const,
        amount: b.amount,
        status: b.status || "pending",
        date: b.created_at,
        details: {
          bpcCode: b.bpc_code || undefined,
          email: b.email,
          fullName: b.full_name,
        },
      }));

      // Combine and sort by date
      const allTransactions = [...withdrawalTransactions, ...bpcTransactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setTransactions(allTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/20 text-green-400";
      case "rejected":
        return "bg-red-500/20 text-red-400";
      case "cancelled":
        return "bg-orange-500/20 text-orange-400";
      default:
        return "bg-yellow-500/20 text-yellow-400";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openReceipt = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsReceiptOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen cosmic-bg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

      <header className="glass-header py-3 px-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-2 hover:bg-primary/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-glow">Transaction History</h1>
          </div>
          <Button variant="ghost" size="icon" className="hover:bg-primary/20">
            <Filter className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="p-4 relative z-10">
        <Card className="glass-card p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold mb-1">All Transactions</h3>
              <p className="text-xs text-muted-foreground">
                {transactions.length} total transactions
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-2">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <Card key={transaction.id} className="glass-card p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">
                        {transaction.type === "withdrawal" ? "Withdrawal" : "BPC Purchase"}
                      </h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {transaction.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(transaction.date)}
                    </p>
                    {transaction.type === "withdrawal" && transaction.details.bankName && (
                      <p className="text-xs text-muted-foreground">
                        {transaction.details.bankName} - {transaction.details.accountNumber}
                      </p>
                    )}
                    {transaction.type === "bpc_purchase" && transaction.details.bpcCode && (
                      <p className="text-xs text-primary font-mono">
                        Code: {transaction.details.bpcCode}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <p className="font-bold text-sm text-primary">
                      ₦{transaction.amount.toLocaleString()}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openReceipt(transaction)}
                      className="text-xs h-7 px-2 glass-button"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Receipt
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="glass-card p-6 text-center">
              <History className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-base font-semibold mb-2">No Transactions Yet</h3>
              <p className="text-xs text-muted-foreground">
                Your transaction history will appear here
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Transaction Receipt Modal */}
      <TransactionReceipt
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        transaction={selectedTransaction}
      />
    </div>
  );
};

export default TransactionHistory;
