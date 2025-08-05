
import React from "react";
import { MainNavigation } from "../navigation/MainNavigation";
import { Toaster } from "@/components/ui/toaster";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation />
      <main className="py-6">
        <div className="w-full px-14">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
