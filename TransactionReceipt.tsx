import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle, XCircle, Clock, Ban } from "lucide-react";

interface TransactionReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: {
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
  } | null;
}

const TransactionReceipt: React.FC<TransactionReceiptProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!transaction) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-NG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-8 w-8 text-green-400" />;
      case "rejected":
        return <XCircle className="h-8 w-8 text-red-400" />;
      case "cancelled":
        return <Ban className="h-8 w-8 text-orange-400" />;
      default:
        return <Clock className="h-8 w-8 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-400";
      case "rejected":
        return "text-red-400";
      case "cancelled":
        return "text-orange-400";
      default:
        return "text-yellow-400";
    }
  };

  const handleDownload = () => {
    const receiptContent = receiptRef.current;
    if (!receiptContent) return;

    // Create a canvas to render the receipt
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 400;
    canvas.height = 600;

    // Draw background
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Draw header
    ctx.fillStyle = "#3b82f6";
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "center";
    ctx.fillText("BLUEPAY", canvas.width / 2, 60);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "14px Arial";
    ctx.fillText("Transaction Receipt", canvas.width / 2, 85);

    // Draw divider
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 110);
    ctx.lineTo(canvas.width - 30, 110);
    ctx.stroke();

    // Transaction Type
    ctx.fillStyle = "#f1f5f9";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      transaction.type === "withdrawal" ? "WITHDRAWAL" : "BPC PURCHASE",
      canvas.width / 2,
      145
    );

    // Status
    ctx.fillStyle =
      transaction.status === "approved"
        ? "#4ade80"
        : transaction.status === "rejected"
        ? "#f87171"
        : transaction.status === "cancelled"
        ? "#fb923c"
        : "#facc15";
    ctx.font = "bold 16px Arial";
    ctx.fillText(transaction.status.toUpperCase(), canvas.width / 2, 175);

    // Draw details
    ctx.textAlign = "left";
    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px Arial";
    let yPos = 220;

    const drawDetail = (label: string, value: string) => {
      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px Arial";
      ctx.fillText(label, 40, yPos);
      ctx.fillStyle = "#f1f5f9";
      ctx.font = "14px Arial";
      ctx.fillText(value, 40, yPos + 20);
      yPos += 50;
    };

    drawDetail("Transaction ID", transaction.id.slice(0, 8).toUpperCase());
    drawDetail("Amount", `₦${transaction.amount.toLocaleString()}`);
    drawDetail("Date & Time", formatDate(transaction.date));

    if (transaction.type === "withdrawal") {
      if (transaction.details.bankName) {
        drawDetail("Bank", transaction.details.bankName);
      }
      if (transaction.details.accountName) {
        drawDetail("Account Name", transaction.details.accountName);
      }
      if (transaction.details.accountNumber) {
        drawDetail("Account Number", transaction.details.accountNumber);
      }
    } else {
      if (transaction.details.fullName) {
        drawDetail("Name", transaction.details.fullName);
      }
      if (transaction.details.email) {
        drawDetail("Email", transaction.details.email);
      }
      if (transaction.details.bpcCode) {
        drawDetail("BPC Code", transaction.details.bpcCode);
      }
    }

    // Draw footer
    ctx.strokeStyle = "#334155";
    ctx.beginPath();
    ctx.moveTo(30, canvas.height - 80);
    ctx.lineTo(canvas.width - 30, canvas.height - 80);
    ctx.stroke();

    ctx.fillStyle = "#64748b";
    ctx.font = "11px Arial";
    ctx.textAlign = "center";
    ctx.fillText("bluepay2026.lovable.app", canvas.width / 2, canvas.height - 50);
    ctx.fillText("Thank you for using BluePay", canvas.width / 2, canvas.height - 30);

    // Download the image
    const link = document.createElement("a");
    link.download = `BluePay-Receipt-${transaction.id.slice(0, 8)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto glass-card border-primary/30 p-0 overflow-hidden">
        <div ref={receiptRef} className="p-6">
          {/* Header */}
          <DialogHeader className="text-center mb-4">
            <DialogTitle className="text-2xl font-bold text-primary">
              BLUEPAY
            </DialogTitle>
            <p className="text-sm text-muted-foreground">Transaction Receipt</p>
          </DialogHeader>

          <div className="border-t border-border/30 my-4" />

          {/* Transaction Type & Status */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-2">
              {getStatusIcon(transaction.status)}
            </div>
            <h3 className="text-lg font-bold">
              {transaction.type === "withdrawal" ? "Withdrawal" : "BPC Purchase"}
            </h3>
            <p className={`text-sm font-semibold uppercase ${getStatusColor(transaction.status)}`}>
              {transaction.status}
            </p>
          </div>

          {/* Amount */}
          <div className="glass-card p-4 rounded-xl text-center mb-4 border border-primary/20">
            <p className="text-sm text-muted-foreground mb-1">Amount</p>
            <p className="text-3xl font-bold text-primary">
              ₦{transaction.amount.toLocaleString()}
            </p>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-mono text-foreground">
                {transaction.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Date & Time</span>
              <span className="text-foreground text-right text-xs">
                {formatDate(transaction.date)}
              </span>
            </div>

            {transaction.type === "withdrawal" && (
              <>
                {transaction.details.bankName && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bank</span>
                    <span className="text-foreground">{transaction.details.bankName}</span>
                  </div>
                )}
                {transaction.details.accountName && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Account Name</span>
                    <span className="text-foreground">{transaction.details.accountName}</span>
                  </div>
                )}
                {transaction.details.accountNumber && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Account Number</span>
                    <span className="text-foreground">{transaction.details.accountNumber}</span>
                  </div>
                )}
              </>
            )}

            {transaction.type === "bpc_purchase" && (
              <>
                {transaction.details.fullName && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Name</span>
                    <span className="text-foreground">{transaction.details.fullName}</span>
                  </div>
                )}
                {transaction.details.email && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Email</span>
                    <span className="text-foreground text-xs">{transaction.details.email}</span>
                  </div>
                )}
                {transaction.details.bpcCode && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">BPC Code</span>
                    <span className="font-mono text-primary font-bold">
                      {transaction.details.bpcCode}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="border-t border-border/30 my-4" />

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground mb-4">
            <p>bluepay2026.lovable.app</p>
            <p>Thank you for using BluePay</p>
          </div>

          {/* Download Button */}
          <Button
            onClick={handleDownload}
            className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionReceipt;
