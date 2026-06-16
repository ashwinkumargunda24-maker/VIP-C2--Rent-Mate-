import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL, getStoredUser } from "../../../utils/api";
import DashboardNav from "../../../components/DashboardNav";

const ownerLinks = [
  { to: "/owner", label: "Dashboard", end: true },
  { to: "/owner/add-property", label: "Add Property" },
  { to: "/owner/properties", label: "My Properties" },
  { to: "/owner/bookings", label: "Visit Requests" },
];

const OwnerHome = () => {
  const [propertiesCount, setPropertiesCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const user = getStoredUser();
    if (!user?._id) return;

    try {
      const [propertiesRes, bookingsRes] = await Promise.all([
        axios.get(`${API_URL}/api/owners/properties`, { params: { ownerId: user._id } }),
        axios.get(`${API_URL}/api/owners/bookings`, { params: { ownerId: user._id } }),
      ]);

      setPropertiesCount(propertiesRes.data.length);
      setBookingsCount(bookingsRes.data.length);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="page">
      <div className="page-container">
        <DashboardNav links={ownerLinks} />

        <div className="page-header">
          <h1>Owner Dashboard</h1>
          <p className="page-subtitle">Manage your properties and bookings</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-label">My Properties</div>
            <div className="stat-value">{propertiesCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Visit Requests</div>
            <div className="stat-value">{bookingsCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerHome;
