# Employee Management System — Frontend Client

A responsive enterprise web application built with **React**, **Vite**, **Tailwind CSS**, and **Axios**, designed to integrate with the Java Spring Boot REST API backend.

---

## 🚀 Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite 5
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **UI Styling**: Tailwind CSS v3
- **Icons**: Lucide React
- **Data Visualizations**: Recharts
- **Notification System**: Context-based Toast Alerts

---

## 🏛️ Architecture

```
React Frontend (Port 5173)
        │
        ▼  [Axios / HTTP]
Spring Boot REST API (Port 8080)
        │
        ▼  [Spring Data JPA]
MySQL Database ("New_Ems")
```

---

## 📁 Folder Structure

```
frontend/
├── .env                  # Runtime environment variables
├── .env.example          # Sample environment variables
├── index.html            # HTML template with Google Fonts Inter
├── package.json          # Dependencies and scripts
├── postcss.config.js     # PostCSS plugins (Tailwind, Autoprefixer)
├── tailwind.config.js    # Custom Tailwind styling and colors
├── vite.config.js        # Vite bundler & reverse proxy configuration
└── src/
    ├── main.jsx          # React DOM entrypoint
    ├── App.jsx           # Application shell & providers
    ├── index.css         # Global styling & custom scrollbars
    ├── constants/
    │   └── enums.js      # Backend enums (AttendanceStatus, LeaveStatus, Months)
    ├── context/
    │   └── ToastContext.jsx # Toast notification alert system
    ├── services/
    │   ├── api.js               # Central Axios client with error handling
    │   ├── employeeService.js   # Employee CRUD API bindings
    │   ├── departmentService.js # Department CRUD API bindings
    │   ├── attendanceService.js # Attendance tracking API bindings
    │   ├── leaveService.js      # Leave requests & status PATCH bindings
    │   ├── payrollService.js    # Payroll administration API bindings
    │   └── dashboardService.js  # Dashboard summary metrics API
    ├── components/
    │   ├── common/
    │   │   ├── Badge.jsx         # Status pill badges
    │   │   ├── Button.jsx        # Buttons with variants and spinners
    │   │   ├── Card.jsx          # Structured content cards
    │   │   ├── ConfirmDialog.jsx # Delete confirmation modal
    │   │   ├── EmptyState.jsx    # Zero-data presentation
    │   │   ├── Input.jsx         # Form inputs with inline validation
    │   │   ├── Loader.jsx        # Loading spinner states
    │   │   ├── Modal.jsx         # Accessible dialogs
    │   │   ├── PageHeader.jsx    # Consistent page headers
    │   │   ├── Pagination.jsx    # Table page controls
    │   │   ├── SearchBar.jsx     # Search inputs with clear button
    │   │   ├── Select.jsx        # Dropdowns
    │   │   ├── Skeleton.jsx      # Skeleton placeholder lines
    │   │   └── Table.jsx         # Enterprise responsive table
    │   └── layout/
    │       ├── Layout.jsx        # Application frame
    │       ├── Navbar.jsx        # Top header & mobile toggle
    │       └── Sidebar.jsx       # Side navigation & drawer
    ├── pages/
    │   ├── Dashboard.jsx         # Real-time metrics & Recharts
    │   ├── Employees.jsx         # Directory, search, filters & pagination
    │   ├── AddEmployee.jsx       # Registration form with department selector
    │   ├── EditEmployee.jsx      # Profile modification
    │   ├── EmployeeDetails.jsx   # Profile view with linked records
    │   ├── Departments.jsx       # Department list with headcount & CRUD
    │   ├── Attendance.jsx        # Check-in tracking, date/status filters
    │   ├── Leaves.jsx            # Leave requests & one-click approval/rejection
    │   ├── Payroll.jsx           # Salary disbarment with net calculator
    │   └── NotFound.jsx          # Custom 404 page
    └── routes/
        └── AppRoutes.jsx         # Route declarations and redirects
```

---

## 📋 Prerequisites

- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+ (tested on npm 11)
- **Java**: JDK 21+ (tested on Java 24)
- **MySQL Server**: Running on port `3306` with database `New_Ems`

---

## ⚙️ Environment Variables

Create a `.env` file in `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

---

## 🔌 API Integration Map

All frontend services map directly to Spring Boot backend controllers:

| Feature | Backend Controller | Endpoint | Methods Used |
|---|---|---|---|
| **Dashboard** | `DashboardController` | `/summary?month={m}&year={y}` | `GET` |
| **Employees** | `EmployeeController` | `/employees`, `/employees/{id}` | `GET`, `POST`, `PUT`, `DELETE` |
| **Departments** | `DepartmentController` | `/departments`, `/departments/{id}` | `GET`, `POST`, `PUT`, `DELETE` |
| **Attendance** | `AttendanceController` | `/attendance`, `/attendance/{id}` | `GET`, `POST`, `PUT`, `DELETE` |
| **Leaves** | `LeaveController` | `/leaves`, `/leaves/{id}`, `/leaves/{id}/status` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` |
| **Payroll** | `PayrollController` | `/payrolls`, `/payrolls/{id}` | `GET`, `POST`, `PUT`, `DELETE` |

### Actual Enums Used
- **AttendanceStatus**: `PRESENT`, `ABSENT`, `HALF_DAY`, `LEAVE`
- **LeaveStatus**: `PENDING`, `APPROVED`, `REJECTED`

---

## 🚦 How to Run the Application

### 1. Start Spring Boot Backend
In the `backend/` directory:
```bash
cd backend

# Windows
.\mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```
Backend will start on `http://localhost:8080`.

### 2. Start React Frontend
In the `frontend/` directory:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📦 Production Build

To produce an optimized production bundle:
```bash
cd frontend
npm run build
```
The output will be saved in `frontend/dist/`. To preview:
```bash
npm run preview
```

---

## 🛠️ Troubleshooting

- **CORS Errors**: Ensure `src/main/java/com/learn/EmployeeManagementSystem/config/CorsConfig.java` is in place.
- **Backend Connection Refused**: Confirm MySQL is running and Spring Boot is started on port `8080`.
- **PowerShell execution policy error with npm**: Run via `cmd.exe /c "npm run dev"` or adjust PowerShell execution policy if needed.
