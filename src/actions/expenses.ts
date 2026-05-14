"use server";

import dbConnect from "@/lib/db";
import Expense from "@/models/Expense";
import Settings from "@/models/Settings";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";

export async function getTodayExpense() {
  await dbConnect();
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  let expense = await Expense.findOne({ date: today }).lean();
  
  if (!expense) {
    // If for some reason today's entry is missing, try to create it from settings
    const settings = await Settings.findOne();
    if (settings) {
      expense = await Expense.findOneAndUpdate(
        { date: today },
        { 
          date: today, 
          limit: settings.dailyBudget, 
          spent: 0, 
          saved: settings.dailyBudget, 
          note: '' 
        },
        { upsert: true, new: true }
      ).lean();
    }
  }

  return JSON.parse(JSON.stringify(expense));
}

export async function saveTodayExpense(spent: number, note?: string) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return saveExpense(today, spent, note);
}

export async function saveExpense(date: string, spent: number, note?: string) {
  await dbConnect();
  
  const currentExpense = await Expense.findOne({ date });
  const limit = currentExpense?.limit || 0;
  const saved = limit - spent;

  const expense = await Expense.findOneAndUpdate(
    { date },
    { spent, saved, note: note || '' },
    { new: true }
  );

  revalidatePath("/");
  revalidatePath("/calendar");
  return JSON.parse(JSON.stringify(expense));
}

export async function getMonthExpenses(monthStr: string) {
  await dbConnect();
  // monthStr is YYYY-MM
  const expenses = await Expense.find({
    date: { $regex: new RegExp(`^${monthStr}`) }
  }).sort({ date: 1 }).lean();

  return JSON.parse(JSON.stringify(expenses));
}

export async function getMonthlySummary(monthStr: string) {
  await dbConnect();
  const now = new Date();
  
  // Use a more robust date string for today in IST/User's likely timezone if possible, 
  // but for now let's ensure the server string is consistent with the database format
  const todayStr = format(now, "yyyy-MM-dd");

  const expenses = await Expense.find({
    date: { $regex: new RegExp(`^${monthStr}`) }
  }).lean();

  const summary = expenses.reduce((acc, curr) => {
    acc.totalSpent += curr.spent || 0;
    
    // Only count realized savings for days that have strictly passed
    // AND only if the user actually entered data (spent > 0 or a note exists)
    // If it's a default placeholder with 0 spent and no note, don't count it.
    const hasEntry = curr.spent > 0 || (curr.note && curr.note.trim() !== "");
    
    if (curr.date < todayStr && hasEntry) {
      acc.totalSaved += curr.saved || 0;
      acc.totalLimitTillNow += curr.limit || 0;
    }
    
    acc.totalLimit += curr.limit || 0;
    return acc;
  }, { totalSpent: 0, totalSaved: 0, totalLimit: 0, totalLimitTillNow: 0 });

  return summary;
}

export async function getExpenseByDate(date: string) {
  await dbConnect();
  const expense = await Expense.findOne({ date }).lean();
  return JSON.parse(JSON.stringify(expense));
}
