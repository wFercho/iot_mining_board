import React from "react";
import { Menu, Bell, User } from "lucide-react"; // Import necessary icons from Lucide

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center w-full">
      <button 
        onClick={toggleSidebar} 
        className="p-2 text-gray-600 hover:bg-gray-200 rounded transition duration-200 cursor-pointer"
        aria-label="Toggle Sidebar"
      >
        <Menu size={24} />
      </button>
      <h1 className="text-xl font-bold">Dispositivos</h1>
      <div className="flex items-center space-x-4">
        <button 
          className="relative p-2 text-gray-600 hover:bg-gray-200 rounded transition duration-200 cursor-pointer"
          aria-label="Notifications"
        >
          <Bell size={24} />
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">3</span>
        </button>
        <button 
          className="p-2 text-gray-600 hover:bg-gray-200 rounded transition duration-200 cursor-pointer"
          aria-label="User  Profile"
        >
          <User  size={24} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;