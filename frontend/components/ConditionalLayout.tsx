"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Toaster } from "react-hot-toast";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If user is authenticated, show layout with sidebar
  if (user) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="absolute">

          <SidebarTrigger/>
          </div>
          <div className="flex-1 flex flex-col">
            {/* <SidebarTrigger/> */}
            <main className="flex-1 p-6 overflow-auto">
              {children}
            </main>
          </div>
        </div>
        <Toaster position="bottom-left" reverseOrder={false}/>
      </SidebarProvider>
    );
  }

  // If user is not authenticated, show simple layout without sidebar
  return (
    <div className="min-h-screen w-full">
      {children}
    </div>
  );
}