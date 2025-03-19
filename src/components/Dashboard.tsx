import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Home from "@/components/pages/Home";

const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} />
      <main className="flex-1 flex flex-col">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="p-4 flex-1 overflow-y-auto">
            <Home />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;