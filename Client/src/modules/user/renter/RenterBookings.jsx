import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API_URL, getStoredUser } from "../../../utils/api";
import DashboardNav from "../../../components/DashboardNav";
import { formatVisitDate, formatVisitTime } from "../../../utils/formatVisit";

const renterLinks = [
  { to: "/renter", label: "Dashboard", end: true },
  { to: "/renter/properties", label: "Browse" },
  { to: "/renter/bookings", label: "My Visits" },
];

const statusBadge = (status) => {
  const map = { Pending: "pending", Approved: "approved", Rejected: "rejected" };
  return `badge badge-${map[status] || "type"}`;
};

const negotiationBadge = (status) => {
  if (status === "None") return null;
  const map = { Pending: "pending", Accepted: "approved", Rejected: "rejected" };
  const labels = { Pending: "Offer pending", Accepted: "Offer accepted", Rejected: "Offer rejected" };
  return <span className={`badge badge-${map[status]}`}>{labels[status]}</span>;
};

const RenterBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const user = getStoredUser();
    if (!user?._id) return;

    try {
      const res = await axios.get(`${API_URL}/api/users/my-bookings`, {
        params: { userId: user._id },
      });
      setBookings(res.data);
    } catch {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  const getPriceDisplay = (booking) => {
    if (booking.agreedPrice) {
      return { main: booking.agreedPrice, sub: `Agreed (listed ₹${booking.listedPrice?.toLocaleString()})` };
    }
    if (booking.negotiationStatus === "Pending") {
      return {
        main: booking.proposedPrice,
        sub: `Your offer (listed ₹${booking.listedPrice?.toLocaleString()})`,
      };
    }
    return {
      main: booking.listedPrice || booking.property?.price,
      sub: null,
    };
  };

  return (
    <div className="page">
      <div className="page-container">
        <DashboardNav links={renterLinks} />

        <div className="page-header">
          <h1>My Visit Appointments</h1>
          <p className="page-subtitle">{bookings.length} visit request{bookings.length !== 1 ? "s" : ""}</p>
        </div>

        {loading && <p className="loading-text">Loading bookings...</p>}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && bookings.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p>No visit appointments yet.</p>
            <Link to="/renter/properties" className="btn btn-primary" style={{ marginTop: "1rem" }}>
              Browse Properties
            </Link>
          </div>
        )}

        <div className="booking-list">
          {bookings.map((booking) => {
            const price = getPriceDisplay(booking);

            return (
              <article key={booking._id} className="booking-card">
                <div className="booking-card-header">
                  <div>
                    <h3 className="booking-renter-name">{booking.property?.title || "N/A"}</h3>
                    <p className="booking-property">{booking.property?.city} — {booking.property?.propertyType}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", alignItems: "flex-end" }}>
                    <span className={statusBadge(booking.status)}>{booking.status}</span>
                    {negotiationBadge(booking.negotiationStatus)}
                  </div>
                </div>

                <div className="booking-card-body">
                  <div className="booking-info-grid">
                    <div>
                      <span className="booking-info-label">Price</span>
                      <span>
                        <strong>₹ {price.main?.toLocaleString()}</strong>
                        {price.sub && <small style={{ display: "block", color: "var(--text-muted)", fontSize: "0.75rem" }}>{price.sub}</small>}
                      </span>
                    </div>
                    <div>
                      <span className="booking-info-label">Listed Price</span>
                      <span>₹ {(booking.listedPrice || booking.property?.price)?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="booking-info-label">Visit Date</span>
                      <span>{formatVisitDate(booking.visitDate)}</span>
                    </div>
                    <div>
                      <span className="booking-info-label">Visit Time</span>
                      <span>{formatVisitTime(booking.visitTime)}</span>
                    </div>
                  </div>

                  {booking.negotiationStatus === "Pending" && (
                    <div className="alert alert-info" style={{ marginTop: "1rem", marginBottom: 0 }}>
                      Waiting for owner to review your offer of ₹{booking.proposedPrice?.toLocaleString()}
                    </div>
                  )}

                  {booking.negotiationStatus === "Accepted" && (
                    <div className="alert alert-success" style={{ marginTop: "1rem", marginBottom: 0 }}>
                      Owner accepted your offer! Final price: ₹{booking.agreedPrice?.toLocaleString()}
                    </div>
                  )}

                  {booking.negotiationStatus === "Rejected" && (
                    <div className="alert alert-error" style={{ marginTop: "1rem", marginBottom: 0 }}>
                      Owner rejected your negotiated offer.
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RenterBookings;
