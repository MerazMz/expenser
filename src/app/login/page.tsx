"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import { handleGoogleLogin } from "@/lib/googleLogin";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard");
      }
      setInitializing(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await handleGoogleLogin();
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageWrapper className="fixed inset-0 flex flex-col items-center justify-center bg-background px-6 overflow-hidden">
      <div className="w-full max-w-sm space-y-12 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          <h1 
            className="text-5xl font-black tracking-tighter lowercase italic"
            style={{ 
              color: '#c8f135',
              textShadow: '0 0 20px rgba(200, 241, 53, 0.5), 0 0 40px rgba(200, 241, 53, 0.2)' 
            }}
          >
            expenser
          </h1>
          <p className="text-[10px] font-medium capitalize tracking-[0.0em] text-muted-foreground opacity-60">
            PERSONAL FINANCE REDEFINED
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-6"
        >
          <div className="rounded-[2.5rem] border border-border bg-card p-10 space-y-8 shadow-2xl shadow-black/20">
            <div className="space-y-2">
              <h2 className="text-xl font-medium italic text-foreground">Welcome Back</h2>
              <p className="text-[10px] uppercase font-medium text-muted-foreground tracking-widest">
                Sign in to sync your data
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="relative h-16 w-full rounded-[2rem] bg-black/40 backdrop-blur-xl border border-[#c8f135]/30 hover:border-[#c8f135] text-foreground transition-all duration-500 font-bold uppercase tracking-[0.15em] flex items-center justify-center space-x-3 group shadow-2xl shadow-black/50"
                style={{
                   boxShadow: '0 0 20px rgba(200, 241, 53, 0.05)'
                }}
              >
                {/* Glowing Background Effect on Hover */}
                <div className="absolute inset-0 rounded-[2rem] bg-[#c8f135]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-[#c8f135]" />
                ) : (
                  <>
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 group-hover:border-[#c8f135]/50 transition-colors">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </div>
                    <span className="relative text-xs">Continue with Google</span>
                  </>
                )}
              </Button>
            </motion.div>
          </div>

          <p className="text-[9px] uppercase font-medium text-muted-foreground/40 tracking-[0.1em]">
            By continuing you agree to the minimalist terms
          </p>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
