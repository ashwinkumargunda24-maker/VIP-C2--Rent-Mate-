import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getStoredUser } from "../utils/api";

const DashboardNav = ({ links }) => {
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="dashboard-nav">
      <div className="dashboard-nav-links">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      <div className="dashboard-nav-actions">
        {user && <span className="nav-user">{user.name}</span>}
        <NavLink to="/" className="nav-link">
          Home
        </NavLink>
        <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default DashboardNav;
