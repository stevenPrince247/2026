
import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Transaction } from "../../types/transaction";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const RecentTransactions = ({ transactions }: RecentTransactionsProps) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs font-bold text-primary tracking-wider uppercase">Recent Transactions</h3>
        <Button variant="ghost" className="h-6 px-2 text-primary text-xs hover:bg-primary/10">
          See All <ArrowRight size={12} className="ml-1" />
        </Button>
      </div>
      
      <div className="space-y-3">
        {transactions.slice(0, 3).map(transaction => (
          <div key={transaction.id} className="glass-card p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">{transaction.type}</p>
                <p className="text-xs text-primary">{transaction.amount}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{transaction.date}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                transaction.status === "Completed" 
                  ? "bg-primary/20 text-primary" 
                  : "bg-orange-500/20 text-orange-400"
              }`}>
                {transaction.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;
