"use client";
import { createContext, useContext } from "react";
import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import { API_URL } from "../config";


interface User {
    token: string;
    _id?: string;
    username?: string;
    email?: string;
    [key: string]: any;
}

interface AuthContextType {
    user: User | null;
    login: (token: string, userData: any) => void;
    logout: () => void;
    loading: boolean;
    apiCall: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: any) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const apiCall = async (url: string, options: RequestInit = {}) => {
        const token = Cookies.get("token");

        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${token}`
            }
        })

        if (response.status === 401) {
            const newToken = await refreshAccessToken();
            if (newToken) {
                // Update user with new token
                setUser(prev => prev ? { ...prev, token: newToken } : null);
                
                // Retry the original request with new token
                return fetch(url, {
                    ...options,
                    headers: {
                        ...options.headers,
                        Authorization: `Bearer ${newToken}`
                    }
                })
            } else {
                logout();
                throw new Error('Authentication failed');
            }
        }
        return response;
    }



    useEffect(() => {
        const token = Cookies.get("token");
        console.log("token", token);
        if (token) {
            verifyToken(token);
        } else {
            setLoading(false);
        }
    }, []);

    const verifyToken = async (token: string) => {
        try {
            const response = await fetch(
                `${API_URL}/verify-token`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await response.json();

            if (data.success) {
                setUser({ token, ...data.user });
            } else if (response.status === 401) {
                // Token expired, try to refresh
                const newToken = await refreshAccessToken();
                if (newToken) {
                    // Verify the new token
                    await verifyToken(newToken);
                    return;
                } else {
                    // Refresh failed, logout
                    Cookies.remove("token");
                    setUser(null);
                }
            } else {
                Cookies.remove("token");
                setUser(null);
            }
        } catch (error) {
            console.error("Token verification failed:", error);
            Cookies.remove("token");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const refreshAccessToken = async () => {
        const token = Cookies.get('token');
        if (!token) return null;

        try {
            const response = await fetch(`${API_URL}/refresh-token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ token })
            })

            const data = await response.json();

            if (data.success && data.token) {
                Cookies.set("token", data.token, { expires: 7 });
                return data.token;
            }
            return null;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return null;
        }
    }

    const login = (token: string, userData: any) => {
        Cookies.set("token", token, { expires: 7 }); // 7 days
        setUser({ token, ...userData });
    };

    const logout = () => {
        Cookies.remove("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, apiCall }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
