"use client"
import ProtectedRoute from "@/components/protectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Receipt } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { useState } from "react";

const Dashboard = ()=> {
    const { user, apiCall } = useAuth();
    const [apiResult, setApiResult] = useState("");
    const [loading, setLoading] = useState(false);  

     const testApiCall = async () => {
        try {
            setLoading(true);
            console.log("Making API call...");
            
            const response = await apiCall("http://localhost:5001/v1/api/transactions");
            const data = await response.json();
            
            console.log("API call successful:", data);
            setApiResult(JSON.stringify(data, null, 2));
        } catch (error: any) {
            console.error("API call failed:", error);
            setApiResult(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };
    return (
        <ProtectedRoute>
        <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your financial overview at a glance</p>
        </div>

        <p className="mb-4">Welcome, {user?.username}!</p>
            
            <div className="mb-4">
                <button
                    onClick={testApiCall}
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {loading ? "Testing..." : "Test API Call (Refresh Token)"}
                </button>
            </div>

            {apiResult && (
                <div className="bg-gray-100 p-4 rounded">
                    <h3 className="font-bold mb-2">API Result:</h3>
                    <pre className="text-sm overflow-auto">{apiResult}</pre>
                </div>
            )}
        <div className="flex gap-3">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/transactions">
              <Receipt className="h-4 w-4" />
              Transactions
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/budget">
              <DollarSign className="h-4 w-4" />
              Budget
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* {stats.map((stat) => (
          <Card key={stat.title} className="shadow-premium">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.color} mt-1`}>
                {stat.trend} from last month
              </p>
            </CardContent>
          </Card>
        ))} */}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Income vs Expenses Trend */}
        <Card className="shadow-premium">
          {/* <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>Monthly comparison over last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="income" fill="hsl(var(--chart-2))" name="Income" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expenses" fill="hsl(var(--chart-3))" name="Expenses" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent> */}
        </Card>

        {/* Expense by Category */}
        <Card className="shadow-premium">
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
            <CardDescription>Breakdown by spending category</CardDescription>
          </CardHeader>
          <CardContent>
            {/* <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryExpenses}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {categoryExpenses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer> */}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="shadow-premium">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* {mockTransactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${transaction.type === 'income' ? 'bg-green-50' : 'bg-red-50'}`}>
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{transaction.category_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))} */}
          </div>
        </CardContent>
      </Card>
    </div>
    </ProtectedRoute>
  );
    
    
}

export default Dashboard;