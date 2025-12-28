import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send, MessageSquare, Wallet } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SendNotificationForm = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"admin" | "cashout">("admin");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      toast({
        variant: "destructive",
        description: "Please fill in all fields",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Send notification to all users (user_id = null means broadcast)
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: null,
          type,
          title: title.trim(),
          message: message.trim(),
        });

      if (error) throw error;

      toast({
        description: "Notification sent successfully!",
      });

      setTitle("");
      setMessage("");
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        variant: "destructive",
        description: "Failed to send notification",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-4 rounded-xl">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <Send size={18} className="text-primary" />
        Send Notification
      </h3>
      
      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Type</label>
          <Select value={type} onValueChange={(value: "admin" | "cashout") => setType(value)}>
            <SelectTrigger className="glass-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-card border-border/30">
              <SelectItem value="admin" className="text-foreground hover:bg-primary/10">
                <div className="flex items-center gap-2">
                  <MessageSquare size={14} />
                  Admin Message
                </div>
              </SelectItem>
              <SelectItem value="cashout" className="text-foreground hover:bg-primary/10">
                <div className="flex items-center gap-2">
                  <Wallet size={14} />
                  Cashout Update
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-1">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notification title"
            className="glass-input"
          />
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-1">Message</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message..."
            className="glass-input min-h-[100px]"
          />
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground"
        >
          {isLoading ? "Sending..." : "Send to All Users"}
        </Button>
      </form>
    </div>
  );
};

export default SendNotificationForm;
