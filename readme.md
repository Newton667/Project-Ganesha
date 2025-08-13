# 🚀 Odera — Freelancing Platform

Odera is a modern freelancing platform connecting employers with skilled freelancers.  
Built with a **React frontend**, **Express.js backend**, and **Supabase** for authentication and database management.

---

## ✨ Features

- 🔐 **Supabase Authentication** for secure login/signup
- 👤 Separate **Employer** and **Freelancer** dashboards
- 📂 Project posting, bidding, and management
- 💬 Real-time messaging between clients and freelancers
- ⭐ Freelancer rating & review system
- 📊 Analytics for projects, earnings, and performance

---

## 🛠 Tech Stack

**Frontend:**
- React.js
- TailwindCSS (or your CSS framework)
- React Router
- Day.js for date/time formatting

**Backend:**
- Node.js & Express.js
- Supabase (Database + Auth)
- JWT Authentication Middleware

**Database:**
- PostgreSQL (via Supabase)

---

## 📦 Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/odera.git
cd odera
```

### 2️⃣ Install Dependencies

**Frontend:**
```bash
cd client
npm install
```

**Backend:**
```bash
cd ../server
npm install
```

### 3️⃣ Environment Variables

Create `.env` files in both client and server directories.

**Frontend `.env`:**
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend `.env`:**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
```

---

## 🗄 Database Schema Overview

Core tables:

- **Users** — Basic auth and profile data
- **FreelancerProfile** — Skills, availability, and reviews
- **EmployerProfile** — Company info and stats
- **Jobs** — Posted projects with details
- **Contracts** — Agreements between freelancers & employers
- **Messages** — Chat history

*(See `/db/schema.sql` for full schema)*

---

## 📡 API Routes

**Auth:**
```bash
POST /api/freelancerSignUp
POST /api/employerSignUp
POST /api/login
```

**Jobs:**
```bash
GET /api/jobs
POST /api/jobs
```

**Messages:**
```bash
GET /api/messages/:conversationId
POST /api/messages
```

---

## 🚀 Running the App

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd client
npm start
```

- The frontend will be available at `http://localhost:5173`
- The backend will run on `http://localhost:3000`

---

## 🌐 Deployment

- **Frontend** — Vercel / Netlify
- **Backend** — Render / Railway / Heroku
- **Database** — Supabase (managed PostgreSQL)

---

## 📜 License

This project is licensed under the MIT License. See `LICENSE` for details.

---

## 📧 Contact

- **Author:** Anish
- **Email:** your.email@example.com
- **GitHub:** [@yourusername](https://github.com/yourusername)