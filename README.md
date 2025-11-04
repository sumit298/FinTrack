# FinTrack - Personal Budget Tracker

A full-stack budget tracking application with **Node.js/Express + Next.js/React** (instead of Django as originally specified).

## 🚀 Quick Start

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend  
cd frontend && npm install && npm run dev
```

**Live Demo**: [Frontend](https://fintrack-demo.vercel.app) | [API](https://fintrack-api.railway.app)

## 🔑 Test Credentials
- **Email**: `test@fintrack.com`
- **Password**: `password123`

*(Create via registration form on first use)*

## ✅ Requirements Met

- ✅ **Authentication**: JWT-based login system
- ✅ **Dashboard**: Financial summary with D3.js charts
- ✅ **Transactions**: CRUD operations with pagination & filtering
- ✅ **Categories**: Income/expense categorization with colors
- ✅ **Budget Management**: Monthly budgets vs actual spending with D3.js charts
- ✅ **Responsive UI**: Works on desktop and mobile

## 🛠 Tech Stack

**Backend**: Node.js, Express, MongoDB, JWT  
**Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, D3.js  
**Database**: MongoDB with Mongoose

## 📱 Features

1. **Login Page** - Secure authentication
2. **Dashboard** - Income/expenses overview with interactive D3.js charts
3. **Transactions** - Add/edit/delete with advanced filtering and pagination
4. **Categories** - Color-coded income/expense categories
5. **Budget Management** - Set monthly limits with visual comparisons

## 🎯 Key Assumptions

- **Currency**: USD only
- **Budget Period**: Monthly budgets
- **User Isolation**: All data is user-specific
- **Category Colors**: Users assign colors for better visualization

## 📊 D3.js Charts

- **Budget vs Actual**: Bar chart comparing budgeted vs spent amounts
- **Expense Distribution**: Pie chart showing spending by category
- **Real-time Updates**: Charts update automatically with new data

## 🔧 Environment Setup

**Backend (.env)**:
```env
MONGODB_URI=mongodb://localhost:27017/fintrack
JWT_SECRET=your-secret-key
PORT=5001
```

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

## 📚 API Endpoints

- `POST /v1/api/login` - User authentication
- `GET/POST/PUT/DELETE /v1/api/transactions` - Transaction CRUD
- `GET/POST/PUT/DELETE /v1/api/category` - Category management
- `GET/POST/PUT/DELETE /v1/api/budget` - Budget operations
- `GET /v1/api/budget/comparison` - Budget vs actual data

## 🚀 Deployment

**Frontend**: Deployed on Vercel  
**Backend**: Deployed on Railway  
**Database**: MongoDB Atlas

## 🔒 Security

- Password hashing with bcryptjs
- JWT token authentication
- Input validation and sanitization
- CORS configuration
- User data isolation

---

**Note**: Built with Node.js/Express instead of Django for JavaScript ecosystem consistency. All core requirements and functionality remain the same.