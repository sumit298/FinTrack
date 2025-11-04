"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Filter, Edit, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import ProtectedRoute from "@/components/protectedRoute";
import { useAuth } from "@/lib/context/AuthContext";
import toast from "react-hot-toast";

interface Transaction {
    _id: string;
    amount: number;
    description: string;
    date: string;
    categoryId: {
        _id: string;
        name: string;
        type: string;
    };
}

interface Category {
    _id: string;
    name: string;
    type: string;
}

export default function TransactionsPage() {
    const { apiCall } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [itemsPerPage, setItemsPerPage] = useState(10);


    // Form state
    const [formData, setFormData] = useState({
        type: 'expense',
        categoryId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
    });

    // Filter state
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [amountFilter, setAmountFilter] = useState({ min: "", max: "" });
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch data
    useEffect(() => {
        fetchTransactions();
        fetchCategories();
    }, []);

    const fetchTransactions = async () => {
        try {
            const response = await apiCall("http://localhost:5001/v1/api/transactions");
            const data = await response.json();
            if (data.success) {
                setTransactions(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch transactions:", error);
            toast.error("Failed to load transactions");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await apiCall("http://localhost:5001/v1/api/category");
            const data = await response.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingTransaction
                ? `http://localhost:5001/v1/api/transactions/${editingTransaction._id}`
                : "http://localhost:5001/v1/api/transactions";

            const method = editingTransaction ? "PUT" : "POST";

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
                toast.success(`Transaction ${editingTransaction ? 'updated' : 'created'} successfully`);
                fetchTransactions();
                setIsAddDialogOpen(false);
                setEditingTransaction(null);
                resetForm();
            } else {
                toast.error(data.message || "Failed to save transaction");
            }
        } catch (error) {
            console.error("Error saving transaction:", error);
            toast.error("Failed to save transaction");
        }
    };

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setFormData({
            type: transaction.categoryId?.type,
            categoryId: transaction.categoryId._id,
            amount: transaction.amount.toString(),
            date: transaction.date.split('T')[0],
            description: transaction.description
        });
        setIsAddDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this transaction?")) return;

        try {
            const response = await apiCall(`http://localhost:5001/v1/api/transactions/${id}`, {
                method: "DELETE"
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Transaction deleted successfully");
                fetchTransactions();
            } else {
                toast.error("Failed to delete transaction");
            }
        } catch (error) {
            console.error("Error deleting transaction:", error);
            toast.error("Failed to delete transaction");
        }
    };

    const resetForm = () => {
        setFormData({
            type: 'expense',
            categoryId: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            description: ''
        });
    };

    // Filter transactions
    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.categoryId.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = categoryFilter === "all" || transaction.categoryId?._id === categoryFilter;

        const matchesAmount = (!amountFilter.min || transaction.amount >= parseFloat(amountFilter.min)) &&
            (!amountFilter.max || transaction.amount <= parseFloat(amountFilter.max));

        return matchesSearch && matchesCategory && matchesAmount;
    });

    // Pagination
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="flex items-center justify-center min-h-screen">
                    <div>Loading transactions...</div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
                        <p className="text-muted-foreground mt-1">Track your income and expenses</p>
                    </div>

                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={resetForm} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Transaction
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingTransaction ? 'Update' : 'Create a new'} income or expense entry
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Type</Label>
                                        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="income">Income</SelectItem>
                                                <SelectItem value="expense">Expense</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories
                                                    .filter(cat => cat.type === formData.type)
                                                    .map((cat) => (
                                                        <SelectItem key={cat._id} value={cat._id}>
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Enter transaction details"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button type="button" variant="outline" onClick={() => {
                                        setIsAddDialogOpen(false);
                                        setEditingTransaction(null);
                                        resetForm();
                                    }}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        {editingTransaction ? 'Update' : 'Add'} Transaction
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>



                {/* Transactions List */}
                <Card className="shadow-premium">
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label>Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search transactions..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat._id} value={cat._id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Min Amount</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={amountFilter.min}
                                    onChange={(e) => setAmountFilter({ ...amountFilter, min: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Amount</Label>
                                <Input
                                    type="number"
                                    placeholder="∞"
                                    value={amountFilter.max}
                                    onChange={(e) => setAmountFilter({ ...amountFilter, max: e.target.value })}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Type
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Description
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Category
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Amount
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Date
                                        </th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="h-24 text-center">
                                                No transactions found.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedTransactions.map((transaction) => (
                                            <tr key={transaction._id} className="border-b hover:bg-muted/50">
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`p-1 rounded ${transaction?.categoryId?.type === 'income' ? 'bg-green-50' : 'bg-red-50'
                                                            }`}>
                                                            {transaction?.categoryId?.type === 'income' ? (
                                                                <ArrowUpRight className="h-4 w-4 text-green-600" />
                                                            ) : (
                                                                <ArrowDownRight className="h-4 w-4 text-red-600" />
                                                            )}
                                                        </div>
                                                        <span className="capitalize text-sm font-medium">
                                                            {transaction?.categoryId?.type}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className="font-medium">{transaction.description}</div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground">
                                                        {transaction.categoryId?.name}
                                                    </span>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className={`font-semibold ${transaction.categoryId?.type === 'income' ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                        {transaction.categoryId?.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className="text-sm text-muted-foreground">
                                                        {new Date(transaction.date).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEdit(transaction)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(transaction._id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Enhanced Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-2 py-4">
                                <div className="flex-1 text-sm text-muted-foreground">
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} entries
                                </div>
                                <div className="flex items-center space-x-6 lg:space-x-8">
                                    <div className="flex items-center space-x-2">
                                        <p className="text-sm font-medium">Rows per page</p>
                                        <Select
                                            value={itemsPerPage.toString()}
                                            onValueChange={(value) => {
                                                setItemsPerPage(Number(value));
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <SelectTrigger className="h-8 w-[70px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent side="top">
                                                {[5, 10, 20, 30, 50].map((pageSize) => (
                                                    <SelectItem key={pageSize} value={pageSize.toString()}>
                                                        {pageSize}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                                        Page {currentPage} of {totalPages}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            className="h-8 w-8 p-0"
                                            onClick={() => setCurrentPage(1)}
                                            disabled={currentPage === 1}
                                        >
                                            <span className="sr-only">Go to first page</span>
                                            ⟪
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-8 w-8 p-0"
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <span className="sr-only">Go to previous page</span>
                                            ⟨
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-8 w-8 p-0"
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            <span className="sr-only">Go to next page</span>
                                            ⟩
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-8 w-8 p-0"
                                            onClick={() => setCurrentPage(totalPages)}
                                            disabled={currentPage === totalPages}
                                        >
                                            <span className="sr-only">Go to last page</span>
                                            ⟫
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
