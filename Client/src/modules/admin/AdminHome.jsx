import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../utils/api";
import DashboardNav from "../../components/DashboardNav";

const adminLinks = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/properties", label: "Properties" },
  { to: "/admin/bookings", label: "Visit Requests" },
];

const AdminHome = () => {
  const [users, setUsers] = useState(0);
  const [properties, setProperties] = useState(0);
  const [bookings, setBookings] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [userRes, propertyRes, bookingRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/users`),
        axios.get(`${API_URL}/api/admin/properties`),
        axios.get(`${API_URL}/api/admin/bookings`),
      ]);

      setUsers(Array.isArray(userRes.data) ? userRes.data.length : 0);
      setProperties(Array.isArray(propertyRes.data) ? propertyRes.data.length : 0);
      setBookings(Array.isArray(bookingRes.data) ? bookingRes.data.length : 0);
    } catch (err) {
      setError("Failed to load admin statistics.");
    } finally {
      setLoading(false);
    }
  };

  const occupancy = properties > 0 ? Math.round((bookings / properties) * 100) : 0;

  return (
    <div className="page">
      <div className="page-container">
        <DashboardNav links={adminLinks} />

        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1>Admin Dashboard</h1>
            <p className="page-subtitle">Overview of your platform</p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={fetchData} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{loading ? "—" : users}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Properties</div>
            <div className="stat-value">{loading ? "—" : properties}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Visit Requests</div>
            <div className="stat-value">{loading ? "—" : bookings}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Occupancy</div>
            <div className="stat-value">{loading ? "—" : `${occupancy}%`}</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${occupancy}%` }} />
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Quick Summary</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
            {bookings} bookings across {properties} properties · Avg {properties ? (bookings / properties).toFixed(1) : 0} bookings per property
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
