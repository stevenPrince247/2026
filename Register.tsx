
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useUserStore } from "../stores/userStore";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUserData } = useUserStore();
  const [searchParams] = useSearchParams();
  const [referralCode, setReferralCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    enteredReferralCode: "",
  });

  useEffect(() => {
    const refCode = searchParams.get('ref');
    
    if (refCode) {
      const upperRefCode = refCode.trim().toUpperCase();
      setReferralCode(upperRefCode);
      setFormData((prev) => ({ ...prev, enteredReferralCode: upperRefCode }));
      toast({
        title: "Referral Code Applied!",
        description: `Using referral code: ${upperRefCode}`,
      });
    }
  }, [searchParams, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const passwordValidation = passwordSchema.safeParse(formData.password);
      if (!passwordValidation.success) {
        toast({
          title: "Weak Password",
          description: passwordValidation.error.errors[0].message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signUpError) throw signUpError;

      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      const codeToUse = formData.enteredReferralCode.trim().toUpperCase();
      if (codeToUse) {
        const { error: referralError } = await supabase.rpc("process_referral", {
          referrer_code: codeToUse,
          new_user_id: authData.user.id,
        });

        if (referralError) {
          toast({
            title: "Registration Successful",
            description: "Account created, but referral code could not be applied.",
            variant: "default",
          });
        } else {
          toast({
            title: "Registration Successful!",
            description: `Welcome! Your referrer has been credited.`,
          });
        }
      } else {
        toast({
          title: "Registration Successful!",
          description: "Your account has been created.",
        });
      }

      setUserData({
        fullName: formData.fullName,
        email: formData.email,
      });

      navigate("/dashboard");
    } catch (error: any) {
      const isExistingUser = error?.message?.includes("already registered") || 
                             error?.code === "user_already_exists" ||
                             error?.message?.includes("User already registered");
      
      if (isExistingUser) {
        toast({
          title: "Email Already Registered",
          description: "Redirecting you to the login page...",
        });
        setTimeout(() => {
          navigate("/login", { state: { email: formData.email } });
        }, 1500);
        return;
      }
      
      let errorMessage = "Unable to complete registration. Please try again.";
      if (error?.message?.includes("Invalid email")) {
        errorMessage = "Please enter a valid email address.";
      } else if (error?.message?.includes("Password")) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHelpClick = () => {
    window.open("https://t.me/OfficialChixx9ja", "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col cosmic-bg text-foreground relative overflow-hidden">
      {/* Background effects with floating animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 right-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl animate-float-slow" />
      </div>

      <header className="p-4 relative z-10">
        <button onClick={() => navigate("/")} className="flex items-center text-foreground/80 hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5 mr-2" />
        </button>
        <div className="absolute top-4 right-4">
          <span className="text-primary cursor-pointer text-sm hover:underline" onClick={handleHelpClick}>You Need Help?</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-center p-4 relative z-10">
        <div className="max-w-md w-full mx-auto">
          <h1 className="text-2xl font-bold mb-2 text-primary text-center text-glow">BLUEPAY</h1>
          <h2 className="text-xl font-bold mb-3 text-foreground">Welcome!</h2>
          
          {referralCode && (
            <div className="glass-card border-green-500/30 bg-green-500/10 p-3 mb-4">
              <p className="text-green-400 text-xs">
                🎉 Referral code detected: <span className="font-bold">{referralCode}</span>
              </p>
              <p className="text-green-400/80 text-xs">Your referrer will be credited when you register!</p>
            </div>
          )}
          
          <p className="text-muted-foreground mb-5 text-sm">
            Get your account ready and instantly start buying, selling airtime and data online and start paying all your bills in cheaper price.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="fullName"
              placeholder="Your Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className="glass-input"
              required
            />
            <Input
              name="email"
              type="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              className="glass-input"
              required
            />
            <Input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="glass-input"
              required
            />
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">+234</span>
              <Input
                name="phoneNumber"
                type="tel"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="glass-input pl-14"
                required
              />
            </div>

            <Input
              name="enteredReferralCode"
              placeholder="Referral Code (Optional)"
              value={formData.enteredReferralCode}
              onChange={handleChange}
              className="glass-input uppercase"
              maxLength={6}
            />

            <p className="text-xs text-muted-foreground">
              Any further actions indicates that you agree with our terms & conditions!
            </p>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full glass-button py-3 text-primary-foreground bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 font-bold disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-muted-foreground text-sm">Already have an account? </span>
            <button 
              onClick={() => navigate("/login")} 
              className="text-primary font-medium hover:underline text-sm"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
