"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";


const Register = () => {
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const router = useRouter();
  const {login} = useAuth();
  

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // check for errors
    if (name === "username") {
      if (value.length < 3) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          username: "Username must be at least 3 characters long",
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          username: "",
        }));
      }
    } else if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          email: "Invalid email address",
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          email: "",
        }));
      }
    } else if (name === "password") {
      if (value.length < 6) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: "Password must be at least 6 characters long",
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: "",
        }));
      }
    } else if (name === "confirmPassword") {
      if (value !== registerData.password) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          confirmPassword: "Password do not match",
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          confirmPassword: "",
        }));
      }
    }
    setRegisterData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validate form before submission
    const hasErrors = Object.values(errors).some((error) => error !== "");
    const hasEmptyFields = Object.values(registerData).some(
      (field) => field === ""
    );

    if (hasErrors || hasEmptyFields) {
      toast.error("Please fill all fields correctly");
      return;
    }

    try {
      setLoading(true);
      const { confirmPassword, ...dataToSend } = registerData;

      const result = await fetch("http://localhost:5001/v1/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });
      const data = await result.json();

      if (data.success) {
        toast.success("Registration successful");
        login(data.token, data.user)
        router.push("/dashboard");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen justify-center items-center mb-2 bg-white">
      <div>
        {/* logo goes here... */}
        <h2 className="text-4xl font-bold mb-2">Budget Tracker</h2>
        <p className="text-base text-center text-gray-500">
          Premium Financial Management
        </p>
      </div>
      <div className="border px-6 py-5 my-4 w-[30%] border-gray-200 shadow-lg rounded-lg">
        <div className="mb-3">
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="font-light text-gray-500 text-sm">
            Sign in to manage your finances
          </p>
        </div>

        <div className="w-full ">
          <div className="flex flex-col mb-2">
            <label htmlFor="username" className="mb-2 mt-1 font-semibold">
              Username
            </label>
            <input
              type="username"
              placeholder="Enter your username"
              className="w-full p-2 border border-gray-300 rounded-md"
              name="username"
              onChange={handleChange}
              value={registerData.username}
            />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username}</p>
            )}
          </div>
          <div className="flex flex-col mb-2">
            <label htmlFor="email" className="mb-2 mt-1 font-semibold">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-2 border border-gray-300 rounded-md"
              name="email"
              onChange={(e) => handleChange(e)}
              value={registerData.email}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>
          <div className="flex flex-col mb-2">
            <label htmlFor="password" className="mb-2 mt-1 font-semibold">
              Password
            </label>
            <input
              type="password"
              placeholder="Choose your password"
              className="w-full p-2 border border-gray-300 rounded-md"
              onChange={(e) => handleChange(e)}
              value={registerData.password}
              name="password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>
          <div className="flex flex-col mb-2">
            <label
              htmlFor="confirmPassword"
              className="mb-2 mt-1 font-semibold"
            >
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm your password"
              className="w-full p-2 border border-gray-300 rounded-md"
              onChange={(e) => handleChange(e)}
              value={registerData.confirmPassword}
              name="confirmPassword"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="mt-4 mb-2">
            <button
              className="w-full bg-gray-900 cursor-pointer text-white p-2 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={
                loading ||
                Object.values(errors).some((error) => error !== "") ||
                Object.values(registerData).some((field) => field === "")
              }
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>

          <div className="text-center mt-2">
            <p className="text-sm mt-2">
              Already have a account?{" "}
              <Link href="/login" className="text-gray-500 font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
