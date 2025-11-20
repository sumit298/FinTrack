"use client";

import PublicRoute from "@/components/publicRoute";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/context/AuthContext";
import { API_URL } from "@/lib/config";
import { useRouter } from "next/navigation";

const Login = () => {
    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({
        email: "",
        password: "",
    });

    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === "email") {
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
        }

        if (name === "password") {
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
        }

        setLoginData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        const hasErrors = Object.values(errors).some((error) => error !== "");
        const hasEmptyFields = Object.values(loginData).some(
            (field) => field === ""
        );

        if (hasEmptyFields || hasErrors) {
            toast.error("Please fill all fields correctly");
            return;
        }

        try {
            setLoading(true);
            const result = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
               
                body: JSON.stringify(loginData),
            });

            const data = await result.json();
      

            if (data.success) {
                toast.success("Login successful!", {
                    duration: 2000,
                });
                login(data.token, data.user);
                
                // Delay navigation to show toast
                setTimeout(() => {
                    router.push("/dashboard");
                }, 1500);
            }
            else {
                toast.error(data.message || "Login failed");
            }

        } catch (error) {
            console.error("Login error", error)
            toast.error("Login failed");

        }
        finally {
            setLoading(false);
        }
    };

    return (
        <PublicRoute>
            <div className="flex flex-col h-screen justify-center items-center mb-2 bg-white">
                <div>
                    <h2 className="text-4xl font-bold mb-2">Budget Tracker</h2>
                    <p className="text-base text-center text-gray-500">
                        Premium Financial Management
                    </p>
                </div>
                <div className="border px-6 py-5 my-4 w-[30%] border-gray-200 shadow-lg rounded-lg">
                    <div className="my-3">
                        <h1 className="text-2xl font-bold">Welcome Back</h1>
                        <p>Sign in to manage your finances</p>
                    </div>

                    <div className="w-full ">
                        <div className="flex flex-col mb-2">
                            <label className="mb-2 mt-1 font-semibold">Email</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                name="email"
                                onChange={(e) => handleChange(e)}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm">{errors.email}</p>
                            )}
                        </div>
                        <div className="flex flex-col mb-2">
                            <label htmlFor="" className="mb-2 mt-1 font-semibold">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                onChange={(e) => handleChange(e)}
                                name="password"
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm">{errors.password}</p>
                            )}
                        </div>

                        <div className="mt-4 mb-2">
                            <button
                                className="w-full bg-gray-900 cursor-pointer text-white p-2 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={
                                    loading ||
                                    Object.values(errors).some((error) => error !== "") ||
                                    Object.values(loginData).some((field) => field === "")
                                }
                                onClick={handleSubmit}
                            >
                                {loading ? "Signing In..." : "Sign In"}
                            </button>
                        </div>

                        <div className="text-center mt-2">
                            <p className="text-sm mt-2">
                                Don't have an account?{" "}
                                <a href="/register" className="text-gray-500 font-semibold">
                                    Sign Up
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PublicRoute>
    );
};

export default Login;
