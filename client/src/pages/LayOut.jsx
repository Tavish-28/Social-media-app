import React, { useState } from "react";
import SideBar from "../components/SideBar";
import { Outlet } from "react-router-dom";
import { dummyUserData } from "../assets/assets";
import { Menu } from "lucide-react";
import { X } from "lucide-react";

const LayOut = () => {
  const user = dummyUserData;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return user ? (
    <div className="w-full flex h-screen">
      <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 bg-slate-50">
        <Outlet />
      </div>
      {sidebarOpen ? (
        <X
          className="absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-100 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : (
        <Menu
          className="absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-100 sm:hidden"
          onClick={() => setSidebarOpen(true)}
        />
      )}
    </div>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default LayOut;
