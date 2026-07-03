import React from "react";
import { getImageUrl } from "../utils/api";

const PropertyDetailsModal = ({ property, onClose, onBook }) => {
  if (!property) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{property.title}</h3>
          <p className="modal-meta">{property.address}, {property.city}</p>
        </div>

        {property.image ? (
          <img
            src={getImageUrl(property.image)}
            alt={property.title}
            className="modal-image"
          />
        ) : (
          <div className="property-card-image-placeholder" style={{ marginBottom: "1rem", borderRadius: "var(--radius)" }}>
            🏡
          </div>
        )}

        <div className="modal-details">
          <p><strong>Price:</strong> ₹ {property.price?.toLocaleString()}</p>
          <p><strong>Type:</strong> {property.propertyType}</p>
          <p><strong>Description:</strong> {property.description || "No description provided."}</p>
          {property.mapLink && (
            <p>
              <strong>Location:</strong>{" "}
              <a href={property.mapLink} target="_blank" rel="noopener noreferrer" className="map-link">
                View on Google Maps
              </a>
            </p>
          )}
        </div>

        <div className="modal-actions">
          {property.mapLink && (
            <a href={property.mapLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              Open in Maps
            </a>
          )}
          {onBook && (
            <button type="button" className="btn btn-primary" onClick={() => onBook(property)}>
              Schedule Visit
            </button>
          )}
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsModal;
