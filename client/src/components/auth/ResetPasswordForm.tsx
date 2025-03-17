"use client";
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import apiService from "../../utilities/service/api";

const ResetPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordType, setPasswordType] = useState<"password" | "text">("password");

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // Clear error when typing
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // Validate form
  const validateForm = () => {
    let isValid = true;
    let newErrors = { email: "", newPassword: "", confirmPassword: "" };

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Your email is invalid.";
      isValid = false;
    }

    if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters.";
      isValid = false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response: any = await apiService.post("auth/reset-password", {
        email: formData.email,
        password: formData.newPassword,
      },{});
      if (response.success) {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error during API call:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordType = () => {
    setPasswordType((prev) => (prev === "password" ? "text" : "password"));
  };

  return (
    <div className="w-full px-8 md:w-1/2 mx-auto my-4">
      <div className="flex justify-center">
        <NavLink to="/">
          <img src="/images/logo_minilessons.png" height="30" width="147" alt="logo" />
        </NavLink>
      </div>
      <h2 className="mt-6 text-2xl font-bold text-gray-900 text-center">Reset Your Password</h2>
      <p className="text-base text-gray-600 mt-2 text-center">Enter your email and a new password.</p>

      <form onSubmit={handleSubmit} className="mt-5">
        <div className="space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="font-medium text-gray-600">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.email ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          {/* New Password Field */}
          <div>
            <label htmlFor="newPassword" className="font-medium text-gray-600">New Password</label>
            <div className="relative">
              <input
                type={passwordType}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={`w-full p-2 border ${errors.newPassword ? "border-red-500" : "border-gray-300"}`}
              />
              <button
                type="button"
                className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400"
                onClick={togglePasswordType}
              >
                {passwordType === "password" ? "👁️" : "🙈"}
              </button>
            </div>
            {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword}</p>}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="font-medium text-gray-600">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full mt-5 p-2 bg-blue-600 text-white rounded"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Making Changes..." : "Reset Password"}
        </button>
      </form>

      <p className="mt-5 text-center text-gray-600">
        Go Back? <NavLink className="text-blue-600" to="/login">Login</NavLink>
      </p>
    </div>
  );
};

export default ResetPasswordForm;
