import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API_URL } from "../../utils/api";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    phone: "",
  });
  const [message, setMessage] = useState("");
  const isSuccess = message.includes("Successful");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API_URL}/api/users/signup`, formData);
      setMessage("Registration Successful! You can now login.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
          <span className="brand-icon" style={{ display: "inline-flex", margin: "0 auto 1rem" }}>🏠</span>
        </div>
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join RentMate to find or list properties</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input id="name" type="text" name="name" className="form-input" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" name="email" className="form-input" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" name="password" className="form-input" placeholder="Create a password" value={formData.password} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input id="phone" type="text" name="phone" className="form-input" placeholder="9876543210" value={formData.phone} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="role">I am a</label>
            <select id="role" name="role" className="form-select" value={formData.role} onChange={handleChange}>
              <option value="user">Renter</option>
              <option value="owner">Property Owner</option>
            </select>
          </div>

          {message && (
            <div className={`alert ${isSuccess ? "alert-success" : "alert-error"}`}>{message}</div>
          )}

          <button type="submit" className="btn btn-primary btn-block">
            Create Account
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
          <p><Link to="/">← Back to Home</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
