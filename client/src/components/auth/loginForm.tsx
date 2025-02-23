"use client";
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import apiService from "../../utilities/service/api";


const LoginForm : React.FC = () => {
  // const [isPending, startTransition] = React.useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordType, setPasswordType] = useState<"password" | "text">("password");
  



    const navigate = useNavigate();
    const [formData, setFormData] = useState({
      email: "",
      password: "",
    });
  
    const [errors, setErrors] = useState({
      email: "",
      password: "",
    });
    //handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    
        // Clear error when typing
        setErrors({ ...errors, [e.target.name]: "" });
      };

      const validateForm = () => {
        let isValid = true;
        let newErrors = { email: "", password: "" };
    
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

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        if (!validateForm()) return;
    
        setIsSubmitting(true);
        try {
          const response: any = await apiService.post("auth/login", formData,{});
          if (response.success) {
            navigate("/dashboard");
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
  


  // const toggleVisibility = () => setIsVisible(!isVisible);


  return (
   <div className="w-full">
         <div className="flex justify-center">
           <NavLink to="/">
             <img src="/images/logo.png" height="30" width="147" alt="logo" />
           </NavLink>
         </div>
         <h2 className="mt-6 text-2xl font-bold text-gray-900">Hey, Welcome Back! 👋</h2>
         <p className="text-base text-gray-600 mt-2"> Welcome back to Mini Lessons Academy </p>
   
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

      <div className="flex justify-between items-center">
          {/* Remember Me Checkbox */}
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              className="mr-2"
            />
            <label htmlFor="rememberMe" className="text-gray-600">Remember Me</label>
          </div>

          {/* Forgot Password */}
          <NavLink to="/reset-password" className="text-blue-600 mt-4">Forgot Password?</NavLink>

      </div>
           {/* Submit Button */}
           <button
             type="submit"
             className="w-full mt-5 p-2 bg-primary text-white rounded"
             disabled={isSubmitting}
           >
             {isSubmitting ? "Joining..." : "Log in"}
           </button>
         </form>
   
         <p className="mt-5 text-center text-gray-600">
           Not Registered? <NavLink className="text-primary" to="/sign-up">Sign up</NavLink>
         </p>
       </div>
  );
};

export default LoginForm;
