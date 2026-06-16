import React, { useState } from "react";
import axios from "axios";
import { API_URL, getStoredUser } from "../utils/api";

const today = () => new Date().toISOString().split("T")[0];

const BookPropertyModal = ({ property, onClose, onSuccess }) => {
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const [wantNegotiate, setWantNegotiate] = useState(false);
  const [proposedPrice, setProposedPrice] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const isSuccess = message.includes("successfully");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = getStoredUser();
    if (!user?._id) {
      setMessage("Please login to schedule a visit.");
      return;
    }

    if (wantNegotiate) {
      const price = Number(proposedPrice);
      if (!proposedPrice || isNaN(price) || price <= 0) {
        setMessage("Please enter a valid proposed price.");
        return;
      }
      if (price >= property.price) {
        setMessage("Proposed price should be lower than the listed price to negotiate.");
        return;
      }
    }

    setLoading(true);
    setMessage("");

    try {
      const payload = {
        user: user._id,
        property: property._id,
        visitDate,
        visitTime,
      };

      if (wantNegotiate && proposedPrice) {
        payload.proposedPrice = Number(proposedPrice);
      }

      await axios.post(`${API_URL}/api/users/book-property`, payload);

      setMessage(
        wantNegotiate
          ? "Visit request with price negotiation submitted! Owner will review your offer."
          : "Visit appointment requested successfully!"
      );
      onSuccess?.();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to schedule visit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Schedule Property Visit</h3>
          <p className="modal-meta">{property.title} — {property.city}</p>
        </div>

        <div className="price-highlight">
          <span className="price-highlight-label">Listed Price</span>
          <span className="price-highlight-value">₹ {property.price?.toLocaleString()}</span>
          <span className="price-highlight-type">/ month</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="visitDate">Visit Date</label>
            <input
              id="visitDate"
              type="date"
              className="form-input"
              value={visitDate}
              min={today()}
              onChange={(e) => setVisitDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="visitTime">Visit Time</label>
            <input
              id="visitTime"
              type="time"
              className="form-input"
              value={visitTime}
              onChange={(e) => setVisitTime(e.target.value)}
              required
            />
          </div>

          <div className="negotiate-toggle">
            <label className="negotiate-label">
              <input
                type="checkbox"
                checked={wantNegotiate}
                onChange={(e) => {
                  setWantNegotiate(e.target.checked);
                  if (!e.target.checked) setProposedPrice("");
                }}
              />
              <span>Price too high? Propose a lower amount</span>
            </label>
          </div>

          {wantNegotiate && (
            <div className="form-group negotiate-input">
              <label htmlFor="proposedPrice">Your Proposed Price (₹)</label>
              <input
                id="proposedPrice"
                type="number"
                className="form-input"
                placeholder={`Less than ₹${property.price?.toLocaleString()}`}
                value={proposedPrice}
                onChange={(e) => setProposedPrice(e.target.value)}
                min="1"
                max={property.price - 1}
                required
              />
              <p className="negotiate-hint">
                Owner will review your offer and accept or reject it.
              </p>
            </div>
          )}

          {message && (
            <div className={`alert ${isSuccess ? "alert-success" : "alert-error"}`}>
              {message}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Submitting..." : wantNegotiate ? "Submit Offer" : "Request Visit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookPropertyModal;
