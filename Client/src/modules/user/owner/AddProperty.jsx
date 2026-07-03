import React, { useState } from "react";
import axios from "axios";
import { API_URL, getStoredUser } from "../../../utils/api";
import DashboardNav from "../../../components/DashboardNav";

const ownerLinks = [
  { to: "/owner", label: "Dashboard", end: true },
  { to: "/owner/add-property", label: "Add Property" },
  { to: "/owner/properties", label: "My Properties" },
  { to: "/owner/bookings", label: "Visit Requests" },
];

const AddProperty = () => {
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    address: "",
    city: "",
    price: "",
    propertyType: "House",
    mapLink: "",
  });

  const isSuccess = message.includes("successfully");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = getStoredUser();
    if (!user?._id) {
      setMessage("User not logged in");
      return;
    }

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => formDataToSend.append(key, value));
    formDataToSend.append("owner", user._id);
    if (image) formDataToSend.append("image", image);

    try {
      await axios.post(`${API_URL}/api/owners/property`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Property added successfully!");
      setFormData({ title: "", address: "", city: "", price: "", propertyType: "House", description: "", mapLink: "" });
      setImage(null);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to add property");
    }
  };

  return (
    <div className="page">
      <div className="page-container">
        <DashboardNav links={ownerLinks} />

        <div className="page-header">
          <h1>Add Property</h1>
          <p className="page-subtitle">List a new property for rent</p>
        </div>

        <div className="form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Property Title</label>
              <input id="title" name="title" className="form-input" placeholder="e.g. 2BHK Apartment" value={formData.title} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="image">Property Image</label>
              <input id="image" type="file" accept="image/*" className="form-input" onChange={(e) => setImage(e.target.files[0])} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input id="address" name="address" className="form-input" placeholder="Street address" value={formData.address} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input id="city" name="city" className="form-input" placeholder="City" value={formData.city} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price (₹)</label>
                <input id="price" type="number" name="price" className="form-input" placeholder="50000" value={formData.price} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="propertyType">Property Type</label>
                <select id="propertyType" name="propertyType" className="form-select" value={formData.propertyType} onChange={handleChange}>
                  <option value="House">House</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="mapLink">Google Maps Link (optional)</label>
              <input
                id="mapLink"
                type="url"
                name="mapLink"
                className="form-input"
                placeholder="https://maps.google.com/..."
                value={formData.mapLink}
                onChange={handleChange}
              />
              <p className="negotiate-hint">Paste a Google Maps link so renters can view the exact location.</p>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" className="form-textarea" placeholder="Describe your property..." value={formData.description} onChange={handleChange} />
            </div>

            {message && (
              <div className={`alert ${isSuccess ? "alert-success" : "alert-error"}`}>{message}</div>
            )}

            <button type="submit" className="btn btn-primary">
              Add Property
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;
