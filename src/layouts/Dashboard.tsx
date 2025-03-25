import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const Dashboard = ({
  children,
  pageName,
}: {
  children: React.ReactNode;
  pageName: string;
}) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} />
      <main className="flex-1 flex flex-col">
        <Navbar
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          pageName={pageName}
        />
        <div className="p-4 flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
};

export default Dashboard;
