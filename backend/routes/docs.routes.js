const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const apiDocs = {
    title: "FinTrack API Documentation",
    version: "1.0.0",
    baseURL: `${req.protocol}://${req.get('host')}/v1/api`,
    endpoints: {
      authentication: {
        login: {
          method: "POST",
          url: "/login",
          description: "User authentication",
          body: {
            email: "string",
            password: "string"
          }
        },
        register: {
          method: "POST", 
          url: "/register",
          description: "User registration",
          body: {
            username: "string",
            email: "string",
            password: "string"
          }
        }
      },
      transactions: {
        getAll: {
          method: "GET",
          url: "/transactions",
          description: "Get all transactions",
          auth: "Bearer token required"
        },
        create: {
          method: "POST",
          url: "/transactions", 
          description: "Create new transaction",
          auth: "Bearer token required"
        }
      },
      categories: {
        getAll: {
          method: "GET",
          url: "/category",
          description: "Get all categories",
          auth: "Bearer token required"
        }
      },
      budgets: {
        getAll: {
          method: "GET", 
          url: "/budget",
          description: "Get all budgets",
          auth: "Bearer token required"
        },
        comparison: {
          method: "GET",
          url: "/budget/comparison",
          description: "Get budget vs actual comparison",
          auth: "Bearer token required"
        }
      }
    }
  };

  res.json(apiDocs);
});

module.exports = router;