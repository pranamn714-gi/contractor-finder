import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import MainPage from "./pages/MainPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import ContractorDashboard from "./pages/ContractorDashBoard";
import UserBookings from "./pages/UserBookings";

// ✅ Contractor detail pages
import BookingDetailsPage from "./pages/BookingDetailsPage";
import ContractorBookings from "./pages/ContractorBookings";
import ContractorReviewsPage from "./pages/ContractorReviewsPage";

// ✅ Admin components
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";

import './App.css';

function RequireAuth({ children, role }) {
  const token = localStorage.getItem("token");
  const currentRole = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" />;
  if (role && currentRole !== role) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ✅ Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <RequireAuth role="admin">
              <AdminDashboard />
            </RequireAuth>
          }
        />

        {/* User routes */}
        <Route
          path="/user/dashboard"
          element={
            <RequireAuth role="user">
              <UserDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <RequireAuth role="user">
              <UserBookings />
            </RequireAuth>
          }
        />

        {/* ✅ Contractor routes */}
        <Route
          path="/contractor/dashboard"
          element={
            <RequireAuth role="contractor">
              <ContractorDashboard />
            </RequireAuth>
          }
        />

        {/* ✅ Contractor Bookings List */}
        <Route
          path="/contractor/bookings"
          element={
            <RequireAuth role="contractor">
              <ContractorBookings />
            </RequireAuth>
          }
        />

        {/* ✅ Contractor Booking Details */}
        <Route
          path="/contractor/bookings/:bookingId"
          element={
            <RequireAuth role="contractor">
              <BookingDetailsPage />
            </RequireAuth>
          }
        />

        {/* ✅ Contractor reviews route */}
        <Route
          path="/contractor/reviews"
          element={
            <RequireAuth role="contractor">
              <ContractorReviewsPage />
            </RequireAuth>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </Router>
  );
}