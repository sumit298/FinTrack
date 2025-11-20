"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, TrendingUp, TrendingDown, AlertCircle, Edit, Trash2 } from 'lucide-react';
import ProtectedRoute from '@/components/protectedRoute';
import { useAuth } from '@/lib/context/AuthContext';
import { API_URL } from '@/lib/config';
import toast from 'react-hot-toast';
import BudgetChart from '@/components/charts/BudgetChart';
import PieChart from '@/components/charts/PieChart';

interface Budget {
  _id: string;
  categoryId: {
    _id: string;
    name: string;
    type: string;
    color: string;
  };
  amount: number;
  month: number;
  year: number;
}

interface Category {
  _id: string;
  name: string;
  type: string;
  color: string;
}

interface Transaction {
  _id: string;
  amount: number;
  description: string;
  categoryId: {
    _id: string;
    name: string;
    type: string;
  };
  date: string;
}

export default function BudgetPage() {
  const { apiCall } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetComparison, setBudgetComparison] = useState<any[]>([]);
  const [currentMonthBudgets, setCurrentMonthBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    month: currentMonth,
    year: currentYear
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchBudgets(),
        fetchCategories(),
        fetchTransactions(),
        fetchCurrentMonthBudgets(),
        fetchBudgetComparison()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgets = async () => {
    try {
      const response = await apiCall(`${API_URL}/budget`);
      const data = await response.json();
      if (data.success) {
        setBudgets(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch budgets:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiCall(`${API_URL}/category`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data.filter((cat: Category) => cat.type === 'expense'));
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await apiCall(`${API_URL}/transactions`);
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data.filter((t: Transaction) => t.categoryId?.type === 'expense'));
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };

  const fetchCurrentMonthBudgets = async () => {
    try {
      const response = await apiCall(`${API_URL}/budget/current-month`);
      const data = await response.json();
      if (data.success) {
        setCurrentMonthBudgets(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch current month budgets:", error);
    }
  };

  const fetchBudgetComparison = async () => {
    try {
      const response = await apiCall(`${API_URL}/budget/comparison`);
      const data = await response.json();
      if (data.success) {
        setBudgetComparison(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch budget comparison:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingBudget 
        ? `${API_URL}/budget/${editingBudget._id}`
        : `${API_URL}/budget`;
      
      const method = editingBudget ? "PUT" : "POST";
      
      const response = await apiCall(url, {
        method,
        headers: {
            "Content-Type": "application/json"
          },
        body: JSON.stringify({
          ...formData,
          
          amount: parseFloat(formData.amount)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Budget ${editingBudget ? 'updated' : 'created'} successfully`);
        fetchBudgets();
        setIsAddDialogOpen(false);
        setEditingBudget(null);
        resetForm();
      } else {
        toast.error(data.message || "Failed to save budget");
      }
    } catch (error) {
      console.error("Error saving budget:", error);
      toast.error("Failed to save budget");
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      categoryId: budget.categoryId._id,
      amount: budget.amount.toString(),
      month: budget.month,
      year: budget.year
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this budget?")) return;
    
    try {
      const response = await apiCall(`${API_URL}/budget/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("Budget deleted successfully");
        fetchBudgets();
      } else {
        toast.error("Failed to delete budget");
      }
    } catch (error) {
      console.error("Error deleting budget:", error);
      toast.error("Failed to delete budget");
    }
  };

  const resetForm = () => {
    setFormData({
      categoryId: '',
      amount: '',
      month: currentMonth,
      year: currentYear
    });
  };

  // Calculate budget data for selected month/year
  const selectedMonthBudgets = budgets.filter(b => b.month === selectedMonth && b.year === selectedYear);
  
  // Filter transactions for selected month/year
  const selectedMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() + 1 === selectedMonth && 
           transactionDate.getFullYear() === selectedYear;
  });
  
  // Filter data based on selected category
  const filteredBudgets = selectedCategoryId === 'all' 
    ? selectedMonthBudgets 
    : selectedMonthBudgets.filter(b => b.categoryId?._id === selectedCategoryId);
  
  const filteredTransactions = selectedCategoryId === 'all'
    ? selectedMonthTransactions
    : selectedMonthTransactions.filter(t => t.categoryId._id === selectedCategoryId);

  // Get category IDs that have budgets
  const budgetedCategoryIds = filteredBudgets.map(b => b.categoryId._id);
  
  const totalBudget = filteredBudgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = filteredTransactions
    .filter(t => budgetedCategoryIds.includes(t.categoryId._id))
    .reduce((sum, t) => sum + t.amount, 0);
  const budgetUsedPercent = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const isOverBudget = totalSpent > totalBudget;

  // Category breakdown
  const categoryData = filteredBudgets.map(budget => {
    const spent = filteredTransactions
      .filter(t => t.categoryId._id === budget.categoryId?._id)
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      budget,
      spent,
      remaining: budget.amount - spent,
      percentUsed: budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0,
      isOverBudget: spent > budget.amount
    };
 
  });

  // Get selected category info
  const selectedCategory = selectedCategoryId === 'all' 
    ? null 
    : categories.find(c => c._id === selectedCategoryId);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          Loading budgets...
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Budget Management</h1>
            <p className="text-muted-foreground mt-1">Set and track your monthly spending limits</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="gap-2 cursor-pointer" >
                <Plus className="h-4 w-4" />
                Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingBudget ? 'Edit Budget' : 'Add New Budget'}
                </DialogTitle>
                <DialogDescription>
                  Set spending limit for a category
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData({...formData, categoryId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Month</Label>
                    <Select value={formData.month.toString()} onValueChange={(value) => setFormData({...formData, month: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 12}, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Select value={formData.year.toString()} onValueChange={(value) => setFormData({...formData, year: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 5}, (_, i) => (
                          <SelectItem key={currentYear + i} value={(currentYear + i).toString()}>
                            {currentYear + i}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingBudget(null);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" className='cursor-pointer'>
                    {editingBudget ? 'Update' : 'Add'} Budget
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Category:</Label>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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

        {/* D3.js Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-premium">
            <CardHeader>
              <CardTitle>Budget vs Actual</CardTitle>
              <CardDescription>Visual comparison of budgeted vs spent amounts</CardDescription>
            </CardHeader>
            <CardContent>
              {budgetComparison.length > 0 ? (
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
                  No budget data available for chart
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-premium">
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>Distribution of expenses by category</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
                const pieData = filteredTransactions.map((t, index) => ({
                  name: t.categoryId.name,
                  value: t.amount,
                  color: colors[index % colors.length]
                }));
                
                return pieData.length > 0 ? (
                  <PieChart data={pieData} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No transaction data available for chart
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>

        {/* Budget Overview */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-premium">
            <CardHeader>
              <CardTitle>
                {selectedCategoryId === 'all' ? 'Total Monthly Budget' : `${selectedCategory?.name} Budget`}
              </CardTitle>
              <CardDescription>
                {new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' })} {selectedYear}
                {selectedCategoryId !== 'all' && ' - Category View'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">${totalBudget.toLocaleString()}</span>
                <span className="text-muted-foreground">total budget</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedCategoryId === 'all' 
                  ? `${selectedMonthBudgets.length} categories budgeted`
                  : filteredBudgets.length > 0 ? `Budget: $${filteredBudgets[0].amount.toLocaleString()}` : 'No budget set for this category'
                }
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-premium">
            <CardHeader>
              <CardTitle>Budget Status</CardTitle>
              <CardDescription>Current month spending overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Spent</span>
                  <span className="font-medium">${totalSpent.toLocaleString()}</span>
                </div>
                <Progress value={Math.min(budgetUsedPercent, 100)} className="h-3" />
                <div className="flex justify-between text-sm">
                  <span className={isOverBudget ? 'text-destructive' : 'text-muted-foreground'}>
                    {budgetUsedPercent.toFixed(1)}% used
                  </span>
                  <span className="font-medium">
                    ${totalBudget.toLocaleString()} budget
                  </span>
                </div>
              </div>

              {totalBudget === 0 ? (
                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-600">No Budget Set</p>
                    <p className="text-sm text-muted-foreground">
                      Add budgets for your expense categories to start tracking
                    </p>
                  </div>
                </div>
              ) : isOverBudget ? (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">Over Budget!</p>
                    <p className="text-sm text-muted-foreground">
                      You've exceeded your budget by ${(totalSpent - totalBudget).toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-600">On Track</p>
                    <p className="text-sm text-muted-foreground">
                      ${(totalBudget - totalSpent).toLocaleString()} remaining
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Month Quick View
          <Card className="shadow-premium">
            <CardHeader>
              <CardTitle>Current Month</CardTitle>
              <CardDescription>
                {new Date(0, currentMonth - 1).toLocaleString('default', { month: 'long' })} {currentYear} overview
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  ${currentMonthBudgets.reduce((sum, b) => sum + (b.spent || 0), 0).toLocaleString()}
                </span>
                <span className="text-muted-foreground">spent</span>
              </div>
              <div className="text-sm text-muted-foreground">
                of ${currentMonthBudgets.reduce((sum, b) => sum + b.amount, 0).toLocaleString()} budgeted
              </div>
              <div className="text-xs text-muted-foreground">
                {currentMonthBudgets.length} active budgets
              </div>
            </CardContent>
          </Card> */}
        </div>

        {/* Category Details */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-premium">
            <CardHeader>
              <CardTitle>
                {selectedCategoryId === 'all' ? 'Category Breakdown' : 'Budget Details'}
              </CardTitle>
              <CardDescription>
                {selectedCategoryId === 'all' 
                  ? 'Budget vs actual spending by category'
                  : 'Detailed budget information for selected category'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categoryData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {selectedCategoryId === 'all' 
                    ? 'No budgets set for this month. Add some budgets to start tracking.'
                    : 'No budget set for this category.'
                  }
                </div>
              ) : (
                <div className="space-y-6">
                  {categoryData.map(({ budget, spent, remaining, percentUsed, isOverBudget }) => (
                    <div key={budget._id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: budget.categoryId?.color }}
                          />
                          <div>
                            <span className="font-medium">{budget.categoryId?.name}</span>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>${spent.toLocaleString()} spent</span>
                              <span>•</span>
                              <span>${budget.amount.toLocaleString()} budgeted</span>
                              <span>•</span>
                              <span className={remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                                ${Math.abs(remaining).toLocaleString()} {remaining >= 0 ? 'remaining' : 'over'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isOverBudget ? (
                            <TrendingUp className="h-4 w-4 text-destructive" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-green-600" />
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(budget)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(budget._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Progress
                        value={Math.min(percentUsed, 100)}
                        className="h-3"
                      />
                      <div className="flex justify-between text-sm">
                        <span className={isOverBudget ? 'text-destructive' : 'text-muted-foreground'}>
                          {percentUsed.toFixed(1)}% used
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card className="shadow-premium">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                {selectedCategoryId === 'all' 
                  ? `All transactions for ${new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' })} ${selectedYear}`
                  : `${selectedCategory?.name || 'Selected category'} transactions for ${new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' })} ${selectedYear}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions found for the selected period.
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredTransactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((transaction) => (
                      <div key={transaction._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ 
                            backgroundColor: categories.find(c => c._id === transaction.categoryId._id)?.color || '#gray' 
                          }}
                          />
                        <div>
                          <div className="font-medium">{transaction.categoryId.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-red-600">
                          -${transaction.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
