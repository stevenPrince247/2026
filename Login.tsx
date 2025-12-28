import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useUserStore } from "../stores/userStore";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { setUserData } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  
  // Get email from navigation state (when redirected from Register)
  const emailFromState = (location.state as { email?: string })?.email || "";
  
  const [formData, setFormData] = useState({
    email: emailFromState,
    password: "",
  });

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile) {
          setUserData({
            fullName: profile.full_name || '',
            email: profile.email || session.user.email || '',
            profileImage: profile.profile_image || undefined,
          });
        }
        navigate("/dashboard");
      }
    };
    checkSession();
  }, [navigate, setUserData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please try again.');
        }
        throw signInError;
      }

      if (!authData.user) {
        throw new Error("Failed to sign in");
      }

      // Fetch user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
      }

      if (profile) {
        setUserData({
          fullName: profile.full_name || '',
          email: profile.email || authData.user.email || '',
          profileImage: profile.profile_image || undefined,
        });
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message || "Unable to sign in. Please check your credentials.",
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
          <h2 className="text-xl font-bold mb-3 text-foreground">Welcome Back!</h2>
          
          <p className="text-muted-foreground mb-5 text-sm">
            Sign in to your account to continue using BLUEPAY.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full glass-button py-3 text-primary-foreground bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 font-bold disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-muted-foreground text-sm">Don't have an account? </span>
            <button 
              onClick={() => navigate("/register")} 
              className="text-primary font-medium hover:underline text-sm"
            >
              Create account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
