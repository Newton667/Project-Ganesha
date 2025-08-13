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
cd odera-Frontend
npm install
```

**Backend:**
```bash
cd odera-Backend
npm install
```

### 3️⃣ Environment Variables

Create `.env` files in both client and server directories.

**Frontend `.env`:**
```env
PORT=5173
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend `.env`:**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
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
cd odera-Backend
npm start
```

**Frontend:**
```bash
cd odera-Frontend
npm start
```

- The frontend will be available at `http://localhost:5173`
- The backend will run on `http://localhost:3000`

---

## 🧪 Test User Data

For development and testing purposes, you can use these pre-configured accounts:

**Freelancer Accounts:**
```
Email: gg@odera.com
Password: abcd1234

Email: nnguyen@odera.com
Password: abcd1234
```

**Employer Account:**
```
Email: dd@odera.com
Password: abcd1234
```

---

## 📝 Current Development Status & TODOs

**⚠️ Work in Progress:** This project is currently under active development. While the basic structure is in place, several core features are still being implemented.

### ✅ Completed
- Basic React frontend structure
- Express.js backend setup  
- Supabase authentication integration
- Database schema design
- Basic page routing and navigation
- Initial data fetching from database

### 🚧 In Progress / TODO
- **Database Integration:** Pages fetch from DB but aren't fully integrated yet
- **Account Setup:** No page for account setup/email verification
- **Core Job Functionality:** 
  - Job acceptance/application system
  - Freelancer job browsing and bidding
  - Employer job posting and candidate selection
- **Messaging System:** Real-time chat between clients and freelancers
- **Payment Integration:** Stripe integration for secure payments
- **User Profiles:** Complete freelancer and employer profile management
- **Rating System:** Post-project rating and review functionality

### 🎯 Next Milestones
1. Complete database integration for all pages
2. Implement email verification flow
3. Build core job application/acceptance workflow
4. Add real-time messaging functionality
5. Integrate Stripe for payment processing

---

## 🌐 Deployment

- **Frontend** — React
- **Backend** — Express
- **Database** — Supabase (managed PostgreSQL)

---

## 📜 License

This project is licensed under the MIT License. See `LICENSE` for details.

---

## 📧 Contact

**Contributors:**

- **Author:** Anish Boddu  
  **Email:** [To be added] 
  **GitHub:** [@anishb788](https://github.com/anishb788)

- **Author:** Newton Nguyen
  **Email:** [email@example.com]  
  **GitHub:** [@Newton667](https://github.com/Newton667)

- **Author:** Gabe Cargo
  **Email:** [email@example.com]  
  **GitHub:** [@username](https://github.com/username)