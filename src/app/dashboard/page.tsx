"use client";

import { useState, useEffect } from "react";
import { getSettings } from "@/actions/settings";
import { getTodayExpense, getMonthlySummary, getStreak } from "@/actions/expenses";
import { TodayCard } from "@/components/dashboard/today-card";
import { SpendInput } from "@/components/dashboard/spend-input";
import { MonthlySummary } from "@/components/dashboard/monthly-summary";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useAuth } from "@/components/providers/auth-provider";
import { Flame } from "lucide-react";

import { ISettings, IExpense } from "@/types";

interface DashboardData {
  settings: ISettings;
  todayExpense: IExpense;
  summary: {
    totalSpent: number;
    totalSaved: number;
    totalLimit: number;
    totalLimitTillNow: number;
  };
  streak: number;
  now: Date;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      const loadData = async () => {
        const now = new Date();
        const currentMonth = format(now, "yyyy-MM");
        const [settings, todayExpense, summary, streak] = await Promise.all([
          getSettings(user.uid),
          getTodayExpense(user.uid),
          getMonthlySummary(user.uid, currentMonth),
          getStreak(user.uid)
        ]);

        if (!settings) {
          router.push("/onboarding");
          return;
        }

        setData({ settings, todayExpense, summary, streak, now });
        setLoading(false);
      };
      loadData();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading || !data) {
    return (
      <PageWrapper className="flex flex-col min-h-screen bg-background px-6 pt-8 pb-24 space-y-12">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-muted/20 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 shimmer" />
          </div>
          <div className="h-8 w-24 bg-muted/20 rounded-full relative overflow-hidden">
            <div className="absolute inset-0 shimmer" />
          </div>
        </div>

        {/* Date Skeleton */}
        <div className="space-y-3">
          <div className="h-3 w-12 bg-primary/10 rounded relative overflow-hidden">
            <div className="absolute inset-0 shimmer" />
          </div>
          <div className="h-10 w-48 bg-muted/20 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 shimmer" />
          </div>
        </div>

        {/* Card Skeleton */}
        <div className="h-48 w-full bg-card/50 rounded-[2.5rem] border border-border relative overflow-hidden">
          <div className="absolute inset-0 shimmer" />
        </div>

        {/* Input Skeleton */}
        <div className="h-20 w-full bg-muted/10 rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 shimmer" />
        </div>

        {/* Summary Skeleton */}
        <div className="space-y-4">
          <div className="h-6 w-32 bg-muted/20 rounded relative overflow-hidden">
            <div className="absolute inset-0 shimmer" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 w-full bg-card/50 rounded-2xl border border-border relative overflow-hidden">
              <div className="absolute inset-0 shimmer" />
            </div>
            <div className="h-24 w-full bg-card/50 rounded-2xl border border-border relative overflow-hidden">
              <div className="absolute inset-0 shimmer" />
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="flex flex-col min-h-screen bg-background px-6 pt-8 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-xl font-black tracking-tighter text-foreground lowercase"
        style={{ 
              textShadow: '0 0 10px rgba(200, 241, 53, 0.5), 0 0 40px rgba(200, 241, 53, 0.2)' 
            }}
        >
          EXPENSER
        </h2>

        {data.streak >= 0 && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-[#c8f135]/20 backdrop-blur-md shadow-[0_0_15px_rgba(200,241,53,0.1)]">
            <Flame className="h-3.5 w-3.5 text-[#c8f135] fill-[#c8f135]/20" />
            <span className="text-[10px] font-bold text-foreground tracking-tighter">
              {data.streak} DAY STREAK
            </span>
          </div>
        )}
      </div>

      {/* Date Section */}
      <div className="mb-8 space-y-1">
        <p className="text-[10px] font-medium uppercase tracking-widest text-primary">
          TODAY
        </p>
        <h1 className="text-3xl font-medium italic text-primary leading-tight">
          {format(data.now, "d MMM yyyy")}
        </h1>
      </div>

      <div className="space-y-10">
        <TodayCard expense={data.todayExpense} />

        <div className="space-y-4">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground ml-1">
            ENTER TODAY&apos;S SPENDING
          </p>
          <SpendInput 
            userId={user!.uid}
            initialSpent={data.todayExpense.spent} 
            initialNote={data.todayExpense.note} 
          />
        </div>

        <div className="space-y-6">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground ml-1">
            MONTHLY SUMMARY
          </p>
          <MonthlySummary 
            summary={data.summary} 
            monthlyBudget={data.settings.monthlyBudget} 
          />
        </div>
      </div>
    </PageWrapper>
  );
}
