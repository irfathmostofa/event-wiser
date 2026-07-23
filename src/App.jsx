import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RequireAuth, RequireAdmin } from "./components/layout/RouteGuards";
import DashboardLayout from "./components/layout/DashboardLayout";

import Landing from "./pages/public/Landing";
import PublicEventPage from "./pages/public/PublicEventPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import EventsList from "./pages/dashboard/EventsList";
import EventEditor from "./pages/dashboard/EventEditor";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPreview from "./pages/admin/AdminPreview";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/e/:slug" element={<PublicEventPage />} />

          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }
          >
            <Route index element={<EventsList />} />
            <Route path="events/:eventId" element={<EventEditor />} />
          </Route>

          <Route
            path="/admin"
            element={
              <RequireAuth>
                <RequireAdmin>
                  <DashboardLayout />
                </RequireAdmin>
              </RequireAuth>
            }
          >
            <Route index element={<AdminDashboard />} />
          </Route>

          <Route
            path="/admin/preview/:eventId"
            element={
              <RequireAuth>
                <RequireAdmin>
                  <AdminPreview />
                </RequireAdmin>
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
