"use client";

import { useState, useEffect } from "react";
import { getSettings } from "@/actions/settings";
import { getMonthExpenses } from "@/actions/expenses";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, Zap, LucideIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { IExpense } from "@/types";
import { SavingsChart } from "@/components/insights/savings-chart";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";

interface InsightsData {
  averageSpend: number;
  projectedSpent: number;
  isProjectedOver: boolean;
  bestDay: IExpense | null;
  worstDay: IExpense | null;
  savingsData: { date: string; saved: number }[];
}

export default function InsightsPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<InsightsData | null>(null);
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
        const [settings, expenses] = await Promise.all([
          getSettings(user.uid),
          getMonthExpenses(user.uid, currentMonth)
        ]);

        if (!settings) {
          router.push("/onboarding");
          return;
        }

        const todayStr = format(now, "yyyy-MM-dd");
        const pastExpenses = expenses.filter((e: IExpense) => e.date < todayStr);
        const totalSpent = expenses.reduce((acc: number, e: IExpense) => acc + e.spent, 0);
        const daysInMonth = expenses.length;
        const currentDayOfMonth = now.getDate();
        const averageSpend = Math.round(totalSpent / currentDayOfMonth);
        const projectedSpent = averageSpend * daysInMonth;
        const isProjectedOver = projectedSpent > settings.monthlyBudget;
        const bestDay = [...pastExpenses].sort((a, b) => b.saved - a.saved)[0];
        const worstDay = [...pastExpenses].sort((a, b) => a.saved - b.saved)[0];
        const savingsData = expenses.filter((e: IExpense) => e.date < todayStr).map((e: IExpense) => ({
          date: e.date,
          saved: e.saved
        }));

        setData({
          averageSpend,
          projectedSpent,
          isProjectedOver,
          bestDay,
          worstDay,
          savingsData
        });
        setLoading(false);
      };
      loadData();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageWrapper className="flex flex-col space-y-8 p-6 bg-background min-h-screen">
      <div className="space-y-2">
        <h1 className="text-4xl font-medium italic text-primary uppercase">Insights</h1>
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Analyze your spending
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InsightCard 
          label="Avg. Spend/Day" 
          value={`₹${data.averageSpend}`} 
          icon={Zap} 
          description="Based on this month"
        />
        <InsightCard 
          label="Projected End" 
          value={`₹${data.projectedSpent}`} 
          icon={Target} 
          description={data.isProjectedOver ? "Over budget" : "Within budget"}
          status={data.isProjectedOver ? "danger" : "success"}
        />
        {data.bestDay && (
          <InsightCard 
            label="Best Day" 
            value={`₹${data.bestDay.saved}`} 
            icon={TrendingUp} 
            description={format(new Date(data.bestDay.date), "dd MMM")}
            status="success"
          />
        )}
        {data.worstDay && (
          <InsightCard 
            label="Worst Day" 
            value={`₹${Math.abs(data.worstDay.saved)}`} 
            icon={TrendingDown} 
            description={format(new Date(data.worstDay.date), "dd MMM")}
            status={data.worstDay.saved < 0 ? "danger" : "neutral"}
          />
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-medium italic text-foreground uppercase tracking-wider">
          Trends
        </h2>
        <SavingsChart data={data.savingsData} />
      </div>
    </PageWrapper>
  );
}

function InsightCard({ 
  label, 
  value, 
  icon: Icon, 
  description, 
  status = "neutral" 
}: { 
  label: string; 
  value: string; 
  icon: LucideIcon; 
  description: string;
  status?: "success" | "danger" | "neutral";
}) {
  return (
    <Card className="border border-border bg-card">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <Icon className="h-4 w-4 text-primary opacity-50" />
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-medium italic text-foreground">{value}</p>
          <p className={cn(
            "text-[9px] font-medium uppercase tracking-widest",
            status === "success" ? "text-primary" : status === "danger" ? "text-red-500" : "text-muted-foreground"
          )}>
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
