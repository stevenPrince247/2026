
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";

const DataPurchase = () => {
  const navigate = useNavigate();
  const { balance, updateBalance, addTransaction } = useUserStore();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [network, setNetwork] = useState("");
  const [dataBundle, setDataBundle] = useState("");
  const [bpcCode, setBpcCode] = useState("");
  const [validBpcCode, setValidBpcCode] = useState<string | null>(null);
  
  const networks = ["MTN", "Airtel", "Glo", "9Mobile"];
  
  const dataBundles = [
    { id: "1", name: "1GB (30 Days)", price: 500 },
    { id: "2", name: "2GB (30 Days)", price: 1000 },
    { id: "3", name: "5GB (30 Days)", price: 2000 },
    { id: "4", name: "10GB (30 Days)", price: 3500 },
    { id: "5", name: "20GB (30 Days)", price: 5000 },
  ];
  
  const selectedBundle = dataBundles.find(bundle => bundle.id === dataBundle);

  // Fetch the valid BPC code from admin settings
  useEffect(() => {
    const fetchBpcCode = async () => {
      const { data } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'bpc_code')
        .single();
      
      if (data) {
        setValidBpcCode(data.setting_value);
      }
    };
    fetchBpcCode();
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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

    if (!validBpcCode || bpcCode !== validBpcCode) {
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
    
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col cosmic-bg relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-primary/5 rounded-full blur-2xl animate-float-slow" />
      </div>

      <header className="glass-header py-4 px-5 flex items-center sticky top-0 z-20">
        <button onClick={() => navigate("/dashboard")} className="mr-3 text-foreground/80 hover:text-foreground transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-primary text-glow">Buy Data Bundle</h1>
      </header>

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
            Purchase Data
          </Button>
        </form>
      </div>
    </div>
  );
};

export default DataPurchase;
