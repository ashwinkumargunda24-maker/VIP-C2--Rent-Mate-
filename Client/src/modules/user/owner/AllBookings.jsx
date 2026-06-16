import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL, getStoredUser } from "../../../utils/api";
import DashboardNav from "../../../components/DashboardNav";
import RenterProfileModal from "../../../components/RenterProfileModal";
import { formatVisitDate, formatVisitTime } from "../../../utils/formatVisit";

const ownerLinks = [
  { to: "/owner", label: "Dashboard", end: true },
  { to: "/owner/add-property", label: "Add Property" },
  { to: "/owner/properties", label: "My Properties" },
  { to: "/owner/bookings", label: "Visit Requests" },
];

const statusBadge = (status) => {
  const map = { Pending: "pending", Approved: "approved", Rejected: "rejected" };
  return `badge badge-${map[status] || "type"}`;
};

const negotiationBadge = (status) => {
  const map = { None: "type", Pending: "pending", Accepted: "approved", Rejected: "rejected" };
  const labels = { None: "No negotiation", Pending: "Offer pending", Accepted: "Offer accepted", Rejected: "Offer rejected" };
  return { className: `badge badge-${map[status] || "type"}`, label: labels[status] || status };
};

const OwnerAllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchOwnerBookings();
  }, []);

  const fetchOwnerBookings = async () => {
    const user = getStoredUser();
    if (!user?._id) return;

    try {
      const res = await axios.get(`${API_URL}/api/owners/bookings`, {
        params: { ownerId: user._id },
      });
      setBookings(res.data);
    } catch {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, status) => {
    const user = getStoredUser();
    if (!user?._id) return;

    setActionLoading(bookingId + status);
    setActionMessage("");

    try {
      const res = await axios.put(`${API_URL}/api/owners/booking/${bookingId}`, {
        ownerId: user._id,
        status,
      });

      setBookings((prev) => prev.map((b) => (b._id === bookingId ? res.data : b)));
      setActionMessage(`Booking ${status.toLowerCase()} successfully.`);
    } catch (err) {
      setActionMessage(err.response?.data?.message || "Failed to update booking.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleNegotiation = async (bookingId, action) => {
    const user = getStoredUser();
    if (!user?._id) return;

    setActionLoading(bookingId + action);
    setActionMessage("");

    try {
      const res = await axios.put(`${API_URL}/api/owners/booking/${bookingId}/negotiation`, {
        ownerId: user._id,
        action,
      });

      setBookings((prev) => prev.map((b) => (b._id === bookingId ? res.data : b)));
      setActionMessage(
        action === "Accept"
          ? "Negotiated price accepted and booking approved!"
          : "Negotiation offer rejected."
      );
    } catch (err) {
      setActionMessage(err.response?.data?.message || "Failed to update negotiation.");
    } finally {
      setActionLoading(null);
    }
  };

  const getDisplayPrice = (booking) => {
    if (booking.agreedPrice) return booking.agreedPrice;
    if (booking.negotiationStatus === "Pending") return booking.proposedPrice;
    return booking.listedPrice || booking.property?.price;
  };

  return (
    <div className="page">
      <div className="page-container">
        <DashboardNav links={ownerLinks} />

        <div className="page-header">
          <h1>Visit Appointments</h1>
          <p className="page-subtitle">
            Review visit requests, negotiate rent, and accept or reject offers
          </p>
        </div>

        {loading && <p className="loading-text">Loading bookings...</p>}
        {error && <div className="alert alert-error">{error}</div>}
        {actionMessage && (
          <div className={`alert ${actionMessage.includes("successfully") || actionMessage.includes("accepted") ? "alert-success" : actionMessage.includes("rejected") ? "alert-error" : "alert-info"}`}>
            {actionMessage}
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p>No visit requests yet.</p>
          </div>
        )}

        <div className="booking-list">
          {bookings.map((booking) => {
            const neg = negotiationBadge(booking.negotiationStatus);
            const hasPendingNegotiation = booking.negotiationStatus === "Pending";

            return (
              <article key={booking._id} className="booking-card">
                <div className="booking-card-header">
                  <div>
                    <h3 className="booking-renter-name">{booking.user?.name || "Unknown Renter"}</h3>
                    <p className="booking-property">{booking.property?.title} — {booking.property?.city}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", alignItems: "flex-end" }}>
                    <span className={statusBadge(booking.status)}>{booking.status}</span>
                    {booking.negotiationStatus !== "None" && (
                      <span className={neg.className}>{neg.label}</span>
                    )}
                  </div>
                </div>

                <div className="booking-card-body">
                  {hasPendingNegotiation && (
                    <div className="negotiation-box">
                      <div className="negotiation-prices">
                        <div>
                          <span className="booking-info-label">Listed Price</span>
                          <span className="negotiation-listed">₹ {(booking.listedPrice || booking.property?.price)?.toLocaleString()}</span>
                        </div>
                        <div className="negotiation-arrow">→</div>
                        <div>
                          <span className="booking-info-label">Renter's Offer</span>
                          <span className="negotiation-offered">₹ {booking.proposedPrice?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="booking-info-label">You Save</span>
                          <span className="negotiation-savings">
                            ₹ {((booking.listedPrice || booking.property?.price) - booking.proposedPrice)?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {booking.negotiationStatus === "Accepted" && booking.agreedPrice && (
                    <div className="alert alert-success" style={{ marginBottom: "1rem" }}>
                      Agreed price: <strong>₹ {booking.agreedPrice.toLocaleString()}</strong>
                    </div>
                  )}

                  <div className="booking-info-grid">
                    <div>
                      <span className="booking-info-label">Price</span>
                      <span>₹ {getDisplayPrice(booking)?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="booking-info-label">Visit Date</span>
                      <span>{formatVisitDate(booking.visitDate)}</span>
                    </div>
                    <div>
                      <span className="booking-info-label">Visit Time</span>
                      <span>{formatVisitTime(booking.visitTime)}</span>
                    </div>
                    <div>
                      <span className="booking-info-label">Phone</span>
                      <span>
                        {booking.user?.phone ? (
                          <a href={`tel:${booking.user.phone}`}>{booking.user.phone}</a>
                        ) : "Not provided"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="booking-card-actions">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedBooking(booking)}>
                    View Profile
                  </button>

                  {booking.user?.email && (
                    <a href={`mailto:${booking.user.email}`} className="btn btn-ghost btn-sm">Email</a>
                  )}

                  {hasPendingNegotiation ? (
                    <>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={actionLoading === booking._id + "Accept"}
                        onClick={() => handleNegotiation(booking._id, "Accept")}
                      >
                        {actionLoading === booking._id + "Accept" ? "..." : "Accept Offer"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={actionLoading === booking._id + "Reject"}
                        onClick={() => handleNegotiation(booking._id, "Reject")}
                      >
                        {actionLoading === booking._id + "Reject" ? "..." : "Reject Offer"}
                      </button>
                    </>
                  ) : (
                    booking.status === "Pending" && booking.negotiationStatus === "None" && (
                      <>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={actionLoading === booking._id + "Approved"}
                          onClick={() => handleStatusUpdate(booking._id, "Approved")}
                        >
                          Accept Visit
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          disabled={actionLoading === booking._id + "Rejected"}
                          onClick={() => handleStatusUpdate(booking._id, "Rejected")}
                        >
                          Reject
                        </button>
                      </>
                    )
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {selectedBooking && (
        <RenterProfileModal
          renter={selectedBooking.user}
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
};

export default OwnerAllBookings;
