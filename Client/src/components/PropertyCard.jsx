import React from "react";
import { getImageUrl } from "../utils/api";

const PropertyCard = ({ property, onViewDetails, onBook }) => {
  return (
    <article className="property-card">
      {property.image ? (
        <img
          src={getImageUrl(property.image)}
          alt={property.title}
          className="property-card-image"
        />
      ) : (
        <div className="property-card-image-placeholder">🏡</div>
      )}

      <div className="property-card-body">
        <h3 className="property-card-title">{property.title}</h3>
        <p className="property-card-location">
          {property.address}, {property.city}
        </p>
        <p className="property-card-price">₹ {property.price?.toLocaleString()}</p>

        <div className="property-card-tags">
          <span className="badge badge-type">{property.propertyType}</span>
        </div>

        <div className="property-card-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onViewDetails?.(property)}>
            Details
          </button>
          {onBook && (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => onBook(property)}>
              Schedule Visit
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
