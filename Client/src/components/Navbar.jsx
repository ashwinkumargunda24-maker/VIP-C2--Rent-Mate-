import React from "react";
import { Link, NavLink } from "react-router-dom";
import { getStoredUser } from "../utils/api";

const Navbar = () => {
  const user = getStoredUser();

  const dashboardPath =
    user?.role === "admin" ? "/admin" : user?.role === "owner" ? "/owner" : "/renter";

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🏠</span>
          RentMate
        </Link>

        <nav className="navbar-links">
          {user ? (
            <>
              <span className="nav-user">Hi, {user.name}</span>
              <NavLink to={dashboardPath} className="nav-link">
                Dashboard
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link">
                Login
              </NavLink>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
