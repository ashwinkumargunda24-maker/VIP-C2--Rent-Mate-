import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../utils/api";
import DashboardNav from "../../components/DashboardNav";

const adminLinks = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/properties", label: "Properties" },
  { to: "/admin/bookings", label: "Visit Requests" },
];

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/users`);
      setUsers(res.data);
    } catch {
      setError("Failed to load users.");
    }
  };

  return (
    <div className="page">
      <div className="page-container">
        <DashboardNav links={adminLinks} />

        <div className="page-header">
          <h1>All Users</h1>
          <p className="page-subtitle">{users.length} registered users</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td><strong>{user.name}</strong></td>
                  <td>{user.email}</td>
                  <td><span className="badge badge-type">{user.role}</span></td>
                  <td>{user.phone || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllUsers;
