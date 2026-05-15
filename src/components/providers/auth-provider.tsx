"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, getRedirectResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Handle redirect result (crucial for WebView flow)
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log("Redirect login successful:", result.user.email);
        }
      } catch (error: any) {
        console.error("Redirect Auth Error:", error);
        if (error.code !== "auth/network-request-failed") {
          toast.error("Login failed. Please try again.");
        }
      }
    };
    handleRedirect();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      if (!user && pathname !== "/login" && pathname !== "/onboarding") {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
