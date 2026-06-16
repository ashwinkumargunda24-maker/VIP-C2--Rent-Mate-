import React from "react";
import { formatVisitDate, formatVisitTime } from "../utils/formatVisit";

const RenterProfileModal = ({ renter, booking, onClose }) => {
  if (!renter) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Renter Profile</h3>
          <p className="modal-meta">Visit appointment details</p>
        </div>

        <div className="profile-avatar">
          {renter.name?.charAt(0)?.toUpperCase() || "?"}
        </div>

        <div className="profile-details">
          <div className="profile-row">
            <span className="profile-label">Name</span>
            <span className="profile-value">{renter.name || "N/A"}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Email</span>
            <span className="profile-value">
              {renter.email ? (
                <a href={`mailto:${renter.email}`}>{renter.email}</a>
              ) : "N/A"}
            </span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Phone</span>
            <span className="profile-value">
              {renter.phone ? (
                <a href={`tel:${renter.phone}`}>{renter.phone}</a>
              ) : "Not provided"}
            </span>
          </div>
          {booking && (
            <>
              <div className="profile-row">
                <span className="profile-label">Property</span>
                <span className="profile-value">{booking.property?.title || "N/A"}</span>
              </div>
              {booking.negotiationStatus === "Pending" && (
                <div className="profile-row">
                  <span className="profile-label">Offer</span>
                  <span className="profile-value">
                    ₹ {booking.proposedPrice?.toLocaleString()}
                    <small style={{ display: "block", color: "var(--text-muted)" }}>
                      Listed: ₹ {(booking.listedPrice || booking.property?.price)?.toLocaleString()}
                    </small>
                  </span>
                </div>
              )}
              <div className="profile-row">
                <span className="profile-label">Visit Date</span>
                <span className="profile-value">{formatVisitDate(booking.visitDate)}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Visit Time</span>
                <span className="profile-value">{formatVisitTime(booking.visitTime)}</span>
              </div>
            </>
          )}
        </div>

        <div className="contact-actions">
          {renter.email && (
            <a href={`mailto:${renter.email}`} className="btn btn-primary btn-sm">
              Email Renter
            </a>
          )}
          {renter.phone && (
            <a href={`tel:${renter.phone}`} className="btn btn-secondary btn-sm">
              Call Renter
            </a>
          )}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenterProfileModal;
