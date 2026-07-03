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
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendsRemaining, setResendsRemaining] = useState(2);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const isSuccess = message.includes("Successful");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async (isResend = false) => {
    if (!formData.email || !formData.phone) {
      setMessage("Email and phone are required to send OTP.");
      return;
    }

    setSendingOtp(true);
    setMessage("");

    try {
      const res = await axios.post(`${API_URL}/api/users/send-registration-otp`, {
        email: formData.email,
        phone: formData.phone,
        name: formData.name,
        isResend,
      });

      setOtpSent(true);
      setResendsRemaining(res.data.resendsRemaining ?? 0);
      setMessage(res.data.message);
    } catch (error) {
      const data = error.response?.data;
      setMessage(data?.message || "Failed to send OTP.");
      if (data?.resendsRemaining !== undefined) {
        setResendsRemaining(data.resendsRemaining);
      } else if (error.response?.status === 429) {
        setResendsRemaining(0);
      }
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otpSent) {
      setMessage("Please send and verify OTP before registering.");
      return;
    }

    if (!otp || otp.length !== 6) {
      setMessage("Please enter the 6-digit OTP.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      await axios.post(`${API_URL}/api/users/signup`, { ...formData, otp });
      setMessage("Registration Successful! You can now login.");
      setOtp("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
          <span className="brand-icon" style={{ display: "inline-flex", margin: "0 auto 1rem" }}>🏠</span>
        </div>
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join RentMate — verify with OTP sent to email & phone</p>

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
            <label htmlFor="phone">Phone</label>
            <input id="phone" type="tel" name="phone" className="form-input" placeholder="9876543210" value={formData.phone} onChange={handleChange} required />
          </div>

          <div className="form-group">
            {!otpSent ? (
              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={() => handleSendOtp(false)}
                disabled={sendingOtp || !formData.email || !formData.phone}
              >
                {sendingOtp ? "Sending OTP..." : "Send OTP"}
              </button>
            ) : (
              <>
                {resendsRemaining > 0 ? (
                  <button
                    type="button"
                    className="btn btn-secondary btn-block"
                    onClick={() => handleSendOtp(true)}
                    disabled={sendingOtp}
                  >
                    {sendingOtp ? "Resending..." : `Resend OTP (${resendsRemaining} left)`}
                  </button>
                ) : (
                  <p className="negotiate-hint">Resend limit reached. Wait 15 minutes before trying again.</p>
                )}
                <p className="negotiate-hint" style={{ marginTop: "0.5rem" }}>
                  OTP sent to your email and phone. Expires in 10 minutes.
                </p>
              </>
            )}
          </div>

          {otpSent && (
            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="form-input"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" name="password" className="form-input" placeholder="Create a password" value={formData.password} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="role">I am a</label>
            <select id="role" name="role" className="form-select" value={formData.role} onChange={handleChange}>
              <option value="user">Renter</option>
              <option value="owner">Property Owner</option>
            </select>
          </div>

          {message && (
            <div className={`alert ${isSuccess ? "alert-success" : message.includes("sent") || message.includes("resent") ? "alert-info" : "alert-error"}`}>
              {message}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting || !otpSent}>
            {submitting ? "Verifying..." : "Verify OTP & Create Account"}
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
