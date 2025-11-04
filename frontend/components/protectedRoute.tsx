"use client"

import { useAuth } from "@/lib/context/AuthContext"
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import React from "react";


export default function ProtectedRoute({children}: {children: React.ReactNode}){
    const {user, loading} = useAuth();
    const router = useRouter();

    useEffect(()=> {
        if(!loading && !user){
            router.push("/login")
        }
    }, [user, loading])

    if(loading){
        return <div>Loading...</div>
    }

    if(!user){
        return null
    }

    return children;
}