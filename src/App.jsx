import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RequireAuth, RequireAdmin } from "./components/layout/RouteGuards";
import DashboardLayout from "./components/layout/DashboardLayout";

import Landing from "./pages/public/Landing";
import PublicEventPage from "./pages/public/PublicEventPage";
import EventPreviewPage from "./pages/shared/EventPreviewPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import EventsList from "./pages/dashboard/EventsList";
import EventEditor from "./pages/dashboard/EventEditor";
import AdminDashboard from "./pages/admin/AdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/e/:slug" element={<PublicEventPage />} />

          {/* Shared preview: owner sees their own draft/live event, admin sees any — RLS decides access */}
          <Route
            path="/preview/:eventId"
            element={
              <RequireAuth>
                <EventPreviewPage />
              </RequireAuth>
            }
          />

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
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
