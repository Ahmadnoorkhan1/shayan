"use client";
import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router"; // Assuming react-router
import apiService from "../../utilities/service/api";

const SignUpForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordType, setPasswordType] = useState<"password" | "text">("password");

  // Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // Clear error when typing
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // Validate Form
  const validateForm = () => {
    let isValid = true;
    let newErrors = { first_name: "", last_name: "", email: "", password: "" };

    if (formData.first_name.trim().length < 2) {
      newErrors.first_name = "First name must be at least 2 characters.";
      isValid = false;
    }

    if (formData.last_name.trim().length < 2) {
      newErrors.last_name = "Last name must be at least 2 characters.";
      isValid = false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Your email is invalid.";
      isValid = false;
    }

    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response: any = await apiService.post("auth/register", formData,{});
      if (response.success) {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error during API call:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Password Visibility
  const togglePasswordType = () => {
    setPasswordType((prev) => (prev === "password" ? "text" : "password"));
  };

  return (
    <div className="w-full">
      <div className="flex justify-center">
        <NavLink to="/">
          <img src="/images/logo_minilessons.png" height="30" width="147" alt="logo" />
        </NavLink>
      </div>
      <h2 className="mt-6 text-2xl font-bold text-gray-900">Hey, Hello 👋</h2>
      <p className="text-base text-gray-600 mt-2">Create an account to start using DashTail</p>

      <form onSubmit={handleSubmit} className="mt-5">
        <div className="space-y-4">
          {/* First Name Field */}
          <div>
            <label htmlFor="first_name" className="font-medium text-gray-600">First Name</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.first_name ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.first_name && <p className="text-red-500 text-sm">{errors.first_name}</p>}
          </div>

          {/* Last Name Field */}
          <div>
            <label htmlFor="last_name" className="font-medium text-gray-600">Last Name</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.last_name ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.last_name && <p className="text-red-500 text-sm">{errors.last_name}</p>}
          </div>

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

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="font-medium text-gray-600">Password</label>
            <div className="relative">
              <input
                type={passwordType}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full p-2 border ${errors.password ? "border-red-500" : "border-gray-300"}`}
              />
              <button
                type="button"
                className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400"
                onClick={togglePasswordType}
              >
                {passwordType === "password" ? "👁️" : "🙈"}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full mt-5 p-2 bg-primary text-white rounded"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Registering..." : "Create an Account"}
        </button>
      </form>

      <p className="mt-5 text-center text-gray-600">
        Already Registered? <NavLink className="text-primary" to="/login">Sign in</NavLink>
      </p>
    </div>
  );
};

export default SignUpForm;
