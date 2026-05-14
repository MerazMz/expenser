import { getSettings } from "@/actions/settings";
import { getMonthExpenses } from "@/actions/expenses";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, Zap, LucideIcon } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { IExpense } from "@/types";

import { SavingsChart } from "@/components/insights/savings-chart";

export default async function InsightsPage() {
  const settings = await getSettings();
  if (!settings) return null;

  const now = new Date();
  const currentMonth = format(now, "yyyy-MM");
  const expenses: IExpense[] = await getMonthExpenses(currentMonth);

  const todayStr = format(now, "yyyy-MM-dd");
  const pastExpenses = expenses.filter(e => e.date < todayStr);

  const totalSpent = expenses.reduce((acc, e) => acc + e.spent, 0);
  const daysInMonth = expenses.length;
  const currentDayOfMonth = now.getDate();
  const averageSpend = Math.round(totalSpent / currentDayOfMonth);
  
  const projectedSpent = averageSpend * daysInMonth;
  const isProjectedOver = projectedSpent > settings.monthlyBudget;

  const bestDay = [...pastExpenses].sort((a, b) => b.saved - a.saved)[0];
  const worstDay = [...pastExpenses].sort((a, b) => a.saved - b.saved)[0];

  // Savings Trend Data (Only up to yesterday)
  const savingsData = expenses
    .filter(e => e.date < todayStr)
    .map(e => ({
      date: e.date,
      saved: e.saved
    }));

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
          value={`₹${averageSpend}`} 
          icon={Zap} 
          description="Based on this month"
        />
        <InsightCard 
          label="Projected End" 
          value={`₹${projectedSpent}`} 
          icon={Target} 
          description={isProjectedOver ? "Over budget" : "Within budget"}
          status={isProjectedOver ? "danger" : "success"}
        />
        {bestDay && (
          <InsightCard 
            label="Best Day" 
            value={`₹${bestDay.saved}`} 
            icon={TrendingUp} 
            description={format(new Date(bestDay.date), "dd MMM")}
            status="success"
          />
        )}
        {worstDay && (
          <InsightCard 
            label="Worst Day" 
            value={`₹${Math.abs(worstDay.saved)}`} 
            icon={TrendingDown} 
            description={format(new Date(worstDay.date), "dd MMM")}
            status={worstDay.saved < 0 ? "danger" : "neutral"}
          />
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-medium italic text-foreground uppercase tracking-wider">
          Trends
        </h2>
        <SavingsChart data={savingsData} />
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
