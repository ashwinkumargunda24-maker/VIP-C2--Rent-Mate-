import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL, getImageUrl } from "../../utils/api";
import DashboardNav from "../../components/DashboardNav";

const adminLinks = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/properties", label: "Properties" },
  { to: "/admin/bookings", label: "Visit Requests" },
];

const AllProperty = () => {
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/properties`);
      setProperties(res.data);
    } catch {
      setError("Failed to load properties.");
    }
  };

  return (
    <div className="page">
      <div className="page-container">
        <DashboardNav links={adminLinks} />

        <div className="page-header">
          <h1>All Properties</h1>
          <p className="page-subtitle">{properties.length} listed properties</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Address</th>
                <th>City</th>
                <th>Price</th>
                <th>Type</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property._id}>
                  <td>
                    {property.image ? (
                      <img src={getImageUrl(property.image)} alt={property.title} className="table-thumb" />
                    ) : "—"}
                  </td>
                  <td><strong>{property.title}</strong></td>
                  <td>{property.address}</td>
                  <td>{property.city}</td>
                  <td>₹ {property.price?.toLocaleString()}</td>
                  <td><span className="badge badge-type">{property.propertyType}</span></td>
                  <td>{property.owner?.name || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllProperty;
