const express = require('express');
const router = express.Router();

// JSON API docs
router.get('/json', (req, res) => {
  const apiDocs = {
    title: "FinTrack API Documentation",
    version: "1.0.0",
    baseURL: `${req.protocol}://${req.get('host')}/v1/api`,
    testCredentials: {
      email: "test@fintrack.com",
      password: "password123"
    },
    endpoints: {
      authentication: {
        login: { method: "POST", url: "/login", description: "User authentication" },
        register: { method: "POST", url: "/register", description: "User registration" }
      },
      transactions: {
        getAll: { method: "GET", url: "/transactions", auth: "Bearer token required" },
        create: { method: "POST", url: "/transactions", auth: "Bearer token required" },
        update: { method: "PUT", url: "/transactions/:id", auth: "Bearer token required" },
        delete: { method: "DELETE", url: "/transactions/:id", auth: "Bearer token required" }
      },
      categories: {
        getAll: { method: "GET", url: "/category", auth: "Bearer token required" },
        create: { method: "POST", url: "/category", auth: "Bearer token required" }
      },
      budgets: {
        getAll: { method: "GET", url: "/budget", auth: "Bearer token required" },
        create: { method: "POST", url: "/budget", auth: "Bearer token required" },
        comparison: { method: "GET", url: "/budget/comparison", auth: "Bearer token required" }
      },
      analytics: {
        summary: { method: "GET", url: "/analytics/summary", auth: "Bearer token required" }
      }
    }
  };
  res.json(apiDocs);
});

// HTML API docs page
router.get('/', (req, res) => {
  const baseURL = `${req.protocol}://${req.get('host')}/v1/api`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>FinTrack API Documentation</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: #1f2937; color: white; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .endpoint { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #3b82f6; }
        .method { display: inline-block; padding: 4px 8px; border-radius: 4px; color: white; font-weight: bold; }
        .get { background: #10b981; }
        .post { background: #3b82f6; }
        .put { background: #f59e0b; }
        .delete { background: #ef4444; }
        .code { background: #1f2937; color: #e5e7eb; padding: 10px; border-radius: 4px; font-family: monospace; }
        .section { margin: 30px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>FinTrack API Documentation</h1>
        <p>Personal Budget Tracker REST API</p>
        <p><strong>Base URL:</strong> ${baseURL}</p>
        <p><strong>Version:</strong> 1.0.0</p>
    </div>

    <div class="section">
        <h2>🔑 Test Credentials</h2>
        <div class="code">
            Email: test@fintrack.com<br>
            Password: password123
        </div>
    </div>

    <div class="section">
        <h2>🔐 Authentication</h2>
        
        <div class="endpoint">
            <h3><span class="method post">POST</span> /login</h3>
            <p>User authentication</p>
            <div class="code">
{
  "email": "test@fintrack.com",
  "password": "password123"
}
            </div>
        </div>

        <div class="endpoint">
            <h3><span class="method post">POST</span> /register</h3>
            <p>User registration</p>
            <div class="code">
{
  "username": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
            </div>
        </div>
    </div>

    <div class="section">
        <h2>💰 Transactions</h2>
        
        <div class="endpoint">
            <h3><span class="method get">GET</span> /transactions</h3>
            <p>Get all transactions (Auth required)</p>
        </div>

        <div class="endpoint">
            <h3><span class="method post">POST</span> /transactions</h3>
            <p>Create new transaction (Auth required)</p>
            <div class="code">
{
  "amount": 50.00,
  "description": "Groceries",
  "date": "2024-01-15",
  "categoryId": "category-id"
}
            </div>
        </div>

        <div class="endpoint">
            <h3><span class="method put">PUT</span> /transactions/:id</h3>
            <p>Update transaction (Auth required)</p>
        </div>

        <div class="endpoint">
            <h3><span class="method delete">DELETE</span> /transactions/:id</h3>
            <p>Delete transaction (Auth required)</p>
        </div>
    </div>

    <div class="section">
        <h2>📂 Categories</h2>
        
        <div class="endpoint">
            <h3><span class="method get">GET</span> /category</h3>
            <p>Get all categories (Auth required)</p>
        </div>

        <div class="endpoint">
            <h3><span class="method post">POST</span> /category</h3>
            <p>Create new category (Auth required)</p>
            <div class="code">
{
  "name": "Groceries",
  "type": "expense",
  "color": "#ef4444"
}
            </div>
        </div>
    </div>

    <div class="section">
        <h2>💳 Budgets</h2>
        
        <div class="endpoint">
            <h3><span class="method get">GET</span> /budget</h3>
            <p>Get all budgets (Auth required)</p>
        </div>

        <div class="endpoint">
            <h3><span class="method post">POST</span> /budget</h3>
            <p>Create new budget (Auth required)</p>
            <div class="code">
{
  "categoryId": "category-id",
  "amount": 500.00,
  "month": 1,
  "year": 2024
}
            </div>
        </div>

        <div class="endpoint">
            <h3><span class="method get">GET</span> /budget/comparison</h3>
            <p>Get budget vs actual comparison (Auth required)</p>
        </div>
    </div>

    <div class="section">
        <h2>📊 Analytics</h2>
        
        <div class="endpoint">
            <h3><span class="method get">GET</span> /analytics/summary</h3>
            <p>Get financial summary (Auth required)</p>
        </div>
    </div>

    <div class="section">
        <h2>🔒 Authentication Header</h2>
        <p>For protected endpoints, include JWT token in header:</p>
        <div class="code">
Authorization: Bearer your-jwt-token
        </div>
    </div>

    <div class="section">
        <h2>🌐 Links</h2>
        <p><strong>Frontend Application:</strong> <a href="https://your-app.vercel.app" target="_blank">https://your-app.vercel.app</a></p>
        <p><strong>GitHub Repository:</strong> <a href="https://github.com/yourusername/FinTrack" target="_blank">https://github.com/yourusername/FinTrack</a></p>
    </div>

</body>
</html>
  `;
  
  res.send(html);
});

module.exports = router;