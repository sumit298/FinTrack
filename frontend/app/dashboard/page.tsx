"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from 'lucide-react';
import ProtectedRoute from '@/components/protectedRoute';
import { useAuth } from '@/lib/context/AuthContext';
import { API_URL } from '@/lib/config';
import BudgetChart from '@/components/charts/BudgetChart';
import PieChart from '@/components/charts/PieChart';

interface Transaction {
  _id: string;
  amount: number;
  type: string;
  categoryId: {
    _id: string;
    name: string;
    type: string;
    color: string;
  };
  date: string;
}

interface Category {
  _id: string;
  name: string;
  type: string;
  color: string;
}

export default function DashboardPage() {
  const { apiCall } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgetComparison, setBudgetComparison] = useState<any[]>([]);
  const [analyticsSummary, setAnalyticsSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      fetchAnalyticsSummary();
      fetchBudgetComparison();
    }
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchTransactions(),
        fetchCategories()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await apiCall(`${API_URL}/transactions`);
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiCall(`${API_URL}/category`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchBudgetComparison = async () => {
    try {
      const response = await apiCall(`${API_URL}/budget/comparison?month=${selectedMonth}&year=${selectedYear}`);
      const data = await response.json();
      if (data.success) {
        setBudgetComparison(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch budget comparison:", error);
    }
  };

  const fetchAnalyticsSummary = async () => {
    try {
      const response = await apiCall(`${API_URL}/analytics/summary?month=${selectedMonth}&year=${selectedYear}`);
      const data = await response.json();
      if (data.success) {
        setAnalyticsSummary(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics summary:", error);
      // Set empty analytics data as fallback
      setAnalyticsSummary({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        categoryBreakdown: []
      });
    }
  };

  // Calculate selected month data
  const selectedMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() + 1 === selectedMonth && 
           transactionDate.getFullYear() === selectedYear;
  });
  
  

  const totalIncome = selectedMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = selectedMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netIncome = totalIncome - totalExpenses;

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          Loading dashboard...
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Financial overview for {new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' })} {selectedYear}
            </p>
          </div>
          
          {/* Month/Year Selectors */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Month:</Label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({length: 12}, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {new Date(0, i).toLocaleString('default', { month: 'short' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Year:</Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({length: 5}, (_, i) => (
                    <SelectItem key={currentYear - 2 + i} value={(currentYear - 2 + i).toString()}>
                      {currentYear - 2 + i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${(analyticsSummary?.totalIncome || totalIncome).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${(analyticsSummary?.totalExpenses || totalExpenses).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
              <DollarSign className={`h-4 w-4 ${(analyticsSummary?.balance || netIncome) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${(analyticsSummary?.balance || netIncome) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${(analyticsSummary?.balance || netIncome).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedMonthTransactions.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Summary */}
        {analyticsSummary?.categoryBreakdown?.length > 0 && (
          <Card className="shadow-premium">
            <CardHeader>
              <CardTitle>Category Breakdown (Analytics)</CardTitle>
              <CardDescription>Detailed spending analysis from analytics engine</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {analyticsSummary.categoryBreakdown.map((item: any) => (
                  <div key={item._id} className="p-4 border rounded-lg">
                    <div className="font-medium mb-2">
                      {item.category[0]?.name || 'Unknown Category'}
                    </div>
                    <div className="text-2xl font-bold">
                      ${item.totalAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.category[0]?.type || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-premium">
            <CardHeader>
              <CardTitle>Budget vs Actual</CardTitle>
              <CardDescription>Current month budget performance</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
              
                
                return budgetComparison.length > 0 ? (
                  <BudgetChart 
                    data={budgetComparison.map(item => ({
                      categoryName: item.categoryName,
                      budgetAmount: item.budgetAmount,
                      spentAmount: item.spentAmount,
                      color: categories.find(c => c._id === item.categoryId)?.color || '#gray'
                    }))}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No budget data available
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          <Card className="shadow-premium">
            <CardHeader>
              <CardTitle>Expense Distribution</CardTitle>
              <CardDescription>Breakdown of expenses by category</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                
                // Always show individual transactions with different colors for better visualization
                const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
                const pieData = selectedMonthTransactions.map((t, index) => ({
                  name: t.categoryId.name,
                  value: t.amount,
                  color: colors[index % colors.length]
                }));
                
        
                
                return pieData.length > 0 ? (
                  <PieChart data={pieData} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No expense data available
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="shadow-premium">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest 5 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedMonthTransactions.length > 0 ? (
              <div className="space-y-3">
                {selectedMonthTransactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map((transaction) => (
                    <div key={transaction._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: transaction.categoryId.color }}
                        />
                        <div>
                          <div className="font-medium">{transaction.categoryId.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className={`font-medium ${transaction.categoryId.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.categoryId.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found for this month
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}