import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_URL, getStoredUser } from "../../../utils/api";
import DashboardNav from "../../../components/DashboardNav";
import PropertyCard from "../../../components/PropertyCard";
import BookPropertyModal from "../../../components/BookPropertyModal";
import PropertyDetailsModal from "../../../components/PropertyDetailsModal";

const renterLinks = [
  { to: "/renter", label: "Dashboard", end: true },
  { to: "/renter/properties", label: "Browse" },
  { to: "/renter/bookings", label: "My Visits" },
];

const RenterAllProperties = () => {
  const user = getStoredUser();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [detailsProperty, setDetailsProperty] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users/properties`);
      setProperties(res.data);
    } catch {
      setError("Failed to load properties.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      {user?.role === "user" ? (
        <div className="page-container">
          <DashboardNav links={renterLinks} />
          <div className="page-header">
            <h1>Browse Properties</h1>
            <p className="page-subtitle">{properties.length} properties available</p>
          </div>
        </div>
      ) : (
        <>
          <header className="navbar">
            <div className="navbar-inner">
              <Link to="/" className="navbar-brand">
                <span className="brand-icon">🏠</span>
                RentMate
              </Link>
              <nav className="navbar-links">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/login" className="nav-link">Login</Link>
              </nav>
            </div>
          </header>
          <div className="page-container">
            <div className="page-header">
              <h1>Available Properties</h1>
              <p className="page-subtitle">Browse and book your perfect home</p>
            </div>
          </div>
        </>
      )}

      <div className="page-container" style={{ paddingTop: user?.role === "user" ? 0 : undefined }}>
        {loading && <p className="loading-text">Loading properties...</p>}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && properties.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🏠</div>
            <p>No properties available.</p>
          </div>
        )}

        <div className="property-grid">
          {properties.map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              onViewDetails={setDetailsProperty}
              onBook={user?.role === "user" ? setSelectedProperty : undefined}
            />
          ))}
        </div>
      </div>

      {selectedProperty && (
        <BookPropertyModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onSuccess={() => setSelectedProperty(null)}
        />
      )}

      {detailsProperty && (
        <PropertyDetailsModal
          property={detailsProperty}
          onClose={() => setDetailsProperty(null)}
          onBook={user?.role === "user" ? (p) => { setDetailsProperty(null); setSelectedProperty(p); } : undefined}
        />
      )}
    </div>
  );
};

export default RenterAllProperties;
