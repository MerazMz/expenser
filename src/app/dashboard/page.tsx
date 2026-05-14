import { getSettings } from "@/actions/settings";
import { getTodayExpense, getMonthlySummary } from "@/actions/expenses";
import { TodayCard } from "@/components/dashboard/today-card";
import { SpendInput } from "@/components/dashboard/spend-input";
import { MonthlySummary } from "@/components/dashboard/monthly-summary";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { redirect } from "next/navigation";
import { Menu, RotateCcw } from "lucide-react";
import { format } from "date-fns";

export default async function DashboardPage() {
  const settings = await getSettings();
  if (!settings) {
    redirect("/onboarding");
  }

  const todayExpense = await getTodayExpense();
  const now = new Date();
  const currentMonth = format(now, "yyyy-MM");
  const summary = await getMonthlySummary(currentMonth);

  return (
    <PageWrapper className="flex flex-col min-h-screen bg-background px-6 pt-8 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-xl font-black tracking-tighter text-foreground lowercase">
          Expenser
        </h2>
      </div>

      {/* Date Section */}
      <div className="mb-8 space-y-1">
        <p className="text-[10px] font-medium uppercase tracking-widest text-primary">
          TODAY
        </p>
        <h1 className="text-3xl font-medium italic text-primary leading-tight">
          {format(now, "d MMM yyyy")}
        </h1>
      </div>

      <div className="space-y-10">
        <TodayCard expense={todayExpense} />

        <div className="space-y-4">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground ml-1">
            ENTER TODAY'S SPENDING
          </p>
          <SpendInput 
            initialSpent={todayExpense.spent} 
            initialNote={todayExpense.note} 
          />
        </div>

        <div className="space-y-6">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground ml-1">
            MONTHLY SUMMARY
          </p>
          <MonthlySummary 
            summary={summary} 
            monthlyBudget={settings.monthlyBudget} 
          />
        </div>
      </div>
    </PageWrapper>
  );
}
