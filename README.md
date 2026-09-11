# Employee Management System (Full-Stack)

A full-stack Human Resource & Employee Management enterprise application consisting of a **Spring Boot REST API** backend and a **React + Tailwind CSS** frontend.

---

## 🏛️ Project Architecture

```
EmployeeManagementSystem/
├── src/                  # Spring Boot Backend source code
├── pom.xml               # Maven configuration
├── mvnw / mvnw.cmd       # Maven wrapper scripts
│
└── frontend/             # React + Vite Frontend
    ├── src/              # React components, pages, services, context
    ├── package.json      # Frontend dependencies & scripts
    ├── .env              # Environment configuration (VITE_API_BASE_URL)
    └── README.md         # Dedicated frontend documentation
```

---

## 🚀 Getting Started

### 1. Database Setup
Ensure MySQL is running with database credentials configured in `src/main/resources/application.properties`:
- Database URL: `jdbc:mysql://localhost:3306/New_Ems`
- Database: `New_Ems`

### 2. Run the Spring Boot Backend
Open a terminal in the root directory and run:
```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```
Backend will start on `http://localhost:8080`.

### 3. Run the React Frontend
Open a new terminal in the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📑 Core Modules & Features

1. **Dashboard (`/dashboard`)**: Key organization statistics (Total Employees, Total Departments, Present Today, Pending Leaves, Monthly Payroll) with month/year filtering and interactive Recharts visualizations.
2. **Employee Management (`/employees`)**: Searchable, filterable employee directory, profile view, add/edit forms with real field validation.
3. **Department Management (`/departments`)**: Manage corporate departments with live headcount badges.
4. **Attendance Tracking (`/attendance`)**: Record presence, check-in, and check-out timestamps with status filtering (`PRESENT`, `ABSENT`, `HALF_DAY`, `LEAVE`).
5. **Leave Requests (`/leaves`)**: Apply for leave, review pending applications, and trigger direct backend approvals/rejections via `PATCH /leaves/{id}/status`.
6. **Payroll Administration (`/payroll`)**: Generate compensation records with real-time net salary calculation preview (`basic + bonus - deduction`).
