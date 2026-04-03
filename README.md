# 🌐 WorkSphere - Workspace Management System

WorkSphere is a comprehensive, full-stack Workspace Management System designed to streamline office operations, team collaboration, and employee wellness. Built with a modern tech stack, it provides specialized dashboards for **Admins**, **Managers**, and **Employees**.

---
## 🚀 Features

### 🔐 Authentication & Role-Based Access
- **Secure Auth:** JWT-based authentication with password hashing.
- **Three-Tier Access:** 
  - **Admin:** System-wide control, asset management, and overwork risk monitoring.
  - **Manager:** Team oversight, project management, and leave approvals.
  - **Employee:** Personal dashboard, task tracking, and facility booking.

### 📊 Workspace & Team Management
- **Project Tracking:** Create and manage projects with real-time progress updates based on task completion.
- **Task Management:** Assign tasks with priority levels, due dates, and estimated hours.
- **Seating Arrangement:** Visual cubicle assignments for employees.
- **Team Announcements:** Managers can broadcast updates to their specific teams.

### 📅 Attendance & Leave System

- **Digital Check-in:** Simple daily attendance marking.
- **Multi-Level Leaves:** Advanced leave request system with multi-step approvals (Manager & HR).
- **Conflict Prevention:** Prevents task assignment during approved leave periods.

### 🏢 Facility & Asset Management

- **Booking System:** Reserve meeting rooms or facilities with automated double-booking prevention.
- **Asset Lifecycle:** Track company property (laptops, equipment) from onboarding to offboarding.
- **Maintenance Requests:** Integrated IT ticketing system for asset repairs.
- **Occupancy Monitoring:** Real-time tracking of facility zone capacity with safety threshold alerts.

### 🧘 Employee Wellness & Feedback
- **Wellness Check-ins:** Track employee mood and stress levels.
- **Workload Scoring:** Automated risk detection for overwork based on active and overdue tasks.
- **Anonymous Feedback:** Secure channel for suggestions or incident reporting with department-specific routing.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 (via Vite)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Routing:** React Router DOM
- **API Client:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **ORM:** Sequelize
- **Database:** PostgreSQL (Compatible with Supabase)
- **Security:** JWT, BcryptJS

---

## 📂 Folder Structure
```text
workplace-management/
├── client/                # Frontend React application
│   ├── src/
│   │   ├── api/          # Axios configuration
│   │   ├── components/   # Reusable UI components
│   │   ├── contexts/     # Auth and Global State
│   │   ├── layouts/      # Dashboard wrappers
│   │   └── pages/        # Role-specific views (Admin/Manager/Employee)
│   └── tailwind.config.js
└── server/                # Backend Express API
    ├── lib/              # Utility functions (DB normalization, etc.)
    ├── middleware/       # Auth and Role protection
    ├── models/           # Sequelize database schemas
    ├── routes/           # API endpoints
    ├── scripts/          # Seeding and maintenance scripts
    └── server.js         # Entry point
```

---

## ⚙️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/worksphere.git
cd worksphere
```

### 2. Backend Setup
```bash
cd server
npm install
```
- Create a `.env` file in the `server` directory (see [Environment Variables](#-environment-variables)).
- Run database seeding (optional):
```bash
npm run seed
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```

---

## 🔑 Environment Variables

Create a `.env` file in the `/server` directory:

```env
PORT=5001
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_super_secret_key
DB_SSL=true
DB_SYNC=true
OVERWORK_OVERDUE_THRESHOLD=2
OVERWORK_SCORE_THRESHOLD=120
```

---

## 🚀 Running the App

### Start Backend
```bash
cd server
npm run dev
```
The API will run on `http://localhost:5001`.

### Start Frontend
```bash
cd client
npm run dev
```
The app will be available at `http://localhost:5173`.
---
## 🔮 Future Improvements
- [ ] Mobile application using React Native.
- [ ] Integration with Slack/Microsoft Teams for notifications.
- [ ] AI-driven workload optimization and predictive burnout alerts.
- [ ] Interactive 3D floor maps for seating and facility booking.
---

