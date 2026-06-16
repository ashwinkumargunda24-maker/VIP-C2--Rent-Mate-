import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../utils/api";
import DashboardNav from "../../components/DashboardNav";
import RenterProfileModal from "../../components/RenterProfileModal";
import { formatVisitDate, formatVisitTime } from "../../utils/formatVisit";

const adminLinks = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/properties", label: "Properties" },
  { to: "/admin/bookings", label: "Visit Requests" },
];

const statusBadge = (status) => {
  const map = { Pending: "pending", Approved: "approved", Rejected: "rejected" };
  return `badge badge-${map[status] || "type"}`;
};

const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/bookings`);
      setBookings(res.data);
    } catch {
      setError("Failed to load bookings.");
    }
  };

  const handleStatusUpdate = async (bookingId, status) => {
    setActionLoading(bookingId + status);

    try {
      const res = await axios.put(`${API_URL}/api/admin/booking/${bookingId}`, { status });
      setBookings((prev) => prev.map((b) => (b._id === bookingId ? res.data : b)));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update booking.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="page">
      <div className="page-container">
        <DashboardNav links={adminLinks} />

        <div className="page-header">
          <h1>All Visit Appointments</h1>
          <p className="page-subtitle">{bookings.length} total visit request{bookings.length !== 1 ? "s" : ""}</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p>No visit appointments yet.</p>
          </div>
        ) : (
          <div className="booking-list">
            {bookings.map((booking) => (
              <article key={booking._id} className="booking-card">
                <div className="booking-card-header">
                  <div>
                    <h3 className="booking-renter-name">{booking.user?.name || "Unknown"}</h3>
                    <p className="booking-property">{booking.property?.title} — {booking.property?.city}</p>
                  </div>
                  <span className={statusBadge(booking.status)}>{booking.status}</span>
                </div>

                <div className="booking-card-body">
                  <div className="booking-info-grid">
                    <div>
                      <span className="booking-info-label">Email</span>
                      <span>{booking.user?.email || "N/A"}</span>
                    </div>
                    <div>
                      <span className="booking-info-label">Phone</span>
                      <span>{booking.user?.phone || "N/A"}</span>
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
                </div>

                <div className="booking-card-actions">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedBooking(booking)}>
                    View Profile
                  </button>
                  {booking.status === "Pending" && (
                    <>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={actionLoading === booking._id + "Approved"}
                        onClick={() => handleStatusUpdate(booking._id, "Approved")}
                      >
                        Accept
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
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
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

export default AllBookings;
