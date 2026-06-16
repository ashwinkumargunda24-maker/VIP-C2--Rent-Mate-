import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./modules/common/Home";
import Login from "./modules/common/Login";
import Register from "./modules/common/register";
import ForgotPassword from "./modules/common/ForgotPassword";

import AdminHome from "./modules/admin/AdminHome";
import AllUsers from "./modules/admin/AllUsers";
import AllProperty from "./modules/admin/AllProperty";
import AllBookings from "./modules/admin/AllBookings";

import OwnerHome from "./modules/user/owner/OwnerHome";
import AddProperty from "./modules/user/owner/AddProperty";
import OwnerAllProperties from "./modules/user/owner/AllProperties";
import OwnerAllBookings from "./modules/user/owner/AllBookings";

import RenterHome from "./modules/user/renter/RenterHome";
import RenterAllProperties from "./modules/user/renter/AllProperties";
import RenterBookings from "./modules/user/renter/RenterBookings";

import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/properties" element={<RenterAllProperties />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AllUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/properties"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AllProperty />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AllBookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner"
        element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <OwnerHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/add-property"
        element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <AddProperty />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/properties"
        element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <OwnerAllProperties />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/bookings"
        element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <OwnerAllBookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/renter"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <RenterHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/renter/properties"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <RenterAllProperties />
          </ProtectedRoute>
        }
      />
      <Route
        path="/renter/bookings"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <RenterBookings />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
