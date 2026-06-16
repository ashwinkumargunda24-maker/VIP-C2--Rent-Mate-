import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../utils/api";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const isError = message && message !== "Login Successful";

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API_URL}/api/users/login`, { email, password });
      localStorage.setItem("user", JSON.stringify(res.data));
      setMessage("Login Successful");

      if (res.data.role === "admin") navigate("/admin");
      else if (res.data.role === "owner") navigate("/owner");
      else navigate("/renter");
    } catch (error) {
      setMessage(error.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
          <span className="brand-icon" style={{ display: "inline-flex", margin: "0 auto 1rem" }}>🏠</span>
        </div>
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your RentMate account</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {message && (
            <div className={`alert ${isError ? "alert-error" : "alert-success"}`}>{message}</div>
          )}

          <button type="submit" className="btn btn-primary btn-block">
            Sign In
          </button>
        </form>

        <div className="auth-footer">
          <p><Link to="/forgot-password">Forgot password?</Link></p>
          <p>Don't have an account? <Link to="/register">Create one</Link></p>
          <p><Link to="/">← Back to Home</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
