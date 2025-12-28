
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/dashboard/Header";
import BottomNavigation from "../components/dashboard/BottomNavigation";

const Faq = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col cosmic-bg text-foreground relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 right-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl animate-float-slow" />
      </div>

      <Header />
      
      <div className="flex-1 p-5 relative z-10 pb-24">
        <div className="mb-4 flex items-center">
          <button onClick={() => navigate("/dashboard")} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-2xl font-bold text-glow">About BLUEPAY</h2>
        </div>

        <div className="glass-card rounded-xl p-6 mb-6">
          <div className="flex justify-center mb-8">
            <img 
              src="/lovable-uploads/9c19c608-d185-4699-b545-9999f7f6fe47.png" 
              alt="BLUEPAY Logo" 
              className="w-40 h-40 object-contain"
            />
          </div>
          
          <div className="space-y-6">
            <div>
              <p className="text-foreground/80 leading-relaxed">
                BLUEPAY is the new and improved version of Blue Pay, offering enhanced features, 
                better security, and a more streamlined user experience. We've taken all the feedback 
                from our users to create the ultimate financial platform.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2 text-primary">Our Mission</h3>
              <p className="text-foreground/80 leading-relaxed">
                BLUEPAY is dedicated to providing seamless financial services to our users. 
                Our mission is to make digital transactions accessible, secure, and rewarding for everyone.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2 text-primary">What We Offer</h3>
              <ul className="list-disc pl-5 space-y-2 text-foreground/80">
                <li>Daily withdrawals up to ₦200,000</li>
                <li>BPC token rewards system</li>
                <li>Airtime and data purchases</li>
                <li>Secure bank transfers</li>
                <li>24/7 customer support</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2 text-primary">How to Buy BPC Code</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-xs font-bold">1</span>
                  </div>
                  <p className="text-foreground/80">Click "Buy BPC" from the dashboard</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-xs font-bold">2</span>
                  </div>
                  <p className="text-foreground/80">Fill in your details and select amount</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-xs font-bold">3</span>
                  </div>
                  <p className="text-foreground/80">Complete payment to receive your BPC code</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-xs font-bold">4</span>
                  </div>
                  <p className="text-foreground/80">Use code for airtime purchases & withdrawals</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2 text-primary">How It Works</h3>
              <p className="text-foreground/80 leading-relaxed">
                BLUEPAY operates on a daily reward system. Users are allocated a daily withdrawal limit which 
                resets every 24 hours. By participating in platform activities and maintaining BPC tokens, 
                users can increase their daily withdrawal limits and earn additional rewards.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 text-primary">Frequently Asked Questions</h3>
          
          <div className="space-y-4">
            <div className="glass-card p-4 rounded-lg">
              <h4 className="font-semibold text-foreground">How do I increase my daily withdrawal limit?</h4>
              <p className="text-foreground/70 mt-1">Purchase and hold BPC tokens to increase your daily withdrawal limit.</p>
            </div>
            
            <div className="glass-card p-4 rounded-lg">
              <h4 className="font-semibold text-foreground">Is BLUEPAY available in all countries?</h4>
              <p className="text-foreground/70 mt-1">Currently, BLUEPAY services are available in selected regions. We're expanding rapidly!</p>
            </div>
            
            <div className="glass-card p-4 rounded-lg">
              <h4 className="font-semibold text-foreground">How do I contact customer support?</h4>
              <p className="text-foreground/70 mt-1">You can reach our support team through the Support section in the app or via our Telegram channel.</p>
            </div>
            
            <div className="glass-card p-4 rounded-lg">
              <h4 className="font-semibold text-foreground">Are there fees for transactions?</h4>
              <p className="text-foreground/70 mt-1">BLUEPAY maintains minimal transaction fees to ensure platform sustainability.</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Faq;
