
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Phone, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserStore } from "../stores/userStore";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Broadcast = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialTab = location.state?.tab || "airtime";
  
  const { balance, updateBalance, addTransaction } = useUserStore();
  const [activeTab, setActiveTab] = useState<"airtime" | "data">(initialTab);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState("");
  const [dataBundle, setDataBundle] = useState("");
  const [bpcCode, setBpcCode] = useState("");
  
  const networks = ["MTN", "Airtel", "Glo", "9Mobile"];
  
  const dataBundles = [
    { id: "1", name: "1GB (30 Days)", price: 500 },
    { id: "2", name: "2GB (30 Days)", price: 1000 },
    { id: "3", name: "5GB (30 Days)", price: 2000 },
    { id: "4", name: "10GB (30 Days)", price: 3500 },
    { id: "5", name: "20GB (30 Days)", price: 5000 },
  ];
  
  const selectedBundle = dataBundles.find(bundle => bundle.id === dataBundle);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === "airtime") {
      if (!phoneNumber || !amount || !network || !bpcCode) {
        toast({
          variant: "destructive",
          description: "Please fill in all required fields",
        });
        return;
      }

      if (phoneNumber.length !== 11) {
        toast({
          variant: "destructive",
          description: "Please enter a valid 11-digit phone number",
        });
        return;
      }

      if (bpcCode !== "BPC55262527") {
        toast({
          variant: "destructive",
          description: "Invalid BPC code. Please enter a valid code.",
        });
        return;
      }

      const amountValue = parseFloat(amount);
      
      updateBalance(-amountValue);
      
      addTransaction({
        id: Date.now(),
        type: `${network} Airtime`,
        amount: `-₦${amountValue.toLocaleString()}`,
        date: new Date().toLocaleString(),
        status: "Completed",
        recipient: phoneNumber,
      });
      
      toast({
        description: "Airtime purchase successful!",
      });
    } else {
      if (!phoneNumber || !network || !dataBundle || !bpcCode) {
        toast({
          variant: "destructive",
          description: "Please fill in all required fields",
        });
        return;
      }

      if (phoneNumber.length !== 11) {
        toast({
          variant: "destructive",
          description: "Please enter a valid 11-digit phone number",
        });
        return;
      }

      if (bpcCode !== "BPC55262527") {
        toast({
          variant: "destructive",
          description: "Invalid BPC code. Please enter a valid code.",
        });
        return;
      }

      if (!selectedBundle) {
        toast({
          variant: "destructive",
          description: "Please select a valid data bundle",
        });
        return;
      }

      updateBalance(-selectedBundle.price);
      
      addTransaction({
        id: Date.now(),
        type: `${network} Data Bundle`,
        amount: `-₦${selectedBundle.price.toLocaleString()}`,
        date: new Date().toLocaleString(),
        status: "Completed",
        recipient: phoneNumber,
      });
      
      toast({
        description: "Data purchase successful!",
      });
    }
    
    navigate("/dashboard");
  };

  const resetForm = () => {
    setPhoneNumber("");
    setAmount("");
    setNetwork("");
    setDataBundle("");
    setBpcCode("");
  };

  const handleTabChange = (tab: "airtime" | "data") => {
    setActiveTab(tab);
    resetForm();
  };

  return (
    <div className="min-h-screen flex flex-col cosmic-bg relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <header className="glass-header py-4 px-5 flex items-center sticky top-0 z-20">
        <button onClick={() => navigate("/dashboard")} className="mr-3 text-foreground/80 hover:text-foreground transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-primary text-glow">Broadcast</h1>
      </header>

      {/* Toggle Tabs */}
      <div className="px-4 pt-4 relative z-10">
        <div className="glass-card p-1 flex rounded-xl">
          <button
            onClick={() => handleTabChange("airtime")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
              activeTab === "airtime"
                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Phone className="w-4 h-4" />
            Airtime
          </button>
          <button
            onClick={() => handleTabChange("data")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
              activeTab === "data"
                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Wifi className="w-4 h-4" />
            Data
          </button>
        </div>
      </div>

      <div className="p-4 flex-1 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-muted-foreground mb-2 text-sm">Select Network</label>
            <Select value={network} onValueChange={setNetwork}>
              <SelectTrigger className="glass-input h-12">
                <SelectValue placeholder="Select Network" />
              </SelectTrigger>
              <SelectContent className="glass-card border-border/30">
                {networks.map((net) => (
                  <SelectItem key={net} value={net} className="text-foreground hover:bg-primary/10">
                    {net}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-muted-foreground mb-2 text-sm">Phone Number</label>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="glass-input"
              placeholder="Enter 11-digit phone number"
              maxLength={11}
            />
          </div>
          
          {activeTab === "airtime" ? (
            <div>
              <label className="block text-muted-foreground mb-2 text-sm">Amount</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="glass-input"
                placeholder="Enter amount"
              />
            </div>
          ) : (
            <div>
              <label className="block text-muted-foreground mb-2 text-sm">Data Bundle</label>
              <Select value={dataBundle} onValueChange={setDataBundle}>
                <SelectTrigger className="glass-input h-12">
                  <SelectValue placeholder="Select Data Bundle" />
                </SelectTrigger>
                <SelectContent className="glass-card border-border/30">
                  {dataBundles.map((bundle) => (
                    <SelectItem key={bundle.id} value={bundle.id} className="text-foreground hover:bg-primary/10">
                      {bundle.name} - ₦{bundle.price.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div>
            <label className="block text-muted-foreground mb-2 text-sm">BPC CODE</label>
            <Input
              type="text"
              value={bpcCode}
              onChange={(e) => setBpcCode(e.target.value)}
              className="glass-input"
              placeholder="Enter BPC code"
            />
          </div>
          
          <div className="glass-card p-4 rounded-xl mt-6">
            <p className="text-lg font-bold text-foreground">Available Balance: <span className="text-primary">₦{balance.toLocaleString()}</span></p>
          </div>
          
          <Button 
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 text-base py-6 mt-3 rounded-xl font-semibold"
          >
            {activeTab === "airtime" ? "Purchase Airtime" : "Purchase Data"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Broadcast;
