import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL, getStoredUser } from "../../utils/api";
import Navbar from "../../components/Navbar";
import PropertyCard from "../../components/PropertyCard";
import BookPropertyModal from "../../components/BookPropertyModal";
import PropertyDetailsModal from "../../components/PropertyDetailsModal";

const Home = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [detailsProperty, setDetailsProperty] = useState(null);
  const user = getStoredUser();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.get(`${API_URL}/api/users/properties`);
      setProperties(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("Could not load properties. Ensure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = [...properties];

    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          (p.title || "").toLowerCase().includes(q) ||
          (p.address || "").toLowerCase().includes(q) ||
          (p.city || "").toLowerCase().includes(q)
      );
    }

    if (sort === "price-asc") list.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sort === "price-desc") list.sort((a, b) => (b.price || 0) - (a.price || 0));

    return list;
  }, [properties, query, sort]);

  const avgPrice =
    properties.length > 0
      ? Math.round(properties.reduce((sum, p) => sum + (p.price || 0), 0) / properties.length)
      : 0;

  const handleBookNow = (property) => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "user") {
      alert("Only renters can book properties. Please login as a renter.");
      return;
    }
    setSelectedProperty(property);
  };

  return (
    <div className="page">
      <Navbar />

      <div className="page-container">
        <section className="hero">
          <h1>Find Your Perfect Home</h1>
          <p>Browse verified rental properties across the city</p>
        </section>

        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-label">Total Properties</div>
            <div className="stat-value">{properties.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Average Price</div>
            <div className="stat-value">₹{avgPrice.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Available Now</div>
            <div className="stat-value">{filtered.length}</div>
          </div>
        </div>

        <div className="search-bar">
          <input
            type="text"
            className="form-input"
            placeholder="Search by title, address, or city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="">Sort by price</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
          <button type="button" className="btn btn-secondary" onClick={fetchProperties}>
            Refresh
          </button>
        </div>

        <h2 className="section-title">Available Properties</h2>

        {loading && <p className="loading-text">Loading properties...</p>}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🏠</div>
            <p>No properties found.</p>
          </div>
        )}

        <div className="property-grid">
          {filtered.map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              onViewDetails={setDetailsProperty}
              onBook={handleBookNow}
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
          onBook={(p) => {
            setDetailsProperty(null);
            handleBookNow(p);
          }}
        />
      )}
    </div>
  );
};

export default Home;
