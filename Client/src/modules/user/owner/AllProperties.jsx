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
  const [selectedProperty, setSelectedProperty] = useState(null);
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
    const user = getStoredUser();
    if (!user?._id) return;

    try {
      await axios.delete(`${API_URL}/api/owners/property/${id}`, {
        data: { ownerId: user._id },
      });
      setProperties((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert("Failed to delete property.");
    }
  };

  const openEditModal = (property) => {
    setSelectedProperty(property);
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

  const handleEditChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const closeEditModal = () => {
    if (editing) return;
    setSelectedProperty(null);
    setEditMessage("");
    setNewImage(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const user = getStoredUser();
    if (!user?._id || !selectedProperty?._id) return;

    setEditing(true);
    setEditMessage("");

    try {
      const formData = new FormData();
      Object.entries(editForm).forEach(([key, value]) => formData.append(key, value));
      formData.append("ownerId", user._id);
      if (newImage) formData.append("image", newImage);

      const res = await axios.put(`${API_URL}/api/owners/property/${selectedProperty._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProperties((prev) => prev.map((p) => (p._id === selectedProperty._id ? res.data : p)));
      setSelectedProperty(res.data);
      setEditMessage("Property updated successfully.");
      setNewImage(null);
    } catch (err) {
      setEditMessage(err.response?.data?.message || "Failed to update property.");
    } finally {
      setEditing(false);
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
                  {property.mapLink && (
                    <a
                      href={property.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm"
                    >
                      Open in Maps
                    </a>
                  )}
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => openEditModal(property)}>
                    Edit
                  </button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(property._id)}>
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {selectedProperty && (
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

export default OwnerAllProperties;
