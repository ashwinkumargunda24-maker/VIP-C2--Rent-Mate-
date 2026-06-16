import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL, getStoredUser } from "../../../utils/api";
import DashboardNav from "../../../components/DashboardNav";

const renterLinks = [
  { to: "/renter", label: "Dashboard", end: true },
  { to: "/renter/properties", label: "Browse" },
  { to: "/renter/bookings", label: "My Visits" },
];

const RenterHome = () => {
  const [propertiesCount, setPropertiesCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const user = getStoredUser();
    if (!user?._id) return;

    try {
      const [propertiesRes, bookingsRes] = await Promise.all([
        axios.get(`${API_URL}/api/users/properties`),
        axios.get(`${API_URL}/api/users/my-bookings`, { params: { userId: user._id } }),
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
        <DashboardNav links={renterLinks} />

        <div className="page-header">
          <h1>Renter Dashboard</h1>
          <p className="page-subtitle">Find and book your next home</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-label">Available Properties</div>
            <div className="stat-value">{propertiesCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">My Visits</div>
            <div className="stat-value">{bookingsCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenterHome;
