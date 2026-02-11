import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import AuthProvider from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import TasksPage from "./pages/TasksPage";
import ProjectsPage from "./pages/ProjectsPage";
import UsersPage from "./pages/UsersPage";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  console.log("PrivateRoute -> user:", user);
  console.log("PrivateRoute -> loading:", loading);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log("Redirecting to login");
    return <Navigate to="/login" replace />;
  }

  return children;
}



function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <PrivateRoute>
                <TasksPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <PrivateRoute>
                <ProjectsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <UsersPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
