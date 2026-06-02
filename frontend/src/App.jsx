import TestMap from "./components/TestMap.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import Dashboard from "./Dashboard.jsx";
import LandingPage from "./components/LandingPage";
import NotificationsPanel from "./components/NotificationsPanel.jsx";

// Dashboards
import UserDashboard from "./components/UserDashboard.jsx";
import UserReportIssue from "./components/UserReportIssue.jsx";
import UserMyIssues from "./components/UserMyIssues.jsx";
import UserFeedback from "./components/UserFeedback.jsx";
import UserProfile from "./components/UserProfile.jsx";
import Logout from "./components/Logout.jsx";
import VolunteerDashboard from "./components/VolunteerDashboard.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";
import AdminUsers from "./components/AdminUsers.jsx";
import AdminIssues from "./components/AdminIssues.jsx";
import AdminStats from "./components/AdminStats.jsx";
import AdminProfile from "./components/AdminProfile.jsx";
import VolunteerAssignedTasks from "./components/VolunteerAssignedTasks.jsx";
import VolunteerMyStats from "./components/VolunteerMyStats.jsx";
import VolunteerProfile from "./components/VolunteerProfile";
import VolunteerList from "./components/VolunteerList.jsx";

// Route protection
import ProtectedRoute from "./ProtectedRoute.jsx";
import Unauthorized from "./components/Unauthorized.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* User dashboard with nested routes */}
        <Route
          path="/user-dashboard/*"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="report" element={<UserReportIssue />} />
          <Route path="issues" element={<UserMyIssues />} />
          <Route path="feedback" element={<UserFeedback />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="logout" element={<Logout />} />
        </Route>

        {/* Volunteer dashboard */}
        <Route
          path="/volunteer-dashboard/*"
          element={
            <ProtectedRoute allowedRoles={["volunteer"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<VolunteerDashboard />} />
          <Route path="tasks" element={<VolunteerAssignedTasks />} />
          <Route path="stats" element={<VolunteerMyStats />} />
          <Route path="profile" element={<VolunteerProfile />} /> {/* ✅ New route */}
          <Route path="logout" element={<Logout />} />
        </Route>

        {/* Admin dashboard */}
        <Route
          path="/admin-dashboard/*"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="issues" element={<AdminIssues />} />
          <Route path="stats" element={<AdminStats />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="logout" element={<Logout />} />
          <Route path="assign/:issueId" element={<VolunteerList />} />
        </Route>

        {/* Notifications route */}
  <Route
    path="/notifications"
    element={
      <ProtectedRoute allowedRoles={["user","volunteer","admin"]}>
        <NotificationsPanel />
      </ProtectedRoute>
    }
  />
        {/* Unauthorized fallback */}
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </Router>
  );
}

export default App;
