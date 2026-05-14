export interface ISettings {
  _id?: string;
  monthlyBudget: number;
  dailyBudget: number;
  currency: string;
  currentMonth: string;
  theme: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IExpense {
  _id?: string;
  date: string;
  limit: number;
  spent: number;
  saved: number;
  note: string;
  createdAt?: string;
  updatedAt?: string;
}
