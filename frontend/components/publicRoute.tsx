import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PublicRoute({children}){
    const {user, loading} = useAuth();
    const router = useRouter();

    useEffect(()=> {
        if(!loading && user){
            router.push("/dashboard")
        }
    }, [user, loading, router])

    if(loading){
        return <div>Loading...</div>
    }

    if(user){
        return null;
    }

    return children;
}