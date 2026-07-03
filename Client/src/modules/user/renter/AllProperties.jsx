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
  const [selectedOwnedProperty, setSelectedOwnedProperty] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editMessage, setEditMessage] = useState("");
  const [editForm, setEditForm] = useState({
    title: "",
    address: "",
    city: "",
    price: "",
    propertyType: "House",
    description: "",
    mapLink: "",
  });
  const [newImage, setNewImage] = useState(null);

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

  const openEditModal = (property) => {
    setSelectedOwnedProperty(property);
    setEditForm({
      title: property.title || "",
      address: property.address || "",
      city: property.city || "",
      price: property.price || "",
      propertyType: property.propertyType || "House",
      description: property.description || "",
      mapLink: property.mapLink || "",
    });
    setNewImage(null);
    setEditMessage("");
  };

  const closeEditModal = () => {
    if (editing) return;
    setSelectedOwnedProperty(null);
    setEditMessage("");
    setNewImage(null);
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!user?._id || !selectedOwnedProperty?._id) return;

    setEditing(true);
    setEditMessage("");

    try {
      const formData = new FormData();
      Object.entries(editForm).forEach(([key, value]) => formData.append(key, value));
      formData.append("ownerId", user._id);
      if (newImage) formData.append("image", newImage);

      const res = await axios.put(`${API_URL}/api/owners/property/${selectedOwnedProperty._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProperties((prev) => prev.map((p) => (p._id === selectedOwnedProperty._id ? res.data : p)));
      setSelectedOwnedProperty(res.data);
      setEditMessage("Property updated successfully.");
      setNewImage(null);
    } catch (err) {
      setEditMessage(err.response?.data?.message || "Failed to update property.");
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteOwnedProperty = async (id) => {
    if (!user?._id) return;
    if (!window.confirm("Delete this property?")) return;

    try {
      await axios.delete(`${API_URL}/api/owners/property/${id}`, { data: { ownerId: user._id } });
      setProperties((prev) => prev.filter((p) => p._id !== id));
      if (selectedOwnedProperty?._id === id) closeEditModal();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete property.");
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
            (() => {
              const isMyProperty = user?.role === "owner" && property.owner?._id === user._id;
              return (
            <PropertyCard
              key={property._id}
              property={property}
              onViewDetails={setDetailsProperty}
              onBook={user?.role === "user" && !isMyProperty ? setSelectedProperty : undefined}
              isMyProperty={isMyProperty}
              onEdit={isMyProperty ? openEditModal : undefined}
              onDelete={isMyProperty ? handleDeleteOwnedProperty : undefined}
            />
              );
            })()
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

      {selectedOwnedProperty && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Property</h3>
              <p className="modal-meta">Update details, location, and image</p>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Property Title</label>
                  <input id="title" name="title" className="form-input" value={editForm.title} onChange={handleEditChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input id="city" name="city" className="form-input" value={editForm.city} onChange={handleEditChange} required />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input id="address" name="address" className="form-input" value={editForm.address} onChange={handleEditChange} required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price (₹)</label>
                  <input id="price" type="number" name="price" className="form-input" value={editForm.price} onChange={handleEditChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="propertyType">Property Type</label>
                  <select id="propertyType" name="propertyType" className="form-select" value={editForm.propertyType} onChange={handleEditChange}>
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="mapLink">Google Maps Link (optional)</label>
                <input id="mapLink" type="url" name="mapLink" className="form-input" value={editForm.mapLink} onChange={handleEditChange} placeholder="https://maps.google.com/..." />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" className="form-textarea" value={editForm.description} onChange={handleEditChange} />
              </div>

              <div className="form-group">
                <label htmlFor="image">Change Image (optional)</label>
                <input id="image" type="file" accept="image/*" className="form-input" onChange={(e) => setNewImage(e.target.files?.[0] || null)} />
              </div>

              {editMessage && (
                <div className={`alert ${editMessage.includes("successfully") ? "alert-success" : "alert-error"}`}>
                  {editMessage}
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeEditModal} disabled={editing}>
                  Close
                </button>
                <button type="submit" className="btn btn-primary" disabled={editing}>
                  {editing ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RenterAllProperties;
