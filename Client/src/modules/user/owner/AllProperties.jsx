import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL, getImageUrl, getStoredUser } from "../../../utils/api";
import DashboardNav from "../../../components/DashboardNav";

const ownerLinks = [
  { to: "/owner", label: "Dashboard", end: true },
  { to: "/owner/add-property", label: "Add Property" },
  { to: "/owner/properties", label: "My Properties" },
  { to: "/owner/bookings", label: "Visit Requests" },
];

const OwnerAllProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    const user = getStoredUser();
    if (!user?._id) return;

    try {
      const res = await axios.get(`${API_URL}/api/owners/properties`, {
        params: { ownerId: user._id },
      });
      setProperties(res.data);
    } catch {
      setError("Failed to load properties.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this property?")) return;

    try {
      await axios.delete(`${API_URL}/api/owners/property/${id}`);
      setProperties((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert("Failed to delete property.");
    }
  };

  return (
    <div className="page">
      <div className="page-container">
        <DashboardNav links={ownerLinks} />

        <div className="page-header">
          <h1>My Properties</h1>
          <p className="page-subtitle">{properties.length} listed properties</p>
        </div>

        {loading && <p className="loading-text">Loading properties...</p>}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && properties.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🏡</div>
            <p>No properties listed yet.</p>
          </div>
        )}

        <div className="property-grid">
          {properties.map((property) => (
            <article key={property._id} className="property-card">
              {property.image ? (
                <img src={getImageUrl(property.image)} alt={property.title} className="property-card-image" />
              ) : (
                <div className="property-card-image-placeholder">🏡</div>
              )}
              <div className="property-card-body">
                <h3 className="property-card-title">{property.title}</h3>
                <p className="property-card-location">{property.address}, {property.city}</p>
                <p className="property-card-price">₹ {property.price?.toLocaleString()}</p>
                <div className="property-card-tags">
                  <span className="badge badge-type">{property.propertyType}</span>
                </div>
                <div className="property-card-actions">
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(property._id)}>
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OwnerAllProperties;
