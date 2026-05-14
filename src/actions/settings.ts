"use server";

import dbConnect from "@/lib/db";
import Settings from "@/models/Settings";
import Expense from "@/models/Expense";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  await dbConnect();
  const settings = await Settings.findOne().lean();
  return JSON.parse(JSON.stringify(settings));
}

export async function saveSettings(data: {
  monthlyBudget: number;
  currency?: string;
  theme?: string;
}) {
  await dbConnect();

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  // Calculate days in current month
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dailyBudget = Math.round(data.monthlyBudget / daysInMonth);

  const updatedSettings = await Settings.findOneAndUpdate(
    {},
    {
      ...data,
      dailyBudget,
      currentMonth,
      theme: data.theme || 'dark',
      currency: data.currency || 'INR'
    },
    { upsert: true, new: true }
  );

  // Generate month entries if they don't exist
  await generateMonthEntries(currentMonth, dailyBudget);

  revalidatePath("/");
  return JSON.parse(JSON.stringify(updatedSettings));
}

export async function generateMonthEntries(monthStr: string, dailyBudget: number) {
  await dbConnect();
  
  const [year, month] = monthStr.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();

  const entries = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    entries.push({
      date,
      limit: dailyBudget,
      spent: 0,
      saved: dailyBudget,
      note: ''
    });
  }

  // Use bulkWrite for efficiency with aggregation pipeline to update limit and recalculate saved
  const operations = entries.map(entry => ({
    updateOne: {
      filter: { date: entry.date },
      update: [
        { 
          $set: { 
            limit: dailyBudget,
            spent: { $ifNull: ["$spent", 0] },
            note: { $ifNull: ["$note", ""] }
          } 
        },
        { 
          $set: { 
            saved: { $subtract: ["$limit", "$spent"] } 
          } 
        }
      ],
      upsert: true
    }
  }));

  await Expense.bulkWrite(operations);
}

export async function updateTheme(theme: string) {
  await dbConnect();
  await Settings.findOneAndUpdate({}, { theme });
  revalidatePath("/");
}

export async function resetMonth() {
  await dbConnect();
  const settings = await Settings.findOne();
  if (!settings) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const currentMonth = `${year}-${String(month).padStart(2, '0')}`;
  
  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyBudget = Math.round(settings.monthlyBudget / daysInMonth);

  // Update settings
  await Settings.findOneAndUpdate({}, { dailyBudget, currentMonth });

  // Clear all entries for this month
  const entries = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    entries.push({
      date,
      limit: dailyBudget,
      spent: 0,
      saved: dailyBudget,
      note: ''
    });
  }

  // Clear and regenerate
  await Expense.deleteMany({ date: { $regex: `^${currentMonth}` } });
  await Expense.insertMany(entries);
  
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  revalidatePath("/insights");
}
