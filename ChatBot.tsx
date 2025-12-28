
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatBotProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  showToggleButton?: boolean;
}

const ChatBot = ({ isOpen: controlledOpen, onOpenChange, showToggleButton = true }: ChatBotProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalOpen(open);
    }
  };
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m BluePay Assistant. How can I help you today?',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('bpc') || message.includes('token')) {
      return 'BPC tokens are BluePay\'s reward system. Purchase BPC tokens to increase your daily withdrawal limit up to ₦200,000. You can buy BPC codes for ₦6,200 through the app.';
    }
    
    if (message.includes('withdraw') || message.includes('limit')) {
      return 'Your daily withdrawal limit starts at a base amount and can be increased by purchasing and holding BPC tokens. The maximum daily withdrawal limit is ₦200,000.';
    }
    
    if (message.includes('airtime') || message.includes('data')) {
      return 'You can buy airtime and data for all major networks through BluePay at discounted rates. Just select the service from your dashboard.';
    }
    
    if (message.includes('support') || message.includes('help') || message.includes('contact')) {
      return 'You can reach our support team via:\n• Email: bluepaycustomerservice25@gmail.com\n• Telegram: @Officialbluepay\n• WhatsApp: +2347059382766\n• Live chat through our Telegram bot';
    }
    
    if (message.includes('registration') || message.includes('account') || message.includes('sign up')) {
      return 'To create a BluePay account, click "Create account" on the home page, fill in your details, and set up your PIN. You\'ll get instant access to all features.';
    }
    
    if (message.includes('fee') || message.includes('cost') || message.includes('charge')) {
      return 'BluePay maintains minimal transaction fees to ensure platform sustainability while keeping costs low for our users.';
    }
    
    if (message.includes('security') || message.includes('safe') || message.includes('secure')) {
      return 'BluePay uses advanced security measures including PIN protection, secure bank transfers, and encrypted transactions to keep your funds safe.';
    }
    
    if (message.includes('referral') || message.includes('invite')) {
      return 'Invite friends to BluePay and earn ₦20,000 bonus when they register using your referral link! Share your link and start earning.';
    }
    
    if (message.includes('app') || message.includes('download')) {
      return 'You can download the BluePay mobile app from our website or use the web version. Both offer the same great features and security.';
    }
    
    return 'Thank you for your question! For detailed assistance, please contact our support team at bluepaycustomerservice25@gmail.com or join our Telegram channel @Officialbluepay.';
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputValue),
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button - only show if showToggleButton is true */}
      {showToggleButton && (
        <Button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-20 right-4 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg z-40 transition-all duration-300 ${
            isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
          }`}
          size="icon"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-96 bg-white rounded-lg shadow-xl border z-50 flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">BluePay Assistant</h3>
                <p className="text-xs opacity-90">Online</p>
              </div>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-blue-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-xs rounded-lg p-2 text-sm ${
                      message.isBot
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    <p className="whitespace-pre-line">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.isBot ? 'text-gray-500' : 'text-blue-200'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-2 text-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 text-sm"
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="bg-blue-600 hover:bg-blue-700 h-9 w-9"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
